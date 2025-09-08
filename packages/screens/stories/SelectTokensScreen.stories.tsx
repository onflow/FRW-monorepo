import { YStack } from '@onflow/frw-ui';
import type { Meta, StoryObj } from '@storybook/react-vite';
import React, { useState } from 'react';

import { SelectTokensScreen } from '../src/send/SelectTokensScreen';

// Mock navigation and bridge for stories
const mockNavigation = {
  navigate: (screen: string, params?: any) => {
    console.log(`Navigate to ${screen}`, params);
  },
  goBack: () => console.log('Go back'),
  canGoBack: () => true,
};

const mockBridge = {
  getNetwork: () => 'mainnet',
  getSelectedAddress: () => '0x1234567890abcdef1234567890abcdef12345678',
};

const mockT = (key: string, params?: any) => {
  const translations: Record<string, string> = {
    'send.title': 'Send',
    'tabs.tokens': 'Tokens',
    'tabs.nfts': 'NFTs',
    'labels.fromAccount': 'From Account',
    'buttons.retry': 'Retry',
    'buttons.refresh': 'Refresh',
    'messages.loading': 'Loading...',
    'messages.loadingAccount': 'Loading account...',
    'messages.noTokensWithBalance': 'No tokens with balance found',
    'messages.noNFTCollectionsForAccount': 'No NFT collections found for this account',
    'errors.failedToLoadTokens': 'Failed to load tokens',
  };
  return translations[key] || key;
};

