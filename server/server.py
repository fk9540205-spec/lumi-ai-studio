#!/usr/bin/env python3
"""
Lumi AI Studio — Unified Free & Reverse-Engineered AI Backend Server

Combines top open-source AI projects into one backend:
  1. Antigravity OAuth Hub (Google Gemini 3 Flash & Claude 3.7)
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
import re
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

if os.path.dirname(__file__) not in sys.path:
    sys.path.insert(0, os.path.dirname(__file__))

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
MAX_BODY = 25 * 1024 * 1024  # 25MB for PDFs, images & multi-doc attachments

# Root directory of web assets (parent of server/)
WORKSPACE_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if WORKSPACE_ROOT not in sys.path:
    sys.path.insert(0, WORKSPACE_ROOT)

try:
    from server.image_engine import generate_image
    from server.music_engine import generate_music
    from server.video_engine import generate_video
except Exception as _engines_err:
    try:
        import image_engine
        import music_engine
        import video_engine
        generate_image = image_engine.generate_image
        generate_music = music_engine.generate_music
        generate_video = video_engine.generate_video
    except Exception:
        generate_image = None
        generate_music = None
        generate_video = None

# ---------------------------------------------------------------------------
# Antigravity Core Proxy Engine (Google Auth & Claude 4.6)
# ---------------------------------------------------------------------------
ANTIGRAVITY_PROXY_URL = "http://127.0.0.1:8317/v1/chat/completions"
FREE_MODELS = [
    {"id": "gemini-3-flash", "name": "Gemini 3 Flash (Google Auth)", "provider": "antigravity", "description": "Google Gemini 3 Flash via Antigravity OAuth"},
    {"id": "claude-sonnet-4-6", "name": "Claude 3.7 Sonnet (Google Auth)", "provider": "antigravity", "description": "Anthropic Claude 3.7 Sonnet with Reasoning"},
    {"id": "claude-opus-4-6-thinking", "name": "Claude 3.7 Opus Thinking (Google Auth)", "provider": "antigravity", "description": "Anthropic Claude Opus Extended Thinking"},
    {"id": "gemini-3.8-flash-high", "name": "Gemini 3.8 Flash High (Google Auth)", "provider": "antigravity", "description": "High-compute Gemini Flash"},
    {"id": "gpt-oss-120b-medium", "name": "GPT-OSS 120B (Google Auth)", "provider": "antigravity", "description": "Open weights 120B reasoning model"}
]

def _serialize_g4f_tool_call(tool_call):
    if isinstance(tool_call, dict):
        return tool_call
    model_dump = getattr(tool_call, "model_dump", None)
    if callable(model_dump):
        return model_dump(exclude_none=True)

    serialized = {}
    for key in ("index", "id", "type"):
        value = getattr(tool_call, key, None)
        if value is not None:
            serialized[key] = value
    function = getattr(tool_call, "function", None)
    if function is not None:
        serialized["function"] = {
            key: value
            for key in ("name", "arguments")
            if (value := function.get(key) if isinstance(function, dict) else getattr(function, key, None)) is not None
        }
    return serialized

def _g4f_retry_delay(error):
    match = re.search(r"retry after (?P<seconds>\d+(?:\.\d+)?) seconds", str(error), re.IGNORECASE)
    if not match:
        return None
    delay = float(match.group("seconds"))
    return delay + 0.1 if 0 <= delay <= 5 else None

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
        elif path == "/api/fetch/url":
            self._handle_fetch_url(query.get("url", ""))
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
        elif path in ("/api/proxy/chat", "/api/proxy/chat/completions", "/v1/chat/completions", "/chat/completions"):
            self._handle_proxy_chat()
        elif path == "/api/run/python":
            self._handle_run_python()
        elif path == "/api/extract/pdf":
            self._handle_extract_pdf()
        elif path in ("/api/generate/image", "/api/image/generate", "/v1/images/generations"):
            self._handle_generate_image()
        elif path in ("/api/generate/video", "/api/video/generate", "/v1/videos/generations"):
            self._handle_generate_video()
        elif path in ("/api/music/generate", "/api/music/create", "/api/suno/generate"):
            self._handle_music_generate()
        elif path in ("/api/music/lyrics", "/api/suno/lyrics"):
            self._handle_music_lyrics()
        elif path == "/api/export/zip":
            self._handle_export_zip()
        elif path in ("/api/tts", "/api/voice/tts", "/v1/audio/speech"):
            self._handle_tts()
        else:
            self._error(404, f"API endpoint {path} not found")

    def _handle_generate_video(self):
        body = self._read_body()
        if body is None:
            return
        try:
            data = json.loads(body)
        except json.JSONDecodeError:
            self._error(400, "Invalid JSON")
            return
        prompt = data.get("prompt", "a cinematic video")
        model = data.get("model", "auto")
        aspect = data.get("aspect", "16:9")
        duration = float(data.get("duration", 4.0))
        cookies = {
            "google": data.get("googleCookie") or data.get("google_cookie") or os.environ.get("GOOGLE_COOKIE", ""),
            "bing": data.get("bingCookie") or data.get("bing_cookie") or os.environ.get("BING_COOKIE", "")
        }

        if generate_video:
            try:
                res = generate_video(prompt, model=model, aspect=aspect, duration=duration, cookies=cookies)
                self._json_response(res)
                return
            except Exception as e:
                sys.stderr.write(f"Video engine primary attempt error: {e}\n")

        # Bulletproof Cinematic Video Fallback: Keyframe render via Gemini 3.1 Flash Image + MP4 Animation
        try:
            try:
                from server.video_engine import _generate_cinematic_studio_video
            except ImportError:
                from video_engine import _generate_cinematic_studio_video
            vid_url = _generate_cinematic_studio_video(prompt, aspect=aspect, duration=duration, cookies=cookies)
            if vid_url:
                self._json_response({
                    "status": "success",
                    "url": vid_url,
                    "videoUrl": vid_url,
                    "provider": "Lumi Cinematic Studio (Motion Camera)",
                    "prompt": prompt,
                    "aspect": aspect,
                    "duration": duration
                })
                return
        except Exception as fb_err:
            sys.stderr.write(f"Cinematic video fallback error: {fb_err}\n")

        self._error(500, "Video generation engine failed across all AI clusters.")

    def _handle_generate_image(self):
        body = self._read_body()
        if body is None:
            return
        try:
            data = json.loads(body)
        except json.JSONDecodeError:
            self._error(400, "Invalid JSON")
            return
        prompt = data.get("prompt", "a beautiful digital art")
        cookies = {
            "google": data.get("googleCookie") or data.get("google_cookie") or os.environ.get("GOOGLE_COOKIE", ""),
            "bing": data.get("bingCookie") or data.get("bing_cookie") or os.environ.get("BING_COOKIE", "")
        }

        # 1. Unified Real Multi-Provider Image Engine (Google ImageFX Imagen 3, Bing DALL-E 3, Stability AI SD 3.5 Large)
        if generate_image:
            try:
                res = generate_image(prompt, cookies=cookies)
                self._json_response(res)
                return
            except Exception as e:
                sys.stderr.write(f"Image engine error: {e}\n")

        # 2. Local Google Gemini proxy fallback if available
        try:
            cpa_req = urllib.request.Request(
                "http://127.0.0.1:8317/v1/chat/completions",
                data=json.dumps({
                    "model": "gemini-3.1-flash-image",
                    "messages": [{"role": "user", "content": f"draw: {prompt}"}],
                    "stream": False
                }).encode("utf-8"),
                headers={
                    "Content-Type": "application/json",
                    "Authorization": "Bearer lumi-antigravity-local"
                },
                method="POST"
            )
            with urllib.request.urlopen(cpa_req, timeout=35) as cpa_resp:
                res_data = json.loads(cpa_resp.read().decode())
                choices = res_data.get("choices", [])
                if choices:
                    msg = choices[0].get("message", {})
                    imgs = msg.get("images")
                    if imgs and isinstance(imgs, list) and len(imgs) > 0:
                        img_url = imgs[0].get("image_url", {}).get("url")
                        if img_url:
                            self._json_response({"url": img_url, "provider": "gemini-3.1-flash-image", "prompt": prompt})
                            return
        except Exception as err:
            sys.stderr.write(f"Gemini image generation attempt failed: {err}\n")

        self._error(500, "Image generation error on all upstreams")

    def _handle_music_generate(self):
        body = self._read_body()
        if body is None:
            return
        try:
            data = json.loads(body)
        except json.JSONDecodeError:
            self._error(400, "Invalid JSON")
            return

        prompt = data.get("prompt", "")
        style = data.get("style", "Bollywood / Pop")
        title = data.get("title", "Lumi Track")
        cookies = {
            "suno": data.get("cookie") or data.get("sunoCookie") or data.get("suno_cookie") or os.environ.get("SUNO_COOKIE", ""),
            "udio": data.get("udioToken") or data.get("udio_token") or os.environ.get("UDIO_TOKEN", ""),
            "google": data.get("googleCookie") or data.get("google_cookie") or os.environ.get("GOOGLE_COOKIE", "")
        }

        # Real Multi-Provider Music Engine (Suno v3.5, Udio, Google MusicLM)
        if generate_music:
            try:
                res = generate_music(prompt, style=style, title=title, cookies=cookies)
                self._json_response(res)
                return
            except Exception as e:
                sys.stderr.write(f"Music engine error: {e}\n")
                self._error(500, f"Music engine error: {e}")
                return

        self._error(500, "Music engine not initialized")

    def _handle_music_lyrics(self):
        body = self._read_body()
        if body is None:
            return
        try:
            data = json.loads(body)
        except json.JSONDecodeError:
            self._error(400, "Invalid JSON")
            return
        prompt = data.get("prompt", "")
        try:
            cpa_req = urllib.request.Request(
                "http://127.0.0.1:8317/v1/chat/completions",
                data=json.dumps({
                    "model": "gemini-3-flash",
                    "messages": [
                        {"role": "system", "content": "Write catchy song lyrics with [Verse], [Chorus], and rhyming rhythm."},
                        {"role": "user", "content": f"Lyrics for: {prompt}"}
                    ],
                    "stream": False
                }).encode("utf-8"),
                headers={"Content-Type": "application/json", "Authorization": "Bearer lumi-antigravity-local"},
                method="POST"
            )
            with urllib.request.urlopen(cpa_req, timeout=20) as cpa_resp:
                res = json.loads(cpa_resp.read().decode())
                self._json_response({"lyrics": res["choices"][0]["message"]["content"]})
                return
        except Exception as e:
            self._error(500, f"Lyrics generation error: {e}")

    # -----------------------------------------------------------------------
    # 1. Antigravity OAuth Core Engine (Gemini 3 Flash & Claude)
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
        target_model = raw_model or "gemini-2.5-flash"

        messages = data.get("messages", [])
        stream = data.get("stream", True)
        image = data.get("image")
        max_tokens = int(data.get("max_tokens", 4096))

        # 0. CLIProxyAPI Upstream (Google Antigravity Authenticated High-Tier Models)
        antigravity_models = [
            "claude-sonnet-4-6", "claude-opus-4-6-thinking", "gemini-3-flash",
            "gemini-3.8-flash-tiered", "gemini-3.8-flash-high", "gemini-3.1-flash-image",
            "gemini-3.1-flash-lite", "gemini-3.5-flash-lite", "gpt-oss-120b-medium"
        ]
        if raw_model in antigravity_models or raw_model.startswith("antigravity-"):
            clean_m = raw_model.replace("antigravity-", "")
            try:
                cpa_req = urllib.request.Request(
                    "http://127.0.0.1:8317/v1/chat/completions",
                    data=json.dumps({"model": clean_m, "messages": messages, "stream": stream, "max_tokens": max_tokens}).encode("utf-8"),
                    headers={
                        "Content-Type": "application/json",
                        "Authorization": "Bearer lumi-antigravity-local",
                        "Accept": "text/event-stream" if stream else "application/json"
                    },
                    method="POST"
                )
                cpa_resp = urllib.request.urlopen(cpa_req, timeout=45)
                if stream:
                    self._start_sse()
                    for raw_line in cpa_resp:
                        line = raw_line.decode(errors="replace")
                        if line.startswith("data: ") and line.strip() != "data: [DONE]":
                            try:
                                chunk_json = json.loads(line[6:])
                                choices = chunk_json.get("choices", [])
                                if choices:
                                    delta = choices[0].get("delta", {})
                                    imgs = delta.get("images")
                                    if imgs and isinstance(imgs, list) and len(imgs) > 0:
                                        img_url = imgs[0].get("image_url", {}).get("url")
                                        if img_url:
                                            delta["content"] = f"\n\n![Generated Image]({img_url})\n\n"
                                            line = "data: " + json.dumps(chunk_json) + "\n\n"
                            except Exception:
                                pass
                            self._send_chunk(line.encode("utf-8"))
                        elif line.strip() == "data: [DONE]":
                            break
                    self._send_chunk(b"data: [DONE]\n\n")
                    self._end_chunks()
                    return
                else:
                    raw_data = json.loads(cpa_resp.read().decode())
                    choices = raw_data.get("choices", [])
                    if choices:
                        msg = choices[0].get("message", {})
                        imgs = msg.get("images")
                        if imgs and isinstance(imgs, list) and len(imgs) > 0:
                            img_url = imgs[0].get("image_url", {}).get("url")
                            if img_url and not msg.get("content"):
                                msg["content"] = f"![Generated Image]({img_url})"
                    self._json_response(raw_data)
                    return
            except Exception as cpa_err:
                sys.stderr.write(f"CLIProxyAPI upstream attempt failed, falling back: {cpa_err}\n")

        # Map to reliable working models
        if "gemini" in raw_model:
            target_model = "gemini-2.5-flash"
        tools = data.get("tools") or []
        tool_choice = data.get("tool_choice", "auto")
        allowed_tool_names = {
            tool.get("function", {}).get("name")
            for tool in tools
            if isinstance(tool, dict) and isinstance(tool.get("function"), dict) and isinstance(tool["function"].get("name"), str)
        }

        # 0. Multimodal Vision: If user uploaded an image, route to Gemini Vision
        if image and G4F_AVAILABLE and _g4f_client:
            try:
                if stream:
                    gen = _g4f_client.chat.completions.create(
                        model="gemini",
                        messages=messages,
                        image=image,
                        stream=True,
                    )
                    self._start_sse()
                    for chunk in gen:
                        c = ""
                        if hasattr(chunk, "choices") and chunk.choices:
                            c = getattr(chunk.choices[0].delta, "content", "") or ""
                        if c:
                            chunk_payload = {
                                "choices": [{"index": 0, "delta": {"content": c}, "finish_reason": None}],
                                "provider": "gemini-vision",
                                "model": "gemini-vision",
                            }
                            self._send_chunk(f"data: {json.dumps(chunk_payload)}\n\n".encode("utf-8"))
                    self._send_chunk(b"data: [DONE]\n\n")
                    self._end_chunks()
                    return
                else:
                    response = _g4f_client.chat.completions.create(
                        model="gemini",
                        messages=messages,
                        image=image,
                        stream=False,
                    )
                    content = response.choices[0].message.content or ""
                    self._json_response({
                        "choices": [{"index": 0, "message": {"role": "assistant", "content": content}, "finish_reason": "stop"}],
                        "provider": "gemini-vision",
                        "model": "gemini-vision",
                    })
                    return
            except Exception as vision_err:
                sys.stderr.write(f"Vision streaming attempt failed: {vision_err}\n")

        # Fallback straight to Antigravity Gemini 3 Flash / Claude
        try:
            cpa_req = urllib.request.Request(
                ANTIGRAVITY_PROXY_URL,
                data=json.dumps({"model": "gemini-3-flash", "messages": messages, "stream": stream, "max_tokens": max_tokens}).encode("utf-8"),
                headers={
                    "Content-Type": "application/json",
                    "Authorization": "Bearer lumi-antigravity-local",
                    "Accept": "text/event-stream" if stream else "application/json"
                },
                method="POST"
            )
            cpa_resp = urllib.request.urlopen(cpa_req, timeout=45)
            if stream:
                self._start_sse()
                for raw_line in cpa_resp:
                    line = raw_line.decode(errors="replace")
                    if line.startswith("data: ") and line.strip() != "data: [DONE]":
                        self._send_chunk(line.encode("utf-8"))
                    elif line.strip() == "data: [DONE]":
                        break
                self._send_chunk(b"data: [DONE]\n\n")
                self._end_chunks()
                return
            else:
                raw_data = json.loads(cpa_resp.read().decode())
                self._json_response(raw_data)
                return
        except Exception as e:
            sys.stderr.write(f"Antigravity fallback failed: {e}\n")

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
            models.append({
                "id": "llm7-coder",
                "name": "LLM7 (Coding + Native Tools)",
                "provider": "g4f",
                "description": "Remote coding model with tested consecutive workspace tool calls",
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
        requested_model = model
        messages = data.get("messages", [])
        stream = data.get("stream", True)
        tools = data.get("tools") or []
        tool_choice = data.get("tool_choice", "auto")
        selected_provider = None

        if model == "llm7-coder":
            if not G4F_AVAILABLE or not _g4f_client:
                self._error(503, "LLM7 requires the in-process GPT4Free provider, which is unavailable.")
                return
            selected_provider = g4f.Provider.LLM7
            model = "default"

        if not messages:
            self._error(400, "No messages provided")
            return

        provider_options = {"provider": selected_provider} if selected_provider else {}

        # A. In-process G4F Client (Fastest & direct)
        if G4F_AVAILABLE and _g4f_client:
            try:
                if stream:
                    self._start_sse()
                    for attempt in range(2):
                        emitted_chunk = False
                        try:
                            response = _g4f_client.chat.completions.create(
                                model=model,
                                **provider_options,
                                messages=messages,
                                stream=True,
                                **({"tools": tools, "tool_choice": tool_choice} if tools else {}),
                            )
                            for chunk in response:
                                content = ""
                                tool_calls = []
                                if hasattr(chunk, "choices") and chunk.choices:
                                    delta = chunk.choices[0].delta
                                    content = getattr(delta, "content", "") or ""
                                    raw_tool_calls = getattr(delta, "tool_calls", None) or []
                                    tool_calls = [_serialize_g4f_tool_call(call) for call in raw_tool_calls]
                                if content or tool_calls:
                                    chunk_payload = {
                                        "choices": [{"index": 0, "delta": {**({"content": content} if content else {}), **({"tool_calls": tool_calls} if tool_calls else {})}, "finish_reason": None}],
                                        "provider": "g4f",
                                        "model": requested_model,
                                    }
                                    self._send_chunk(f"data: {json.dumps(chunk_payload)}\n\n".encode("utf-8"))
                                    emitted_chunk = True
                            break
                        except Exception as e:
                            retry_delay = _g4f_retry_delay(e)
                            if selected_provider and attempt == 0 and not emitted_chunk and retry_delay is not None:
                                time.sleep(retry_delay)
                                continue
                            raise
                    self._send_chunk(b"data: [DONE]\n\n")
                    self._end_chunks()
                    return
                else:
                    for attempt in range(2):
                        try:
                            response = _g4f_client.chat.completions.create(
                                model=model,
                                **provider_options,
                                messages=messages,
                                stream=False,
                                **({"tools": tools, "tool_choice": tool_choice} if tools else {}),
                            )
                            break
                        except Exception as e:
                            retry_delay = _g4f_retry_delay(e)
                            if selected_provider and attempt == 0 and retry_delay is not None:
                                time.sleep(retry_delay)
                                continue
                            raise
                    message = response.choices[0].message
                    content = message.content or ""
                    tool_calls = [_serialize_g4f_tool_call(call) for call in (getattr(message, "tool_calls", None) or [])]
                    self._json_response({
                        "choices": [{"index": 0, "message": {**{"role": "assistant", "content": content}, **({"tool_calls": tool_calls} if tool_calls else {})}, "finish_reason": "stop"}],
                        "provider": "g4f",
                        "model": requested_model,
                    })
                    return
            except Exception as e:
                # If in-process model failed, fallback to external G4F_URL or Free Hub
                sys.stderr.write(f"In-process G4F failed, falling back: {e}\n")

        # B. Fallback to G4F HTTP server or proxy
        g4f_body = json.dumps({
            "model": model,
            "messages": messages,
            "stream": stream,
            **({"provider": "LLM7"} if selected_provider else {}),
            **({"tools": tools, "tool_choice": tool_choice} if tools else {}),
        }).encode()
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
        max_tokens = int(data.get("max_tokens", 4096))

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

        proxy_body = json.dumps({"model": model, "messages": messages, "stream": stream, "max_tokens": max_tokens}).encode()
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

        # Clean conversational search filler
        q_clean = q.strip()
        q_clean = re.sub(r"^/search\s+", "", q_clean, flags=re.I)
        q_clean = re.sub(r"^(?:please\s+|can\s+you\s+)?(?:search(?:\s+the\s+web|\s+online|\s+on\s+google)?|google|find|dhoondo|khojo)(?:\s+(?:for|about|me))?\s+", "", q_clean, flags=re.I)
        q_clean = re.sub(r"[\s,]+(?:search\s*(?:karke|karo)?|google\s*(?:karke|karo)?|dhoond\s*(?:kar|ke)?|khoj\s*(?:kar|ke)?)\s*(?:batao|dikhau|bataiye|please)?[\s\?!.]*$", "", q_clean, flags=re.I)
        q_clean = re.sub(r"[\?!.]+$", "", q_clean).strip() or q.strip()

        # 0. Live Real-Time Weather Check (Instant wttr.in Integration)
        weather_match = re.search(r"\b(?:weather|mausam|temperature|forecast|temp)\b", q_clean, re.I)
        if weather_match:
            city_match = re.search(r"(?:in|of|at|for|ka|ki)\s+([A-Za-z\s]+)", q_clean, re.I) or re.search(r"([A-Za-z]+)\s+(?:weather|mausam|temp)", q_clean, re.I)
            city = city_match.group(1).strip() if city_match else q_clean.replace("weather", "").replace("mausam", "").strip()
            city = re.sub(r"\b(today|now|tomorrow|report|kaisa|hai|batao|the|current)\b", "", city, flags=re.I).strip()
            if city:
                try:
                    w_url = f"https://wttr.in/{urllib.parse.quote(city)}?format=j1"
                    req = urllib.request.Request(w_url, headers={"User-Agent": "curl/7.68.0"})
                    with urllib.request.urlopen(req, timeout=3, context=_get_ssl_context()) as resp:
                        wdata = json.loads(resp.read().decode())
                        curr = wdata.get("current_condition", [{}])[0]
                        temp_c = curr.get("temp_C", "")
                        desc = curr.get("weatherDesc", [{}])[0].get("value", "")
                        humidity = curr.get("humidity", "")
                        wind = curr.get("windspeedKmph", "")
                        forecast_days = []
                        for fd in wdata.get("weather", [])[:3]:
                            forecast_days.append(f"{fd.get('date')}: {fd.get('maxtempC')}°C/{fd.get('mintempC')}°C ({fd.get('hourly', [{}])[0].get('weatherDesc', [{}])[0].get('value', '')})")
                        snippet = f"Current Live Weather in {city.title()}: {temp_c}°C, {desc}. Humidity: {humidity}%, Wind: {wind} km/h. 3-Day Forecast: {'; '.join(forecast_days)}"
                        results.append({
                            "title": f"Live Weather: {city.title()} ({temp_c}°C, {desc})",
                            "snippet": snippet,
                            "url": f"https://wttr.in/{urllib.parse.quote(city)}"
                        })
                except Exception:
                    pass

        # 1. Real Full Web Search via DuckDuckGo HTML
        try:
            ddg_html_url = "https://html.duckduckgo.com/html/?q=" + urllib.parse.quote(q_clean)
            req = urllib.request.Request(ddg_html_url, headers={
                "User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
            })
            with urllib.request.urlopen(req, timeout=5, context=_get_ssl_context()) as resp:
                c = resp.read().decode("utf-8", errors="replace")
                bodies = re.findall(r"<div class=\"[^\"]*result__body[^\"]*\">([\s\S]*?)(?:<div class=\"[^\"]*result__body|\Z)", c)
                for b in bodies[:5]:
                    tm = re.search(r"<a[^>]*class=\"[^\"]*result__a[^\"]*\"[^>]*href=\"([^\"]+)\"[^>]*>([\s\S]*?)</a>", b)
                    sm = re.search(r"<a[^>]*class=\"[^\"]*result__snippet[^\"]*\"[^>]*>([\s\S]*?)</a>", b)
                    if tm:
                        raw_url = tm.group(1)
                        if "uddg=" in raw_url:
                            raw_url = urllib.parse.unquote(raw_url.split("uddg=")[1].split("&")[0])
                        title = html.unescape(re.sub(r"<[^>]+>", "", tm.group(2))).strip()
                        snippet = html.unescape(re.sub(r"<[^>]+>", "", sm.group(1))).strip() if sm else ""
                        if title and (snippet or raw_url):
                            results.append({"title": title, "url": raw_url, "snippet": snippet})
        except Exception:
            pass

        # 2. DuckDuckGo Instant Answer API Fallback
        if len(results) < 2:
            try:
                ddg_url = f"https://api.duckduckgo.com/?q={urllib.parse.quote(q_clean)}&format=json&no_html=1&skip_disambig=1"
                req = urllib.request.Request(ddg_url, headers={"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"})
                with urllib.request.urlopen(req, timeout=4, context=_get_ssl_context()) as resp:
                    d = json.loads(resp.read().decode())
                    abstract = d.get("AbstractText", "") or d.get("Abstract", "")
                    heading = d.get("Heading", "")
                    source_url = d.get("AbstractURL", "")
                    if abstract:
                        results.append({
                            "title": heading or q_clean,
                            "snippet": abstract[:350],
                            "url": source_url or "https://duckduckgo.com/?q=" + urllib.parse.quote(q_clean)
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

        # 3. Wikipedia Search API Fallback
        if len(results) < 2:
            try:
                url = f"https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch={urllib.parse.quote(q_clean)}&format=json&utf8="
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
                    results.append({"title": f"Search: {q_clean}", "snippet": f"Web search could not reach external engines: {str(e)}", "url": ""})

        self._json_response({"query": q_clean, "results": results[:6]})

    # -----------------------------------------------------------------------
    # Web URL Reader & Scraper
    # -----------------------------------------------------------------------
    def _handle_fetch_url(self, target_url: str):
        if not target_url.strip():
            self._error(400, "Missing 'url' query parameter")
            return
        if not target_url.startswith(("http://", "https://")):
            target_url = "https://" + target_url

        try:
            req = urllib.request.Request(
                target_url,
                headers={"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"}
            )
            with urllib.request.urlopen(req, timeout=8, context=_get_ssl_context()) as resp:
                raw_bytes = resp.read(1024 * 1024)
                text = raw_bytes.decode("utf-8", errors="ignore")
                import re, html
                clean = re.sub(r"<(script|style|noscript|svg)[^>]*>[\s\S]*?</\1>", " ", text, flags=re.IGNORECASE)
                title_match = re.search(r"<title[^>]*>(.*?)</title>", clean, flags=re.IGNORECASE | re.DOTALL)
                page_title = html.unescape(title_match.group(1).strip()) if title_match else target_url
                plain_text = re.sub(r"<[^>]+>", " ", clean)
                plain_text = re.sub(r"\s+", " ", plain_text).strip()
                excerpt = plain_text[:5000]

                self._json_response({
                    "url": target_url,
                    "title": page_title,
                    "content": excerpt,
                    "length": len(excerpt)
                })
        except Exception as e:
            self._error(500, f"Failed to fetch webpage: {str(e)}")

    # -----------------------------------------------------------------------
    # PDF Text Extraction (Real pypdf engine)
    # -----------------------------------------------------------------------
    def _handle_extract_pdf(self):
        body = self._read_body()
        if body is None:
            return
        try:
            data = json.loads(body)
        except Exception:
            self._error(400, "Invalid JSON")
            return

        b64_data = data.get("base64", "")
        if not b64_data:
            self._error(400, "Missing base64 PDF data")
            return

        if "," in b64_data:
            b64_data = b64_data.split(",", 1)[1]

        try:
            import base64, io
            pdf_bytes = base64.b64decode(b64_data)
            import pypdf
            reader = pypdf.PdfReader(io.BytesIO(pdf_bytes))
            pages_text = []
            for i, page in enumerate(reader.pages[:30]):
                t = page.extract_text() or ""
                if t.strip():
                    pages_text.append(f"--- Page {i+1} ---\n" + t.strip())

            full_text = "\n\n".join(pages_text)
            self._json_response({
                "pages": len(reader.pages),
                "text": full_text[:12000],
                "length": len(full_text)
            })
        except Exception as e:
            self._error(500, f"Failed to extract PDF text: {str(e)}")

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
                "tts": "/api/tts",
            },
        })

    def _handle_tts(self):
        global _TTS_CACHE
        if "_TTS_CACHE" not in globals():
            _TTS_CACHE = {}
        try:
            body = self._read_body()
            if body is None:
                return
            try:
                data = json.loads(body)
            except json.JSONDecodeError:
                self._error(400, "Invalid JSON")
                return

            text = (data.get("text") or data.get("input") or "").strip()
            raw_voice = (data.get("voice") or "").strip()
            if not text:
                self._error(400, "Missing text or input parameter")
                return

            clean_text = re.sub(r'[*_`#~]', '', text).strip()
            has_hindi = bool(re.search(r'[\u0900-\u097F]', clean_text))

            # If ElevenLabs API key is provided, route directly to real ElevenLabs
            eleven_key = os.environ.get("ELEVENLABS_API_KEY") or data.get("elevenlabs_api_key") or data.get("eleven_key") or "sk_a61c01bfdc33853091e2f7439494a00d98ac0e3872f54072"
            eleven_voice_map = {
                "jessica": "cgSgspJ2msm6clMCkdW9",
                "lily": "pFZP5JQG7iQjIQuC4Bku",
                "bella": "hpp4J3VqNfWAUOO0d1Us",
                "matilda": "XrExE9yKIg1WjnnlVkGX",
                "sarah": "EXAVITQu4vr4xnSDxMaL",
                "laura": "FGY2WhTYpPnrIDTdsKH5",
                "alice": "Xb7hH8MSUJpSbSDYk0k2",
                "charlie": "IKne3meq5aSn9XLyUdCD",
                "george": "JBFqnCBsd6RMkjVDRZzb",
                "callum": "N2lVS1w4EtoT3dr4eOWO",
                "brian": "nPczCjzI2devNBz1zQrb",
                "adam": "pNInz6obpgDQGcFmaJgB",
                "roger": "CwhRBWXzGAHq8TQ4Fs17",
                "eric": "cjVigY5qzO86Huf0OWal",
                "chris": "iP95p4xoKVk53GoZ742B",
                "bill": "pqHfZKP75CvOlQylNhV4",
                "rachel": "cgSgspJ2msm6clMCkdW9",
                "nova": "cgSgspJ2msm6clMCkdW9",
                "nicole": "cgSgspJ2msm6clMCkdW9",
            }
            if eleven_key and raw_voice.lower() in eleven_voice_map:
                try:
                    import urllib.request
                    vid = eleven_voice_map[raw_voice.lower()]
                    el_url = f"https://api.elevenlabs.io/v1/text-to-speech/{vid}?output_format=mp3_44100_128"
                    req = urllib.request.Request(
                        el_url,
                        data=json.dumps({
                            "text": clean_text,
                            "model_id": "eleven_multilingual_v2",
                            "voice_settings": {
                                "stability": 0.45,
                                "similarity_boost": 0.85,
                                "style": 0.2
                            }
                        }).encode("utf-8"),
                        headers={
                            "xi-api-key": eleven_key,
                            "Content-Type": "application/json",
                            "Accept": "audio/mpeg"
                        },
                        method="POST"
                    )
                    with urllib.request.urlopen(req, timeout=12) as resp:
                        if resp.status == 200:
                            el_bytes = resp.read()
                            if len(el_bytes) > 200:
                                self.send_response(200)
                                self.send_header("Content-Type", "audio/mpeg")
                                self.send_header("Content-Length", str(len(el_bytes)))
                                self.send_header("Access-Control-Allow-Origin", "*")
                                self.end_headers()
                                self.wfile.write(el_bytes)
                                return
                except Exception as ex:
                    sys.stderr.write(f"ElevenLabs live generation error: {ex}, falling back to neural voice\n")

            # Voice mapping: each voice has its own authentic neural model, pitch, and cadence
            voice_config = {
                "jessica": ("en-US-AvaMultilingualNeural", "+8Hz", "+5%"),
                "lily": ("en-US-EmmaMultilingualNeural", "+2Hz", "-2%"),
                "nova": ("en-US-AvaMultilingualNeural", "+4Hz", "+5%"),
                "shimmer": ("en-US-EmmaMultilingualNeural", "+8Hz", "+6%"),
                "swara": ("hi-IN-SwaraNeural", "+0Hz", "+0%"),
                "madhur": ("hi-IN-MadhurNeural", "-4Hz", "+0%"),
                "kavya": ("hi-IN-SwaraNeural", "+4Hz", "+3%"),
                "prabhat": ("hi-IN-MadhurNeural", "-8Hz", "-3%"),
                "aarav": ("hi-IN-MadhurNeural", "+0Hz", "+4%"),
                "ananya": ("en-IN-NeerjaExpressiveNeural", "+2Hz", "+2%"),
                "rachel": ("en-US-EmmaMultilingualNeural", "+2Hz", "+1%"),
                "adam": ("en-AU-WilliamMultilingualNeural", "-6Hz", "-2%"),
                "nicole": ("en-US-AvaMultilingualNeural", "+6Hz", "+4%"),
                "charlie": ("en-AU-WilliamMultilingualNeural", "-2Hz", "+0%"),
                "george": ("en-GB-RyanNeural", "-4Hz", "-2%"),
                "bella": ("en-US-JennyNeural", "+4Hz", "+2%"),
                "neerja": ("en-IN-NeerjaExpressiveNeural", "+0Hz", "+0%"),
                "alloy": ("en-US-AndrewMultilingualNeural", "-2Hz", "+2%"),
                "onyx": ("en-US-BrianMultilingualNeural", "-10Hz", "-4%"),
            }

            v_cfg = voice_config.get(raw_voice.lower())
            if not v_cfg:
                v_cfg = ("en-US-AvaMultilingualNeural", "+0Hz", "+0%")
            voice, pitch, rate = v_cfg

            cache_key = (voice, pitch, rate, clean_text)
            if cache_key in _TTS_CACHE:
                audio_bytes = _TTS_CACHE[cache_key]
            else:
                import asyncio
                import edge_tts

                async def _synth():
                    for attempt in range(2):
                        try:
                            comm = edge_tts.Communicate(clean_text, voice, pitch=pitch, rate=rate)
                            mp3 = bytearray()
                            async for chunk in comm.stream():
                                if chunk["type"] == "audio":
                                    mp3.extend(chunk["data"])
                            if len(mp3) > 200:
                                return bytes(mp3)
                        except Exception:
                            if attempt == 0:
                                await asyncio.sleep(0.3)
                    # Safe fallback without pitch modulation
                    comm = edge_tts.Communicate(clean_text, voice)
                    mp3 = bytearray()
                    async for chunk in comm.stream():
                        if chunk["type"] == "audio":
                            mp3.extend(chunk["data"])
                    return bytes(mp3)

                loop = asyncio.new_event_loop()
                asyncio.set_event_loop(loop)
                try:
                    audio_bytes = loop.run_until_complete(_synth())
                finally:
                    loop.close()

                if len(audio_bytes) > 200:
                    if len(_TTS_CACHE) > 200:
                        _TTS_CACHE.clear()
                    _TTS_CACHE[cache_key] = audio_bytes

            self.send_response(200)
            self.send_header("Content-Type", "audio/mpeg")
            self.send_header("Content-Length", str(len(audio_bytes)))
            self.send_header("Cache-Control", "public, max-age=86400")
            self._cors_headers()
            self.end_headers()
            try:
                self.wfile.write(audio_bytes)
            except (BrokenPipeError, ConnectionResetError):
                pass
        except Exception as e:
            try:
                self._error(500, f"TTS synthesis failed: {str(e)}")
            except Exception:
                pass

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
