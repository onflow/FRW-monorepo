import React from 'react';

// Type declaration for chrome extension API
declare global {
  interface Window {
    chrome?: {
      i18n?: {
        getMessage: (key: string) => string;
      };
    };
  }

  const chrome:
    | {
        i18n?: {
          getMessage: (key: string) => string;
        };
      }
    | undefined;
}

// Platform-agnostic translation hook that works across all platforms
export const usePlatformTranslation = () => {
  const translate = React.useCallback((key: string, fallback: string): string => {
    // Try Chrome i18n first (for extension)
    if (typeof chrome !== 'undefined' && chrome?.i18n) {
      const message = chrome.i18n.getMessage(key);
      if (message) return message;
    }

    // Try window.chrome.i18n (for extension in some contexts)
    if (typeof window !== 'undefined' && window.chrome?.i18n) {
      const message = window.chrome.i18n.getMessage(key);
      if (message) return message;
    }

    // Try to use screens i18n if available (for React Native and shared components)
    try {
      // Dynamic import to avoid bundling issues
      const screensI18n = (window as any).__screensI18n;
      if (screensI18n?.t) {
        const message = screensI18n.t(key);
        if (message && message !== key) return message;
      }
    } catch (error) {
      // Silently fail if screens i18n is not available
    }

    // Fallback to the provided fallback text
    return fallback;
  }, []);

  return { t: translate };
};

// Alternative hook for components that need more control over translation sources
export const useFlexibleTranslation = (options?: {
  preferChrome?: boolean;
  preferScreens?: boolean;
  fallbackLanguage?: string;
}) => {
  const translate = React.useCallback(
    (key: string, fallback: string): string => {
      const { preferChrome = true, preferScreens = false } = options || {};

      // Determine translation priority based on options
      const translationSources = preferScreens
        ? ['screens', 'chrome', 'fallback']
        : ['chrome', 'screens', 'fallback'];

      for (const source of translationSources) {
        switch (source) {
          case 'chrome':
            // Try Chrome i18n
            if (typeof chrome !== 'undefined' && chrome?.i18n) {
              const message = chrome.i18n.getMessage(key);
              if (message) return message;
            }
            if (typeof window !== 'undefined' && window.chrome?.i18n) {
              const message = window.chrome.i18n.getMessage(key);
              if (message) return message;
            }
            break;

          case 'screens':
            // Try screens i18n
            try {
              const screensI18n = (window as any).__screensI18n;
              if (screensI18n?.t) {
                const message = screensI18n.t(key);
                if (message && message !== key) return message;
              }
            } catch (error) {
              // Silently fail if screens i18n is not available
            }
            break;

          case 'fallback':
            return fallback;
        }
      }

      return fallback;
    },
    [options]
  );

  return { t: translate };
};
