import React, { ReactNode } from 'react';

/**
 * Utility function to translate text with React component placeholders
 * @param key - The i18n message key
 * @param renderComponent - Function to render a component for a given placeholder key and content
 * @returns ReactNode with translated text and rendered components
 */
export const translateToComponents = (
  key: string,
  renderComponent: (placeholderKey: string, content: string) => ReactNode
): ReactNode => {
  const message = chrome.i18n.getMessage(key);

  if (!message) {
    console.warn(`Translation key not found: ${key}`);
    return key;
  }

  // Split the message by placeholder patterns like {{TERMS_LINK}} or {{PRIVACY_LINK}}
  const parts = message.split(/(\{\{[^}]+\}\})/);

  return parts.map((part, index) => {
    const placeholderMatch = part.match(/^\{\{([^}]+)\}\}$/);

    if (placeholderMatch) {
      const placeholderKey = placeholderMatch[1];
      return renderComponent(placeholderKey, part);
    }

    return part;
  });
};

/**
 * Helper function to create a link component with consistent styling
 */
export const createLinkComponent = (href: string, children: string, color: string = '#00EF8B') => (
  <a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    style={{
      color,
      textDecoration: 'none',
    }}
  >
    {children}
  </a>
);
