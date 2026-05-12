import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { AlertCircle, BadgeCheck, Info, X } from 'lucide-react';

type ToastVariant = 'success' | 'error' | 'info';

type ToastInput = {
  title: string;
  description?: string;
  variant?: ToastVariant;
};

type Toast = ToastInput & {
  id: string;
};

type ToastContextValue = {
  pushToast: (toast: ToastInput) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);
let externalPushToast: ((toast: ToastInput) => void) | null = null;

function createToastId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismissToast = useCallback((id: string) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const pushToast = useCallback(
    (toast: ToastInput) => {
      const id = createToastId();
      setToasts((current) => [...current, { id, variant: 'info', ...toast }]);
      window.setTimeout(() => dismissToast(id), 3500);
    },
    [dismissToast],
  );

  externalPushToast = pushToast;

  const value = useMemo(() => ({ pushToast }), [pushToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastViewportInner toasts={toasts} dismissToast={dismissToast} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    return {
      pushToast: (toast: ToastInput) => {
        externalPushToast?.(toast);
      },
    };
  }
  return context;
}

function variantStyles(variant: ToastVariant) {
  switch (variant) {
    case 'success':
      return {
        icon: <BadgeCheck size={18} />,
        className: 'toast toast--success',
      };
    case 'error':
      return {
        icon: <AlertCircle size={18} />,
        className: 'toast toast--error',
      };
    default:
      return {
        icon: <Info size={18} />,
        className: 'toast toast--info',
      };
  }
}

function ToastViewportInner({
  toasts,
  dismissToast,
}: {
  toasts: Toast[];
  dismissToast: (id: string) => void;
}) {
  return (
    <div className="toast-viewport" aria-live="polite" aria-atomic="true">
      {toasts.map((toast) => {
        const styles = variantStyles(toast.variant ?? 'info');
        return (
          <div key={toast.id} className={styles.className}>
            <div className="toast__icon">{styles.icon}</div>
            <div className="toast__content">
              <strong>{toast.title}</strong>
              {toast.description ? <p>{toast.description}</p> : null}
            </div>
            <button
              type="button"
              className="toast__close"
              onClick={() => dismissToast(toast.id)}
              aria-label="Dismiss notification"
            >
              <X size={16} />
            </button>
          </div>
        );
      })}
    </div>
  );
}

export function ToastViewport() {
  return null;
}
