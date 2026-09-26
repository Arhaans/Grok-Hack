import React from 'react';
import { useShop } from '../context/ShopContext';
import { CheckCircle, X } from 'lucide-react';

export const ToastContainer = () => {
  const { toasts, removeToast } = useShop();

  if (!toasts.length) return null;

  return (
    <div className="toast-container" role="region" aria-label="Notifications">
      {toasts.map((toast) => (
        <div key={toast.id} className="toast">
          <CheckCircle size={18} style={{ color: 'var(--color-sage)' }} />
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 6, fontSize: '0.85rem' }}>{toast.title}</div>
            <div style={{ fontSize: '0.8rem', opacity: 0.9 }}>{toast.message}</div>
          </div>
          <button
            onClick={() => removeToast(toast.id)}
            style={{ color: 'var(--color-white)', opacity: 0.6, cursor: 'pointer' }}
            aria-label="Close notification"
          >
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
};
