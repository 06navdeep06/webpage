/**
 * morph-bg.js
 * Injects a morphing SVG blob into every non-hero section.
 * Each section gets its own blob with unique colours + timing.
 */
(function () {
  'use strict';

  /* Accent palette — matches CSS vars */
  const PALETTES = [
    ['rgba(110,0,255,0.07)',  'rgba(255,61,0,0.05)'],
    ['rgba(0,229,179,0.06)',  'rgba(110,0,255,0.05)'],
    ['rgba(255,204,0,0.06)',  'rgba(255,61,0,0.05)'],
    ['rgba(110,0,255,0.05)',  'rgba(0,229,179,0.06)'],
    ['rgba(255,61,0,0.06)',   'rgba(255,204,0,0.05)'],
    ['rgba(0,229,179,0.07)',  'rgba(110,0,255,0.04)'],
  ];

  /* Generate a random blob path with n control points */
  function blobPath(cx, cy, rx, ry, n, seed) {
    const pts = [];
    for (let i = 0; i < n; i++) {
      const angle = (i / n) * Math.PI * 2;
      const jitter = 0.55 + 0.45 * Math.sin(seed + i * 1.7 + angle * 0.9);
      pts.push([
        cx + rx * jitter * Math.cos(angle),
        cy + ry * jitter * Math.sin(angle),
      ]);
    }
    /* Smooth cubic bezier through points */
    let d = `M ${pts[0][0]} ${pts[0][1]}`;
    for (let i = 0; i < n; i++) {
      const p0 = pts[(i - 1 + n) % n];
      const p1 = pts[i];
      const p2 = pts[(i + 1) % n];
      const p3 = pts[(i + 2) % n];
      const cp1x = p1[0] + (p2[0] - p0[0]) / 6;
      const cp1y = p1[1] + (p2[1] - p0[1]) / 6;
      const cp2x = p2[0] - (p3[0] - p1[0]) / 6;
      const cp2y = p2[1] - (p3[1] - p1[1]) / 6;
      d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2[0]} ${p2[1]}`;
    }
    return d + ' Z';
  }

  function lerp(a, b, t) { return a + (b - a) * t; }

  function setupSection(section, paletteIdx) {
    const [c1, c2] = PALETTES[paletteIdx % PALETTES.length];
    const id = `morph-grad-${paletteIdx}`;

    const ns = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(ns, 'svg');
    svg.setAttribute('aria-hidden', 'true');
    svg.style.cssText = [
      'position:absolute', 'inset:0', 'width:100%', 'height:100%',
      'z-index:-1', 'pointer-events:none', 'overflow:visible',
    ].join(';');

    /* Gradient */
    const defs  = document.createElementNS(ns, 'defs');
    const grad  = document.createElementNS(ns, 'radialGradient');
    grad.id = id;
    grad.setAttribute('cx', '50%');
    grad.setAttribute('cy', '50%');
    grad.setAttribute('r',  '60%');
    const s1 = document.createElementNS(ns, 'stop');
    s1.setAttribute('offset', '0%');
    s1.setAttribute('stop-color', c1);
    const s2 = document.createElementNS(ns, 'stop');
    s2.setAttribute('offset', '100%');
    s2.setAttribute('stop-color', c2);
    grad.appendChild(s1);
    grad.appendChild(s2);
    defs.appendChild(grad);
    svg.appendChild(defs);

    /* Blob path element */
    const path = document.createElementNS(ns, 'path');
    path.setAttribute('fill', `url(#${id})`);
    svg.appendChild(path);

    /* Insert as first child so it sits behind content */
    section.style.position = 'relative';
    section.insertBefore(svg, section.firstChild);

    /* Animation state */
    const N      = 8;
    const phase  = paletteIdx * 1.3;
    let   seedA  = phase;
    let   seedB  = phase + Math.PI;
    let   t      = 0;
    let   dir    = 1;
    const SPEED  = 0.004;

    function tick() {
      const rect = section.getBoundingClientRect();
      const W = rect.width  || window.innerWidth;
      const H = rect.height || window.innerHeight;
      const cx = W * (0.45 + 0.1 * Math.sin(seedA * 0.3));
      const cy = H * (0.45 + 0.1 * Math.cos(seedA * 0.25));
      const rx = W * 0.42;
      const ry = H * 0.42;

      const pA = blobPath(cx, cy, rx, ry, N, seedA);
      const pB = blobPath(cx, cy, rx, ry, N, seedB);

      /* Interpolate between two blob shapes by blending seeds */
      const blended = blobPath(cx, cy, rx, ry, N, lerp(seedA, seedB, t));
      path.setAttribute('d', blended);

      t += SPEED * dir;
      if (t >= 1) { t = 1; dir = -1; seedA = seedB; seedB = seedA + Math.PI * (0.8 + Math.random() * 0.6); }
      if (t <= 0) { t = 0; dir =  1; }

      seedA += 0.003;
    }

    return tick;
  }

  document.addEventListener('DOMContentLoaded', () => {
    const sections = Array.from(document.querySelectorAll(
      '#about, #philosophy, #projects, #github-stats, #contact'
    ));

    const ticks = sections.map((s, i) => setupSection(s, i));

    function loop() {
      ticks.forEach(fn => fn());
      requestAnimationFrame(loop);
    }
    requestAnimationFrame(loop);
  });
})();
