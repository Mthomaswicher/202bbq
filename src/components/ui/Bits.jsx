import { SITE } from '../../data/site.js';
import { track } from '../../lib/analytics.js';
import Icon from './Icon.jsx';

/** The phone number as a tel: link — digits with hyphens, tabular, ≥17px. */
export function PhoneLink({ label, className = '', location = 'inline', button, size, icon = true, ...rest }) {
  const text = label ?? SITE.phone;
  const onClick = () => track('contact', { method: 'phone', location });
  if (button) {
    return (
      <a href={SITE.phoneHref} className={`btn btn-${button}${size === 'lg' ? ' btn-lg' : ''}${size === 'compact' ? ' btn-compact' : ''} ${className}`.trim()} onClick={onClick} {...rest}>
        {icon && <Icon name="phone" size={20} />}
        <span className="phone">{text}</span>
      </a>
    );
  }
  return <a href={SITE.phoneHref} className={`phone ${className}`.trim()} onClick={onClick} {...rest}>{text}</a>;
}

/** Section wrapper: <section id aria-labelledby> with a left-aligned h2 on a rule. */
export function Section({ id, title, lede, children, className = '', grid, stickyHead, headExtra, containerClass = 'container', titleId }) {
  const hid = titleId ?? `${id}-heading`;
  const head = (
    <div className="section-head">
      <h2 id={hid} tabIndex={-1}>{title}</h2>
      {lede && <p className="lede">{lede}</p>}
      {headExtra}
    </div>
  );
  return (
    <section id={id} className={`section ${className}`.trim()} aria-labelledby={hid}>
      <div className={containerClass}>
        {grid ? (
          <div className={`section-grid${stickyHead ? ' sticky-head' : ''}`}>
            {head}
            <div className="section-body">{children}</div>
          </div>
        ) : (
          <>
            {head}
            {children}
          </>
        )}
      </div>
    </section>
  );
}

/** Stars-and-bars divider from the DC flag. Decorative. Max three per page. */
export function Divider() {
  return (
    <div className="divider" aria-hidden="true">
      <svg viewBox="0 0 72 16" fill="currentColor">
        <path d="m12 1 2.1 4.3 4.7.7-3.4 3.3.8 4.7L12 11.8 7.8 14l.8-4.7L5.2 6l4.7-.7z" />
        <path d="m36 1 2.1 4.3 4.7.7-3.4 3.3.8 4.7L36 11.8 31.8 14l.8-4.7L29.2 6l4.7-.7z" />
        <path d="m60 1 2.1 4.3 4.7.7-3.4 3.3.8 4.7L60 11.8 55.8 14l.8-4.7L53.2 6l4.7-.7z" />
      </svg>
      <span className="bars" />
    </div>
  );
}

export function Tag({ children }) {
  return <span className="tag">{children}</span>;
}

/** Star rating as an image with a text alternative. */
export function Stars({ rating, outOf = 5 }) {
  return (
    <span className="stars" role="img" aria-label={`${rating} out of ${outOf} stars`}>
      {Array.from({ length: outOf }, (_, i) => (
        <Icon key={i} name="star" size={20} fill={i < rating} className={i < rating ? 'star on' : 'star off'} />
      ))}
    </span>
  );
}

/** Copies text; announces via the provided callback. */
export function CopyButton({ text, label = 'Copy', onCopied, className = '', ...rest }) {
  const copy = async () => {
    try { await navigator.clipboard.writeText(text); onCopied?.(); } catch { /* clipboard blocked; nothing to do */ }
  };
  return (
    <button type="button" className={`btn btn-secondary btn-compact ${className}`.trim()} onClick={copy} {...rest}>
      <Icon name="copy" size={18} /><span>{label}</span>
    </button>
  );
}
