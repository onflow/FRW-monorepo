import { YStack } from '@onflow/frw-ui';
import type { Meta, StoryObj } from '@storybook/react-vite';
import React, { useState } from 'react';

import { NFTDetailScreen } from '../src/send/NFTDetailScreen.query';

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
    'nft.notFound.title': 'NFT Not Found',
    'nft.notFound.message': 'The requested NFT could not be loaded',
    'buttons.continue': 'Continue',
    'buttons.back': 'Back',
  };
  return translations[key] || key;
};

const meta: Meta<typeof NFTDetailScreen> = {
  title: 'Screens/NFTDetailScreen',
  component: NFTDetailScreen,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'NFTDetailScreen displays detailed information about a specific NFT with optional selection functionality for batch operations.',
      },
    },
  },
  argTypes: {
    onSelectionChange: { action: 'selection-changed' },
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
type Story = StoryObj<typeof NFTDetailScreen>;

// Mock NFT data
const mockNFT = {
  id: 'nft-123',
  name: 'Cool Cat #1234',
  image: 'https://via.placeholder.com/400x400/6366F1/FFFFFF?text=Cool+Cat',
  thumbnail: 'https://via.placeholder.com/200x200/6366F1/FFFFFF?text=Cool+Cat',
  collectionName: 'Cool Cats',
  description: 'A unique digital collectible cat with rare traits and vibrant colors.',
  contractName: 'CoolCats',
  contractAddress: '0xabcdef1234567890',
  collectionContractName: 'CoolCatsCollection',
  rarity: 'Rare',
  traits: [
    { name: 'Background', value: 'Blue' },
    { name: 'Body', value: 'Orange' },
    { name: 'Eyes', value: 'Green' },
    { name: 'Hat', value: 'Cap' },
  ],
};

const mockNFTWithoutImage = {
  ...mockNFT,
  id: 'nft-456',
  name: 'Mysterious NFT #789',
  image: undefined,
  thumbnail: undefined,
};

const mockNFTLongDescription = {
  ...mockNFT,
  id: 'nft-789',
  name: 'Epic Adventure NFT with Very Long Name That Tests Text Wrapping',
  description:
    'This is an extremely long description that should test how the NFT detail view handles lengthy text content. It includes multiple sentences and should demonstrate proper text wrapping and layout handling within the component. The description continues with more details about the NFT including its history, rarity, and special features that make it unique in the collection.',
  collectionName: 'Epic Adventures Collection With Very Long Name',
};

const mockSelectedNFTs = [
  mockNFT,
  {
    id: 'nft-selected-2',
    name: 'Selected NFT #2',
    image: 'https://via.placeholder.com/400x400/10B981/FFFFFF?text=NFT+2',
    collectionName: 'Selected Collection',
  },
  {
    id: 'nft-selected-3',
    name: 'Selected NFT #3',
    image: 'https://via.placeholder.com/400x400/F59E0B/FFFFFF?text=NFT+3',
    collectionName: 'Selected Collection',
  },
];

export const Default: Story = {
  args: {
    navigation: mockNavigation,
    bridge: mockBridge,
    t: mockT,
    nft: mockNFT,
  },
};

export const WithoutImage: Story = {
  args: {
    navigation: mockNavigation,
    bridge: mockBridge,
    t: mockT,
    nft: mockNFTWithoutImage,
  },
};

export const LongDescription: Story = {
  args: {
    navigation: mockNavigation,
    bridge: mockBridge,
    t: mockT,
    nft: mockNFTLongDescription,
  },
};

export const SelectableMode: Story = {
  args: {
    navigation: mockNavigation,
    bridge: mockBridge,
    t: mockT,
    nft: mockNFT,
    selectedNFTs: [],
  },
};

export const SelectableModeSelected: Story = {
  args: {
    navigation: mockNavigation,
    bridge: mockBridge,
    t: mockT,
    nft: mockNFT,
    selectedNFTs: [mockNFT],
  },
};

export const SelectableModeWithMultiple: Story = {
  args: {
    navigation: mockNavigation,
    bridge: mockBridge,
    t: mockT,
    nft: mockNFT,
    selectedNFTs: mockSelectedNFTs,
  },
};

export const NotFound: Story = {
  args: {
    navigation: mockNavigation,
    bridge: mockBridge,
    t: mockT,
    nft: null,
  },
};

export const UndefinedNFT: Story = {
  args: {
    navigation: mockNavigation,
    bridge: mockBridge,
    t: mockT,
    nft: undefined,
  },
};

export const MinimalNFTData: Story = {
  args: {
    navigation: mockNavigation,
    bridge: mockBridge,
    t: mockT,
    nft: {
      id: 'minimal-nft',
      name: 'Minimal NFT',
      contractName: 'MinimalContract',
      contractAddress: '0x123456789',
      collectionContractName: 'MinimalCollection',
    },
  },
};

export const Interactive: Story = {
  render: function InteractiveRender() {
    const [selectedNFTs, setSelectedNFTs] = useState<any[]>([]);
    const [selectionMode, setSelectionMode] = useState(true);

    const handleSelectionChange = (nftId: string, selected: boolean) => {
      if (selected) {
        setSelectedNFTs((prev) => [
          ...prev,
          mockSelectedNFTs.find((nft) => nft.id === nftId) || mockNFT,
        ]);
      } else {
        setSelectedNFTs((prev) => prev.filter((nft) => nft.id !== nftId));
      }
    };

    const toggleSelectionMode = () => {
      setSelectionMode(!selectionMode);
      if (!selectionMode) {
        setSelectedNFTs([]);
      }
    };

    return (
      <YStack height="100vh" position="relative">
        <NFTDetailScreen
          navigation={mockNavigation}
          bridge={mockBridge}
          t={mockT}
          nft={mockNFT}
          selectedNFTs={selectionMode ? selectedNFTs : undefined}
          onSelectionChange={handleSelectionChange}
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
        >
          <YStack
            bg="$blue9"
            rounded="$3"
            px="$3"
            py="$2"
            pressStyle={{ opacity: 0.8 }}
            onPress={toggleSelectionMode}
            cursor="pointer"
          >
            <YStack fontSize="$3" color="$white" fontWeight="500">
              {selectionMode ? 'Disable Selection' : 'Enable Selection'}
            </YStack>
          </YStack>

          <YStack fontSize="$2" color="$color">
            Selected: {selectedNFTs.length}
          </YStack>
          <YStack fontSize="$2" color="$color">
            Mode: {selectionMode ? 'Selection' : 'View Only'}
          </YStack>
        </YStack>
      </YStack>
    );
  },
};

export const DifferentNFTTypes: Story = {
  render: () => (
    <YStack gap="$4" p="$4" width="100%">
      <YStack fontSize="$5" fontWeight="600" color="$color" mb="$2">
        Different NFT Examples
      </YStack>

      <YStack height={300}>
        <NFTDetailScreen navigation={mockNavigation} bridge={mockBridge} t={mockT} nft={mockNFT} />
      </YStack>

      <YStack height={300}>
        <NFTDetailScreen
          navigation={mockNavigation}
          bridge={mockBridge}
          t={mockT}
          nft={mockNFTWithoutImage}
        />
      </YStack>

      <YStack height={300}>
        <NFTDetailScreen
          navigation={mockNavigation}
          bridge={mockBridge}
          t={mockT}
          nft={mockNFTLongDescription}
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

export const SelectionStates: Story = {
  render: () => (
    <YStack gap="$4" width="100%">
      <YStack fontSize="$5" fontWeight="600" color="$color" mb="$2" px="$4">
        Selection State Examples
      </YStack>

      {/* Not Selectable */}
      <YStack height={300}>
        <NFTDetailScreen navigation={mockNavigation} bridge={mockBridge} t={mockT} nft={mockNFT} />
      </YStack>

      {/* Selectable - Not Selected */}
      <YStack height={300}>
        <NFTDetailScreen
          navigation={mockNavigation}
          bridge={mockBridge}
          t={mockT}
          nft={mockNFT}
          selectedNFTs={[]}
        />
      </YStack>

      {/* Selectable - Selected */}
      <YStack height={300}>
        <NFTDetailScreen
          navigation={mockNavigation}
          bridge={mockBridge}
          t={mockT}
          nft={mockNFT}
          selectedNFTs={[mockNFT]}
        />
      </YStack>

      {/* Selectable - With Multiple */}
      <YStack height={300}>
        <NFTDetailScreen
          navigation={mockNavigation}
          bridge={mockBridge}
          t={mockT}
          nft={mockNFT}
          selectedNFTs={mockSelectedNFTs}
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
