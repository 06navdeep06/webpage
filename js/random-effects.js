/**
 * Random Effects System
 * Adds dynamic, randomized effects throughout the website
 */

document.addEventListener('DOMContentLoaded', () => {
  // Random floating particles in background
  class RandomParticles {
    constructor() {
      this.container = document.body;
      this.particles = [];
      this.maxParticles = 15;
      this.init();
    }

    init() {
      for (let i = 0; i < this.maxParticles; i++) {
        setTimeout(() => this.createParticle(), i * 200);
      }
    }

    createParticle() {
      const particle = document.createElement('div');
      particle.className = 'random-particle';
      
      // Random properties
      const size = Math.random() * 4 + 2;
      const duration = Math.random() * 20 + 10;
      const delay = Math.random() * 5;
      const startX = Math.random() * window.innerWidth;
      const opacity = Math.random() * 0.3 + 0.1;
      
      particle.style.cssText = `
        position: fixed;
        width: ${size}px;
        height: ${size}px;
        background: var(--color-accent-1);
        border-radius: 50%;
        left: ${startX}px;
        top: 100%;
        opacity: ${opacity};
        pointer-events: none;
        z-index: 1;
        animation: floatUp ${duration}s linear ${delay}s infinite;
        box-shadow: 0 0 ${size * 2}px var(--color-accent-1);
      `;
      
      this.container.appendChild(particle);
      this.particles.push(particle);
      
      // Remove particle after animation
      setTimeout(() => {
        if (particle.parentNode) {
          particle.remove();
          this.particles = this.particles.filter(p => p !== particle);
          this.createParticle(); // Create new one
        }
      }, (duration + delay) * 1000);
    }
  }

  // Random glitch effects on text
  class RandomGlitch {
    constructor() {
      this.elements = document.querySelectorAll('.glitch-text, .section-title, h1, h2, h3');
      this.init();
    }

    init() {
      this.elements.forEach(el => {
        setInterval(() => {
          if (Math.random() < 0.05) { // 5% chance every interval
            this.glitch(el);
          }
        }, 3000);
      });
    }

    glitch(element) {
      element.style.animation = 'none';
      setTimeout(() => {
        element.style.animation = 'glitch 0.3s ease-in-out';
      }, 10);
      
      setTimeout(() => {
        element.style.animation = '';
      }, 310);
    }
  }

  // Random color shifts for accent elements
  class RandomColorShift {
    constructor() {
      this.elements = document.querySelectorAll('.accent-1, .accent-2, .accent-3, .btn-primary');
      this.colors = ['#FF3D00', '#6E00FF', '#00E5B3', '#FFCC00', '#05D9E8', '#FD3777'];
      this.init();
    }

    init() {
      setInterval(() => {
        this.elements.forEach(el => {
          if (Math.random() < 0.1) { // 10% chance
            const randomColor = this.colors[Math.floor(Math.random() * this.colors.length)];
            el.style.transition = 'color 0.5s ease, background-color 0.5s ease, border-color 0.5s ease';
            el.style.color = randomColor;
            el.style.backgroundColor = randomColor + '20';
            el.style.borderColor = randomColor;
            
            setTimeout(() => {
              el.style.color = '';
              el.style.backgroundColor = '';
              el.style.borderColor = '';
            }, 2000);
          }
        });
      }, 5000);
    }
  }

  // Random hover effects for project cards
  class RandomCardEffects {
    constructor() {
      this.cards = document.querySelectorAll('.project-card');
      this.init();
    }

    init() {
      this.cards.forEach(card => {
        card.addEventListener('mouseenter', () => {
          this.randomTransform(card);
        });
        
        card.addEventListener('mousemove', (e) => {
          const rect = card.getBoundingClientRect();
          const x = e.clientX - rect.left;
          const y = e.clientY - rect.top;
          
          const centerX = rect.width / 2;
          const centerY = rect.height / 2;
          
          const rotateX = (y - centerY) / 10;
          const rotateY = (centerX - x) / 10;
          
          card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(10px)`;
        });
        
        card.addEventListener('mouseleave', () => {
          card.style.transform = '';
        });
      });
    }

    randomTransform(card) {
      const effects = [
        'scale(1.02) rotate(0.5deg)',
        'scale(1.03) rotate(-0.3deg)',
        'scale(1.01) translateY(-2px)',
        'scale(1.02) translateX(2px)',
        'scale(1.03) skewX(1deg)',
        'scale(1.01) skewY(-0.5deg)'
      ];
      
      const randomEffect = effects[Math.floor(Math.random() * effects.length)];
      card.style.transform = randomEffect;
      card.style.transition = 'transform 0.3s ease';
    }
  }

  // Random floating animations for skill tags
  class RandomFloatAnimations {
    constructor() {
      this.elements = document.querySelectorAll('.skill-tag, .terminal-tag');
      this.init();
    }

    init() {
      this.elements.forEach((el, index) => {
        const delay = Math.random() * 2;
        const duration = Math.random() * 3 + 2;
        
        el.style.animation = `float ${duration}s ease-in-out ${delay}s infinite`;
        
        // Randomly change animation parameters
        setInterval(() => {
          if (Math.random() < 0.3) {
            const newDuration = Math.random() * 3 + 2;
            el.style.animationDuration = `${newDuration}s`;
          }
        }, 5000);
      });
    }
  }

  // Random typing effect for terminal elements
  class RandomTypingEffect {
    constructor() {
      this.terminals = document.querySelectorAll('.terminal-body, .terminal-tag');
      this.init();
    }

    init() {
      this.terminals.forEach(terminal => {
        setInterval(() => {
          if (Math.random() < 0.1) {
            this.typeRandomChar(terminal);
          }
        }, 8000);
      });
    }

    typeRandomChar(element) {
      const chars = ['_', '|', '/', '-', '\\', '*', '#', '@', '$'];
      const randomChar = chars[Math.floor(Math.random() * chars.length)];
      
      const originalText = element.textContent;
      element.textContent = originalText + randomChar;
      
      setTimeout(() => {
        element.textContent = originalText;
      }, 100);
    }
  }

  // Random pulse effects for buttons
  class RandomPulseEffects {
    constructor() {
      this.buttons = document.querySelectorAll('.btn');
      this.init();
    }

    init() {
      this.buttons.forEach(btn => {
        setInterval(() => {
          if (Math.random() < 0.05) {
            btn.style.animation = 'pulse 0.6s ease-in-out';
            setTimeout(() => {
              btn.style.animation = '';
            }, 600);
          }
        }, 4000);
      });
    }
  }

  // Add CSS for new animations
  const style = document.createElement('style');
  style.textContent = `
    @keyframes floatUp {
      0% {
        transform: translateY(0) translateX(0);
        opacity: 0;
      }
      10% {
        opacity: 1;
      }
      90% {
        opacity: 1;
      }
      100% {
        transform: translateY(-100vh) translateX(${Math.random() * 100 - 50}px);
        opacity: 0;
      }
    }
    
    @keyframes float {
      0%, 100% {
        transform: translateY(0);
      }
      50% {
        transform: translateY(-10px);
      }
    }
  `;
  document.head.appendChild(style);

  // Initialize all effects
  new RandomParticles();
  new RandomGlitch();
  new RandomColorShift();
  new RandomCardEffects();
  new RandomFloatAnimations();
  new RandomTypingEffect();
  new RandomPulseEffects();
});
