import { Toast, type ToastProps } from '@onflow/frw-ui';
import React, { createContext, useCallback, useContext, useState, type ReactNode } from 'react';

import type { ToastMessage } from './interfaces/ToastManager';

// Import Toast component from UI package

export interface ToastContextValue {
  show: (toast: ToastMessage) => void;
  hide: (id: string) => void;
  clear: () => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export interface ToastState {
  id: string;
  title: string;
  message: string;
  type: ToastProps['type'];
  duration: number;
  visible: boolean;
}

export const ToastProvider: React.FC<{
  children: ReactNode;
  feedbackCallback?: (toast: ToastState) => void;
}> = ({ children, feedbackCallback }) => {
  const [toasts, setToasts] = useState<ToastState[]>([]);

  const show = useCallback((toast: ToastMessage) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const newToast: ToastState = {
      id,
      title: toast.title,
      message: toast.message || '',
      type: toast.type || 'info',
      duration: toast.duration || 4000,
      visible: true,
    };

    setToasts((prev) => [...prev, newToast]);

    // Auto-hide after duration
    if (newToast.duration > 0) {
      setTimeout(() => {
        hide(id);
      }, newToast.duration);
    }
  }, []);

  const hide = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const clear = useCallback(() => {
    setToasts([]);
  }, []);

  // Set up bridge callback if available
  React.useEffect(() => {
    // Access bridge through global or window object to avoid direct import
    const globalBridge = (globalThis as any).__FLOW_WALLET_BRIDGE__;
    if (globalBridge?.setToastCallback) {
      globalBridge.setToastCallback((toast: ToastMessage) => {
        show(toast);
      });
    }
  }, [show]);

  const contextValue: ToastContextValue = {
    show,
    hide,
    clear,
  };

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      {/* Render all toasts */}
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          title={toast.title}
          visible={toast.visible}
          message={toast.message}
          type={toast.type}
          duration={toast.duration}
          onClose={() => hide(toast.id)}
          feedbackCallback={feedbackCallback}
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
    (toastMessage: ToastMessage) => {
      // Try platform first, fallback to local toast
      const globalBridge = (globalThis as any).__FLOW_WALLET_BRIDGE__;
      if (globalBridge?.showToast) {
        globalBridge.showToast(
          toastMessage.title,
          toastMessage.message,
          toastMessage.type,
          toastMessage.duration
        );
      } else {
        toast.show(toastMessage);
      }
    },
    [toast]
  );

  return {
    ...toast,
    show: showPlatformToast,
  };
};
