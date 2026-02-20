from __future__ import annotations

import asyncio
from datetime import datetime, timezone
from typing import Any

import httpx

from app.github_client import fetch_languages, fetch_repos, fetch_user

# Languages weighted by typical complexity / ecosystem depth
COMPLEXITY_WEIGHTS: dict[str, int] = {
    "Assembly": 10, "C": 9, "C++": 9, "Rust": 9, "Haskell": 9,
    "Scala": 8, "Go": 7, "Java": 7, "Kotlin": 7, "Swift": 7,
    "TypeScript": 6, "Python": 6, "Ruby": 5, "JavaScript": 5,
    "PHP": 4, "Dart": 4, "Lua": 4,
    "HTML": 2, "CSS": 2, "Shell": 3, "Dockerfile": 2,
}

# Approximate bytes-per-line for LOC estimation
BYTES_PER_LINE: dict[str, float] = {
    "Python": 35, "JavaScript": 40, "TypeScript": 42, "Java": 50,
    "C": 45, "C++": 48, "Go": 38, "Rust": 42, "Ruby": 32,
    "PHP": 38, "Swift": 40, "Kotlin": 45, "Scala": 48,
    "HTML": 60, "CSS": 30, "Shell": 28,
}
DEFAULT_BYTES_PER_LINE = 40


def _estimate_loc(languages: dict[str, int]) -> int:
    total = 0
    for lang, byte_count in languages.items():
        bpl = BYTES_PER_LINE.get(lang, DEFAULT_BYTES_PER_LINE)
        total += int(byte_count / bpl)
    return total


def _complexity_level(loc: int, lang_count: int, complexity_score: float) -> str:
    if loc < 300 and complexity_score < 4:
        return "Beginner"
    if loc < 2000 and complexity_score < 6:
        return "Intermediate"
    return "Advanced"


def _code_quality_score(
    repo: dict[str, Any],
    loc: int,
    languages: dict[str, int],
    days_since_update: int,
) -> int:
    score = 0

    # Has description (10 pts)
    if repo.get("description"):
        score += 10

    # Has topics/tags (10 pts)
    if repo.get("topics"):
        score += min(len(repo["topics"]) * 2, 10)

    # Has a license (10 pts)
    if repo.get("license"):
        score += 10

    # Has wiki or pages (5 pts)
    if repo.get("has_wiki") or repo.get("has_pages"):
        score += 5

    # Stars & forks (up to 15 pts)
    stars = repo.get("stargazers_count", 0)
    forks = repo.get("forks_count", 0)
    score += min((stars + forks * 2) * 2, 15)

    # LOC size — sweet spot 500–20000 (up to 20 pts)
    if 500 <= loc <= 20_000:
        score += 20
    elif 100 <= loc < 500 or 20_000 < loc <= 50_000:
        score += 10
    elif loc > 0:
        score += 5

    # Multi-language (up to 10 pts)
    score += min(len(languages) * 3, 10)

    # Recency (up to 20 pts)
    if days_since_update <= 30:
        score += 20
    elif days_since_update <= 90:
        score += 14
    elif days_since_update <= 365:
        score += 7

    return min(score, 100)


def _days_since(iso_date: str | None) -> int:
    if not iso_date:
        return 9999
    try:
        dt = datetime.fromisoformat(iso_date.replace("Z", "+00:00"))
        return (datetime.now(timezone.utc) - dt).days
    except ValueError:
        return 9999


def _primary_languages(languages: dict[str, int], top_n: int = 3) -> list[dict]:
    total_bytes = sum(languages.values()) or 1
    sorted_langs = sorted(languages.items(), key=lambda x: x[1], reverse=True)
    return [
        {"name": lang, "bytes": b, "percentage": round(b / total_bytes * 100, 1)}
        for lang, b in sorted_langs[:top_n]
    ]


