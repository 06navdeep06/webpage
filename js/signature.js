/**
 * Signature Terminal Animation
 * Creates a typing effect for the digital signature section
 */

document.addEventListener('DOMContentLoaded', () => {
  const signatureOutput = document.querySelector('.signature-output');
  const cursor = document.querySelector('.cursor-blink');
  
  if (!signatureOutput || !cursor) return;

  const originalContent = signatureOutput.innerHTML;
  signatureOutput.innerHTML = '';
  cursor.style.display = 'none';

  // Extract the text content while preserving HTML structure
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = originalContent;
  const textContent = tempDiv.textContent || tempDiv.innerText || '';
  
  let charIndex = 0;
  let isTyping = false;

  const typeWriter = () => {
    if (isTyping) return;
    isTyping = true;

    if (charIndex < textContent.length) {
      // Reconstruct the content with proper HTML
      const currentText = textContent.substring(0, charIndex + 1);
      
      // Simple approach - just type the text content
      signatureOutput.textContent = currentText;
      
      charIndex++;
      setTimeout(() => {
        isTyping = false;
        typeWriter();
      }, 30 + Math.random() * 20); // Random typing speed
    } else {
      // Typing complete, restore original HTML and show cursor
      signatureOutput.innerHTML = originalContent;
      cursor.style.display = 'inline-block';
      
      // Add a subtle glow effect on completion
      signatureOutput.style.textShadow = '0 0 10px rgba(255, 61, 0, 0.3)';
      setTimeout(() => {
        signatureOutput.style.textShadow = 'none';
      }, 2000);
    }
  };

  // Start typing when the section is visible
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && charIndex === 0) {
        setTimeout(typeWriter, 500); // Small delay before starting
      }
    });
  }, { threshold: 0.3 });

  const signatureSection = document.querySelector('.signature-section');
  if (signatureSection) {
    observer.observe(signatureSection);
  }

  // Add hover effect to the terminal
  const terminalSignature = document.querySelector('.terminal-signature');
  if (terminalSignature) {
    terminalSignature.addEventListener('mouseenter', () => {
      terminalSignature.style.transform = 'scale(1.02) rotate(0.5deg)';
      terminalSignature.style.boxShadow = '0 12px 40px rgba(0, 0, 0, 0.3)';
    });

    terminalSignature.addEventListener('mouseleave', () => {
      terminalSignature.style.transform = 'scale(1) rotate(0deg)';
      terminalSignature.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.2)';
    });
  }
});
