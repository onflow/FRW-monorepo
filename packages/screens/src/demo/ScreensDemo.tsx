import { ScrollView, View, Text, Button, XStack, YStack } from '@onflow/frw-ui';
import React, { useState } from 'react';

import { ColorDemoScreen } from '../ColorDemo';
import { HomeScreen } from '../Home';
import { NFTListScreen } from '../NFTList';
import { SelectTokensScreen } from '../send';
import { useDemoDataStore } from '../stores';
import DataViewer from './DataViewer';

// Mock translation function
const mockT = (key: string, options?: any) => {
  const translations: Record<string, string> = {
    // Home screen
    'home.title': 'Flow Wallet Demo',
    'home.address': 'Address',
    'home.network': 'Network',
    'home.notProvided': 'Not provided',
    'home.activeAccount': 'Active Account',
    'home.walletSummary': 'Wallet Summary',
    'home.tokens': 'Tokens',
    'home.nfts': 'NFTs',
    'home.sendToActions': 'Send Actions',
    'home.sendTx': 'Send Transaction',
    'home.send': 'Send Tokens',
    'home.navigation': 'Navigation',
    'home.viewColors': 'View Colors',

    // Color demo
    'colorDemo.lightModeColors': 'Light Mode Colors',
    'colorDemo.darkModeColors': 'Dark Mode Colors',
    'colorDemo.switchToDark': 'Switch to Dark',
    'colorDemo.switchToLight': 'Switch to Light',
    'colorDemo.primaryColors': 'Primary Colors',
    'colorDemo.text': 'Text Colors',
    'colorDemo.system': 'System Colors',

    // NFT List
    'common.item': 'item',
    'common.items': 'items',
    'common.loading': 'Loading...',
    'common.clear': 'Clear',
    'common.cancel': 'Cancel',
    'common.confirm': 'Confirm',
    'placeholders.searchNFTs': 'Search NFTs...',
    'messages.noSearchResults': 'No search results',
    'messages.noNFTsFound': 'No NFTs found',
    'messages.noNFTsMatchSearch': `No NFTs match "${options?.search}"`,
    'messages.collectionEmpty': 'This collection is empty',
    'buttons.retry': 'Retry',
    'buttons.refresh': 'Refresh',
    'buttons.clearSearch': 'Clear Search',
    'nft.selectedCount': `${options?.count} selected`,
    'nft.confirmCount': `Confirm (${options?.count})`,
    'alerts.maxNFTSelection': 'Maximum 9 NFTs can be selected',

    // Send screens
    'tabs.tokens': 'Tokens',
    'tabs.nfts': 'NFTs',
    'send.fromAccount': 'From Account',
    'send.selectAccount': 'Select Account',
    'tokens.noTokensFound': 'No tokens found',
    'tokens.noTokensDescription': "Your wallet doesn't have any tokens yet.",
    'nfts.comingSoon': 'NFTs Coming Soon',
    'nfts.comingSoonDescription': 'NFT selection will be available soon.',
    'buttons.refresh': 'Refresh',
  };

  return translations[key] || key;
};

// Mock navigation
const mockNavigation = {
  navigate: (screen: string, params?: any) => {
    console.log(`Navigate to ${screen}`, params);
  },
  goBack: () => {
    console.log('Go back');
  },
};

// Mock bridge
const mockBridge = {
  // Add any bridge methods needed
};

type DemoScreen = 'home' | 'colors' | 'nftList' | 'selectTokens' | 'dataViewer';

export const ScreensDemo: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState<DemoScreen>('home');
  const [theme, setTheme] = useState({ isDark: false });

  // Initialize demo data
  const { fetchAccounts, fetchTokens, fetchNFTs, fetchCollections } = useDemoDataStore();

  React.useEffect(() => {
    // Load demo data when component mounts
    fetchAccounts();
    fetchTokens();
    fetchNFTs();
    fetchCollections();
  }, [fetchAccounts, fetchTokens, fetchNFTs, fetchCollections]);

  const toggleTheme = () => {
    setTheme((prev) => ({ isDark: !prev.isDark }));
  };

  const renderScreen = () => {
    const commonProps = {
      navigation: mockNavigation,
      bridge: mockBridge,
      t: mockT,
    };

    switch (currentScreen) {
      case 'home':
        return (
          <HomeScreen
            {...commonProps}
            address="0x1234567890abcdef"
            network="Flow Mainnet"
            onNavigateToColorDemo={() => setCurrentScreen('colors')}
            onNavigateToSelectTokens={() => setCurrentScreen('selectTokens')}
          />
        );

      case 'colors':
        return <ColorDemoScreen {...commonProps} theme={theme} onThemeToggle={toggleTheme} />;

      case 'nftList':
        return (
          <NFTListScreen
            {...commonProps}
            collection={{
              id: 'topshot',
              name: 'NBA Top Shot',
              description: 'NBA collectible highlights',
              logoURI: 'https://nbatopshot.com/logo.svg',
              contractName: 'TopShot',
              address: '0x0b2a3299cc857e29',
              path: {
                storagePath: '/storage/MomentCollection',
                publicPath: '/public/MomentCollection',
                privatePath: '/private/MomentCollection',
              },
              type: 'flow' as any,
            }}
            address="0x1234567890abcdef"
          />
        );

      case 'selectTokens':
        return (
          <SelectTokensScreen
            {...commonProps}
            onTokenSelect={(token) => {
              console.log('Token selected:', token);
            }}
          />
        );

      case 'dataViewer':
        return <DataViewer />;

      default:
        return null;
    }
  };

  return (
    <View flex={1} bg="$background">
      {/* Navigation Bar */}
      <View p="$4" borderBottomWidth={1} borderBottomColor="$borderColor">
        <YStack space="$3">
          <Text fontSize="$6" fontWeight="bold" color="$color" textAlign="center">
            Flow Wallet Screens Demo
          </Text>

          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <XStack space="$2" px="$2">
              {[
                { key: 'home', label: 'Home' },
                { key: 'colors', label: 'Colors' },
                { key: 'nftList', label: 'NFT List' },
                { key: 'selectTokens', label: 'Select Tokens' },
                { key: 'dataViewer', label: 'Data Viewer' },
              ].map(({ key, label }) => (
                <Button
                  key={key}
                  variant={currentScreen === key ? 'primary' : 'outline'}
                  size="small"
                  onPress={() => setCurrentScreen(key as DemoScreen)}
                >
                  <Text color={currentScreen === key ? 'white' : '$color'}>{label}</Text>
                </Button>
              ))}
            </XStack>
          </ScrollView>
        </YStack>
      </View>

      {/* Screen Content */}
      <View flex={1}>{renderScreen()}</View>
    </View>
  );
};

export default ScreensDemo;
