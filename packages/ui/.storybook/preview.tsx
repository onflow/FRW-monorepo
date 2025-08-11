import type { Preview } from '@storybook/react-vite';
import { TamaguiProvider, Theme } from '@tamagui/core';
import React from 'react';
import { View } from 'tamagui';

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
            <View
              bg="$bg"
              m="$4"
              minH={200}
              display="flex"
              items="center"
              justify="center"
              // fontFamily="system-ui, sans-serif"
              p="$6"
              rounded="$4"
            >
              <Story />
            </View>
          </Theme>
        </TamaguiProvider>
      );
    },
  ],
};

export default preview;
