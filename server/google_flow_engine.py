#!/usr/bin/env python3
"""
Lumi AI Studio — Google Flow Imagen Engine
Direct Wire RPC 'ogiZ0b' via Playwright Session Context
Extracts signed image directly via Google Flow session.
"""

import os
import sys
import time
import json
import re
import asyncio
import hashlib
import urllib.request
from pathlib import Path

PROFILE_DIR = Path(os.environ.get("GFLOW_PROFILE_DIR", "/home/jayu/.local/share/gflow-cli/profile_default"))
STORAGE_STATE_FILE = Path(__file__).resolve().parent / "google_flow_storage_state.json"
PROJECT_ID = os.environ.get("GFLOW_PROJECT_ID", "cfc62b8a-268f-429a-abcd-375478e21765")
MEDIA_DIR = Path(__file__).resolve().parent.parent / "generated_media"
MEDIA_DIR.mkdir(parents=True, exist_ok=True)


def _find_image_url(val):
    if isinstance(val, str):
        if val.startswith("https://flow-content.google/image/") or "flow-content.google" in val:
            return val
    elif isinstance(val, list):
        for item in val:
            res = _find_image_url(item)
            if res:
                return res
    elif isinstance(val, dict):
        for item in val.values():
            res = _find_image_url(item)
            if res:
                return res
    return None


def _save_image_bytes(data: bytes, ext: str = "jpg", prefix: str = "flow") -> str:
    timestamp = int(time.time())
    h = hashlib.sha256(data).hexdigest()[:12]
    filename = f"{prefix}_{timestamp}_{h}.{ext}"
    filepath = MEDIA_DIR / filename
    filepath.write_bytes(data)
    return f"/generated_media/{filename}"


def _download_and_save(url: str, ext: str = "jpg", prefix: str = "flow") -> str:
    req = urllib.request.Request(
        url,
        headers={"User-Agent": "curl/8.5.0"}
    )
    with urllib.request.urlopen(req, timeout=30) as resp:
        data = resp.read()

    if len(data) < 500 or b"<Error>" in data[:100]:
        raise ValueError(f"Downloaded payload is an error: {data.decode('utf-8', errors='ignore')}")

    return _save_image_bytes(data, ext=ext, prefix=prefix)


