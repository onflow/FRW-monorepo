// Export Tamagui base components (excluding components we've customized)
export {
  H1,
  H2,
  H3,
  H4,
  H5,
  H6,
  Image,
  Paragraph,
  ScrollView,
  Spinner,
  Stack,
  View,
  XStack,
  YStack,
} from 'tamagui';

// Export our custom UI foundation components
// These are enhanced versions with custom variants and better design system integration
export * from './foundation/Avatar';
export * from './foundation/Button';
export * from './foundation/Card';
export * from './foundation/Input';
export * from './foundation/Separator';
export * from './foundation/Skeleton';
export * from './foundation/Text';

// Export specialized components
export * from './components/TokenCard';
export * from './foundation/SegmentedControl';

export * from './tamagui.config';
export { default as tamaguiConfig } from './tamagui.config';

// Export theme system
export * from './theme';

// Export layout components
export * from './layout/BackgroundWrapper';

// Export types
export * from './types';
