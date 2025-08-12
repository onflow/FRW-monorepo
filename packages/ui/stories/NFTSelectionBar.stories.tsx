import type { Meta, StoryObj } from '@storybook/react-vite';
import React, { useState } from 'react';
import { YStack } from 'tamagui';

import type { NFTData } from '../src/components/NFTGrid';
import { NFTSelectionBar } from '../src/components/NFTSelectionBar';

const meta: Meta<typeof NFTSelectionBar> = {
  title: 'Components/NFTSelectionBar',
  component: NFTSelectionBar,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'NFTSelectionBar displays selected NFTs in an expandable bottom bar with actions.',
      },
    },
  },
  argTypes: {
    isEditing: { control: 'boolean' },
    continueText: { control: 'text' },
    maxHeight: { control: 'number', min: 200, max: 500 },
    onRemoveNFT: { action: 'nft-removed' },
    onContinue: { action: 'continue' },
  },
  decorators: [
    (Story) => (
      <YStack height={500} width="100%" position="relative" bg="$bg1">
        <YStack flex={1} items="center" justify="center">
          <YStack p="$4" bg="$bg2" borderRadius="$4">
            This is the main content area. The selection bar appears at the bottom.
          </YStack>
        </YStack>
        <Story />
      </YStack>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof NFTSelectionBar>;

// Mock selected NFTs
const mockSelectedNFTs: NFTData[] = [
  {
    id: '1',
    name: 'Cool Cat #1234',
    image: 'https://via.placeholder.com/150x150/6366F1/FFFFFF?text=CC1',
    collection: 'Cool Cats',
  },
  {
    id: '2',
    name: 'Bored Ape #5678',
    image: 'https://via.placeholder.com/150x150/F59E0B/FFFFFF?text=BA2',
    collection: 'BAYC',
  },
  {
    id: '3',
    name: 'CryptoPunk #9012',
    image: 'https://via.placeholder.com/150x150/EF4444/FFFFFF?text=CP3',
    collection: 'CryptoPunks',
  },
];

const largeMockSelection: NFTData[] = Array.from({ length: 8 }, (_, index) => ({
  id: `${index + 1}`,
  name: `NFT #${index + 1}`,
  image: `https://via.placeholder.com/150x150/${Math.floor(Math.random() * 16777215).toString(16)}/FFFFFF?text=${index + 1}`,
  collection: `Collection ${Math.floor(index / 3) + 1}`,
}));

export const Default: Story = {
  args: {
    selectedNFTs: mockSelectedNFTs,
    continueText: 'Continue',
  },
};

export const SingleNFT: Story = {
  args: {
    selectedNFTs: [mockSelectedNFTs[0]],
    continueText: 'Send NFT',
  },
};

export const ManyNFTs: Story = {
  args: {
    selectedNFTs: largeMockSelection,
    continueText: 'Send 8 NFTs',
  },
};

export const EditingMode: Story = {
  args: {
    selectedNFTs: mockSelectedNFTs,
    isEditing: true,
    continueText: 'Update Selection',
  },
};

export const NoNFTs: Story = {
  args: {
    selectedNFTs: [],
    continueText: 'Continue',
  },
};

export const CustomHeight: Story = {
  args: {
    selectedNFTs: largeMockSelection,
    maxHeight: 200,
    continueText: 'Continue',
  },
};

export const LongNames: Story = {
  args: {
    selectedNFTs: [
      {
        id: '1',
        name: 'This is a Very Long NFT Name That Should Be Truncated Properly',
        image: 'https://via.placeholder.com/150x150/6366F1/FFFFFF?text=Long',
        collection: 'Super Long Collection Name That Also Should Be Truncated',
      },
      {
        id: '2',
        name: 'Another Long NFT Name',
        image: 'https://via.placeholder.com/150x150/F59E0B/FFFFFF?text=Long2',
        collection: 'Short Col',
      },
    ],
    continueText: 'Continue',
  },
};

export const Interactive: Story = {
  render: function InteractiveRender() {
    const [selectedNFTs, setSelectedNFTs] = useState(mockSelectedNFTs);

    const handleRemoveNFT = (id: string) => {
      setSelectedNFTs((prev) => prev.filter((nft) => nft.id !== id));
    };

    const handleContinue = () => {
      alert(`Continuing with ${selectedNFTs.length} NFTs selected`);
    };

    return (
      <NFTSelectionBar
        selectedNFTs={selectedNFTs}
        onRemoveNFT={handleRemoveNFT}
        onContinue={handleContinue}
        continueText={`Continue with ${selectedNFTs.length} NFTs`}
      />
    );
  },
};

export const WithoutContinueButton: Story = {
  args: {
    selectedNFTs: mockSelectedNFTs,
    // No onContinue prop, so no button will show
  },
};

export const WithoutRemoveButton: Story = {
  args: {
    selectedNFTs: mockSelectedNFTs,
    // No onRemoveNFT prop, so no remove buttons will show
    continueText: 'View Only Mode',
  },
};
