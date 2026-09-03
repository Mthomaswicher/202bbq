import Icon from './Icon.jsx';

const VARIANTS = {
  primary: 'btn-primary',
  secondary: 'btn-secondary',
  tertiary: 'btn-tertiary',
  danger: 'btn-danger-text',
};

/**
 * <Button> renders a real <button> (default type="button") or, with `href`, an <a>.
 * Label rule: verb + object, sentence case; put the price inside when the price is the decision.
 */
export default function Button({
  variant = 'primary', size, full, mobileFull, icon, iconRight, busy, href, className = '', children, type, ...rest
}) {
  const cls = [
    'btn', VARIANTS[variant] ?? VARIANTS.primary,
    size === 'lg' && 'btn-lg', size === 'compact' && 'btn-compact',
    full && 'btn-full', mobileFull && 'btn-mobile-full', className,
  ].filter(Boolean).join(' ');

  const content = (
    <>
      {busy ? <span className="spinner" aria-hidden="true" /> : icon ? <Icon name={icon} size={20} /> : null}
      <span>{busy ? 'Sending…' : children}</span>
      {iconRight && !busy ? <Icon name={iconRight} size={20} /> : null}
    </>
  );

  if (href) return <a href={href} className={cls} {...rest}>{content}</a>;
  return <button type={type ?? 'button'} className={cls} aria-busy={busy || undefined} {...rest}>{content}</button>;
}
