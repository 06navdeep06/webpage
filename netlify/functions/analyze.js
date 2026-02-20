/**
 * Netlify Function: /analyze
 * Ports the FastAPI GitHub Analyzer logic to a serverless JS function.
 * Uses GITHUB_TOKEN from Netlify environment variables.
 *
 * Query params:
 *   username (required)  — GitHub username to analyze
 *   refresh  (optional)  — bypass in-process cache
 */

const GITHUB_API = 'https://api.github.com';
const MAX_REPOS  = 100;
const TIMEOUT_MS = 15_000;

/* ── In-process cache (lives for the duration of the Lambda warm instance) */
const _cache = new Map();
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

function cacheGet(key) {
  const entry = _cache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) { _cache.delete(key); return null; }
  return entry.value;
}
function cacheSet(key, value) {
  _cache.set(key, { value, expiresAt: Date.now() + CACHE_TTL_MS });
}

/* ── GitHub fetch helpers ─────────────────────────────────────────────── */
function authHeaders(token) {
  const h = {
    'Accept': 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
    'User-Agent': 'netlify-github-analyzer',
  };
  if (token) h['Authorization'] = `Bearer ${token}`;
  return h;
}

async function ghFetch(url, token, params = {}) {
  const qs = new URLSearchParams(params).toString();
  const fullUrl = qs ? `${url}?${qs}` : url;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(fullUrl, { headers: authHeaders(token), signal: controller.signal });
    clearTimeout(timer);
    if (res.status === 401) throw { status: 401, message: 'GitHub token invalid or missing.' };
    if (res.status === 403) {
      const reset = res.headers.get('X-RateLimit-Reset') || 'unknown';
      throw { status: 429, message: `GitHub rate limit exceeded. Resets at epoch ${reset}.` };
    }
    if (res.status === 404) throw { status: 404, message: 'GitHub user not found.' };
    if (!res.ok) throw { status: 502, message: `GitHub API error ${res.status}` };
    return res.json();
  } catch (err) {
    clearTimeout(timer);
    if (err.name === 'AbortError') throw { status: 504, message: 'GitHub API request timed out.' };
    throw err;
  }
}

async function fetchRepos(username, token) {
  const repos = [];
  let page = 1;
  while (repos.length < MAX_REPOS) {
    const batch = await ghFetch(
      `${GITHUB_API}/users/${username}/repos`, token,
      { per_page: 100, page, sort: 'updated', type: 'public' }
    );
    if (!batch.length) break;
    repos.push(...batch);
    if (batch.length < 100) break;
    page++;
  }
  return repos.slice(0, MAX_REPOS);
}

async function fetchLanguages(username, repo, token) {
  try {
    return await ghFetch(`${GITHUB_API}/repos/${username}/${repo}/languages`, token);
  } catch (_) { return {}; }
}

async function fetchUser(username, token) {
  return ghFetch(`${GITHUB_API}/users/${username}`, token);
}

/* ── Analysis logic (ported from Python analyzer.py) ─────────────────── */
const COMPLEXITY_WEIGHTS = {
  Assembly:10, C:9, 'C++':9, Rust:9, Haskell:9,
  Scala:8, Go:7, Java:7, Kotlin:7, Swift:7,
  TypeScript:6, Python:6, Ruby:5, JavaScript:5,
  PHP:4, Dart:4, Lua:4, HTML:2, CSS:2, Shell:3, Dockerfile:2,
};

const BYTES_PER_LINE = {
  Python:35, JavaScript:40, TypeScript:42, Java:50,
  C:45, 'C++':48, Go:38, Rust:42, Ruby:32,
  PHP:38, Swift:40, Kotlin:45, Scala:48,
  HTML:60, CSS:30, Shell:28,
};
const DEFAULT_BPL = 40;

function estimateLoc(languages) {
  return Object.entries(languages).reduce((sum, [lang, bytes]) => {
    return sum + Math.floor(bytes / (BYTES_PER_LINE[lang] || DEFAULT_BPL));
  }, 0);
}

function complexityLevel(loc, langCount, avgWeight) {
  if (loc < 300 && avgWeight < 4) return 'Beginner';
  if (loc < 2000 && avgWeight < 6) return 'Intermediate';
  return 'Advanced';
}

function codeQualityScore(repo, loc, languages, daysSinceUpdate) {
  let score = 0;
  if (repo.description)                     score += 10;
  if (repo.topics?.length)                  score += Math.min(repo.topics.length * 2, 10);
  if (repo.license)                         score += 10;
  if (repo.has_wiki || repo.has_pages)      score += 5;
  const stars = repo.stargazers_count || 0;
  const forks = repo.forks_count || 0;
  score += Math.min((stars + forks * 2) * 2, 15);
  if (loc >= 500 && loc <= 20_000)          score += 20;
  else if ((loc >= 100 && loc < 500) || (loc > 20_000 && loc <= 50_000)) score += 10;
  else if (loc > 0)                         score += 5;
  score += Math.min(Object.keys(languages).length * 3, 10);
  if (daysSinceUpdate <= 30)       score += 20;
  else if (daysSinceUpdate <= 90)  score += 14;
  else if (daysSinceUpdate <= 365) score += 7;
  return Math.min(score, 100);
}

