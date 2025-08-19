import { CadenceService } from '@onflow/frw-cadence';
import type { TokenModel, CollectionModel, NFTModel, WalletAccount } from '@onflow/frw-types';
import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';

interface AccessibleAssetStore {
  // State
  accessibleIds: string[];
  isLoading: boolean;
  error: string | null;

  // Actions
  setAccessibleIds: (accessibleIds: string[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  fetchChildAccountAllowTypes: (network: string, account: WalletAccount) => Promise<void>;

  // Getters - Specific asset checks
  isTokenAllowed: (token: TokenModel) => boolean;
  isNFTAllowed: (nft: NFTModel) => boolean;
  isCollectionAllowed: (collection: CollectionModel) => boolean;

  // Utils
  reset: () => void;
}

// Factory function to create new store instances
const createAccessibleAssetStore = () =>
  create<AccessibleAssetStore>()(
    subscribeWithSelector((set, get) => ({
      // Initial state
      accessibleIds: [],
      isLoading: false,
      error: null,

      // Actions
      setAccessibleIds: (accessibleIds: string[]) => {
        set({ accessibleIds, error: null });
      },

      setLoading: (isLoading: boolean) => {
        set({ isLoading });
      },

      setError: (error: string | null) => {
        set({ error, isLoading: false });
      },

      fetchChildAccountAllowTypes: async (network: string, account: WalletAccount) => {
        if (account.type !== 'child') {
          return;
        }

        const parentAddress = account.parentAddress;
        const childAddress = account.address;
        if (!parentAddress || !childAddress) {
          return;
        }

        const state = get();
        // Check if we already have data for this account combination
        if (state.accessibleIds.length > 0 && !state.error) {
          // Data already exists for this account, skip fetch
          return;
        }

        set({ isLoading: true, error: null });

        try {
          const cadenceService = new CadenceService();
          // Fetch the accessible IDs from cache
          const accessibleIds = await cadenceService.getChildAccountAllowTypes(
            parentAddress,
            childAddress
          );

          set({
            accessibleIds: accessibleIds || [],
            isLoading: false,
            error: null,
          });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
          console.error('Failed to fetch child account allow types:', errorMessage);

          set({
            accessibleIds: [],
            isLoading: false,
            error: errorMessage,
          });
        }
      },

      // Specific asset accessibility checks
      isTokenAllowed: (token: TokenModel) => {
        const { accessibleIds } = get();
        // Check if the token's id is in accessibleIds array
        return token.identifier ? accessibleIds.includes(token.identifier) : false;
      },

      isNFTAllowed: (nft: NFTModel) => {
        const { accessibleIds } = get();
        // Check if the NFT's id is in accessibleIds array
        return nft.id ? accessibleIds.includes(nft.id) : false;
      },

      isCollectionAllowed: (collection: CollectionModel) => {
        const { accessibleIds } = get();
        // Check if the collection's id is in accessibleIds array
        return collection.id ? accessibleIds.includes(collection.id) : false;
      },

      // Utility
      reset: () => {
        set({
          accessibleIds: [],
          isLoading: false,
          error: null,
        });
      },
    }))
  );

// Default store instance for backwards compatibility
export const useAccessibleAssetStore = createAccessibleAssetStore();

// Export factory function for creating new instances
export { createAccessibleAssetStore };

// Selector hooks for convenience
export const useAccessibleIds = () => useAccessibleAssetStore((state) => state.accessibleIds);
export const useAssetStoreLoading = () => useAccessibleAssetStore((state) => state.isLoading);
export const useAssetStoreError = () => useAccessibleAssetStore((state) => state.error);

// Specific asset accessibility hooks
export const useTokenAllowed = (token: TokenModel) =>
  useAccessibleAssetStore((state) => state.isTokenAllowed(token));
export const useNFTAllowed = (nft: NFTModel) =>
  useAccessibleAssetStore((state) => state.isNFTAllowed(nft));
export const useCollectionAllowed = (collection: CollectionModel) =>
  useAccessibleAssetStore((state) => state.isCollectionAllowed(collection));
