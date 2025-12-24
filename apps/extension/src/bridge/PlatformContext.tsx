import { ServiceContext, type PlatformSpec, logger } from '@onflow/frw-context';
import { initializeI18n } from '@onflow/frw-screens';
import { useSendStore, sendSelectors, tokenQueries } from '@onflow/frw-stores';
import { type WalletAccount, type CollectionModel } from '@onflow/frw-types';
import BN from 'bignumber.js';
import { createContext, useContext, useEffect, useRef, type ReactNode } from 'react';
import { useLocation, useNavigate } from 'react-router';

import { getCachedData } from '@/data-model/cache-data-access';
import { userInfoCachekey, getCachedMainAccounts } from '@/data-model/cache-data-keys';
import { KEYRING_STATE_V3_KEY } from '@/data-model/local-data-keys';
import { getLocalData } from '@/data-model/storage';
import { type KeyringStateV3, type VaultEntryV3 } from '@/shared/types';
import { isValidEthereumAddress } from '@/shared/utils/address';
import { useCurrency } from '@/ui/hooks/preference-hooks';
import { useUserWallets } from '@/ui/hooks/use-account-hooks';
import { useWallet } from '@/ui/hooks/use-wallet';
import { useCoins } from '@/ui/hooks/useCoinHook';
import { useNetwork } from '@/ui/hooks/useNetworkHook';
import { useCadenceNftCollectionsAndIds, useEvmNftCollectionsAndIds } from '@/ui/hooks/useNftHook';
import { useProfiles } from '@/ui/hooks/useProfileHook';

import { extensionNavigation } from './ExtensionNavigation';
import { initializePlatform } from './PlatformImpl';

/**
 * Platform context that provides the full PlatformSpec implementation
 * and convenience methods for screens
 */

// Define types for platform bridge and translation
type NavigationProp = {
  navigate: (screen: string, params?: any) => void;
  goBack: () => void;
  canGoBack: () => boolean;
  reset: (routes: string[]) => void;
  replace: (screen: string, params?: Record<string, unknown>) => void;
  push: (screen: string, params?: Record<string, unknown>) => void;
  pop: () => void;
  getCurrentRoute: () => { name: string; params?: Record<string, unknown> } | null;
};
type PlatformBridge = {
  getSelectedAddress(): string | null;
  getNetwork(): string;
  getCurrency(): any;
  getCache?(key: string): any | null;
  getSelectedAccount?(): Promise<WalletAccount>;
  getRouterValue?(): { [key: string]: any };
  getMigrationAssets?(sourceAddress: string): Promise<{
    erc20: Array<{ address: string; amount: string }>;
    erc721: Array<{ address: string; id: string }>;
    erc1155: Array<{ address: string; id: string; amount: string }>;
  }>;
};
type TranslationFunction = (key: string) => string;

interface PlatformContextValue {
  // Full platform implementation
  platform: PlatformSpec;

  // Convenience methods for screens (extracted from platform)
  getNavigation: (navigate: (path: string | number, state?: any) => void) => NavigationProp;
  getBridge: () => PlatformBridge;
  getTranslation: () => TranslationFunction;
}

const PlatformContext = createContext<PlatformContextValue | null>(null);

/**
 * Platform provider that initializes the platform implementation
 * and keeps it synchronized with extension state
 */
