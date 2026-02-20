/**
 * 3d-engine.js
 * Mouse-tracked 3D tilt, parallax depth layers, and volumetric hover effects
 * Gives every interactive surface a hand-crafted, physical feel
 */

document.addEventListener('DOMContentLoaded', () => {

  /* ========== CONFIGURATION ========== */
  const CONFIG = {
    tiltMax: 8,           // max degrees of rotation
    tiltSpeed: 400,       // ms transition back to flat
    tiltPerspective: 1000,
    glareOpacity: 0.07,
    parallaxStrength: 0.02,
    heroParallaxStrength: 0.04,
    isMobile: window.matchMedia('(max-width: 767px)').matches,
    prefersReducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches
  };

  if (CONFIG.prefersReducedMotion) return;

  /* ========== 1. TILT ENGINE FOR CARDS ========== */
  const initTiltCards = () => {
    const cards = document.querySelectorAll(
      '.project-card, .terminal-block, .contact-info, .philosophy-block, .sig-avatar'
    );

    cards.forEach(card => {
      card.classList.add('tilt-card');

      // Add glare overlay
      const glare = document.createElement('div');
      glare.className = 'tilt-glare';
      card.style.position = card.style.position || 'relative';
      card.appendChild(glare);

      let rect, mouseX, mouseY;
      let ticking = false;

      const updateTilt = () => {
        if (!rect) return;
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        const percentX = (mouseX - centerX) / (rect.width / 2);
        const percentY = (mouseY - centerY) / (rect.height / 2);

        const tiltX = -percentY * CONFIG.tiltMax;
        const tiltY = percentX * CONFIG.tiltMax;

        card.style.transform =
          `perspective(${CONFIG.tiltPerspective}px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) translateZ(10px)`;

        // Update glare position
        const glareX = ((mouseX - rect.left) / rect.width) * 100;
        const glareY = ((mouseY - rect.top) / rect.height) * 100;
        glare.style.setProperty('--glare-x', `${glareX}%`);
        glare.style.setProperty('--glare-y', `${glareY}%`);

        ticking = false;
      };

      card.addEventListener('mouseenter', (e) => {
        rect = card.getBoundingClientRect();
        card.style.transition = 'none';
        glare.style.opacity = '1';
      });

      card.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        if (!ticking) {
          requestAnimationFrame(updateTilt);
          ticking = true;
        }
      });

      card.addEventListener('mouseleave', () => {
        card.style.transition = `transform ${CONFIG.tiltSpeed}ms cubic-bezier(0.34, 1.56, 0.64, 1)`;
        card.style.transform =
          `perspective(${CONFIG.tiltPerspective}px) rotateX(0deg) rotateY(0deg) translateZ(0px)`;
        glare.style.opacity = '0';
        rect = null;
      });
    });
  };

  /* ========== 2. HERO PARALLAX DEPTH ========== */
  const initHeroParallax = () => {
    const hero = document.querySelector('.hero-section');
    const heroContent = document.querySelector('.hero-content');
    if (!hero || !heroContent) return;

    const h1 = heroContent.querySelector('h1');
    const typing = heroContent.querySelector('.typing-container');
    const tag = heroContent.querySelector('.terminal-tag');
    const gif = heroContent.querySelector('.hero-gif');
    const cta = heroContent.querySelector('.hero-cta');

    const layers = [
      { el: h1, depth: 60 },
      { el: typing, depth: 40 },
      { el: tag, depth: 30 },
      { el: gif, depth: 15 },
      { el: cta, depth: 25 }
    ].filter(l => l.el);

    let ticking = false;

    hero.addEventListener('mousemove', (e) => {
      if (ticking) return;
      ticking = true;

      requestAnimationFrame(() => {
        const rect = hero.getBoundingClientRect();
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        const percentX = (mouseX - centerX) / centerX;
        const percentY = (mouseY - centerY) / centerY;

        layers.forEach(({ el, depth }) => {
          const moveX = percentX * depth * CONFIG.heroParallaxStrength * 15;
          const moveY = percentY * depth * CONFIG.heroParallaxStrength * 15;
          const rotateX = -percentY * 2;
          const rotateY = percentX * 2;
          el.style.transform =
            `translate3d(${moveX}px, ${moveY}px, ${depth}px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
        });

        ticking = false;
      });
    });

    hero.addEventListener('mouseleave', () => {
      layers.forEach(({ el, depth }) => {
        el.style.transition = 'transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)';
        el.style.transform = `translateZ(${depth}px)`;
        setTimeout(() => { el.style.transition = ''; }, 600);
      });
    });
  };

  /* ========== 3. SCROLL-BASED DEPTH SHIFT ========== */
  const initScrollDepth = () => {
    const sections = document.querySelectorAll('section');
    let ticking = false;

    const update = () => {
      const viewportCenter = window.innerHeight / 2;

      sections.forEach(section => {
        const rect = section.getBoundingClientRect();
        const sectionCenter = rect.top + rect.height / 2;
        const distance = (sectionCenter - viewportCenter) / window.innerHeight;

        // Subtle rotateX based on scroll position
        const rotateX = distance * 1.5;
        const translateZ = Math.max(0, (1 - Math.abs(distance)) * 8);

        section.style.transform =
          `perspective(1200px) rotateX(${rotateX}deg) translateZ(${translateZ}px)`;
      });

      ticking = false;
    };

    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(update);
        ticking = true;
      }
    }, { passive: true });

    update();
  };

  /* ========== 4. BUTTON 3D PRESS EFFECT ========== */
  const initButtonPress = () => {
    document.querySelectorAll('.btn, .project-link, .filter-btn').forEach(btn => {
      btn.addEventListener('mousedown', () => {
        btn.style.transition = 'transform 0.08s ease';
        btn.style.transform = 'perspective(600px) translateZ(-2px) scale(0.97)';
      });

      btn.addEventListener('mouseup', () => {
        btn.style.transition = 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)';
        btn.style.transform = '';
      });

      btn.addEventListener('mouseleave', () => {
        btn.style.transition = 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)';
        btn.style.transform = '';
      });
    });
  };

  /* ========== 5. SKILL TAGS WAVE ON HOVER ========== */
  const initSkillWave = () => {
    document.querySelectorAll('.skill-category').forEach(category => {
      const tags = category.querySelectorAll('.skill-tag');

      category.addEventListener('mouseenter', () => {
        tags.forEach((tag, i) => {
          const delay = i * 30;
          setTimeout(() => {
            tag.style.transition = 'transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)';
            tag.style.transform = `translateZ(${8 + i * 2}px) translateY(-3px)`;
          }, delay);
        });
      });

      category.addEventListener('mouseleave', () => {
        tags.forEach((tag, i) => {
          const delay = i * 20;
          setTimeout(() => {
            tag.style.transition = 'transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)';
            tag.style.transform = '';
          }, delay);
        });
      });
    });
  };

  /* ========== 6. FLOATING SECTION HEADERS ========== */
  const initFloatingHeaders = () => {
    const headers = document.querySelectorAll('.section-header');

    if (!('IntersectionObserver' in window)) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const title = entry.target.querySelector('.section-title');
          const line = entry.target.querySelector('.section-line');

          if (title) {
            title.style.transition = 'transform 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)';
            title.style.transform = 'translateZ(30px)';
          }
          if (line) {
            line.style.transition = 'transform 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) 0.1s';
            line.style.transform = 'translateZ(20px)';
          }
        }
      });
    }, { threshold: 0.5 });

    headers.forEach(h => observer.observe(h));
  };

  /* ========== 7. SIGNATURE SECTION 3D HOVER ========== */
  const initSignature3D = () => {
    const canvas = document.querySelector('.signature-canvas');
    if (!canvas) return;

    let ticking = false;

    canvas.addEventListener('mousemove', (e) => {
      if (ticking) return;
      ticking = true;

      requestAnimationFrame(() => {
        const rect = canvas.getBoundingClientRect();
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        const percentX = (mouseX - centerX) / centerX;
        const percentY = (mouseY - centerY) / centerY;

        const rotateX = -percentY * 4;
        const rotateY = percentX * 4;

        canvas.style.transform =
          `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;

        ticking = false;
      });
    });

    canvas.addEventListener('mouseleave', () => {
      canvas.style.transition = 'transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)';
      canvas.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg)';
      setTimeout(() => { canvas.style.transition = ''; }, 600);
    });
  };

  /* ========== 8. GIF EMBEDS FLOAT ON SCROLL ========== */
  const initGifFloat = () => {
    const gifs = document.querySelectorAll('.gif-embed');

    if (!('IntersectionObserver' in window)) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.style.transition = 'transform 1s cubic-bezier(0.34, 1.56, 0.64, 1)';
          entry.target.style.transform = 'translateZ(20px)';
        } else {
          entry.target.style.transition = 'transform 0.6s ease';
          entry.target.style.transform = 'translateZ(0px)';
        }
      });
    }, { threshold: 0.3 });

    gifs.forEach(gif => observer.observe(gif));
  };

  /* ========== INIT ========== */
  if (!CONFIG.isMobile) {
    initTiltCards();
    initHeroParallax();
    initScrollDepth();
    initButtonPress();
    initSkillWave();
    initFloatingHeaders();
    initSignature3D();
    initGifFloat();
  } else {
    // Mobile: lighter 3D — just floating headers and gif float
    initFloatingHeaders();
    initGifFloat();
  }
});