def _analyze_repo(repo: dict[str, Any], languages: dict[str, int]) -> dict[str, Any]:
    loc = _estimate_loc(languages)
    days_since_update = _days_since(repo.get("pushed_at") or repo.get("updated_at"))

    lang_weights = [COMPLEXITY_WEIGHTS.get(l, 3) for l in languages]
    avg_complexity = sum(lang_weights) / len(lang_weights) if lang_weights else 3

    complexity_level = _complexity_level(loc, len(languages), avg_complexity)
    quality_score = _code_quality_score(repo, loc, languages, days_since_update)

    return {
        "name": repo["name"],
        "full_name": repo["full_name"],
        "description": repo.get("description"),
        "url": repo["html_url"],
        "homepage": repo.get("homepage") or None,
        "topics": repo.get("topics", []),
        "stars": repo.get("stargazers_count", 0),
        "forks": repo.get("forks_count", 0),
        "open_issues": repo.get("open_issues_count", 0),
        "is_fork": repo.get("fork", False),
        "license": repo["license"]["spdx_id"] if repo.get("license") else None,
        "created_at": repo.get("created_at"),
        "last_pushed": repo.get("pushed_at"),
        "days_since_update": days_since_update,
        "primary_languages": _primary_languages(languages),
        "all_languages": languages,
        "estimated_loc": loc,
        "complexity_level": complexity_level,
        "code_quality_score": quality_score,
    }


async def analyze_user(username: str) -> dict[str, Any]:
    async with httpx.AsyncClient(follow_redirects=True) as client:
        user_data, repos = await asyncio.gather(
            fetch_user(client, username),
            fetch_repos(client, username),
        )

        # Fetch languages for all repos concurrently (non-fork originals first)
        original_repos = [r for r in repos if not r.get("fork")]
        forked_repos = [r for r in repos if r.get("fork")]
        ordered_repos = original_repos + forked_repos

        lang_tasks = [
            fetch_languages(client, username, r["name"]) for r in ordered_repos
        ]
        all_languages: list[dict[str, int]] = await asyncio.gather(*lang_tasks)

    analyzed = [
        _analyze_repo(repo, langs)
        for repo, langs in zip(ordered_repos, all_languages)
    ]

    # Aggregate stats
    total_loc = sum(r["estimated_loc"] for r in analyzed)
    total_stars = sum(r["stars"] for r in analyzed)
    total_forks = sum(r["forks"] for r in analyzed)

    lang_totals: dict[str, int] = {}
    for langs in all_languages:
        for lang, b in langs.items():
            lang_totals[lang] = lang_totals.get(lang, 0) + b

    top_languages = sorted(lang_totals.items(), key=lambda x: x[1], reverse=True)
    total_bytes = sum(lang_totals.values()) or 1

    complexity_dist = {"Beginner": 0, "Intermediate": 0, "Advanced": 0}
    for r in analyzed:
        complexity_dist[r["complexity_level"]] += 1

    avg_quality = (
        round(sum(r["code_quality_score"] for r in analyzed) / len(analyzed), 1)
        if analyzed else 0
    )

    return {
        "username": username,
        "profile": {
            "name": user_data.get("name"),
            "bio": user_data.get("bio"),
            "avatar_url": user_data.get("avatar_url"),
            "public_repos": user_data.get("public_repos", 0),
            "followers": user_data.get("followers", 0),
            "following": user_data.get("following", 0),
            "location": user_data.get("location"),
            "blog": user_data.get("blog") or None,
            "github_url": user_data.get("html_url"),
        },
        "summary": {
            "total_repos_analyzed": len(analyzed),
            "original_repos": len(original_repos),
            "forked_repos": len(forked_repos),
            "total_estimated_loc": total_loc,
            "total_stars": total_stars,
            "total_forks": total_forks,
            "average_quality_score": avg_quality,
            "complexity_distribution": complexity_dist,
            "top_languages": [
                {
                    "name": lang,
                    "bytes": b,
                    "percentage": round(b / total_bytes * 100, 1),
                }
                for lang, b in top_languages[:10]
            ],
        },
        "repositories": sorted(analyzed, key=lambda r: r["code_quality_score"], reverse=True),
    }
