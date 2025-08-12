import type { Meta, StoryObj } from '@storybook/react-vite';
import React from 'react';
import { YStack } from 'tamagui';

import { NFTSendPreview, type NFTSendData } from '../src/components/NFTSendPreview';

const meta: Meta<typeof NFTSendPreview> = {
  title: 'Components/NFTSendPreview',
  component: NFTSendPreview,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'NFTSendPreview displays an NFT in a send flow with collection name, NFT name, and optional edit functionality.',
      },
    },
  },
  argTypes: {
    showEditButton: { control: 'boolean' },
    sectionTitle: { control: 'text' },
    imageSize: { control: 'number', min: 60, max: 150 },
    backgroundColor: { control: 'color' },
    borderRadius: { control: 'text' },
    contentPadding: { control: 'number', min: 8, max: 32 },
    onEditPress: { action: 'edit-pressed' },
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
type Story = StoryObj<typeof NFTSendPreview>;

// Mock NFT data
const mockNFT: NFTSendData = {
  id: '1234',
  name: 'Cool Cat #1234',
  image: 'https://via.placeholder.com/400x400/6366F1/FFFFFF?text=Cool+Cat',
  collection: 'Cool Cats Collection',
  collectionContractName: 'CoolCats',
  description:
    'Cool Cat #1234 is a unique digital collectible featuring a stylish cat with rare traits.',
};

const basketballNFT: NFTSendData = {
  id: '5678',
  name: 'LeBron James Dunk #45',
  image: 'https://via.placeholder.com/400x400/F59E0B/FFFFFF?text=LeBron',
  collection: 'NBA Top Shot',
  collectionContractName: 'TopShotContract',
  description: 'An epic dunk by LeBron James during the 2023 playoffs.',
};

const pixelArtNFT: NFTSendData = {
  id: '9012',
  name: 'Pixel Warrior #347',
  image: 'https://via.placeholder.com/400x400/8B5CF6/FFFFFF?text=Pixel',
  collection: 'Pixel Warriors',
  collectionContractName: 'PixelWarriors',
  description: 'A fierce digital warrior from the pixelated realm.',
};

export const Default: Story = {
  args: {
    nft: mockNFT,
  },
};

export const WithoutImage: Story = {
  args: {
    nft: {
      ...mockNFT,
      image: undefined,
    },
  },
};

export const WithoutEditButton: Story = {
  args: {
    nft: mockNFT,
    showEditButton: false,
  },
};

export const CustomTitle: Story = {
  args: {
    nft: mockNFT,
    sectionTitle: 'Selected NFT',
  },
};

export const SmallImage: Story = {
  args: {
    nft: mockNFT,
    imageSize: 64,
  },
};

export const LargeImage: Story = {
  args: {
    nft: mockNFT,
    imageSize: 120,
  },
};

export const CompactPadding: Story = {
  args: {
    nft: mockNFT,
    contentPadding: 12,
  },
};

export const NoDescription: Story = {
  args: {
    nft: {
      ...mockNFT,
      description: undefined,
    },
  },
};

export const LongName: Story = {
  args: {
    nft: {
      ...mockNFT,
      name: 'This is a very long NFT name that should wrap properly and be truncated if needed',
      collection: 'Very Long Collection Name That Should Also Handle Wrapping',
    },
  },
};

export const LongDescription: Story = {
  args: {
    nft: {
      ...mockNFT,
      description:
        'This is a very long description that should demonstrate how the component handles extensive text content. The description can contain multiple sentences and should be truncated properly to maintain the layout.',
    },
  },
};

export const BasketballMoment: Story = {
  args: {
    nft: basketballNFT,
    sectionTitle: 'Send Moment',
  },
};

export const PixelArt: Story = {
  args: {
    nft: pixelArtNFT,
  },
};

export const CustomStyling: Story = {
  args: {
    nft: mockNFT,
    backgroundColor: '$blue2',
    borderRadius: '$6',
    contentPadding: 20,
  },
};

export const Interactive: Story = {
  render: function InteractiveRender() {
    const [editCount, setEditCount] = React.useState(0);

    return (
      <NFTSendPreview
        nft={mockNFT}
        onEditPress={() => {
          setEditCount((prev) => prev + 1);
          alert(`Edit pressed ${editCount + 1} times!`);
        }}
        sectionTitle={`Send NFT ${editCount > 0 ? `(Edited ${editCount}x)` : ''}`}
      />
    );
  },
};

export const Gallery: Story = {
  render: () => (
    <YStack gap="$4" width={400}>
      <NFTSendPreview nft={mockNFT} sectionTitle="Cool Cat" />
      <NFTSendPreview nft={basketballNFT} sectionTitle="NBA Moment" />
      <NFTSendPreview nft={pixelArtNFT} sectionTitle="Pixel Art" />
    </YStack>
  ),
  decorators: [
    (Story) => (
      <YStack p="$4">
        <Story />
      </YStack>
    ),
  ],
};

export const DifferentSizes: Story = {
  render: () => (
    <YStack gap="$4" width={400}>
      <NFTSendPreview nft={mockNFT} imageSize={60} sectionTitle="Small (60px)" />
      <NFTSendPreview nft={mockNFT} imageSize={92} sectionTitle="Default (92px)" />
      <NFTSendPreview nft={mockNFT} imageSize={120} sectionTitle="Large (120px)" />
    </YStack>
  ),
  decorators: [
    (Story) => (
      <YStack p="$4">
        <Story />
      </YStack>
    ),
  ],
};

export const ImageError: Story = {
  args: {
    nft: {
      ...mockNFT,
      image: 'invalid-url',
    },
  },
};
