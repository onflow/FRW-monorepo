import type { PlatformSpec } from '@onflow/frw-context';
import type { NavigationProp, PlatformBridge, TranslationFunction } from '@onflow/frw-screens';
import React, { createContext, useContext, useEffect, type ReactNode } from 'react';

import { useUserWallets } from '@/ui/hooks/use-account-hooks';
import { useWallet } from '@/ui/hooks/use-wallet';
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
 * Platform provider that initializes the platform implementation
 * and keeps it synchronized with extension state
 */
export const PlatformProvider = ({ children }: { children: ReactNode }) => {
  const { network } = useNetwork();
  const userWallets = useUserWallets();
  const { currentWallet } = useProfiles();
  const wallet = useWallet();

  // Initialize platform singleton
  const platform = initializePlatform();

  // Keep platform synchronized with extension state
  useEffect(() => {
    platform.setCurrentNetwork(network);
  }, [platform, network]);

  useEffect(() => {
    platform.setCurrentAddress(currentWallet?.address || null);
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
    getSelectedAddress: () => platform.getSelectedAddress(),
    getNetwork: () => platform.getNetwork(),
  });

  // Convenience method to get translation function
  const getTranslation = (): TranslationFunction => {
    return (key: string, options?: Record<string, unknown>) => {
      // Convert dot notation keys to chrome i18n format
      const chromeKey = key.replace(/\./g, '__');
      const message = chrome.i18n.getMessage(chromeKey);

      // If no translation found, return the key or a fallback
      if (!message) {
        // For development, you might want to see the key
        return process.env.NODE_ENV === 'development' ? `[${key}]` : key;
      }

      // Handle string interpolation with options
      if (options && typeof message === 'string') {
        return message.replace(/\{(\w+)\}/g, (match, variable) => {
          return String(options[variable] ?? match);
        });
      }

      return message;
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
