import { useState, useCallback } from 'react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastItem {
  id: string;
  message: string;
  type: ToastType;
  timeout?: number;
}

export function useToast() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const addToast = useCallback(
    (message: string, options?: { type?: ToastType; timeout?: number }) => {
      const id = Date.now().toString();
      const type = options?.type ?? 'info';
      const timeout = options?.timeout ?? 3500;

      const newToast: ToastItem = { id, message, type, timeout };
      setToasts((prev) => [...prev, newToast]);

      // Auto-remove after timeout
      if (timeout > 0) {
        setTimeout(() => {
          setToasts((prev) => prev.filter((t) => t.id !== id));
        }, timeout);
      }

      return id;
    },
    []
  );

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const clearToasts = useCallback(() => {
    setToasts([]);
  }, []);

  return { toasts, addToast, removeToast, clearToasts };
}
