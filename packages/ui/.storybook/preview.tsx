import type { Preview } from '@storybook/react-vite';
import { TamaguiProvider } from '@tamagui/core';
import React from 'react';

import config from '../src/tamagui.config';

// Global polyfills for Tamagui
if (typeof global === 'undefined') {
  (window as unknown).global = globalThis;
}

if (typeof process === 'undefined') {
  (window as unknown).process = { env: {} };
}

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    backgrounds: {
      default: 'light',
      values: [
        { name: 'light', value: '#ffffff' },
        { name: 'dark', value: '#1a1a1a' },
      ],
    },
  },
  globalTypes: {
    theme: {
      name: 'Theme',
      description: 'Tamagui theme for components',
      defaultValue: 'light',
      toolbar: {
        icon: 'circlehollow',
        items: [
          { value: 'light', icon: 'circlehollow', title: 'Light theme' },
          { value: 'dark', icon: 'circle', title: 'Dark theme' },
        ],
        showName: true,
        dynamicTitle: true,
      },
    },
  },
  decorators: [
    (Story, context): React.ReactElement => {
      const theme = context.globals.theme || 'light';

      return (
        <TamaguiProvider config={config} defaultTheme={theme}>
          <div
            style={{
              margin: '1rem',
              minHeight: '200px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: 'system-ui, sans-serif',
              backgroundColor: theme === 'dark' ? '#1a1a1a' : '#ffffff',
              color: theme === 'dark' ? '#fcfcfc' : '#202020',
              padding: '2rem',
              borderRadius: '8px',
              transition: 'all 0.3s ease',
            }}
          >
            <Story />
          </div>
        </TamaguiProvider>
      );
    },
  ],
};

export default preview;
