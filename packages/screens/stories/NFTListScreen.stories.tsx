import { YStack } from '@onflow/frw-ui';
import type { Meta, StoryObj } from '@storybook/react-vite';
import React, { useState } from 'react';

import { NFTListScreen } from '../src/send/NFTListScreen';

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
    'tabs.nfts': 'NFTs',
    'buttons.retry': 'Retry',
    'buttons.refresh': 'Refresh',
    'buttons.continue': 'Continue',
    'buttons.clearSearch': 'Clear Search',
    'placeholders.searchNFTs': 'Search NFTs...',
    'nft.noSearchResults': 'No Search Results',
    'nft.noNFTsMatchSearch': `No NFTs match "${params?.search}"`,
    'nft.noNFTsFound': 'No NFTs Found',
    'nft.collectionEmpty': 'This collection is empty',
    'errors.failedToLoadNFTs': 'Failed to load NFTs',
  };
  return translations[key] || key;
};

const meta: Meta<typeof NFTListScreen> = {
  title: 'Screens/NFTListScreen',
  component: NFTListScreen,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'NFTListScreen displays a grid of NFTs from a specific collection with search functionality and multi-select capabilities.',
      },
    },
  },
  argTypes: {
    isEditing: { control: 'boolean' },
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
type Story = StoryObj<typeof NFTListScreen>;

// Mock collection data
const mockCollection = {
  id: 'cool-cats',
  name: 'Cool Cats',
  logoURI: 'https://via.placeholder.com/60x60/6366F1/FFFFFF?text=CC',
  logo: 'https://via.placeholder.com/60x60/6366F1/FFFFFF?text=CC',
  description: 'A collection of 9,999 unique digital cats',
  contractName: 'CoolCats',
  contractAddress: '0xabcdef1234567890',
  nfts: Array.from({ length: 24 }, (_, i) => ({
    id: `cool-cat-${i + 1}`,
    name: `Cool Cat #${i + 1}`,
    image: `https://via.placeholder.com/300x300/${['6366F1', 'F59E0B', '10B981', '8B5CF6', 'EF4444', '06B6D4'][i % 6]}/FFFFFF?text=Cat+${i + 1}`,
    thumbnail: `https://via.placeholder.com/150x150/${['6366F1', 'F59E0B', '10B981', '8B5CF6', 'EF4444', '06B6D4'][i % 6]}/FFFFFF?text=Cat+${i + 1}`,
    collectionName: 'Cool Cats',
  })),
};

const mockEmptyCollection = {
  id: 'empty-collection',
  name: 'Empty Collection',
  logoURI: 'https://via.placeholder.com/60x60/6B7280/FFFFFF?text=EC',
  description: 'A collection with no NFTs',
  contractName: 'EmptyCollection',
  contractAddress: '0x123456789',
  nfts: [],
};

const mockLargeCollection = {
  id: 'large-collection',
  name: 'Large Collection',
  logoURI: 'https://via.placeholder.com/60x60/8B5CF6/FFFFFF?text=LC',
  description: 'A large collection with many NFTs',
  contractName: 'LargeCollection',
  contractAddress: '0x987654321',
  nfts: Array.from({ length: 120 }, (_, i) => ({
    id: `large-nft-${i + 1}`,
    name: `Large NFT #${i + 1}`,
    image: `https://via.placeholder.com/300x300/${['EC4899', '14B8A6', 'F97316', '6366F1', 'EF4444', '10B981'][i % 6]}/FFFFFF?text=${i + 1}`,
    thumbnail: `https://via.placeholder.com/150x150/${['EC4899', '14B8A6', 'F97316', '6366F1', 'EF4444', '10B981'][i % 6]}/FFFFFF?text=${i + 1}`,
    collectionName: 'Large Collection',
  })),
};

const mockAddress = '0x1234567890abcdef1234567890abcdef12345678';

export const Default: Story = {
  args: {
    navigation: mockNavigation,
    bridge: mockBridge,
    t: mockT,
    collection: mockCollection,
    address: mockAddress,
  },
};

export const EmptyCollection: Story = {
  args: {
    navigation: mockNavigation,
    bridge: mockBridge,
    t: mockT,
    collection: mockEmptyCollection,
    address: mockAddress,
  },
};

export const LargeCollection: Story = {
  args: {
    navigation: mockNavigation,
    bridge: mockBridge,
    t: mockT,
    collection: mockLargeCollection,
    address: mockAddress,
  },
};

export const WithPreselectedNFTs: Story = {
  args: {
    navigation: mockNavigation,
    bridge: mockBridge,
    t: mockT,
    collection: mockCollection,
    address: mockAddress,
    selectedNFTIds: ['cool-cat-1', 'cool-cat-3', 'cool-cat-5'],
  },
};

export const EditingMode: Story = {
  args: {
    navigation: mockNavigation,
    bridge: mockBridge,
    t: mockT,
    collection: mockCollection,
    address: mockAddress,
    selectedNFTIds: ['cool-cat-2', 'cool-cat-4'],
    isEditing: true,
  },
};

export const NoCollection: Story = {
  args: {
    navigation: mockNavigation,
    bridge: mockBridge,
    t: mockT,
    collection: null,
    address: mockAddress,
  },
};

export const NoAddress: Story = {
  args: {
    navigation: mockNavigation,
    bridge: mockBridge,
    t: mockT,
    collection: mockCollection,
    address: null,
  },
};

export const CollectionWithoutImage: Story = {
  args: {
    navigation: mockNavigation,
    bridge: mockBridge,
    t: mockT,
    collection: {
      ...mockCollection,
      logoURI: undefined,
      logo: undefined,
    },
    address: mockAddress,
  },
};

export const LongCollectionName: Story = {
  args: {
    navigation: mockNavigation,
    bridge: mockBridge,
    t: mockT,
    collection: {
      ...mockCollection,
      name: 'Very Long Collection Name That Should Be Handled Properly in the Interface',
      description:
        'This is a collection with an extremely long name to test how the interface handles text overflow and wrapping in collection headers.',
    },
    address: mockAddress,
  },
};

export const NFTsWithoutImages: Story = {
  args: {
    navigation: mockNavigation,
    bridge: mockBridge,
    t: mockT,
    collection: {
      ...mockCollection,
      nfts: mockCollection.nfts.slice(0, 12).map((nft) => ({
        ...nft,
        image: undefined,
        thumbnail: undefined,
      })),
    },
    address: mockAddress,
  },
};

export const MixedNFTNames: Story = {
  args: {
    navigation: mockNavigation,
    bridge: mockBridge,
    t: mockT,
    collection: {
      ...mockCollection,
      nfts: [
        {
          id: 'short-1',
          name: 'Short',
          image: 'https://via.placeholder.com/300x300/6366F1/FFFFFF?text=Short',
          collectionName: 'Test Collection',
        },
        {
          id: 'long-2',
          name: 'Very Long NFT Name That Tests Text Wrapping and Truncation Behavior',
          image: 'https://via.placeholder.com/300x300/F59E0B/FFFFFF?text=Long',
          collectionName: 'Test Collection',
        },
        {
          id: 'medium-3',
          name: 'Medium Length Name',
          image: 'https://via.placeholder.com/300x300/10B981/FFFFFF?text=Med',
          collectionName: 'Test Collection',
        },
        {
          id: 'number-4',
          name: 'NFT #1234567890',
          image: 'https://via.placeholder.com/300x300/8B5CF6/FFFFFF?text=Num',
          collectionName: 'Test Collection',
        },
      ],
    },
    address: mockAddress,
  },
};

export const Interactive: Story = {
  render: function InteractiveRender() {
    const [selectedNFTIds, setSelectedNFTIds] = useState<string[]>(['cool-cat-1', 'cool-cat-3']);
    const [searchTerm, setSearchTerm] = useState('');
    const [isEditing, setIsEditing] = useState(false);

    // Create filtered collection based on search
    const filteredCollection = {
      ...mockCollection,
      nfts: mockCollection.nfts.filter(
        (nft) => !searchTerm || nft.name.toLowerCase().includes(searchTerm.toLowerCase())
      ),
    };

    const handleSelectionChange = (nftId: string) => {
      setSelectedNFTIds((prev) =>
        prev.includes(nftId) ? prev.filter((id) => id !== nftId) : [...prev, nftId]
      );
    };

    return (
      <YStack height="100vh" position="relative">
        <NFTListScreen
          navigation={mockNavigation}
          bridge={mockBridge}
          t={mockT}
          collection={filteredCollection}
          address={mockAddress}
          selectedNFTIds={selectedNFTIds}
          isEditing={isEditing}
        />

        {/* Debug Controls */}
        <YStack
          position="absolute"
          top={10}
          right={10}
          bg="$backgroundTransparent"
          p="$3"
          rounded="$3"
          gap="$2"
          maxWidth={200}
        >
          <YStack
            bg="$blue9"
            rounded="$3"
            px="$3"
            py="$2"
            pressStyle={{ opacity: 0.8 }}
            onPress={() => setIsEditing(!isEditing)}
            cursor="pointer"
          >
            <YStack fontSize="$3" color="$white" fontWeight="500">
              {isEditing ? 'Exit Edit' : 'Enter Edit'}
            </YStack>
          </YStack>

          <YStack
            bg="$green9"
            rounded="$3"
            px="$3"
            py="$2"
            pressStyle={{ opacity: 0.8 }}
            onPress={() => setSelectedNFTIds([])}
            cursor="pointer"
          >
            <YStack fontSize="$3" color="$white" fontWeight="500">
              Clear Selection
            </YStack>
          </YStack>

          <YStack
            bg="$purple9"
            rounded="$3"
            px="$3"
            py="$2"
            pressStyle={{ opacity: 0.8 }}
            onPress={() =>
              setSelectedNFTIds([
                'cool-cat-1',
                'cool-cat-2',
                'cool-cat-3',
                'cool-cat-4',
                'cool-cat-5',
              ])
            }
            cursor="pointer"
          >
            <YStack fontSize="$3" color="$white" fontWeight="500">
              Select 5
            </YStack>
          </YStack>

          <YStack fontSize="$2" color="$color">
            Selected: {selectedNFTIds.length}
          </YStack>
          <YStack fontSize="$2" color="$color">
            Mode: {isEditing ? 'Editing' : 'Selection'}
          </YStack>
          <YStack fontSize="$2" color="$color">
            Total: {filteredCollection.nfts.length}
          </YStack>
        </YStack>
      </YStack>
    );
  },
};

export const LoadingStates: Story = {
  render: () => (
    <YStack gap="$4" width="100%">
      <YStack fontSize="$5" fontWeight="600" color="$color" mb="$2" px="$4">
        Different States
      </YStack>

      {/* Normal State */}
      <YStack height={300}>
        <NFTListScreen
          navigation={mockNavigation}
          bridge={mockBridge}
          t={mockT}
          collection={mockCollection}
          address={mockAddress}
        />
      </YStack>

      {/* Empty State */}
      <YStack height={300}>
        <NFTListScreen
          navigation={mockNavigation}
          bridge={mockBridge}
          t={mockT}
          collection={mockEmptyCollection}
          address={mockAddress}
        />
      </YStack>

      {/* No Collection State */}
      <YStack height={300}>
        <NFTListScreen
          navigation={mockNavigation}
          bridge={mockBridge}
          t={mockT}
          collection={null}
          address={mockAddress}
        />
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

export const MaxSelectionTest: Story = {
  args: {
    navigation: mockNavigation,
    bridge: mockBridge,
    t: mockT,
    collection: mockCollection,
    address: mockAddress,
    selectedNFTIds: [
      'cool-cat-1',
      'cool-cat-2',
      'cool-cat-3',
      'cool-cat-4',
      'cool-cat-5',
      'cool-cat-6',
      'cool-cat-7',
      'cool-cat-8',
      'cool-cat-9',
    ], // 9 selected (max)
  },
};
