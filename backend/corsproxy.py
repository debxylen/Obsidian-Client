from fastapi import APIRouter, Request, Response
from fastapi.middleware.cors import CORSMiddleware
import httpx

router = APIRouter()

client = httpx.AsyncClient(follow_redirects=True)

@router.api_route("/proxy/{url:path}", methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS", "HEAD"])
async def proxy(url: str, request: Request):
    target_url = url
    body = await request.body()
    
    headers = {}
    for k, v in request.headers.items():
        k_lower = k.lower()
        if k_lower in {"host", "content-length", "connection"}:
            continue
        
        if k_lower == "x-cookie":
            headers["cookie"] = v
        else:
            headers[k] = v

    resp = await client.request(
        method=request.method,
        url=target_url,
        headers=headers,
        content=body,
        params=request.query_params,
    )

    excluded = {
        "content-encoding",
        "transfer-encoding",
        "connection",
    }

    response_headers = {
        k: v for k, v in resp.headers.items()
        if k.lower() not in excluded
    }

    return Response(
        content=resp.content,
        status_code=resp.status_code,
        headers=response_headers,
    )
