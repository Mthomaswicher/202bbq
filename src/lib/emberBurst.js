// Spawns a short-lived ember particle burst at a screen coordinate.
// Call with clientX/clientY from a mouse event.

export function burstEmbers(x, y, count = 12) {
  if (typeof document === 'undefined') return;
  const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;
  if (reduced) return;

  let layer = document.getElementById('__ember_burst_layer');
  if (!layer) {
    layer = document.createElement('div');
    layer.id = '__ember_burst_layer';
    layer.className = 'ember-burst-layer';
    layer.setAttribute('aria-hidden', 'true');
    document.body.appendChild(layer);
  }

  for (let i = 0; i < count; i++) {
    const p = document.createElement('span');
    p.className = 'ember-particle';
    const angle = Math.random() * Math.PI * 2;
    const dist = 36 + Math.random() * 70;
    const size = 5 + Math.random() * 7;
    p.style.left = `${x}px`;
    p.style.top = `${y}px`;
    p.style.width = `${size}px`;
    p.style.height = `${size}px`;
    p.style.setProperty('--tx', `${Math.cos(angle) * dist}px`);
    p.style.setProperty('--ty', `${Math.sin(angle) * dist - 24}px`);
    p.style.animationDelay = `${Math.random() * 90}ms`;
    layer.appendChild(p);
    setTimeout(() => p.remove(), 1000);
  }
}
