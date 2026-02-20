import os
from functools import lru_cache
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    github_token: str = os.getenv("GITHUB_TOKEN", "")
    cache_ttl_seconds: int = 300          # 5 minutes
    request_timeout: int = 15            # seconds per GitHub API call
    max_repos: int = 100                 # cap repos fetched per user

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


@lru_cache
def get_settings() -> Settings:
    return Settings()