export const PlatformProvider = ({ children }: { children: ReactNode }) => {
  const { network } = useNetwork();
  const userWallets = useUserWallets();
  const {
    currentWallet,
    mainAddress,
    walletList,
    evmWallet,
    childAccounts,
    activeAccountType,
    profileIds,
    parentWallet,
    currentBalance,
  } = useProfiles();

  // Track i18n initialization to avoid multiple initializations
  const i18nInitialized = useRef(false);

  // Send store hooks for synchronization
  const fromAccount = useSendStore(sendSelectors.fromAccount);
  const setFromAccount = useSendStore((state) => state.setFromAccount);
  const wallet = useWallet();
  const { coins } = useCoins();
  const currency = useCurrency();

  // Use the appropriate NFT hook based on address type
  const isEvmAddress = isValidEthereumAddress(currentWallet?.address || '');
  const cadenceNftCollections = useCadenceNftCollectionsAndIds(
    network,
    isEvmAddress ? undefined : currentWallet?.address
  );
  const evmNftCollections = useEvmNftCollectionsAndIds(
    network,
    isEvmAddress ? currentWallet?.address : undefined
  );

  // Use the appropriate NFT collections based on address type
  const nftCollectionsList = isEvmAddress ? evmNftCollections : cadenceNftCollections;

  const navigate = useNavigate();
  const location = useLocation();

  // Initialize platform singleton
  const platform = initializePlatform();

  // Initialize i18n with platform-detected language (only once)
  useEffect(() => {
    if (!i18nInitialized.current) {
      const initI18n = async () => {
        try {
          const language = platform.getLanguage();
          await initializeI18n(language);
          logger.debug('[PlatformProvider] i18n initialized with language:', language);
          i18nInitialized.current = true;
        } catch (error) {
          logger.error('[PlatformProvider] Failed to initialize i18n:', error);
        }
      };
      initI18n();
    }
  }, [platform]);

  // Initialize ServiceContext with enhanced platform that includes hook data
  useEffect(() => {
    // Create enhanced platform that overrides methods to use hook data
    const enhancedPlatform = Object.create(platform);

    enhancedPlatform.getCache = async (key: string) => {
      if (key === 'coins') {
        if (!coins || coins.length === 0) {
          return null;
        }

        // Convert ExtendedTokenInfo[] to TokenModel format for consistent use across clients
        const convertedCoins = coins.map((coin) => ({
          name: coin.name || 'Unknown Token',
          symbol: coin.symbol || '',
          balance: coin.balance || '0',
          priceInUSD: coin.priceInUSD || coin.price || '0',
          decimals: coin.decimals || 8,
          logoURI: coin.logoURI || coin.icon || '',
          address: coin.address || '',
          isVerified: coin.isVerified || false,
          identifier: coin.id || null,
          contractAddress: coin.address || '',
          contractName: coin.contractName || coin.name || '',
          displayBalance: coin.balance || '0',
          icon: coin.logoURI || coin.icon || '',
          usdValue: coin.balanceInUSD || coin.priceInUSD || '0',
          change: coin.change24h?.toString() || '0',
          availableBalanceToUse: coin.availableBalance || coin.balance || '0',
        }));

        return convertedCoins;
      }

      if (key === 'nfts') {
        if (!nftCollectionsList || nftCollectionsList.length === 0) {
          return null;
        }

        // Convert NftCollectionAndIds[] to CollectionModel format for screens package
        const convertedCollections = nftCollectionsList.map((collection) => ({
          // NFTCollection fields - handle null values
          id: collection.collection.id || '',
          name: collection.collection.name || '',
          contractName: collection.collection.contractName || '',
          contract_name: collection.collection.contractName || '',
          logo: collection.collection.logo || '',
          logoURI: collection.collection.logo || '',
          banner: collection.collection.banner || '',
          description: collection.collection.description || '',
          address: collection.collection.address || '',
          evmAddress: collection.collection.evmAddress || '',
          flowIdentifier: collection.collection.flowIdentifier || '',
          externalURL: collection.collection.externalURL || '',

          // Handle contractType for EVM NFTs
          ...(isEvmAddress &&
            (collection.collection as any).contractType && {
              contractType: (collection.collection as any).contractType,
            }),

          // Handle path for Cadence NFTs
          ...(collection.collection.path && {
            path: {
              private_path: collection.collection.path.storagePath || '',
              public_path: collection.collection.path.publicPath || '',
              storage_path: collection.collection.path.storagePath || '',
            },
          }),

          // CollectionModel additional fields
          type: isEvmAddress ? 'evm' : 'flow',
          count: collection.count || 0,
        }));
        return convertedCollections;
      }

      return null;
    };

    enhancedPlatform.getMigrationAssets = async (sourceAddress: string) => {
      // Convert coins and NFTs to MigrationAssetsData format
      const migrationAssets: {
        erc20: Array<{ address: string; amount: string }>;
        erc721: Array<{ address: string; id: string }>;
        erc1155: Array<{ address: string; id: string; amount: string }>;
      } = {
        erc20: [],
        erc721: [],
        erc1155: [],
      };

      logger.debug('[PlatformBridge] getMigrationAssets called', {
        sourceAddress,
        coinsCount: coins?.length || 0,
        nftCollectionsCount: evmNftCollections?.length || 0,
      });

      // Log all coins for debugging
      if (coins && coins.length > 0) {
        console.log(
          '[PlatformBridge] All coins data (enhancedPlatform):',
          coins.map((coin) => ({
            address: coin.address,
            symbol: coin.symbol,
            name: coin.name,
            balance: coin.balance,
            rawBalance: (coin as any).rawBalance,
            decimals: coin.decimals,
            contractName: coin.contractName,
            flowIdentifier: (coin as any).flowIdentifier,
            unit: coin.unit,
          }))
        );

        // Specifically identify and log all potential FLOW tokens
        const potentialFlowTokens = coins.filter((coin) => {
          const isFlowToken =
            coin.contractName?.toLowerCase() === 'flowtoken' ||
            (coin as any).flowIdentifier?.includes('FlowToken') ||
            coin.symbol?.toLowerCase() === 'flow' ||
            coin.unit?.toLowerCase() === 'flow';
          return isFlowToken;
        });

        if (potentialFlowTokens.length > 0) {
          console.log(
            '[PlatformBridge] ===== POTENTIAL FLOW TOKENS FOUND (enhancedPlatform) ====='
          );
          potentialFlowTokens.forEach((coin, index) => {
            const matchReasons: string[] = [];
            if (coin.contractName?.toLowerCase() === 'flowtoken') matchReasons.push('contractName');
            if ((coin as any).flowIdentifier?.includes('FlowToken'))
              matchReasons.push('flowIdentifier');
            if (coin.symbol?.toLowerCase() === 'flow') matchReasons.push('symbol');
            if (coin.unit?.toLowerCase() === 'flow') matchReasons.push('unit');

            // Check if this is the stFlowToken.Vault Cadence token
            const isStFlowTokenVault =
              coin.address &&
              (coin.address.includes('stFlowToken') ||
                coin.address.includes('Vault') ||
                coin.address.includes('A.d6f80565193ad727'));

            if (isStFlowTokenVault) {
              console.log(
                `[PlatformBridge] ⚠️⚠️⚠️ CADENCE TOKEN DETECTED: stFlowToken.Vault or similar ⚠️⚠️⚠️`
              );
              console.log(
                `[PlatformBridge] This is a CADENCE token (NOT EVM) - should be EXCLUDED from migration`
              );
            }

            console.log(
              `[PlatformBridge] FLOW Token ${index + 1} - Match Reasons:`,
              matchReasons.join(', ')
            );
            console.log(
              `[PlatformBridge] FLOW Token ${index + 1} - Is Cadence Token:`,
              isStFlowTokenVault
            );
            console.log(
              `[PlatformBridge] FLOW Token ${index + 1} - FULL COIN OBJECT:`,
              JSON.stringify(coin, null, 2)
            );
            console.log(`[PlatformBridge] FLOW Token ${index + 1} - Summary:`, {
              address: coin.address,
              symbol: coin.symbol,
              name: coin.name,
              balance: coin.balance,
              rawBalance: (coin as any).rawBalance,
              contractName: coin.contractName,
              flowIdentifier: (coin as any).flowIdentifier,
              unit: coin.unit,
              decimals: coin.decimals,
              id: (coin as any).id,
              isCadenceToken: isStFlowTokenVault,
            });
          });
          console.log('[PlatformBridge] ===== END POTENTIAL FLOW TOKENS (enhancedPlatform) =====');
        }
      }

      // Convert ERC20 tokens from coins (only tokens with balance > 0)
      if (coins && coins.length > 0) {
        migrationAssets.erc20 = coins
          .filter((coin) => {
            // Only include tokens with balance > 0
            const balanceStr = coin.balance || '0';
            if (
              balanceStr === 'deprecated' ||
              balanceStr === 'N/A' ||
              balanceStr === 'null' ||
              balanceStr === 'undefined'
            ) {
              return false;
            }
            const balance = parseFloat(balanceStr);
            if (isNaN(balance) || balance <= 0) {
              return false;
            }

            // If token has EVM address, include it as ERC20
            if (coin.address && coin.address.startsWith('0x')) {
              return true;
            }

            // If no EVM address, check if it's FLOW token (we'll set zero address for it)
            const isFlowToken =
              coin.contractName?.toLowerCase() === 'flowtoken' ||
              (coin as any).flowIdentifier?.includes('FlowToken') ||
              coin.symbol?.toLowerCase() === 'flow' ||
              coin.unit?.toLowerCase() === 'flow';

            // Only allow FLOW token if it doesn't have EVM address
            return isFlowToken;
          })
          .map((coin) => {
            const tokenAddress = coin.address || '';
            let amount: string;

            // If token has EVM address, treat as ERC20
            if (tokenAddress.startsWith('0x')) {
              // For ERC20 tokens, we need the raw amount in smallest unit
              // Check if rawBalance is available (for EVM tokens)
              const rawBalance = (coin as any).rawBalance;
              if (rawBalance && typeof rawBalance === 'string') {
                // Validate rawBalance is a valid number string
                if (
                  rawBalance === 'deprecated' ||
                  rawBalance === 'N/A' ||
                  rawBalance === 'null' ||
                  rawBalance === 'undefined' ||
                  isNaN(parseFloat(rawBalance))
                ) {
                  logger.warn('[PlatformBridge] Skipping token with invalid rawBalance', {
                    address: tokenAddress,
                    rawBalance,
                    symbol: coin.symbol,
                  });
                  return null;
                }
                // Use rawBalance if available (already in smallest unit)
                amount = rawBalance;
              } else {
                // Convert display balance to raw amount using decimals
                const balanceStr = coin.balance || '0';
                // Validate balance string is numeric
                if (
                  balanceStr === 'deprecated' ||
                  balanceStr === 'N/A' ||
                  balanceStr === 'null' ||
                  balanceStr === 'undefined' ||
                  isNaN(parseFloat(balanceStr))
                ) {
                  logger.warn('[PlatformBridge] Skipping token with invalid balance', {
                    address: tokenAddress,
                    balance: balanceStr,
                    symbol: coin.symbol,
                  });
                  return null;
                }

                const decimals = coin.decimals ?? 18; // Default to 18 if not specified
                const displayBalance = parseFloat(balanceStr);

                if (isNaN(displayBalance) || displayBalance <= 0) {
                  // Skip invalid amounts
                  return null;
                }

                // Convert to raw amount: multiply by 10^decimals
                // Use BigNumber.js for precision (already imported as BN)
                try {
                  const rawAmount = new BN(displayBalance).multipliedBy(new BN(10).pow(decimals));
                  amount = rawAmount.toFixed(0); // Convert to integer string
                } catch (error) {
                  logger.error('[PlatformBridge] Failed to convert balance to raw amount', {
                    address: tokenAddress,
                    balance: balanceStr,
                    decimals,
                    error,
                  });
                  return null;
                }
              }

              return {
                address: tokenAddress,
                amount: amount,
              };
            }

            // If no EVM address, check if it's FLOW token (we'll set zero address for it)
            const isFlowToken =
              coin.contractName?.toLowerCase() === 'flowtoken' ||
              (coin as any).flowIdentifier?.includes('FlowToken') ||
              coin.symbol?.toLowerCase() === 'flow' ||
              coin.unit?.toLowerCase() === 'flow';

            if (isFlowToken) {
              // Flow token amount needs to be precise - use rawBalance if available
              // Otherwise use display balance and truncate (not round) to 8 decimal places
              const balanceStr = coin.balance || '0';
              if (
                balanceStr === 'deprecated' ||
                balanceStr === 'N/A' ||
                balanceStr === 'null' ||
                balanceStr === 'undefined' ||
                isNaN(parseFloat(balanceStr))
              ) {
                logger.warn('[PlatformBridge] Skipping Flow token with invalid balance', {
                  balance: balanceStr,
                });
                return null;
              }

              // Check if rawBalance is available (in wei) - use it to get precise amount
              const rawBalance = (coin as any).rawBalance;
              if (
                rawBalance &&
                typeof rawBalance === 'string' &&
                rawBalance !== 'deprecated' &&
                rawBalance !== 'N/A' &&
                !isNaN(parseFloat(rawBalance))
              ) {
                // Convert from wei to FLOW: divide by 10^18 using BigNumber.js for precision
                const weiBN = new BN(rawBalance);
                const flowBN = weiBN.dividedBy(new BN(10).pow(18));
                // Truncate to 8 decimal places (not round) to ensure we don't request more than available
                // Use BigNumber.js dp() method to maintain precision
                const truncated = flowBN.dp(8, BN.ROUND_DOWN);
                amount = truncated.toString();
              } else {
                // Use display balance and truncate to 8 decimal places (not round)
                // This ensures we don't request more than the user has
                // Use BigNumber.js for precision when truncating
                const balanceBN = new BN(balanceStr);
                const truncated = balanceBN.dp(8, BN.ROUND_DOWN);
                amount = truncated.toString();
              }

              return {
                address: '0x0000000000000000000000000000000000000000',
                amount: amount,
              };
            }

            // If no EVM address and not FLOW token, exclude it
            return null;
          })
          .filter((asset): asset is { address: string; amount: string } => asset !== null);

        // Deduplicate assets by address and sum amounts
        // This handles cases where multiple coin entries map to the same token (e.g., multiple FLOW entries)
        const beforeDedupCount = migrationAssets.erc20.length;
        const assetMap = new Map<string, BN>();
        const duplicateAddresses = new Set<string>();

        for (const asset of migrationAssets.erc20) {
          if (assetMap.has(asset.address)) {
            // Found duplicate address
            duplicateAddresses.add(asset.address);
          }
          const currentAmount = assetMap.get(asset.address) || new BN(0);
          // Convert scientific notation to fixed notation before creating BigNumber
          let amountStr = asset.amount;
          if (
            typeof amountStr === 'string' &&
            (amountStr.includes('e+') || amountStr.includes('e-'))
          ) {
            // Parse scientific notation manually to preserve precision
            // Format: "1.625083655084202e+24" -> mantissa * 10^exponent
            const [mantissa, exponent] = amountStr.toLowerCase().split('e');
            const exp = parseInt(exponent, 10);

            // Count decimal places in mantissa
            const decimalIndex = mantissa.indexOf('.');
            const decimalPlaces = decimalIndex >= 0 ? mantissa.length - decimalIndex - 1 : 0;

            // Remove decimal point and create integer mantissa
            const integerMantissa = mantissa.replace('.', '');
            const mantissaBN = new BN(integerMantissa);

            // Calculate final exponent: original exponent - decimal places
            const finalExp = exp - decimalPlaces;

            // Multiply by 10^finalExp
            const multiplier = new BN(10).pow(Math.abs(finalExp));
            const result =
              finalExp >= 0
                ? mantissaBN.multipliedBy(multiplier)
                : mantissaBN.dividedBy(multiplier);
            amountStr = result.toFixed(0);
          }
          const assetAmount = new BN(amountStr);
          assetMap.set(asset.address, currentAmount.plus(assetAmount));
        }

        // Convert back to array, preserving precision
        migrationAssets.erc20 = Array.from(assetMap.entries()).map(([address, totalAmount]) => {
          // For FLOW token, truncate to 8 decimal places
          if (address === '0x0000000000000000000000000000000000000000') {
            const truncated = totalAmount.dp(8, BN.ROUND_DOWN);
            return {
              address,
              amount: truncated.toFixed(8), // Use toFixed to avoid scientific notation
            };
          }
          // For other tokens, use toFixed(0) to ensure integer string without scientific notation
          return {
            address,
            amount: totalAmount.toFixed(0),
          };
        });

        // Log if duplicates were found and merged
        if (duplicateAddresses.size > 0) {
          const duplicateInfo = Array.from(duplicateAddresses).map((address) => ({
            address: address === '0x0000000000000000000000000000000000000000' ? 'FLOW' : address,
            mergedAmount: assetMap.get(address)?.toString(),
          }));
          console.log('[PlatformBridge] Duplicate tokens merged (enhancedPlatform):', {
            beforeCount: beforeDedupCount,
            afterCount: migrationAssets.erc20.length,
            duplicatesFound: duplicateAddresses.size,
            duplicateTokens: duplicateInfo,
          });
        }

        // Log all processed ERC20 assets
        logger.debug(
          '[PlatformBridge] Processed ERC20 assets:',
          migrationAssets.erc20.map((asset) => ({
            address: asset.address,
            amount: asset.amount,
            amountType: typeof asset.amount,
            isValidNumber: !isNaN(parseFloat(asset.amount)),
          }))
        );
      }

      // Convert NFTs from EVM NFT collections (only if source address is EVM)
      if (isEvmAddress && evmNftCollections && evmNftCollections.length > 0) {
        console.log('[PlatformBridge] ===== ALL NFT COLLECTIONS DATA =====');
        console.log('[PlatformBridge] Total collections:', evmNftCollections.length);
        evmNftCollections.forEach((collection, index) => {
          console.log(`[PlatformBridge] Collection ${index}:`, {
            collection: collection.collection,
            ids: collection.ids,
            count: collection.count,
            fullCollection: JSON.stringify(collection, null, 2),
          });
        });

        // Fetch actual NFTs from each collection to get real IDs (like send NFT does)
        for (const collectionData of evmNftCollections) {
          const contractAddress =
            collectionData.collection.evmAddress || collectionData.collection.address;
          if (!contractAddress || !contractAddress.startsWith('0x')) {
            console.warn('[PlatformBridge] Skipping collection with invalid address', {
              evmAddress: collectionData.collection.evmAddress,
              address: collectionData.collection.address,
            });
            continue;
          }

          // Check if this is ERC721 or ERC1155 based on contractType
          const contractType = (collectionData.collection as any).contractType;
          const isERC1155 = contractType === 'ERC1155';

          console.log('[PlatformBridge] Processing collection:', {
            contractAddress,
            contractType,
            isERC1155,
            idsFromCollection: collectionData.ids,
            idsLength: collectionData.ids?.length || 0,
            count: collectionData.count,
            collectionName: collectionData.collection.name,
            fullCollection: collectionData,
          });

          try {
            // Fetch actual NFTs from the collection to get real IDs (similar to send NFT process)
            const collectionModel: CollectionModel = {
              ...collectionData.collection,
              type: 'evm' as any,
              count: collectionData.count,
              // Convert path format if needed
              path: collectionData.collection.path
                ? {
                    storage_path: collectionData.collection.path.storagePath || '',
                    public_path: collectionData.collection.path.publicPath || '',
                    private_path: collectionData.collection.path.publicPath || '',
                  }
                : undefined,
            };

            console.log('[PlatformBridge] Fetching NFTs from collection to get real IDs:', {
              contractAddress,
              collectionId: collectionModel.id,
              collectionName: collectionModel.name,
              count: collectionModel.count,
            });

            const nfts = await tokenQueries.fetchAllNFTsFromCollection(
              sourceAddress,
              collectionModel,
              network || 'mainnet',
              collectionModel.count
            );

            console.log('[PlatformBridge] Fetched NFTs from collection:', {
              contractAddress,
              nftCount: nfts.length,
              nfts: nfts.map((nft) => ({
                id: nft.id,
                name: nft.name,
                contractAddress: nft.contractAddress || nft.evmAddress,
                contractType: nft.contractType,
              })),
            });

            if (nfts && nfts.length > 0) {
              // Extract IDs from actual NFTs - filter out undefined, deprecated, and N/A
              const nftIds = nfts
                .map((nft) => nft.id)
                .filter((id): id is string => !!id && id !== 'deprecated' && id !== 'N/A');

              console.log('[PlatformBridge] Extracted NFT IDs from fetched NFTs:', {
                contractAddress,
                totalNFTs: nfts.length,
                validIds: nftIds.length,
                ids: nftIds,
              });

              if (nftIds.length > 0) {
                if (isERC1155) {
                  // For ERC1155, we need amount per ID
                  // Get amount from NFT model if available, otherwise default to 1
                  migrationAssets.erc1155.push(
                    ...nftIds.map((id) => ({
                      address: contractAddress,
                      id: id,
                      amount: nfts.find((nft) => nft.id === id)?.amount || '1',
                    }))
                  );
                } else {
                  // For ERC721, just IDs
                  migrationAssets.erc721.push(
                    ...nftIds.map((id) => ({
                      address: contractAddress,
                      id: id,
                    }))
                  );
                }
              } else {
                console.warn('[PlatformBridge] No valid IDs extracted from fetched NFTs', {
                  contractAddress,
                  nftCount: nfts.length,
                });
              }
            } else {
              console.warn('[PlatformBridge] No NFTs fetched from collection', {
                contractAddress,
                count: collectionModel.count,
                collectionId: collectionModel.id,
              });
            }
          } catch (error) {
            console.error('[PlatformBridge] Error fetching NFTs from collection:', {
              contractAddress,
              error,
              collection: collectionData.collection,
            });
            logger.error('[PlatformBridge] Failed to fetch NFTs from collection', {
              contractAddress,
              error,
            });
            // Continue to next collection instead of failing completely
          }
        }
      }

      logger.debug('[PlatformBridge] Migration assets prepared', {
        erc20: migrationAssets.erc20.length,
        erc721: migrationAssets.erc721.length,
        erc1155: migrationAssets.erc1155.length,
      });

      // Final validation - check all amounts are valid and log all assets
      console.log('[PlatformBridge] ===== ALL MIGRATION ASSETS =====');
      console.log('[PlatformBridge] ERC20 Assets:', JSON.stringify(migrationAssets.erc20, null, 2));
      console.log(
        '[PlatformBridge] ERC721 Assets:',
        JSON.stringify(migrationAssets.erc721, null, 2)
      );
      console.log(
        '[PlatformBridge] ERC1155 Assets:',
        JSON.stringify(migrationAssets.erc1155, null, 2)
      );

      const invalidAssets: Array<{ type: string; address: string; amount?: string; id?: string }> =
        [];
      migrationAssets.erc20.forEach((asset) => {
        if (
          asset.amount === 'deprecated' ||
          asset.amount === 'N/A' ||
          asset.amount === 'null' ||
          asset.amount === 'undefined' ||
          isNaN(parseFloat(asset.amount))
        ) {
          invalidAssets.push({ type: 'erc20', address: asset.address, amount: asset.amount });
        }
      });
      migrationAssets.erc721.forEach((asset) => {
        if (
          asset.id === 'deprecated' ||
          asset.id === 'N/A' ||
          asset.id === 'null' ||
          asset.id === 'undefined' ||
          asset.id === '' ||
          isNaN(parseFloat(asset.id))
        ) {
          invalidAssets.push({ type: 'erc721', address: asset.address, id: asset.id });
        }
      });
      migrationAssets.erc1155.forEach((asset) => {
        if (
          asset.amount === 'deprecated' ||
          asset.amount === 'N/A' ||
          asset.amount === 'null' ||
          asset.amount === 'undefined' ||
          isNaN(parseFloat(asset.amount))
        ) {
          invalidAssets.push({ type: 'erc1155', address: asset.address, amount: asset.amount });
        }
        if (
          asset.id === 'deprecated' ||
          asset.id === 'N/A' ||
          asset.id === 'null' ||
          asset.id === 'undefined' ||
          asset.id === '' ||
          isNaN(parseFloat(asset.id))
        ) {
          invalidAssets.push({ type: 'erc1155', address: asset.address, id: asset.id });
        }
      });

      if (invalidAssets.length > 0) {
        console.error(
          '[PlatformBridge] ⚠️ Found invalid assets with non-numeric amounts:',
          invalidAssets
        );
        logger.error(
          '[PlatformBridge] Found invalid assets with non-numeric amounts:',
          invalidAssets
        );
        // Filter out invalid assets
        migrationAssets.erc20 = migrationAssets.erc20.filter(
          (asset) =>
            asset.amount !== 'deprecated' &&
            asset.amount !== 'N/A' &&
            asset.amount !== 'null' &&
            asset.amount !== 'undefined' &&
            !isNaN(parseFloat(asset.amount))
        );
        migrationAssets.erc721 = migrationAssets.erc721.filter(
          (asset) =>
            asset.id !== 'deprecated' &&
            asset.id !== 'N/A' &&
            asset.id !== 'null' &&
            asset.id !== 'undefined' &&
            asset.id !== '' &&
            !isNaN(parseFloat(asset.id))
        );
        migrationAssets.erc1155 = migrationAssets.erc1155.filter(
          (asset) =>
            asset.amount !== 'deprecated' &&
            asset.amount !== 'N/A' &&
            asset.amount !== 'null' &&
            asset.amount !== 'undefined' &&
            !isNaN(parseFloat(asset.amount)) &&
            asset.id !== 'deprecated' &&
            asset.id !== 'N/A' &&
            asset.id !== 'null' &&
            asset.id !== 'undefined' &&
            asset.id !== '' &&
            !isNaN(parseFloat(asset.id))
        );
        console.log(
          '[PlatformBridge] Filtered assets - ERC20:',
          migrationAssets.erc20.length,
          'ERC1155:',
          migrationAssets.erc1155.length
        );
      }

      console.log('[PlatformBridge] ===== FINAL VALIDATED ASSETS =====');
      console.log('[PlatformBridge] ERC20:', JSON.stringify(migrationAssets.erc20, null, 2));
      console.log('[PlatformBridge] ERC721:', JSON.stringify(migrationAssets.erc721, null, 2));
      console.log('[PlatformBridge] ERC1155:', JSON.stringify(migrationAssets.erc1155, null, 2));

      return migrationAssets;
    };

    enhancedPlatform.getWalletAccounts = async () => {
      const accountsArray: any[] = [];

      // Add all main wallet accounts from walletList (this includes all 18 accounts)
      if (Array.isArray(walletList) && walletList.length > 0) {
        walletList.forEach((account) => {
          const accountName = account.name || 'Main Account';
          accountsArray.push({
            address: account.address,
            name: accountName,
            type: 'main',
            balance: '0',
            avatar: account.icon || '', // Use icon as avatar
            emoji: account.icon || '', // Use icon as emoji
            emojiInfo: {
              emoji: account.icon || '',
              name: accountName,
              color: account.color || '#6B7280',
            },
            isActive: account.address === mainAddress,
          });
        });
      }

      // Add EVM account if available
      if (evmWallet && evmWallet.address) {
        const evmName = evmWallet.name || 'EVM Account';
        accountsArray.push({
          address: evmWallet.address,
          name: evmName,
          type: 'evm',
          balance: '0',
          avatar: evmWallet.icon || '', // Use icon as avatar
          emoji: evmWallet.icon || '', // Use icon as emoji
          emojiInfo: {
            emoji: evmWallet.icon || '',
            name: evmName,
            color: evmWallet.color || '#6B7280',
          },
          parentAddress: mainAddress,
          isActive: false,
        });
      }

      // Add child accounts if available
      if (Array.isArray(childAccounts) && childAccounts.length > 0) {
        childAccounts.forEach((account) => {
          const childName = account.name || 'Child Account';
          accountsArray.push({
            address: account.address,
            name: childName,
            type: 'child',
            balance: '0',
            avatar: account.icon || '', // Use icon as avatar
            emoji: account.icon || '', // Use icon as emoji
            emojiInfo: {
              emoji: account.icon || '',
              name: childName,
              color: account.color || '#6B7280',
            },
            parentEmoji: evmWallet?.icon || '', // Use icon as emoji
            isActive: false,
            parentAddress: mainAddress,
          });
        });
      }

      // Add current wallet if it's not already present and different from main
      if (
        currentWallet &&
        currentWallet.address !== mainAddress &&
        !accountsArray.find((acc) => acc.address === currentWallet.address)
      ) {
        const accountType = isEvmAddress ? 'evm' : 'main';

        const currentName = currentWallet.name || 'Current Account';
        accountsArray.push({
          address: currentWallet.address,
          name: currentName,
          type: accountType,
          balance: '0',
          avatar: currentWallet.icon || '',
          emoji: currentWallet.icon || '',
          emojiInfo: {
            emoji: currentWallet.icon || '',
            name: currentName,
            color: currentWallet.color || '#6B7280',
          },
          parentAddress: isEvmAddress ? mainAddress : undefined,
        });
      }

      return {
        accounts: accountsArray,
        total: accountsArray.length,
      };
    };

    enhancedPlatform.getWalletProfiles = async () => {
      const profilesArray: any[] = [];

      // Get all profile IDs from the keyring
      const allProfileIds = profileIds || [];

      // For each profile, get the specific data
      for (const profileId of allProfileIds) {
        try {
          // Get user info for this specific profile from cache
          const profileUserInfo = (await getCachedData(userInfoCachekey(profileId))) || {};

          // Get the public key for this profile from keyring
          const keyringState = (await getLocalData(KEYRING_STATE_V3_KEY)) as KeyringStateV3 | null;
          const profileVaultEntry = keyringState?.vault?.find(
            (entry: VaultEntryV3) => entry.id === profileId
          );
          const profilePublicKey = profileVaultEntry?.publicKey;

          if (!profilePublicKey) {
            logger.warn(`No public key found for profile ${profileId}`);
            continue;
          }

          // Get accounts for this specific profile using the public key
          const profileMainAccounts =
            (await getCachedMainAccounts(network, profilePublicKey)) || [];

          // Create accounts array for this profile
          const profileAccounts: any[] = [];

          // Add EOA account at the top of each profile (only once per profile)
          if (Array.isArray(profileMainAccounts) && profileMainAccounts.length > 0) {
            const firstAccount = profileMainAccounts[0];
            if (firstAccount.eoaAccount?.address) {
              const eoaName = firstAccount.eoaAccount.name || 'EOA Account';
              profileAccounts.push({
                address: firstAccount.eoaAccount.address,
                name: eoaName,
                type: 'eoa',
                balance: '0',
                avatar: firstAccount.eoaAccount.icon || '',
                emoji: firstAccount.eoaAccount.icon || '',
                emojiInfo: {
                  emoji: firstAccount.eoaAccount.icon || '',
                  name: eoaName,
                  color: firstAccount.eoaAccount.color || '#6B7280',
                },
                isActive: false,
              });
            }
          }

          // Add main wallet accounts
          if (Array.isArray(profileMainAccounts) && profileMainAccounts.length > 0) {
            profileMainAccounts.forEach((account) => {
              const accountName = account.name || 'Main Account';
              profileAccounts.push({
                address: account.address,
                name: accountName,
                type: 'main',
                balance: '0',
                avatar: account.icon || '', // Use icon as avatar
                emoji: account.icon || '', // Use icon as emoji
                emojiInfo: {
                  emoji: account.icon || '',
                  name: accountName,
                  color: account.color || '#6B7280',
                },
                isActive: false, // Only current profile's main address is active
              });
              if (account.evmAccount?.address && account.evmAccount.hasAssets !== false) {
                const evmName = account.evmAccount.name || 'EVM Account';
                profileAccounts.push({
                  address: account.evmAccount.address,
                  name: evmName,
                  type: 'evm',
                  balance: '0',
                  avatar: account.evmAccount.icon || '',
                  emoji: account.evmAccount.icon || '',
                  emojiInfo: {
                    emoji: account.evmAccount.icon || '',
                    name: evmName,
                    color: account.evmAccount.color || '#6B7280',
                  },
                  parentEmoji: {
                    emoji: account?.icon || '',
                    name: account?.name || '',
                    color: account?.color || '#6B7280',
                  },
                  isActive: false,
                });
              }

              // Add child accounts for this main account if they exist
              if (Array.isArray(account.childAccounts) && account.childAccounts.length > 0) {
                account.childAccounts.forEach((childAccount) => {
                  const childName = childAccount.name || 'Child Account';
                  profileAccounts.push({
                    address: childAccount.address,
                    name: childName,
                    type: 'child',
                    balance: '0',
                    avatar: childAccount.icon || '',
                    emoji: childAccount.icon || '',
                    emojiInfo: undefined,
                    parentEmoji: {
                      emoji: account?.icon || '',
                      name: account?.name || '',
                      color: account?.color || '#6B7280',
                    },
                    isActive: false,
                  });
                });
              }
            });
          }

          if (profileAccounts.length > 0) {
            // Create profile object with the specific data
            const profile = {
              name:
                (profileUserInfo as any)?.nickname ||
                (profileUserInfo as any)?.username ||
                `Profile ${profileId}`,
              avatar: (profileUserInfo as any)?.avatar || '',
              uid: profileId,
              accounts: profileAccounts,
            };
            profilesArray.push(profile);
          }
        } catch (error) {
          logger.warn(`Failed to get data for profile ${profileId}:`, error);
        }
      }

      return {
        profiles: profilesArray,
      };
    };

    enhancedPlatform.getSelectedAccount = async () => {
      if (!currentWallet) {
        throw new Error('No selected account available');
      }

      // Determine account type based on address format
      const selectedName = currentWallet.name || 'My Account';
      let emojiInfo;
      let parentEmoji;
      if (activeAccountType === 'child') {
        emojiInfo = undefined;
        parentEmoji = {
          emoji: parentWallet.icon || '',
          name: parentWallet.name,
          color: parentWallet.color || '#6B7280',
        };
      } else {
        emojiInfo = {
          emoji: currentWallet.icon || '',
          name: selectedName,
          color: currentWallet.color || '#6B7280',
        };
      }
      return {
        address: currentWallet.address,
        name: selectedName,
        type: activeAccountType,
        balance: '0',
        avatar: currentWallet.icon || '',
        emoji: currentWallet.icon || '',
        emojiInfo,
        parentAddress: mainAddress,
        parentEmoji,
      };
    };

    // Add currency override to enhanced platform
    enhancedPlatform.getCurrency = () => {
      if (currency && coins && coins.length > 0) {
        const price = new BN(coins[0].price || 0);
        const priceInUSD = new BN(coins[0].priceInUSD || 1);
        const rate = price.div(priceInUSD).toString();
        return {
          name: currency.code,
          symbol: currency.symbol,
          rate: rate,
        };
      } else {
        return {
          name: 'USD',
          symbol: '$',
          rate: '1',
        };
      }
    };

    // Always reinitialize ServiceContext when data changes
    ServiceContext.initialize(enhancedPlatform);
  }, [platform, coins, userWallets, currentWallet, currency]);

  // Keep platform synchronized with extension state
  useEffect(() => {
    platform.setCurrentNetwork(network);
  }, [platform, network]);

  useEffect(() => {
    const address = currentWallet?.address || null;
    platform.setCurrentAddress(address);
  }, [platform, currentWallet?.address]);

  useEffect(() => {
    platform.setWalletController(wallet);
  }, [platform, wallet]);

  // Sync send store fromAccount when currentWallet changes
  useEffect(() => {
    if (currentWallet && currentWallet.address) {
      // Convert currentWallet to WalletAccount format for send store
      let nftCount = 0;
      if (isEvmAddress) {
        nftCount =
          evmNftCollections?.reduce((total, collection) => {
            return total + (collection.count || 0);
          }, 0) || 0;
      } else {
        nftCount =
          cadenceNftCollections?.reduce((total, collection) => {
            return total + (collection.count || 0);
          }, 0) || 0;
      }

      const walletAccount: WalletAccount = {
        name: currentWallet.name || 'Unnamed Account',
        address: currentWallet.address,
        avatar: currentWallet.icon || '',
        emojiInfo: {
          emoji: currentWallet.icon || '',
          color: currentWallet.color || '#6B7280',
          name: currentWallet.name || 'Unnamed Account',
        },
        type: activeAccountType === 'none' ? 'main' : activeAccountType, // Default type for extension accounts
        isActive: true,
        id: currentWallet.address,
        nfts: `${nftCount} NFT${nftCount !== 1 ? 's' : ''}`,
      };

      if (fromAccount?.address !== currentWallet.address) {
        setFromAccount(walletAccount);
        // Check if we're in a send workflow and navigate to dashboard if so
      }
    }
  }, [
    currentWallet,
    fromAccount?.address,
    setFromAccount,
    activeAccountType,
    currentBalance,
    coins,
    evmNftCollections,
    cadenceNftCollections,
  ]);

  // Set up extension navigation
  useEffect(() => {
    extensionNavigation.setNavigateCallback(navigate);
    extensionNavigation.setLocationRef({ current: location });
  }, [navigate, location]);

  // Convenience method to create navigation for screens
  const getNavigation = (
    navigate: (path: string | number, state?: any) => void
  ): NavigationProp => ({
    navigate: (screen: string, params?: Record<string, unknown>) => {
      // Convert screen navigation to router navigation
      switch (screen) {
        case 'SendTokens':
        case 'SendAmount':
          navigate('/dashboard/send/amount', params);
          break;
        case 'SendNFTs':
          navigate('/dashboard/nft/send', params);
          break;
        case 'SendConfirmation':
          navigate('/dashboard/send/confirmation', params);
          break;
        default: {
          // Fallback navigation - convert screen name to route
          const route = screen.toLowerCase().replace(/([A-Z])/g, '-$1');
          navigate(`/dashboard/${route}`, params);
          break;
        }
      }
    },
    goBack: () => navigate(-1),
    canGoBack: () => true,
    reset: (routes: string[]) => {
      if (routes.length > 0) {
        navigate(routes[0]);
      }
    },
    replace: (screen: string, params?: Record<string, unknown>) => {
      navigate(screen, { replace: true, ...params });
    },
    push: (screen: string, params?: Record<string, unknown>) => {
      navigate(screen, params);
    },
    pop: () => navigate(-1),
    getCurrentRoute: () => {
      return {
        name: location.pathname,
        params: location.state,
      };
    },
  });

  // Convenience method to get platform bridge (simplified interface)
  const getBridge = (): PlatformBridge => ({
    getSelectedAddress: () => {
      const platformAddress = platform.getSelectedAddress();

      // Fallback: if platform doesn't have address but currentWallet does, use it
      if (!platformAddress && currentWallet?.address) {
        return currentWallet.address;
      }

      return platformAddress;
    },
    getNetwork: () => platform.getNetwork(),
    getCurrency: () => platform.getCurrency(),
    getCache: (key: string) => {
      // Use the coins data from useCoins hook instead of trying to fetch from platform
      if (key === 'coins') {
        return coins || null;
      }
      return null;
    },
    getSelectedAccount: async () => {
      try {
        return await platform.getSelectedAccount();
      } catch (error) {
        logger.warn('Failed to get selected account from platform:', error);
        throw error;
      }
    },
    getMigrationAssets: async (sourceAddress: string) => {
      console.log('[PlatformBridge] getMigrationAssets called from getBridge', {
        sourceAddress,
        coinsCount: coins?.length || 0,
        nftCollectionsCount: evmNftCollections?.length || 0,
      });

      // Convert coins and NFTs to MigrationAssetsData format
      const migrationAssets: {
        erc20: Array<{ address: string; amount: string }>;
        erc721: Array<{ address: string; id: string }>;
        erc1155: Array<{ address: string; id: string; amount: string }>;
      } = {
        erc20: [],
        erc721: [],
        erc1155: [],
      };

      // Log all coins for debugging
      if (coins && coins.length > 0) {
        console.log(
          '[PlatformBridge] All coins data (getBridge):',
          coins.map((coin) => ({
            address: coin.address,
            symbol: coin.symbol,
            name: coin.name,
            balance: coin.balance,
            rawBalance: (coin as any).rawBalance,
            decimals: coin.decimals,
            contractName: coin.contractName,
            flowIdentifier: (coin as any).flowIdentifier,
            unit: coin.unit,
          }))
        );

        // Specifically identify and log all potential FLOW tokens
        const potentialFlowTokens = coins.filter((coin) => {
          const isFlowToken =
            coin.contractName?.toLowerCase() === 'flowtoken' ||
            (coin as any).flowIdentifier?.includes('FlowToken') ||
            coin.symbol?.toLowerCase() === 'flow' ||
            coin.unit?.toLowerCase() === 'flow';
          return isFlowToken;
        });

        if (potentialFlowTokens.length > 0) {
          console.log('[PlatformBridge] ===== POTENTIAL FLOW TOKENS FOUND =====');
          potentialFlowTokens.forEach((coin, index) => {
            const matchReasons: string[] = [];
            if (coin.contractName?.toLowerCase() === 'flowtoken') matchReasons.push('contractName');
            if ((coin as any).flowIdentifier?.includes('FlowToken'))
              matchReasons.push('flowIdentifier');
            if (coin.symbol?.toLowerCase() === 'flow') matchReasons.push('symbol');
            if (coin.unit?.toLowerCase() === 'flow') matchReasons.push('unit');

            // Check if this is the stFlowToken.Vault Cadence token
            const isStFlowTokenVault =
              coin.address &&
              (coin.address.includes('stFlowToken') ||
                coin.address.includes('Vault') ||
                coin.address.includes('A.d6f80565193ad727'));

            if (isStFlowTokenVault) {
              console.log(
                `[PlatformBridge] ⚠️⚠️⚠️ CADENCE TOKEN DETECTED: stFlowToken.Vault or similar ⚠️⚠️⚠️`
              );
              console.log(
                `[PlatformBridge] This is a CADENCE token (NOT EVM) - should be EXCLUDED from migration`
              );
            }

            console.log(
              `[PlatformBridge] FLOW Token ${index + 1} - Match Reasons:`,
              matchReasons.join(', ')
            );
            console.log(
              `[PlatformBridge] FLOW Token ${index + 1} - Is Cadence Token:`,
              isStFlowTokenVault
            );
            console.log(
              `[PlatformBridge] FLOW Token ${index + 1} - FULL COIN OBJECT:`,
              JSON.stringify(coin, null, 2)
            );
            console.log(`[PlatformBridge] FLOW Token ${index + 1} - Summary:`, {
              address: coin.address,
              symbol: coin.symbol,
              name: coin.name,
              balance: coin.balance,
              rawBalance: (coin as any).rawBalance,
              contractName: coin.contractName,
              flowIdentifier: (coin as any).flowIdentifier,
              unit: coin.unit,
              decimals: coin.decimals,
              id: (coin as any).id,
              isCadenceToken: isStFlowTokenVault,
            });
          });
          console.log('[PlatformBridge] ===== END POTENTIAL FLOW TOKENS =====');
        }
      }

      // Convert ERC20 tokens from coins (only tokens with balance > 0)
      if (coins && coins.length > 0) {
        migrationAssets.erc20 = coins
          .filter((coin) => {
            // Only include tokens with balance > 0
            const balanceStr = coin.balance || '0';
            if (
              balanceStr === 'deprecated' ||
              balanceStr === 'N/A' ||
              balanceStr === 'null' ||
              balanceStr === 'undefined'
            ) {
              return false;
            }
            const balance = parseFloat(balanceStr);
            if (isNaN(balance) || balance <= 0) {
              return false;
            }

            // If token has EVM address, include it as ERC20
            if (coin.address && coin.address.startsWith('0x')) {
              return true;
            }

            // If no EVM address, check if it's FLOW token (we'll set zero address for it)
            const isFlowToken =
              coin.contractName?.toLowerCase() === 'flowtoken' ||
              (coin as any).flowIdentifier?.includes('FlowToken') ||
              coin.symbol?.toLowerCase() === 'flow' ||
              coin.unit?.toLowerCase() === 'flow';

            // Only allow FLOW token if it doesn't have EVM address
            return isFlowToken;
          })
          .map((coin) => {
            const tokenAddress = coin.address || '';
            let amount: string;

            // If token has EVM address, treat as ERC20
            if (tokenAddress.startsWith('0x')) {
              // For ERC20 tokens, use the balance as-is (or convert if needed)
              let balanceStr = coin.balance || '0';

              // Convert scientific notation to fixed notation if present (preserve precision)
              if (balanceStr.includes('e+') || balanceStr.includes('e-')) {
                // Parse scientific notation manually to preserve precision
                const [mantissa, exponent] = balanceStr.toLowerCase().split('e');
                const exp = parseInt(exponent, 10);

                // Count decimal places in mantissa
                const decimalIndex = mantissa.indexOf('.');
                const decimalPlaces = decimalIndex >= 0 ? mantissa.length - decimalIndex - 1 : 0;

                // Remove decimal point and create integer mantissa
                const integerMantissa = mantissa.replace('.', '');
                const mantissaBN = new BN(integerMantissa);

                // Calculate final exponent: original exponent - decimal places
                const finalExp = exp - decimalPlaces;

                // Multiply by 10^finalExp
                const multiplier = new BN(10).pow(Math.abs(finalExp));
                const result =
                  finalExp >= 0
                    ? mantissaBN.multipliedBy(multiplier)
                    : mantissaBN.dividedBy(multiplier);
                balanceStr = result.toFixed(0);
              }

              amount = balanceStr;
              return {
                address: tokenAddress,
                amount: amount,
              };
            }

            // If no EVM address, check if it's FLOW token (we'll set zero address for it)
            const isFlowToken =
              coin.contractName?.toLowerCase() === 'flowtoken' ||
              (coin as any).flowIdentifier?.includes('FlowToken') ||
              coin.symbol?.toLowerCase() === 'flow' ||
              coin.unit?.toLowerCase() === 'flow';

            if (isFlowToken) {
              const balanceStr = coin.balance || '0';
              if (
                balanceStr === 'deprecated' ||
                balanceStr === 'N/A' ||
                balanceStr === 'null' ||
                balanceStr === 'undefined' ||
                isNaN(parseFloat(balanceStr))
              ) {
                return null;
              }

              // Truncate to 8 decimal places (not round) to preserve precision
              const balanceBN = new BN(balanceStr);
              const truncated = balanceBN.dp(8, BN.ROUND_DOWN);
              amount = truncated.toString();

              return {
                address: '0x0000000000000000000000000000000000000000',
                amount: amount,
              };
            }

            // If no EVM address and not FLOW token, exclude it
            return null;
          })
          .filter((asset): asset is { address: string; amount: string } => asset !== null);

        // Deduplicate assets by address and sum amounts
        // This handles cases where multiple coin entries map to the same token (e.g., multiple FLOW entries)
        const beforeDedupCount = migrationAssets.erc20.length;
        const assetMap = new Map<string, BN>();
        const duplicateAddresses = new Set<string>();

        for (const asset of migrationAssets.erc20) {
          if (assetMap.has(asset.address)) {
            // Found duplicate address
            duplicateAddresses.add(asset.address);
          }
          const currentAmount = assetMap.get(asset.address) || new BN(0);
          // Convert scientific notation to fixed notation before creating BigNumber
          let amountStr = asset.amount;
          if (
            typeof amountStr === 'string' &&
            (amountStr.includes('e+') || amountStr.includes('e-'))
          ) {
            // Parse scientific notation manually to preserve precision
            // Format: "1.625083655084202e+24" -> mantissa * 10^exponent
            const [mantissa, exponent] = amountStr.toLowerCase().split('e');
            const exp = parseInt(exponent, 10);

            // Count decimal places in mantissa
            const decimalIndex = mantissa.indexOf('.');
            const decimalPlaces = decimalIndex >= 0 ? mantissa.length - decimalIndex - 1 : 0;

            // Remove decimal point and create integer mantissa
            const integerMantissa = mantissa.replace('.', '');
            const mantissaBN = new BN(integerMantissa);

            // Calculate final exponent: original exponent - decimal places
            const finalExp = exp - decimalPlaces;

            // Multiply by 10^finalExp
            const multiplier = new BN(10).pow(Math.abs(finalExp));
            const result =
              finalExp >= 0
                ? mantissaBN.multipliedBy(multiplier)
                : mantissaBN.dividedBy(multiplier);
            amountStr = result.toFixed(0);
          }
          const assetAmount = new BN(amountStr);
          assetMap.set(asset.address, currentAmount.plus(assetAmount));
        }

        // Convert back to array, preserving precision
        migrationAssets.erc20 = Array.from(assetMap.entries()).map(([address, totalAmount]) => {
          // For FLOW token, truncate to 8 decimal places
          if (address === '0x0000000000000000000000000000000000000000') {
            const truncated = totalAmount.dp(8, BN.ROUND_DOWN);
            return {
              address,
              amount: truncated.toFixed(8), // Use toFixed to avoid scientific notation
            };
          }
          // For other tokens, use toFixed(0) to ensure integer string without scientific notation
          return {
            address,
            amount: totalAmount.toFixed(0),
          };
        });

        // Log if duplicates were found and merged
        if (duplicateAddresses.size > 0) {
          const duplicateInfo = Array.from(duplicateAddresses).map((address) => ({
            address: address === '0x0000000000000000000000000000000000000000' ? 'FLOW' : address,
            mergedAmount: assetMap.get(address)?.toString(),
          }));
          console.log('[PlatformBridge] Duplicate tokens merged (getBridge)', {
            beforeCount: beforeDedupCount,
            afterCount: migrationAssets.erc20.length,
            duplicatesFound: duplicateAddresses.size,
            duplicateTokens: duplicateInfo,
          });
        }

        // Comprehensive FT logging before returning
        console.log('[PlatformBridge] ===== FINAL FT TOKENS TO BE MIGRATED =====');
        console.log(
          `[PlatformBridge] Total FT tokens after processing: ${migrationAssets.erc20.length}`
        );
        if (migrationAssets.erc20.length > 0) {
          console.log('[PlatformBridge] Complete FT token list:');
          migrationAssets.erc20.forEach((token, index) => {
            const isFlow = token.address === '0x0000000000000000000000000000000000000000';
            const symbol = isFlow ? 'FLOW' : token.address;
            console.log(`  [${index + 1}] FT Token:`);
            console.log(`      Symbol/Identifier: ${symbol}`);
            console.log(`      Contract Address: ${token.address}`);
            console.log(`      Amount: ${token.amount}`);
            console.log(`      Amount (parsed): ${parseFloat(token.amount)}`);
            console.log(`      Is FLOW: ${isFlow}`);
            console.log(`      Full Token Object:`, JSON.stringify(token, null, 2));
          });

          // Summary statistics
          const flowTokens = migrationAssets.erc20.filter(
            (t) => t.address === '0x0000000000000000000000000000000000000000'
          );
          const erc20Tokens = migrationAssets.erc20.filter(
            (t) => t.address !== '0x0000000000000000000000000000000000000000'
          );

          console.log('[PlatformBridge] FT Summary Statistics:');
          console.log(`  - FLOW tokens: ${flowTokens.length}`);
          if (flowTokens.length > 0) {
            const totalFlow = flowTokens.reduce((sum, token) => {
              return sum + parseFloat(token.amount || '0');
            }, 0);
            console.log(`  - Total FLOW amount: ${totalFlow}`);
            flowTokens.forEach((token, idx) => {
              console.log(`    FLOW ${idx + 1}: ${token.amount}`);
            });
          }
          console.log(`  - ERC20 tokens: ${erc20Tokens.length}`);
          erc20Tokens.forEach((token, idx) => {
            console.log(`    ERC20 ${idx + 1}: ${token.address} = ${token.amount}`);
          });
        } else {
          console.log('[PlatformBridge] ⚠️ WARNING: No FT tokens found to migrate!');
        }
        console.log('[PlatformBridge] ===== END FINAL FT TOKENS =====');
      }

      // Convert NFTs from EVM NFT collections (only if source address is EVM)
      if (isEvmAddress && evmNftCollections && evmNftCollections.length > 0) {
        console.log('[PlatformBridge] ===== ALL NFT COLLECTIONS DATA (getBridge) =====');
        console.log('[PlatformBridge] Total collections:', evmNftCollections.length);
        evmNftCollections.forEach((collection, index) => {
          console.log(`[PlatformBridge] Collection ${index} (getBridge):`, {
            collection: collection.collection,
            ids: collection.ids,
            count: collection.count,
            fullCollection: JSON.stringify(collection, null, 2),
          });
        });

        // Fetch actual NFTs from each collection to get real IDs (like send NFT does)
        for (const collectionData of evmNftCollections) {
          const contractAddress =
            collectionData.collection.evmAddress || collectionData.collection.address;
          if (!contractAddress || !contractAddress.startsWith('0x')) {
            console.warn('[PlatformBridge] Skipping collection with invalid address (getBridge)', {
              evmAddress: collectionData.collection.evmAddress,
              address: collectionData.collection.address,
            });
            continue;
          }

          // Check if this is ERC721 or ERC1155 based on contractType
          const contractType = (collectionData.collection as any).contractType;
          const isERC1155 = contractType === 'ERC1155';

          console.log('[PlatformBridge] Processing collection (getBridge):', {
            contractAddress,
            contractType,
            isERC1155,
            idsFromCollection: collectionData.ids,
            idsLength: collectionData.ids?.length || 0,
            count: collectionData.count,
            collectionName: collectionData.collection.name,
            fullCollection: collectionData,
          });

          try {
            // Fetch actual NFTs from the collection to get real IDs (similar to send NFT process)
            const collectionModel: CollectionModel = {
              ...collectionData.collection,
              type: 'evm' as any,
              count: collectionData.count,
              // Convert path format if needed
              path: collectionData.collection.path
                ? {
                    storage_path: collectionData.collection.path.storagePath || '',
                    public_path: collectionData.collection.path.publicPath || '',
                    private_path: collectionData.collection.path.publicPath || '',
                  }
                : undefined,
            };

            console.log(
              '[PlatformBridge] Fetching NFTs from collection to get real IDs (getBridge):',
              {
                contractAddress,
                collectionId: collectionModel.id,
                collectionName: collectionModel.name,
                count: collectionModel.count,
              }
            );

            const nfts = await tokenQueries.fetchAllNFTsFromCollection(
              sourceAddress,
              collectionModel,
              network || 'mainnet',
              collectionModel.count
            );

            console.log('[PlatformBridge] Fetched NFTs from collection (getBridge):', {
              contractAddress,
              nftCount: nfts.length,
              nfts: nfts.map((nft) => ({
                id: nft.id,
                name: nft.name,
                contractAddress: nft.contractAddress || nft.evmAddress,
                contractType: nft.contractType,
              })),
            });

            if (nfts && nfts.length > 0) {
              // Extract IDs from actual NFTs - filter out undefined, deprecated, and N/A
              const nftIds = nfts
                .map((nft) => nft.id)
                .filter((id): id is string => !!id && id !== 'deprecated' && id !== 'N/A');

              console.log('[PlatformBridge] Extracted NFT IDs from fetched NFTs (getBridge):', {
                contractAddress,
                totalNFTs: nfts.length,
                validIds: nftIds.length,
                ids: nftIds,
              });

              if (nftIds.length > 0) {
                if (isERC1155) {
                  // For ERC1155, we need amount per ID
                  // Get amount from NFT model if available, otherwise default to 1
                  migrationAssets.erc1155.push(
                    ...nftIds.map((id) => ({
                      address: contractAddress,
                      id: id,
                      amount: nfts.find((nft) => nft.id === id)?.amount || '1',
                    }))
                  );
                } else {
                  // For ERC721, just IDs
                  migrationAssets.erc721.push(
                    ...nftIds.map((id) => ({
                      address: contractAddress,
                      id: id,
                    }))
                  );
                }
              } else {
                console.warn(
                  '[PlatformBridge] No valid IDs extracted from fetched NFTs (getBridge)',
                  {
                    contractAddress,
                    nftCount: nfts.length,
                  }
                );
              }
            } else {
              console.warn('[PlatformBridge] No NFTs fetched from collection (getBridge)', {
                contractAddress,
                count: collectionModel.count,
                collectionId: collectionModel.id,
              });
            }
          } catch (error) {
            console.error('[PlatformBridge] Error fetching NFTs from collection (getBridge):', {
              contractAddress,
              error,
              collection: collectionData.collection,
            });
            logger.error('[PlatformBridge] Failed to fetch NFTs from collection (getBridge)', {
              contractAddress,
              error,
            });
            // Continue to next collection instead of failing completely
          }
        }
      }

      logger.debug('[PlatformBridge] Migration assets prepared (getBridge)', {
        erc20: migrationAssets.erc20.length,
        erc721: migrationAssets.erc721.length,
        erc1155: migrationAssets.erc1155.length,
      });

      console.log('[PlatformBridge] ===== FINAL MIGRATION ASSETS (getBridge) =====');
      console.log('[PlatformBridge] ERC20:', JSON.stringify(migrationAssets.erc20, null, 2));
      console.log('[PlatformBridge] ERC721:', JSON.stringify(migrationAssets.erc721, null, 2));
      console.log('[PlatformBridge] ERC1155:', JSON.stringify(migrationAssets.erc1155, null, 2));

      return migrationAssets;
    },
  });

  // Convenience method to get translation function
  const getTranslation = (): TranslationFunction => {
    return (key: string, options?: Record<string, unknown>) => {
      // Simple fallback translations for common keys
      const fallbackTranslations: Record<string, string> = {
        'send.title': 'Send',
        'messages.noTokensWithBalance': 'No tokens with balance',
        'messages.loadingAccount': 'Loading account...',
        'messages.loading': 'Loading...',
        'labels.fromAccount': 'From Account',
        'tabs.tokens': 'Tokens',
        'tabs.nfts': 'NFTs',
        'buttons.retry': 'Retry',
        'buttons.refresh': 'Refresh',
        'errors.failedToLoadTokens': 'Failed to load tokens',
        'messages.noNFTCollectionsForAccount': 'No NFT collections for this account',
      };

      // Try chrome i18n first
      const chromeKey = key.replace(/\./g, '__');
      const message = chrome.i18n.getMessage(chromeKey);

      if (message) {
        // Handle string interpolation with options
        if (options && typeof message === 'string') {
          return message.replace(/\{(\w+)\}/g, (match, variable) => {
            return String(options[variable] ?? match);
          });
        }
        return message;
      }

      // Use fallback translations
      const fallback = fallbackTranslations[key];
      if (fallback) {
        if (options && typeof fallback === 'string') {
          return fallback.replace(/\{(\w+)\}/g, (match, variable) => {
            return String(options[variable] ?? match);
          });
        }
        return fallback;
      }

      // Last resort - return the key without brackets
      return key;
    };
  };

  const contextValue: PlatformContextValue = {
    platform,
    getNavigation,
    getBridge,
    getTranslation,
  };

  return <PlatformContext.Provider value={contextValue}>{children}</PlatformContext.Provider>;
};

/**
 * Hook to access the platform context
 */
export const usePlatform = (): PlatformContextValue => {
  const context = useContext(PlatformContext);
  if (!context) {
    throw new Error('usePlatform must be used within a PlatformProvider');
  }
  return context;
};

/**
 * Hooks for specific platform functionality
 */
export const usePlatformSpec = (): PlatformSpec => {
  return usePlatform().platform;
};

export const usePlatformNavigation = (
  navigate: (path: string | number, state?: any) => void
): NavigationProp => {
  return usePlatform().getNavigation(navigate);
};

export const usePlatformBridge = (): PlatformBridge => {
  return usePlatform().getBridge();
};

export const usePlatformTranslation = (): TranslationFunction => {
  return usePlatform().getTranslation();
};
