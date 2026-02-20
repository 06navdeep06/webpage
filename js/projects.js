/**
 * Projects showcase with GitHub API integration
 * Fetches and displays GitHub repositories dynamically
 */

document.addEventListener('DOMContentLoaded', () => {
  const projectsGrid = document.getElementById('projects-grid');
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

  // Language colour map
  const LANG_COLORS = {
    JavaScript: '#f1e05a', TypeScript: '#2b7489', Python: '#3572A5',
    'C++': '#f34b7d', C: '#555555', Java: '#b07219', Go: '#00ADD8',
    Rust: '#dea584', Ruby: '#701516', PHP: '#4F5D95', Swift: '#ffac45',
    Kotlin: '#F18E33', Shell: '#89e051', HTML: '#e34c26', CSS: '#563d7c',
    Lua: '#000080', Scala: '#c22d40',
  };

  // Create HTML for a project card
  const createProjectCard = (repo) => {
    const technologies = detectTechnologies(repo);
    const displayName = repo.name.replace(/-/g, ' ').replace(/_/g, ' ');
    const description = repo.description && repo.description.trim()
      ? repo.description
      : 'A project on GitHub — click to explore.';

    const langColor = LANG_COLORS[repo.language] || '#6E00FF';
    const langDot = repo.language
      ? `<span class="pc-lang-dot" style="background:${langColor}"></span><span class="pc-lang-name">${repo.language}</span>`
      : '';

    const stars = repo.stargazers_count > 0
      ? `<span class="pc-stars"><i class="fas fa-star"></i> ${repo.stargazers_count}</span>`
      : '';

    const tagsHtml = technologies.slice(0, 3)
      .map(t => `<span class="pc-tag">${t}</span>`).join('');

    const demoBtn = repo.homepage
      ? `<a href="${repo.homepage}" target="_blank" rel="noopener noreferrer" class="pc-btn pc-btn-demo"><i class="fas fa-external-link-alt"></i> Live</a>`
      : '';

    return `
      <div class="project-card pc-card" tabindex="0" role="article">
        <div class="pc-header">
          <div class="pc-icon"><i class="fas fa-code-branch"></i></div>
          <div class="pc-meta">${langDot}${stars}</div>
        </div>
        <h3 class="pc-title">${displayName}</h3>
        <p class="pc-desc">${description}</p>
        ${tagsHtml ? `<div class="pc-tags">${tagsHtml}</div>` : ''}
        <div class="pc-footer">
          <a href="${repo.html_url}" target="_blank" rel="noopener noreferrer" class="pc-btn pc-btn-code"><i class="fab fa-github"></i> Code</a>
          ${demoBtn}
        </div>
      </div>
    `;
  };
  
  // Fetch user's skillset from all public repositories
  const fetchUserSkills = async () => {
    try {
      // GitHub API URL for user's repositories
      const apiUrl = `https://api.github.com/graphql`;
      
      // Check if we have a token for authentication
      const hasToken = !!githubConfig.token;
      let response;
      
      if (hasToken) {
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
        
        response = await fetch(apiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${githubConfig.token}`
          },
          body: JSON.stringify(graphqlQuery)
        });
      } else {
        // For GitHub Pages: Fetch repositories using REST API (no auth required for public repos)
        console.log('No GitHub token found. Using REST API for public repositories.');
        const restApiUrl = `https://api.github.com/users/${githubConfig.username}/repos?sort=updated&per_page=100`;
        response = await fetch(restApiUrl);
      }
      
      if (!response.ok) {
        throw new Error(`GitHub API error: ${response.status}`);
      }
      
      const responseData = await response.json();
      
      // Process repositories to extract skills
      if (hasToken && responseData.data && responseData.data.user && responseData.data.user.repositories) {
        // Process GraphQL response
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
          skillsSection.innerHTML = skillsHtml;
        }
      }
    } catch (error) {
      console.error('Error fetching user skills:', error);
      displayFallbackSkills();
    }
  };
  
  // Display fallback skills when GitHub API fails
  const displayFallbackSkills = () => {
    if (skillsSection) {
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
      
      // Check if we have a token for authentication
      const hasToken = !!githubConfig.token;
      let response;
      
      if (hasToken) {
        // Using GraphQL API to fetch pinned repositories with authentication
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
        
        response = await fetch(apiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${githubConfig.token}`
          },
          body: JSON.stringify(graphqlQuery)
        });
      } else {
        // For GitHub Pages: Fetch repositories using REST API (no auth required for public repos)
        console.log('No GitHub token found. Using REST API for public repositories.');
        const restApiUrl = `https://api.github.com/users/${githubConfig.username}/repos?sort=updated&per_page=10`;
        response = await fetch(restApiUrl);
      }
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`GitHub API error: ${response.status}`, errorText);
        throw new Error(`GitHub API error: ${response.status} - ${errorText}`);
      }
      
      // Parse response
      const responseData = await response.json();
      
      // Extract repositories
      let repos = [];
      
      if (hasToken && responseData.data && responseData.data.user && responseData.data.user.pinnedItems) {
        // Process GraphQL response (pinned repos)
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
      } else if (!hasToken && Array.isArray(responseData)) {
        // Process REST API response (for GitHub Pages without token)
        // Filter out forks, archived, and low-quality repos
        const filteredRepos = responseData
          .filter(repo =>
            !repo.fork &&
            !repo.archived &&
            repo.name.length > 2 &&
            !/^(ss|test|temp|untitled|repo\d*)$/i.test(repo.name)
          )
          .sort((a, b) => b.stargazers_count - a.stargazers_count)
          .slice(0, githubConfig.repoCount);
          
        // Process each repository
        repos = await Promise.all(filteredRepos.map(async (repo) => {
          // Fetch README to extract code snippets
          let sourceCodeSnippet = '';
          try {
            const readmeUrl = `https://raw.githubusercontent.com/${githubConfig.username}/${repo.name}/main/README.md`;
            const readmeResponse = await fetch(readmeUrl);
            
            if (readmeResponse.ok) {
              const readmeText = await readmeResponse.text();
              const codeBlockRegex = /```([\s\S]*?)```/g;
              const codeBlocks = [...readmeText.matchAll(codeBlockRegex)];
              
              if (codeBlocks.length > 0) {
                sourceCodeSnippet = codeBlocks[0][1].trim();
              }
            }
          } catch (error) {
            console.log(`Error fetching README for ${repo.name}:`, error);
          }
          
          return {
            name: repo.name,
            description: repo.description || 'No description available',
            html_url: repo.html_url,
            homepage: repo.homepage || '',
            language: repo.language || '',
            topics: repo.topics || [],
            sourceCode: sourceCodeSnippet
          };
        }));
      }
      
      // No need for additional sorting or fetching since we're using pinned repos
      const reposWithDetails = repos;
      
      // Generate HTML for all projects
      const projectsHtml = reposWithDetails.map(createProjectCard).join('');
      
      // Update projects grid
      projectsGrid.innerHTML = projectsHtml;
      
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
      
      // Display fallback projects
      displayFallbackProjects();
    }
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

  // Safety timeout: if skills section still shows loading after 5s, show fallback
  const skillsTimeout = setTimeout(() => {
    if (skillsSection && skillsSection.querySelector('.skills-loading')) {
      console.warn('Skills loading timed out — showing fallback.');
      displayFallbackSkills();
    }
  }, 5000);

  // Fetch GitHub repos and skills if credentials exist
  if (githubConfig.token && githubConfig.username) {
    // First fetch skills from all repositories
    fetchUserSkills().then(() => {
      clearTimeout(skillsTimeout);
      // Then fetch pinned repositories
      fetchRepositories();
    }).catch(error => {
      clearTimeout(skillsTimeout);
      console.error('Error fetching skills:', error);
      displayFallbackSkills();
      // Still try to fetch repositories even if skills fetch fails
      fetchRepositories();
    });
  } else {
    clearTimeout(skillsTimeout);
    // Show fallback skills and projects if credentials are missing
    displayFallbackSkills();
    displayFallbackProjects();
    
    console.warn('GitHub credentials are missing. Using fallback data.');
  }
});
