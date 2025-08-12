import type { Meta, StoryObj } from '@storybook/react-vite';
import React, { useState } from 'react';
import { YStack } from 'tamagui';

import { NFTGrid, type NFTData } from '../src/components/NFTGrid';

const meta: Meta<typeof NFTGrid> = {
  title: 'Components/NFTGrid',
  component: NFTGrid,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'NFTGrid displays a grid of NFT cards with selection support, loading states, and empty states.',
      },
    },
  },
  argTypes: {
    isLoading: { control: 'boolean' },
    showClearSearch: { control: 'boolean' },
    columns: { control: 'number', min: 1, max: 4 },
    gap: { control: 'number', min: 4, max: 32 },
    aspectRatio: { control: 'number', min: 0.5, max: 2, step: 0.1 },
    emptyTitle: { control: 'text' },
    emptyMessage: { control: 'text' },
    error: { control: 'text' },
    onNFTSelect: { action: 'nft-selected' },
    onNFTPress: { action: 'nft-pressed' },
    onRetry: { action: 'retry' },
    onClearSearch: { action: 'clear-search' },
  },
  decorators: [
    (Story) => (
      <YStack height={600} width="100%" p="$4">
        <Story />
      </YStack>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof NFTGrid>;

// Mock NFT data
const mockNFTs: NFTData[] = [
  {
    id: '1',
    name: 'Cool Cat #1234',
    image: 'https://via.placeholder.com/300x300/6366F1/FFFFFF?text=CC1',
    collection: 'Cool Cats',
  },
  {
    id: '2',
    name: 'Bored Ape #5678',
    image: 'https://via.placeholder.com/300x300/F59E0B/FFFFFF?text=BA2',
    collection: 'BAYC',
  },
  {
    id: '3',
    name: 'CryptoPunk #9012',
    image: 'https://via.placeholder.com/300x300/EF4444/FFFFFF?text=CP3',
    collection: 'CryptoPunks',
  },
  {
    id: '4',
    name: 'Azuki #3456',
    image: 'https://via.placeholder.com/300x300/10B981/FFFFFF?text=AZ4',
    collection: 'Azuki',
  },
  {
    id: '5',
    name: 'Doodle #7890',
    image: 'https://via.placeholder.com/300x300/8B5CF6/FFFFFF?text=DD5',
    collection: 'Doodles',
  },
  {
    id: '6',
    name: 'Clone X #2468',
    image: 'https://via.placeholder.com/300x300/EC4899/FFFFFF?text=CX6',
    collection: 'Clone X',
  },
];

const mockNFTsWithAmounts: NFTData[] = mockNFTs.map((nft, index) => ({
  ...nft,
  amount: Math.floor(Math.random() * 10) + 1,
}));

export const Default: Story = {
  args: {
    data: mockNFTs,
  },
};

export const WithSelection: Story = {
  args: {
    data: mockNFTs,
    selectedIds: ['1', '3', '5'],
  },
};

export const Loading: Story = {
  args: {
    data: [],
    isLoading: true,
  },
};

export const Empty: Story = {
  args: {
    data: [],
    emptyTitle: 'No NFTs Found',
    emptyMessage: 'This collection is empty or no NFTs match your search criteria.',
  },
};

export const EmptyWithClearSearch: Story = {
  args: {
    data: [],
    emptyTitle: 'No Search Results',
    emptyMessage: 'No NFTs match your search. Try different keywords.',
    showClearSearch: true,
    clearSearchText: 'Clear Search',
  },
};

export const Error: Story = {
  args: {
    data: [],
    error: 'Failed to load NFTs. Please check your connection and try again.',
    retryText: 'Retry Loading',
  },
};

export const ThreeColumns: Story = {
  args: {
    data: mockNFTs,
    columns: 3,
  },
};

export const SingleColumn: Story = {
  args: {
    data: mockNFTs.slice(0, 3),
    columns: 1,
  },
};

export const LargeGap: Story = {
  args: {
    data: mockNFTs,
    gap: 24,
  },
};

export const WideAspectRatio: Story = {
  args: {
    data: mockNFTs.map((nft) => ({
      ...nft,
      image: nft.image.replace('300x300', '400x200'),
    })),
    aspectRatio: 2,
  },
};

export const Interactive: Story = {
  render: function InteractiveRender() {
    const [selectedIds, setSelectedIds] = useState<string[]>(['1']);

    const handleNFTSelect = (id: string) => {
      setSelectedIds((prev) =>
        prev.includes(id) ? prev.filter((selectedId) => selectedId !== id) : [...prev, id]
      );
    };

    return (
      <NFTGrid
        data={mockNFTs}
        selectedIds={selectedIds}
        onNFTSelect={handleNFTSelect}
        onNFTPress={(nft) => alert(`Pressed: ${nft.name}`)}
      />
    );
  },
};

export const LargeDataset: Story = {
  args: {
    data: Array.from({ length: 20 }, (_, index) => ({
      id: `${index + 1}`,
      name: `NFT #${index + 1}`,
      image: `https://via.placeholder.com/300x300/${Math.floor(Math.random() * 16777215).toString(16)}/FFFFFF?text=${index + 1}`,
      collection: `Collection ${Math.floor(index / 4) + 1}`,
    })),
  },
};

export const WithAmounts: Story = {
  args: {
    data: mockNFTsWithAmounts,
    selectedIds: ['2', '4'],
  },
};
