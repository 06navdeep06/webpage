from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routes.analyze import router as analyze_router
from app.routes.health import router as health_router

app = FastAPI(
    title="GitHub Repository Analyzer",
    description="Analyzes GitHub repositories and exposes project insights for portfolio consumption.",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS — allow Netlify frontend and local dev
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://thequazar.com",
        "https://*.netlify.app",
        "http://localhost:3000",
        "http://localhost:5173",
        "http://127.0.0.1:5500",
    ],
    allow_origin_regex=r"https://.*\.netlify\.app",
    allow_credentials=False,
    allow_methods=["GET"],
    allow_headers=["*"],
)

app.include_router(health_router, tags=["meta"])
app.include_router(analyze_router, tags=["analyze"])


@app.get("/", include_in_schema=False)
async def root():
    return {"message": "GitHub Analyzer API — see /docs"}
