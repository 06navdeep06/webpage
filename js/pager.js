/**
 * pager.js
 * Full-page section navigation — no scroll, page-based.
 * Visibility is controlled entirely via inline styles to avoid CSS conflicts.
 */

(function () {
  'use strict';

  /* ── Shared transition string ────────────────────────────────────────── */
  const TRANSITION = 'opacity 0.45s cubic-bezier(0.4,0,0.2,1), transform 0.45s cubic-bezier(0.4,0,0.2,1)';

  /* ── Apply base inline styles to every section ───────────────────────── */
  function applyBaseStyle(s) {
    s.style.position   = 'absolute';
    s.style.inset      = '0';
    s.style.width      = '100%';
    s.style.height     = '100%';
    s.style.overflow   = 'hidden';
    s.style.transition = TRANSITION;
    s.style.willChange = 'opacity, transform';
    /* hidden by default */
    s.style.opacity        = '0';
    s.style.pointerEvents  = 'none';
    s.style.transform      = 'translateY(4rem)';
  }

  function showSection(s) {
    s.style.opacity       = '1';
    s.style.pointerEvents = 'auto';
    s.style.transform     = 'translateY(0)';
    s.classList.add('page-active');
  }

  function hideSection(s, dir) {
    s.style.opacity       = '0';
    s.style.pointerEvents = 'none';
    s.style.transform     = dir === 'up' ? 'translateY(-4rem)' : 'translateY(4rem)';
    s.classList.remove('page-active');
  }

  /* ── Apply container layout inline ───────────────────────────────────── */
  function applyContainerStyle(s) {
    if (s.id === 'hero') return;
    const c = s.querySelector(':scope > .container');
    if (!c) return;
    c.style.position   = 'absolute';
    c.style.top        = '6.5rem';
    c.style.bottom     = '5.5rem';
    c.style.left       = '0';
    c.style.right      = '0';
    c.style.width      = 'auto';
    c.style.maxWidth   = 'none';
    c.style.margin     = '0';
    c.style.padding    = '0 3rem';
    c.style.boxSizing  = 'border-box';
    c.style.overflowY  = 'auto';
    c.style.overflowX  = 'hidden';
    c.style.zIndex     = '1';
    if (['about', 'philosophy'].includes(s.id)) {
      c.style.display         = 'flex';
      c.style.flexDirection   = 'column';
      c.style.justifyContent  = 'center';
    }
  }

  /* ── Wrap all sections in #page-wrapper ─────────────────────────────── */
  const sections = Array.from(document.querySelectorAll('body > section'))
    .filter(s => getComputedStyle(s).display !== 'none');
  if (!sections.length) return;

  const wrapper = document.createElement('div');
  wrapper.id = 'page-wrapper';
  wrapper.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;z-index:1;';
  sections[0].parentNode.insertBefore(wrapper, sections[0]);
  sections.forEach(s => {
    wrapper.appendChild(s);
    applyBaseStyle(s);
    applyContainerStyle(s);
  });

  /* ── State ──────────────────────────────────────────────────────────── */
  const PAGE_NAMES = sections.map(s => s.id);
  let current = 0;
  let transitioning = false;

  /* ── DOM refs ───────────────────────────────────────────────────────── */
  const navLinks    = Array.from(document.querySelectorAll('.hud-nav-link'));
  const indicatorEl = document.getElementById('page-indicator');

  /* ── Build side dots ────────────────────────────────────────────────── */
  const dots = sections.map((_, i) => {
    const d = document.createElement('button');
    d.className = 'page-dot';
    d.setAttribute('aria-label', `Go to page ${i + 1}`);
    d.addEventListener('click', () => goTo(i));
    indicatorEl.appendChild(d);
    return d;
  });

  /* ── Build bottom arrows + counter ─────────────────────────────────── */
  const arrowsEl = document.createElement('div');
  arrowsEl.className = 'page-arrows';

  const prevBtn = document.createElement('button');
  prevBtn.className = 'page-arrow-btn';
  prevBtn.innerHTML = '<i class="fas fa-chevron-up"></i>';
  prevBtn.setAttribute('aria-label', 'Previous page');
  prevBtn.addEventListener('click', () => goTo(current - 1));

  const nextBtn = document.createElement('button');
  nextBtn.className = 'page-arrow-btn';
  nextBtn.innerHTML = '<i class="fas fa-chevron-down"></i>';
  nextBtn.setAttribute('aria-label', 'Next page');
  nextBtn.addEventListener('click', () => goTo(current + 1));

  arrowsEl.appendChild(prevBtn);
  arrowsEl.appendChild(nextBtn);
  document.body.appendChild(arrowsEl);

  const counterEl = document.createElement('div');
  counterEl.className = 'page-counter';
  document.body.appendChild(counterEl);

  /* ── Navigate ───────────────────────────────────────────────────────── */
  function goTo(index, direction) {
    if (transitioning) return;
    if (index < 0 || index >= sections.length) return;
    if (index === current) return;

    transitioning = true;
    const dir = direction ?? (index > current ? 'up' : 'down');

    hideSection(sections[current], dir);
    showSection(sections[index]);

    current = index;
    updateUI();

    setTimeout(() => { transitioning = false; }, 500);
  }

  function updateUI() {
    dots.forEach((d, i) => d.classList.toggle('active', i === current));
    navLinks.forEach((l, i) => l.classList.toggle('active', i === current));
    prevBtn.disabled = current === 0;
    nextBtn.disabled = current === sections.length - 1;
    const n = sections.length;
    counterEl.textContent = `${String(current+1).padStart(2,'0')} / ${String(n).padStart(2,'0')}`;
  }

  /* ── Init first page ────────────────────────────────────────────────── */
  showSection(sections[0]);
  updateUI();

  /* ── Nav link clicks ────────────────────────────────────────────────── */
  navLinks.forEach((link, i) => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      goTo(i);
    });
  });

  /* ── Keyboard navigation ────────────────────────────────────────────── */
  document.addEventListener('keydown', (e) => {
    if (['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement.tagName)) return;

    if (e.key === 'ArrowDown' || e.key === 'PageDown') {
      e.preventDefault();
      goTo(current + 1, 'up');
    } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
      e.preventDefault();
      goTo(current - 1, 'down');
    }
  });

  /* ── Edge-click zones (desktop prev/next) ─────────────────────────── */
  if (!('ontouchstart' in window)) {
    const edgePrev = document.createElement('div');
    const edgeNext = document.createElement('div');
    edgePrev.className = 'edge-zone edge-prev';
    edgeNext.className = 'edge-zone edge-next';
    edgePrev.innerHTML = '<i class="fas fa-chevron-up"></i>';
    edgeNext.innerHTML = '<i class="fas fa-chevron-down"></i>';
    document.body.appendChild(edgePrev);
    document.body.appendChild(edgeNext);
    edgePrev.addEventListener('click', () => goTo(current - 1, 'down'));
    edgeNext.addEventListener('click', () => goTo(current + 1, 'up'));
  }

  /* ── Touch swipe ────────────────────────────────────────────────────── */
  let touchStartY = 0;
  window.addEventListener('touchstart', (e) => {
    touchStartY = e.touches[0].clientY;
  }, { passive: true });

  window.addEventListener('touchend', (e) => {
    const delta = touchStartY - e.changedTouches[0].clientY;
    if (Math.abs(delta) < 50) return;
    if (delta > 0) goTo(current + 1, 'up');
    else           goTo(current - 1, 'down');
  }, { passive: true });

  /* ── Intercept internal anchor links (hero CTAs etc.) ───────────────── */
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (!a) return;
    const targetId = a.getAttribute('href').slice(1);
    if (!targetId) return;
    const idx = PAGE_NAMES.indexOf(targetId);
    if (idx === -1) return;
    e.preventDefault();
    goTo(idx);
  });

})();
