import { useEffect, useState, useCallback } from 'react';

type ToastType = 'success' | 'error';

interface ToastState {
  message: string;
  type: ToastType;
  visible: boolean;
}

// Toast event system
type ToastListener = (message: string, type: ToastType) => void;
const listeners: Set<ToastListener> = new Set();

export function showToast(message: string, type: ToastType = 'success') {
  listeners.forEach(listener => listener(message, type));
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
      setToast(prev => ({ ...prev, visible: false }));
    }, 3000);
  }, []);

  useEffect(() => {
    listeners.add(handleToast);
    return () => {
      listeners.delete(handleToast);
    };
  }, [handleToast]);

  return (
    <div
      className={`fixed bottom-20 left-1/2 -translate-x-1/2 bg-slate-800 border border-white/10 px-4 py-2 rounded-full shadow-xl flex items-center gap-2 z-50 transition-all duration-300 ${
        toast.visible
          ? 'translate-y-0 opacity-100'
          : 'translate-y-full opacity-0'
      }`}
    >
      {toast.type === 'success' ? (
        <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 256 256">
          <path d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm45.66,85.66-56,56a8,8,0,0,1-11.32,0l-24-24a8,8,0,0,1,11.32-11.32L112,148.69l50.34-50.35a8,8,0,0,1,11.32,11.32Z"/>
        </svg>
      ) : (
        <svg className="w-4 h-4 text-red-400" fill="currentColor" viewBox="0 0 256 256">
          <path d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm-8,56a8,8,0,0,1,16,0v56a8,8,0,0,1-16,0Zm8,104a12,12,0,1,1,12-12A12,12,0,0,1,128,184Z"/>
        </svg>
      )}
      <span className="text-xs font-medium text-white">{toast.message}</span>
    </div>
  );
}
