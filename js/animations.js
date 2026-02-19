/**
 * General animations and scroll effects
 * Handles scroll-based animations and interactive elements
 */

document.addEventListener('DOMContentLoaded', () => {
  // Initialize scroll reveal animations
  initScrollReveal();
  
  // Initialize hover animations
  initHoverAnimations();

  // Initialize smooth section transitions
  initSmoothTransitions();
});
  
  // Initialize parallax effects
  const initParallaxEffects = () => {
    const parallaxElements = document.querySelectorAll('[data-parallax]');
    
    // Update parallax positions on scroll
    const updateParallax = () => {
      const scrollY = window.scrollY;
      
      parallaxElements.forEach(element => {
        const speed = parseFloat(element.getAttribute('data-parallax')) || 0.2;
        const offset = scrollY * speed;
        element.style.transform = `translateY(${offset}px)`;
      });
    };
    
    // Add parallax attribute to elements that should have parallax
    document.querySelectorAll('.about-image, .section-header, .contact-info').forEach(element => {
      if (!element.hasAttribute('data-parallax')) {
        element.setAttribute('data-parallax', '0.1');
      }
    });
    
    // Listen for scroll events
    window.addEventListener('scroll', updateParallax);
    
    // Initial update
    updateParallax();
  };
  
  // Initialize hover effects
  const initHoverEffects = () => {
    // Image hover effects
    document.querySelectorAll('.hover-zoom').forEach(element => {
      element.addEventListener('mouseenter', () => {
        element.classList.add('active');
      });
      
      element.addEventListener('mouseleave', () => {
        element.classList.remove('active');
      });
    });
    
    // Button hover effects
    document.querySelectorAll('.btn').forEach(button => {
      button.addEventListener('mouseenter', () => {
        button.classList.add('hover');
      });
      
      button.addEventListener('mouseleave', () => {
        button.classList.remove('hover');
      });
    });
  };
  
  // Initialize scroll-triggered sound effects (if enabled)
  const initScrollSounds = () => {
    let audioContext = null;
    let soundEnabled = false;
    
    // Create audio context when sound is enabled
    document.addEventListener('sound-enabled', () => {
      soundEnabled = true;
      
      // Initialize Web Audio API
      if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
      }
    });
    
    // Disable sounds
    document.addEventListener('sound-disabled', () => {
      soundEnabled = false;
    });
    
    // Play a subtle sound when scrolling to a new section
    const sections = document.querySelectorAll('section[id]');
    let currentSection = null;
    
    // Function to play a simple tone
    const playTone = (frequency, duration, volume) => {
      if (!soundEnabled || !audioContext) return;
      
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.type = 'sine';
      oscillator.frequency.value = frequency;
      
      gainNode.gain.value = volume;
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + duration);
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.start();
      oscillator.stop(audioContext.currentTime + duration);
    };
    
    // Check current section on scroll
    window.addEventListener('scroll', () => {
      const scrollPosition = window.scrollY + window.innerHeight / 3;
      
      sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.offsetHeight;
        const sectionId = section.getAttribute('id');
        
        if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
          if (currentSection !== sectionId) {
            currentSection = sectionId;
            
            // Play different tones for different sections
            switch(sectionId) {
              case 'hero':
                playTone(440, 0.3, 0.05); // A4
                break;
              case 'about':
                playTone(494, 0.3, 0.05); // B4
                break;
              case 'skills':
                playTone(523, 0.3, 0.05); // C5
                break;
              case 'projects':
                playTone(587, 0.3, 0.05); // D5
                break;
              case 'contact':
                playTone(659, 0.3, 0.05); // E5
                break;
              default:
                playTone(440, 0.3, 0.05); // A4
            }
          }
        }
      });
    });
  };
  
  // Initialize text splitting for creative text effects
  const initTextEffects = () => {
    // Split text into words and characters for more complex animations
    document.querySelectorAll('.split-text').forEach(element => {
      const text = element.textContent;
      const words = text.split(' ');
      
      // Clear original text
      element.textContent = '';
      
      // Create spans for each word and character
      words.forEach((word, wordIndex) => {
        const wordSpan = document.createElement('span');
        wordSpan.className = 'word';
        
        // Split word into characters
        const chars = word.split('');
        
        chars.forEach((char, charIndex) => {
          const charSpan = document.createElement('span');
          charSpan.className = 'char';
          charSpan.textContent = char;
          charSpan.style.setProperty('--char-index', charIndex);
          wordSpan.appendChild(charSpan);
        });
        
        wordSpan.style.setProperty('--word-index', wordIndex);
        element.appendChild(wordSpan);
        
        // Add space after word (except last word)
        if (wordIndex < words.length - 1) {
          const space = document.createElement('span');
          space.className = 'space';
          space.innerHTML = '&nbsp;';
          element.appendChild(space);
        }
      });
    });
  };
  
  // Initialize scroll progress indicator
  const initScrollProgress = () => {
    // Create progress bar if it doesn't exist
    if (!document.querySelector('.scroll-progress')) {
      const progressBar = document.createElement('div');
      progressBar.className = 'scroll-progress';
      document.body.appendChild(progressBar);
      
      // Style the progress bar
      progressBar.style.position = 'fixed';
      progressBar.style.top = '0';
      progressBar.style.left = '0';
      progressBar.style.height = '3px';
      progressBar.style.width = '0';
      progressBar.style.background = 'var(--gradient-primary)';
      progressBar.style.zIndex = '1000';
      progressBar.style.transition = 'width 0.1s ease';
    }
    
    // Update progress on scroll
    const updateProgress = () => {
      const scrollPosition = window.scrollY;
      const totalHeight = document.body.scrollHeight - window.innerHeight;
      const progress = (scrollPosition / totalHeight) * 100;
      
      document.querySelector('.scroll-progress').style.width = `${progress}%`;
    };
    
    window.addEventListener('scroll', updateProgress);
    updateProgress(); // Initial update
  };
  
  // Initialize section transitions
  const initSectionTransitions = () => {
    // Add transition classes to sections
    document.querySelectorAll('section').forEach((section, index) => {
      // Add different transition styles based on index
      if (index % 2 === 1) {
        section.classList.add('diagonal-top');
      } else if (index > 0) {
        section.classList.add('diagonal-bottom');
      }
    });
  };
  
  // Initialize all animations
  const initAllAnimations = () => {
    initScrollAnimations();
    initParallaxEffects();
    initHoverEffects();
    initScrollSounds();
    initTextEffects();
    initScrollProgress();
    initSectionTransitions();
    
    // Set current year in footer
    document.getElementById('current-year').textContent = new Date().getFullYear();
  }
  
  // Run all initializations
  initAllAnimations();

