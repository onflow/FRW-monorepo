// Address utilities
export {
  isValidFlowAddress,
  formatFlowAddress,
  getAddressType,
  truncateAddress,
  isValidEthereumAddress,
} from './address';

// JWT utilities
export { decodeJwtPayload, extractUidFromJwt } from './jwt';

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
  isEmoji,
} from './utils';

// Token utilities
export {
  extractNumericBalance,
  getDisplayBalanceInFLOW,
  getDisplayBalanceWithSymbol,
  getTokenResourceIdentifier,
  getTokenIdentifier,
} from './token';

// SVG to PNG utilities
export { convertedSVGURL } from './svgtopng';

// Logger utilities
export { createLogger, Logger, logger, setGlobalLogger } from './logger';

// Query retry utilities
export { retryConfigs, getRetryConfig, createRetryFunction } from './query-retry';
export type { BridgeLogger } from './logger';

// Account transformer utilities
export { transformAccountForCard, transformAccountForDisplay } from './accountTransformers';

// Theme utilities
export {
  isDarkMode,
  getThemeTextColor,
  getThemeBackgroundColor,
  getThemeCardBackground,
} from './theme';

// Re-export types from @onflow/frw-types for convenience
export type { WalletType, NFTModel } from '@onflow/frw-types';
