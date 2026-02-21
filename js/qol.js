/**
 * qol.js
 * Quality-of-life enhancements
 * - Scroll-to-top button with progress ring
 * - Section navigation dots
 * - Toast notification system
 * - Image lazy-load with fade-in
 * - Copy-to-clipboard on email/phone
 * - Auto theme detection from prefers-color-scheme
 */

document.addEventListener('DOMContentLoaded', () => {

  /* ========== 2. SECTION NAVIGATION DOTS ========== */
  const initSectionDots = () => {
    const sections = document.querySelectorAll('section[id]');
    if (sections.length === 0) return;

    const nav = document.createElement('nav');
    nav.className = 'section-dots';
    nav.setAttribute('aria-label', 'Section navigation');

    const labelMap = {
      hero: 'Home',
      about: 'About',
      philosophy: 'Contact',
      skills: 'Skills',
      skillchart: 'Tech Stack',
      projects: 'Projects'
    };

    sections.forEach(section => {
      const id = section.getAttribute('id');
      const label = labelMap[id] || id;
      const dot = document.createElement('button');
      dot.className = 'section-dot';
      dot.setAttribute('data-section', id);
      dot.setAttribute('data-label', label);
      dot.setAttribute('aria-label', `Go to ${label}`);
      nav.appendChild(dot);

      dot.addEventListener('click', () => {
        const navHeight = document.querySelector('.navigation')?.offsetHeight || 0;
        window.scrollTo({
          top: section.offsetTop - navHeight,
          behavior: 'smooth'
        });
      });
    });

    document.body.appendChild(nav);

    const updateActiveDot = () => {
      const scrollPos = window.scrollY + window.innerHeight / 3;

      // Show dots only after scrolling past the hero
      if (window.scrollY > 200) {
        nav.classList.add('visible');
      } else {
        nav.classList.remove('visible');
      }

      sections.forEach(section => {
        const top = section.offsetTop;
        const bottom = top + section.offsetHeight;
        const id = section.getAttribute('id');
        const dot = nav.querySelector(`[data-section="${id}"]`);
        if (!dot) return;

        if (scrollPos >= top && scrollPos < bottom) {
          dot.classList.add('active');
        } else {
          dot.classList.remove('active');
        }
      });
    };

    window.addEventListener('scroll', updateActiveDot, { passive: true });
    updateActiveDot();
  };

  /* ========== 3. TOAST NOTIFICATION SYSTEM ========== */
  const initToastSystem = () => {
    // Create container
    let container = document.querySelector('.toast-container');
    if (!container) {
      container = document.createElement('div');
      container.className = 'toast-container';
      document.body.appendChild(container);
    }

    /**
     * Show a toast notification
     * @param {string} message
     * @param {'success'|'error'|'info'} type
     * @param {number} duration  ms before auto-dismiss
     */
    const showToast = (message, type = 'info', duration = 3000) => {
      const iconMap = {
        success: 'fa-check-circle',
        error: 'fa-exclamation-circle',
        info: 'fa-info-circle'
      };

      const toast = document.createElement('div');
      toast.className = `toast toast--${type}`;
      toast.innerHTML = `<i class="fas ${iconMap[type] || iconMap.info}"></i><span>${message}</span>`;
      container.appendChild(toast);

      // Auto-dismiss
      setTimeout(() => {
        toast.classList.add('toast-out');
        toast.addEventListener('animationend', () => toast.remove());
      }, duration);
    };

    // Expose globally
    window.showToast = showToast;
  };

  /* ========== 4. IMAGE LAZY-LOAD WITH FADE-IN ========== */
  const initLazyImages = () => {
    const images = document.querySelectorAll('img.gif-embed, img.gif-hero, img.gif-about, img.gif-about-secondary, img.gif-philosophy');

    if (!('IntersectionObserver' in window)) {
      // Fallback: just mark all loaded
      images.forEach(img => img.classList.add('loaded'));
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          // If src is already set, just fade in
          if (img.complete) {
            img.classList.add('loaded');
          } else {
            img.addEventListener('load', () => img.classList.add('loaded'), { once: true });
            img.addEventListener('error', () => img.classList.add('loaded'), { once: true });
          }
          observer.unobserve(img);
        }
      });
    }, { rootMargin: '100px' });

    images.forEach(img => {
      img.classList.add('lazy-img');
      observer.observe(img);
    });
  };

  /* ========== 5. COPY-TO-CLIPBOARD ON EMAIL / PHONE ========== */
  const initCopyToClipboard = () => {
    const emailLink = document.querySelector('.email-link');
    const phoneLink = document.querySelector('.phone-link');
    const discordCopyBtn = document.querySelector('.contact-hub-copy');

    const attachCopy = (el, textFn) => {
      if (!el) return;
      el.classList.add('copy-tooltip');

      el.addEventListener('click', (e) => {
        e.preventDefault();
        const text = textFn();
        navigator.clipboard.writeText(text).then(() => {
          el.classList.add('copied');
          window.showToast?.(`Copied: ${text}`, 'success', 2000);
          setTimeout(() => el.classList.remove('copied'), 2000);
        }).catch(() => {
          // Fallback
          const ta = document.createElement('textarea');
          ta.value = text;
          ta.style.position = 'fixed';
          ta.style.opacity = '0';
          document.body.appendChild(ta);
          ta.select();
          document.execCommand('copy');
          ta.remove();
          el.classList.add('copied');
          window.showToast?.(`Copied: ${text}`, 'success', 2000);
          setTimeout(() => el.classList.remove('copied'), 2000);
        });
      });
    };

    attachCopy(emailLink, () => {
      const span = emailLink.querySelector('span');
      return span ? span.textContent.trim() : emailLink.textContent.trim();
    });

    attachCopy(phoneLink, () => {
      const span = phoneLink.querySelector('span');
      return span ? span.textContent.trim() : phoneLink.textContent.trim();
    });

    attachCopy(discordCopyBtn, () => discordCopyBtn?.dataset.copy || '@quazar_elsy');
  };

  /* ========== 8. KEYBOARD SHORTCUT HINTS ========== */
  const initKeyboardShortcuts = () => {
    document.addEventListener('keydown', (e) => {
      // Don't trigger if user is typing in an input
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement.tagName)) return;

      switch (e.key) {
        case 'Home':
          e.preventDefault();
          window.scrollTo({ top: 0, behavior: 'smooth' });
          break;
        case 'End':
          e.preventDefault();
          window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
          break;
      }
    });
  };

  /* ========== INIT ALL ========== */
  initSectionDots();
  initToastSystem();
  initLazyImages();
  initCopyToClipboard();
  initKeyboardShortcuts();
});
