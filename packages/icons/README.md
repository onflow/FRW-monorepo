# @onflow/frw-icons

SVG icons package for Flow Reference Wallet with automatic React component
generation.

## Features

- 🎨 Automatic SVG to React component conversion
- 📦 Tree-shakable exports
- 🔄 Incremental generation (only converts new/missing icons)
- 🌐 **Universal compatibility**: Works in React Web, React Native, and
  Extensions
- 📱 Pure React SVG components (no react-native-svg dependency needed)
- 🎯 TypeScript support with full type definitions
- 🚀 Optimized builds with proper peer dependencies
- 🎨 Built-in color theming with `currentColor` support

## Installation

```bash
# Install the icons package
pnpm add @onflow/frw-icons

# No additional dependencies needed! Works universally in:
# - React Web applications
# - React Native applications
# - Browser extensions
```

## Usage

### Import Individual Icons

```typescript
import { ArrowRight, CheckCircle, Copy } from '@onflow/frw-icons';

// Use in your component
function MyComponent() {
  return (
    <View>
      <ArrowRight width={24} height={24} />
      <CheckCircle width={20} height={20} />
      <Copy width={16} height={16} />
    </View>
  );
}
```

### Import from Subdirectories

Icons are organized by category:

```typescript
// Import from specific categories
import { FlowLogo } from '@onflow/frw-icons/tokens';
import {
  TabAddressBook,
  TabMyAccounts,
  TabRecent,
} from '@onflow/frw-icons/send';
```

### Icon Props

All icons are pure React SVG components that accept standard
`SVGProps<SVGSVGElement>`:

```typescript
import type { SVGProps } from 'react';

// All icons accept these props
type IconProps = SVGProps<SVGSVGElement>;

// Usage examples
<ArrowRight width={24} height={24} />
<CheckCircle color="green" className="my-icon" />
<Copy style={{ color: 'blue' }} onClick={handleCopy} />
```

## Icon Categories

- **Root Icons**: Basic UI icons (arrows, check, close, edit, etc.)
- **Send**: Send flow related icons
- **Tokens**: Token and cryptocurrency related icons

## Development

### Adding New Icons

1. Add your SVG files to the `assets/` directory
2. Run the icon generator:
   ```bash
   pnpm generate:icons
   ```
3. The generator will automatically create React components in `src/components/`

### Scripts

```bash
# Generate icons (incremental - only new/missing icons)
pnpm generate:icons

# Force regenerate all icons
pnpm generate:icons:force

# Build the package
pnpm build

# Clean generated files
pnpm clean

# Lint code
pnpm lint
```

### Icon Generator

The icon generator (`scripts/icon-generator.js`) automatically:

- Scans the `assets/` directory for SVG files
- Converts SVGs to TypeScript React components using @svgr/cli
- Maintains directory structure in the output
- Generates index files for easy importing
- Only processes new or missing icons (unless `--force` is used)
- Replaces black colors with `currentColor` for easy theming

### Directory Structure

```
packages/icons/
├── assets/           # Source SVG files
│   ├── arrow-right.svg
│   ├── send/
│   └── tokens/
├── src/
│   ├── components/   # Generated React components (auto-generated)
│   └── index.ts      # Main export file (auto-generated)
├── scripts/
│   └── icon-generator.js  # SVG to React converter
└── dist/             # Built package (auto-generated)
```

## Build Process

The package uses `tsup` for building and supports:

- CommonJS and ESM output formats
- TypeScript declarations
- Tree-shaking support
- Proper peer dependency externalization

## Peer Dependencies

- `react` 19.1.0

That's it! No additional dependencies needed for any platform.

## Contributing

1. Add SVG files to the `assets/` directory
2. Run `pnpm generate:icons` to create React components
3. Test your icons in your consuming application
4. Build and publish the package

## License

MIT
