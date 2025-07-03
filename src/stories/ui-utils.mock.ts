// Re-export everything from the original ui/utils except WalletContext
export * from '../shared/utils/number';
export * from '../ui/utils/time';
export * from '../ui/utils/webapi';
export * from '../ui/utils/WindowContext';

// Re-export other utils from the main index file
export {
  ellipsisOverflowedText,
  formatAddress,
  getOriginName,
  getUiType,
  getUITypeName,
  hashCode,
  hex2Text,
  HexToDecimalConverter,
  hexToUint8Array,
  isEmoji,
  noop,
  returnFilteredCollections,
  truncate,
} from '../ui/utils';

// Import and re-export the mocked WalletContext
export { useWallet, useWalletLoaded } from '../ui/utils/WalletContext.mock';

// Import and re-export the mocked useProfiles hook
export { useProfiles } from '../ui/hooks/useProfileHook.mock';
