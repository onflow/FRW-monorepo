import { Toast, type ToastProps } from '@onflow/frw-ui';
import React, { createContext, useContext, useState, useCallback, type ReactNode } from 'react';

// Import Toast component from UI package

export interface ToastContextValue {
  showToast: (message: string, type?: ToastProps['type'], duration?: number) => void;
  hideToast: (id: string) => void;
  clearAllToasts: () => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export interface ToastState {
  id: string;
  message: string;
  type: ToastProps['type'];
  duration: number;
  visible: boolean;
}

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastState[]>([]);

  const showToast = useCallback(
    (message: string, type: ToastProps['type'] = 'info', duration = 4000) => {
      const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      const newToast: ToastState = {
        id,
        message,
        type,
        duration,
        visible: true,
      };

      setToasts((prev) => [...prev, newToast]);

      // Auto-hide after duration
      if (duration > 0) {
        setTimeout(() => {
          hideToast(id);
        }, duration);
      }
    },
    []
  );

  const hideToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const clearAllToasts = useCallback(() => {
    setToasts([]);
  }, []);

  // Set up bridge callback if available
  React.useEffect(() => {
    // Access bridge through global or window object to avoid direct import
    const globalBridge = (globalThis as any).__FLOW_WALLET_BRIDGE__;
    if (globalBridge?.setToastCallback) {
      globalBridge.setToastCallback((toast: any) => {
        showToast(toast.message, toast.type, toast.duration);
      });
    }
  }, [showToast]);

  const contextValue: ToastContextValue = {
    showToast,
    hideToast,
    clearAllToasts,
  };

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      {/* Render all toasts */}
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          visible={toast.visible}
          message={toast.message}
          type={toast.type}
          duration={toast.duration}
          onClose={() => hideToast(toast.id)}
        />
      ))}
    </ToastContext.Provider>
  );
};

export const useToast = (): ToastContextValue => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

// Convenience hook that also provides bridge access
export const usePlatformToast = () => {
  const toast = useToast();

  const showPlatformToast = useCallback(
    (message: string, type?: ToastProps['type'], duration?: number) => {
      // Try platform first, fallback to local toast
      const globalBridge = (globalThis as any).__FLOW_WALLET_BRIDGE__;
      if (globalBridge?.showToast) {
        globalBridge.showToast(message, type, duration);
      } else {
        toast.showToast(message, type, duration);
      }
    },
    [toast]
  );

  return {
    ...toast,
    showToast: showPlatformToast,
  };
};
