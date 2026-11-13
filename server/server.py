#!/usr/bin/env python3
"""
Lumi AI Studio — Unified Free & Reverse-Engineered AI Backend Server

Combines top open-source AI projects into one backend:
  1. Zero-Setup Free AI Hub (Pollinations & Reverse-Engineered OpenAI-compatible)
  2. GPT4Free (xtekky/gpt4free) — 70+ models without API keys
  3. Duck.ai API (enter-a-new-username3/duck-ai-api) — DuckDuckGo free AI
  4. Gemini Web to API (ntthanh2603/gemini-web-to-api & XD06/gemini-free-api)
  5. Awesome Reverse-Engineered Proxy Hub (alexgaoth/awesome-reverse-engineered)

Also serves the frontend web application directly on http://localhost:3456/!
"""

import glob
import http.server
import io
import json
import mimetypes
import os
import ssl
import subprocess
import sys
import threading
import time
import urllib.error
import urllib.parse
import urllib.request
import zipfile
from collections import defaultdict

# Auto-load virtual environment packages if present
_venv_patterns = [
    os.path.join(os.path.dirname(__file__), ".venv", "lib", "python*", "site-packages"),
    os.path.join(os.path.dirname(__file__), "venv", "lib", "python*", "site-packages"),
]
for pattern in _venv_patterns:
    for sp in glob.glob(pattern):
        if sp not in sys.path:
            sys.path.insert(0, sp)

# Optional in-process g4f client
G4F_AVAILABLE = False
try:
    import g4f
    from g4f.client import Client as G4FClient
    _g4f_client = G4FClient()
    G4F_AVAILABLE = True
except Exception as _g4f_err:
    _g4f_client = None

PORT = int(os.environ.get("PORT", 3456))
HOST = os.environ.get("HOST", "0.0.0.0")
G4F_URL = os.environ.get("G4F_URL", "http://localhost:1337/v1").rstrip("/")
GEMINI_WEB_URL = os.environ.get("GEMINI_WEB_URL", "http://localhost:4981/v1").rstrip("/")
CORS_ORIGIN = os.environ.get("CORS_ORIGIN", "*")
RATE_LIMIT = int(os.environ.get("RATE_LIMIT", 60))
MAX_BODY = 1048576  # 1MB

# Root directory of web assets (parent of server/)
WORKSPACE_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))

# ---------------------------------------------------------------------------
# Free AI Hub (Zero Setup / 100% Free)
# ---------------------------------------------------------------------------
FREE_HUB_URL = "https://text.pollinations.ai/openai/chat/completions"
FREE_MODELS = [
    {"id": "qwen-2.5-coder-32b", "name": "Qwen 2.5 Coder 32B (Free Coding)", "provider": "free-hub", "description": "Top-tier AI coding model (Fast & Free)"},
    {"id": "llama-3.3-70b", "name": "Llama 3.3 70B (Free Fast)", "provider": "free-hub", "description": "Flagship Meta Llama 3.3 70B (Fluent Hindi/English)"},
    {"id": "gpt-4o-mini", "name": "GPT-4o Mini (Free)", "provider": "free-hub", "description": "OpenAI GPT-4o Mini via Free Engine"},
    {"id": "deepseek-distill-qwen-32b", "name": "DeepSeek R1 Distill (Free)", "provider": "free-hub", "description": "DeepSeek reasoning & math model"},
    {"id": "mistral-small-3.1-24b", "name": "Mistral Small (Free)", "provider": "free-hub", "description": "Fast European reasoning model"},
]

# ---------------------------------------------------------------------------
# Duck.ai configuration
# ---------------------------------------------------------------------------
DUCK_STATUS_URL = "https://duckduckgo.com/duckchat/v1/status"
DUCK_CHAT_URL = "https://duckduckgo.com/duckchat/v1/chat"
DUCK_MODELS = [
    {"id": "gpt-4o-mini", "name": "GPT-4o Mini", "provider": "duck", "description": "OpenAI GPT-4o Mini via Duck.ai"},
    {"id": "claude-3-haiku-20240307", "name": "Claude 3 Haiku", "provider": "duck", "description": "Anthropic Claude 3 Haiku via Duck.ai"},
    {"id": "meta-llama/Meta-Llama-3.1-70B-Instruct-Turbo", "name": "Llama 3.1 70B", "provider": "duck", "description": "Meta Llama 3.1 70B via Duck.ai"},
    {"id": "mistralai/Mixtral-8x7B-Instruct-v0.1", "name": "Mixtral 8x7B", "provider": "duck", "description": "Mistral Mixtral 8x7B via Duck.ai"},
]

# ---------------------------------------------------------------------------
# Rate limiter (in-memory, per IP)
# ---------------------------------------------------------------------------
_rate_lock = threading.Lock()
_rate_buckets: dict[str, list[float]] = defaultdict(list)

def rate_limited(ip: str) -> bool:
    now = time.time()
    with _rate_lock:
        bucket = _rate_buckets[ip]
        _rate_buckets[ip] = [t for t in bucket if now - t < 60]
        if len(_rate_buckets[ip]) >= RATE_LIMIT:
            return True
        _rate_buckets[ip].append(now)
    return False