// Initialize scroll reveal animations
function initScrollReveal() {
  const revealElements = document.querySelectorAll('.reveal');
  
  // Create intersection observer
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
      }
    });
  }, {
    threshold: 0.15, // Trigger when 15% of the element is visible
    rootMargin: '0px 0px -60px 0px' // Negative bottom margin to trigger earlier
  });
  
  // Observe all reveal elements
  revealElements.forEach(element => {
    observer.observe(element);
  });
}

// Initialize hover animations
function initHoverAnimations() {
  // Add hover effects to project cards
  document.querySelectorAll('.project-card').forEach(card => {
    card.addEventListener('mouseenter', () => {
      card.classList.add('hover');
    });
    
    card.addEventListener('mouseleave', () => {
      card.classList.remove('hover');
    });
  });
}

// Initialize smooth transitions between sections
function initSmoothTransitions() {
  // Add reveal classes to sections if not already present
  const sections = document.querySelectorAll('section');
  sections.forEach((section, index) => {
    // Add staggered delay based on section index
    const delay = 100 + (index * 50); // Staggered delay
    section.style.setProperty('--reveal-delay', `${delay}ms`);
    
    if (!section.classList.contains('reveal')) {
      section.classList.add('reveal');
      section.classList.add('reveal-section');
    }
  });
  
  // Add smooth transition to navigation links
  const navLinks = document.querySelectorAll('.nav-links a, .footer-links a');
  navLinks.forEach(link => {
    link.addEventListener('click', function(e) {
      const targetId = this.getAttribute('href');
      if (targetId.startsWith('#') && targetId.length > 1) {
        e.preventDefault();
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
          // Smooth scroll with offset for header
          const headerOffset = 80;
          const elementPosition = targetElement.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
          
          window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
          });
        }
      }
    });
  });
}
