from fastapi import APIRouter, HTTPException, Query
from fastapi.responses import JSONResponse

from app.analyzer import analyze_user
from app.cache import TTLCache
from app.config import get_settings

router = APIRouter()
_cache = TTLCache(ttl=get_settings().cache_ttl_seconds)


@router.get("/analyze/{username}", summary="Analyze a GitHub user's repositories")
async def analyze(
    username: str,
    refresh: bool = Query(False, description="Force bypass cache"),
) -> JSONResponse:
    cache_key = f"analyze:{username.lower()}"

    if not refresh:
        cached = _cache.get(cache_key)
        if cached is not None:
            return JSONResponse(content={**cached, "cached": True})

    try:
        result = await analyze_user(username)
    except LookupError as exc:
        raise HTTPException(status_code=404, detail=str(exc))
    except PermissionError as exc:
        raise HTTPException(status_code=401, detail=str(exc))
    except RuntimeError as exc:
        msg = str(exc)
        if "rate limit" in msg.lower():
            raise HTTPException(status_code=429, detail=msg)
        raise HTTPException(status_code=502, detail=msg)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Unexpected error: {exc}")

    _cache.set(cache_key, result)
    return JSONResponse(content={**result, "cached": False})
