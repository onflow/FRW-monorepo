import type { Meta, StoryObj } from '@storybook/react-vite';
import React from 'react';
import { XStack, YStack } from 'tamagui';

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
    showAmount: { control: 'boolean' },
    aspectRatio: { control: 'number', min: 0.5, max: 2, step: 0.1 },
    size: { control: 'select', options: ['small', 'medium', 'large'] },
    onPress: { action: 'pressed' },
    onSelect: { action: 'selected' },
  },
  decorators: [
    (Story) => (
      <YStack p="$4" width={200}>
        <Story />
      </YStack>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof NFTCard>;

// Mock NFT data
const mockNFT: NFTData = {
  id: '1',
  name: 'Cool Cat #1234',
  image: 'https://via.placeholder.com/300x300/6366F1/FFFFFF?text=NFT',
  thumbnail: 'https://via.placeholder.com/150x150/6366F1/FFFFFF?text=NFT',
  collection: 'Cool Cats',
};

const mockNFTWithAmount: NFTData = {
  ...mockNFT,
  name: 'ERC1155 Token',
  amount: '5',
  collection: 'Multi-Edition Collection',
};

export const Default: Story = {
  args: {
    nft: mockNFT,
  },
};

export const Selected: Story = {
  args: {
    nft: mockNFT,
    selected: true,
  },
};

export const WithAmount: Story = {
  args: {
    nft: mockNFTWithAmount,
    showAmount: true,
  },
};

export const SmallSize: Story = {
  args: {
    nft: mockNFT,
    size: 'small',
  },
  decorators: [
    (Story) => (
      <YStack p="$4" width={150}>
        <Story />
      </YStack>
    ),
  ],
};

export const LargeSize: Story = {
  args: {
    nft: mockNFT,
    size: 'large',
  },
  decorators: [
    (Story) => (
      <YStack p="$4" width={250}>
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
  },
};

export const NoCollection: Story = {
  args: {
    nft: {
      id: '2',
      name: 'Standalone NFT',
      image: 'https://via.placeholder.com/300x300/10B981/FFFFFF?text=Solo',
    },
  },
};

export const SquareAspectRatio: Story = {
  args: {
    nft: mockNFT,
    aspectRatio: 1,
  },
};

export const WideAspectRatio: Story = {
  args: {
    nft: {
      ...mockNFT,
      name: 'Wide NFT',
      image: 'https://via.placeholder.com/400x200/F59E0B/FFFFFF?text=Wide',
    },
    aspectRatio: 2,
  },
};

export const TallAspectRatio: Story = {
  args: {
    nft: {
      ...mockNFT,
      name: 'Tall NFT',
      image: 'https://via.placeholder.com/200x400/EF4444/FFFFFF?text=Tall',
    },
    aspectRatio: 0.5,
  },
  decorators: [
    (Story) => (
      <YStack p="$4" width={200} height={450}>
        <Story />
      </YStack>
    ),
  ],
};

export const Interactive: Story = {
  args: {
    nft: mockNFT,
    onPress: () => alert('NFT pressed!'),
    onSelect: () => alert('NFT selected!'),
  },
};

export const Grid: Story = {
  render: () => (
    <XStack flexWrap="wrap" gap="$3" maxWidth={450}>
      {[
        { ...mockNFT, id: '1', name: 'NFT #1' },
        { ...mockNFT, id: '2', name: 'NFT #2', collection: 'Different Collection' },
        { ...mockNFTWithAmount, id: '3', name: 'NFT #3' },
        { ...mockNFT, id: '4', name: 'Selected NFT' },
        { ...mockNFT, id: '5', name: 'NFT #5' },
        { ...mockNFT, id: '6', name: 'NFT #6' },
      ].map((nft, index) => (
        <YStack key={nft.id} width="48%">
          <NFTCard
            nft={nft}
            selected={index === 3}
            showAmount={index === 2}
            onPress={() => console.log(`Pressed ${nft.name}`)}
            onSelect={() => console.log(`Selected ${nft.name}`)}
          />
        </YStack>
      ))}
    </XStack>
  ),
  decorators: [
    (Story) => (
      <YStack p="$4">
        <Story />
      </YStack>
    ),
  ],
};
