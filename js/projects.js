/**
 * Projects showcase with GitHub API integration
 * Fetches and displays GitHub repositories dynamically
 */

document.addEventListener('DOMContentLoaded', () => {
  const projectsGrid = document.getElementById('projects-grid');
  const filterButtons = document.querySelectorAll('.filter-btn');
  
  // Read credentials from runtime env config (js/env.js)
  // Never hardcode tokens — env.js is git-ignored and injected at deploy time.
  const env = (typeof window.__ENV === 'object' && window.__ENV) || {};

  const githubConfig = {
    username: env.GITHUB_USERNAME || '',
    token: env.GITHUB_PAT || '',
    repoCount: 5,
    excludeRepos: ['private-repo', 'notes', 'dotfiles', 'archive', 'learning', 'template'],
    featuredRepos: ['sonic-pixels', 'type-system', 'neural-garden', 'fragment', 'motion-ui']
  };
  
  // Project categories and their associated topics/keywords
  const projectCategories = {
    web: ['website', 'web-app', 'frontend', 'react', 'vue', 'angular', 'javascript', 'html', 'css'],
    app: ['app', 'mobile', 'android', 'ios', 'flutter', 'react-native', 'electron'],
    creative: ['creative', 'art', 'generative', 'animation', 'three', 'webgl', 'canvas', 'svg']
  };
  
  // Detect project category based on topics and name
  const detectProjectCategory = (repo) => {
    // Check if repo has topics
    if (repo.topics && repo.topics.length > 0) {
      // Check each category
      for (const [category, keywords] of Object.entries(projectCategories)) {
        // If any topic matches category keywords
        if (repo.topics.some(topic => keywords.includes(topic.toLowerCase()))) {
          return category;
        }
      }
    }
    
    // Fallback: check name and description
    const nameAndDesc = (repo.name + ' ' + (repo.description || '')).toLowerCase();
    
    for (const [category, keywords] of Object.entries(projectCategories)) {
      if (keywords.some(keyword => nameAndDesc.includes(keyword.toLowerCase()))) {
        return category;
      }
    }
    
    // Default category
    return 'web';
  };
  
  // Detect technologies used in a repository
  const detectTechnologies = (repo) => {
    const technologies = [];
    
    // Use topics if available
    if (repo.topics && repo.topics.length > 0) {
      // Filter out category keywords and add remaining topics
      const allCategoryKeywords = Object.values(projectCategories).flat();
      technologies.push(...repo.topics.filter(topic => 
        !allCategoryKeywords.includes(topic.toLowerCase())
      ));
    }
    
    // Add language if available and not already included
    if (repo.language && !technologies.includes(repo.language)) {
      technologies.push(repo.language);
    }
    
    // Limit to 4 technologies
    return technologies.slice(0, 4);
  };
  
  // Get project intent based on name
  const getProjectIntent = (repo) => {
    // Map of project names to their intent statements
    const intentMap = {
      'sonic-pixels': 'I built this because I was tired of audio visualizers that just mimic each other. Sound deserves better visual representation than bouncing bars.',
      'type-system': 'Typography on the web has become homogenized. This is my rebellion against the sameness—a type system with actual opinions.',
      'neural-garden': 'An experiment in letting algorithms and human creativity collide. I wanted to see what happens when code grows like a plant.',
      'fragment': 'Most code editors are built for efficiency, not expression. I created a space where code feels like poetry.',
      'motion-ui': 'Movement online has become predictable. This library breaks those patterns with gestures that feel alive, not mechanical.'
    };
    
    // Return custom intent or generate one based on description
    return intentMap[repo.name.toLowerCase()] || '';
  };

  // Create HTML for a project card
  const createProjectCard = (repo) => {
    const category = detectProjectCategory(repo);
    const technologies = detectTechnologies(repo);
    const projectIntent = getProjectIntent(repo);
    
    // Generate random image for projects without images
    // In a real implementation, you might want to use actual project screenshots
    const imageUrl = `https://source.unsplash.com/600x400/?${encodeURIComponent(category)}`;
    
    // Create tags HTML - limit to 3 most important technologies
    const tagsHtml = technologies.slice(0, 3).map(tech => 
      `<span class="project-tag">${tech}</span>`
    ).join('');
    
    // Create demo link if homepage is available
    const demoLink = repo.homepage 
      ? `<a href="${repo.homepage}" target="_blank" rel="noopener noreferrer" class="project-link project-link-demo">Experience</a>` 
      : '';
    
    // Add intent section if available
    const intentHtml = projectIntent 
      ? `<p class="project-intent"><span class="intent-label">Why:</span> ${projectIntent}</p>` 
      : '';
    
    return `
      <div class="project-card" data-category="${category}" tabindex="0" role="article" aria-labelledby="project-${repo.name.replace(/\s+/g, '-').toLowerCase()}">
        <div class="project-image">
          <img src="${imageUrl}" alt="Screenshot of ${repo.name} project" loading="lazy">
          <div class="project-overlay">
            <div class="project-tags" aria-label="Project technologies">
              ${tagsHtml}
            </div>
          </div>
        </div>
        <div class="project-content">
          <h3 class="project-title" id="project-${repo.name.replace(/\s+/g, '-').toLowerCase()}">${repo.name}</h3>
          <p class="project-description">${repo.description || 'No description available'}</p>
          ${intentHtml}
          <div class="project-links">
            <a href="${repo.html_url}" target="_blank" rel="noopener noreferrer" class="project-link project-link-code" aria-label="View ${repo.name} source code on GitHub">Explore Code</a>
            ${demoLink ? demoLink.replace('Experience', `Experience ${repo.name}`).replace('class="project-link', 'aria-label="View live demo of ${repo.name}" class="project-link') : ''}
          </div>
        </div>
      </div>
    `;
  };
  
  // Fetch repositories from GitHub API
  const fetchRepositories = async () => {
    try {
      // Show loading state
      projectsGrid.innerHTML = `
        <div class="projects-loading">
          <div class="loader"></div>
        </div>
      `;
      
      // GitHub API URL
      const apiUrl = `https://api.github.com/users/${githubConfig.username}/repos?sort=updated&per_page=100`;
      
      // Fetch repositories
      const response = await fetch(apiUrl, {
        headers: {
          'Authorization': `token ${githubConfig.token}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`GitHub API error: ${response.status}`);
      }
      
      // Parse response
      let repos = await response.json();
      
      // Filter out excluded repositories and forks
      repos = repos.filter(repo => 
        !githubConfig.excludeRepos.includes(repo.name) && 
        !repo.fork &&
        !repo.archived
      );
      
      // Sort repositories: featured first, then by stars
      repos.sort((a, b) => {
        // Check if either repo is featured
        const aFeatured = githubConfig.featuredRepos.includes(a.name);
        const bFeatured = githubConfig.featuredRepos.includes(b.name);
        
        // Featured repos come first
        if (aFeatured && !bFeatured) return -1;
        if (!aFeatured && bFeatured) return 1;
        
        // Then sort by stars
        return b.stargazers_count - a.stargazers_count;
      });
      
      // Limit to specified count
      repos = repos.slice(0, githubConfig.repoCount);
      
      // Fetch additional details for each repo (to get topics)
      const reposWithDetails = await Promise.all(repos.map(async (repo) => {
        const detailResponse = await fetch(repo.url, {
          headers: {
            'Authorization': `token ${githubConfig.token}`
          }
        });
        
        if (!detailResponse.ok) {
          return repo; // Return original repo if details fetch fails
        }
        
        return await detailResponse.json();
      }));
      
      // Generate HTML for all projects
      const projectsHtml = reposWithDetails.map(createProjectCard).join('');
      
      // Update projects grid
      projectsGrid.innerHTML = projectsHtml;
      
      // Initialize filter functionality
      initializeFilter();
      
      // Add animation classes to project cards
      const projectCards = document.querySelectorAll('.project-card');
      projectCards.forEach((card, index) => {
        setTimeout(() => {
          card.classList.add('fadeInUp', 'animated');
        }, 100 * index);
      });
      
    } catch (error) {
      console.error('Error fetching repositories:', error);
      
      // Show error message
      projectsGrid.innerHTML = `
        <div class="projects-error">
          <p>Failed to load projects. Please try again later.</p>
          <button class="btn btn-primary retry-btn">Retry</button>
        </div>
      `;
      
      // Add retry functionality
      const retryButton = document.querySelector('.retry-btn');
      if (retryButton) {
        retryButton.addEventListener('click', fetchRepositories);
      }
    }
  };
  
  // Initialize filter functionality
  const initializeFilter = () => {
    const projectCards = document.querySelectorAll('.project-card');
    
    filterButtons.forEach(button => {
      button.addEventListener('click', () => {
        // Remove active class from all buttons
        filterButtons.forEach(btn => btn.classList.remove('active'));
        
        // Add active class to clicked button
        button.classList.add('active');
        
        // Get filter value
        const filter = button.getAttribute('data-filter');
        
        // Filter projects
        projectCards.forEach(card => {
          if (filter === 'all' || card.getAttribute('data-category') === filter) {
            card.style.display = 'block';
            setTimeout(() => {
              card.classList.add('fadeInUp', 'animated');
            }, 100);
          } else {
            card.style.display = 'none';
            card.classList.remove('fadeInUp', 'animated');
          }
        });
      });
    });
  };
  
  // Fallback projects in case GitHub API fails or for development
  const fallbackProjects = [
    {
      name: "Sonic Pixels",
      html_url: "#",
      homepage: "#",
      description: "Audio visualization framework that transforms sound into organic, evolving visual patterns.",
      language: "JavaScript",
      topics: ["creative", "audio", "webgl", "canvas"],
      category: "creative"
    },
    {
      name: "Type System",
      html_url: "#",
      homepage: "#",
      description: "Experimental typography system that breaks conventional grid layouts with responsive, dynamic text arrangements.",
      language: "CSS",
      topics: ["web", "typography", "design-system"],
      category: "web"
    },
    {
      name: "Neural Garden",
      html_url: "#",
      homepage: "#",
      description: "Generative art installation where code and user input collaborate to grow evolving digital ecosystems.",
      language: "JavaScript",
      topics: ["creative", "generative-art", "machine-learning"],
      category: "creative"
    },
    {
      name: "Fragment",
      html_url: "#",
      homepage: "#",
      description: "Code editor designed for creative coding, with real-time visual output and expressive syntax highlighting.",
      language: "TypeScript",
      topics: ["app", "editor", "creative-coding"],
      category: "app"
    },
    {
      name: "Motion UI",
      html_url: "#",
      homepage: "#",
      description: "Unconventional animation library that creates organic, physics-based movements for web interfaces.",
      language: "JavaScript",
      topics: ["web", "animation", "ui"],
      category: "web"
    }
  ];
  
  // Function to display fallback projects
  const displayFallbackProjects = () => {
    const projectsHtml = fallbackProjects.map(repo => {
      // Add missing properties for compatibility with createProjectCard
      repo.stargazers_count = Math.floor(Math.random() * 100);
      return createProjectCard(repo);
    }).join('');
    
    projectsGrid.innerHTML = projectsHtml;
    initializeFilter();
    
    // Add animation classes
    const projectCards = document.querySelectorAll('.project-card');
    projectCards.forEach((card, index) => {
      setTimeout(() => {
        card.classList.add('fadeInUp', 'animated');
      }, 100 * index);
    });
  };
  
  // Token present → fetch live repos. Missing → show curated fallbacks.
  if (githubConfig.token && githubConfig.username) {
    fetchRepositories();
  } else {
    displayFallbackProjects();
  }
});
