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
export * from './components/Avatar';
export * from './components/Button';
export * from './components/Card';
export * from './components/Input';
export * from './components/Separator';
export * from './components/Skeleton';
export * from './components/Text';

// Export specialized components
export * from './components/SegmentedControl';
export * from './components/TokenCard';

export * from './tamagui.config';

// Export layout components
export * from './layout/BackgroundWrapper';

// Export types
export * from './types';
