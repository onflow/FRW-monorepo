// Basic Tamagui configuration for cross-platform UI package
import { createTamagui } from 'tamagui';

// Simple configuration without external dependencies
const config = createTamagui({
  tokens: {
    size: {
      0: 0,
      1: 4,
      2: 8,
      3: 12,
      4: 16,
      5: 20,
      6: 24,
    },
    space: {
      0: 0,
      1: 4,
      2: 8,
      3: 12,
      4: 16,
      5: 20,
      6: 24,
    },
    color: {
      background: '#ffffff',
      gray5: '#f0f0f0',
      gray10: '#666666',
      gray11: '#999999',
      red10: '#ff6b6b',
      green10: '#4caf50',
    },
  },
  themes: {
    light: {
      background: '#ffffff',
      color: '#000000',
    },
    dark: {
      background: '#000000',
      color: '#ffffff',
    },
  },
});

export { config };
export default config;
