/**
 * Custom cursor implementation
 * Creates an interactive cursor that follows mouse movement
 * and reacts to hoverable elements
 */

document.addEventListener('DOMContentLoaded', () => {
  // Get cursor elements
  const cursorOuter = document.querySelector('.cursor-outer');
  const cursorInner = document.querySelector('.cursor-inner');
  
  // Check if cursor elements exist (might be disabled on touch devices)
  if (!cursorOuter || !cursorInner) return;
  
  // Variables for cursor position and smoothing
  let mouseX = 0;
  let mouseY = 0;
  let cursorOuterX = 0;
  let cursorOuterY = 0;
  let cursorInnerX = 0;
  let cursorInnerY = 0;
  
  // Smoothing factor (lower = smoother)
  const smoothFactor = 0.15;
  const smoothFactorInner = 0.2;
  
  // Performance optimization: throttle mouse move events
  let ticking = false;
  
  // Throttled mouse move handler
  const handleMouseMove = (e) => {
    if (!ticking) {
      requestAnimationFrame(() => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        document.body.classList.add('cursor-active');
        ticking = false;
      });
      ticking = true;
    }
  };
  
  // Use throttled handler
  document.addEventListener('mousemove', handleMouseMove, { passive: true });
  
  // Define hoverable elements
  const hoverableElements = 'a, button, .btn, .nav-toggle, .project-card, .skill-tag, .social-link, .filter-btn';
  
  // Add hover effect with performance optimization
  const hoverableEls = document.querySelectorAll(hoverableElements);
  hoverableEls.forEach(element => {
    element.addEventListener('mouseenter', () => {
      cursorOuter.classList.add('cursor-hover');
    }, { passive: true });
    
    element.addEventListener('mouseleave', () => {
      cursorOuter.classList.remove('cursor-hover');
    }, { passive: true });
  });
  
  // Hide cursor when mouse leaves window
  document.addEventListener('mouseout', (e) => {
    if (e.relatedTarget === null) {
      document.body.classList.remove('cursor-active');
    }
  }, { passive: true });
  
  // Optimized animation loop
  let lastTime = 0;
  const animateCursor = (currentTime) => {
    const deltaTime = currentTime - lastTime;
    
    // Only update if enough time has passed (60fps = ~16.67ms)
    if (deltaTime >= 16) {
      // Calculate smooth movement for outer cursor
      cursorOuterX += (mouseX - cursorOuterX) * smoothFactor;
      cursorOuterY += (mouseY - cursorOuterY) * smoothFactor;
      
      // Calculate smooth movement for inner cursor (slightly faster)
      cursorInnerX += (mouseX - cursorInnerX) * smoothFactorInner;
      cursorInnerY += (mouseY - cursorInnerY) * smoothFactorInner;
      
      // Apply transforms using will-change for better performance
      cursorOuter.style.transform = `translate(${cursorOuterX}px, ${cursorOuterY}px)`;
      cursorInner.style.transform = `translate(${cursorInnerX}px, ${cursorInnerY}px)`;
      
      lastTime = currentTime;
    }
    
    requestAnimationFrame(animateCursor);
  };
  
  // Start animation loop
  requestAnimationFrame(animateCursor);
  
  // Add click effect with performance optimization
  document.addEventListener('mousedown', () => {
    cursorOuter.style.transform = `translate(${cursorOuterX}px, ${cursorOuterY}px) scale(0.8)`;
  }, { passive: true });
  
  document.addEventListener('mouseup', () => {
    cursorOuter.style.transform = `translate(${cursorOuterX}px, ${cursorOuterY}px) scale(1)`;
  }, { passive: true });
  
  // Disable cursor on touch devices
  const isTouchDevice = () => {
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  };
  
  if (isTouchDevice()) {
    document.body.classList.remove('cursor-active');
    cursorOuter.style.display = 'none';
    cursorInner.style.display = 'none';
  }
});