const meta: Meta<typeof SelectTokensScreen> = {
  title: 'Screens/SelectTokensScreen',
  component: SelectTokensScreen,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'SelectTokensScreen allows users to choose between tokens and NFT collections to send, with account balance display and tab-based navigation.',
      },
    },
  },
  decorators: [
    (Story) => (
      <YStack height={800} width="100%">
        <Story />
      </YStack>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof SelectTokensScreen>;

// Mock token data
const mockTokens = [
  {
    identifier: 'flow',
    symbol: 'FLOW',
    name: 'Flow',
    balance: '150.5',
    displayBalance: '150.5 FLOW',
    availableBalanceToUse: '150.5',
    usdValue: 0.75,
    change: '+5.2',
    icon: 'https://via.placeholder.com/40x40/00D4FF/FFFFFF?text=FLOW',
    isVerified: true,
  },
  {
    identifier: 'usdc',
    symbol: 'USDC',
    name: 'USD Coin',
    balance: '1000.00',
    displayBalance: '1,000.00 USDC',
    availableBalanceToUse: '1000.00',
    usdValue: 1000.0,
    change: '+0.1',
    icon: 'https://via.placeholder.com/40x40/2775CA/FFFFFF?text=USDC',
    isVerified: true,
  },
  {
    identifier: 'fusd',
    symbol: 'FUSD',
    name: 'Flow USD',
    balance: '25.75',
    displayBalance: '25.75 FUSD',
    availableBalanceToUse: '25.75',
    usdValue: 25.75,
    change: '-1.2',
    icon: 'https://via.placeholder.com/40x40/10B981/FFFFFF?text=FUSD',
    isVerified: true,
  },
  {
    identifier: 'test-token',
    symbol: 'TEST',
    name: 'Test Token',
    balance: '0.00',
    displayBalance: '0.00 TEST',
    availableBalanceToUse: '0.00',
    usdValue: 0,
    icon: 'https://via.placeholder.com/40x40/6B7280/FFFFFF?text=TEST',
    isVerified: false,
  },
];

// Mock NFT collections
const mockNFTCollections = [
  {
    id: 'cool-cats',
    name: 'Cool Cats',
    logoURI: 'https://via.placeholder.com/40x40/6366F1/FFFFFF?text=CC',
    description: 'A collection of 9,999 unique digital cats',
    contractName: 'CoolCats',
    count: 5,
  },
  {
    id: 'nba-topshot',
    name: 'NBA Top Shot',
    logoURI: 'https://via.placeholder.com/40x40/F59E0B/FFFFFF?text=NBA',
    description: 'Officially licensed NBA collectibles',
    contractName: 'TopShot',
    count: 12,
  },
  {
    id: 'cryptokitties',
    name: 'CryptoKitties',
    logoURI: 'https://via.placeholder.com/40x40/EC4899/FFFFFF?text=CK',
    description: 'Collectible and breedable cats',
    contractName: 'CryptoKitties',
    count: 3,
  },
  {
    id: 'art-blocks',
    name: 'Art Blocks',
    logoURI: 'https://via.placeholder.com/40x40/8B5CF6/FFFFFF?text=AB',
    description: 'Generative art NFTs',
    contractName: 'ArtBlocks',
    count: 8,
  },
];

export const Default: Story = {
  args: {
    navigation: mockNavigation,
    bridge: mockBridge,
    t: mockT,
  },
};

export const TokensTab: Story = {
  args: {
    navigation: mockNavigation,
    bridge: mockBridge,
    t: mockT,
  },
};

export const NFTsTab: Story = {
  args: {
    navigation: mockNavigation,
    bridge: mockBridge,
    t: mockT,
  },
};

export const WithTheme: Story = {
  args: {
    navigation: mockNavigation,
    bridge: mockBridge,
    t: mockT,
    theme: { isDark: true },
  },
};

export const LoadingAccount: Story = {
  render: () => (
    <YStack height="100vh">
      <SelectTokensScreen navigation={mockNavigation} bridge={mockBridge} t={mockT} />
    </YStack>
  ),
};

export const NoTokensWithBalance: Story = {
  args: {
    navigation: mockNavigation,
    bridge: mockBridge,
    t: mockT,
  },
};

export const TokenLoadingError: Story = {
  args: {
    navigation: mockNavigation,
    bridge: mockBridge,
    t: mockT,
  },
};

export const NFTLoadingError: Story = {
  args: {
    navigation: mockNavigation,
    bridge: mockBridge,
    t: mockT,
  },
};

export const EmptyNFTCollections: Story = {
  args: {
    navigation: mockNavigation,
    bridge: mockBridge,
    t: mockT,
  },
};

export const SingleToken: Story = {
  args: {
    navigation: mockNavigation,
    bridge: mockBridge,
    t: mockT,
  },
};

export const SingleNFTCollection: Story = {
  args: {
    navigation: mockNavigation,
    bridge: mockBridge,
    t: mockT,
  },
};

export const ManyTokens: Story = {
  args: {
    navigation: mockNavigation,
    bridge: mockBridge,
    t: mockT,
  },
};

export const ManyNFTCollections: Story = {
  args: {
    navigation: mockNavigation,
    bridge: mockBridge,
    t: mockT,
  },
};

export const TokensWithoutIcons: Story = {
  args: {
    navigation: mockNavigation,
    bridge: mockBridge,
    t: mockT,
  },
};

export const NFTCollectionsWithoutIcons: Story = {
  args: {
    navigation: mockNavigation,
    bridge: mockBridge,
    t: mockT,
  },
};

export const LongAccountName: Story = {
  args: {
    navigation: mockNavigation,
    bridge: mockBridge,
    t: mockT,
  },
};

export const Interactive: Story = {
  render: function InteractiveRender() {
    const [currentTab, setCurrentTab] = useState<'Tokens' | 'NFTs'>('Tokens');
    const [isLoading, setIsLoading] = useState(false);
    const [tokensLoading, setTokensLoading] = useState(false);
    const [nftsLoading, setNftsLoading] = useState(false);

    const mockInteractiveBridge = {
      ...mockBridge,
      getSelectedAddress: () => '0x1234567890abcdef1234567890abcdef12345678',
    };

    const handleTabChange = (tab: string) => {
      setCurrentTab(tab as 'Tokens' | 'NFTs');
    };

    const handleRefreshTokens = () => {
      setTokensLoading(true);
      setTimeout(() => setTokensLoading(false), 2000);
    };

    const handleRefreshNFTs = () => {
      setNftsLoading(true);
      setTimeout(() => setNftsLoading(false), 2000);
    };

    return (
      <YStack height="100vh" position="relative">
        <SelectTokensScreen navigation={mockNavigation} bridge={mockInteractiveBridge} t={mockT} />

        {/* Debug Controls */}
        <YStack
          position="absolute"
          top={10}
          right={10}
          bg="$backgroundTransparent"
          p="$3"
          rounded="$3"
          gap="$2"
        >
          <YStack
            bg="$blue9"
            rounded="$3"
            px="$3"
            py="$2"
            pressStyle={{ opacity: 0.8 }}
            onPress={handleRefreshTokens}
            cursor="pointer"
          >
            <YStack fontSize="$3" color="$white" fontWeight="500">
              Refresh Tokens
            </YStack>
          </YStack>

          <YStack
            bg="$green9"
            rounded="$3"
            px="$3"
            py="$2"
            pressStyle={{ opacity: 0.8 }}
            onPress={handleRefreshNFTs}
            cursor="pointer"
          >
            <YStack fontSize="$3" color="$white" fontWeight="500">
              Refresh NFTs
            </YStack>
          </YStack>

          <YStack fontSize="$2" color="$color">
            Current Tab: {currentTab}
          </YStack>
          <YStack fontSize="$2" color="$color">
            Tokens Loading: {tokensLoading ? 'Yes' : 'No'}
          </YStack>
          <YStack fontSize="$2" color="$color">
            NFTs Loading: {nftsLoading ? 'Yes' : 'No'}
          </YStack>
        </YStack>
      </YStack>
    );
  },
};

export const DifferentAccountStates: Story = {
  render: () => (
    <YStack gap="$4" width="100%">
      <YStack fontSize="$5" fontWeight="600" color="$color" mb="$2" px="$4">
        Different Account States
      </YStack>

      {/* Loading Account */}
      <YStack height={300}>
        <SelectTokensScreen navigation={mockNavigation} bridge={mockBridge} t={mockT} />
      </YStack>

      {/* Account with Balance */}
      <YStack height={300}>
        <SelectTokensScreen navigation={mockNavigation} bridge={mockBridge} t={mockT} />
      </YStack>

      {/* Account without Balance */}
      <YStack height={300}>
        <SelectTokensScreen navigation={mockNavigation} bridge={mockBridge} t={mockT} />
      </YStack>
    </YStack>
  ),
  decorators: [
    (Story) => (
      <YStack height="100vh" overflow="scroll">
        <Story />
      </YStack>
    ),
  ],
};

export const ErrorStates: Story = {
  render: () => (
    <YStack gap="$4" width="100%">
      <YStack fontSize="$5" fontWeight="600" color="$color" mb="$2" px="$4">
        Error States
      </YStack>

      {/* Token Loading Error */}
      <YStack height={300}>
        <SelectTokensScreen navigation={mockNavigation} bridge={mockBridge} t={mockT} />
      </YStack>

      {/* NFT Loading Error */}
      <YStack height={300}>
        <SelectTokensScreen navigation={mockNavigation} bridge={mockBridge} t={mockT} />
      </YStack>
    </YStack>
  ),
  decorators: [
    (Story) => (
      <YStack height="100vh" overflow="scroll">
        <Story />
      </YStack>
    ),
  ],
};

export const TabTransitions: Story = {
  render: function TabTransitionsRender() {
    const [activeTab, setActiveTab] = useState<'Tokens' | 'NFTs'>('Tokens');

    return (
      <YStack height="100vh" position="relative">
        <SelectTokensScreen navigation={mockNavigation} bridge={mockBridge} t={mockT} />

        {/* Tab Control */}
        <YStack
          position="absolute"
          bottom={20}
          left="50%"
          transform="translateX(-50%)"
          bg="$backgroundTransparent"
          p="$3"
          rounded="$4"
          flexDirection="row"
          gap="$2"
        >
          <YStack
            bg={activeTab === 'Tokens' ? '$blue9' : '$gray8'}
            rounded="$3"
            px="$4"
            py="$2"
            pressStyle={{ opacity: 0.8 }}
            onPress={() => setActiveTab('Tokens')}
            cursor="pointer"
          >
            <YStack fontSize="$3" color="$white" fontWeight="500">
              Tokens
            </YStack>
          </YStack>

          <YStack
            bg={activeTab === 'NFTs' ? '$blue9' : '$gray8'}
            rounded="$3"
            px="$4"
            py="$2"
            pressStyle={{ opacity: 0.8 }}
            onPress={() => setActiveTab('NFTs')}
            cursor="pointer"
          >
            <YStack fontSize="$3" color="$white" fontWeight="500">
              NFTs
            </YStack>
          </YStack>
        </YStack>
      </YStack>
    );
  },
};
