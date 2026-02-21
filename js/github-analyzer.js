/**
 * github-analyzer.js
 * Fetches summary metrics from the FastAPI GitHub Analyzer backend
 * and renders them into the #github-stats section.
 */

(function () {
  'use strict';

  const ENV = window.__ENV || {};
  const GITHUB_USERNAME = (ENV.GITHUB_USERNAME || '06navdeep06').trim().toLowerCase();
  const API_BASE = ENV.GITHUB_ANALYZER_URL || '/.netlify/functions/analyze';
  const GITHUB_PAT = ENV.GITHUB_PAT || '';

  /* ── DOM refs ─────────────────────────────────────────────────────────── */
  const section       = document.getElementById('github-stats');
  const loadingEl     = document.getElementById('analyzer-loading');
  const errorEl       = document.getElementById('analyzer-error');
  const errorMsg      = document.getElementById('analyzer-error-msg');
  const resultsEl     = document.getElementById('analyzer-results');
  const retryBtn      = document.getElementById('analyzer-retry-btn');

  const valRepos      = document.getElementById('val-repos');
  const valLoc        = document.getElementById('val-loc');
  const valStars      = document.getElementById('val-stars');
  const valQuality    = document.getElementById('val-quality');
  const langBars      = document.getElementById('lang-bars');
  const complexRings  = document.getElementById('complexity-rings');
  const topRepoList   = document.getElementById('top-repo-list');
  const cachedBadge   = document.getElementById('analyzer-cached');

  if (!section) return;

  /* ── State ────────────────────────────────────────────────────────────── */
  let fetched = false;

  const GH_PUBLIC_API = 'https://api.github.com';
  const FALLBACK_MAX_REPOS = 60;
  const FALLBACK_LANG_FETCH = 25;
  const REST_HEADERS = {
    'Accept': 'application/vnd.github+json',
    ...(GITHUB_PAT ? { Authorization: `Bearer ${GITHUB_PAT}` } : {}),
    'User-Agent': 'quazar-portfolio'
  };

  /* ── Helpers ──────────────────────────────────────────────────────────── */
  function show(el)  { el.style.display = ''; }
  function hide(el)  { el.style.display = 'none'; }

  function formatNumber(n) {
    if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
    if (n >= 1_000)     return (n / 1_000).toFixed(1) + 'k';
    return String(n);
  }

  function animateCount(el, target, duration = 1200) {
    const start = performance.now();
    const isFloat = String(target).includes('.');
    const from = 0;
    function step(now) {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = from + (target - from) * eased;
      el.textContent = isFloat ? current.toFixed(1) : formatNumber(Math.round(current));
      if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  /* ── Language colours (best-effort) ──────────────────────────────────── */
  const LANG_COLORS = {
    Python: '#3572A5', JavaScript: '#f1e05a', TypeScript: '#2b7489',
    'C++': '#f34b7d', C: '#555555', Java: '#b07219', Go: '#00ADD8',
    Rust: '#dea584', Ruby: '#701516', PHP: '#4F5D95', Swift: '#ffac45',
    Kotlin: '#F18E33', Shell: '#89e051', HTML: '#e34c26', CSS: '#563d7c',
    Dockerfile: '#384d54', Lua: '#000080', Scala: '#c22d40',
  };
  function langColor(name) {
    return LANG_COLORS[name] || '#6E00FF';
  }

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
    return Object.entries(languages || {}).reduce((sum, [lang, bytes]) => {
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
    } catch (_) {
      return 9999;
    }
  }

  function primaryLanguages(languages, topN = 3) {
    const total = Object.values(languages || {}).reduce((a, b) => a + b, 0) || 1;
    return Object.entries(languages || {})
      .sort((a, b) => b[1] - a[1])
      .slice(0, topN)
      .map(([name, bytes]) => ({ name, bytes, percentage: Math.round(bytes / total * 1000) / 10 }));
  }

  function analyzeRepoClient(repo, languages = {}) {
    let langMap = languages && Object.keys(languages).length ? languages : {};
    if (!Object.keys(langMap).length && repo.language) {
      langMap = { [repo.language]: Math.max(1, repo.size) * 1024 };
    }
    const loc = estimateLoc(langMap);
    const days = daysSince(repo.pushed_at || repo.updated_at);
    const weights = Object.keys(langMap).map(l => COMPLEXITY_WEIGHTS[l] || 3);
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
      primary_languages: primaryLanguages(langMap),
      all_languages: langMap,
      estimated_loc: loc,
      complexity_level: complexityLevel(loc, Object.keys(langMap).length, avgWeight),
      code_quality_score: codeQualityScore(repo, loc, langMap, days),
    };
  }

  async function ghPublicFetch(url) {
    const fullUrl = url.startsWith('http') ? url : `${GH_PUBLIC_API}${url}`;
    const options = { headers: REST_HEADERS };
    if (typeof AbortSignal !== 'undefined' && AbortSignal.timeout) {
      options.signal = AbortSignal.timeout(15_000);
    }
    const res = await fetch(fullUrl, options);
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      const detail = body.message || `GitHub API ${res.status}`;
      throw new Error(detail);
    }
    return res.json();
  }

  async function fetchPublicAnalysis(username) {
    const [userData, repoData] = await Promise.all([
      ghPublicFetch(`/users/${username}`),
      ghPublicFetch(`/users/${username}/repos?per_page=100&sort=updated&type=public`)
    ]);

    const ordered = [...repoData].sort((a, b) => new Date(b.pushed_at || b.updated_at) - new Date(a.pushed_at || a.updated_at));
    const limited = ordered.slice(0, FALLBACK_MAX_REPOS);

    const languagesList = await Promise.all(limited.map((repo, idx) => {
      if (idx >= FALLBACK_LANG_FETCH) return Promise.resolve({});
      return ghPublicFetch(repo.languages_url).catch(() => ({}));
    }));

    const analyzed = limited.map((repo, idx) => analyzeRepoClient(repo, languagesList[idx] || {}));

    const totals = analyzed.reduce((acc, repo) => {
      acc.loc += repo.estimated_loc;
      acc.stars += repo.stars;
      acc.forks += repo.forks;
      if (repo.is_fork) acc.forked++; else acc.original++;
      return acc;
    }, { loc: 0, stars: 0, forks: 0, original: 0, forked: 0 });

    const langTotals = {};
    languagesList.forEach(langs => {
      Object.entries(langs || {}).forEach(([name, bytes]) => {
        langTotals[name] = (langTotals[name] || 0) + bytes;
      });
    });
    const totalBytes = Object.values(langTotals).reduce((a, b) => a + b, 0) || 1;
    const topLanguages = Object.entries(langTotals)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([name, bytes]) => ({ name, bytes, percentage: Math.round(bytes / totalBytes * 1000) / 10 }));

    const complexityDist = { Beginner: 0, Intermediate: 0, Advanced: 0 };
    analyzed.forEach(r => { complexityDist[r.complexity_level] = (complexityDist[r.complexity_level] || 0) + 1; });

    const avgQuality = analyzed.length
      ? Math.round(analyzed.reduce((sum, r) => sum + r.code_quality_score, 0) / analyzed.length * 10) / 10
      : 0;

    return {
      fallback: true,
      cached: false,
      summary: {
        total_repos_analyzed: analyzed.length,
        original_repos: totals.original,
        forked_repos: totals.forked,
        total_estimated_loc: totals.loc,
        total_stars: totals.stars,
        total_forks: totals.forks,
        average_quality_score: avgQuality,
        complexity_distribution: complexityDist,
        top_languages: topLanguages,
      },
      repositories: analyzed.sort((a, b) => b.code_quality_score - a.code_quality_score),
      profile: {
        name: userData.name,
        avatar_url: userData.avatar_url,
        public_repos: userData.public_repos,
      }
    };
  }

  async function fetchViaPrimary() {
    const options = {
      signal: AbortSignal.timeout ? AbortSignal.timeout(20_000) : undefined,
    };
    const res = await fetch(`${API_BASE}?username=${GITHUB_USERNAME}`, options);
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body.detail || `HTTP ${res.status}`);
    }
    return res.json();
  }

  /* ── Render ───────────────────────────────────────────────────────────── */
  function render(data) {
    const s = data.summary;

    /* Cards */
    animateCount(valRepos,   s.total_repos_analyzed);
    animateCount(valLoc,     s.total_estimated_loc);
    animateCount(valStars,   s.total_stars);
    animateCount(valQuality, parseFloat(s.average_quality_score), 1400);

    /* Language bars */
    langBars.innerHTML = '';
    s.top_languages.slice(0, 8).forEach((lang, i) => {
      const row = document.createElement('div');
      row.className = 'lang-row';
      row.style.animationDelay = `${i * 80}ms`;
      row.innerHTML = `
        <div class="lang-meta">
          <span class="lang-dot" style="background:${langColor(lang.name)}"></span>
          <span class="lang-name">${lang.name}</span>
          <span class="lang-pct">${lang.percentage}%</span>
        </div>
        <div class="lang-track">
          <div class="lang-fill" style="--fill-pct:${lang.percentage}%; background:${langColor(lang.name)}"></div>
        </div>`;
      langBars.appendChild(row);
    });

    /* Complexity rings */
    complexRings.innerHTML = '';
    const dist = s.complexity_distribution;
    const total = Object.values(dist).reduce((a, b) => a + b, 0) || 1;
    const levels = [
      { key: 'Beginner',     color: 'var(--color-accent-3)' },
      { key: 'Intermediate', color: 'var(--color-accent-4)' },
      { key: 'Advanced',     color: 'var(--color-accent-1)' },
    ];
    levels.forEach(({ key, color }) => {
      const count = dist[key] || 0;
      const pct   = Math.round(count / total * 100);
      const circ  = 2 * Math.PI * 28; // r=28
      const dash  = (pct / 100) * circ;
      const ring  = document.createElement('div');
      ring.className = 'complexity-ring';
      ring.innerHTML = `
        <svg viewBox="0 0 64 64" class="ring-svg">
          <circle cx="32" cy="32" r="28" class="ring-track"/>
          <circle cx="32" cy="32" r="28" class="ring-fill"
            style="stroke:${color};stroke-dasharray:${dash} ${circ};stroke-dashoffset:${circ * 0.25}"
            data-dash="${dash}" data-circ="${circ}"/>
        </svg>
        <div class="ring-label">
          <span class="ring-count">${count}</span>
          <span class="ring-name">${key}</span>
        </div>`;
      complexRings.appendChild(ring);
    });

    /* Animate ring fills in after a tick */
    requestAnimationFrame(() => {
      document.querySelectorAll('.ring-fill').forEach(el => {
        el.style.transition = 'stroke-dasharray 1s cubic-bezier(0.4,0,0.2,1)';
      });
    });

    /* Top repos (top 5 by quality score) */
    topRepoList.innerHTML = '';
    data.repositories.slice(0, 5).forEach((repo, i) => {
      const item = document.createElement('a');
      item.className = 'top-repo-item';
      item.href = repo.url;
      item.target = '_blank';
      item.rel = 'noopener noreferrer';
      item.style.animationDelay = `${i * 100}ms`;

      const primaryLang = repo.primary_languages[0];
      const langBadge = primaryLang
        ? `<span class="repo-lang-dot" style="background:${langColor(primaryLang.name)}"></span><span>${primaryLang.name}</span>`
        : '';

      const scoreColor = repo.code_quality_score >= 70
        ? 'var(--color-accent-3)'
        : repo.code_quality_score >= 45
          ? 'var(--color-accent-4)'
          : 'var(--color-accent-1)';

      item.innerHTML = `
        <div class="repo-item-left">
          <span class="repo-item-name">${repo.name}</span>
          <div class="repo-item-meta">
            ${langBadge}
            <span class="repo-item-complexity complexity-${repo.complexity_level.toLowerCase()}">${repo.complexity_level}</span>
          </div>
        </div>
        <div class="repo-item-right">
          <div class="repo-score-ring">
            <svg viewBox="0 0 36 36" class="score-svg">
              <circle cx="18" cy="18" r="14" class="score-track"/>
              <circle cx="18" cy="18" r="14" class="score-fill"
                style="stroke:${scoreColor};
                       stroke-dasharray:${(repo.code_quality_score / 100) * 2 * Math.PI * 14} ${2 * Math.PI * 14};
                       stroke-dashoffset:${2 * Math.PI * 14 * 0.25}"/>
            </svg>
            <span class="score-num" style="color:${scoreColor}">${repo.code_quality_score}</span>
          </div>
        </div>`;
      topRepoList.appendChild(item);
    });

    /* Cached badge */
    if (data.fallback) {
      cachedBadge.textContent = '📡 live GitHub snapshot';
      cachedBadge.style.display = 'inline';
    } else if (data.cached) {
      cachedBadge.textContent = '⚡ cached response';
      cachedBadge.style.display = 'inline';
    } else {
      cachedBadge.style.display = 'none';
    }

    hide(loadingEl);
    hide(errorEl);
    show(resultsEl);
  }

  /* ── Fetch ────────────────────────────────────────────────────────────── */
  async function fetchAnalysis() {
    hide(errorEl);
    hide(resultsEl);
    show(loadingEl);

    try {
      const primaryData = await fetchViaPrimary();
      render(primaryData);
      return;
    } catch (primaryErr) {
      console.warn('Primary analyzer unavailable, falling back to public GitHub API.', primaryErr);
    }

    try {
      const fallbackData = await fetchPublicAnalysis(GITHUB_USERNAME);
      render(fallbackData);
    } catch (fallbackErr) {
      hide(loadingEl);
      errorMsg.textContent = `GitHub data unavailable: ${fallbackErr.message}`;
      show(errorEl);
    }
  }

  /* ── Lazy load on scroll into view ───────────────────────────────────── */
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !fetched) {
        fetched = true;
        observer.disconnect();
        fetchAnalysis();
      }
    });
  }, { threshold: 0.1 });

  observer.observe(section);

  /* ── Retry button ─────────────────────────────────────────────────────── */
  if (retryBtn) {
    retryBtn.addEventListener('click', () => {
      fetched = true;
      fetchAnalysis();
    });
  }
})();
