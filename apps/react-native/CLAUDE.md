# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a React Native application called "FRW-RN" (Flow React Native) that integrates with the Flow blockchain. The app uses React Navigation for navigation and supports both light and dark themes with a custom design system.

## Key Technologies

- **React Native 0.80.1** with React 19.1.0
- **React Navigation v7** with native stack navigation
- **NativeWind 4.x** for styling (Tailwind CSS for React Native)
- **React Native Reusables UI** components with custom theme system
- **Nitro Modules** for native bridge functionality
- **TypeScript** for type safety

## Development Commands

**IMPORTANT: This project uses pnpm, not npm!**

```bash
# Start Metro bundler
pnpm start

# Run on iOS (development scheme)
pnpm run ios

# Run on iOS (production scheme)
pnpm run ios:prod

# Run on Android
pnpm run android

# Lint code
pnpm run lint

# Run tests
pnpm run test

# Install dependencies
pnpm install

# Install iOS dependencies (required after native dep updates)
bundle install
bundle exec pod install
```

## Architecture

### Navigation Structure

- **AppNavigator** (`src/navigation/AppNavigator.tsx`) - Main navigation container using React Navigation v7
- **Stack Navigation** with three main screens: Home, Profile, Settings
- **Embedded mode support** for iOS integration (headers can be hidden)
- **Theme integration** with React Navigation's theme provider

### Theme System

- **CSS Variables** defined in `src/global.css` for light/dark mode
- **Custom Tailwind config** (`tailwind.config.js`) maps CSS variables to Tailwind classes
- **ThemeContext** (`src/contexts/ThemeContext.tsx`) manages global theme state
- **ThemeToggle** component provides theme switching functionality
- **React Navigation themes** synchronized with app theme for consistent navigation styling

### UI Components

- **React Native Reusables** based components in `src/components/ui/`
- **Custom color system** with `forend` (foreground), `background`, and system colors
- **Responsive design** with proper light/dark mode support
- **Type-safe** component props with TypeScript

### File Structure

- `src/screens/` - Screen components organized by feature
- `src/components/ui/` - Reusable UI components
- `src/contexts/` - React contexts for global state
- `src/lib/` - Utility functions and helpers
- `src/navigation/` - Navigation configuration
- `src/bridge/` - Nitro modules for native functionality

### Module Resolution

- **Babel aliases**:
  - `@` points to `src/`
  - `ui` points to `src/components/ui`
  - `icons` points to `src/assets/icons`
- **Metro aliases**:
  - `@` resolves to `src/`
  - `ui` resolves to `src/components/ui`
  - `icons` resolves to `src/assets/icons`
- **Import examples**:
  - `import { Button } from 'ui'`
  - `import BackArrow from 'icons/BackArrow'`
  - `import { IconView } from '@/components/ui/media/IconView'`

### Native Integration

- **Nitro modules** configured for iOS/Android native bridge
- **iOS CocoaPods** integration for native dependencies
- **Android text fix** utility for preventing text cutoff issues
- **Embedded mode** support for integration with existing iOS apps

### Theme Development

- Use CSS variables in `src/global.css` for consistent theming
- Apply `text-forend-primary`, `bg-background-base`, etc. classes
- Theme toggle automatically switches between light/dark modes
- React Navigation theme colors synchronized with app theme

## Code Style Guidelines

### Comments and Documentation

- **ALL comments MUST be written in English** - No Chinese, Japanese, or other non-English comments
- Use clear, concise English for all code comments, function descriptions, and documentation
- Prefer descriptive variable/function names over extensive comments
- Examples:

  ```typescript
  // ✅ Good - English comment
  // Load account data when accounts change
  const loadAccountData = async () => { ... }

  // ❌ Bad - Non-English comment
  // 当账户变化时加载账户数据
  const loadAccountData = async () => { ... }
  ```

## Important Notes

- **iOS Development**: Use development scheme (`npm run ios`) for development, production scheme (`npm run ios:prod`) for production builds
- **Theme Classes**: Use semantic color classes like `text-forend-primary` instead of hardcoded colors
- **Navigation**: All screens have access to theme context and navigation props
- **Native Dependencies**: Run `bundle exec pod install` after updating native dependencies
- **Embedded Mode**: App supports being embedded in iOS with conditional header display
