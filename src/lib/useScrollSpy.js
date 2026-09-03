import { useEffect, useState } from 'react';

/**
 * Which of `ids` is the current section: the one whose top is nearest below
 * the sticky chrome. One IntersectionObserver, no scroll listeners.
 * `topInset` is the height of the sticky chrome in px (function or number).
 */
export function useScrollSpy(ids, { topInset = 0, bottom = '-60%' } = {}) {
  const [active, setActive] = useState('');
  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return undefined;
    const els = ids.map(id => document.getElementById(id)).filter(Boolean);
    if (!els.length) return undefined;
    const inset = typeof topInset === 'function' ? topInset() : topInset;
    const visible = new Map();
    const pick = () => {
      // The current section is the LAST visible one whose top sits at or above the chrome line;
      // failing that, the first visible one; failing that, the last one scrolled past.
      const vis = els.filter(el => visible.get(el));
      let best = null;
      for (const el of vis) if (el.getBoundingClientRect().top <= inset + 64) best = el;
      if (!best && vis.length) best = vis[0];
      if (!best) for (const el of els) if (el.getBoundingClientRect().top <= inset + 8) best = el;
      setActive(best ? best.id : '');
    };
    const io = new IntersectionObserver(entries => {
      for (const e of entries) visible.set(e.target, e.isIntersecting);
      pick();
    }, { rootMargin: `-${inset + 8}px 0px ${bottom} 0px`, threshold: 0 });
    els.forEach(el => io.observe(el));
    pick();
    return () => io.disconnect();
  }, [ids.join('|'), topInset, bottom]); // eslint-disable-line react-hooks/exhaustive-deps
  return active;
}

/** Move focus to a section heading after a same-page jump, without fighting the scroll. */
export function focusHeading(id) {
  window.setTimeout(() => {
    const el = document.getElementById(`${id}-heading`) || document.getElementById(id);
    if (el) {
      if (!el.hasAttribute('tabindex')) el.setAttribute('tabindex', '-1');
      el.focus({ preventScroll: true });
    }
  }, 0);
}
