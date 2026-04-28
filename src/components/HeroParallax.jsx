import { useEffect, useRef } from 'react';

const BLOSSOMS = [
  { left: '8%',  top: '22%', delay: '0s',   dur: '7s',   size: 6 },
  { left: '15%', top: '38%', delay: '1.2s', dur: '6s',   size: 5 },
  { left: '23%', top: '16%', delay: '2.4s', dur: '8s',   size: 7 },
  { left: '31%', top: '44%', delay: '0.6s', dur: '6.5s', size: 4 },
  { left: '39%', top: '27%', delay: '3.6s', dur: '7.5s', size: 6 },
  { left: '46%', top: '18%', delay: '1.8s', dur: '6s',   size: 5 },
  { left: '54%', top: '40%', delay: '4.2s', dur: '8s',   size: 7 },
  { left: '61%', top: '13%', delay: '0.9s', dur: '7s',   size: 4 },
  { left: '68%', top: '32%', delay: '2.7s', dur: '6.5s', size: 6 },
  { left: '75%', top: '23%', delay: '5.4s', dur: '7s',   size: 5 },
  { left: '82%', top: '47%', delay: '1.5s', dur: '8s',   size: 7 },
  { left: '89%', top: '19%', delay: '3.0s', dur: '6.5s', size: 4 },
  { left: '93%', top: '36%', delay: '4.8s', dur: '7.5s', size: 6 },
  { left: '13%', top: '57%', delay: '2.1s', dur: '6s',   size: 5 },
  { left: '77%', top: '57%', delay: '3.9s', dur: '7s',   size: 4 },
];

const EMBERS = [
  { left: '46%',   delay: '0s',   dur: '4s'   },
  { left: '47.5%', delay: '0.8s', dur: '3.5s' },
  { left: '49%',   delay: '1.6s', dur: '4.5s' },
  { left: '50.5%', delay: '0.4s', dur: '3.8s' },
  { left: '52%',   delay: '2.4s', dur: '4.2s' },
  { left: '44%',   delay: '1.2s', dur: '3.6s' },
  { left: '53.5%', delay: '3.2s', dur: '4s'   },
  { left: '48%',   delay: '2.0s', dur: '3.4s' },
  { left: '51%',   delay: '3.6s', dur: '4.8s' },
  { left: '45.5%', delay: '0.6s', dur: '3.2s' },
  { left: '54%',   delay: '2.8s', dur: '4.4s' },
  { left: '47%',   delay: '4.0s', dur: '3.6s' },
];

const TREES_LEFT = [
  [242,254,30,26],[272,246,24,21],[304,257,27,23],[337,249,22,19],
  [369,261,29,25],[401,252,25,21],[433,262,26,22],[465,253,22,19],
  [498,264,28,24],[531,255,23,20],[564,265,25,21],[598,256,21,18],
  [632,266,27,23],[664,257,22,19],
];
const TREES_RIGHT = [
  [754,260,23,20],[788,251,27,23],[822,262,25,21],[857,253,22,19],
  [892,264,26,22],[928,255,24,20],[964,265,22,19],[1000,256,25,21],
  [1036,266,23,20],
];

const SMOKE_PUFFS = [
  { cx: 710, begin: '0s',   r: 20 },
  { cx: 706, begin: '1.8s', r: 17 },
  { cx: 714, begin: '3.6s', r: 22 },
  { cx: 708, begin: '5.4s', r: 15 },
];

const FLAG_POLES = [640, 657, 674, 746, 763, 780];

const CAPITOL_COLS = [
  1167,1180,1193,1206,1219,1232,1256,1269,1282,1295,1308,1321,
];

