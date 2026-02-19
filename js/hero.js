/**
 * Hero section animation
 * Creates an interactive canvas background for the hero section
 */

document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('hero-canvas');
  
  if (!canvas) return;
  
  const ctx = canvas.getContext('2d');
  const heroSection = document.querySelector('.hero-section');
  
  // Set canvas size to match hero section
  const resizeCanvas = () => {
    canvas.width = heroSection.offsetWidth;
    canvas.height = heroSection.offsetHeight;
  };
  
  // Call resize on load and window resize
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);
  
  // Get theme colors from CSS variables
  const getThemeColors = () => {
    const styles = getComputedStyle(document.documentElement);
    return {
      accent1: styles.getPropertyValue('--color-accent-1').trim(),
      accent2: styles.getPropertyValue('--color-accent-2').trim(),
      accent3: styles.getPropertyValue('--color-accent-3').trim(),
      bg: styles.getPropertyValue('--color-bg-primary').trim()
    };
  };
  
  // Particle system
  class ParticleSystem {
    constructor() {
      this.particles = [];
      this.connections = [];
      this.colors = getThemeColors();
      this.mousePosition = { x: null, y: null };
      this.mouseRadius = 150;
      
      // Create initial particles
      this.createParticles();
      
      // Track mouse position
      window.addEventListener('mousemove', (e) => {
        const rect = canvas.getBoundingClientRect();
        this.mousePosition = {
          x: e.clientX - rect.left,
          y: e.clientY - rect.top
        };
      });
      
      // Reset mouse position when mouse leaves
      window.addEventListener('mouseout', () => {
        this.mousePosition = { x: null, y: null };
      });
      
      // Update colors when theme changes
      document.addEventListener('click', (e) => {
        if (e.target.classList.contains('theme-btn')) {
          setTimeout(() => {
            this.colors = getThemeColors();
            this.updateParticleColors();
          }, 100);
        }
      });
    }
    
    createParticles() {
      // Number of particles based on screen size
      const particleCount = Math.min(Math.floor(canvas.width * canvas.height / 10000), 100);
      
      for (let i = 0; i < particleCount; i++) {
        this.particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          size: Math.random() * 2 + 1,
          speedX: (Math.random() - 0.5) * 0.5,
          speedY: (Math.random() - 0.5) * 0.5,
          color: this.getRandomColor()
        });
      }
    }
    
    updateParticleColors() {
      this.particles.forEach(particle => {
        particle.color = this.getRandomColor();
      });
    }
    
    getRandomColor() {
      const colors = [this.colors.accent1, this.colors.accent2, this.colors.accent3];
      return colors[Math.floor(Math.random() * colors.length)];
    }
    
    update() {
      // Clear previous connections
      this.connections = [];
      
      // Update particles
      this.particles.forEach(particle => {
        // Move particles
        particle.x += particle.speedX;
        particle.y += particle.speedY;
        
        // Bounce off edges
        if (particle.x > canvas.width || particle.x < 0) {
          particle.speedX = -particle.speedX;
        }
        
        if (particle.y > canvas.height || particle.y < 0) {
          particle.speedY = -particle.speedY;
        }
        
        // Mouse interaction
        if (this.mousePosition.x !== null && this.mousePosition.y !== null) {
          const dx = this.mousePosition.x - particle.x;
          const dy = this.mousePosition.y - particle.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance < this.mouseRadius) {
            const angle = Math.atan2(dy, dx);
            const force = (this.mouseRadius - distance) / this.mouseRadius;
            
            // Push particles away from mouse
            particle.x -= Math.cos(angle) * force * 2;
            particle.y -= Math.sin(angle) * force * 2;
          }
        }
        
        // Find connections between particles
        this.particles.forEach(otherParticle => {
          if (particle === otherParticle) return;
          
          const dx = particle.x - otherParticle.x;
          const dy = particle.y - otherParticle.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          // Connect particles within range
          if (distance < 100) {
            this.connections.push({
              start: particle,
              end: otherParticle,
              distance: distance
            });
          }
        });
      });
    }
    
    draw() {
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Draw connections first (behind particles)
      this.connections.forEach(connection => {
        ctx.beginPath();
        ctx.moveTo(connection.start.x, connection.start.y);
        ctx.lineTo(connection.end.x, connection.end.y);
        
        // Line opacity based on distance
        const opacity = 1 - (connection.distance / 100);
        ctx.strokeStyle = `rgba(255, 255, 255, ${opacity * 0.2})`;
        ctx.lineWidth = 0.5;
        ctx.stroke();
      });
      
      // Draw particles
      this.particles.forEach(particle => {
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fillStyle = particle.color;
        ctx.fill();
      });
    }
    
    animate() {
      this.update();
      this.draw();
      requestAnimationFrame(() => this.animate());
    }
  }
  
  // Initialize and start animation
  const particleSystem = new ParticleSystem();
  particleSystem.animate();
  
  // Text animation for hero content
  const animateHeroText = () => {
    const heroTitle = document.querySelector('.hero-content h1');
    const heroTagline = document.querySelector('.hero-tagline');
    const heroCta = document.querySelector('.hero-cta');
    
    // Add animation classes with delays
    setTimeout(() => {
      heroTitle?.classList.add('fadeInUp', 'animated');
    }, 300);
    
    setTimeout(() => {
      heroTagline?.classList.add('fadeInUp', 'animated');
    }, 600);
    
    setTimeout(() => {
      heroCta?.classList.add('fadeInUp', 'animated');
    }, 900);
  };
  
  // Add animation classes
  const addAnimationClasses = () => {
    const heroContent = document.querySelector('.hero-content');
    
    if (heroContent) {
      const h1 = heroContent.querySelector('h1');
      const p = heroContent.querySelector('p');
      const cta = heroContent.querySelector('.hero-cta');
      
      if (h1) h1.classList.add('fadeInUp', 'animated');
      if (p) p.classList.add('fadeInUp', 'animated', 'delay-300');
      if (cta) cta.classList.add('fadeInUp', 'animated', 'delay-500');
    }
  };
  
  // Initialize text animations
  addAnimationClasses();
  
  // Parallax effect on scroll
  window.addEventListener('scroll', () => {
    const scrollPosition = window.scrollY;
    
    // Parallax effect for hero section
    if (scrollPosition < window.innerHeight) {
      const parallaxOffset = scrollPosition * 0.4;
      canvas.style.transform = `translateY(${parallaxOffset}px)`;
      
      // Fade out hero content on scroll
      const heroContent = document.querySelector('.hero-content');
      if (heroContent) {
        const opacity = 1 - (scrollPosition / (window.innerHeight * 0.5));
        heroContent.style.opacity = Math.max(opacity, 0);
      }
    }
  });
});