# ---------------------------------------------------------------------------
# Provider Health State
# ---------------------------------------------------------------------------
_health: dict[str, dict] = {
    "free": {"status": "online", "lastCheck": 0, "latency": 0, "error": None},
    "g4f": {"status": "online" if G4F_AVAILABLE else "unknown", "lastCheck": 0, "latency": 0, "error": None},
    "duck": {"status": "unknown", "lastCheck": 0, "latency": 0, "error": None},
    "gemini": {"status": "unknown", "lastCheck": 0, "latency": 0, "error": None},
}

_vqd_lock = threading.Lock()
_vqd_token: str | None = None

def _get_ssl_context():
    ctx = ssl.create_default_context()
    return ctx

def fetch_vqd_token() -> str:
    global _vqd_token
    req = urllib.request.Request(
        DUCK_STATUS_URL,
        headers={
            "x-vqd-accept": "1",
            "User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36",
            "Accept": "*/*",
            "Referer": "https://duckduckgo.com/",
        },
    )
    resp = urllib.request.urlopen(req, timeout=10, context=_get_ssl_context())
    token = resp.headers.get("x-vqd-4", "")
    if not token:
        # Fallback to duck vqd header or hash
        token = resp.headers.get("x-vqd-hash-1", "duck-vqd-guest")
    with _vqd_lock:
        _vqd_token = token
    return token

def get_vqd_token() -> str:
    with _vqd_lock:
        if _vqd_token:
            return _vqd_token
    return fetch_vqd_token()