async def _generate_flow_async(prompt: str, aspect_ratio_str: str = "SQUARE") -> dict:
    from playwright.async_api import async_playwright

    # Aspect ratio mapping: 0 = SQUARE 1:1, 1 = LANDSCAPE 16:9, 2 = PORTRAIT 9:16
    ar_normalized = aspect_ratio_str.upper()
    if "LANDSCAPE" in ar_normalized or "16:9" in ar_normalized:
        aspect_code = 1
    elif "PORTRAIT" in ar_normalized or "9:16" in ar_normalized:
        aspect_code = 2
    else:
        aspect_code = 0

    if not PROFILE_DIR.exists() and not STORAGE_STATE_FILE.exists():
        raise FileNotFoundError(f"Google Flow credentials not found (checked {PROFILE_DIR} and {STORAGE_STATE_FILE})")

    async with async_playwright() as pw:
        chrome_bin = os.environ.get("CHROME_BIN", "/usr/bin/chromium")
        executable_path = chrome_bin if os.path.exists(chrome_bin) else None

        browser_to_close = None
        if STORAGE_STATE_FILE.exists():
            browser = await pw.chromium.launch(
                headless=True,
                executable_path=executable_path,
                args=[
                    "--no-sandbox",
                    "--disable-gpu",
                    "--disable-dev-shm-usage",
                    "--disable-background-networking"
                ]
            )
            browser_to_close = browser
            ctx = await browser.new_context(
                storage_state=str(STORAGE_STATE_FILE),
                user_agent="Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36"
            )
        else:
            ctx = await pw.chromium.launch_persistent_context(
                user_data_dir=str(PROFILE_DIR),
                channel="chrome" if not executable_path else None,
                executable_path=executable_path,
                headless=True,
                args=[
                    "--no-sandbox",
                    "--disable-gpu",
                    "--disable-dev-shm-usage",
                    "--disable-background-networking",
                    "--disable-default-apps"
                ]
            )

        try:
            page = await ctx.new_page()
            flow_url = f"https://flow.google.com/project/{PROJECT_ID}"
            await page.goto(flow_url, wait_until="domcontentloaded", timeout=25000)
            await page.wait_for_timeout(2000)

            content = await page.content()
            bl_match = re.search(r"boq_labs-ai-sandbox-frontend_[A-Za-z0-9_.-]+", content)
            fsid_match = re.search(r'"FdrFJe":"(-?[0-9]+)"', content)
            snlm_match = re.search(r'"SNlM0e":"((?:\\.|[^"])+)"', content)

            bl = bl_match.group(0) if bl_match else "boq_labs-ai-sandbox-frontend_20261118.14_p0"
            fsid = fsid_match.group(1) if fsid_match else ""
            snlm = snlm_match.group(1) if snlm_match else ""

            js_code = """
            async (args) => {
                const { projectId, prompt, bl, fsid, snlm, aspectCode } = args;
            let recaptchaToken = "";
            try {
                if (typeof grecaptcha !== 'undefined' && grecaptcha.enterprise && typeof grecaptcha.enterprise.execute === 'function') {
                    recaptchaToken = await grecaptcha.enterprise.execute(
                        '6LdsFiUsAAAAAIjVDZcuLhaHiDn5nnHVXVRQGeMV',
                        { action: 'IMAGE_GENERATION' }
                    );
                }
            } catch (reErr) {}
            if (!recaptchaToken) {
                recaptchaToken = "token_" + Math.random().toString(36).substring(2);
            }
                
                const sessionId = crypto.randomUUID().toUpperCase();
                const clientCtx = [null, 22, null, null, null, projectId, null, null, null, null, [recaptchaToken, 1]];
                const seed = Math.floor(Math.random() * 2147483647);
                
                const req = [
                    null,
                    null,
                    null,
                    seed,
                    aspectCode,
                    'BELUGA',
                    null,
                    clientCtx,
                    [[[prompt]]],
                    null,
                    null,
                    null,
                    sessionId,
                    crypto.randomUUID().toUpperCase()
                ];
                
                const argument = [
                    null,
                    [req],
                    1,
                    clientCtx,
                    [sessionId]
                ];
                
                const rpcId = 'ogiZ0b';
                const fReq = JSON.stringify([[[rpcId, JSON.stringify(argument), null, 'generic']]]);
                const params = new URLSearchParams();
                params.append('f.req', fReq);
                if (snlm) {
                    params.append('at', snlm);
                }
                
                const reqId = Math.floor(Math.random() * 90000) + 10000;
                const rpcUrl = 'https://flow.google.com/_/AiSandboxAngularFrontend/data/batchexecute?rpcids=' + rpcId +
                               '&source-path=' + encodeURIComponent('/project/' + projectId) +
                               '&bl=' + encodeURIComponent(bl) +
                               '&f.sid=' + fsid +
                               '&hl=en&_reqid=' + reqId + '&rt=c';
                
                const resp = await fetch(rpcUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
                        'x-same-domain': '1'
                    },
                    body: params.toString()
                });
                
                const text = await resp.text();
                return { status: resp.status, full_text: text };
            }
            """

            result = await page.evaluate(js_code, {
                "projectId": PROJECT_ID,
                "prompt": prompt,
                "bl": bl,
                "fsid": fsid,
                "snlm": snlm,
                "aspectCode": aspect_code
            })

            full_text = result.get("full_text", "")
            
            # Parse batchexecute frames
            cdn_url = None
            for line in full_text.splitlines():
                line = line.strip()
                if not line.startswith("["):
                    continue
                try:
                    frame = json.loads(line)
                    for item in frame:
                        if isinstance(item, list) and len(item) >= 3 and item[0] == "wrb.fr" and item[1] == "ogiZ0b":
                            payload = json.loads(item[2])
                            cdn_url = _find_image_url(payload)
                            if cdn_url:
                                break
                    if cdn_url:
                        break
                except Exception:
                    continue

            if not cdn_url:
                # Check for errors in frames
                for line in full_text.splitlines():
                    if "PUBLIC_ERROR" in line or "ERROR_" in line:
                        raise RuntimeError(f"Google Flow RPC error: {line[:200]}")
                raise RuntimeError(f"Google Flow returned response but no image URL found: {full_text[:300]}")

            local_url = _download_and_save(cdn_url, ext="jpg", prefix="flow")
            return {
                "url": local_url,
                "remoteUrl": cdn_url,
                "provider": "Google Flow (Imagen 3)",
                "prompt": prompt
            }
        finally:
            await ctx.close()
            if browser_to_close:
                await browser_to_close.close()


def generate_image_google_flow(prompt: str, aspect_ratio: str = "SQUARE") -> dict:
    """
    Synchronous wrapper for Google Flow image generation.
    """
    return asyncio.run(_generate_flow_async(prompt, aspect_ratio))


if __name__ == "__main__":
    prompt_test = sys.argv[1] if len(sys.argv) > 1 else "A cute baby panda eating bamboo in a misty mountain forest"
    print(f"Testing Google Flow image generation with prompt: {prompt_test}")
    start = time.time()
    res = generate_image_google_flow(prompt_test)
    duration = time.time() - start
    print(f"Success in {duration:.1f}s!")
    print(json.dumps(res, indent=2))
