/**
 * Creative Signature Animation System
 * Modern, dynamic signature with particles, glitches, and interactive elements
 */

document.addEventListener('DOMContentLoaded', () => {
  const signatureCanvas = document.getElementById('signature-canvas');
  const particlesContainer = document.getElementById('sig-particles');
  const cursor = document.getElementById('sig-cursor');
  
  if (!signatureCanvas) return;

  // Rotating titles for the dynamic title effect
  const titles = ['Backend Engineer', 'API Architect', 'System Designer', 'Problem Solver', 'Code Craftsman'];
  let currentTitleIndex = 0;

  // Particle system for background effects
  class SignatureParticle {
    constructor(container) {
      this.container = container;
      this.element = document.createElement('div');
      this.element.className = 'sig-particle';
      this.reset();
      container.appendChild(this.element);
    }

    reset() {
      const size = Math.random() * 3 + 1;
      const duration = Math.random() * 15 + 10;
      const delay = Math.random() * 5;
      
      this.element.style.cssText = `
        position: absolute;
        width: ${size}px;
        height: ${size}px;
        background: var(--color-accent-1);
        border-radius: 50%;
        left: ${Math.random() * 100}%;
        top: ${Math.random() * 100}%;
        opacity: ${Math.random() * 0.5 + 0.1};
        pointer-events: none;
        animation: particleFloat ${duration}s linear ${delay}s infinite;
        box-shadow: 0 0 ${size * 2}px var(--color-accent-1);
      `;
      
      setTimeout(() => this.reset(), (duration + delay) * 1000);
    }
  }

  // Initialize particles
  const particles = [];
  for (let i = 0; i < 20; i++) {
    setTimeout(() => {
      particles.push(new SignatureParticle(particlesContainer));
    }, i * 100);
  }

  // Rotating title animation
  const rotateTitle = () => {
    const rotatingElement = document.querySelector('.title-rotating');
    if (rotatingElement) {
      currentTitleIndex = (currentTitleIndex + 1) % titles.length;
      
      rotatingElement.style.opacity = '0';
      rotatingElement.style.transform = 'translateY(-10px)';
      
      setTimeout(() => {
        rotatingElement.textContent = titles[currentTitleIndex];
        rotatingElement.style.opacity = '1';
        rotatingElement.style.transform = 'translateY(0)';
      }, 300);
    }
  };

  // Start title rotation
  setInterval(rotateTitle, 3000);

  // Glitch effect for name
  const createGlitch = (element) => {
    if (!element) return;
    
    const originalText = element.textContent;
    const glitchChars = ['!', '@', '#', '$', '%', '&', '*', '?'];
    
    let glitchDuration = 200;
    let glitchInterval = 50;
    let elapsed = 0;
    
    const glitchAnimation = setInterval(() => {
      if (elapsed >= glitchDuration) {
        element.textContent = originalText;
        clearInterval(glitchAnimation);
        return;
      }
      
      if (Math.random() < 0.3) {
        const glitchedText = originalText.split('').map(char => 
          Math.random() < 0.1 ? glitchChars[Math.floor(Math.random() * glitchChars.length)] : char
        ).join('');
        element.textContent = glitchedText;
      }
      
      elapsed += glitchInterval;
    }, glitchInterval);
  };

  // Random glitch effects
  setInterval(() => {
    const nameElement = document.querySelector('.name-glitch');
    if (nameElement && Math.random() < 0.1) {
      createGlitch(nameElement);
    }
  }, 4000);

  // Interactive connection items
  const connectionItems = document.querySelectorAll('.connection-item');
  connectionItems.forEach(item => {
    item.addEventListener('mouseenter', () => {
      item.style.transform = 'translateX(5px) scale(1.05)';
      item.style.background = 'var(--color-bg-card)';
      item.style.boxShadow = '0 4px 20px rgba(255, 61, 0, 0.2)';
      
      // Add pulse effect to icon
      const icon = item.querySelector('.conn-icon');
      if (icon) {
        icon.style.transform = 'scale(1.2) rotate(10deg)';
      }
    });

    item.addEventListener('mouseleave', () => {
      item.style.transform = 'translateX(0) scale(1)';
      item.style.background = '';
      item.style.boxShadow = '';
      
      const icon = item.querySelector('.conn-icon');
      if (icon) {
        icon.style.transform = 'scale(1) rotate(0deg)';
      }
    });

    // Click to copy functionality
    item.addEventListener('click', () => {
      const valueElement = item.querySelector('.conn-value');
      if (valueElement) {
        const text = valueElement.textContent;
        navigator.clipboard.writeText(text).then(() => {
          // Show copied feedback
          const originalLabel = item.querySelector('.conn-label').textContent;
          item.querySelector('.conn-label').textContent = 'Copied!';
          item.style.background = 'var(--color-accent-1)';
          item.style.color = 'var(--color-bg-primary)';
          
          setTimeout(() => {
            item.querySelector('.conn-label').textContent = originalLabel;
            item.style.background = '';
            item.style.color = '';
          }, 1500);
        });
      }
    });
  });

  // Avatar hover effect
  const avatar = document.querySelector('.avatar-glitch');
  if (avatar) {
    avatar.addEventListener('mouseenter', () => {
      avatar.style.transform = 'rotate(180deg) scale(1.1)';
      avatar.style.background = 'var(--color-accent-1)';
      avatar.style.color = 'var(--color-bg-primary)';
    });

    avatar.addEventListener('mouseleave', () => {
      avatar.style.transform = 'rotate(0deg) scale(1)';
      avatar.style.background = '';
      avatar.style.color = '';
    });
  }

  // Status indicator animation
  const statusDot = document.querySelector('.status-dot');
  if (statusDot) {
    setInterval(() => {
      statusDot.style.background = '#00ff00';
      statusDot.style.boxShadow = '0 0 10px #00ff00';
      
      setTimeout(() => {
        statusDot.style.background = 'var(--color-accent-1)';
        statusDot.style.boxShadow = '';
      }, 1000);
    }, 3000);
  }

  // Custom cursor that follows mouse
  let mouseX = 0, mouseY = 0;
  let cursorX = 0, cursorY = 0;

  signatureCanvas.addEventListener('mousemove', (e) => {
    const rect = signatureCanvas.getBoundingClientRect();
    mouseX = e.clientX - rect.left;
    mouseY = e.clientY - rect.top;
  });

  const animateCursor = () => {
    cursorX += (mouseX - cursorX) * 0.1;
    cursorY += (mouseY - cursorY) * 0.1;
    
    if (cursor) {
      cursor.style.left = `${cursorX}px`;
      cursor.style.top = `${cursorY}px`;
      cursor.style.opacity = mouseX > 0 && mouseY > 0 ? '1' : '0';
    }
    
    requestAnimationFrame(animateCursor);
  };
  animateCursor();

  // Intersection Observer for entrance animations
  const observerOptions = {
    threshold: 0.3,
    rootMargin: '0px 0px -50px 0px'
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.animation = 'signatureEntrance 1s ease forwards';
        
        // Stagger animation for connection items
        const items = entry.target.querySelectorAll('.connection-item');
        items.forEach((item, index) => {
          item.style.animation = `slideInRight 0.6s ease ${index * 0.1}s forwards`;
        });
      }
    });
  }, observerOptions);

  observer.observe(signatureCanvas);

  // Add CSS animations
  const style = document.createElement('style');
  style.textContent = `
    @keyframes particleFloat {
      0% {
        transform: translateY(0) translateX(0) rotate(0deg);
        opacity: 0;
      }
      10% {
        opacity: 1;
      }
      90% {
        opacity: 1;
      }
      100% {
        transform: translateY(-100px) translateX(${Math.random() * 100 - 50}px) rotate(360deg);
        opacity: 0;
      }
    }
    
    @keyframes signatureEntrance {
      from {
        opacity: 0;
        transform: translateY(30px) scale(0.9);
      }
      to {
        opacity: 1;
        transform: translateY(0) scale(1);
      }
    }
    
    @keyframes slideInRight {
      from {
        opacity: 0;
        transform: translateX(-30px);
      }
      to {
        opacity: 1;
        transform: translateX(0);
      }
    }
    
    .signature-canvas {
      position: relative;
      background: var(--color-bg-secondary);
      border: 1px solid var(--color-border);
      border-radius: 16px;
      padding: 3rem;
      overflow: hidden;
      min-height: 400px;
    }
    
    .signature-grid {
      position: relative;
      z-index: 2;
    }
    
    .sig-main {
      display: flex;
      align-items: center;
      gap: 2rem;
      margin-bottom: 3rem;
    }
    
    .sig-avatar {
      position: relative;
    }
    
    .avatar-glitch {
      width: 80px;
      height: 80px;
      background: var(--color-accent-1);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
      font-size: 2rem;
      color: var(--color-bg-primary);
      transition: all 0.3s ease;
      cursor: pointer;
    }
    
    .sig-name {
      font-size: 3rem;
      font-weight: 700;
      margin: 0;
      background: linear-gradient(45deg, var(--color-accent-1), var(--color-accent-2));
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
    
    .sig-title {
      font-size: 1.2rem;
      margin-top: 0.5rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    
    .title-rotating {
      color: var(--color-accent-1);
      font-weight: 500;
      transition: all 0.3s ease;
    }
    
    .title-separator {
      color: var(--color-text-secondary);
    }
    
    .sig-connections {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 1rem;
      margin-bottom: 2rem;
    }
    
    .connection-item {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1rem;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.3s ease;
      border: 1px solid transparent;
    }
    
    .conn-icon {
      font-size: 1.5rem;
      transition: all 0.3s ease;
    }
    
    .conn-data {
      display: flex;
      flex-direction: column;
    }
    
    .conn-label {
      font-size: 0.8rem;
      color: var(--color-text-secondary);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    
    .conn-value {
      font-size: 0.9rem;
      color: var(--color-text-primary);
      font-family: var(--font-mono);
    }
    
    .sig-meta {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-top: 2rem;
      border-top: 1px solid var(--color-border);
    }
    
    .meta-item {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    
    .status-dot {
      width: 8px;
      height: 8px;
      background: var(--color-accent-1);
      border-radius: 50%;
      transition: all 0.3s ease;
    }
    
    .signature-particles {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 1;
    }
    
    .signature-cursor {
      position: absolute;
      width: 20px;
      height: 20px;
      color: var(--color-accent-1);
      font-size: 12px;
      pointer-events: none;
      z-index: 10;
      transition: opacity 0.3s ease;
      transform: translate(-50%, -50%);
    }
  `;
  document.head.appendChild(style);
});