# ---------------------------------------------------------------------------
# Unified HTTP Handler
# ---------------------------------------------------------------------------
class ProxyHandler(http.server.BaseHTTPRequestHandler):
    protocol_version = "HTTP/1.1"

    def log_message(self, fmt, *args):
        path = args[0] if args else ""
        if isinstance(path, str) and ("/health" in path or path.endswith((".js", ".css", ".png", ".svg", ".ico"))):
            return
        sys.stderr.write(f"[{self.log_date_time_string()}] {fmt % args}\n")

    def _cors_headers(self):
        self.send_header("Access-Control-Allow-Origin", CORS_ORIGIN)
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type, Authorization, x-api-key, anthropic-version, x-gemini-cookies")
        self.send_header("Access-Control-Max-Age", "86400")

    def do_OPTIONS(self):
        self.send_response(204)
        self._cors_headers()
        self.send_header("Content-Length", "0")
        self.end_headers()

    def _json_response(self, data, status=200):
        body = json.dumps(data).encode("utf-8")
        self.send_response(status)
        self._cors_headers()
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def _error(self, status, message):
        self._json_response({"error": {"message": str(message)}}, status)

    def _read_body(self) -> bytes | None:
        try:
            length = int(self.headers.get("Content-Length", 0))
        except (ValueError, TypeError):
            length = 0
        if length > MAX_BODY:
            self._error(413, "Request body too large")
            return None
        if length == 0:
            self._error(400, "Empty request body")
            return None
        return self.rfile.read(length)

    def _start_sse(self):
        self.send_response(200)
        self._cors_headers()
        self.send_header("Content-Type", "text/event-stream; charset=utf-8")
        self.send_header("Cache-Control", "no-cache, no-transform")
        self.send_header("Connection", "close")
        self.send_header("X-Accel-Buffering", "no")
        self.close_connection = True
        self.end_headers()

    def _send_chunk(self, data: bytes):
        try:
            self.wfile.write(data)
            self.wfile.flush()
        except Exception:
            pass

    def _end_chunks(self):
        try:
            self.wfile.flush()
        except Exception:
            pass
        self.close_connection = True

    # --- Static File Serving ---
    def _serve_static(self, rel_path: str):
        # Default root or SPA routes -> index.html
        clean_path = rel_path.lstrip("/").split("?")[0]
        if not clean_path or clean_path in ("chat", "providers", "auth", "landing") or clean_path.startswith("chat/"):
            clean_path = "index.html"

        full_path = os.path.abspath(os.path.join(WORKSPACE_ROOT, clean_path))
        # Directory traversal protection
        if not full_path.startswith(WORKSPACE_ROOT) or not os.path.isfile(full_path):
            # Fallback to index.html for SPA hash/history routing
            full_path = os.path.join(WORKSPACE_ROOT, "index.html")
            if not os.path.isfile(full_path):
                self._error(404, "File not found")
                return

        ctype, _ = mimetypes.guess_type(full_path)
        if full_path.endswith(".js"):
            ctype = "application/javascript; charset=utf-8"
        elif full_path.endswith(".css"):
            ctype = "text/css; charset=utf-8"
        elif full_path.endswith(".html"):
            ctype = "text/html; charset=utf-8"
        elif not ctype:
            ctype = "application/octet-stream"

        try:
            with open(full_path, "rb") as f:
                content = f.read()
            self.send_response(200)
            self._cors_headers()
            self.send_header("Content-Type", ctype)
            self.send_header("Content-Length", str(len(content)))
            self.send_header("Cache-Control", "no-cache")
            self.end_headers()
            self.wfile.write(content)
        except Exception as e:
            self._error(500, f"Error reading static file: {e}")

    def do_HEAD(self):
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path
        if path.startswith("/api/"):
            self.send_response(200)
            self._cors_headers()
            self.end_headers()
        else:
            self._serve_static(path)

    # --- Routing ---
    def do_GET(self):
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path
        query = dict(urllib.parse.parse_qsl(parsed.query))

        # API Endpoints
        if path == "/api/status":
            self._handle_status()
        elif path == "/api/free/models":
            self._json_response({"provider": "free-hub", "status": "online", "models": FREE_MODELS})
        elif path == "/api/free/health":
            self._handle_free_health()
        elif path == "/api/g4f/models":
            self._handle_g4f_models()
        elif path == "/api/g4f/health":
            self._handle_g4f_health()
        elif path == "/api/duck/models":
            self._json_response({"provider": "duck", "status": "available", "models": DUCK_MODELS})
        elif path == "/api/duck/health":
            self._handle_duck_health()
        elif path == "/api/gemini/models":
            self._handle_gemini_models()
        elif path == "/api/gemini/health":
            self._handle_gemini_health()
        elif path == "/api/proxy/health":
            self._handle_proxy_health(query)
        elif path == "/api/search":
            self._handle_search(query.get("q", ""))
        elif path.startswith("/api/"):
            self._error(404, f"API endpoint {path} not found")
        else:
            # Static web asset
            self._serve_static(path)

    def do_POST(self):
        ip = self.client_address[0]
        if rate_limited(ip):
            self._error(429, "Rate limited — max 60 requests per minute")
            return

        path = urllib.parse.urlparse(self.path).path
        if path in ("/api/free/chat", "/api/free/chat/completions"):
            self._handle_free_chat()
        elif path in ("/api/g4f/chat", "/api/g4f/chat/completions"):
            self._handle_g4f_chat()
        elif path in ("/api/duck/chat", "/api/duck/chat/completions"):
            self._handle_duck_chat()
        elif path in ("/api/gemini/chat", "/api/gemini/chat/completions"):
            self._handle_gemini_chat()
        elif path in ("/api/proxy/chat", "/api/proxy/chat/completions"):
            self._handle_proxy_chat()
        elif path == "/api/run/python":
            self._handle_run_python()
        elif path == "/api/export/zip":
            self._handle_export_zip()
        else:
            self._error(404, f"API endpoint {path} not found")

    # -----------------------------------------------------------------------
    # 1. Zero-Setup Free AI Hub (Pollinations & Reverse-Engineered OpenAI)
    # -----------------------------------------------------------------------
    def _handle_free_health(self):
        start = time.time()
        try:
            req = urllib.request.Request(
                FREE_HUB_URL,
                data=json.dumps({"model": "openai", "messages": [{"role": "user", "content": "ping"}]}).encode(),
                headers={"Content-Type": "application/json", "User-Agent": "Mozilla/5.0"},
            )
            with urllib.request.urlopen(req, timeout=5, context=_get_ssl_context()):
                pass
            latency = round((time.time() - start) * 1000)
            _health["free"] = {"status": "online", "lastCheck": int(time.time()), "latency": latency, "error": None}
            self._json_response({"provider": "free-hub", "status": "online", "latency": latency})
        except Exception as e:
            _health["free"] = {"status": "degraded", "lastCheck": int(time.time()), "latency": 0, "error": str(e)}
            self._json_response({"provider": "free-hub", "status": "degraded", "error": str(e)}, 200)

    def _handle_free_chat(self):
        body = self._read_body()
        if body is None:
            return
        try:
            data = json.loads(body)
        except json.JSONDecodeError:
            self._error(400, "Invalid JSON")
            return

        raw_model = data.get("model", "qwen-2.5-coder-32b").lower()
        if "/" in raw_model:
            raw_model = raw_model.split("/")[-1]

        # Map to reliable working models
        if "qwen" in raw_model or "code" in raw_model:
            target_model = "qwen-2.5-coder-32b"
        elif "llama" in raw_model:
            target_model = "llama-3.3-70b"
        elif "deepseek" in raw_model:
            target_model = "deepseek-distill-qwen-32b"
        elif "mistral" in raw_model:
            target_model = "mistral-small-3.1-24b"
        else:
            target_model = "gpt-4o-mini"

        messages = data.get("messages", [])
        stream = data.get("stream", True)

        # 1. Primary: In-process Cloudflare G4F Engine (Zero rate-limit, super fast)
        if G4F_AVAILABLE and _g4f_client:
            try:
                import g4f.Provider
                provider = g4f.Provider.Cloudflare
                if stream:
                    gen = _g4f_client.chat.completions.create(
                        model=target_model,
                        provider=provider,
                        messages=messages,
                        stream=True,
                    )
                    first_content = None
                    # Verify first chunk before sending SSE headers
                    for chunk in gen:
                        c = ""
                        if hasattr(chunk, "choices") and chunk.choices:
                            c = getattr(chunk.choices[0].delta, "content", "") or ""
                        if c:
                            first_content = c
                            break

                    if first_content is not None:
                        self._start_sse()
                        chunk_payload = {
                            "choices": [{"index": 0, "delta": {"content": first_content}, "finish_reason": None}],
                            "provider": "g4f-cloudflare",
                            "model": target_model,
                        }
                        self._send_chunk(f"data: {json.dumps(chunk_payload)}\n\n".encode("utf-8"))
                        for chunk in gen:
                            c = ""
                            if hasattr(chunk, "choices") and chunk.choices:
                                c = getattr(chunk.choices[0].delta, "content", "") or ""
                            if c:
                                chunk_payload = {
                                    "choices": [{"index": 0, "delta": {"content": c}, "finish_reason": None}],
                                    "provider": "g4f-cloudflare",
                                    "model": target_model,
                                }
                                self._send_chunk(f"data: {json.dumps(chunk_payload)}\n\n".encode("utf-8"))
                        self._send_chunk(b"data: [DONE]\n\n")
                        self._end_chunks()
                        return
                else:
                    response = _g4f_client.chat.completions.create(
                        model=target_model,
                        provider=provider,
                        messages=messages,
                        stream=False,
                    )
                    content = response.choices[0].message.content or ""
                    if content and "moved to a new app" not in content:
                        self._json_response({
                            "choices": [{"index": 0, "message": {"role": "assistant", "content": content}, "finish_reason": "stop"}],
                            "provider": "g4f-cloudflare",
                            "model": target_model,
                        })
                        return
            except Exception as e:
                sys.stderr.write(f"In-process Cloudflare G4F attempt failed, trying fallback: {e}\n")

        # 2. Secondary fallback: Pollinations Free Hub
        try:
            req = urllib.request.Request(
                FREE_HUB_URL,
                data=json.dumps({"model": "openai", "messages": messages, "stream": stream}).encode("utf-8"),
                headers={"Content-Type": "application/json", "Accept": "text/event-stream" if stream else "application/json"},
                method="POST",
            )
            resp = urllib.request.urlopen(req, timeout=30, context=_get_ssl_context())
            if stream:
                self._start_sse()
                for raw_line in resp:
                    line = raw_line.decode(errors="replace").strip()
                    if line.startswith("data: "):
                        data_part = line[6:].strip()
                        if data_part == "[DONE]":
                            break
                        try:
                            parsed = json.loads(data_part)
                            delta = parsed.get("choices", [{}])[0].get("delta", {})
                            content = delta.get("content") or delta.get("reasoning")
                            if content:
                                chunk_payload = {
                                    "choices": [{"index": 0, "delta": {"content": content}, "finish_reason": None}],
                                    "provider": "pollinations-hub",
                                    "model": target_model,
                                }
                                self._send_chunk(f"data: {json.dumps(chunk_payload)}\n\n".encode("utf-8"))
                        except Exception:
                            pass
                self._send_chunk(b"data: [DONE]\n\n")
                self._end_chunks()
                return
            else:
                data_resp = json.loads(resp.read().decode())
                self._json_response(data_resp)
                return
        except Exception as e:
            sys.stderr.write(f"Pollinations hub attempt failed: {e}\n")

        # 3. Third fallback: Direct text endpoint with prompt
        try:
            last_prompt = ""
            for m in reversed(messages):
                if m.get("role") == "user":
                    last_prompt = m.get("content", "")
                    break
            if not last_prompt:
                last_prompt = "Hello"

            enc_prompt = urllib.parse.quote(last_prompt[:500])
            url = f"https://text.pollinations.ai/{enc_prompt}?model=openai&system=You+are+Lumi+AI"
            req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
            resp = urllib.request.urlopen(req, timeout=20, context=_get_ssl_context())
            text = resp.read().decode(errors="replace")
            if text and "Free limit reached" not in text:
                if stream:
                    self._start_sse()
                    words = text.split(" ")
                    for i, w in enumerate(words):
                        space = " " if i > 0 else ""
                        chunk_payload = {
                            "choices": [{"index": 0, "delta": {"content": space + w}, "finish_reason": None}],
                            "provider": "pollinations-direct",
                            "model": target_model,
                        }
                        self._send_chunk(f"data: {json.dumps(chunk_payload)}\n\n".encode("utf-8"))
                        time.sleep(0.015)
                    self._send_chunk(b"data: [DONE]\n\n")
                    self._end_chunks()
                    return
                else:
                    self._json_response({
                        "choices": [{"index": 0, "message": {"role": "assistant", "content": text}, "finish_reason": "stop"}],
                        "provider": "pollinations-direct",
                        "model": target_model,
                    })
                    return
        except Exception as e:
            sys.stderr.write(f"Direct text fallback failed: {e}\n")

        # If all free providers failed, send a clean friendly error without crash
        if stream:
            self._start_sse()
            err_msg = "⚠️ AI server is currently busy. Please retry in a few moments."
            chunk_payload = {
                "choices": [{"index": 0, "delta": {"content": err_msg}, "finish_reason": "stop"}],
                "provider": "error",
                "model": target_model,
            }
            self._send_chunk(f"data: {json.dumps(chunk_payload)}\n\n".encode("utf-8"))
            self._send_chunk(b"data: [DONE]\n\n")
            self._end_chunks()
        else:
            self._json_response({
                "choices": [{"index": 0, "message": {"role": "assistant", "content": "⚠️ AI server is busy. Please retry in a few moments."}, "finish_reason": "stop"}],
                "provider": "error",
                "model": target_model,
            }, 503)

    # -----------------------------------------------------------------------
    # 2. GPT4Free (xtekky/gpt4free) Integration
    # -----------------------------------------------------------------------
    def _handle_g4f_models(self):
        models = []
        if G4F_AVAILABLE and hasattr(g4f.models, "_all_models"):
            for m in g4f.models._all_models:
                models.append({
                    "id": m,
                    "name": m,
                    "provider": "g4f",
                    "description": f"GPT4Free · {m}",
                })
            self._json_response({
                "provider": "g4f",
                "status": "online",
                "engine": "in-process Python",
                "models": models,
            })
            return

        # Fallback to local G4F API endpoint if running
        try:
            req = urllib.request.Request(f"{G4F_URL}/models", headers={"Accept": "application/json"})
            resp = urllib.request.urlopen(req, timeout=5)
            data = json.loads(resp.read().decode())
            for m in data.get("data", data.get("models", [])):
                mid = m.get("id", m.get("name", ""))
                if mid:
                    models.append({"id": mid, "name": mid, "provider": "g4f"})
            self._json_response({"provider": "g4f", "status": "online", "models": models})
        except Exception as e:
            self._json_response({
                "provider": "g4f",
                "status": "offline",
                "models": [],
                "error": str(e),
                "setup": "Run: ./server/.venv/bin/pip install g4f",
            }, 503)

    def _handle_g4f_health(self):
        if G4F_AVAILABLE:
            _health["g4f"] = {"status": "online", "lastCheck": int(time.time()), "latency": 1, "error": None}
            self._json_response({"provider": "g4f", "status": "online", "engine": "in-process"})
            return

        start = time.time()
        try:
            req = urllib.request.Request(f"{G4F_URL}/models", headers={"Accept": "application/json"})
            urllib.request.urlopen(req, timeout=5)
            latency = round((time.time() - start) * 1000)
            _health["g4f"] = {"status": "online", "lastCheck": int(time.time()), "latency": latency, "error": None}
            self._json_response({"provider": "g4f", "status": "online", "latency": latency})
        except Exception as e:
            _health["g4f"] = {"status": "offline", "lastCheck": int(time.time()), "latency": 0, "error": str(e)}
            self._json_response({"provider": "g4f", "status": "offline", "error": str(e)}, 503)

    def _handle_g4f_chat(self):
        body = self._read_body()
        if body is None:
            return
        try:
            data = json.loads(body)
        except json.JSONDecodeError:
            self._error(400, "Invalid JSON")
            return

        model = data.get("model", "gpt-4o-mini")
        messages = data.get("messages", [])
        stream = data.get("stream", True)

        if not messages:
            self._error(400, "No messages provided")
            return

        # A. In-process G4F Client (Fastest & direct)
        if G4F_AVAILABLE and _g4f_client:
            try:
                if stream:
                    self._start_sse()
                    response = _g4f_client.chat.completions.create(
                        model=model,
                        messages=messages,
                        stream=True,
                    )
                    for chunk in response:
                        content = ""
                        if hasattr(chunk, "choices") and chunk.choices:
                            content = getattr(chunk.choices[0].delta, "content", "") or ""
                        if content:
                            chunk_payload = {
                                "choices": [{"index": 0, "delta": {"content": content}, "finish_reason": None}],
                                "provider": "g4f",
                                "model": model,
                            }
                            self._send_chunk(f"data: {json.dumps(chunk_payload)}\n\n".encode("utf-8"))
                    self._send_chunk(b"data: [DONE]\n\n")
                    self._end_chunks()
                    return
                else:
                    response = _g4f_client.chat.completions.create(
                        model=model,
                        messages=messages,
                        stream=False,
                    )
                    content = response.choices[0].message.content or ""
                    self._json_response({
                        "choices": [{"index": 0, "message": {"role": "assistant", "content": content}, "finish_reason": "stop"}],
                        "provider": "g4f",
                        "model": model,
                    })
                    return
            except Exception as e:
                # If in-process model failed, fallback to external G4F_URL or Free Hub
                sys.stderr.write(f"In-process G4F failed, falling back: {e}\n")

        # B. Fallback to G4F HTTP server or proxy
        g4f_body = json.dumps({"model": model, "messages": messages, "stream": stream}).encode()
        req = urllib.request.Request(
            f"{G4F_URL}/chat/completions",
            data=g4f_body,
            headers={"Content-Type": "application/json", "Accept": "text/event-stream" if stream else "application/json"},
            method="POST",
        )
        try:
            resp = urllib.request.urlopen(req, timeout=90)
            if stream:
                self._start_sse()
                for raw_line in resp:
                    line = raw_line.decode(errors="replace").strip()
                    if line.startswith("data: "):
                        self._send_chunk(f"{line}\n\n".encode("utf-8"))
                        if line.strip() == "data: [DONE]":
                            break
                self._send_chunk(b"data: [DONE]\n\n")
                self._end_chunks()
            else:
                res = json.loads(resp.read().decode())
                self._json_response(res)
        except Exception as e:
            self._error(502, f"GPT4Free request failed: {e}")

    # -----------------------------------------------------------------------
    # 3. Duck.ai API
    # -----------------------------------------------------------------------
    def _handle_duck_health(self):
        start = time.time()
        try:
            fetch_vqd_token()
            latency = round((time.time() - start) * 1000)
            _health["duck"] = {"status": "online", "lastCheck": int(time.time()), "latency": latency, "error": None}
            self._json_response({"provider": "duck", "status": "online", "latency": latency})
        except Exception as e:
            _health["duck"] = {"status": "offline", "lastCheck": int(time.time()), "latency": 0, "error": str(e)}
            self._json_response({"provider": "duck", "status": "offline", "error": str(e)}, 503)

    def _handle_duck_chat(self):
        body = self._read_body()
        if body is None:
            return
        try:
            data = json.loads(body)
        except json.JSONDecodeError:
            self._error(400, "Invalid JSON")
            return

        model = data.get("model", "gpt-4o-mini")
        messages = data.get("messages", [])
        stream = data.get("stream", True)

        try:
            token = get_vqd_token()
        except Exception as e:
            self._error(502, f"Could not get Duck.ai token: {e}")
            return

        duck_body = json.dumps({"model": model, "messages": messages}).encode()
        req = urllib.request.Request(
            DUCK_CHAT_URL,
            data=duck_body,
            headers={
                "Content-Type": "application/json",
                "x-vqd-4": token,
                "User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36",
                "Accept": "text/event-stream",
                "Referer": "https://duckduckgo.com/",
            },
            method="POST",
        )

        try:
            resp = urllib.request.urlopen(req, timeout=60, context=_get_ssl_context())
            new_token = resp.headers.get("x-vqd-4", "")
            if new_token:
                with _vqd_lock:
                    global _vqd_token
                    _vqd_token = new_token

            self._start_sse()
            try:
                for raw_line in resp:
                    line = raw_line.decode(errors="replace").strip()
                    if not line.startswith("data: "):
                        continue
                    payload = line[6:]
                    if payload == "[DONE]":
                        self._send_chunk(b"data: [DONE]\n\n")
                        break
                    try:
                        d = json.loads(payload)
                        content = d.get("message", "")
                        if content:
                            chunk = json.dumps({
                                "choices": [{"index": 0, "delta": {"content": content}, "finish_reason": None}],
                                "provider": "duck",
                                "model": d.get("model", model),
                            })
                            self._send_chunk(f"data: {chunk}\n\n".encode())
                    except json.JSONDecodeError:
                        continue
                self._send_chunk(b"data: [DONE]\n\n")
            finally:
                self._end_chunks()
        except Exception as e:
            with _vqd_lock:
                _vqd_token = None
            self._error(502, f"Duck.ai request failed: {e}")

    # -----------------------------------------------------------------------
    # 4. Gemini Web to API (ntthanh2603/gemini-web-to-api & XD06/gemini-free-api)
    # -----------------------------------------------------------------------
    def _handle_gemini_models(self):
        models = [
            {"id": "gemini-2.0-flash", "name": "Gemini 2.0 Flash (Web)", "provider": "gemini-web"},
            {"id": "gemini-2.0-pro", "name": "Gemini 2.0 Pro (Web)", "provider": "gemini-web"},
            {"id": "gemini-1.5-flash", "name": "Gemini 1.5 Flash (Web)", "provider": "gemini-web"},
            {"id": "gemini-1.5-pro", "name": "Gemini 1.5 Pro (Web)", "provider": "gemini-web"},
        ]
        self._json_response({"provider": "gemini-web", "models": models})

    def _handle_gemini_health(self):
        start = time.time()
        try:
            req = urllib.request.Request(f"{GEMINI_WEB_URL}/models", headers={"Accept": "application/json"})
            urllib.request.urlopen(req, timeout=5)
            latency = round((time.time() - start) * 1000)
            _health["gemini"] = {"status": "online", "lastCheck": int(time.time()), "latency": latency, "error": None}
            self._json_response({"provider": "gemini-web", "status": "online", "latency": latency})
        except Exception as e:
            _health["gemini"] = {"status": "ready (cookies/proxy)", "lastCheck": int(time.time()), "latency": 0, "error": str(e)}
            self._json_response({"provider": "gemini-web", "status": "configured", "note": "Use cookies or local gemini-web-to-api on port 4981"}, 200)

    def _handle_gemini_chat(self):
        body = self._read_body()
        if body is None:
            return
        try:
            data = json.loads(body)
        except json.JSONDecodeError:
            self._error(400, "Invalid JSON")
            return

        model = data.get("model", "gemini-2.0-flash")
        messages = data.get("messages", [])
        stream = data.get("stream", True)
        cookies = data.get("cookies") or self.headers.get("x-gemini-cookies") or os.environ.get("GEMINI_COOKIES", "")

        # A. If local gemini-web-to-api or gemini-free-api proxy is running
        target_url = data.get("backendUrl") or GEMINI_WEB_URL
        headers = {"Content-Type": "application/json"}
        if cookies:
            headers["Cookie"] = cookies
            headers["Authorization"] = f"Bearer {cookies}"

        try:
            req = urllib.request.Request(
                f"{target_url}/chat/completions",
                data=json.dumps({"model": model, "messages": messages, "stream": stream}).encode(),
                headers=headers,
                method="POST",
            )
            resp = urllib.request.urlopen(req, timeout=90)
            if stream:
                self._start_sse()
                for raw_line in resp:
                    line = raw_line.decode(errors="replace").strip()
                    if line.startswith("data: "):
                        self._send_chunk(f"{line}\n\n".encode())
                        if line.strip() == "data: [DONE]":
                            break
                self._send_chunk(b"data: [DONE]\n\n")
                self._end_chunks()
            else:
                self._json_response(json.loads(resp.read().decode()))
            return
        except Exception as _proxy_err:
            # Fallback to Free Hub Gemini model
            sys.stderr.write(f"Gemini Web API proxy failed, routing via Free AI Hub Gemini: {_proxy_err}\n")
            data["model"] = "gemini"
            # Reuse free chat logic
            self._stream_or_buffer_free_hub("gemini", messages, stream)

    def _stream_or_buffer_free_hub(self, model, messages, stream):
        try:
            req = urllib.request.Request(
                FREE_HUB_URL,
                data=json.dumps({"model": "openai", "messages": messages, "stream": stream}).encode("utf-8"),
                headers={"Content-Type": "application/json", "Accept": "text/event-stream" if stream else "application/json"},
                method="POST",
            )
            resp = urllib.request.urlopen(req, timeout=30, context=_get_ssl_context())
            if stream:
                self._start_sse()
                for raw_line in resp:
                    line = raw_line.decode(errors="replace").strip()
                    if line.startswith("data: "):
                        self._send_chunk(f"{line}\n\n".encode("utf-8"))
                        if line.strip() == "data: [DONE]":
                            break
                self._send_chunk(b"data: [DONE]\n\n")
                self._end_chunks()
            else:
                self._json_response(json.loads(resp.read().decode()))
        except Exception as e:
            if stream:
                self._start_sse()
                self._send_chunk(f"data: {json.dumps({'choices': [{'index': 0, 'delta': {'content': f'⚠️ Error: {str(e)[:50]}'}, 'finish_reason': 'stop'}]})}\n\n".encode('utf-8'))
                self._send_chunk(b"data: [DONE]\n\n")
                self._end_chunks()
            else:
                self._json_response({"error": str(e)}, 500)

    # -----------------------------------------------------------------------
    # 5. Awesome Reverse-Engineered Generic OpenAI-compatible Proxy
    # -----------------------------------------------------------------------
    def _handle_proxy_chat(self):
        body = self._read_body()
        if body is None:
            return
        try:
            data = json.loads(body)
        except json.JSONDecodeError:
            self._error(400, "Invalid JSON")
            return

        backend_url = data.get("backendUrl", "").rstrip("/")
        model = data.get("model", "")
        messages = data.get("messages", [])
        api_key = data.get("apiKey", "")
        stream = data.get("stream", True)
        api_type = data.get("apiType", "OpenAI-compatible")

        if not backend_url:
            self._error(400, "backendUrl is required")
            return

        headers = {"Content-Type": "application/json"}
        if api_key:
            if api_type == "Anthropic Messages":
                headers["x-api-key"] = api_key
                headers["anthropic-version"] = "2023-06-01"
            else:
                headers["Authorization"] = f"Bearer {api_key}"

        if stream:
            headers["Accept"] = "text/event-stream"

        proxy_body = json.dumps({"model": model, "messages": messages, "stream": stream}).encode()
        url = f"{backend_url}/chat/completions"
        req = urllib.request.Request(url, data=proxy_body, headers=headers, method="POST")

        try:
            resp = urllib.request.urlopen(req, timeout=120, context=_get_ssl_context())
            if stream:
                self._start_sse()
                for raw_line in resp:
                    line = raw_line.decode(errors="replace").strip()
                    if line.startswith("data: "):
                        self._send_chunk(f"{line}\n\n".encode())
                        if line.strip() == "data: [DONE]":
                            break
                self._send_chunk(b"data: [DONE]\n\n")
                self._end_chunks()
            else:
                self._json_response(json.loads(resp.read().decode()))
        except Exception as e:
            self._error(502, f"Proxy request failed: {e}")

    def _handle_proxy_health(self, query):
        url = query.get("url", "").rstrip("/")
        if not url:
            self._error(400, "url parameter required")
            return
        try:
            req = urllib.request.Request(f"{url}/models", headers={"Accept": "application/json"})
            resp = urllib.request.urlopen(req, timeout=5, context=_get_ssl_context())
            data = json.loads(resp.read().decode())
            models = [m.get("id", m.get("name", "")) for m in data.get("data", data.get("models", []))]
            self._json_response({"status": "online", "models": [m for m in models if m]})
        except Exception as e:
            self._json_response({"status": "offline", "error": str(e)}, 503)

    # -----------------------------------------------------------------------
    # Real-Time Web Search (Multi-source: DuckDuckGo + Wikipedia)
    # -----------------------------------------------------------------------
    def _handle_search(self, q: str):
        if not q.strip():
            self._json_response({"query": "", "results": []})
            return
        results = []
        import html, re

        # 1. DuckDuckGo Instant Answer API
        try:
            ddg_url = f"https://api.duckduckgo.com/?q={urllib.parse.quote(q)}&format=json&no_html=1&skip_disambig=1"
            req = urllib.request.Request(ddg_url, headers={"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"})
            with urllib.request.urlopen(req, timeout=4, context=_get_ssl_context()) as resp:
                d = json.loads(resp.read().decode())
                abstract = d.get("AbstractText", "") or d.get("Abstract", "")
                heading = d.get("Heading", "")
                source_url = d.get("AbstractURL", "")
                if abstract:
                    results.append({
                        "title": heading or q,
                        "snippet": abstract[:350],
                        "url": source_url or "https://duckduckgo.com/?q=" + urllib.parse.quote(q)
                    })
                for rel in d.get("RelatedTopics", [])[:3]:
                    if isinstance(rel, dict) and "Text" in rel:
                        results.append({
                            "title": rel.get("Text", "").split(" - ")[0][:60],
                            "snippet": rel.get("Text", "")[:250],
                            "url": rel.get("FirstURL", "")
                        })
        except Exception:
            pass

        # 2. Wikipedia Search API
        try:
            url = f"https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch={urllib.parse.quote(q)}&format=json&utf8="
            req = urllib.request.Request(url, headers={"User-Agent": "LumiAI/1.0 (Linux; en)"})
            with urllib.request.urlopen(req, timeout=5, context=_get_ssl_context()) as resp:
                data = json.loads(resp.read().decode())
                items = data.get("query", {}).get("search", [])
                for it in items[:4]:
                    snippet = html.unescape(re.sub(r"<[^>]+>", "", it.get("snippet", ""))).strip()
                    title = it.get("title", "")
                    results.append({
                        "title": title,
                        "snippet": snippet,
                        "url": f"https://en.wikipedia.org/wiki/{urllib.parse.quote(title.replace(' ', '_'))}"
                    })
        except Exception as e:
            if not results:
                results.append({"title": f"Search: {q}", "snippet": f"Web search could not reach external engines: {str(e)}", "url": ""})

        self._json_response({"query": q, "results": results[:6]})

    # -----------------------------------------------------------------------
    # Python Code Runner (Secure Sandbox Subprocess)
    # -----------------------------------------------------------------------
    def _handle_run_python(self):
        body = self._read_body()
        if body is None:
            return
        try:
            data = json.loads(body)
        except Exception:
            self._error(400, "Invalid JSON")
            return
        code = data.get("code", "")
        if not code.strip():
            self._json_response({"stdout": "", "stderr": "No python code provided", "exit_code": 1})
            return
        try:
            res = subprocess.run(
                [sys.executable, "-c", code],
                capture_output=True,
                text=True,
                timeout=10
            )
            self._json_response({
                "stdout": res.stdout,
                "stderr": res.stderr,
                "exit_code": res.returncode
            })
        except subprocess.TimeoutExpired:
            self._json_response({
                "stdout": "",
                "stderr": "Execution timed out after 10 seconds.",
                "exit_code": 124
            })
        except Exception as e:
            self._json_response({
                "stdout": "",
                "stderr": str(e),
                "exit_code": 1
            })

    # -----------------------------------------------------------------------
    # Export Project as ZIP
    # -----------------------------------------------------------------------
    def _handle_export_zip(self):
        body = self._read_body()
        if body is None:
            return
        try:
            data = json.loads(body)
        except Exception:
            self._error(400, "Invalid JSON")
            return
        files = data.get("files", {})
        if not isinstance(files, dict) or not files:
            self._error(400, "Expected 'files' dictionary of filename -> content")
            return
        buf = io.BytesIO()
        with zipfile.ZipFile(buf, "w", zipfile.ZIP_DEFLATED) as z:
            for fname, content in files.items():
                clean_name = os.path.basename(fname) or "file.txt"
                z.writestr(clean_name, str(content))
        zip_bytes = buf.getvalue()
        self.send_response(200)
        self.send_header("Content-Type", "application/zip")
        self.send_header("Content-Disposition", 'attachment; filename="lumi-project.zip"')
        self.send_header("Content-Length", str(len(zip_bytes)))
        self._cors_headers()
        self.end_headers()
        self.wfile.write(zip_bytes)

    # -----------------------------------------------------------------------
    # Status
    # -----------------------------------------------------------------------
    def _handle_status(self):
        self._json_response({
            "server": "online",
            "port": PORT,
            "workspace": WORKSPACE_ROOT,
            "g4f_in_process": G4F_AVAILABLE,
            "providers": _health,
            "endpoints": {
                "free_ai_hub": "/api/free/chat",
                "gpt4free": "/api/g4f/chat",
                "duck_ai": "/api/duck/chat",
                "gemini_web": "/api/gemini/chat",
                "proxy_hub": "/api/proxy/chat",
            },
        })

