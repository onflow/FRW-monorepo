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
    (Story): React.JSX.Element => (
      <YStack width={400} padding="$4">
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
  name: 'Spring Tide #1',
  image: 'https://via.placeholder.com/92x92/627EEA/FFFFFF?text=🏀',
  collection: 'NBA Top Shot',
  collectionContractName: 'TopShot',
  description:
    'NBA Top Shot moments are unique digital collectibles featuring basketball highlights.',
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
