// Address utilities
export { isValidFlowAddress, formatFlowAddress, getAddressType, truncateAddress } from './address';

// NFT utilities
export {
  getNFTCover,
  getNFTId,
  getNFTSearchText,
  hasNFTMedia,
  getNFTDisplayName,
  isERC1155,
  getNFTResourceIdentifier,
  getCollectionResourceIdentifier,
} from './nft';

// General utilities
export {
  formatTokenAmount,
  debounce,
  deepClone,
  throttle,
  capitalize,
  formatNumber,
  isEmpty,
  isTransactionId,
  stripHexPrefix,
} from './utils';

// Token utilities
export {
  getDisplayBalanceInFLOW,
  getDisplayBalanceWithSymbol,
  getTokenResourceIdentifier,
  getTokenIdentifier,
} from './token';

// Logger utilities
export { createLogger, Logger, logger, setGlobalLogger } from './logger';
export type { BridgeLogger } from './logger';

// Re-export types from @onflow/frw-types for convenience
export type { WalletType, NFTModel } from '@onflow/frw-types';
