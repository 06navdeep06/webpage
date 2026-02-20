/**
 * FPS-style crosshair cursor
 */

(function () {
  if ('ontouchstart' in window || navigator.maxTouchPoints > 0) return;

  const ch = document.getElementById('crosshair');
  if (!ch) return;

  const HALF = 20; // half of crosshair element size (matches CSS width/height)

  let lastX = -999, lastY = -999, scrollTimer = null;

  document.addEventListener('mousemove', (e) => {
    lastX = e.clientX;
    lastY = e.clientY;
    ch.style.left = (lastX - HALF) + 'px';
    ch.style.top  = (lastY - HALF) + 'px';
    ch.classList.add('ch-visible');
  });

  /* Hide while scrolling — crosshair can't follow scroll without a mousemove */
  window.addEventListener('scroll', () => {
    ch.classList.remove('ch-visible');
    clearTimeout(scrollTimer);
    scrollTimer = setTimeout(() => {
      if (lastX > -999) ch.classList.add('ch-visible');
    }, 150);
  }, { passive: true });

  document.addEventListener('mouseleave', () => ch.classList.remove('ch-visible'));
  document.addEventListener('mouseenter', () => ch.classList.add('ch-visible'));

  document.addEventListener('mousedown', () => ch.classList.add('ch-firing'));
  document.addEventListener('mouseup',   () => ch.classList.remove('ch-firing'));

  const HOVER = 'a, button, input, textarea, .project-card, .skill-tag, .palette-option, .palette-toggle, .scroll-top-btn, .section-dot';
  document.addEventListener('mouseover', (e) => {
    if (e.target.closest(HOVER)) ch.classList.add('ch-hover');
  });
  document.addEventListener('mouseout', (e) => {
    if (e.target.closest(HOVER)) ch.classList.remove('ch-hover');
  });
})();
