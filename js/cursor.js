/**
 * Custom cursor implementation
 * Uses left/top positioning for reliable cross-browser behavior
 */

(function () {
  // Disable on touch devices
  if ('ontouchstart' in window || navigator.maxTouchPoints > 0) return;

  const cursorOuter = document.querySelector('.cursor-outer');
  const cursorInner = document.querySelector('.cursor-inner');
  if (!cursorOuter || !cursorInner) return;

  // Outer ring size (matches CSS: 3.6rem at 10px base = 36px, half = 18px)
  const OUTER_HALF = 18;
  // Inner dot size (0.8rem = 8px, half = 4px)
  const INNER_HALF = 4;

  let mouseX = -300, mouseY = -300;
  let outerX = -300, outerY = -300;
  let isDown = false;

  // Position inner dot instantly on every mouse move
  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;

    cursorInner.style.left = (mouseX - INNER_HALF) + 'px';
    cursorInner.style.top  = (mouseY - INNER_HALF) + 'px';

    document.body.classList.add('cursor-active');
  });

  // Outer ring spring-follows mouse
  const SPRING = 0.18;
  const loop = () => {
    outerX += (mouseX - outerX) * SPRING;
    outerY += (mouseY - outerY) * SPRING;

    cursorOuter.style.left = (outerX - OUTER_HALF) + 'px';
    cursorOuter.style.top  = (outerY - OUTER_HALF) + 'px';

    if (isDown) {
      cursorOuter.style.transform = 'scale(0.8)';
    } else {
      cursorOuter.style.transform = 'scale(1)';
    }

    requestAnimationFrame(loop);
  };
  requestAnimationFrame(loop);

  // Click shrink
  document.addEventListener('mousedown', () => { isDown = true; });
  document.addEventListener('mouseup',   () => { isDown = false; });

  // Hide when leaving window
  document.addEventListener('mouseleave', () => {
    document.body.classList.remove('cursor-active');
  });
  document.addEventListener('mouseenter', () => {
    document.body.classList.add('cursor-active');
  });

  // Hover expand via delegation
  const HOVER = 'a, button, input, textarea, .project-card, .skill-tag, .palette-option, .palette-toggle, .scroll-top-btn, .section-dot';
  document.addEventListener('mouseover', (e) => {
    if (e.target.closest(HOVER)) cursorOuter.classList.add('cursor-hover');
  });
  document.addEventListener('mouseout', (e) => {
    if (e.target.closest(HOVER)) cursorOuter.classList.remove('cursor-hover');
  });
})();
