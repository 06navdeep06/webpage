/**
 * pager.js
 * Full-page section navigation — no scroll, page-based.
 */

(function () {
  'use strict';

  /* ── Wrap all sections in #page-wrapper ─────────────────────────────── */
  const sections = Array.from(document.querySelectorAll('body > section'));
  if (!sections.length) return;

  const wrapper = document.createElement('div');
  wrapper.id = 'page-wrapper';
  sections[0].parentNode.insertBefore(wrapper, sections[0]);
  sections.forEach(s => wrapper.appendChild(s));

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
    const exitClass = dir === 'up' ? 'page-exit-up' : 'page-exit-down';

    const prev = sections[current];
    const next = sections[index];

    prev.classList.remove('page-active');
    prev.classList.add(exitClass);

    next.classList.remove('page-exit-up', 'page-exit-down');
    next.style.transform = dir === 'up' ? 'translateY(4rem)' : 'translateY(-4rem)';
    next.classList.add('page-active');

    current = index;
    updateUI();

    setTimeout(() => {
      prev.classList.remove(exitClass);
      prev.style.transform = '';
      next.style.transform = '';
      transitioning = false;
    }, 520);
  }

  function updateUI() {
    dots.forEach((d, i) => d.classList.toggle('active', i === current));
    navLinks.forEach((l, i) => l.classList.toggle('active', i === current));
    prevBtn.disabled = current === 0;
    nextBtn.disabled = current === sections.length - 1;
    counterEl.textContent = `0${current + 1} / 0${sections.length}`;
  }

  /* ── Init first page ────────────────────────────────────────────────── */
  sections.forEach(s => {
    s.classList.remove('page-active', 'page-exit-up', 'page-exit-down');
    s.style.transform = '';
  });
  sections[0].classList.add('page-active');
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