function daysSince(isoDate) {
  if (!isoDate) return 9999;
  try {
    return Math.floor((Date.now() - new Date(isoDate).getTime()) / 86_400_000);
  } catch (_) { return 9999; }
}

function primaryLanguages(languages, topN = 3) {
  const total = Object.values(languages).reduce((a, b) => a + b, 0) || 1;
  return Object.entries(languages)
    .sort((a, b) => b[1] - a[1])
    .slice(0, topN)
    .map(([name, bytes]) => ({ name, bytes, percentage: Math.round(bytes / total * 1000) / 10 }));
}

function analyzeRepo(repo, languages) {
  const loc = estimateLoc(languages);
  const days = daysSince(repo.pushed_at || repo.updated_at);
  const weights = Object.keys(languages).map(l => COMPLEXITY_WEIGHTS[l] || 3);
  const avgWeight = weights.length ? weights.reduce((a, b) => a + b, 0) / weights.length : 3;

  return {
    name: repo.name,
    full_name: repo.full_name,
    description: repo.description || null,
    url: repo.html_url,
    homepage: repo.homepage || null,
    topics: repo.topics || [],
    stars: repo.stargazers_count || 0,
    forks: repo.forks_count || 0,
    open_issues: repo.open_issues_count || 0,
    is_fork: repo.fork || false,
    license: repo.license?.spdx_id || null,
    created_at: repo.created_at,
    last_pushed: repo.pushed_at,
    days_since_update: days,
    primary_languages: primaryLanguages(languages),
    all_languages: languages,
    estimated_loc: loc,
    complexity_level: complexityLevel(loc, Object.keys(languages).length, avgWeight),
    code_quality_score: codeQualityScore(repo, loc, languages, days),
  };
}

async function analyzeUser(username, token) {
  const [userData, repos] = await Promise.all([
    fetchUser(username, token),
    fetchRepos(username, token),
  ]);

  const originals = repos.filter(r => !r.fork);
  const forks     = repos.filter(r => r.fork);
  const ordered   = [...originals, ...forks];

  const allLanguages = await Promise.all(
    ordered.map(r => fetchLanguages(username, r.name, token))
  );

  const analyzed = ordered.map((repo, i) => analyzeRepo(repo, allLanguages[i]));

  const totalLoc   = analyzed.reduce((s, r) => s + r.estimated_loc, 0);
  const totalStars = analyzed.reduce((s, r) => s + r.stars, 0);
  const totalForks = analyzed.reduce((s, r) => s + r.forks, 0);

  const langTotals = {};
  allLanguages.forEach(langs => {
    Object.entries(langs).forEach(([l, b]) => { langTotals[l] = (langTotals[l] || 0) + b; });
  });
  const totalBytes = Object.values(langTotals).reduce((a, b) => a + b, 0) || 1;
  const topLanguages = Object.entries(langTotals)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([name, bytes]) => ({ name, bytes, percentage: Math.round(bytes / totalBytes * 1000) / 10 }));

  const complexityDist = { Beginner: 0, Intermediate: 0, Advanced: 0 };
  analyzed.forEach(r => { complexityDist[r.complexity_level]++; });

  const avgQuality = analyzed.length
    ? Math.round(analyzed.reduce((s, r) => s + r.code_quality_score, 0) / analyzed.length * 10) / 10
    : 0;

  return {
    username,
    profile: {
      name: userData.name,
      bio: userData.bio,
      avatar_url: userData.avatar_url,
      public_repos: userData.public_repos || 0,
      followers: userData.followers || 0,
      following: userData.following || 0,
      location: userData.location,
      blog: userData.blog || null,
      github_url: userData.html_url,
    },
    summary: {
      total_repos_analyzed: analyzed.length,
      original_repos: originals.length,
      forked_repos: forks.length,
      total_estimated_loc: totalLoc,
      total_stars: totalStars,
      total_forks: totalForks,
      average_quality_score: avgQuality,
      complexity_distribution: complexityDist,
      top_languages: topLanguages,
    },
    repositories: [...analyzed].sort((a, b) => b.code_quality_score - a.code_quality_score),
  };
}

/* ── Netlify handler ──────────────────────────────────────────────────── */
export async function handler(event) {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: corsHeaders, body: '' };
  }

  const username = (event.queryStringParameters?.username || '').trim().toLowerCase();
  const refresh  = event.queryStringParameters?.refresh === 'true';

  if (!username) {
    return {
      statusCode: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      body: JSON.stringify({ detail: 'Missing required query param: username' }),
    };
  }

  const cacheKey = `analyze:${username}`;
  if (!refresh) {
    const cached = cacheGet(cacheKey);
    if (cached) {
      return {
        statusCode: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...cached, cached: true }),
      };
    }
  }

  const token = process.env.GITHUB_TOKEN || '';

  try {
    const result = await analyzeUser(username, token);
    cacheSet(cacheKey, result);
    return {
      statusCode: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...result, cached: false }),
    };
  } catch (err) {
    const status  = err.status  || 500;
    const message = err.message || 'Unexpected error';
    return {
      statusCode: status,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      body: JSON.stringify({ detail: message }),
    };
  }
}
