# Claude Development Notes

## Project Overview

This is the Flow Reference Wallet (FRW) project - a monorepo containing packages
for UI, icons, and applications (extension, react-native).

## Development Commands

- `pnpm install` - Install dependencies
- `pnpm build` - Build all packages
- `pnpm dev` - Start development servers

## Tamagui V4 Shorthands

When working with Tamagui components, always use these V4 shorthand properties
for cleaner, more maintainable code:

### Layout & Spacing

- `padding` → `p`
- `paddingTop` → `pt`
- `paddingBottom` → `pb`
- `paddingLeft` → `pl`
- `paddingRight` → `pr`
- `paddingHorizontal` → `px`
- `paddingVertical` → `py`
- `margin` → `m`
- `marginTop` → `mt`
- `marginBottom` → `mb`
- `marginLeft` → `ml`
- `marginRight` → `mr`
- `marginHorizontal` → `mx`
- `marginVertical` → `my`

### Flexbox

- `alignItems` → `items`
- `justifyContent` → `justify`
- `flexDirection` → `direction`
- `flexWrap` → `wrap`
- `alignSelf` → `self`
- `flex` → `flex`
- `flexGrow` → `grow`
- `flexShrink` → `shrink`
- `flexBasis` → `basis`

### Dimensions

- `width` → `w`
- `height` → `h`
- `minWidth` → `minW`
- `minHeight` → `minH`
- `maxWidth` → `maxW`
- `maxHeight` → `maxH`

### Colors & Styling

- `backgroundColor` → `bg`
- `color` → `color` (stays the same)
- `borderColor` → `borderColor` (stays the same)
- `borderWidth` → `borderWidth` (stays the same)
- `borderRadius` → `rounded`

### Positioning

- `position` → `pos`
- `top` → `top`
- `bottom` → `bottom`
- `left` → `left`
- `right` → `right`
- `zIndex` → `z`

### Text

- `fontSize` → `fontSize` (stays the same)
- `fontWeight` → `fontWeight` (stays the same)
- `textAlign` → `text`
- `lineHeight` → `lineHeight` (stays the same)
- `letterSpacing` → `letterSpacing` (stays the same)

### Display

- `display` → `display` (stays the same)
- `overflow` → `overflow` (stays the same)
- `opacity` → `opacity` (stays the same)

### Example Usage

```tsx
// Before (verbose)
<YStack
  padding="$4"
  marginBottom="$2"
  alignItems="center"
  justifyContent="center"
  backgroundColor="$gray1"
  borderRadius="$3"
  minWidth={120}
  minHeight={80}
  maxWidth={100}
  textAlign="center"
>

// After (with shorthands)
<YStack
  p="$4"
  mb="$2"
  items="center"
  justify="center"
  bg="$gray1"
  rounded="$3"
  minW={120}
  minH={80}
  maxW={100}
  text="center"
>
```

## Icons Package

The `@onflow/frw-icons` package contains universal React SVG components with
runtime color theming, inspired by IconPark's approach. All icons work across
Web, React Native, and Extensions without requiring react-native-svg.

### Key Features

- **Runtime Color Control**: Dynamic color theming without hardcoded values
- **Universal Compatibility**: Works across Web, React Native, and Extensions
- **Theme Support**: Outline, filled, and dual-tone themes
- **TypeScript Support**: Full type safety with `IconWrapperProps`
- **Automatic Generation**: Custom build script converts SVG files to React
  components
- **Flexible API**: Size, color, and theme can be controlled at runtime

### Usage

```tsx
import { ArrowRight, CheckCircle, IconWrapper } from '@onflow/frw-icons';

// Basic usage with size and color control
<ArrowRight size={24} color="#3b82f6" theme="outline" />

// Different themes
<CheckCircle size={32} color="#10b981" theme="filled" />
<ArrowRight size={24} color="#374151" theme="dual-tone" />

// All standard SVG props are supported
<Copy
  size={20}
  color="#ef4444"
  theme="outline"
  onClick={handleCopy}
  style={{ cursor: 'pointer' }}
/>
```

### Available Themes

- **outline**: Strokes with current color, no fill (default)
- **filled**: Filled with current color
- **dual-tone**: Preserves original design but allows color override

### IconWrapper Component

The core `IconWrapper` component handles runtime color conversion:

- Processes SVG children to apply theme-based coloring
- Removes opacity attributes that interfere with color control
- Supports all standard SVG props
- Automatically handles viewBox and sizing

## Storybook Integration

The UI package includes comprehensive Storybook integration with:

- Icon showcase with search and interactive features
- Component documentation with argTypes
- CSS Grid layouts for responsive displays
- Proper color theming and visibility handling
