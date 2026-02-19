/**
 * Skills visualization
 * Creates an interactive skills constellation visualization
 */

document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('skills-canvas');
  
  if (!canvas) return;
  
  const ctx = canvas.getContext('2d');
  const skillsVisualization = document.querySelector('.skills-visualization');
  
  // Initialize skill constellation variable
  let skillConstellation;
  
  // Set canvas size to match container
  const resizeCanvas = () => {
    canvas.width = skillsVisualization.offsetWidth;
    canvas.height = skillsVisualization.offsetHeight;
    
    // Redraw nodes when canvas is resized
    if (skillConstellation) {
      skillConstellation.updateNodePositions();
      skillConstellation.draw();
    }
  };
  
  // Call resize on load and window resize
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);
  
  // Get theme colors from CSS variables
  const getThemeColors = () => {
    const styles = getComputedStyle(document.documentElement);
    return {
      accent1: styles.getPropertyValue('--color-accent-1').trim(),
      accent2: styles.getPropertyValue('--color-accent-2').trim(),
      accent3: styles.getPropertyValue('--color-accent-3').trim(),
      accent4: styles.getPropertyValue('--color-accent-4').trim(),
      bg: styles.getPropertyValue('--color-bg-primary').trim(),
      text: styles.getPropertyValue('--color-text-primary').trim()
    };
  };
  
  // Skill data structure
  const skillsData = {
    frontend: [
      { name: 'HTML5', level: 0.9 },
      { name: 'CSS3', level: 0.85 },
      { name: 'JavaScript', level: 0.9 },
      { name: 'React', level: 0.8 },
      { name: 'Vue', level: 0.7 },
      { name: 'GSAP', level: 0.75 }
    ],
    backend: [
      { name: 'Node.js', level: 0.8 },
      { name: 'Express', level: 0.75 },
      { name: 'Python', level: 0.7 },
      { name: 'Django', level: 0.65 },
      { name: 'GraphQL', level: 0.6 }
    ],
    design: [
      { name: 'Figma', level: 0.8 },
      { name: 'Adobe XD', level: 0.7 },
      { name: 'Photoshop', level: 0.75 },
      { name: 'Illustrator', level: 0.65 }
    ],
    other: [
      { name: 'Git', level: 0.85 },
      { name: 'Docker', level: 0.7 },
      { name: 'CI/CD', level: 0.65 },
      { name: 'WebGL', level: 0.6 },
      { name: 'Three.js', level: 0.55 }
    ]
  };
  
  // Skill Constellation class
  class SkillConstellation {
    constructor() {
      this.nodes = [];
      this.connections = [];
      this.colors = getThemeColors();
      this.mousePosition = { x: null, y: null };
      this.activeNode = null;
      this.hoverRadius = 80;
      this.particles = [];
      this.time = 0;
      
      // Create nodes from skills data
      this.createNodes();
      
      // Create connections between nodes
      this.createConnections();
      
      // Track mouse position
      canvas.addEventListener('mousemove', (e) => {
        const rect = canvas.getBoundingClientRect();
        this.mousePosition = {
          x: e.clientX - rect.left,
          y: e.clientY - rect.top
        };
        
        // Check for hover
        this.checkHover();
      });
      
      // Reset mouse position when mouse leaves
      canvas.addEventListener('mouseout', () => {
        this.mousePosition = { x: null, y: null };
        this.activeNode = null;
      });
      
      // Update colors when theme changes
      document.addEventListener('click', (e) => {
        if (e.target.classList.contains('theme-btn')) {
          setTimeout(() => {
            this.colors = getThemeColors();
          }, 100);
        }
      });
      
      // Handle skill category clicks
      document.querySelectorAll('.skill-category').forEach(category => {
        category.addEventListener('click', () => {
          const categoryName = category.getAttribute('data-category');
          this.highlightCategory(categoryName);
        });
      });
    }
    
    createNodes() {
      // Flatten all skills into a single array
      let allSkills = [];
      Object.keys(skillsData).forEach(category => {
        skillsData[category].forEach(skill => {
          allSkills.push({
            ...skill,
            category
          });
        });
      });
      
      // Create nodes with random positions
      this.nodes = allSkills.map(skill => {
        return {
          name: skill.name,
          level: skill.level,
          category: skill.category,
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          size: skill.level * 10 + 5, // Size based on skill level
          color: this.getCategoryColor(skill.category),
          opacity: 1,
          highlighted: false
        };
      });
      
      // Update positions to be more evenly distributed
      this.updateNodePositions();
    }
    
    updateNodePositions() {
      const margin = 50;
      const width = canvas.width - margin * 2;
      const height = canvas.height - margin * 2;
      
      // Group nodes by category
      const categories = Object.keys(skillsData);
      const categoryNodes = {};
      
      categories.forEach(category => {
        categoryNodes[category] = this.nodes.filter(node => node.category === category);
      });
      
      // Position nodes in quadrants based on category
      categories.forEach((category, index) => {
        const quadrantX = index % 2 === 0 ? 0 : 0.5;
        const quadrantY = index < 2 ? 0 : 0.5;
        
        categoryNodes[category].forEach((node, i) => {
          const nodeCount = categoryNodes[category].length;
          const angle = (i / nodeCount) * Math.PI * 2;
          const radius = Math.min(width, height) * 0.25;
          
          // Position within quadrant with some randomness
          node.x = margin + (quadrantX * width) + Math.cos(angle) * radius + (Math.random() - 0.5) * 50;
          node.y = margin + (quadrantY * height) + Math.sin(angle) * radius + (Math.random() - 0.5) * 50;
          
          // Keep within bounds
          node.x = Math.max(margin, Math.min(canvas.width - margin, node.x));
          node.y = Math.max(margin, Math.min(canvas.height - margin, node.y));
        });
      });
    }
    
    createConnections() {
      this.connections = [];
      
      // Connect nodes within the same category
      Object.keys(skillsData).forEach(category => {
        const categoryNodes = this.nodes.filter(node => node.category === category);
        
        categoryNodes.forEach((node, i) => {
          // Connect to next node in category (circular)
          const nextNode = categoryNodes[(i + 1) % categoryNodes.length];
          this.connections.push({
            start: node,
            end: nextNode,
            strength: 1,
            category: category
          });
          
          // Connect to some other nodes in same category
          categoryNodes.forEach((otherNode, j) => {
            if (i !== j && Math.random() > 0.7) {
              this.connections.push({
                start: node,
                end: otherNode,
                strength: 0.5,
                category: category
              });
            }
          });
        });
      });
      
      // Add some cross-category connections
      this.nodes.forEach(node => {
        this.nodes.forEach(otherNode => {
          if (node.category !== otherNode.category && Math.random() > 0.9) {
            this.connections.push({
              start: node,
              end: otherNode,
              strength: 0.3,
              category: 'cross'
            });
          }
        });
      });
    }
    
    getCategoryColor(category) {
      switch(category) {
        case 'frontend': return this.colors.accent1;
        case 'backend': return this.colors.accent2;
        case 'design': return this.colors.accent3;
        case 'other': return this.colors.accent4;
        default: return this.colors.text;
      }
    }
    
    checkHover() {
      // Reset active node
      this.activeNode = null;
      
      // Check if mouse is over any node
      for (let i = this.nodes.length - 1; i >= 0; i--) {
        const node = this.nodes[i];
        const dx = this.mousePosition.x - node.x;
        const dy = this.mousePosition.y - node.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < node.size + this.hoverRadius) {
          this.activeNode = node;
          break;
        }
      }
    }
    
    highlightCategory(category) {
      // Reset all nodes
      this.nodes.forEach(node => {
        node.opacity = category === 'all' ? 1 : (node.category === category ? 1 : 0.3);
        node.highlighted = node.category === category;
      });
      
      // Reset all connections
      this.connections.forEach(conn => {
        conn.opacity = category === 'all' ? 1 : 
                      (conn.category === category ? 1 : 
                      (conn.category === 'cross' && 
                      (conn.start.category === category || conn.end.category === category) ? 0.5 : 0.1));
      });
    }
    
    update() {
      // Simple physics simulation for nodes
      this.nodes.forEach(node => {
        // Apply forces from connections
        this.connections.forEach(conn => {
          if (conn.start === node || conn.end === node) {
            const otherNode = conn.start === node ? conn.end : conn.start;
            const dx = otherNode.x - node.x;
            const dy = otherNode.y - node.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            // Ideal distance based on node sizes
            const idealDistance = (node.size + otherNode.size) * 3;
            
            // Force strength based on difference from ideal distance
            const force = (distance - idealDistance) * 0.003 * conn.strength;
            
            // Apply force
            const angle = Math.atan2(dy, dx);
            node.x += Math.cos(angle) * force;
            node.y += Math.sin(angle) * force;
          }
        });
        
        // Keep nodes within canvas bounds
        const margin = node.size;
        node.x = Math.max(margin, Math.min(canvas.width - margin, node.x));
        node.y = Math.max(margin, Math.min(canvas.height - margin, node.y));
        
        // Mouse interaction
        if (this.mousePosition.x !== null && this.mousePosition.y !== null) {
          const dx = this.mousePosition.x - node.x;
          const dy = this.mousePosition.y - node.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance < this.hoverRadius + node.size) {
            // Slight repulsion from mouse
            const angle = Math.atan2(dy, dx);
            node.x -= Math.cos(angle) * 0.5;
            node.y -= Math.sin(angle) * 0.5;
          }
        }
      });
    }
    
    draw() {
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Update time for animations
      this.time += 0.01;
      
      // Draw connections with gradient
      this.connections.forEach(conn => {
        const opacity = conn.opacity !== undefined ? conn.opacity : 
                      (this.activeNode && (conn.start === this.activeNode || conn.end === this.activeNode) ? 1 : 0.3);
        
        // Create gradient for connection
        const gradient = ctx.createLinearGradient(conn.start.x, conn.start.y, conn.end.x, conn.end.y);
        gradient.addColorStop(0, `${conn.start.color}${Math.floor(opacity * 180).toString(16).padStart(2, '0')}`);
        gradient.addColorStop(1, `${conn.end.color}${Math.floor(opacity * 180).toString(16).padStart(2, '0')}`);
        
        ctx.beginPath();
        ctx.moveTo(conn.start.x, conn.start.y);
        ctx.lineTo(conn.end.x, conn.end.y);
        ctx.strokeStyle = gradient;
        ctx.lineWidth = conn.strength * 2;
        ctx.lineCap = 'round';
        ctx.stroke();
        
        // Add pulsing effect for active connections
        if (this.activeNode && (conn.start === this.activeNode || conn.end === this.activeNode)) {
          const pulse = Math.sin(this.time * 3) * 0.3 + 0.7;
          ctx.strokeStyle = `${this.colors.accent1}${Math.floor(pulse * 255).toString(16).padStart(2, '0')}`;
          ctx.lineWidth = conn.strength * 3;
          ctx.stroke();
        }
      });
      
      // Draw nodes with enhanced graphics
      this.nodes.forEach(node => {
        const opacity = node.opacity !== undefined ? node.opacity : 1;
        const isActive = node === this.activeNode;
        const scale = isActive ? 1.3 : 1;
        const pulse = isActive ? Math.sin(this.time * 4) * 0.1 + 1 : 1;
        
        // Outer glow for active nodes
        if (isActive) {
          const glowGradient = ctx.createRadialGradient(node.x, node.y, 0, node.x, node.y, node.size * scale * pulse * 2);
          glowGradient.addColorStop(0, `${node.color}40`);
          glowGradient.addColorStop(1, 'transparent');
          ctx.fillStyle = glowGradient;
          ctx.beginPath();
          ctx.arc(node.x, node.y, node.size * scale * pulse * 2, 0, Math.PI * 2);
          ctx.fill();
        }
        
        // Main node with gradient
        const nodeGradient = ctx.createRadialGradient(
          node.x - node.size * 0.3, 
          node.y - node.size * 0.3, 
          0,
          node.x, 
          node.y, 
          node.size * scale * pulse
        );
        nodeGradient.addColorStop(0, `${node.color}${Math.floor(opacity * 255).toString(16).padStart(2, '0')}`);
        nodeGradient.addColorStop(1, `${node.color}${Math.floor(opacity * 180).toString(16).padStart(2, '0')}`);
        
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.size * scale * pulse, 0, Math.PI * 2);
        ctx.fillStyle = nodeGradient;
        ctx.fill();
        
        // Node border with glow
        if (isActive || node.highlighted) {
          ctx.shadowColor = node.color;
          ctx.shadowBlur = 10;
          ctx.strokeStyle = this.colors.text;
          ctx.lineWidth = 2;
          ctx.stroke();
          ctx.shadowBlur = 0;
        }
        
        // Node label with better positioning
        if (isActive) {
          // Background for label
          ctx.font = 'bold 13px "Space Grotesk", sans-serif';
          const textWidth = ctx.measureText(node.name).width;
          const padding = 8;
          
          ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
          ctx.beginPath();
          ctx.roundRect(
            node.x - textWidth/2 - padding, 
            node.y - node.size * scale - 25, 
            textWidth + padding * 2, 
            20, 
            4
          );
          ctx.fill();
          
          ctx.fillStyle = this.colors.text;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(node.name, node.x, node.y - node.size * scale - 15);
        }
        
        // Small inner dot for visual interest
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.size * 0.2 * scale, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${opacity * 0.6})`;
        ctx.fill();
      });
    }
    
    animate() {
      this.update();
      this.draw();
      requestAnimationFrame(() => this.animate());
    }
  }
  
  // Initialize and start animation
  skillConstellation = new SkillConstellation();
  skillConstellation.animate();
  
  // Scroll reveal animation for skill tags
  const observeSkillTags = () => {
    const skillTags = document.querySelectorAll('.skill-tag');
    
    if (!skillTags.length) return;
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry, index) => {
        if (entry.isIntersecting) {
          setTimeout(() => {
            entry.target.classList.add('fadeInUp', 'animated');
          }, index * 50);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });
    
    skillTags.forEach(tag => {
      observer.observe(tag);
    });
  };
  
  // Initialize scroll animations
  observeSkillTags();
});
