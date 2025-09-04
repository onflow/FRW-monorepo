import { ServiceContext, type PlatformSpec } from '@onflow/frw-context';
import { type WalletAccount } from '@onflow/frw-types';
import React, { createContext, useContext, useEffect, type ReactNode } from 'react';
import { useLocation, useNavigate } from 'react-router';

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
};
type TranslationFunction = (key: string) => string;

import { isValidEthereumAddress } from '@/shared/utils/address';
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
interface PlatformContextValue {
  // Full platform implementation
  platform: PlatformSpec;

  // Convenience methods for screens (extracted from platform)
  getNavigation: (navigate: (path: string, state?: any) => void) => NavigationProp;
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
  const { currentWallet, mainAddress } = useProfiles();
  const wallet = useWallet();
  const { coins } = useCoins();

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
          console.log('🖼️ No NFT collections found, returning null');
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

        console.log(
          '🖼️ Converted NFT collections to CollectionModel format:',
          convertedCollections.length,
          'collections',
          convertedCollections
        );
        return convertedCollections;
      }

      return null;
    };

    enhancedPlatform.getWalletAccounts = async () => {
      // Always ensure there's a main account from mainAddress (parent Flow address)
      const accountsArray: any[] = [];

      // Add main Flow account first (from mainAddress)
      if (mainAddress) {
        accountsArray.push({
          address: mainAddress,
          name: 'Main Account',
          type: 'main',
          balance: '0',
          avatar: currentWallet?.avatar || '',
          emoji: currentWallet?.emoji || '',
          emojiInfo: currentWallet?.emojiInfo || null,
        });
      }

      // Add userWallets accounts if they exist and are different from main
      if (Array.isArray(userWallets)) {
        userWallets.forEach((wallet) => {
          if (!accountsArray.find((acc) => acc.address === wallet.address)) {
            const isEVMWallet = isValidEthereumAddress(wallet.address);
            accountsArray.push({
              ...wallet,
              type: wallet.type || (isEVMWallet ? 'evm' : 'main'),
              parentAddress: isEVMWallet ? mainAddress : undefined,
            });
          }
        });
      }

      // Add current wallet if it's not already present and different from main
      if (
        currentWallet &&
        currentWallet.address !== mainAddress &&
        !accountsArray.find((acc) => acc.address === currentWallet.address)
      ) {
        const accountType = isEvmAddress ? 'evm' : 'main';

        accountsArray.push({
          address: currentWallet.address,
          name: currentWallet.name || 'Current Account',
          type: accountType,
          balance: '0',
          avatar: currentWallet.avatar || '',
          emoji: currentWallet.emoji || '',
          emojiInfo: currentWallet.emojiInfo || null,
          parentAddress: isEvmAddress ? mainAddress : undefined,
        });
      }

      return {
        accounts: accountsArray,
        total: accountsArray.length,
      };
    };

    enhancedPlatform.getSelectedAccount = async () => {
      if (!currentWallet) {
        throw new Error('No selected account available');
      }

      // Determine account type based on address format
      const accountType = isEvmAddress ? 'evm' : 'main';

      return {
        address: currentWallet.address,
        name: currentWallet.name || 'My Account',
        type: accountType,
        balance: '0',
        avatar: currentWallet.avatar || '',
        emoji: currentWallet.emoji || '',
        emojiInfo: currentWallet.emojiInfo || null,
        parentAddress: mainAddress,
      };
    };

    // Always reinitialize ServiceContext when data changes
    ServiceContext.initialize(enhancedPlatform);
    console.log(
      '✅ ServiceContext reinitialized with coins:',
      coins?.length || 'undefined',
      'wallets:',
      userWallets?.length || 'undefined'
    );
  }, [platform, coins, userWallets, currentWallet]);

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

      // Additional fallback: try to get from userWallets if available
      if (!platformAddress && !currentWallet?.address && userWallets?.[0]?.address) {
        return userWallets[0].address;
      }

      return platformAddress;
    },
    getNetwork: () => platform.getNetwork(),
    getCurrency: () => platform.getCurrency(),
    getCache: (key: string) => {
      // Use the coins data from useCoins hook instead of trying to fetch from platform
      console.log(`🪙 PlatformContext getCache(${key}) called, coins data:`, coins);
      if (key === 'coins') {
        return coins || null;
      }
      return null;
    },
    getSelectedAccount: async () => {
      try {
        return await platform.getSelectedAccount();
      } catch (error) {
        console.warn('Failed to get selected account from platform:', error);
        throw error;
      }
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
  navigate: (path: string, state?: any) => void
): NavigationProp => {
  return usePlatform().getNavigation(navigate);
};

export const usePlatformBridge = (): PlatformBridge => {
  return usePlatform().getBridge();
};

export const usePlatformTranslation = (): TranslationFunction => {
  return usePlatform().getTranslation();
};
