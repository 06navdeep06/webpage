/**
 * Main JavaScript file
 * Initializes all components and handles global functionality
 */

document.addEventListener('DOMContentLoaded', () => {
  // Performance optimization: Load non-critical scripts after page load
  const loadNonCriticalScripts = () => {
    // List of non-critical scripts that can be loaded after page render
    const scripts = [
      // Add any additional scripts here that aren't critical for initial render
    ];
    
    scripts.forEach(src => {
      const script = document.createElement('script');
      script.src = src;
      script.async = true;
      document.body.appendChild(script);
    });
  };
  
  // Initialize CSS files dynamically
  const initializeStyles = () => {
    // Check if we need to add stylesheet links
    const existingLinks = document.querySelectorAll('link[rel="stylesheet"]');
    const requiredStyles = [
      'css/globals.css',
      'css/layout.css',
      'css/components.css',
      'css/animations.css',
      'css/themes.css'
    ];
    
    // Filter out styles that are already loaded
    const loadedStyles = Array.from(existingLinks).map(link => link.href);
    const stylesToLoad = requiredStyles.filter(style => 
      !loadedStyles.some(loaded => loaded.includes(style))
    );
    
    // Add any missing stylesheet links
    stylesToLoad.forEach(href => {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = href;
      document.head.appendChild(link);
    });
  };
  
  // Initialize page preloader
  const initPreloader = () => {
    // Create preloader if it doesn't exist
    if (!document.querySelector('.preloader')) {
      const preloader = document.createElement('div');
      preloader.className = 'preloader';
      preloader.innerHTML = `
        <div class="preloader-content">
          <div class="preloader-spinner"></div>
        </div>
      `;
      
      // Style preloader
      preloader.style.position = 'fixed';
      preloader.style.top = '0';
      preloader.style.left = '0';
      preloader.style.width = '100%';
      preloader.style.height = '100%';
      preloader.style.backgroundColor = 'var(--color-bg-primary)';
      preloader.style.display = 'flex';
      preloader.style.justifyContent = 'center';
      preloader.style.alignItems = 'center';
      preloader.style.zIndex = '9999';
      preloader.style.transition = 'opacity 0.5s ease, visibility 0.5s ease';
      
      const spinner = preloader.querySelector('.preloader-spinner');
      spinner.style.width = '50px';
      spinner.style.height = '50px';
      spinner.style.border = '3px solid var(--color-bg-tertiary)';
      spinner.style.borderTopColor = 'var(--color-accent-1)';
      spinner.style.borderRadius = '50%';
      spinner.style.animation = 'spin 1s infinite linear';
      
      // Add preloader to body
      document.body.appendChild(preloader);
      
      // Hide preloader when page is loaded
      window.addEventListener('load', () => {
        setTimeout(() => {
          preloader.style.opacity = '0';
          preloader.style.visibility = 'hidden';
          
          // Remove preloader after animation
          setTimeout(() => {
            preloader.remove();
          }, 500);
        }, 500);
      });
    }
  };
  
  // Initialize page transitions
  const initPageTransitions = () => {
    // Add transition class to body
    document.body.classList.add('page-transition');
    
    // Add transition styles if not already in document
    if (!document.querySelector('#transition-styles')) {
      const style = document.createElement('style');
      style.id = 'transition-styles';
      style.textContent = `
        .page-transition {
          opacity: 0;
          animation: fadeIn 0.5s ease forwards;
        }
        
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `;
      document.head.appendChild(style);
    }
  };
  
  // Initialize performance optimizations
  const initPerformanceOptimizations = () => {
    // Lazy load images
    const lazyImages = document.querySelectorAll('img[loading="lazy"]');
    
    if ('IntersectionObserver' in window) {
      const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target;
            img.src = img.dataset.src;
            imageObserver.unobserve(img);
          }
        });
      });
      
      lazyImages.forEach(img => {
        // Set data-src if not already set
        if (!img.dataset.src && img.src) {
          img.dataset.src = img.src;
          img.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1 1"%3E%3C/svg%3E';
        }
        
        imageObserver.observe(img);
      });
    } else {
      // Fallback for browsers without IntersectionObserver
      lazyImages.forEach(img => {
        if (img.dataset.src) {
          img.src = img.dataset.src;
        }
      });
    }
    
    // Defer non-critical CSS
    const deferredStyles = document.querySelectorAll('link[rel="stylesheet"][media="print"]');
    window.addEventListener('load', () => {
      deferredStyles.forEach(link => {
        link.media = 'all';
      });
    });
  };
  
  // Initialize accessibility features
  const initAccessibility = () => {
    // Add skip to content link if not present
    if (!document.querySelector('.skip-to-content')) {
      const skipLink = document.createElement('a');
      skipLink.className = 'skip-to-content';
      skipLink.href = '#hero';
      skipLink.textContent = 'Skip to content';
      
      // Style skip link
      skipLink.style.position = 'absolute';
      skipLink.style.top = '-40px';
      skipLink.style.left = '0';
      skipLink.style.padding = '8px';
      skipLink.style.backgroundColor = 'var(--color-accent-1)';
      skipLink.style.color = 'var(--color-text-primary)';
      skipLink.style.zIndex = '9999';
      skipLink.style.transition = 'top 0.3s ease';
      
      // Show skip link on focus
      skipLink.addEventListener('focus', () => {
        skipLink.style.top = '0';
      });
      
      skipLink.addEventListener('blur', () => {
        skipLink.style.top = '-40px';
      });
      
      document.body.insertBefore(skipLink, document.body.firstChild);
    }
    
    // Add ARIA labels to elements that need them
    document.querySelectorAll('a[href="#"]').forEach(link => {
      if (!link.getAttribute('aria-label')) {
        link.setAttribute('aria-label', link.textContent || 'Link');
      }
    });
    
    // Add keyboard navigation for interactive elements
    document.querySelectorAll('.project-card, .skill-tag, .social-link').forEach(element => {
      if (!element.getAttribute('tabindex')) {
        element.setAttribute('tabindex', '0');
      }
      
      // Add keyboard event listener
      element.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          element.click();
        }
      });
    });
  };
  
  // Initialize analytics (placeholder)
  const initAnalytics = () => {
    // This would be where you initialize analytics in a real project
    // For this demo, we'll just log page views to console
    console.log('Page view:', window.location.pathname);
    
    // Track events
    const trackEvent = (category, action, label) => {
      console.log('Event tracked:', { category, action, label });
      // In a real implementation, you would send this to your analytics service
    };
    
    // Track clicks on important elements
    document.querySelectorAll('a, button, .project-card').forEach(element => {
      element.addEventListener('click', () => {
        let category = 'interaction';
        let action = 'click';
        let label = element.textContent || element.className;
        
        if (element.tagName === 'A') {
          category = 'navigation';
          label = element.href;
        } else if (element.classList.contains('project-card')) {
          category = 'project';
          label = element.querySelector('.project-title')?.textContent || 'Unknown Project';
        }
        
        trackEvent(category, action, label);
      });
    });
    
    // Track form submissions
    document.querySelectorAll('form').forEach(form => {
      form.addEventListener('submit', () => {
        trackEvent('form', 'submit', form.id || form.className);
      });
    });
    
    // Expose tracking function globally
    window.trackEvent = trackEvent;
  };
  
  // Initialize error handling
  const initErrorHandling = () => {
    window.addEventListener('error', (e) => {
      console.error('Global error:', e.message);
      // In a real implementation, you might send this to an error tracking service
    });
    
    // Handle unhandled promise rejections
    window.addEventListener('unhandledrejection', (e) => {
      console.error('Unhandled promise rejection:', e.reason);
    });
  };
  
  // Initialize all components
  const initializeAll = () => {
    // Initialize styles
    initializeStyles();
    
    // initPreloader();    // disabled: pager handles page display
    // initPageTransitions(); // disabled: sets body opacity:0, fights pager
    
    // Initialize performance optimizations
    initPerformanceOptimizations();
    
    // Initialize accessibility features
    initAccessibility();
    
    // Initialize analytics
    initAnalytics();
    
    // Initialize error handling
    initErrorHandling();
    
    // Load non-critical scripts
    loadNonCriticalScripts();
    
    // Set current year in footer
    const currentYearElement = document.getElementById('current-year');
    if (currentYearElement) {
      currentYearElement.textContent = new Date().getFullYear();
    }
    
    console.log('Portfolio website initialized successfully!');
  };
  
  // Run initialization
  initializeAll();
});
