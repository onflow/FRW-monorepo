// Android text fix utilities
export { getAndroidTextFix, useAndroidTextFix, getGlobalTextProps } from './androidTextFix';

// Account compatibility modal hook
export { useAccountCompatibilityModal } from './useAccountCompatibilityModal';

// Storage utilities
export { storage, asyncStorage } from './storage';

// Utility functions
export { cn, truncateAddress, truncateAddressByType, isEVMAccount } from './utils';

// Zustand AsyncStorage adapter
export { asyncStorageAdapter, mmkvStorageAdapter } from './zustand-mmkv';

// Flow balance hooks - DEPRECATED: Use sendStore balance management instead
// export { useCoaBalance, useEvmBalance, useEvmAddress } from './useFlowBalance';
