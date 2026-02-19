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
  
  // Add cursor-active class to body when mouse moves
  // This makes the cursor visible only when mouse is moving
  document.addEventListener('mousemove', (e) => {
    // Update mouse position
    mouseX = e.clientX;
    mouseY = e.clientY;
    
    // Add active class if not already present
    document.body.classList.add('cursor-active');
  });
  
  // Define hoverable elements
  const hoverableElements = 'a, button, .btn, .nav-toggle, .project-card, .skill-tag, .social-link, .filter-btn';
  
  // Add hover effect when mouse enters hoverable elements
  document.querySelectorAll(hoverableElements).forEach(element => {
    element.addEventListener('mouseenter', () => {
      cursorOuter.classList.add('cursor-hover');
    });
    
    element.addEventListener('mouseleave', () => {
      cursorOuter.classList.remove('cursor-hover');
    });
  });
  
  // Hide cursor when mouse leaves window
  document.addEventListener('mouseout', (e) => {
    if (e.relatedTarget === null) {
      document.body.classList.remove('cursor-active');
    }
  });
  
  // Animation loop for smooth cursor movement
  const animateCursor = () => {
    // Calculate smooth movement for outer cursor
    cursorOuterX += (mouseX - cursorOuterX) * smoothFactor;
    cursorOuterY += (mouseY - cursorOuterY) * smoothFactor;
    
    // Calculate smooth movement for inner cursor (slightly faster)
    cursorInnerX += (mouseX - cursorInnerX) * smoothFactorInner;
    cursorInnerY += (mouseY - cursorInnerY) * smoothFactorInner;
    
    // Apply transforms
    cursorOuter.style.transform = `translate(${cursorOuterX}px, ${cursorOuterY}px)`;
    cursorInner.style.transform = `translate(${cursorInnerX}px, ${cursorInnerY}px)`;
    
    // Continue animation loop
    requestAnimationFrame(animateCursor);
  };
  
  // Start animation loop
  animateCursor();
  
  // Add click effect
  document.addEventListener('mousedown', () => {
    cursorOuter.style.transform = `translate(${cursorOuterX}px, ${cursorOuterY}px) scale(0.8)`;
  });
  
  document.addEventListener('mouseup', () => {
    cursorOuter.style.transform = `translate(${cursorOuterX}px, ${cursorOuterY}px) scale(1)`;
  });
  
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
