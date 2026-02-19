/**
 * Projects showcase with GitHub API integration
 * Fetches and displays GitHub repositories dynamically
 */

document.addEventListener('DOMContentLoaded', () => {
  const projectsGrid = document.getElementById('projects-grid');
  const filterButtons = document.querySelectorAll('.filter-btn');
  const skillsSection = document.getElementById('skills-section') || document.createElement('div');
  
  // Read credentials from runtime env config (js/env.js)
  // Never hardcode tokens — env.js is git-ignored and injected at deploy time.
  const env = (typeof window.__ENV === 'object' && window.__ENV) || {};

  const githubConfig = {
    username: env.GITHUB_USERNAME || '',
    token: env.GITHUB_PAT || '',
    repoCount: 6, // Show up to 6 pinned repos
    excludeRepos: ['private-repo', 'notes', 'dotfiles', 'archive', 'learning', 'template'],
    featuredRepos: [] // We'll use pinned repos instead of hardcoded featured repos
  };
  
  // Skills mapping - maps languages and topics to skill categories
  const skillsMapping = {
    languages: {
      'JavaScript': 'Frontend Development',
      'TypeScript': 'Frontend Development',
      'HTML': 'Frontend Development',
      'CSS': 'Frontend Development',
      'Python': 'Backend Development',
      'Java': 'Backend Development',
      'C#': 'Backend Development',
      'PHP': 'Backend Development',
      'Ruby': 'Backend Development',
      'Go': 'Backend Development',
      'Swift': 'Mobile Development',
      'Kotlin': 'Mobile Development',
      'Dart': 'Mobile Development',
      'R': 'Data Science',
      'Jupyter Notebook': 'Data Science'
    },
    topics: {
      'react': 'Frontend Frameworks',
      'vue': 'Frontend Frameworks',
      'angular': 'Frontend Frameworks',
      'svelte': 'Frontend Frameworks',
      'node': 'Backend Frameworks',
      'express': 'Backend Frameworks',
      'django': 'Backend Frameworks',
      'flask': 'Backend Frameworks',
      'laravel': 'Backend Frameworks',
      'spring': 'Backend Frameworks',
      'tensorflow': 'Machine Learning',
      'pytorch': 'Machine Learning',
      'scikit-learn': 'Machine Learning',
      'pandas': 'Data Analysis',
      'numpy': 'Data Analysis',
      'docker': 'DevOps',
      'kubernetes': 'DevOps',
      'aws': 'Cloud Services',
      'azure': 'Cloud Services',
      'gcp': 'Cloud Services',
      'firebase': 'Cloud Services',
      'graphql': 'API Development',
      'rest-api': 'API Development',
      'mongodb': 'Databases',
      'postgresql': 'Databases',
      'mysql': 'Databases',
      'sqlite': 'Databases',
      'redis': 'Databases',
      'ui': 'UI/UX Design',
      'ux': 'UI/UX Design',
      'design-system': 'UI/UX Design',
      'animation': 'Animation',
      'three': '3D Graphics',
      'webgl': '3D Graphics',
      'canvas': 'Creative Coding',
      'svg': 'Vector Graphics',
      'game': 'Game Development',
      'unity': 'Game Development',
      'blockchain': 'Blockchain',
      'web3': 'Blockchain',
      'ethereum': 'Blockchain',
      'testing': 'Testing',
      'jest': 'Testing',
      'cypress': 'Testing',
      'selenium': 'Testing'
    }
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
    
    // Add source code section if available
    const sourceCodeHtml = repo.sourceCode 
      ? `<div class="project-source-code">
           <h4>Source Code Snippet</h4>
           <pre><code>${repo.sourceCode}</code></pre>
         </div>` 
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
          ${sourceCodeHtml}
          <div class="project-links">
            <a href="${repo.html_url}" target="_blank" rel="noopener noreferrer" class="project-link project-link-code" aria-label="View ${repo.name} source code on GitHub">Explore Code</a>
            ${demoLink ? demoLink.replace('Experience', `Experience ${repo.name}`).replace('class="project-link', 'aria-label="View live demo of ${repo.name}" class="project-link') : ''}
          </div>
        </div>
      </div>
    `;
  };
  
  // Fetch user's skillset from all public repositories
  const fetchUserSkills = async () => {
    try {
      // GitHub API URL for user's repositories
      const apiUrl = `https://api.github.com/graphql`;
      
      // GraphQL query to fetch all public repositories with languages and topics
      const graphqlQuery = {
        query: `{
          user(login: "${githubConfig.username}") {
            repositories(first: 100, privacy: PUBLIC, orderBy: {field: UPDATED_AT, direction: DESC}) {
              nodes {
                name
                languages(first: 10, orderBy: {field: SIZE, direction: DESC}) {
                  edges {
                    size
                    node {
                      name
                    }
                  }
                }
                repositoryTopics(first: 20) {
                  nodes {
                    topic {
                      name
                    }
                  }
                }
              }
            }
          }
        }`
      };
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${githubConfig.token}`
        },
        body: JSON.stringify(graphqlQuery)
      });
      
      if (!response.ok) {
        throw new Error(`GitHub API error: ${response.status}`);
      }
      
      const responseData = await response.json();
      
      // Process repositories to extract skills
      if (responseData.data && responseData.data.user && responseData.data.user.repositories) {
        const repos = responseData.data.user.repositories.nodes;
        
        // Collect all languages and their total byte size across repos
        const languageCounts = {};
        const topicCounts = {};
        
        // Process each repository
        repos.forEach(repo => {
          // Process languages
          if (repo.languages && repo.languages.edges) {
            repo.languages.edges.forEach(edge => {
              const langName = edge.node.name;
              const langSize = edge.size;
              
              if (!languageCounts[langName]) {
                languageCounts[langName] = 0;
              }
              languageCounts[langName] += langSize;
            });
          }
          
          // Process topics
          if (repo.repositoryTopics && repo.repositoryTopics.nodes) {
            repo.repositoryTopics.nodes.forEach(node => {
              const topicName = node.topic.name;
              
              if (!topicCounts[topicName]) {
                topicCounts[topicName] = 0;
              }
              topicCounts[topicName] += 1;
            });
          }
        });
        
        // Convert to arrays and sort by count/size
        const sortedLanguages = Object.entries(languageCounts)
          .sort((a, b) => b[1] - a[1])
          .map(([name]) => name);
        
        const sortedTopics = Object.entries(topicCounts)
          .sort((a, b) => b[1] - a[1])
          .map(([name]) => name);
        
        // Map to skill categories
        const skillCategories = {};
        
        // Process languages
        sortedLanguages.forEach(lang => {
          const category = skillsMapping.languages[lang] || 'Other';
          if (!skillCategories[category]) {
            skillCategories[category] = [];
          }
          skillCategories[category].push(lang);
        });
        
        // Process topics
        sortedTopics.forEach(topic => {
          const category = skillsMapping.topics[topic] || null;
          if (category && !skillCategories[category]) {
            skillCategories[category] = [];
          }
          if (category) {
            skillCategories[category].push(topic);
          }
        });
        
        // Generate HTML for skills section
        const skillsHtml = Object.entries(skillCategories)
          .map(([category, skills]) => {
            const skillsListHtml = skills
              .slice(0, 5) // Limit to top 5 skills per category
              .map(skill => `<span class="skill-tag">${skill}</span>`)
              .join('');
            
            return `
              <div class="skill-category">
                <h3>${category}</h3>
                <div class="skill-tags">
                  ${skillsListHtml}
                </div>
              </div>
            `;
          })
          .join('');
        
        // Update skills section if it exists
        if (skillsSection) {
          skillsSection.innerHTML = `
            <h2>My Skills</h2>
            <div class="skills-grid">
              ${skillsHtml}
            </div>
          `;
        }
        
        return {
          languages: sortedLanguages,
          topics: sortedTopics,
          categories: skillCategories
        };
      }
      
      return null;
    } catch (error) {
      console.error('Error fetching user skills:', error);
      return null;
    }
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
      
      // GitHub API URL for pinned repositories
      const apiUrl = `https://api.github.com/graphql`;
      
      console.log(`Fetching repos for user: ${githubConfig.username}`);
      
      // Using GraphQL API to fetch pinned repositories
      const graphqlQuery = {
        query: `{
          user(login: "${githubConfig.username}") {
            pinnedItems(first: 6, types: REPOSITORY) {
              nodes {
                ... on Repository {
                  name
                  description
                  url
                  homepageUrl
                  languages(first: 5) {
                    nodes {
                      name
                    }
                  }
                  repositoryTopics(first: 10) {
                    nodes {
                      topic {
                        name
                      }
                    }
                  }
                  object(expression: "HEAD:README.md") {
                    ... on Blob {
                      text
                    }
                  }
                }
              }
            }
          }
        }`
      };
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${githubConfig.token}`
        },
        body: JSON.stringify(graphqlQuery)
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`GitHub API error: ${response.status}`, errorText);
        throw new Error(`GitHub API error: ${response.status} - ${errorText}`);
      }
      
      // Parse response
      const responseData = await response.json();
      
      // Extract pinned repositories
      let repos = [];
      
      if (responseData.data && responseData.data.user && responseData.data.user.pinnedItems) {
        repos = responseData.data.user.pinnedItems.nodes.map(node => {
          // Extract languages
          const languages = node.languages ? 
            node.languages.nodes.map(lang => lang.name) : [];
          
          // Extract topics
          const topics = node.repositoryTopics ? 
            node.repositoryTopics.nodes.map(topic => topic.topic.name) : [];
          
          // Extract source code snippet from README
          let sourceCodeSnippet = '';
          if (node.object && node.object.text) {
            // Look for code blocks in README
            const codeBlockRegex = /```([\s\S]*?)```/g;
            const codeBlocks = [...node.object.text.matchAll(codeBlockRegex)];
            
            if (codeBlocks.length > 0) {
              // Use the first code block found
              sourceCodeSnippet = codeBlocks[0][1].trim();
            }
          }
          
          return {
            name: node.name,
            description: node.description,
            html_url: node.url,
            homepage: node.homepageUrl,
            language: languages[0] || '',
            topics: topics,
            sourceCode: sourceCodeSnippet
          };
        });
      }
      
      // No need for additional sorting or fetching since we're using pinned repos
      const reposWithDetails = repos;
      
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
  
  // Debug info - log config without exposing full token
  console.log('GitHub Config:', {
    username: githubConfig.username,
    hasToken: !!githubConfig.token,
    tokenFirstChars: githubConfig.token ? `${githubConfig.token.substring(0, 4)}...` : 'none',
    featuredRepos: githubConfig.featuredRepos
  });

  // Fetch GitHub repos and skills if credentials exist
  if (githubConfig.token && githubConfig.username) {
    // First fetch skills from all repositories
    fetchUserSkills().then(skills => {
      console.log('User skills extracted:', skills);
      
      // Then fetch pinned repositories
      fetchRepositories();
    }).catch(error => {
      console.error('Error fetching skills:', error);
      // Still try to fetch repositories even if skills fetch fails
      fetchRepositories();
    });
  } else {
    // Show error message if credentials are missing
    projectsGrid.innerHTML = `
      <div class="projects-error">
        <p>GitHub credentials are missing. Please check your configuration.</p>
      </div>
    `;
  }
});
