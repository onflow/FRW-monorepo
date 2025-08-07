/**
 * Example usage of SelectTokensScreen in different contexts
 * This demonstrates how to use the UI package in both React Native and Extension environments
 */

import { SelectTokensScreen, Platform } from '../index';

// Mock bridge implementations for different platforms
class ReactNativeBridge {
  getSelectedAddress(): string | null {
    // In React Native, this would come from the native bridge
    try {
      const NativeFRWBridge = require('../../../../apps/react-native/src/bridge/NativeFRWBridge');
      return NativeFRWBridge.default.getSelectedAddress();
    } catch {
      return '0x1234567890abcdef';
    }
  }

  getNetwork(): string {
    try {
      const NativeFRWBridge = require('../../../../apps/react-native/src/bridge/NativeFRWBridge');
      return NativeFRWBridge.default.getNetwork();
    } catch {
      return 'mainnet';
    }
  }
}

class ExtensionBridge {
  getSelectedAddress(): string | null {
    // In Extension, this would come from the background script
    if (typeof window !== 'undefined' && (window as any).chrome) {
      // This would be implemented as a message to background
      return '0xabcdef1234567890';
    }
    return '0xabcdef1234567890';
  }

  getNetwork(): string {
    // In Extension, this would come from the background script
    return 'mainnet';
  }
}

// Mock translation function
const mockT = (key: string, options?: any) => {
  const translations: Record<string, string> = {
    'labels.fromAccount': 'From Account',
    'buttons.edit': 'Edit',
    'tabs.tokens': 'Tokens',
    'tabs.nfts': 'NFTs',
    'messages.loadingAccount': 'Loading account...',
    'messages.loading': 'Loading...',
    'messages.noTokensWithBalance': 'No tokens with balance',
    'messages.noNFTCollectionsForAccount': 'No NFT collections found',
    'buttons.refresh': 'Refresh',
    'buttons.retry': 'Retry',
    'errors.failedToLoadTokens': 'Failed to load tokens',
  };

  if (options && options.search) {
    return `No collections match "${options.search}"`;
  }

  return translations[key] || key;
};

// Mock navigation
const mockNavigation = {
  navigate: (screen: string, params?: any) => {
    console.log(`Navigate to ${screen}`, params);
  },
};

// Platform-specific usage examples
export function ReactNativeSelectTokensExample() {
  if (!Platform.isReactNative) {
    return null;
  }

  return (
    <SelectTokensScreen navigation={mockNavigation} bridge={new ReactNativeBridge()} t={mockT} />
  );
}

export function ExtensionSelectTokensExample() {
  if (!Platform.isExtension && !Platform.isWeb) {
    return null;
  }

  return (
    <SelectTokensScreen navigation={mockNavigation} bridge={new ExtensionBridge()} t={mockT} />
  );
}

// Universal example that works on any platform
export function UniversalSelectTokensExample() {
  const bridge = Platform.isReactNative ? new ReactNativeBridge() : new ExtensionBridge();

  return <SelectTokensScreen navigation={mockNavigation} bridge={bridge} t={mockT} />;
}

export default UniversalSelectTokensExample;
