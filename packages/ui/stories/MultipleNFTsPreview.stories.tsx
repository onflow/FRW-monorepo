import type { Meta, StoryObj } from '@storybook/react-vite';
import React, { useState } from 'react';
import { YStack } from 'tamagui';

import { MultipleNFTsPreview } from '../src/components/MultipleNFTsPreview';
import type { NFTSendData } from '../src/components/NFTSendPreview';

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
    sectionTitle: { control: 'text' },
    showTopDivider: { control: 'boolean' },
    onRemoveNFT: { action: 'nft-removed' },
    onEditPress: { action: 'edit-pressed' },
  },
  decorators: [
    (Story) => (
      <YStack width={375} p="$4" backgroundColor="$gray12" alignItems="center">
        <Story />
      </YStack>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof MultipleNFTsPreview>;

// Mock NFT data
const createMockNFTs = (count: number): NFTSendData[] =>
  Array.from({ length: count }, (_, index) => ({
    id: `nft-${index + 1}`,
    name: `NFT #${index + 1}`,
    image: `https://via.placeholder.com/400x400/${
      ['6366F1', 'F59E0B', '10B981', '8B5CF6', 'EF4444', '06B6D4'][index % 6]
    }/FFFFFF?text=NFT+${index + 1}`,
    collection: `Collection ${Math.floor(index / 3) + 1}`,
    description: `Description for NFT #${index + 1}`,
  }));

const twoNFTs = createMockNFTs(2);
const threeNFTs = createMockNFTs(3);
const fiveNFTs = createMockNFTs(5);
const tenNFTs = createMockNFTs(10);
const twentyNFTs = createMockNFTs(20);

export const Default: Story = {
  args: {
    nfts: threeNFTs,
  },
};

export const FigmaDesignExample: Story = {
  args: {
    nfts: [
      {
        id: '1',
        name: 'NFT #1',
        image: 'https://via.placeholder.com/400x400/4A9FFF/FFFFFF?text=NFT+1',
        collection: 'Collection A',
        description: 'First NFT',
      },
      {
        id: '2',
        name: 'NFT #2',
        image: 'https://via.placeholder.com/400x400/00EF8B/FFFFFF?text=NFT+2',
        collection: 'Collection B',
        description: 'Second NFT',
      },
      {
        id: '3',
        name: 'NFT #3',
        image: 'https://via.placeholder.com/400x400/FF6B6B/FFFFFF?text=NFT+3',
        collection: 'Collection C',
        description: 'Third NFT',
      },
      {
        id: '4',
        name: 'NFT #4',
        image: 'https://via.placeholder.com/400x400/8B5CF6/FFFFFF?text=NFT+4',
        collection: 'Collection D',
        description: 'Fourth NFT',
      },
    ],
    sectionTitle: 'Send NFTs',
  },
};

export const WithTopDivider: Story = {
  args: {
    nfts: fiveNFTs,
    showTopDivider: true,
  },
};

export const TenNFTs: Story = {
  args: {
    nfts: tenNFTs,
  },
};

export const ManyNFTs: Story = {
  args: {
    nfts: twentyNFTs,
  },
};

export const NotExpandable: Story = {
  args: {
    nfts: fiveNFTs,
    expandable: false,
  },
};

export const WithBackground: Story = {
  args: {
    nfts: fiveNFTs,
    backgroundColor: '$gray2',
    borderRadius: '$4',
    contentPadding: 16,
  },
};

export const WithoutImages: Story = {
  args: {
    nfts: fiveNFTs.map((nft) => ({ ...nft, image: undefined })),
  },
};

export const WithEditButton: Story = {
  args: {
    nfts: fiveNFTs,
    sectionTitle: 'Send NFTs',
  },
};

export const Interactive: Story = {
  render: function InteractiveRender() {
    const [nfts, setNfts] = useState(fiveNFTs);

    const handleRemoveNFT = (nftId: string) => {
      setNfts((prev) => prev.filter((nft) => nft.id !== nftId));
    };

    const handleEdit = () => {
      alert('Edit pressed!');
    };

    return (
      <MultipleNFTsPreview nfts={nfts} onRemoveNFT={handleRemoveNFT} onEditPress={handleEdit} />
    );
  },
};

export const LongNames: Story = {
  args: {
    nfts: [
      {
        id: '1',
        name: 'This is a very long NFT name that should be truncated properly',
        image: 'https://via.placeholder.com/400x400/6366F1/FFFFFF?text=Long+Name',
        collection: 'Very Long Collection Name That Should Also Be Truncated',
        description: 'A long description',
      },
      {
        id: '2',
        name: 'Another extremely long NFT name for testing text overflow behavior',
        image: 'https://via.placeholder.com/400x400/F59E0B/FFFFFF?text=Long+2',
        collection: 'Another Very Long Collection Name',
        description: 'Another description',
      },
      {
        id: '3',
        name: 'Short Name',
        image: 'https://via.placeholder.com/400x400/10B981/FFFFFF?text=Short',
        collection: 'Short Collection',
        description: 'Short description',
      },
    ],
    showTopDivider: true,
  },
};

export const DifferentCollections: Story = {
  args: {
    nfts: [
      {
        id: '1',
        name: 'Cool Cat #1234',
        image: 'https://via.placeholder.com/400x400/6366F1/FFFFFF?text=Cat',
        collection: 'Cool Cats',
        description: 'A cool cat NFT',
      },
      {
        id: '2',
        name: 'LeBron Dunk #45',
        image: 'https://via.placeholder.com/400x400/F59E0B/FFFFFF?text=NBA',
        collection: 'NBA Top Shot',
        description: 'A legendary basketball moment',
      },
      {
        id: '3',
        name: 'Pixel Warrior #347',
        image: 'https://via.placeholder.com/400x400/8B5CF6/FFFFFF?text=Pixel',
        collection: 'Pixel Warriors',
        description: 'A digital pixel art warrior',
      },
      {
        id: '4',
        name: 'Art Block #892',
        image: 'https://via.placeholder.com/400x400/EC4899/FFFFFF?text=Art',
        collection: 'Art Blocks',
        description: 'Generative art piece',
      },
      {
        id: '5',
        name: 'Crypto Punk #5555',
        image: 'https://via.placeholder.com/400x400/06B6D4/FFFFFF?text=Punk',
        collection: 'CryptoPunks',
        description: 'A rare crypto punk',
      },
    ],
  },
};

export const SingleNFTFallback: Story = {
  args: {
    nfts: [
      {
        id: '1',
        name: 'Single NFT',
        image: 'https://via.placeholder.com/400x400/6366F1/FFFFFF?text=Single',
        collection: 'Single Collection',
        description: 'Only one NFT',
      },
    ],
  },
};

export const EmptyState: Story = {
  args: {
    nfts: [],
  },
};

export const CompactLayout: Story = {
  args: {
    nfts: tenNFTs,
    thumbnailSize: 50,
    maxVisibleThumbnails: 6,
  },
  decorators: [
    (Story) => (
      <YStack width={300} p="$3">
        <Story />
      </YStack>
    ),
  ],
};

export const CustomStyling: Story = {
  args: {
    nfts: fiveNFTs,
    backgroundColor: '$blue1',
    borderRadius: '$6',
    contentPadding: 20,
    thumbnailSize: 90,
  },
};
