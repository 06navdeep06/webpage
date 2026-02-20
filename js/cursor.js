/**
 * Custom cursor implementation
 * Inner dot: instant, sticks to mouse exactly
 * Outer ring: tight spring-follow with hover expansion
 */

document.addEventListener('DOMContentLoaded', () => {
  const cursorOuter = document.querySelector('.cursor-outer');
  const cursorInner = document.querySelector('.cursor-inner');

  if (!cursorOuter || !cursorInner) return;

  // Disable on touch devices immediately
  if ('ontouchstart' in window || navigator.maxTouchPoints > 0) {
    cursorOuter.style.display = 'none';
    cursorInner.style.display = 'none';
    return;
  }

  let mouseX = -200;
  let mouseY = -200;
  let outerX = -200;
  let outerY = -200;
  let isDown = false;
  let started = false;

  // Inner dot follows mouse instantly — no smoothing
  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;

    // Inner dot: instant position
    cursorInner.style.transform = `translate(${mouseX}px, ${mouseY}px)`;

    if (!document.body.classList.contains('cursor-active')) {
      document.body.classList.add('cursor-active');
      outerX = mouseX;
      outerY = mouseY;
    }

    // Start the outer ring loop only after first real mouse position
    if (!started) {
      started = true;
      outerX = mouseX;
      outerY = mouseY;
      requestAnimationFrame(tick);
    }
  }, { passive: true });

  // Outer ring: tight spring follow (0.35 = responsive but smooth)
  const SPRING = 0.35;

  const tick = () => {
    outerX += (mouseX - outerX) * SPRING;
    outerY += (mouseY - outerY) * SPRING;

    const scale = isDown ? 0.8 : 1;
    cursorOuter.style.transform = `translate(${outerX}px, ${outerY}px) scale(${scale})`;

    requestAnimationFrame(tick);
  };

  // Click effect
  document.addEventListener('mousedown', () => { isDown = true; }, { passive: true });
  document.addEventListener('mouseup', () => { isDown = false; }, { passive: true });

  // Hide when mouse leaves window
  document.addEventListener('mouseout', (e) => {
    if (e.relatedTarget === null) {
      document.body.classList.remove('cursor-active');
    }
  }, { passive: true });

  // Hover detection via event delegation (works for dynamic elements too)
  const HOVER_SELECTOR = 'a, button, .btn, .nav-toggle, .project-card, .skill-tag, .social-link, .filter-btn, .theme-btn, .dark-mode-toggle, .scroll-top-btn, .section-dot, .connection-item, .project-link, input, textarea';

  document.addEventListener('mouseover', (e) => {
    if (e.target.closest(HOVER_SELECTOR)) {
      cursorOuter.classList.add('cursor-hover');
    }
  }, { passive: true });

  document.addEventListener('mouseout', (e) => {
    if (e.target.closest(HOVER_SELECTOR)) {
      cursorOuter.classList.remove('cursor-hover');
    }
  }, { passive: true });
});
