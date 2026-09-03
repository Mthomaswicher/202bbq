import { useToast } from '../context/ToastContext.jsx';
import Icon from './ui/Icon.jsx';

export default function ToastContainer() {
  const { toasts, removeToast, pause, resume } = useToast();
  return (
    <div className="toasts" role="status" aria-live="polite">
      {toasts.map(t => (
        <div
          key={t.id} className="toast"
          onMouseEnter={() => pause(t.id)} onMouseLeave={() => resume(t.id)}
          onFocus={() => pause(t.id)} onBlur={() => resume(t.id)}
        >
          <p>{t.message}</p>
          {t.action && (
            <button type="button" className="btn btn-tertiary btn-compact" onClick={() => { t.action.onClick(); removeToast(t.id); }}>
              {t.action.label}
            </button>
          )}
          <button type="button" className="btn btn-icon btn-tertiary" aria-label="Dismiss" onClick={() => removeToast(t.id)}>
            <Icon name="x" size={20} />
          </button>
        </div>
      ))}
    </div>
  );
}
