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
    backgroundColor: { control: 'color' },
    borderRadius: { control: 'text' },
    contentPadding: { control: 'number', min: 0, max: 32 },
    onRemoveNFT: { action: 'nft-removed' },
  },
  decorators: [
    (Story) => (
      <YStack width={400} p="$4">
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

export const TwoNFTs: Story = {
  args: {
    nfts: twoNFTs,
  },
};

export const ThreeNFTs: Story = {
  args: {
    nfts: threeNFTs,
  },
};

export const FiveNFTs: Story = {
  args: {
    nfts: fiveNFTs,
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

export const CustomThumbnailCount: Story = {
  args: {
    nfts: tenNFTs,
    maxVisibleThumbnails: 5,
  },
};

export const SmallThumbnails: Story = {
  args: {
    nfts: fiveNFTs,
    thumbnailSize: 60,
  },
};

export const LargeThumbnails: Story = {
  args: {
    nfts: fiveNFTs,
    thumbnailSize: 100,
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

export const Interactive: Story = {
  render: function InteractiveRender() {
    const [nfts, setNfts] = useState(fiveNFTs);

    const handleRemoveNFT = (nftId: string) => {
      setNfts((prev) => prev.filter((nft) => nft.id !== nftId));
    };

    const handleAddNFT = () => {
      const newNFT: NFTSendData = {
        id: `nft-${Date.now()}`,
        name: `New NFT #${nfts.length + 1}`,
        image: `https://via.placeholder.com/400x400/EC4899/FFFFFF?text=New+${nfts.length + 1}`,
        collection: 'New Collection',
        description: 'A newly added NFT',
      };
      setNfts((prev) => [...prev, newNFT]);
    };

    const handleReset = () => {
      setNfts(fiveNFTs);
    };

    return (
      <YStack gap="$4" width={400}>
        <YStack gap="$2">
          <YStack fontSize="$4" fontWeight="600" color="$color">
            Interactive Demo
          </YStack>
          <YStack fontSize="$3" color="$gray11">
            Try expanding the list and removing NFTs
          </YStack>
        </YStack>

        <MultipleNFTsPreview nfts={nfts} onRemoveNFT={handleRemoveNFT} />

        <YStack gap="$2" flexDirection="row">
          <YStack
            bg="$blue9"
            rounded="$3"
            px="$3"
            py="$2"
            pressStyle={{ opacity: 0.8 }}
            onPress={handleAddNFT}
            cursor="pointer"
          >
            <YStack fontSize="$3" color="$white" fontWeight="500">
              Add NFT
            </YStack>
          </YStack>
          <YStack
            bg="$gray8"
            rounded="$3"
            px="$3"
            py="$2"
            pressStyle={{ opacity: 0.8 }}
            onPress={handleReset}
            cursor="pointer"
          >
            <YStack fontSize="$3" color="$white" fontWeight="500">
              Reset
            </YStack>
          </YStack>
        </YStack>
      </YStack>
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
