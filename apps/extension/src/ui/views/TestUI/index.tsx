/**
 * Test page for UI package components
 * This page tests loading SelectTokensScreen from @onflow/frw-ui
 */

import { Platform, PlatformType, ServiceContext } from '@onflow/frw-context';
import {
  Card,
  SelectTokensScreen,
  tamaguiConfig,
  TamaguiProvider,
  Text,
  YStack,
} from '@onflow/frw-ui';
import React, { useEffect, useState } from 'react';

// Import Tamagui provider and configuration from the UI package

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

// Mock navigation function
const mockNavigation = {
  navigate: (screen: string, params?: Record<string, unknown>) => {
    console.log(`Navigating to ${screen} with params:`, params);
  },
};

const TestUI: React.FC = () => {
  const platformSpec = useExtensionPlatformSpec();
  const [platformInfo, setPlatformInfo] = useState<any>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize ServiceContext with our platform spec
  useEffect(() => {
    const initializeContext = async () => {
      console.log('Initializing ServiceContext with Extension platform...');
      try {
        await ServiceContext.initialize(platformSpec);
        console.log('ServiceContext initialized successfully');

        // Wait a bit for everything to be properly set up
        setTimeout(() => {
          try {
            const info = Platform.info;
            console.log('Platform info:', info);
            setPlatformInfo(info);
            setIsInitialized(true);
          } catch (error) {
            console.warn('Platform still not ready:', error);
            setPlatformInfo(null);
          }
        }, 100);
      } catch (error) {
        console.error('Failed to initialize ServiceContext:', error);
        setIsInitialized(true); // Still set to true to show error state
      }
    };

    initializeContext();
  }, [platformSpec]);

  return (
    <TamaguiProvider config={tamaguiConfig} defaultTheme="dark">
      <YStack
        flex={1}
        backgroundColor="$background"
        padding="$5"
        maxWidth={400}
        alignSelf="center"
        minHeight="100vh"
        style={{
          backgroundColor: '#1a1a1a !important',
          color: '#ffffff !important',
        }}
      >
        {/* SelectTokensScreen Test */}
        <Card
          borderWidth={1}
          borderColor="$borderColor"
          borderRadius="$4"
          padding="$3"
          backgroundColor="$backgroundHover"
        >
          {!isInitialized ? (
            <YStack>
              <Text color="$secondary">Initializing ServiceContext...</Text>
            </YStack>
          ) : platformInfo && platformInfo.type === PlatformType.CHROME_EXTENSION ? (
            <YStack height={500} overflow="auto">
              <SelectTokensScreen navigation={mockNavigation} t={mockTranslation} />
            </YStack>
          ) : (
            <YStack space="$2">
              <Text color="$color">Platform initialization completed but type mismatch:</Text>
              <Text color="$secondary">Expected: Chrome Extension</Text>
              <Text color="$secondary">Current: {platformInfo?.type || 'Not detected'}</Text>
              <Text color="$secondary" fontSize="$2">
                Platform Info: {JSON.stringify(platformInfo)}
              </Text>
            </YStack>
          )}
        </Card>
      </YStack>
    </TamaguiProvider>
  );
};

export default TestUI;
