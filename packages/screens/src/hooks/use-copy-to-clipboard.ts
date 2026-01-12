import { bridge, logger, toast } from '@onflow/frw-context';
import { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';

interface UseCopyToClipboardOptions {
  /** Duration in ms to show copied state (default: 2000) */
  resetDelay?: number;
  /** Custom success message key for translation */
  successMessageKey?: string;
  /** Custom error message key for translation */
  errorMessageKey?: string;
}

interface UseCopyToClipboardReturn {
  /** Whether the text was recently copied */
  copied: boolean;
  /** Function to copy text to clipboard */
  copy: (text: string) => Promise<boolean>;
}

/**
 * Cross-platform hook for copying text to clipboard
 * Handles React Native and Web environments, with toast notifications
 */
export function useCopyToClipboard(
  options: UseCopyToClipboardOptions = {}
): UseCopyToClipboardReturn {
  const {
    resetDelay = 2000,
    successMessageKey = 'messages.copied',
    errorMessageKey = 'messages.failedToCopy',
  } = options;

  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);

  const copy = useCallback(
    async (text: string): Promise<boolean> => {
      try {
        const platform = bridge.getPlatform();

        // Use RN clipboard via global injected helper when not web/extension
        const rnClipboard = (globalThis as any).clipboard;
        if (platform !== 'extension' && rnClipboard?.setString) {
          rnClipboard.setString(text);
          logger.debug('Text copied using RN Clipboard');
        } else if (navigator.clipboard) {
          await navigator.clipboard.writeText(text);
          logger.debug('Text copied using Web Clipboard API');
        } else {
          throw new Error('No clipboard API available');
        }

        setCopied(true);
        setTimeout(() => setCopied(false), resetDelay);

        // Show success toast
        toast.show({
          title: t(successMessageKey),
          type: 'success',
        });

        return true;
      } catch (error) {
        logger.error('Failed to copy to clipboard:', error);
        toast.show({
          title: t(errorMessageKey),
          type: 'error',
        });
        return false;
      }
    },
    [resetDelay, successMessageKey, errorMessageKey, t]
  );

  return { copied, copy };
}
