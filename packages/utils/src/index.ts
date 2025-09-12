// Address utilities
export {
  isValidFlowAddress,
  formatFlowAddress,
  getAddressType,
  truncateAddress,
  isValidEthereumAddress,
} from './address';

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

// SVG to PNG utilities
export { convertedSVGURL } from './svgtopng';

// Logger utilities
export { createLogger, Logger, logger, setGlobalLogger } from './logger';
export type { BridgeLogger } from './logger';

// Account transformer utilities
export { transformAccountForCard, transformAccountForDisplay } from './accountTransformers';

// Re-export types from @onflow/frw-types for convenience
export type { WalletType, NFTModel } from '@onflow/frw-types';
