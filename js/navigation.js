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
  const soundButton = document.getElementById('sound-button');
  
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
  
  // Sound toggle functionality
  if (soundButton) {
    // Audio context and sounds would be initialized in main.js
    // This just handles the button toggle
    let soundEnabled = false;
    
    soundButton.addEventListener('click', () => {
      soundEnabled = !soundEnabled;
      
      // Toggle icon
      if (soundEnabled) {
        soundButton.innerHTML = '<i class="fas fa-volume-up"></i>';
        // Event for other scripts to listen to
        document.dispatchEvent(new CustomEvent('sound-enabled'));
      } else {
        soundButton.innerHTML = '<i class="fas fa-volume-mute"></i>';
        document.dispatchEvent(new CustomEvent('sound-disabled'));
      }
    });
  }
  
  // Add theme switcher to DOM if it doesn't exist
  if (!document.querySelector('.theme-switcher')) {
    const themeSwitcher = document.createElement('div');
    themeSwitcher.className = 'theme-switcher';
    
    // Create theme buttons
    const themes = [
      { name: 'default', label: 'Default Theme' },
      { name: 'cosmic', label: 'Cosmic Theme' },
      { name: 'cyberpunk', label: 'Cyberpunk Theme' },
      { name: 'brutalist', label: 'Brutalist Theme' },
      { name: 'synthwave', label: 'Synthwave Theme' },
      { name: 'experimental', label: 'Experimental Theme' }
    ];
    
    themes.forEach(theme => {
      const button = document.createElement('button');
      button.className = `theme-btn theme-${theme.name}`;
      button.setAttribute('data-theme', theme.name);
      button.setAttribute('aria-label', theme.label);
      button.title = theme.label;
      
      // Set default theme as active
      if (theme.name === 'default') {
        button.classList.add('active');
      }
      
      themeSwitcher.appendChild(button);
    });
    
    document.body.appendChild(themeSwitcher);
    
    // Theme switching functionality
    const themeButtons = document.querySelectorAll('.theme-btn');
    
    themeButtons.forEach(button => {
      button.addEventListener('click', () => {
        const theme = button.getAttribute('data-theme');
        
        // Remove active class from all buttons
        themeButtons.forEach(btn => btn.classList.remove('active'));
        
        // Add active class to clicked button
        button.classList.add('active');
        
        // Set theme on body
        document.body.setAttribute('data-theme', theme);
        
        // Save theme preference to localStorage
        localStorage.setItem('theme', theme);
      });
    });
    
    // Load saved theme from localStorage
    const savedTheme = localStorage.getItem('theme');
    
    if (savedTheme) {
      document.body.setAttribute('data-theme', savedTheme);
      
      // Set active class on the corresponding button
      const activeButton = document.querySelector(`.theme-btn[data-theme="${savedTheme}"]`);
      if (activeButton) {
        themeButtons.forEach(btn => btn.classList.remove('active'));
        activeButton.classList.add('active');
      }
    }
  }
});
