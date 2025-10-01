import type { NFTModel } from '@onflow/frw-types';
import type { Meta, StoryObj } from '@storybook/react-vite';
import React, { useState } from 'react';
import { YStack } from 'tamagui';

import { MultipleNFTsPreview } from '../src/components/MultipleNFTsPreview';

const meta: Meta<typeof MultipleNFTsPreview> = {
  title: 'Components/MultipleNFTsPreview',
  component: MultipleNFTsPreview,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'MultipleNFTsPreview displays multiple NFTs in a compact format with expand/collapse functionality and optional remove capability.',
      },
    },
  },
  argTypes: {
    maxVisibleThumbnails: { control: 'number', min: 1, max: 6 },
    expandable: { control: 'boolean' },
    thumbnailSize: { control: 'number', min: 40, max: 120 },
    backgroundColor: { control: 'color' },
    borderRadius: { control: 'text' },
    contentPadding: { control: 'number', min: 0, max: 32 },
    onRemoveNFT: { action: 'nft-removed' },
  },
  decorators: [
    (Story): React.JSX.Element => (
      <YStack width={400} padding="$4">
        <Story />
      </YStack>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof MultipleNFTsPreview>;

// Mock NFT data
import type { NFTTransactionData } from '@onflow/frw-types';
type NFTWithExtras = NFTTransactionData & { collection?: string };

const createMockNFTs = (count: number): NFTWithExtras[] =>
  Array.from({ length: count }, (_, index) => ({
    id: `nft-${index + 1}`,
    name: `NFT #${index + 1}`,
    thumbnail: `https://via.placeholder.com/400x400/${
      ['6366F1', 'F59E0B', '10B981', '8B5CF6', 'EF4444', '06B6D4'][index % 6]
    }/FFFFFF?text=NFT+${index + 1}`,
    collection: `Collection ${Math.floor(index / 3) + 1}`,
    collectionName: `Collection ${Math.floor(index / 3) + 1}`,
    description: `Description for NFT #${index + 1}`,
    type: 'flow' as const,
  }));

const twoNFTs = createMockNFTs(2);
const threeNFTs = createMockNFTs(3);
const fiveNFTs = createMockNFTs(5);
const _tenNFTs = createMockNFTs(10);
const twentyNFTs = createMockNFTs(20);

// Mock NFT data with missing images for fallback testing
const createMockNFTsWithoutImages = (count: number): NFTWithExtras[] =>
  Array.from({ length: count }, (_, index) => ({
    id: `nft-${index + 1}`,
    name: `NFT #${index + 1}`,
    // No thumbnail property to test fallback
    collection: `Collection ${Math.floor(index / 3) + 1}`,
    collectionName: `Collection ${Math.floor(index / 3) + 1}`,
    description: `Description for NFT #${index + 1}`,
    type: 'flow' as const,
  }));

const nftsWithoutImages = createMockNFTsWithoutImages(3);

export const Default: Story = {
  args: {
    nfts: twoNFTs,
    showEditButton: true,
    onEditPress: () => {
      /* Edit pressed */
    },
  },
};

export const EmptyState: Story = {
  args: {
    nfts: [],
    showEditButton: true,
    onEditPress: () => {
      /* Edit pressed */
    },
  },
};

export const WithFallbackThumbnails: Story = {
  args: {
    nfts: nftsWithoutImages,
    showEditButton: true,
    onEditPress: () => {
      /* Edit pressed */
    },
  },
};

export const ThreeNFTs: Story = {
  args: {
    nfts: threeNFTs,
    showEditButton: true,
    onEditPress: () => {
      /* Edit pressed */
    },
  },
};

export const FiveNFTs: Story = {
  args: {
    nfts: fiveNFTs,
    showEditButton: true,
    onEditPress: () => {
      /* Edit pressed */
    },
  },
};

export const TwentyNFTs: Story = {
  args: {
    nfts: twentyNFTs,
    showEditButton: true,
    onEditPress: () => {
      /* Edit pressed */
    },
  },
};

export const MixedImages: Story = {
  args: {
    nfts: [...createMockNFTs(2), ...createMockNFTsWithoutImages(2)],
    showEditButton: true,
    onEditPress: () => {
      /* Edit pressed */
    },
  },
};

export const WithRemovalInteraction: Story = {
  render: (args) => {
    const [nfts, setNfts] = useState(args.nfts);

    const handleRemove = (nftId: string) => {
      setNfts((prev) => prev.filter((nft) => nft.id !== nftId));
    };

    return <MultipleNFTsPreview {...args} nfts={nfts} onRemoveNFT={handleRemove} />;
  },
  args: {
    nfts: fiveNFTs,
    showEditButton: true,
    onEditPress: () => {
      /* Edit pressed */
    },
  },
};
