import type { Meta, StoryObj } from '@storybook/react-vite';
import React from 'react';
import { YStack } from 'tamagui';

import { NFTCard } from '../src/components/NFTCard';
import type { NFTData } from '../src/components/NFTGrid';

const meta: Meta<typeof NFTCard> = {
  title: 'Components/NFTCard',
  component: NFTCard,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'NFTCard displays individual NFT information with image, name, collection, and selection state.',
      },
    },
  },
  argTypes: {
    selected: { control: 'boolean' },
    aspectRatio: { control: 'number', min: 0.5, max: 2, step: 0.1 },
    size: { control: 'select', options: ['small', 'medium', 'large'] },
    collectionAvatar: {
      control: 'text',
      description: 'URL for collection avatar image (fallback)',
    },
    accountEmoji: { control: 'text', description: 'Emoji for account avatar in collection info' },
    accountAvatar: {
      control: 'text',
      description: 'URL for account avatar image in collection info',
    },
    onPress: { action: 'pressed' },
  },
  decorators: [
    (Story): React.JSX.Element => (
      <YStack padding="$4" width={200}>
        <Story />
      </YStack>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof NFTCard>;

// Mock NFT data with realistic placeholder images
const mockNFT: NFTData = {
  id: '1',
  name: 'Spring Tide #1',
  image:
    'https://images.unsplash.com/photo-1634973357973-f2ed2657db3c?w=400&h=400&fit=crop&crop=center',
  thumbnail:
    'https://images.unsplash.com/photo-1634973357973-f2ed2657db3c?w=200&h=200&fit=crop&crop=center',
  collection: 'Ocean Collection',
};

const mockNFTArt: NFTData = {
  id: '2',
  name: 'Digital Harmony #42',
  image:
    'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=400&h=400&fit=crop&crop=center',
  thumbnail:
    'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=200&h=200&fit=crop&crop=center',
  collection: 'Abstract Arts',
};

export const Default: Story = {
  args: {
    nft: mockNFT,
    accountEmoji: '🦊',
  },
};

export const Selected: Story = {
  args: {
    nft: mockNFT,
    selected: true,
    accountEmoji: '🦊',
  },
};

export const WithAccountAvatar: Story = {
  args: {
    nft: mockNFTArt,
    accountAvatar:
      'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=32&h=32&fit=crop&crop=center',
  },
};

export const SmallSize: Story = {
  args: {
    nft: mockNFT,
    size: 'small',
    accountEmoji: '🦊',
  },
  decorators: [
    (Story): React.JSX.Element => (
      <YStack padding="$4" width={150}>
        <Story />
      </YStack>
    ),
  ],
};

export const LongName: Story = {
  args: {
    nft: {
      ...mockNFT,
      name: 'This is a Very Long NFT Name That Should Be Truncated',
      collection: 'Very Long Collection Name Here',
    },
    // No accountEmoji or accountAvatar provided - text should still align left
  },
};
