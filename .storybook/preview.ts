import type { Preview } from '@storybook/react-webpack5';

import '../src/ui/style/fonts.css';

// Add this mock
if (typeof global.chrome === 'undefined' || typeof global.chrome.i18n === 'undefined') {
  global.chrome = {
    i18n: {
      getMessage: (messageName: string, substitutions?: unknown) => {
        if (substitutions) {
          if (Array.isArray(substitutions)) {
            // Simple substitution for array format
            return messageName + ': ' + substitutions.join(', ');
          }
          // For object substitutions, you might want a more complex replacement logic
          return messageName + ': ' + JSON.stringify(substitutions);
        }
        return messageName;
      },
    },
  } as unknown as typeof chrome; // Use 'as any' to simplify mocking complex global objects
}

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
};

export default preview;
