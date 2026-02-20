/**
 * Contact form functionality
 * Handles form validation, submission, and interactive effects
 */

document.addEventListener('DOMContentLoaded', () => {
  const contactForm = document.getElementById('contact-form');
  const formInputs = document.querySelectorAll('.input-container input, .input-container textarea');
  
  // Form validation
  const validateForm = () => {
    let isValid = true;
    
    // Check each input
    formInputs.forEach(input => {
      if (!input.value.trim()) {
        isValid = false;
        showError(input, 'This field is required');
      } else {
        clearError(input);
        
        // Email validation
        if (input.type === 'email' && !validateEmail(input.value)) {
          isValid = false;
          showError(input, 'Please enter a valid email address');
        }
      }
    });
    
    return isValid;
  };
  
  // Email validation regex
  const validateEmail = (email) => {
    const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
  };
  
  // Show error message
  const showError = (input, message) => {
    const container = input.closest('.input-container');
    
    // Remove existing error message if any
    clearError(input);
    
    // Create error message element
    const errorElement = document.createElement('div');
    errorElement.className = 'error-message';
    errorElement.textContent = message;
    
    // Style error message
    errorElement.style.color = 'var(--color-error)';
    errorElement.style.fontSize = 'var(--text-xs)';
    errorElement.style.marginTop = '0.5rem';
    errorElement.style.opacity = '0';
    errorElement.style.transform = 'translateY(-0.5rem)';
    errorElement.style.transition = 'all 0.3s ease';
    
    // Add error class to input container
    container.classList.add('error');
    
    // Add error message to container
    container.appendChild(errorElement);
    
    // Trigger animation
    setTimeout(() => {
      errorElement.style.opacity = '1';
      errorElement.style.transform = 'translateY(0)';
    }, 10);
  };
  
  // Clear error message
  const clearError = (input) => {
    const container = input.closest('.input-container');
    const errorElement = container.querySelector('.error-message');
    
    if (errorElement) {
      // Fade out error message
      errorElement.style.opacity = '0';
      errorElement.style.transform = 'translateY(-0.5rem)';
      
      // Remove after animation
      setTimeout(() => {
        errorElement.remove();
      }, 300);
    }
    
    // Remove error class
    container.classList.remove('error');
  };
  
  // Form submission
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      // Validate form
      if (!validateForm()) {
        return;
      }
      
      // Get form data
      const formData = new FormData(contactForm);
      const formDataObj = Object.fromEntries(formData.entries());
      
      // Show loading state
      const submitBtn = contactForm.querySelector('.submit-btn');
      const originalBtnText = submitBtn.innerHTML;
      
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<span class="btn-text">Sending...</span><span class="btn-icon"><i class="fas fa-spinner fa-spin"></i></span>';
      
      // In a real implementation, you would send the form data to a server
      // For this demo, we'll simulate a successful submission after a delay
      setTimeout(() => {
        // Show success message
        contactForm.innerHTML = `
          <div class="form-success">
            <div class="success-icon">
              <i class="fas fa-check-circle"></i>
            </div>
            <h3>Message Sent!</h3>
            <p>Thank you for reaching out. I'll get back to you soon.</p>
          </div>
        `;
        
        // Style success message
        const successDiv = contactForm.querySelector('.form-success');
        successDiv.style.textAlign = 'center';
        successDiv.style.padding = '2rem';
        
        const successIcon = successDiv.querySelector('.success-icon');
        successIcon.style.fontSize = '4rem';
        successIcon.style.color = 'var(--color-success)';
        successIcon.style.marginBottom = '1rem';
        
        // Add animation
        successDiv.classList.add('fadeInUp', 'animated');
        
        // Log form data to console (for demo purposes)
        console.log('Form submitted with data:', formDataObj);
      }, 2000);
    });
  }
  
  // Input focus effects
  formInputs.forEach(input => {
    // Check if input has value on load
    if (input.value.trim() !== '') {
      input.parentElement.classList.add('has-value');
    }
    
    // Focus event
    input.addEventListener('focus', () => {
      input.parentElement.classList.add('focused');
    });
    
    // Blur event
    input.addEventListener('blur', () => {
      input.parentElement.classList.remove('focused');
      
      // Add/remove has-value class based on input value
      if (input.value.trim() !== '') {
        input.parentElement.classList.add('has-value');
      } else {
        input.parentElement.classList.remove('has-value');
      }
    });
    
    // Input event
    input.addEventListener('input', () => {
      // Clear error when user starts typing
      clearError(input);
    });
  });
  
  // Interactive form field effects
  const addFormFieldEffects = () => {
    const inputContainers = document.querySelectorAll('.input-container');
    
    inputContainers.forEach(container => {
      // Create ripple effect on focus
      container.addEventListener('click', (e) => {
        const input = container.querySelector('input, textarea');
        if (input) {
          input.focus();
          
          // Create ripple element
          const ripple = document.createElement('span');
          ripple.className = 'input-ripple';
          
          // Position ripple at click position
          const rect = container.getBoundingClientRect();
          const x = e.clientX - rect.left;
          const y = e.clientY - rect.top;
          
          // Style ripple
          ripple.style.position = 'absolute';
          ripple.style.width = '10px';
          ripple.style.height = '10px';
          ripple.style.borderRadius = '50%';
          ripple.style.backgroundColor = 'var(--color-accent-2)';
          ripple.style.opacity = '0.5';
          ripple.style.transform = 'scale(0)';
          ripple.style.left = `${x}px`;
          ripple.style.top = `${y}px`;
          ripple.style.transition = 'transform 0.6s ease-out, opacity 0.6s ease-out';
          
          // Add ripple to container
          container.appendChild(ripple);
          
          // Trigger animation
          setTimeout(() => {
            ripple.style.transform = 'scale(100)';
            ripple.style.opacity = '0';
          }, 10);
          
          // Remove ripple after animation
          setTimeout(() => {
            ripple.remove();
          }, 600);
        }
      });
    });
  };
  
  // Initialize form field effects
  addFormFieldEffects();
  
  // Social links hover effects
  const socialLinks = document.querySelectorAll('.social-link');
  
  socialLinks.forEach(link => {
    link.addEventListener('mouseenter', () => {
      link.classList.add('hover');
    });
    
    link.addEventListener('mouseleave', () => {
      link.classList.remove('hover');
    });
  });
});
