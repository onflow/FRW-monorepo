import React, { ComponentType, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import i18n from './i18n'; // Import screens i18n instance

import type { BaseScreenProps, TranslationFunction } from '../types';

/**
 * Configuration for platform-specific i18n integration
 */
export interface I18nPlatformConfig {
  /** Current language from platform */
  language?: string;
  /** Platform-specific translations that override screen defaults */
  platformTranslations?: Record<string, any>;
  /** Whether to use platform's translation function instead of screens' */
  useOwnTranslations?: boolean;
}

/**
 * Higher-order component that provides i18n functionality to screens
 * This allows each screen to have access to translations while maintaining
 * the ability for platforms to override with their own translation functions
 * 
 * Usage:
 * - Platform can provide its own translation function via props.t
 * - Platform can sync language settings via i18nConfig.language
 * - Platform can override specific translations via i18nConfig.platformTranslations
 */
export function withScreensI18n<P extends BaseScreenProps>(
  WrappedComponent: ComponentType<P>
): ComponentType<Omit<P, 't'> & { t?: TranslationFunction; i18nConfig?: I18nPlatformConfig }> {
  const WithI18nComponent = (props: Omit<P, 't'> & { t?: TranslationFunction; i18nConfig?: I18nPlatformConfig }) => {
    const { t: hookT } = useTranslation();
    const { i18nConfig } = props;
    
    // Sync language from platform if provided
    useEffect(() => {
      if (i18nConfig?.language && i18n.language !== i18nConfig.language) {
        i18n.changeLanguage(i18nConfig.language);
      }
    }, [i18nConfig?.language]);
    
    // Add platform translations if provided
    useEffect(() => {
      if (i18nConfig?.platformTranslations) {
        Object.entries(i18nConfig.platformTranslations).forEach(([lang, translations]) => {
          i18n.addResourceBundle(lang, 'translation', translations, true, true);
        });
      }
    }, [i18nConfig?.platformTranslations]);
    
    // Use platform-provided translation function if requested, otherwise use hook
    const translationFunction: TranslationFunction = 
      (i18nConfig?.useOwnTranslations && props.t) ? props.t : hookT;
    
    return (
      <WrappedComponent
        {...(props as P)}
        t={translationFunction}
      />
    );
  };

  WithI18nComponent.displayName = `withScreensI18n(${WrappedComponent.displayName || WrappedComponent.name})`;
  
  return WithI18nComponent;
}

/**
 * Hook to access the screens translation function
 * This can be used inside screen components for additional translation needs
 */
export function useScreensTranslation() {
  return useTranslation();
}

/**
 * Initialize screens i18n with platform configuration
 * Platforms should call this during their initialization to sync settings
 */
export function initializeScreensI18n(config: I18nPlatformConfig = {}) {
  if (config.language) {
    i18n.changeLanguage(config.language);
  }
  
  if (config.platformTranslations) {
    Object.entries(config.platformTranslations).forEach(([lang, translations]) => {
      i18n.addResourceBundle(lang, 'translation', translations, true, true);
    });
  }
}