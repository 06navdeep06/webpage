import httpx
from typing import Any
from app.config import get_settings

GITHUB_API = "https://api.github.com"


def _auth_headers() -> dict[str, str]:
    settings = get_settings()
    headers = {
        "Accept": "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
    }
    if settings.github_token:
        headers["Authorization"] = f"Bearer {settings.github_token}"
    return headers


async def fetch_repos(client: httpx.AsyncClient, username: str) -> list[dict]:
    settings = get_settings()
    repos: list[dict] = []
    page = 1

    while len(repos) < settings.max_repos:
        resp = await client.get(
            f"{GITHUB_API}/users/{username}/repos",
            headers=_auth_headers(),
            params={"per_page": 100, "page": page, "sort": "updated", "type": "public"},
            timeout=settings.request_timeout,
        )
        _raise_for_status(resp)
        batch = resp.json()
        if not batch:
            break
        repos.extend(batch)
        if len(batch) < 100:
            break
        page += 1

    return repos[: settings.max_repos]


async def fetch_languages(client: httpx.AsyncClient, username: str, repo: str) -> dict[str, int]:
    settings = get_settings()
    resp = await client.get(
        f"{GITHUB_API}/repos/{username}/{repo}/languages",
        headers=_auth_headers(),
        timeout=settings.request_timeout,
    )
    if resp.status_code == 404:
        return {}
    _raise_for_status(resp)
    return resp.json()


async def fetch_user(client: httpx.AsyncClient, username: str) -> dict[str, Any]:
    settings = get_settings()
    resp = await client.get(
        f"{GITHUB_API}/users/{username}",
        headers=_auth_headers(),
        timeout=settings.request_timeout,
    )
    _raise_for_status(resp)
    return resp.json()


def _raise_for_status(resp: httpx.Response) -> None:
    if resp.status_code == 401:
        raise PermissionError("GitHub token invalid or missing.")
    if resp.status_code == 403:
        reset = resp.headers.get("X-RateLimit-Reset", "unknown")
        raise RuntimeError(f"GitHub rate limit exceeded. Resets at epoch {reset}.")
    if resp.status_code == 404:
        raise LookupError("GitHub user not found.")
    if resp.status_code >= 400:
        raise RuntimeError(f"GitHub API error {resp.status_code}: {resp.text[:200]}")
