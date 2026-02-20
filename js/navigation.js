/**
 * Navigation functionality
 * Handles mobile menu toggle, scroll effects, and smooth scrolling
 */

document.addEventListener('DOMContentLoaded', () => {
  // Elements
  const navigation = document.querySelector('.navigation');
  const navToggle = document.querySelector('.nav-toggle');
  const navLinks = document.querySelector('.nav-links');
  const navItems = document.querySelectorAll('.nav-links li');
  
  // Set index for staggered animation
  navItems.forEach((item, index) => {
    item.style.setProperty('--i', index);
  });
  
  // Toggle mobile menu
  if (navToggle) {
    navToggle.addEventListener('click', () => {
      navToggle.classList.toggle('active');
      navLinks.classList.toggle('active');
      
      // Toggle body scroll when menu is open
      if (navLinks.classList.contains('active')) {
        document.body.style.overflow = 'hidden';
      } else {
        document.body.style.overflow = '';
      }
    });
  }
  
  // Close mobile menu when clicking on a link
  navItems.forEach(item => {
    const link = item.querySelector('a');
    if (link) {
      link.addEventListener('click', () => {
        navToggle.classList.remove('active');
        navLinks.classList.remove('active');
        document.body.style.overflow = '';
      });
    }
  });
  
  // Scroll effect for navigation
  const handleScroll = () => {
    const scrollPosition = window.scrollY;
    
    if (scrollPosition > 50) {
      navigation.classList.add('scrolled');
    } else {
      navigation.classList.remove('scrolled');
    }
    
    // Highlight active section in navigation
    const sections = document.querySelectorAll('section[id]');
    
    sections.forEach(section => {
      const sectionTop = section.offsetTop - 100;
      const sectionHeight = section.offsetHeight;
      const sectionId = section.getAttribute('id');
      
      if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
        document.querySelector(`.nav-links a[href="#${sectionId}"]`)?.classList.add('active');
      } else {
        document.querySelector(`.nav-links a[href="#${sectionId}"]`)?.classList.remove('active');
      }
    });
  };
  
  window.addEventListener('scroll', handleScroll);
  
  // Call once on load to set initial state
  handleScroll();
  
  // Smooth scroll for anchor links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      e.preventDefault();
      
      const targetId = this.getAttribute('href');
      
      // Skip if it's just "#"
      if (targetId === '#') return;
      
      const targetElement = document.querySelector(targetId);
      
      if (targetElement) {
        // Get navigation height for offset
        const navHeight = navigation.offsetHeight;
        
        // Calculate position with offset
        const targetPosition = targetElement.offsetTop - navHeight;
        
        // Smooth scroll to target
        window.scrollTo({
          top: targetPosition,
          behavior: 'smooth'
        });
      }
    });
  });
  
  
  // Color Palette button + panel
  if (!document.querySelector('.palette-toggle')) {
    const themes = [
      { name: 'default', label: 'Default' },
      { name: 'cosmic', label: 'Cosmic' },
      { name: 'cyberpunk', label: 'Cyberpunk' },
      { name: 'brutalist', label: 'Brutalist' },
      { name: 'synthwave', label: 'Synthwave' },
      { name: 'experimental', label: 'Experimental' }
    ];

    // Toggle button
    const toggle = document.createElement('button');
    toggle.className = 'palette-toggle';
    toggle.setAttribute('aria-label', 'Color Palette');
    toggle.innerHTML = '<i class="fas fa-palette"></i>';
    document.body.appendChild(toggle);

    // Panel
    const panel = document.createElement('div');
    panel.className = 'palette-panel';
    panel.innerHTML = '<span class="palette-title">Color Palette</span>';

    const grid = document.createElement('div');
    grid.className = 'palette-grid';

    themes.forEach(theme => {
      const btn = document.createElement('button');
      btn.className = `theme-btn theme-${theme.name}`;
      btn.setAttribute('data-theme', theme.name);
      btn.setAttribute('aria-label', theme.label);
      btn.title = theme.label;

      const label = document.createElement('span');
      label.className = 'theme-label';
      label.textContent = theme.label;

      const wrapper = document.createElement('div');
      wrapper.className = 'palette-option';
      wrapper.appendChild(btn);
      wrapper.appendChild(label);
      grid.appendChild(wrapper);
    });

    panel.appendChild(grid);
    document.body.appendChild(panel);

    // Toggle panel open/close
    let panelOpen = false;
    toggle.addEventListener('click', (e) => {
      e.stopPropagation();
      panelOpen = !panelOpen;
      panel.classList.toggle('open', panelOpen);
      toggle.classList.toggle('active', panelOpen);
    });

    // Close panel when clicking outside
    document.addEventListener('click', (e) => {
      if (panelOpen && !panel.contains(e.target) && e.target !== toggle) {
        panelOpen = false;
        panel.classList.remove('open');
        toggle.classList.remove('active');
      }
    });

    // Theme switching
    const themeButtons = panel.querySelectorAll('.theme-btn');
    themeButtons.forEach(button => {
      button.addEventListener('click', () => {
        const theme = button.getAttribute('data-theme');
        themeButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
        document.body.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
      });
    });

    // Load saved theme
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      document.body.setAttribute('data-theme', savedTheme);
      const activeButton = panel.querySelector(`.theme-btn[data-theme="${savedTheme}"]`);
      if (activeButton) {
        themeButtons.forEach(btn => btn.classList.remove('active'));
        activeButton.classList.add('active');
      }
    } else {
      // Mark default as active
      const defaultBtn = panel.querySelector('.theme-btn[data-theme="default"]');
      if (defaultBtn) defaultBtn.classList.add('active');
    }
  }
});
