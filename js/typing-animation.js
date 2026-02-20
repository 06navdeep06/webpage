/**
 * Typing animation for hero section
 * Cycles through different roles with typing and backspacing effects
 */

document.addEventListener('DOMContentLoaded', () => {
  const typingElement = document.querySelector('.typing-text');
  const cursorElement = document.querySelector('.typing-cursor');
  
  if (!typingElement || !cursorElement) return;
  
  const roles = [
    'Back-end Developer',
    'Software Engineer',
    'Data Analyst',
    'DevOps Engineer',
    'API Architect',
    'Open Source Contributor',
    'Problem Solver',
  ];
  
  let currentRoleIndex = 0;
  let currentCharIndex = 0;
  let isDeleting = false;
  let typingSpeed = 80;
  let deletingSpeed = 40;
  let pauseDuration = 2200;
  let pauseBetweenRoles = 400;
  
  function typeText() {
    const currentRole = roles[currentRoleIndex];
    
    if (isDeleting) {
      // Backspacing effect
      typingElement.textContent = currentRole.substring(0, currentCharIndex - 1);
      currentCharIndex--;
      
      if (currentCharIndex === 0) {
        isDeleting = false;
        currentRoleIndex = (currentRoleIndex + 1) % roles.length;
        setTimeout(typeText, pauseBetweenRoles);
        return;
      }
      
      setTimeout(typeText, deletingSpeed);
    } else {
      // Typing effect
      typingElement.textContent = currentRole.substring(0, currentCharIndex + 1);
      currentCharIndex++;
      
      if (currentCharIndex === currentRole.length) {
        isDeleting = true;
        setTimeout(typeText, pauseDuration);
        return;
      }
      
      setTimeout(typeText, typingSpeed);
    }
  }
  
  // Start the animation
  setTimeout(typeText, 1000);
  
  // Add blinking cursor animation
  setInterval(() => {
    cursorElement.style.opacity = cursorElement.style.opacity === '0' ? '1' : '0';
  }, 500);
});
