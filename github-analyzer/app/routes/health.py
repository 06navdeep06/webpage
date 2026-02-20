import time
from fastapi import APIRouter
from fastapi.responses import JSONResponse

from app.config import get_settings

router = APIRouter()
_start_time = time.time()


@router.get("/health", summary="Health check")
async def health() -> JSONResponse:
    settings = get_settings()
    return JSONResponse(content={
        "status": "ok",
        "uptime_seconds": round(time.time() - _start_time, 1),
        "github_token_configured": bool(settings.github_token),
        "cache_ttl_seconds": settings.cache_ttl_seconds,
    })
