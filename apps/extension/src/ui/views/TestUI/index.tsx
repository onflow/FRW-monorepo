/**
 * Test page for UI package components
 * This page tests loading SelectTokensScreen from @onflow/frw-ui
 */


import { ServiceContext, Platform, PlatformType } from '@onflow/frw-context';
import { SelectTokensScreen } from '@onflow/frw-ui';
import React, { useEffect, useMemo } from 'react';

import { useExtensionPlatformSpec } from '@/ui/bridge/ExtensionPlatformSpec';

// Mock translation function
const mockTranslation = (key: string, options?: Record<string, unknown>): string => {
  const translations: Record<string, string> = {
    'labels.fromAccount': 'From Account',
    'buttons.edit': 'Edit',
    'buttons.retry': 'Retry',
    'buttons.refresh': 'Refresh',
    'tabs.tokens': 'Tokens',
    'tabs.nfts': 'NFTs',
    'messages.loadingAccount': 'Loading account...',
    'messages.loading': 'Loading...',
    'messages.noTokensWithBalance': 'No tokens with balance',
    'messages.noNFTCollectionsForAccount': 'No NFT collections found',
    'errors.failedToLoadTokens': 'Failed to load tokens',
  };

  if (options && options.search) {
    return `No collections match "${options.search}"`;
  }

  return translations[key] || key;
};

// Mock navigation
const mockNavigation = {
  navigate: (screen: string, params?: Record<string, unknown>) => {
    console.log(`[Extension Navigation] Navigate to ${screen}`, params);
    // In a real extension, this would trigger routing
  },
};

const TestUI: React.FC = () => {
  const platformSpec = useExtensionPlatformSpec();

  // Initialize ServiceContext with our platform spec
  useEffect(() => {
    console.log('Initializing ServiceContext with Extension platform...');
    try {
      ServiceContext.initialize(platformSpec);
      console.log('ServiceContext initialized successfully');
      console.log('Platform info:', Platform.info);
    } catch (error) {
      console.error('Failed to initialize ServiceContext:', error);
    }
  }, [platformSpec]);

  // Check if platform is properly detected
  const platformInfo = useMemo(() => {
    try {
      if (Platform.info) {
        return Platform.info;
      }
    } catch (error) {
      console.warn('Platform not yet initialized:', error);
    }
    return null;
  }, []);

  return (
    <div style={{ padding: '20px', maxWidth: '400px', margin: '0 auto' }}>
      <h2>UI Package Test - Extension</h2>

      {/* Platform Information */}
      <div
        style={{
          marginBottom: '20px',
          padding: '10px',
          background: '#f5f5f5',
          borderRadius: '4px',
        }}
      >
        <h3>Platform Info</h3>
        {platformInfo ? (
          <ul>
            <li>Type: {platformInfo.type}</li>
            <li>Is Extension: {platformInfo.isExtension ? '✅' : '❌'}</li>
            <li>Is React Native: {platformInfo.isReactNative ? '✅' : '❌'}</li>
            <li>Is Web: {platformInfo.isWeb ? '✅' : '❌'}</li>
            <li>Is Mobile: {platformInfo.isMobile ? '✅' : '❌'}</li>
          </ul>
        ) : (
          <p>Platform not initialized</p>
        )}
      </div>

      {/* SelectTokensScreen Test */}
      <div style={{ border: '1px solid #ddd', borderRadius: '4px', padding: '10px' }}>
        <h3>SelectTokensScreen Test</h3>
        {platformInfo && platformInfo.type === PlatformType.CHROME_EXTENSION ? (
          <div style={{ height: '500px', overflow: 'auto' }}>
            <SelectTokensScreen
              navigation={mockNavigation}
              bridge={platformSpec}
              t={mockTranslation}
            />
          </div>
        ) : (
          <div>
            <p>Waiting for platform initialization...</p>
            <p>Expected: Chrome Extension</p>
            <p>Current: {platformInfo?.type || 'Not detected'}</p>
          </div>
        )}
      </div>

      {/* Debug Information */}
      <div style={{ marginTop: '20px', fontSize: '12px', color: '#666' }}>
        <details>
          <summary>Debug Info</summary>
          <pre>{JSON.stringify({ platformInfo }, null, 2)}</pre>
        </details>
      </div>
    </div>
  );
};

export default TestUI;
