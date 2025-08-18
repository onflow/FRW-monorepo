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
export * from './foundation/Divider';
export * from './foundation/Input';
export * from './foundation/Separator';
export * from './foundation/Skeleton';
export * from './foundation/Text';

// Export specialized components
export * from './components/TokenCard';
export * from './components/RefreshView';
export * from './components/NFTCollectionRow';
export * from './components/AccountCard';
export * from './components/AccountSelectorModal';
export * from './components/AddressText';
export * from './components/AddressSearchBox';
export * from './components/Badge';
export * from './components/PercentageChangeBadge';
export * from './components/RecipientItem';
export * from './components/RecipientList';
export * from './components/SearchableTabLayout';
export * from './components/CollectionHeader';
export * from './components/NFTGrid';
export * from './components/NFTCard';
export * from './components/NFTSelectionBar';
export * from './components/NFTDetailView';
export * from './components/NFTInfoSection';
export * from './components/NFTPropertyTag';
export * from './components/NFTPropertiesGrid';
export * from './components/SelectableNFTImage';
export * from './components/TokenSelectorModal';
export * from './components/TransactionConfirmationModal';
export * from './components/NFTSendPreview';
export * from './components/SendSectionHeader';
export * from './components/SendArrowDivider';
export * from './components/MultipleNFTsPreview';
export * from './components/TransactionFeeSection';
export * from './components/ToAccountSection';
export * from './components/StorageWarning';
export * from './foundation/SegmentedControl';

export * from './components/TokenAmountInput';

// TODO: Fix TypeScript issues in the following components:
// export * from './components/Chip';
// export * from './components/NFTCover';
// export * from './components/NFTListCard';

export * from './tamagui.config';
export { default as tamaguiConfig } from './tamagui.config';

// Export theme system
export * from './theme';
// Export extension-specific theme config
export { extensionTamaguiConfig } from './theme/extension';

// Export layout components
export * from './layout/BackgroundWrapper';

// Export types
export * from './types';
