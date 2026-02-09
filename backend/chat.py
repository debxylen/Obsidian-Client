import asyncio, hashlib, json, random, re, time, uuid, base64, sys
from datetime import datetime, timedelta, timezone
from html.parser import HTMLParser
from curl_cffi.requests import AsyncSession
from fastapi import APIRouter
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import Optional

if sys.platform == 'win32': asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())

router = APIRouter()

CHATGPT_BASE = "https://chatgpt.com"
OAI_LANG = "en-US"

class ChatRequest(BaseModel):
    token: str
    message: str
    conv_id: Optional[str] = None
    parent_id: Optional[str] = None
    message_id: Optional[str] = None
    cookies: Optional[str] = None

def get_headers(token=None, ua=None, cookies=None):
    headers = {
        'accept': '*/*',
        'accept-language': 'en-PH,en-GB;q=0.9,en-US;q=0.8,en;q=0.7,fil;q=0.6',
        'cache-control': 'no-cache',
        'oai-client-build-number': '4480993',
        'oai-client-version': 'prod-7c2e8d83df2cf0b6eaa11ba7b37f1605384da182',
        'oai-device-id': 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx',
        'oai-language': 'en-US',
        'pragma': 'no-cache',
        'origin': 'https://chatgpt.com',
        'priority': 'u=1, i',
        'referer': 'https://chatgpt.com/',
        'sec-ch-ua': '"Not(A:Brand";v="8", "Chromium";v="144", "Google Chrome";v="144"',
        'sec-ch-ua-arch': '"x86"',
        'sec-ch-ua-bitness': '"64"',
        'sec-ch-ua-full-version': '"144.0.7559.133"',
        'sec-ch-ua-full-version-list': '"Not(A:Brand";v="8.0.0.0", "Chromium";v="144.0.7559.133", "Google Chrome";v="144.0.7559.133"',
        'sec-ch-ua-mobile': '?0',
        'sec-ch-ua-model': '""',
        'sec-ch-ua-platform': '"Windows"',
        'sec-ch-ua-platform-version': '"10.0.0"',
        'sec-fetch-dest': 'empty',
        'sec-fetch-mode': 'cors',
        'sec-fetch-site': 'same-origin',
        'user-agent': ua or 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36',
    }
    if token:
        headers['authorization'] = f'Bearer {token}'
    if cookies:
        headers['cookie'] = cookies
    else:
        headers['cookie'] = 'oai-did=xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'
    return headers

class ScriptParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.scripts, self.dpl = [], ""
    
    def handle_starttag(self, tag, attrs):
        if tag == "script":
            d = dict(attrs)
            if "src" in d:
                self.scripts.append(d["src"])
                m = re.search(r"c/[^/]*/_", d["src"])
                if m: self.dpl = m.group(0)

async def get_sentinel_data(session, cookies=None):
    r = await session.get(f"{CHATGPT_BASE}/", headers=get_headers(cookies=cookies))
    r.raise_for_status()
    
    p = ScriptParser()
    p.feed(r.text)
    
    dpl = p.dpl or (re.search(r'data-build="([^"]*)"', r.text).group(1) if re.search(r'data-build="([^"]*)"', r.text) else "prod-f501fe933b3edf57aea882da888e1a544df99840") # type:ignore
    scripts = p.scripts or ["https://chatgpt.com/backend-api/sentinel/sdk.js"]
    return dpl, scripts

def get_pow_config(ua, dpl, scripts):
    now = datetime.now(timezone(timedelta(hours=-5))).strftime("%a %b %d %Y %H:%M:%S") + " GMT-0500 (Eastern Standard Time)"
    return [
        random.choice([3000, 4000]), now, 4294705152, 0, ua,
        random.choice(scripts), dpl, "en-US", "en-US,en", 0,
        "webdriver−false", "location", "window", time.perf_counter() * 1000,
        str(uuid.uuid4()), "", random.choice([8, 16, 32]), 
        time.time() * 1000 - (time.perf_counter() * 1000)
    ]

def solve_pow(seed, diff, config):
    d_len, s_enc, t_diff = len(diff), seed.encode(), bytes.fromhex(diff)
    
    p1 = (json.dumps(config[:3], separators=(',', ':'))[:-1] + ',').encode()
    p2 = (',' + json.dumps(config[4:9], separators=(',', ':'))[1:-1] + ',').encode()
    p3 = (',' + json.dumps(config[10:], separators=(',', ':'))[1:]).encode()

    for i in range(500000):
        final = p1 + str(i).encode() + p2 + str(i >> 1).encode() + p3
        enc = base64.b64encode(final)
        if hashlib.sha3_512(s_enc + enc).digest()[:d_len] <= t_diff: return enc.decode(), True
    return "", False

async def get_req_token(config):
    ans, _ = solve_pow(str(random.random()), "0fffff", config)
    return 'gAAAAAC' + ans

async def stream_chat(token, message, conv_id=None, parent_id=None, message_id=None, cookies=None):
    ua = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36"
    
    async with AsyncSession(impersonate="chrome110") as s:
        dpl, scripts = await get_sentinel_data(s, cookies=cookies)
        conf = get_pow_config(ua, dpl, scripts)
        
        p_tok = await get_req_token(conf)
        res = await s.post(f"{CHATGPT_BASE}/backend-api/sentinel/chat-requirements", headers=get_headers(token, ua, cookies=cookies), json={'p': p_tok})
        if res.status_code != 200: yield f"Error: {res.text}"; return
            
        data, proof = res.json(), None
        pow_d = data.get('proofofwork', {})
        
        if pow_d.get('required'):
            ans, ok = solve_pow(pow_d.get('seed'), pow_d.get('difficulty'), conf)
            if ok: proof = "gAAAAAB" + ans
        
        payload = {
            "action": "next", "parent_message_id": parent_id or str(uuid.uuid4()),
            "model": "auto", "timezone_offset_min": -480, "history_and_training_disabled": False,
            "force_paragen": False, "force_rate_limit": False, "force_use_sse": True,
            "messages": [{"id": message_id or str(uuid.uuid4()), "author": {"role": "user"}, "content": {"content_type": "text", "parts": [message]}}],
            "conversation_mode": {"kind": "primary_assistant"}, "websocket_request_id": str(uuid.uuid4())
        }
        if conv_id: payload["conversation_id"] = conv_id

        h = get_headers(token, ua, cookies=cookies)
        h.update({'accept': 'text/event-stream', 'openai-sentinel-chat-requirements-token': data.get('token'), 'openai-sentinel-proof-token': proof})

        resp = await s.post(f"{CHATGPT_BASE}/backend-api/conversation", headers=h, json=payload, stream=True)
        async for line in resp.aiter_lines():
            line = line.decode("utf-8")
            if line.startswith("data: "):
                if "[DONE]" in line: break
                yield line + "\n\n"

@router.post("/chat")
async def chat_endpoint(req: ChatRequest):
    return StreamingResponse(stream_chat(req.token, req.message, req.conv_id, req.parent_id, req.message_id, req.cookies), media_type="text/event-stream")
