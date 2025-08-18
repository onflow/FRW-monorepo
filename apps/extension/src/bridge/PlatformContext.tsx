import { ServiceProvider, type PlatformSpec } from '@onflow/frw-context';
import type { NavigationProp, PlatformBridge, TranslationFunction } from '@onflow/frw-screens';
import React, { createContext, useContext, useEffect, useMemo, type ReactNode } from 'react';

import { useUserWallets } from '@/ui/hooks/use-account-hooks';
import { useWallet } from '@/ui/hooks/use-wallet';
import { useCoins } from '@/ui/hooks/useCoinHook';
import { useNetwork } from '@/ui/hooks/useNetworkHook';
import { useProfiles } from '@/ui/hooks/useProfileHook';

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
 * Platform provider that initializes the platform implementation,
 * keeps it synchronized with extension state, and provides ServiceProvider
 */
export const PlatformProvider = ({ children }: { children: ReactNode }) => {
  const { network } = useNetwork();
  const userWallets = useUserWallets();
  const { currentWallet } = useProfiles();
  const wallet = useWallet();
  const { coins } = useCoins();

  // Initialize platform implementation
  const platform = useMemo(() => initializePlatform(), []);

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

  // Convenience method to create navigation for screens
  const getNavigation = (navigate: (path: string, state?: any) => void): NavigationProp => ({
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
    getCoins: () => {
      return coins || null;
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

  return (
    <ServiceProvider platform={platform}>
      <PlatformContext.Provider value={contextValue}>{children}</PlatformContext.Provider>
    </ServiceProvider>
  );
};

/**
 * Hook to access the platform context
 * Note: This is different from the usePlatform hook in @onflow/frw-context
 */
export const useExtensionPlatform = (): PlatformContextValue => {
  const context = useContext(PlatformContext);
  if (!context) {
    throw new Error('useExtensionPlatform must be used within a PlatformProvider');
  }
  return context;
};

/**
 * Hooks for specific platform functionality
 */
export const usePlatformSpec = (): PlatformSpec => {
  return useExtensionPlatform().platform;
};

export const usePlatformNavigation = (
  navigate: (path: string, state?: any) => void
): NavigationProp => {
  return useExtensionPlatform().getNavigation(navigate);
};

export const usePlatformBridge = (): PlatformBridge => {
  return useExtensionPlatform().getBridge();
};

export const usePlatformTranslation = (): TranslationFunction => {
  return useExtensionPlatform().getTranslation();
};
