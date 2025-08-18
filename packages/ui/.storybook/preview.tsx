import type { Preview } from '@storybook/react-vite';
import { TamaguiProvider, Theme } from '@tamagui/core';
import React from 'react';
import { INITIAL_VIEWPORTS } from 'storybook/viewport';
import { View } from 'tamagui';

// Select specific viewports from INITIAL_VIEWPORTS
const { iphone14pro, iphone14promax, pixel, pixelxl } = INITIAL_VIEWPORTS;

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
        { name: 'dark', value: '#000000' },
      ],
    },
    options: {
      storySort: {
        order: ['Design System', 'Foundation', 'Components'],
      },
    },
    viewport: {
      options: {
        iphone14pro,
        iphone14promax,
        pixel,
        pixelxl,
        // Custom Extension viewport
        extension: {
          name: 'Extension Window',
          styles: {
            width: '400px',
            height: '600px',
          },
          type: 'desktop',
        },

        desktop: {
          name: 'Desktop',
          styles: {
            width: '100%',
            height: '100%',
          },
          type: 'desktop',
        },
      },
    },
  },
  initialGlobals: {
    theme: 'dark',
    viewport: { value: 'extension', isRotated: false },
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
          <Theme name={theme}>
            <View bg="$bg" display="flex" items="center" justify="center">
              <Story />
            </View>
          </Theme>
        </TamaguiProvider>
      );
    },
  ],
};

export default preview;
