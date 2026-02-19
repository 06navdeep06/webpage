/**
 * Fallback skills data when GitHub API is unavailable
 * This provides a static representation of skills when dynamic loading fails
 */

document.addEventListener('DOMContentLoaded', () => {
  // Check if skills are already loaded
  const skillsSection = document.getElementById('skills-section');
  
  // If skills section exists and still shows loading after 3 seconds, show fallback
  if (skillsSection) {
    setTimeout(() => {
      const isLoading = skillsSection.querySelector('.skills-loading');
      if (isLoading) {
        displayFallbackSkills();
      }
    }, 3000);
  }
  
  // Display fallback skills when GitHub API fails
  function displayFallbackSkills() {
    // Predefined skills by category
    const skillsData = {
      'Frontend Development': ['JavaScript', 'HTML5', 'CSS3', 'React', 'Vue.js'],
      'Backend Development': ['Node.js', 'Express', 'Python', 'Django', 'GraphQL'],
      'Design': ['Figma', 'Adobe XD', 'UI/UX', 'Typography', 'Animation'],
      'DevOps & Tools': ['Git', 'Docker', 'CI/CD', 'AWS', 'Linux'],
      'Creative Coding': ['WebGL', 'Three.js', 'Canvas', 'SVG', 'GSAP']
    };
    
    // Generate HTML for skills section
    const skillsHtml = Object.entries(skillsData)
      .map(([category, skills]) => {
        const skillsListHtml = skills
          .map(skill => `<span class="skill-tag">${skill}</span>`)
          .join('');
        
        return `
          <div class="skill-category" data-category="${category.toLowerCase().replace(/\s+/g, '-')}">
            <h3>${category}</h3>
            <div class="skill-tags">
              ${skillsListHtml}
            </div>
          </div>
        `;
      })
      .join('');
    
    // Update skills section
    skillsSection.innerHTML = skillsHtml;
    
    // Add animation to skill tags
    const skillTags = document.querySelectorAll('.skill-tag');
    skillTags.forEach((tag, index) => {
      setTimeout(() => {
        tag.classList.add('fadeInUp', 'animated');
      }, index * 50);
    });
    
    console.log('Displayed fallback skills due to GitHub API failure');
  }
});
