import { useId } from 'react';
import Icon from './Icon.jsx';

function ErrorLine({ id, children }) {
  return (
    <p className="field-error" id={id}>
      <Icon name="alert" size={20} />
      <span>{children}</span>
    </p>
  );
}

/**
 * A labelled text input with a permanent hint, an inline error and the right
 * autocomplete/inputmode. `error` is the message to show (or falsy).
 */
export function TextField({
  label, optional, hint, error, value, onChange, onBlur, type = 'text',
  autoComplete, inputMode, name, maxLength, id: givenId, inputRef, className = '', ...rest
}) {
  const uid = useId();
  const id = givenId ?? `f-${uid}`;
  const hintId = hint ? `${id}-hint` : null;
  const errId = error ? `${id}-error` : null;
  const describedBy = [hintId, errId].filter(Boolean).join(' ') || undefined;
  return (
    <div className={`field${error ? ' has-error' : ''} ${className}`.trim()}>
      <label htmlFor={id}>{label}{optional && <span className="optional"> (optional)</span>}</label>
      {hint && <p className="hint" id={hintId}>{hint}</p>}
      <input
        id={id} name={name ?? id} type={type} className="input"
        value={value} onChange={e => onChange(e.target.value)} onBlur={onBlur}
        autoComplete={autoComplete} inputMode={inputMode} maxLength={maxLength}
        aria-invalid={error ? 'true' : undefined} aria-describedby={describedBy}
        aria-required={!optional || undefined}
        ref={inputRef}
        {...rest}
      />
      {error && <ErrorLine id={errId}>{error}</ErrorLine>}
    </div>
  );
}

export function TextArea({
  label, optional, hint, error, value, onChange, onBlur, name, maxLength = 500, rows = 4, id: givenId, inputRef, ...rest
}) {
  const uid = useId();
  const id = givenId ?? `f-${uid}`;
  const hintId = hint ? `${id}-hint` : null;
  const errId = error ? `${id}-error` : null;
  const counterId = `${id}-count`;
  const describedBy = [hintId, errId, counterId].filter(Boolean).join(' ') || undefined;
  return (
    <div className={`field${error ? ' has-error' : ''}`}>
      <label htmlFor={id}>{label}{optional && <span className="optional"> (optional)</span>}</label>
      {hint && <p className="hint" id={hintId}>{hint}</p>}
      <textarea
        id={id} name={name ?? id} className="textarea" rows={rows}
        value={value} onChange={e => onChange(e.target.value.slice(0, maxLength))} onBlur={onBlur}
        maxLength={maxLength} aria-invalid={error ? 'true' : undefined} aria-describedby={describedBy}
        ref={inputRef}
        {...rest}
      />
      <p className="counter" id={counterId} aria-live="polite">{value.length} of {maxLength}</p>
      {error && <ErrorLine id={errId}>{error}</ErrorLine>}
    </div>
  );
}

/**
 * A fieldset of radio cards. `options`: [{ value, title, sub }]. Inputs are
 * real radios (sr-only), so arrow keys and screen readers work natively.
 */
export function RadioCardGroup({ legend, hint, error, name, value, onChange, options, cols, chips, id: givenId, groupRef }) {
  const uid = useId();
  const id = givenId ?? `g-${uid}`;
  const hintId = hint ? `${id}-hint` : null;
  const errId = error ? `${id}-error` : null;
  const describedBy = [hintId, errId].filter(Boolean).join(' ') || undefined;
  return (
    <fieldset className={`radio-group${error ? ' has-error' : ''}`} id={id} aria-describedby={describedBy} ref={groupRef} tabIndex={-1}>
      <legend>{legend}</legend>
      {hint && <p className="hint" id={hintId}>{hint}</p>}
      {error && <ErrorLine id={errId}>{error}</ErrorLine>}
      <div className={chips ? 'radio-chips' : `radio-cards${cols ? ` cols-${cols}` : ''}`}>
        {options.map(o => (
          <label key={o.value} className={chips ? 'radio-chip' : 'radio-card'}>
            <input
              type="radio" className="sr-only" name={name ?? id} value={o.value}
              checked={value === o.value} onChange={() => onChange(o.value)}
            />
            {!chips && <span className="rc-mark" aria-hidden="true"><Icon name="check" size={16} /></span>}
            {chips ? <span>{o.title}</span> : (
              <span className="rc-text">
                <span className="rc-title">{o.title}</span>
                {o.sub && <span className="rc-sub">{o.sub}</span>}
              </span>
            )}
          </label>
        ))}
      </div>
    </fieldset>
  );
}

/**
 * Focusable error summary. `errors`: [{ id, message }] where id is the
 * field/fieldset id to jump to. Focus it on failed submit.
 */
export function ErrorSummary({ errors, summaryRef }) {
  if (!errors?.length) return null;
  const n = errors.length;
  return (
    <div className="error-summary" role="alert" tabIndex={-1} ref={summaryRef}>
      <h3>There's a problem — {n === 1 ? '1 thing' : `${n} things`} to fix</h3>
      <ul>
        {errors.map(e => (
          <li key={e.id}>
            <a href={`#${e.id}`} onClick={ev => { ev.preventDefault(); focusField(e.id); }}>{e.message}</a>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function focusField(id) {
  const el = document.getElementById(id);
  if (!el) return;
  const target = el.matches('input, select, textarea') ? el : (el.querySelector('input, select, textarea') ?? el);
  target.focus({ preventScroll: false });
  el.scrollIntoView({ block: 'center', behavior: 'smooth' });
}

export function Notice({ kind = 'info', icon, children, ...rest }) {
  const icons = { error: 'alert', success: 'check', warn: 'alert', info: 'alert' };
  return (
    <div className={`notice notice-${kind}`} {...rest}>
      <Icon name={icon ?? icons[kind]} />
      <div>{children}</div>
    </div>
  );
}
