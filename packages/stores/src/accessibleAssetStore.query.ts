import { cadence } from '@onflow/frw-context';
import {
  FlatQueryDomain,
  type TokenModel,
  type CollectionModel,
  type NFTModel,
  type WalletAccount,
} from '@onflow/frw-types';
import {
  getCollectionResourceIdentifier,
  getNFTResourceIdentifier,
  getTokenResourceIdentifier,
  logger,
} from '@onflow/frw-utils';

// Query Keys Factory - Using optimized domain structure
export const accessibleAssetQueryKeys = {
  all: [FlatQueryDomain['ACCESSIBLE_ASSETS']] as const, // Uses FINANCIAL domain
  accounts: () => [...accessibleAssetQueryKeys.all, 'accounts'] as const,
  account: (parentAddress: string, childAddress: string, network: string = 'mainnet') =>
    [...accessibleAssetQueryKeys.accounts(), parentAddress, childAddress, network] as const,
  allowTypes: (parentAddress: string, childAddress: string, network: string = 'mainnet') =>
    [
      ...accessibleAssetQueryKeys.account(parentAddress, childAddress, network),
      'allowTypes',
    ] as const,
};

// Query Functions - Pure data fetching logic
export const accessibleAssetQueries = {
  // Fetch accessible IDs for a child account
  fetchChildAccountAllowTypes: async (
    parentAddress: string,
    childAddress: string,
    network: string = 'mainnet'
  ): Promise<string[]> => {
    if (!parentAddress || !childAddress) {
      return [];
    }

    try {
      const accessibleIds = await cadence.getChildAccountAllowTypes(parentAddress, childAddress);

      logger.debug('[AccessibleAssetQuery] Fetched accessible IDs:', {
        parentAddress,
        childAddress,
        network,
        count: accessibleIds?.length || 0,
      });

      return accessibleIds || [];
    } catch (error: unknown) {
      logger.error('[AccessibleAssetQuery] Error fetching accessible IDs:', error);
      throw error;
    }
  },
};

// Helper functions for asset accessibility checks
export const accessibleAssetHelpers = {
  // Check if token is allowed for specific account
  isTokenAllowed: (token: TokenModel, accessibleIds: string[] | null | undefined): boolean => {
    if (accessibleIds === null || accessibleIds === undefined) {
      return true;
    }

    if (!token.contractAddress) {
      return false;
    }

    const tokenIdentifier = getTokenResourceIdentifier(token);
    if (!tokenIdentifier) {
      return false;
    }

    return accessibleIds.some((id) => id.toLowerCase().includes(tokenIdentifier.toLowerCase()));
  },

  // Check if NFT is allowed for specific account
  isNFTAllowed: (nft: NFTModel, accessibleIds: string[] | null | undefined): boolean => {
    if (accessibleIds === null || accessibleIds === undefined) {
      return true;
    }

    if (!nft.address) {
      return false;
    }

    const nftIdentifier = getNFTResourceIdentifier(nft);
    if (!nftIdentifier) {
      return false;
    }

    return accessibleIds.some((id) => id.toLowerCase().includes(nftIdentifier.toLowerCase()));
  },

  // Check if collection is allowed for specific account
  isCollectionAllowed: (
    collection: CollectionModel,
    accessibleIds: string[] | null | undefined
  ): boolean => {
    if (!accessibleIds || accessibleIds.length === 0) {
      return true; // If no restrictions loaded, assume allowed
    }

    if (!collection.address || !collection.contractName) {
      return false;
    }

    const collectionIdentifier = getCollectionResourceIdentifier(collection);
    if (!collectionIdentifier) {
      return false;
    }

    return accessibleIds.some((id) =>
      id.toLowerCase().includes(collectionIdentifier.toLowerCase())
    );
  },

  // Check if current account is a child account
  isChildAccount: (account: WalletAccount | null | undefined): boolean => {
    return account?.type === 'child' && !!account.parentAddress;
  },

  // Get parent and child addresses from account
  getAccountAddresses: (account: WalletAccount | null | undefined) => {
    if (!accessibleAssetHelpers.isChildAccount(account)) {
      return { parentAddress: null, childAddress: null };
    }

    return {
      parentAddress: account!.parentAddress!,
      childAddress: account!.address,
    };
  },

  // Filter tokens based on accessibility for child account
  filterAccessibleTokens: (
    tokens: TokenModel[],
    accessibleIds: string[] | null | undefined
  ): TokenModel[] => {
    if (!accessibleIds || accessibleIds.length === 0) {
      return tokens; // No restrictions, return all
    }

    return tokens.filter((token) => accessibleAssetHelpers.isTokenAllowed(token, accessibleIds));
  },

  // Filter NFT collections based on accessibility for child account
  filterAccessibleCollections: (
    collections: CollectionModel[],
    accessibleIds: string[] | null | undefined
  ): CollectionModel[] => {
    if (!accessibleIds || accessibleIds.length === 0) {
      return collections; // No restrictions, return all
    }

    return collections.filter((collection) =>
      accessibleAssetHelpers.isCollectionAllowed(collection, accessibleIds)
    );
  },
};
