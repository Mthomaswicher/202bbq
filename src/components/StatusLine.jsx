import { useEffect, useState } from 'react';
import { orderWindow, visitorOutsideET } from '../lib/time.js';
import { PhoneLink } from './ui/Bits.jsx';

/**
 * "Ordering open for Sat Sep 5 · Sun Sep 6 — closes Thu 9 pm" — a plain
 * paragraph with a rust dot, recomputed every minute in Eastern time.
 * `et`: append " ET" to the cut-off (first mention in a section, or always for
 * visitors outside Eastern time). `withPhone`: add "Questions? Call …".
 */
export default function StatusLine({ et = false, withPhone = false, className = '' }) {
  const [win, setWin] = useState(() => orderWindow());
  useEffect(() => {
    const t = setInterval(() => setWin(orderWindow()), 60 * 1000);
    return () => clearInterval(t);
  }, []);
  const showEt = et || visitorOutsideET();
  let sentence = win.sentence;
  if (showEt && !win.holiday) sentence = sentence.replace(win.cutoffLabel, `${win.cutoffLabel} ET`);
  const closing = win.state === 'closing';
  return (
    <p className={`statusline ${className}`.trim()}>
      <span className="dot" aria-hidden="true" />
      <span>
        {closing ? <><strong>Ordering closes tonight at {win.cutoffLabel}{showEt ? ' ET' : ''}</strong>{sentence.replace(/^Ordering closes tonight at [^ ]+ [ap]m( ET)?/, '')}</> : sentence}
        {withPhone && <> Questions? Call <PhoneLink location="menu_status" />.</>}
      </span>
    </p>
  );
}

export function useOrderWindow() {
  const [win, setWin] = useState(() => orderWindow());
  useEffect(() => {
    const t = setInterval(() => setWin(orderWindow()), 60 * 1000);
    return () => clearInterval(t);
  }, []);
  return win;
}
