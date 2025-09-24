export interface ToastMessage {
  id?: string;
  message: string;
  type?: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
}

export interface ToastManager {
  showToast(toast: ToastMessage): void;
  hideToast(id: string): void;
  clearAllToasts(): void;
}

export type ToastCallback = (toast: ToastMessage) => void;
