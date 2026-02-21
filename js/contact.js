/**
 * Contact form functionality
 * Handles form validation, submission, and interactive effects
 * Uses EmailJS to send messages to nepal00909@gmail.com
 *
 * Setup (one-time):
 *  1. Go to https://www.emailjs.com and sign up (free)
 *  2. Add a Gmail service → copy the Service ID
 *  3. Create an email template with variables: {{from_name}}, {{from_email}}, {{message}}
 *     Set "To Email" in the template to nepal00909@gmail.com
 *  4. Copy your Public Key from Account → API Keys
 *  5. Fill in the three constants below
 */
const EMAILJS_PUBLIC_KEY  = '4wmw1RRDCRDddoc6-';   // e.g. 'abc123XYZ'
const EMAILJS_SERVICE_ID  = 'service_k8hvb5f';   // e.g. 'service_xxxxxx'
const EMAILJS_TEMPLATE_ID = 'template_axux0ms';  // e.g. 'template_xxxxxx'

document.addEventListener('DOMContentLoaded', () => {
  // Initialise EmailJS
  if (typeof emailjs !== 'undefined') {
    emailjs.init({ publicKey: EMAILJS_PUBLIC_KEY });
  }

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
      
      // Send via EmailJS
      emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, {
        name:    formDataObj.name,
        email:   formDataObj.email,
        message: formDataObj.message,
      })
      .then(() => {
        // Success
        contactForm.innerHTML = `
          <div class="form-success">
            <div class="success-icon">
              <i class="fas fa-check-circle"></i>
            </div>
            <h3>Message Sent!</h3>
            <p>Thanks for reaching out — I'll get back to you soon.</p>
          </div>
        `;
        const successDiv = contactForm.querySelector('.form-success');
        successDiv.style.textAlign = 'center';
        successDiv.style.padding = '2rem';
        const successIcon = successDiv.querySelector('.success-icon');
        successIcon.style.fontSize = '4rem';
        successIcon.style.color = 'var(--color-success)';
        successIcon.style.marginBottom = '1rem';
        successDiv.classList.add('fadeInUp', 'animated');
      })
      .catch((err) => {
        // Restore button and show error
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalBtnText;
        console.error('EmailJS error:', err);

        let errDiv = contactForm.querySelector('.form-send-error');
        if (!errDiv) {
          errDiv = document.createElement('div');
          errDiv.className = 'form-send-error';
          errDiv.style.cssText = 'color:var(--color-error);font-size:var(--text-sm);margin-top:1rem;text-align:center;';
          contactForm.appendChild(errDiv);
        }
        errDiv.textContent = 'Failed to send — please try emailing nepal00909@gmail.com directly.';
      });
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
