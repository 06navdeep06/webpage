/**
 * bg-canvas.js
 * Techy background: dot grid + drifting particles + connecting lines
 * Runs on a fixed canvas behind all sections.
 */
(function () {
  'use strict';

  const canvas = document.createElement('canvas');
  canvas.id = 'bg-canvas';
  canvas.style.cssText = [
    'position:fixed', 'inset:0', 'width:100%', 'height:100%',
    'z-index:0', 'pointer-events:none', 'opacity:0.35'
  ].join(';');
  document.body.insertBefore(canvas, document.body.firstChild);

  const ctx = canvas.getContext('2d');
  let W, H, particles, animId;

  const PARTICLE_COUNT = 55;
  const CONNECT_DIST   = 140;
  const DOT_SPACING    = 44;
  const ACCENT         = '110,0,255';   /* --color-accent-2 */
  const ACCENT2        = '0,229,179';   /* --color-accent-3 */

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }

  function mkParticle() {
    return {
      x:  Math.random() * W,
      y:  Math.random() * H,
      vx: (Math.random() - 0.5) * 0.35,
      vy: (Math.random() - 0.5) * 0.35,
      r:  Math.random() * 1.8 + 0.6,
      color: Math.random() > 0.5 ? ACCENT : ACCENT2,
    };
  }

  function init() {
    resize();
    particles = Array.from({ length: PARTICLE_COUNT }, mkParticle);
  }

  function drawDotGrid() {
    ctx.fillStyle = `rgba(${ACCENT},0.12)`;
    for (let x = DOT_SPACING / 2; x < W; x += DOT_SPACING) {
      for (let y = DOT_SPACING / 2; y < H; y += DOT_SPACING) {
        ctx.beginPath();
        ctx.arc(x, y, 0.9, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  function drawParticles() {
    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];

      /* move */
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < 0) p.x = W;
      if (p.x > W) p.x = 0;
      if (p.y < 0) p.y = H;
      if (p.y > H) p.y = 0;

      /* dot */
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${p.color},0.7)`;
      ctx.fill();

      /* connecting lines */
      for (let j = i + 1; j < particles.length; j++) {
        const q   = particles[j];
        const dx  = p.x - q.x;
        const dy  = p.y - q.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < CONNECT_DIST) {
          const alpha = (1 - dist / CONNECT_DIST) * 0.18;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(q.x, q.y);
          ctx.strokeStyle = `rgba(${p.color},${alpha})`;
          ctx.lineWidth = 0.8;
          ctx.stroke();
        }
      }
    }
  }

  function frame() {
    ctx.clearRect(0, 0, W, H);
    drawDotGrid();
    drawParticles();
    animId = requestAnimationFrame(frame);
  }

  window.addEventListener('resize', () => {
    cancelAnimationFrame(animId);
    resize();
    frame();
  });

  init();
  frame();
})();
