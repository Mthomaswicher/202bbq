import { LOGO_PARTS } from '../assets/logo-paths.js';

// The logo as a vector system: mark-only (phones, favicon-sized uses),
// horizontal lockup (desktop header), stacked badge (footer). The smoke curls
// are a separate group so they can rise once on load — the site's one flourish.

const { mark, smoke, word } = LOGO_PARTS;

function box(part) {
  return {
    x: part.bbox.minX + part.offset[0],
    y: part.bbox.minY + part.offset[1],
    w: part.bbox.maxX - part.bbox.minX,
    h: part.bbox.maxY - part.bbox.minY,
  };
}
const M = box(mark), S = box(smoke), W = box(word);
// The mark's bounding box including smoke, in 1024-space.
const MARK_BOX = {
  x: Math.min(M.x, S.x), y: Math.min(M.y, S.y),
  x2: Math.max(M.x + M.w, S.x + S.w), y2: Math.max(M.y + M.h, S.y + S.h),
};
MARK_BOX.w = MARK_BOX.x2 - MARK_BOX.x; MARK_BOX.h = MARK_BOX.y2 - MARK_BOX.y;

function Paths({ animate }) {
  return (
    <>
      <g className={animate ? 'logo-smoke' : undefined} transform={`translate(${smoke.offset[0]} ${smoke.offset[1]})`}>
        <path d={smoke.d} />
      </g>
      <g transform={`translate(${mark.offset[0]} ${mark.offset[1]})`}>
        <path d={mark.d} />
      </g>
    </>
  );
}

/** Mark only. `size` is the rendered height in px. */
export function LogoMark({ size = 44, animate = false, className = '', title }) {
  const pad = 12;
  const vb = `${MARK_BOX.x - pad} ${MARK_BOX.y - pad} ${MARK_BOX.w + pad * 2} ${MARK_BOX.h + pad * 2}`;
  const width = Math.round(size * (MARK_BOX.w + pad * 2) / (MARK_BOX.h + pad * 2));
  return (
    <svg className={`logo logo-mark ${className}`.trim()} viewBox={vb} width={width} height={size} fill="currentColor"
      role={title ? 'img' : undefined} aria-hidden={title ? undefined : 'true'} focusable="false">
      {title && <title>{title}</title>}
      <Paths animate={animate} />
    </svg>
  );
}

/** Horizontal lockup: mark then wordmark, aligned on the baseline of the mark. */
export function LogoLockup({ size = 36, animate = false, className = '', title }) {
  // Scale the wordmark so its cap height is ~62% of the mark's height, and sit it to the right.
  const gap = 90;
  const wordScale = (MARK_BOX.h * 0.62) / W.h;
  const wordW = W.w * wordScale, wordH = W.h * wordScale;
  const wordX = MARK_BOX.x2 + gap;
  const wordY = MARK_BOX.y2 - wordH - MARK_BOX.h * 0.06;
  const pad = 12;
  const totalW = (wordX + wordW) - MARK_BOX.x;
  const vb = `${MARK_BOX.x - pad} ${MARK_BOX.y - pad} ${totalW + pad * 2} ${MARK_BOX.h + pad * 2}`;
  const width = Math.round(size * (totalW + pad * 2) / (MARK_BOX.h + pad * 2));
  return (
    <svg className={`logo logo-lockup ${className}`.trim()} viewBox={vb} width={width} height={size} fill="currentColor"
      role={title ? 'img' : undefined} aria-hidden={title ? undefined : 'true'} focusable="false">
      {title && <title>{title}</title>}
      <Paths animate={animate} />
      <g transform={`translate(${wordX - W.x * wordScale} ${wordY - W.y * wordScale}) scale(${wordScale})`}>
        <g transform={`translate(${word.offset[0]} ${word.offset[1]})`}><path d={word.d} /></g>
      </g>
    </svg>
  );
}

/** Stacked badge: mark over wordmark, as on the original artwork. */
export function LogoBadge({ size = 96, className = '', title }) {
  const pad = 40;
  const vb = `${pad} ${pad} ${1024 - pad * 2} ${1024 - pad * 2}`;
  return (
    <svg className={`logo logo-badge ${className}`.trim()} viewBox={vb} width={size} height={size} fill="currentColor"
      role={title ? 'img' : undefined} aria-hidden={title ? undefined : 'true'} focusable="false">
      {title && <title>{title}</title>}
      <Paths animate={false} />
      <g transform={`translate(${word.offset[0]} ${word.offset[1]})`}><path d={word.d} /></g>
    </svg>
  );
}