export default function HeroParallax() {
  const ref = useRef(null);

  useEffect(() => {
    const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;
    if (reduced) return;
    const el = ref.current;
    if (!el) return;
    let raf;
    const layers = el.querySelectorAll('[data-speed]');
    const tick = () => {
      const y = window.scrollY;
      layers.forEach(l => {
        l.style.transform = `translateY(${y * parseFloat(l.dataset.speed)}px)`;
      });
    };
    const onScroll = () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(tick); };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => { window.removeEventListener('scroll', onScroll); cancelAnimationFrame(raf); };
  }, []);

  return (
    <div ref={ref} className="hero-parallax" aria-hidden="true">

      {/* ── Layer 1: DC skyline silhouette ── */}
      <div data-speed="0.18" className="hp-layer">
        <svg
          className="hp-skyline-svg"
          viewBox="0 0 1440 400"
          preserveAspectRatio="xMidYMax slice"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <radialGradient id="hpGlow" cx="49.3%" cy="100%" r="55%">
              <stop offset="0%" stopColor="rgba(244,140,6,0.38)" />
              <stop offset="100%" stopColor="rgba(244,140,6,0)" />
            </radialGradient>
            <radialGradient id="hpSmoke" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="rgba(160,110,55,0.55)" />
              <stop offset="100%" stopColor="rgba(160,110,55,0)" />
            </radialGradient>
            <linearGradient id="hpGround" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#200D04" />
              <stop offset="100%" stopColor="#0C0502" />
            </linearGradient>
          </defs>

          {/* Ember glow behind monument */}
          <ellipse cx="710" cy="290" rx="210" ry="135" fill="url(#hpGlow)" />

          {/* Ground */}
          <rect x="0" y="282" width="1440" height="118" fill="url(#hpGround)" />

          {/* Reflecting pool */}
          <rect x="222" y="279" width="472" height="8" rx="1" fill="#111C28" opacity="0.9" />

          {/* ── Lincoln Memorial ── */}
          <g fill="#1E0C04">
            <rect x="12"  y="268" width="212" height="14" />
            <rect x="26"  y="254" width="184" height="14" />
            <rect x="40"  y="240" width="156" height="14" />
            {[53,70,87,104,121,138,155,172].map(x => (
              <rect key={x} x={x} y="181" width="7" height="59" />
            ))}
            <rect x="40"  y="168" width="156" height="13" />
            <polygon points="40,168 196,168 118,141" />
          </g>

          {/* ── Trees left ── */}
          {TREES_LEFT.map(([cx,cy,rx,ry], i) => (
            <ellipse key={i} cx={cx} cy={cy} rx={rx} ry={ry}
              fill={i % 2 === 0 ? '#0E1B09' : '#121F0D'} />
          ))}

          {/* ── Washington Monument ── */}
          <polygon points="702,18 714,18 730,283 696,283" fill="#241004" />
          <polygon points="714,18 721,18 737,283 730,283" fill="#130800" />
          <polygon points="699,11 723,11 716,20 702,20"  fill="#1C0B04" />

          {/* ── Smoke rising from monument tip ── */}
          {SMOKE_PUFFS.map(({ cx, begin, r }, i) => (
            <circle key={i} cx={cx} cy="14" r={r} fill="url(#hpSmoke)" opacity="0">
              <animate attributeName="cy"
                from="14" to="-140"
                dur="6.5s" begin={begin} repeatCount="indefinite" />
              <animate attributeName="r"
                from={r} to={r * 3.2}
                dur="6.5s" begin={begin} repeatCount="indefinite" />
              <animate attributeName="opacity"
                values="0;0.55;0.35;0.15;0"
                keyTimes="0;0.12;0.4;0.75;1"
                dur="6.5s" begin={begin} repeatCount="indefinite" />
            </circle>
          ))}

          {/* ── Flag poles flanking monument ── */}
          {FLAG_POLES.map((x, i) => (
            <g key={x}>
              <line x1={x} y1={174 - (i % 2) * 6} x2={x} y2="285"
                stroke="#1C0C04" strokeWidth="2.5" />
              <rect x={x + 1} y={174 - (i % 2) * 6} width="19" height="13"
                fill="#5C1212" opacity="0.75" />
            </g>
          ))}

          {/* ── Trees right ── */}
          {TREES_RIGHT.map(([cx,cy,rx,ry], i) => (
            <ellipse key={i} cx={cx} cy={cy} rx={rx} ry={ry}
              fill={i % 2 === 0 ? '#0E1B09' : '#121F0D'} />
          ))}

          {/* ── Capitol Building ── */}
          <g fill="#1E0C04">
            <rect x="1055" y="234" width="377" height="50" />
            <rect x="1155" y="212" width="177" height="72" />
            {CAPITOL_COLS.map(x => (
              <rect key={x} x={x} y="212" width="5" height="72" fill="#160A03" />
            ))}
            <rect x="1207" y="168" width="76" height="47" />
            <ellipse cx="1245" cy="166" rx="54" ry="42" />
            <ellipse cx="1245" cy="160" rx="32" ry="26" fill="#150A02" />
            <rect x="1241" y="118" width="8" height="46" />
            <circle cx="1245" cy="114" r="6" />
            <rect x="1045" y="282" width="397" height="6" fill="#180A03" />
          </g>
        </svg>
      </div>

      {/* ── Layer 2: Cherry blossoms (faster parallax) ── */}
      <div data-speed="0.32" className="hp-layer">
        {BLOSSOMS.map((b, i) => (
          <div key={i} className="hp-blossom" style={{
            left: b.left, top: b.top,
            width: b.size, height: b.size,
            animationDelay: b.delay, animationDuration: b.dur,
          }} />
        ))}
      </div>

      {/* ── Layer 3: Embers (slow parallax, near monument) ── */}
      <div data-speed="0.07" className="hp-layer">
        {EMBERS.map((e, i) => (
          <div key={i} className="hp-ember-dot" style={{
            left: e.left, bottom: '28%',
            animationDelay: e.delay, animationDuration: e.dur,
          }} />
        ))}
      </div>

    </div>
  );
}
