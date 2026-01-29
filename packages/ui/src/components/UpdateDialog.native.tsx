import type React from 'react';

export interface WhatsNewAction {
  text: string;
  url?: string;
  type: 'external' | 'internal' | 'deeplink';
  style?: Record<string, unknown>;
}

export interface UpdateDialogProps {
  visible: boolean;
  title: string;
  children?: React.ReactNode;
  updateContent?: string;
  actions: WhatsNewAction[];
  buttonText: string;
  onButtonClick?: () => void;
  onClose: () => void;
}

/**
 * UpdateDialog is a web-only component that uses react-markdown and createPortal.
 * This stub is provided for React Native to prevent bundling errors.
 * If you need this functionality in React Native, implement a native version
 * using a React Native compatible markdown library.
 */
export const UpdateDialog: React.FC<UpdateDialogProps> = () => {
  return null;
};
