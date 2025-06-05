import { fn } from 'storybook/test';

// Mock wallet object with common methods that components might use
const mockWallet = {
  setActiveAccount: fn().mockName('setActiveAccount').mockResolvedValue(undefined),
  createManualAddress: fn().mockName('createManualAddress').mockResolvedValue(undefined),
  lockWallet: fn().mockName('lockWallet').mockResolvedValue(undefined),
  sendTransaction: fn().mockName('sendTransaction').mockResolvedValue('mock-tx-id'),
  getMainAccounts: fn().mockName('getMainAccounts').mockResolvedValue([]),
  getCurrentAddress: fn().mockName('getCurrentAddress').mockResolvedValue(null),
  getNetwork: fn().mockName('getNetwork').mockReturnValue('mainnet'),
  isLocked: fn().mockName('isLocked').mockReturnValue(false),
  // Add other wallet methods as needed
};

// Mock the useWallet hook to return the mock wallet object
export const useWallet = fn().mockName('useWallet').mockReturnValue(mockWallet);

// Mock the useWalletLoaded hook
export const useWalletLoaded = fn().mockName('useWalletLoaded').mockReturnValue(true);

// Export the wallet object itself in case it's needed
export const wallet = mockWallet;
