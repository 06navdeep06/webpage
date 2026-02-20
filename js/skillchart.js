/**
 * 3D Pie Chart — Skillset Visualization
 * Pure canvas-based pie chart with 3D depth effect and hover interaction.
 */

document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('skill-pie-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  const container = canvas.parentElement;

  // Skill data — percentages should add up to 100
  const skills = [
    { label: 'Backend',    pct: 35, color: '#FF3D00', desc: 'Node.js, Express, Python, Django' },
    { label: 'Databases',  pct: 20, color: '#6E00FF', desc: 'MongoDB, PostgreSQL, Redis' },
    { label: 'DevOps',     pct: 15, color: '#00E5B3', desc: 'Docker, AWS, CI/CD' },
    { label: 'Frontend',   pct: 15, color: '#FFCC00', desc: 'React, Vue, HTML/CSS' },
    { label: 'APIs / REST',pct: 10, color: '#05D9E8', desc: 'RESTful design, GraphQL' },
    { label: 'Other',      pct:  5, color: '#FD3777', desc: 'ML, Data Analysis' }
  ];

  // State
  let hoveredIndex = -1;
  let animProgress = 0;
  let mouseX = -1;
  let mouseY = -1;
  let rotation = 0;
  let targetRotation = 0;
  let lastTime = 0;

  // Sizing
  const resize = () => {
    const dpr = window.devicePixelRatio || 1;
    const w = container.offsetWidth;
    const h = container.offsetHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };

  resize();
  window.addEventListener('resize', resize);

  // Convert degrees to radians
  const rad = (deg) => deg * Math.PI / 180;

  // Draw one "3D" slice
  const drawSlice = (cx, cy, r, startAngle, endAngle, depth, color, lifted) => {
    const liftDist = lifted ? 12 : 0;
    const midAngle = (startAngle + endAngle) / 2;
    const lx = Math.cos(midAngle) * liftDist;
    const ly = Math.sin(midAngle) * liftDist * 0.6; // squash for perspective

    const ox = cx + lx;
    const oy = cy + ly;

    // --- Side (3D depth) ---
    const steps = 40;
    for (let i = 0; i <= steps; i++) {
      const angle = startAngle + (endAngle - startAngle) * (i / steps);
      const x = ox + Math.cos(angle) * r;
      const yTop = oy + Math.sin(angle) * r * 0.6;
      const yBot = yTop + depth;

      if (i === 0) {
        ctx.beginPath();
        ctx.moveTo(x, yTop);
      }
      ctx.lineTo(x, yTop);
    }
    for (let i = steps; i >= 0; i--) {
      const angle = startAngle + (endAngle - startAngle) * (i / steps);
      const x = ox + Math.cos(angle) * r;
      const yTop = oy + Math.sin(angle) * r * 0.6 + depth;
      ctx.lineTo(x, yTop);
    }
    ctx.closePath();
    ctx.fillStyle = darken(color, 0.35);
    ctx.fill();

    // --- Top face ---
    ctx.beginPath();
    ctx.moveTo(ox, oy);
    for (let i = 0; i <= steps; i++) {
      const angle = startAngle + (endAngle - startAngle) * (i / steps);
      const x = ox + Math.cos(angle) * r;
      const y = oy + Math.sin(angle) * r * 0.6;
      ctx.lineTo(x, y);
    }
    ctx.closePath();

    // Gradient on top face
    const grd = ctx.createRadialGradient(ox, oy, 0, ox, oy, r);
    grd.addColorStop(0, lighten(color, 0.15));
    grd.addColorStop(1, color);
    ctx.fillStyle = grd;
    ctx.fill();

    // Subtle stroke
    ctx.strokeStyle = 'rgba(0,0,0,0.25)';
    ctx.lineWidth = 1;
    ctx.stroke();
  };

  // Darken / lighten helpers
  const darken = (hex, amt) => adjustColor(hex, -amt);
  const lighten = (hex, amt) => adjustColor(hex, amt);

  function adjustColor(hex, amt) {
    hex = hex.replace('#', '');
    let r = parseInt(hex.substring(0, 2), 16);
    let g = parseInt(hex.substring(2, 4), 16);
    let b = parseInt(hex.substring(4, 6), 16);
    r = Math.min(255, Math.max(0, Math.round(r + r * amt)));
    g = Math.min(255, Math.max(0, Math.round(g + g * amt)));
    b = Math.min(255, Math.max(0, Math.round(b + b * amt)));
    return `rgb(${r},${g},${b})`;
  }

  // Optimized hit-test which slice the mouse is over
  const hitTest = (mx, my, cx, cy, r) => {
    // Normalize to ellipse space with better accuracy
    const dx = mx - cx;
    const dy = (my - cy) / 0.6; // Account for ellipse squash
    const dist = Math.sqrt(dx * dx + dy * dy);
    
    // Add small buffer for better edge detection
    if (dist > r + 2) return -1;

    let angle = Math.atan2(dy, dx);
    if (angle < 0) angle += Math.PI * 2;

    // Adjust for current rotation
    angle = (angle - rotation + Math.PI * 2) % (Math.PI * 2);

    let cumulative = 0;
    for (let i = 0; i < skills.length; i++) {
      cumulative += (skills[i].pct / 100) * Math.PI * 2;
      if (angle < cumulative) return i;
    }
    return -1;
  };

  // Draw legend - improved alignment
  const drawLegend = (cx, cy, r) => {
    const startX = cx + r + 40;
    let y = cy - (skills.length * 32) / 2;

    ctx.textBaseline = 'middle';

    skills.forEach((skill, i) => {
      const isHovered = i === hoveredIndex;

      // Swatch with better spacing
      ctx.fillStyle = skill.color;
      ctx.beginPath();
      const swatchSize = isHovered ? 14 : 10;
      ctx.roundRect(startX, y - swatchSize / 2, swatchSize, swatchSize, 2);
      ctx.fill();

      // Label with consistent positioning
      ctx.fillStyle = isHovered ? '#F2F2F7' : '#AAAAB8';
      ctx.font = isHovered
        ? 'bold 14px "Space Grotesk", sans-serif'
        : '13px "Space Grotesk", sans-serif';
      ctx.fillText(skill.label, startX + 20, y);

      y += 32; // Consistent spacing
    });
  };

  // Main draw loop - optimized for performance
  let frameCount = 0;
  const draw = (timestamp) => {
    if (!lastTime) lastTime = timestamp;
    const deltaTime = timestamp - lastTime;
    lastTime = timestamp;
    
    // Only update animation every few frames for better performance
    const shouldUpdate = frameCount % 2 === 0;
    frameCount++;
    
    const w = container.offsetWidth;
    const h = container.offsetHeight;

    ctx.clearRect(0, 0, w, h);

    // Ease-in animation
    if (animProgress < 1) {
      animProgress += 0.015; // Slower for smoother animation
      if (animProgress > 1) animProgress = 1;
    }
    const ease = 1 - Math.pow(1 - animProgress, 3); // ease-out cubic
    
    // Gentle auto-rotation when not hovering (only update when needed)
    if (hoveredIndex === -1 && shouldUpdate) {
      targetRotation += deltaTime * 0.00003; // Slower rotation
    }
    
    // Smooth rotation (only update when needed)
    if (shouldUpdate) {
      rotation += (targetRotation - rotation) * 0.08; // Smoother easing
    }

    const cx = w * 0.42; // Better centering
    const cy = h * 0.48;
    const r = Math.min(w * 0.28, h * 0.36, 200); // Slightly smaller for better fit
    const depth = 28;

    // Draw slices back-to-front (bottom half first, then top half)
    // Build slice angles
    const slices = [];
    let cumAngle = rotation;
    skills.forEach((skill, i) => {
      const sweep = (skill.pct / 100) * Math.PI * 2 * ease;
      slices.push({ start: cumAngle, end: cumAngle + sweep, index: i });
      cumAngle += sweep;
    });

    // Sort: draw slices whose midpoint is in the bottom half first (they are "behind")
    const sorted = [...slices].sort((a, b) => {
      const midA = (a.start + a.end) / 2;
      const midB = (b.start + b.end) / 2;
      return Math.sin(midA) - Math.sin(midB);
    });

    sorted.forEach(s => {
      drawSlice(
        cx, cy, r,
        s.start, s.end,
        depth,
        skills[s.index].color,
        s.index === hoveredIndex
      );
    });

    // Legend
    drawLegend(cx, cy, r);

    // Tooltip on hover
    if (hoveredIndex >= 0 && mouseX > 0) {
      const skill = skills[hoveredIndex];
      const text = skill.label;
      const desc = skill.desc;
      
      ctx.font = 'bold 16px "Space Grotesk", sans-serif';
      const tw = Math.max(ctx.measureText(text).width, ctx.measureText(desc).width);
      const px = mouseX + 14;
      const py = mouseY - 30;

      // Tooltip background with glow
      ctx.shadowColor = skill.color;
      ctx.shadowBlur = 15;
      ctx.fillStyle = 'rgba(10,10,15,0.9)';
      ctx.beginPath();
      ctx.roundRect(px - 12, py - 24, tw + 24, 58, 6);
      ctx.fill();
      ctx.shadowBlur = 0;
      
      // Border
      ctx.strokeStyle = skill.color;
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Title
      ctx.fillStyle = '#FFFFFF';
      ctx.textBaseline = 'middle';
      ctx.fillText(text, px, py - 10);
      
      // Description
      ctx.font = '14px "Space Grotesk", sans-serif';
      ctx.fillStyle = 'rgba(255,255,255,0.8)';
      ctx.fillText(desc, px, py + 14);
      
          }

    requestAnimationFrame(draw);
  };

  // Mouse events - optimized with debouncing
  let mouseUpdateTimeout;
  canvas.addEventListener('mousemove', (e) => {
    clearTimeout(mouseUpdateTimeout);
    mouseUpdateTimeout = setTimeout(() => {
      const rect = canvas.getBoundingClientRect();
      mouseX = e.clientX - rect.left;
      mouseY = e.clientY - rect.top;

      const w = container.offsetWidth;
      const h = container.offsetHeight;
      const cx = w * 0.42;
      const cy = h * 0.48;
      const r = Math.min(w * 0.28, h * 0.36, 200);

      const prevHovered = hoveredIndex;
      hoveredIndex = hitTest(mouseX, mouseY, cx, cy, r);
      
      // Change cursor and stop rotation when hovering
      canvas.style.cursor = hoveredIndex >= 0 ? 'pointer' : 'default';
      
      // If we hovered a new slice, pause rotation
      if (hoveredIndex !== -1 && hoveredIndex !== prevHovered) {
        targetRotation = rotation;
      }
    }, 16); // ~60fps debouncing
  });
  
  // Click to rotate to that slice
  canvas.addEventListener('click', () => {
    if (hoveredIndex >= 0) {
      // Calculate the middle angle of the slice
      let startAngle = 0;
      for (let i = 0; i < hoveredIndex; i++) {
        startAngle += (skills[i].pct / 100) * Math.PI * 2;
      }
      const midAngle = startAngle + (skills[hoveredIndex].pct / 100) * Math.PI * 2 / 2;
      
      // Set target rotation to bring this slice to the top
      targetRotation = rotation - midAngle + Math.PI / 2;
    }
  });

  // Polyfill roundRect for older browsers
  if (!ctx.roundRect) {
    ctx.roundRect = function (x, y, w, h, r) {
      if (r > w / 2) r = w / 2;
      if (r > h / 2) r = h / 2;
      this.moveTo(x + r, y);
      this.lineTo(x + w - r, y);
      this.arcTo(x + w, y, x + w, y + r, r);
      this.lineTo(x + w, y + h - r);
      this.arcTo(x + w, y + h, x + w - r, y + h, r);
      this.lineTo(x + r, y + h);
      this.arcTo(x, y + h, x, y + h - r, r);
      this.lineTo(x, y + r);
      this.arcTo(x, y, x + r, y, r);
    };
  }

  // Start animation loop with timestamp
  requestAnimationFrame(draw);
});
