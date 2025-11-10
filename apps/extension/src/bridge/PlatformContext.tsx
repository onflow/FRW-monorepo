import { ServiceContext, type PlatformSpec, logger } from '@onflow/frw-context';
import { initializeI18n } from '@onflow/frw-screens';
import { useSendStore, sendSelectors } from '@onflow/frw-stores';
import { type WalletAccount } from '@onflow/frw-types';
import BN from 'bignumber.js';
import { createContext, useContext, useEffect, useRef, type ReactNode } from 'react';
import { useLocation, useNavigate } from 'react-router';

import { getCachedData } from '@/data-model/cache-data-access';
import { userInfoCachekey, getCachedMainAccounts } from '@/data-model/cache-data-keys';
import { KEYRING_STATE_V3_KEY } from '@/data-model/local-data-keys';
import { getLocalData } from '@/data-model/storage';
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
          const keyringState = (await getLocalData(KEYRING_STATE_V3_KEY)) as any;
          const profileVaultEntry = keyringState?.vault?.find(
            (entry: any) => entry.id === profileId
          );
          const profilePublicKey = profileVaultEntry?.id;

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
              if (account.evmAccount?.address) {
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
