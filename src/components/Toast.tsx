import { useEffect, useState, useCallback } from 'react';

type ToastType = 'success' | 'error';

interface ToastState {
  message: string;
  type: ToastType;
  visible: boolean;
}

type ToastListener = (message: string, type: ToastType) => void;
const listeners: Set<ToastListener> = new Set();

export function showToast(message: string, type: ToastType = 'success') {
  listeners.forEach((listener) => listener(message, type));
}

export function Toast() {
  const [toast, setToast] = useState<ToastState>({
    message: '',
    type: 'success',
    visible: false
  });

  const handleToast = useCallback((message: string, type: ToastType) => {
    setToast({ message, type, visible: true });
    setTimeout(() => {
      setToast((prev) => ({ ...prev, visible: false }));
    }, 3000);
  }, []);

  useEffect(() => {
    listeners.add(handleToast);
    return () => {
      listeners.delete(handleToast);
    };
  }, [handleToast]);

  return (
    <div className={`vp-toast ${toast.visible ? 'is-visible' : ''}`} role="status" aria-live="polite">
      <span className={`vp-toast__dot ${toast.type === 'success' ? 'is-success' : 'is-error'}`} />
      <span className="vp-toast__text">{toast.message}</span>
    </div>
  );
}