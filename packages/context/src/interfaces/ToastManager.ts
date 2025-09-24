export interface ToastMessage {
  id?: string;
  message: string;
  type?: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
}

export interface ToastManager {
  show(toast: ToastMessage): void;
  hide(id: string): void;
  clear(): void;
}

export type ToastCallback = (toast: ToastMessage) => void;
