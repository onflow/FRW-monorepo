import { ServiceContext, type PlatformSpec } from '@onflow/frw-context';
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
  getCoins?(): any[] | null;
};
type TranslationFunction = (key: string) => string;

import { useUserWallets } from '@/ui/hooks/use-account-hooks';
import { useWallet } from '@/ui/hooks/use-wallet';
import { useCoins } from '@/ui/hooks/useCoinHook';
import { useNetwork } from '@/ui/hooks/useNetworkHook';
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
  const { currentWallet } = useProfiles();
  const wallet = useWallet();
  const { coins } = useCoins();
  const navigate = useNavigate();
  const location = useLocation();

  // Initialize platform singleton
  const platform = initializePlatform();

  // Initialize ServiceContext with platform
  useEffect(() => {
    ServiceContext.initialize(platform);
  }, [platform]);

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
    goBack: () => window.history.back(),
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
    pop: () => window.history.back(),
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