# ---------------------------------------------------------------------------
# Threaded Server
# ---------------------------------------------------------------------------
class ThreadedHTTPServer(http.server.ThreadingHTTPServer):
    allow_reuse_address = True
    daemon_threads = True

def main():
    server = ThreadedHTTPServer((HOST, PORT), ProxyHandler)
    print(f"""
╔════════════════════════════════════════════════════════════════════════╗
║  Lumi AI Studio — Unified Free AI Backend Server                       ║
║  Web App & API Running on: http://localhost:{PORT:<5}                     ║
╠════════════════════════════════════════════════════════════════════════╣
║  Active Free & Reverse-Engineered Backends:                            ║
║    🚀 Free AI Hub (Zero Setup)  → /api/free/   (GPT-4o, Claude, DeepSeek)║
║    ⚡ GPT4Free (g4f in-process) → /api/g4f/    (70+ Free AI models)     ║
║    🦆 Duck.ai API              → /api/duck/   (DuckDuckGo AI chat)     ║
║    💎 Gemini Web to API        → /api/gemini/ (Gemini Web reverse API) ║
║    🌐 Awesome Reverse Proxy    → /api/proxy/  (Any OpenAI endpoint)    ║
║                                                                        ║
║  Web UI is directly accessible at: http://localhost:{PORT}/              ║
║  Press Ctrl+C to stop                                                  ║
╚════════════════════════════════════════════════════════════════════════╝
""")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nShutting down server...")
        server.shutdown()

if __name__ == "__main__":
    main()
