import { forwardRef } from 'react';
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
const Button = forwardRef(function Button({
  variant = 'primary', size, full, mobileFull, icon, iconRight, busy, href, className = '', children, type, ...rest
}, ref) {
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

  if (href) return <a href={href} className={cls} ref={ref} {...rest}>{content}</a>;
  return <button type={type ?? 'button'} className={cls} aria-busy={busy || undefined} ref={ref} {...rest}>{content}</button>;
});
export default Button;
