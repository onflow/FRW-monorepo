import type { Meta, StoryObj } from '@storybook/react-vite';
import React from 'react';
import { YStack } from 'tamagui';

import { NFTDetailView, type NFTDetailData } from '../src/components/NFTDetailView';

const meta: Meta<typeof NFTDetailView> = {
  title: 'Components/NFTDetailView',
  component: NFTDetailView,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'NFTDetailView displays comprehensive NFT information including image, metadata, properties, and owner details.',
      },
    },
  },
  argTypes: {
    selected: { control: 'boolean' },
    selectable: { control: 'boolean' },
    showOwner: { control: 'boolean' },
    backgroundColor: { control: 'color' },
    contentPadding: { control: 'number', min: 8, max: 32 },
    onToggleSelection: { action: 'selection-toggled' },
  },
  decorators: [
    (Story) => (
      <YStack height={700} width="100%">
        <Story />
      </YStack>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof NFTDetailView>;

// Mock NFT data
const mockNFT: NFTDetailData = {
  id: '1234',
  name: 'Cool Cat #1234',
  image: 'https://via.placeholder.com/600x600/6366F1/FFFFFF?text=Cool+Cat',
  collection: 'Cool Cats Collection',
  description:
    'Cool Cat #1234 is a unique digital collectible featuring a stylish cat with rare traits. This NFT is part of the Cool Cats collection, known for its distinctive art style and vibrant community.',
  contractName: 'CoolCats',
  contractAddress: '0x1234567890abcdef1234567890abcdef12345678',
  collectionContractName: 'CoolCatsCollection',
};

const springTideNFT: NFTDetailData = {
  id: '1',
  name: 'Spring Tide #1',
  image: 'https://via.placeholder.com/343x343/6366F1/FFFFFF?text=Spring+Tide',
  collection: 'NBA Top Shot',
  description:
    'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad min',
  contractName: 'FutureScience',
  contractAddress: '0xabcdef1234567890abcdef1234567890abcdef12',
  properties: [
    { label: 'Background', value: 'Green' },
    { label: 'Shapes', value: 'Obstructed' },
    { label: 'Choker', value: 'Gold' },
    { label: 'Pendant', value: 'Studded' },
    { label: 'Eyes', value: 'Standard' },
    { label: 'Head', value: 'Straw Hat' },
    { label: 'Series', value: '3' },
    { label: 'Mask', value: 'Blue' },
    { label: 'Halo', value: 'Gold' },
  ],
};

const pixelArtNFT: NFTDetailData = {
  id: '9012',
  name: 'Pixel Warrior #347',
  image: 'https://via.placeholder.com/600x600/8B5CF6/FFFFFF?text=Pixel',
  collection: 'Pixel Warriors',
  description:
    'A fierce digital warrior from the pixelated realm. Each Pixel Warrior is unique and battle-ready.',
  contractName: 'PixelWarriors',
  contractAddress: '0x9876543210fedcba9876543210fedcba98765432',
};

const mockOwner = {
  name: '🐼',
  avatar: '',
  address: '0x1234567890abcdef1234567890abcdef12345678',
};

export const Default: Story = {
  args: {
    nft: mockNFT,
  },
};

export const WithOwner: Story = {
  args: {
    nft: mockNFT,
    owner: mockOwner,
    showOwner: true,
  },
};

export const Selected: Story = {
  args: {
    nft: mockNFT,
    selectable: true,
    selected: true,
    owner: mockOwner,
    showOwner: true,
  },
};

export const WithProperties: Story = {
  args: {
    nft: springTideNFT,
    owner: mockOwner,
    showOwner: true,
  },
};

export const MinimalInfo: Story = {
  args: {
    nft: pixelArtNFT,
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

export const LongDescription: Story = {
  args: {
    nft: {
      ...mockNFT,
      description:
        "This is a very long description that should demonstrate how the component handles extensive text content. The description can contain multiple sentences and should wrap properly within the available space. It might include details about the NFT's creation, inspiration, artistic process, rarity, and significance within the broader collection or art movement.",
    },
    owner: mockOwner,
    showOwner: true,
  },
};
