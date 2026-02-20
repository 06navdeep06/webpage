# GitHub Repository Analyzer API

FastAPI backend that analyzes a GitHub user's public repositories and returns structured project insights for portfolio consumption.

## Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/health` | Health check + uptime |
| `GET` | `/analyze/{username}` | Full repo analysis for a GitHub user |
| `GET` | `/docs` | Swagger UI |

### Query params for `/analyze/{username}`

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `refresh` | bool | `false` | Bypass cache and re-fetch from GitHub |

### Example response shape

```json
{
  "username": "06navdeep06",
  "cached": false,
  "profile": {
    "name": "Navdeep",
    "bio": "...",
    "avatar_url": "...",
    "public_repos": 12,
    "followers": 5
  },
  "summary": {
    "total_repos_analyzed": 12,
    "total_estimated_loc": 18400,
    "total_stars": 7,
    "average_quality_score": 61.3,
    "complexity_distribution": { "Beginner": 3, "Intermediate": 7, "Advanced": 2 },
    "top_languages": [
      { "name": "Python", "bytes": 142000, "percentage": 54.2 }
    ]
  },
  "repositories": [
    {
      "name": "my-repo",
      "description": "...",
      "url": "https://github.com/...",
      "primary_languages": [{ "name": "Python", "bytes": 48000, "percentage": 91.2 }],
      "estimated_loc": 1371,
      "complexity_level": "Intermediate",
      "code_quality_score": 74,
      "stars": 2,
      "days_since_update": 14
    }
  ]
}
```

## Setup

```bash
# 1. Clone and enter directory
cd github-analyzer

# 2. Create virtual environment
python -m venv .venv
.venv\Scripts\activate        # Windows
# source .venv/bin/activate   # Linux/macOS

# 3. Install dependencies
pip install -r requirements.txt

# 4. Configure environment
cp .env.example .env
# Edit .env and set GITHUB_TOKEN

# 5. Run
uvicorn app.main:app --reload --port 8000
```

API will be live at `http://localhost:8000`.

## Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `GITHUB_TOKEN` | Yes | — | GitHub personal access token (read:public_repo scope) |
| `CACHE_TTL_SECONDS` | No | `300` | How long to cache responses (seconds) |
| `REQUEST_TIMEOUT` | No | `15` | Per-request timeout to GitHub API |
| `MAX_REPOS` | No | `100` | Max repos fetched per user |

## Frontend Usage (Netlify)

The `GITHUB_TOKEN` is already set as a Netlify environment variable. When deploying this API (e.g. on Railway, Render, or Fly.io), set the same token there.

```js
// Fetch analysis for a user
const res = await fetch('https://your-api.railway.app/analyze/06navdeep06');
const data = await res.json();

console.log(data.summary.top_languages);
console.log(data.repositories[0].code_quality_score);
```

```js
// Force refresh (bypass cache)
const res = await fetch('https://your-api.railway.app/analyze/06navdeep06?refresh=true');
```

## Complexity Scoring

| Level | Criteria |
|-------|----------|
| Beginner | < 300 LOC, low-weight languages |
| Intermediate | 300–2000 LOC or moderate language complexity |
| Advanced | > 2000 LOC or high-weight languages (Rust, C, C++, etc.) |

## Code Quality Score (0–100)

Computed from: description presence, topics/tags, license, stars/forks, LOC size sweet-spot, language diversity, and recency of last push.
