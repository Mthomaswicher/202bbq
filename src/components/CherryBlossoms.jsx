import { useEffect, useRef } from 'react';

function rand(min, max) { return Math.random() * (max - min) + min; }

function makePetal(w, h, initial = true) {
  return {
    x: rand(0, w),
    y: initial ? rand(-h * 0.4, h) : -40,
    vx: rand(-0.12, 0.12),
    vy: rand(0.18, 0.55),
    size: rand(32, 54),
    rot: rand(0, 360),
    vrot: rand(-0.25, 0.25),
    hue: Math.floor(rand(340, 355)),
    sway: rand(0, Math.PI * 2),
    swaySpeed: rand(0.0008, 0.0018),
    swayAmp: rand(0.25, 0.75),
    opacity: rand(0.5, 0.95),
    spawned: false,
    life: 0,
  };
}

function petalSvg(hue) {
  const blades = [0, 1, 2, 3, 4].map(i => (
    `<path d="M0,-13 C4.6,-12 6,-6 0,-1 C-6,-6 -4.6,-12 0,-13 Z" transform="rotate(${i * 72})" fill="hsl(${hue}, 82%, 88%)" stroke="hsl(${hue}, 55%, 72%)" stroke-width="0.4" stroke-linejoin="round"/>`
  )).join('');
  return `<svg viewBox="-20 -20 40 40" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><g>${blades}<circle r="1.8" fill="#F5C518"/></g></svg>`;
}

export default function CherryBlossoms({ count = 18, spawnOnClick = true, repel = true, variant = 'full' }) {
  const containerRef = useRef(null);
  const petalsRef = useRef([]);
  const elementsRef = useRef([]);
  const mouseRef = useRef({ x: -9999, y: -9999, active: false });
  const rafRef = useRef(0);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const reduced = typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;
    const isSmall = typeof window !== 'undefined' && window.matchMedia?.('(max-width: 768px)')?.matches;
    const effectiveCount = isSmall ? Math.max(4, Math.floor(count * 0.5)) : count;

    const getRect = () => container.getBoundingClientRect();
    const initRect = getRect();
    if (!initRect.width || !initRect.height) return;

    petalsRef.current = Array.from({ length: effectiveCount }, () => makePetal(initRect.width, initRect.height));
    petalsRef.current.forEach(p => {
      const el = document.createElement('div');
      el.className = 'blossom';
      el.innerHTML = petalSvg(p.hue);
      el.style.width = `${p.size}px`;
      el.style.height = `${p.size}px`;
      el.style.opacity = p.opacity;
      container.appendChild(el);
      elementsRef.current.push(el);
    });

    const parent = container.parentElement;

    const onMove = e => {
      const r = getRect();
      mouseRef.current.x = e.clientX - r.left;
      mouseRef.current.y = e.clientY - r.top;
      mouseRef.current.active = true;
    };
    const onLeave = () => { mouseRef.current.active = false; };
    const onClick = e => {
      if (!spawnOnClick) return;
      const r = getRect();
      const cx = e.clientX - r.left;
      const cy = e.clientY - r.top;
      for (let i = 0; i < 9; i++) {
        const p = makePetal(r.width, r.height, true);
        p.x = cx;
        p.y = cy;
        const angle = rand(0, Math.PI * 2);
        const speed = rand(1.4, 3.4);
        p.vx = Math.cos(angle) * speed;
        p.vy = Math.sin(angle) * speed - 1;
        p.vrot = rand(-3, 3);
        p.spawned = true;
        p.opacity = 1;
        petalsRef.current.push(p);
        const el = document.createElement('div');
        el.className = 'blossom blossom--spawn';
        el.innerHTML = petalSvg(p.hue);
        el.style.width = `${p.size}px`;
        el.style.height = `${p.size}px`;
        container.appendChild(el);
        elementsRef.current.push(el);
      }
    };

    parent.addEventListener('mousemove', onMove, { passive: true });
    parent.addEventListener('mouseleave', onLeave);
    if (spawnOnClick) parent.addEventListener('click', onClick);

    let last = performance.now();
    const step = now => {
      const dt = Math.min(48, now - last);
      last = now;
      const r = getRect();

      for (let i = petalsRef.current.length - 1; i >= 0; i--) {
        const p = petalsRef.current[i];
        const el = elementsRef.current[i];
        if (!el) continue;

        p.sway += p.swaySpeed * dt;
        p.x += (p.vx + Math.cos(p.sway) * p.swayAmp) * dt * 0.06;
        p.y += p.vy * dt * 0.06;
        p.rot += p.vrot * dt * 0.1;
        p.life += dt;

        if (p.spawned) {
          p.vy += 0.002 * dt;
          p.vx *= Math.pow(0.992, dt * 0.1);
        }

        if (repel && mouseRef.current.active) {
          const dx = p.x - mouseRef.current.x;
          const dy = p.y - mouseRef.current.y;
          const d2 = dx * dx + dy * dy;
          if (d2 < 12100) {
            const dist = Math.sqrt(d2) || 1;
            const force = (1 - dist / 110) * 1.8;
            p.x += (dx / dist) * force;
            p.y += (dy / dist) * force;
          }
        }

        if (p.spawned && (p.y > r.height + 80 || p.life > 8000)) {
          el.remove();
          petalsRef.current.splice(i, 1);
          elementsRef.current.splice(i, 1);
          continue;
        }
        if (!p.spawned) {
          if (p.y > r.height + 40) {
            p.y = -40;
            p.x = rand(0, r.width);
          }
          if (p.x > r.width + 40) p.x = -40;
          if (p.x < -40) p.x = r.width + 40;
        }

        el.style.transform = `translate3d(${p.x}px, ${p.y}px, 0) rotate(${p.rot}deg)`;
      }

      rafRef.current = requestAnimationFrame(step);
    };

    if (!reduced) {
      rafRef.current = requestAnimationFrame(step);
    } else {
      petalsRef.current.forEach((p, i) => {
        const el = elementsRef.current[i];
        if (el) el.style.transform = `translate3d(${p.x}px, ${p.y}px, 0) rotate(${p.rot}deg)`;
      });
    }

    return () => {
      cancelAnimationFrame(rafRef.current);
      parent.removeEventListener('mousemove', onMove);
      parent.removeEventListener('mouseleave', onLeave);
      if (spawnOnClick) parent.removeEventListener('click', onClick);
      elementsRef.current.forEach(el => el.remove());
      elementsRef.current = [];
      petalsRef.current = [];
    };
  }, [count, spawnOnClick, repel]);

  return <div ref={containerRef} className={`blossoms-layer blossoms-layer--${variant}`} aria-hidden="true" />;
}
