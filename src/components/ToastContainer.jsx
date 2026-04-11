import { useState } from 'react';
import { useToast } from '../context/ToastContext.jsx';

function Toast({ toast, onRemove }) {
  const [leaving, setLeaving] = useState(false);

  const handleRemove = () => {
    setLeaving(true);
    setTimeout(() => onRemove(toast.id), 280);
  };

  const icons = { success: '✔', error: '✘', info: 'ℹ' };

  return (
    <div
      className={`toast ${toast.type}${leaving ? ' leaving' : ''}`}
      role="status"
      onClick={handleRemove}
      style={{ cursor: 'pointer' }}
    >
      <span className="toast-icon">{icons[toast.type] || 'ℹ'}</span>
      <span>{toast.message}</span>
    </div>
  );
}

export default function ToastContainer() {
  const { toasts, removeToast } = useToast();

  return (
    <div className="toasts" aria-live="polite" aria-atomic="false" aria-label="Notifications">
      {toasts.map(t => (
        <Toast key={t.id} toast={t} onRemove={removeToast} />
      ))}
    </div>
  );
}
