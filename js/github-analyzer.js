/**
 * github-analyzer.js
 * Fetches summary metrics from the FastAPI GitHub Analyzer backend
 * and renders them into the #github-stats section.
 */

(function () {
  'use strict';

  const GITHUB_USERNAME = '06navdeep06';
  const API_BASE = '/.netlify/functions/analyze';

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
    if (data.cached) {
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
      const res = await fetch(`${API_BASE}?username=${GITHUB_USERNAME}`, {
        signal: AbortSignal.timeout(20_000),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.detail || `HTTP ${res.status}`);
      }
      const data = await res.json();
      render(data);
    } catch (err) {
      hide(loadingEl);
      errorMsg.textContent = err.name === 'TimeoutError'
        ? 'Request timed out. The API may be cold-starting — try again in a moment.'
        : `API error: ${err.message}`;
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
