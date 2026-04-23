import { useEffect, useRef } from 'react';

export default function SmokerCursor() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const fine = window.matchMedia('(pointer: fine)').matches;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!fine || reduced) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let dpr = Math.min(window.devicePixelRatio || 1, 2);
    let W = 0, H = 0;

    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = window.innerWidth;
      H = window.innerHeight;
      canvas.width = W * dpr;
      canvas.height = H * dpr;
      canvas.style.width = W + 'px';
      canvas.style.height = H + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    resize();
    window.addEventListener('resize', resize);

    // Soft radial puff sprite
    const SPRITE_SIZE = 128;
    const sprite = document.createElement('canvas');
    sprite.width = sprite.height = SPRITE_SIZE;
    {
      const sctx = sprite.getContext('2d');
      const g = sctx.createRadialGradient(
        SPRITE_SIZE / 2, SPRITE_SIZE / 2, 0,
        SPRITE_SIZE / 2, SPRITE_SIZE / 2, SPRITE_SIZE / 2
      );
      g.addColorStop(0.0, 'rgba(255,255,255,0.55)');
      g.addColorStop(0.35, 'rgba(220,220,225,0.25)');
      g.addColorStop(0.7, 'rgba(180,180,185,0.08)');
      g.addColorStop(1.0, 'rgba(160,160,165,0.0)');
      sctx.fillStyle = g;
      sctx.fillRect(0, 0, SPRITE_SIZE, SPRITE_SIZE);
    }

    // Smoker sprite — drawn once in "design space" then scaled down.
    const DESIGN_W = 120;
    const DESIGN_H = 110;
    const DESIGN_CHIMNEY_X = 22;
    const DESIGN_CHIMNEY_Y = 6;
    const SMOKER_W = 48;
    const SMOKER_H = SMOKER_W * (DESIGN_H / DESIGN_W);
    const CHIMNEY_X = DESIGN_CHIMNEY_X * (SMOKER_W / DESIGN_W);
    const CHIMNEY_Y = DESIGN_CHIMNEY_Y * (SMOKER_H / DESIGN_H);

    const smoker = document.createElement('canvas');
    smoker.width = DESIGN_W * 2;
    smoker.height = DESIGN_H * 2;
    {
      const s = smoker.getContext('2d');
      s.scale(2, 2);

      function roundRect(c, x, y, w, h, r) {
        c.beginPath();
        c.moveTo(x + r, y);
        c.arcTo(x + w, y, x + w, y + h, r);
        c.arcTo(x + w, y + h, x, y + h, r);
        c.arcTo(x, y + h, x, y, r);
        c.arcTo(x, y, x + w, y, r);
        c.closePath();
      }

      s.fillStyle = 'rgba(0,0,0,0.35)';
      s.beginPath();
      s.ellipse(60, 100, 50, 5, 0, 0, Math.PI * 2);
      s.fill();

      s.fillStyle = '#3a3a3a';
      s.fillRect(22, 75, 4, 22);
      s.fillRect(92, 75, 4, 22);
      s.fillRect(55, 78, 4, 19);

      const barrelGrad = s.createLinearGradient(0, 35, 0, 82);
      barrelGrad.addColorStop(0, '#8a5a3a');
      barrelGrad.addColorStop(0.3, '#6a3a22');
      barrelGrad.addColorStop(1, '#3a1e0e');
      s.fillStyle = barrelGrad;
      roundRect(s, 12, 38, 80, 42, 18);
      s.fill();

      s.fillStyle = 'rgba(255,200,140,0.22)';
      roundRect(s, 16, 40, 72, 6, 3);
      s.fill();

      s.strokeStyle = 'rgba(255,180,100,0.18)';
      s.lineWidth = 1;
      s.beginPath();
      s.moveTo(52, 39);
      s.lineTo(52, 79);
      s.stroke();

      s.fillStyle = '#2a2a2a';
      roundRect(s, 44, 34, 16, 5, 2);
      s.fill();

      const fireGrad = s.createLinearGradient(0, 55, 0, 80);
      fireGrad.addColorStop(0, '#6a3a22');
      fireGrad.addColorStop(1, '#2a1008');
      s.fillStyle = fireGrad;
      roundRect(s, 88, 52, 22, 28, 4);
      s.fill();

      s.fillStyle = '#1a0a05';
      roundRect(s, 92, 58, 14, 16, 2);
      s.fill();
      const emberGrad = s.createRadialGradient(99, 66, 0, 99, 66, 8);
      emberGrad.addColorStop(0, 'rgba(255,180,60,1.0)');
      emberGrad.addColorStop(0.4, 'rgba(232,93,4,0.75)');
      emberGrad.addColorStop(1, 'rgba(180,40,10,0)');
      s.fillStyle = emberGrad;
      s.fillRect(88, 55, 22, 22);

      s.fillStyle = '#ccc';
      s.beginPath();
      s.arc(72, 44, 3, 0, Math.PI * 2);
      s.fill();
      s.fillStyle = '#555';
      s.beginPath();
      s.arc(72, 44, 2, 0, Math.PI * 2);
      s.fill();

      const chimGrad = s.createLinearGradient(15, 0, 30, 0);
      chimGrad.addColorStop(0, '#3a3a3a');
      chimGrad.addColorStop(0.5, '#6a6a6a');
      chimGrad.addColorStop(1, '#3a3a3a');
      s.fillStyle = chimGrad;
      s.fillRect(18, 8, 9, 32);

      s.fillStyle = '#555';
      s.fillRect(15, 6, 15, 4);

      s.fillStyle = 'rgba(255,255,255,0.25)';
      s.fillRect(15, 6, 15, 1);
    }

    const particles = [];
    const MAX_PARTICLES = 400;

    let mouseX = -200;
    let mouseY = -200;
    let targetX = mouseX;
    let targetY = mouseY;
    let lastX = mouseX;
    let lastY = mouseY;
    let lastTime = performance.now();
    let speed = 0;
    let hasMoved = false;
    let visible = false;
    let rafId = 0;
    let idleAccum = 0;

    function onMove(e) {
      targetX = e.clientX;
      targetY = e.clientY;
      if (!hasMoved) {
        // Snap on first move so the smoker doesn't fly in from off-screen.
        mouseX = lastX = targetX;
        mouseY = lastY = targetY;
      }
      hasMoved = true;
      visible = true;
    }
    function onLeave() { visible = false; }
    function onEnter() { visible = true; }

    window.addEventListener('mousemove', onMove);
    document.addEventListener('mouseleave', onLeave);
    document.addEventListener('mouseenter', onEnter);

    function spawnPuff(x, y, intensity) {
      if (particles.length >= MAX_PARTICLES) return;
      const angle = -Math.PI / 2 + (Math.random() - 0.5) * 0.5;
      const speed0 = 0.5 + Math.random() * 0.9 + intensity * 0.5;
      particles.push({
        x: x + (Math.random() - 0.5) * 4,
        y: y + (Math.random() - 0.5) * 3,
        vx: Math.cos(angle) * speed0 + (Math.random() - 0.5) * 0.25,
        vy: Math.sin(angle) * speed0 - 0.4,
        swirlSeed: Math.random() * Math.PI * 2,
        swirlRate: 0.015 + Math.random() * 0.02,
        swirlAmp: 0.2 + Math.random() * 0.3,
        size: 3 + Math.random() * 3,
        growth: 0.12 + Math.random() * 0.15,
        life: 0,
        maxLife: 50 + Math.random() * 50,
        rot: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.01,
        alpha0: 0.18 + Math.random() * 0.14,
      });
    }

    function frame(now) {
      const dt = Math.min(32, now - lastTime) / 16.67;
      lastTime = now;

      mouseX += (targetX - mouseX) * Math.min(1, 0.35 * dt);
      mouseY += (targetY - mouseY) * Math.min(1, 0.35 * dt);

      const dx = mouseX - lastX;
      const dy = mouseY - lastY;
      const instSpeed = Math.hypot(dx, dy);
      speed = speed * 0.8 + instSpeed * 0.2;
      lastX = mouseX;
      lastY = mouseY;

      if (visible && hasMoved && instSpeed > 4) {
        const steps = Math.min(1, Math.ceil(instSpeed / 80));
        for (let i = 0; i < steps; i++) {
          const t = steps === 0 ? 0 : i / steps;
          const px = lastX - dx * (1 - t);
          const py = lastY - dy * (1 - t);
          spawnPuff(px, py, Math.min(1, instSpeed / 60));
        }
      }

      if (visible && hasMoved) {
        idleAccum += dt;
        const idleInterval = speed < 0.5 ? 28 : 40;
        while (idleAccum >= idleInterval) {
          idleAccum -= idleInterval;
          spawnPuff(mouseX, mouseY, 0);
        }
      }

      // Full clear — the site has its own background so we don't want a wash.
      ctx.clearRect(0, 0, W, H);

      ctx.globalCompositeOperation = 'lighter';
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];

        p.swirlSeed += p.swirlRate * dt;
        p.vx += Math.cos(p.swirlSeed) * p.swirlAmp * 0.05 * dt;
        p.vy += Math.sin(p.swirlSeed * 0.8) * p.swirlAmp * 0.03 * dt;

        p.vy -= 0.018 * dt;
        p.vx *= Math.pow(0.985, dt);
        p.vy *= Math.pow(0.99, dt);

        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.size += p.growth * dt;
        p.rot += p.rotSpeed * dt;
        p.life += dt;

        const lifeT = p.life / p.maxLife;
        if (lifeT >= 1) {
          particles.splice(i, 1);
          continue;
        }

        let alpha;
        if (lifeT < 0.1) alpha = (lifeT / 0.1) * p.alpha0;
        else {
          const k = (lifeT - 0.1) / 0.9;
          alpha = p.alpha0 * (1 - k) * (1 - k);
        }

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.globalAlpha = alpha;
        const sz = p.size;
        ctx.drawImage(sprite, -sz, -sz, sz * 2, sz * 2);
        ctx.restore();
      }

      ctx.globalCompositeOperation = 'source-over';
      ctx.globalAlpha = 1;

      if (visible && hasMoved) {
        ctx.shadowColor = 'rgba(232,93,4,0.55)';
        ctx.shadowBlur = 14;
        ctx.drawImage(smoker, mouseX - CHIMNEY_X, mouseY - CHIMNEY_Y, SMOKER_W, SMOKER_H);
        ctx.shadowBlur = 0;
        ctx.shadowColor = 'transparent';
      }

      rafId = requestAnimationFrame(frame);
    }

    rafId = requestAnimationFrame((t) => { lastTime = t; frame(t); });

    // Hide the native cursor site-wide while this is active.
    const prevCursor = document.documentElement.style.cursor;
    document.documentElement.style.cursor = 'none';
    const styleEl = document.createElement('style');
    styleEl.textContent = '*, *::before, *::after { cursor: none !important; }';
    document.head.appendChild(styleEl);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseleave', onLeave);
      document.removeEventListener('mouseenter', onEnter);
      document.documentElement.style.cursor = prevCursor;
      styleEl.remove();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{
        position: 'fixed',
        inset: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 9999,
      }}
    />
  );
}
