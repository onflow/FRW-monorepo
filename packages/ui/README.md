# @onflow/frw-ui

Flow Reference Wallet UI components package with integrated Flow brand theme
system.

## Features

- **Universal Components**: Works across Web, React Native, and Browser
  Extensions
- **Flow Brand Integration**: Includes official Flow wallet colors and design
  tokens
- **Dual Theme System**: Supports both Tamagui and Tailwind CSS styling
- **Dark Mode**: Built-in light/dark mode support with Flow brand colors
- **TypeScript**: Full type safety with TypeScript

## Installation

```bash
pnpm add @onflow/frw-ui
```

## Quick Start

### Tamagui Configuration

```tsx
import { TamaguiProvider } from 'tamagui';
import { tamaguiConfig, lightTheme, darkTheme } from '@onflow/frw-ui';

function App() {
  return (
    <TamaguiProvider config={tamaguiConfig} defaultTheme="light">
      {/* Your app components */}
    </TamaguiProvider>
  );
}
```

### Using Components

```tsx
import { Button, Text, YStack, TokenCard } from '@onflow/frw-ui';

function MyComponent() {
  return (
    <YStack space="$4" padding="$4">
      <Text variant="heading">Welcome to Flow Wallet</Text>
      <Button variant="primary">Connect Wallet</Button>
    </YStack>
  );
}
```

## Flow Brand Theme System

### Flow Brand Colors

The package includes Flow wallet's official brand colors:

- **Primary Green**: `#00B877` (light mode) / `#16FF99` (dark mode)
- **System Colors**: Success (`#12B76A`), Warning (`#FDB022`), Error (`#F04438`)
- **Surface Colors**: Consistent background and surface colors for both themes
- **EVM Accent**: `#627EEA` for Ethereum-related features

### Tailwind CSS Integration

For projects using Tailwind CSS or NativeWind, you can use the exported theme:

```javascript
// tailwind.config.js
import { flowTailwindTheme } from '@onflow/frw-ui';

module.exports = {
  theme: flowTailwindTheme,
  // ... other config
};
```

### CSS Variables

```css
/* Use Flow brand CSS variables */
:root {
  --primary: 0 184 119; /* Flow brand green */
  --surface-base: 242 242 247; /* Light mode surface */
  --fg-1: 0 13 7; /* Primary text */
}

.dark {
  --surface-base: 26 26 26; /* Dark mode surface */
  --fg-1: 255 255 255; /* Dark mode text */
}
```

## Available Components

### Foundation Components

- **Avatar** - User avatar with online status indicator
- **Button** - Multiple variants (primary, secondary, ghost, outline) with Flow
  branding
- **Card** - Container components with elevation (default, elevated, outlined)
- **Input** - Form inputs with proper Flow theme integration
- **SegmentedControl** - Tab-like selection component
- **Skeleton** - Loading state placeholder components
- **Text** - Semantic text variants (heading, body, caption, label)
- **Separator** - Divider components

### Specialized Components

- **TokenCard** - Display token information with balance, metadata, and Flow
  styling
- **BackgroundWrapper** - Layout wrapper with Flow theme support

### Layout Components

- **Stack** - Flexbox-based layout components (XStack, YStack)
- **ScrollView** - Scrollable containers
- **View** - Basic view containers

## Usage Examples

### Token Display with Flow Branding

```tsx
import { TokenCard, YStack } from '@onflow/frw-ui';

function TokenList({ tokens }) {
  return (
    <YStack space="$2" backgroundColor="$surfaceBase">
      {tokens.map((token) => (
        <TokenCard
          key={token.address}
          token={token}
          onPress={() => handleTokenPress(token)}
        />
      ))}
    </YStack>
  );
}
```

### Flow-Branded Form Components

```tsx
import { Button, Input, Text, YStack } from '@onflow/frw-ui';

function LoginForm() {
  return (
    <YStack space="$4" padding="$4" backgroundColor="$surfaceBase">
      <Text variant="heading" color="$fg1">
        Sign In to Flow Wallet
      </Text>
      <Input placeholder="Email address" />
      <Input placeholder="Password" secureTextEntry />
      <Button variant="primary" fullWidth>
        Sign In
      </Button>
    </YStack>
  );
}
```

## Storybook Development

To run Storybook for component development and preview:

### 1. Navigate to UI package

```bash
cd packages/ui
```

### 2. Install dependencies

```bash
pnpm install
```

### 3. Start Storybook

```bash
pnpm run storybook
```

Storybook will start at `http://localhost:6006/` where you can view all
components with Flow branding.

### 4. Build Storybook (optional)

```bash
pnpm run build-storybook
```

This generates static files to `storybook-static/` directory.

## Platform Support

- ✅ **Web**: Full support with Tamagui and Flow branding
- ✅ **React Native**: Full support with universal components
- ✅ **Browser Extensions**: Works in extension contexts
- ✅ **Server-Side Rendering**: Compatible with Next.js and other SSR frameworks

## Migration from NativeWind/Tailwind

If migrating from a NativeWind/Tailwind setup:

1. Install `@onflow/frw-ui`
2. Import Flow brand colors and theme
3. Replace Tailwind classes with Tamagui components where possible
4. Use the unified Flow brand theme system

```tsx
// Before (NativeWind)
<View className="bg-surface-base p-4">
  <Text className="text-fg-1 font-semibold text-primary">Flow Wallet</Text>
</View>

// After (Flow UI)
<YStack backgroundColor="$surfaceBase" padding="$4">
  <Text color="$primaryColor" fontWeight="$semibold">Flow Wallet</Text>
</YStack>
```

## Development

```bash
# Install dependencies
pnpm install

# Build the package
pnpm build

# Start Storybook for development
pnpm storybook

# Run tests
pnpm test
```

## Contributing

1. Follow the existing Flow brand guidelines and design system
2. Add proper TypeScript types for all components
3. Include Storybook stories for new components with Flow theme examples
4. Test components in both light and dark themes
5. Ensure cross-platform compatibility (Web, React Native, Extensions)
