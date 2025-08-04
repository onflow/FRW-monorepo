/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all of your component files.
  darkMode: 'class',
  content: ['./src/**/*.{js,jsx,ts,tsx}', './index.js'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        // Primary colors
        primary: {
          DEFAULT: 'rgb(var(--primary))',
          20: 'rgb(var(--primary-20) / 0.2)',
          10: 'rgb(var(--primary-10) / 0.1)',
        },

        // Surface colors (full names)
        surface: {
          base: 'rgb(var(--surface-base))',
          1: 'rgb(var(--surface-1))',
          2: 'rgb(var(--surface-2))',
          3: 'rgb(var(--surface-3))',
        },

        // Surface shortcut
        sf: {
          DEFAULT: 'rgb(var(--surface-base))',
          1: 'rgb(var(--surface-1))',
          2: 'rgb(var(--surface-2) / 0.5)',
          3: 'rgb(var(--surface-3) / 0.25)',
        },

        // Foreground/text colors
        fg: {
          1: 'rgb(var(--fg-1))',
          2: 'rgb(var(--fg-2))',
          3: 'rgb(var(--fg-3))',
        },

        // Dark accent colors
        dark: {
          1: 'rgb(var(--dark-1) / 0.8)',
          2: 'rgb(var(--dark-2) / 0.4)',
          3: 'rgb(var(--dark-3) / 0.25)',
          4: 'rgb(var(--dark-4) / 0.1)',
        },

        // Light accent colors
        light: {
          1: 'rgb(var(--light-1) / 0.8)',
          2: 'rgb(var(--light-2) / 0.4)',
          3: 'rgb(var(--light-3) / 0.25)',
          4: 'rgb(var(--light-4) / 0.1)',
          5: 'rgb(var(--light-5) / 0.05)',
        },

        // System colors
        success: {
          DEFAULT: 'rgb(var(--success))',
          15: 'rgb(var(--success) / 0.15)',
        },
        warning: {
          DEFAULT: 'rgb(var(--warning))',
          15: 'rgb(var(--warning) / 0.15)',
        },
        error: {
          DEFAULT: 'rgb(var(--error))',
          15: 'rgb(var(--error) / 0.15)',
        },

        // Overlay colors for translucent containers
        overlay: {
          DEFAULT: 'rgb(var(--overlay))',
        },

        // Accent colors
        accent: {
          evm: 'rgb(var(--accent-evm))',
        },

        // Segment colors
        segment: {
          border: {
            DEFAULT: 'rgb(var(--segment-border) / 0.1)',
            dark: 'rgb(var(--segment-border))',
          },
        },

        // Input background colors
        input: {
          bg: {
            DEFAULT: 'rgb(var(--input-bg))', // light mode: #F2F2F7
            dark: 'rgb(var(--input-bg) / 0.1)', // dark mode: rgba(255,255,255,0.1)
          },
        },

        // Contact avatar background (auto-switches opacity based on theme)
        contact: {
          bg: {
            DEFAULT: 'rgb(var(--contact-bg) / 0.8)', // 80% opacity for light mode
            dark: 'rgb(var(--contact-bg) / 0.25)', // 25% opacity for dark mode
          },
        },
      },
    },
  },
  plugins: [],
};
