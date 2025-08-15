import type { Meta, StoryObj } from '@storybook/react-vite';
import React, { useState } from 'react';
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
    onToggleSelection: { action: 'selection-toggled' },
  },
  decorators: [
    (Story) => (
      <YStack height={700} width="100%" items="center" bg="$gray12" p="$4">
        <Story />
      </YStack>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof NFTDetailView>;

// Mock NFT data - using Figma design reference
const mockNFT: NFTDetailData = {
  id: '1',
  name: 'Spring Tide #1',
  image: 'https://via.placeholder.com/343x343/6366F1/FFFFFF?text=Spring+Tide',
  collection: 'NBA Top Shot',
  description:
    'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad min',
  contractName: 'TopShot',
  contractAddress: '0x1234567890abcdef1234567890abcdef12345678',
  collectionContractName: 'FutureScience',
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

const basketballNFT: NFTDetailData = {
  id: '5678',
  name: 'LeBron James Dunk #45',
  image: 'https://via.placeholder.com/600x600/F59E0B/FFFFFF?text=LeBron',
  collection: 'NBA Top Shot',
  description:
    'An epic dunk by LeBron James during the 2023 playoffs. This moment captures the intensity and athleticism that defines greatness on the basketball court.',
  contractName: 'TopShotContract',
  contractAddress: '0xabcdef1234567890abcdef1234567890abcdef12',
  properties: [
    { label: 'Player', value: 'LeBron James' },
    { label: 'Team', value: 'Los Angeles Lakers' },
    { label: 'Date', value: 'May 15, 2023' },
    { label: 'Rarity', value: 'Legendary' },
    { label: 'Serial', value: '45/100' },
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
  name: 'John Doe',
  avatar: 'https://via.placeholder.com/40x40/10B981/FFFFFF?text=JD',
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

export const Selectable: Story = {
  args: {
    nft: mockNFT,
    selectable: true,
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
    nft: basketballNFT,
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

export const ManyProperties: Story = {
  args: {
    nft: {
      ...mockNFT,
      properties: [
        { label: 'Background', value: 'Cosmic' },
        { label: 'Body', value: 'Rainbow' },
        { label: 'Eyes', value: 'Laser' },
        { label: 'Hat', value: 'Crown' },
        { label: 'Mouth', value: 'Smile' },
        { label: 'Clothes', value: 'Tuxedo' },
        { label: 'Accessory', value: 'Sunglasses' },
        { label: 'Special', value: 'Glowing' },
        { label: 'Edition', value: '1 of 1' },
        { label: 'Generation', value: 'Gen 2' },
      ],
    },
  },
};

export const Interactive: Story = {
  render: function InteractiveRender() {
    const [selected, setSelected] = useState(false);

    return (
      <NFTDetailView
        nft={basketballNFT}
        selected={selected}
        selectable={true}
        onToggleSelection={() => setSelected(!selected)}
        owner={mockOwner}
        showOwner={true}
      />
    );
  },
};

export const CustomStyling: Story = {
  args: {
    nft: mockNFT,
    backgroundColor: '$gray1',
    owner: mockOwner,
    showOwner: true,
  },
};
