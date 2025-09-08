import { YStack } from '@onflow/frw-ui';
import type { Meta, StoryObj } from '@storybook/react-vite';
import React, { useState } from 'react';

import { SendSingleNFTScreen } from '../src/send/SendSingleNFTScreen';

const meta: Meta<typeof SendSingleNFTScreen> = {
  title: 'Screens/SendSingleNFTScreen',
  component: SendSingleNFTScreen,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'SendSingleNFTScreen provides a complete interface for sending a single NFT, including NFT details, account selection, and transaction confirmation.',
      },
    },
  },
  argTypes: {
    isConfirmationVisible: { control: 'boolean' },
    showEditButtons: { control: 'boolean' },
    backgroundColor: { control: 'color' },
    contentPadding: { control: 'number', min: 8, max: 32 },
    transactionFee: { control: 'text' },
    usdFee: { control: 'text' },
    isBalanceLoading: { control: 'boolean' },
    showStorageWarning: { control: 'boolean' },
    storageWarningMessage: { control: 'text' },
    isFeesFree: { control: 'boolean' },
    onEditNFTPress: { action: 'edit-nft-pressed' },
    onEditAccountPress: { action: 'edit-account-pressed' },
    onLearnMorePress: { action: 'learn-more-pressed' },
    onSendPress: { action: 'send-pressed' },
    onConfirmationClose: { action: 'confirmation-closed' },
    onTransactionConfirm: { action: 'transaction-confirmed' },
  },
  decorators: [
    (Story) => (
      <YStack height={800} width="100%">
        <Story />
      </YStack>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof SendSingleNFTScreen>;

// Mock data
const mockFromAccount = {
  address: '0x1234567890abcdef1234567890abcdef12345678',
  name: 'Main Wallet',
  avatar: 'https://via.placeholder.com/40x40/10B981/FFFFFF?text=MW',
};

const mockToAccount = {
  address: '0xabcdef1234567890abcdef1234567890abcdef12',
  name: 'John Doe',
  avatar: 'https://via.placeholder.com/40x40/6366F1/FFFFFF?text=JD',
};

const mockNFT = {
  id: '1234',
  name: 'Cool Cat #1234',
  image: 'https://via.placeholder.com/400x400/6366F1/FFFFFF?text=Cool+Cat',
  collection: 'Cool Cats Collection',
  contractName: 'CoolCats',
  contractAddress: '0x1234567890abcdef1234567890abcdef12345678',
  collectionContractName: 'CoolCatsCollection',
  description:
    'Cool Cat #1234 is a unique digital collectible featuring a stylish cat with rare traits. This NFT is part of the Cool Cats collection, known for its distinctive art style and vibrant community.',
};

const basketballNFT = {
  id: '5678',
  name: 'LeBron James Dunk #45',
  image: 'https://via.placeholder.com/400x400/F59E0B/FFFFFF?text=LeBron',
  collection: 'NBA Top Shot',
  contractName: 'TopShotContract',
  contractAddress: '0xabcdef1234567890abcdef1234567890abcdef12',
  collectionContractName: 'TopShotContract',
  description: 'An epic dunk by LeBron James during the 2023 playoffs.',
  properties: [
    { label: 'Player', value: 'LeBron James' },
    { label: 'Team', value: 'Los Angeles Lakers' },
    { label: 'Date', value: 'May 15, 2023' },
    { label: 'Rarity', value: 'Legendary' },
    { label: 'Serial', value: '45/100' },
  ],
};

const pixelArtNFT = {
  id: '9012',
  name: 'Pixel Warrior #347',
  image: 'https://via.placeholder.com/400x400/8B5CF6/FFFFFF?text=Pixel',
  collection: 'Pixel Warriors',
  contractName: 'PixelWarriors',
  contractAddress: '0x9876543210fedcba9876543210fedcba98765432',
  collectionContractName: 'PixelWarriors',
  description: 'A fierce digital warrior from the pixelated realm.',
};

export const Default: Story = {
  args: {
    selectedNFT: mockNFT,
    fromAccount: mockFromAccount,
    toAccount: mockToAccount,
    usdFee: '$0.004',
    isBalanceLoading: false,
    showStorageWarning: false,
    isFeesFree: false,
    showEditButtons: true,
  },
};

export const NoNFT: Story = {
  args: {
    selectedNFT: null,
    fromAccount: mockFromAccount,
    toAccount: mockToAccount,
  },
};

export const NoAccounts: Story = {
  args: {
    selectedNFT: mockNFT,
    fromAccount: null,
    toAccount: null,
  },
};

export const WithoutAccountNames: Story = {
  args: {
    selectedNFT: mockNFT,
    fromAccount: { address: '0x1234567890abcdef1234567890abcdef12345678' },
    toAccount: { address: '0xabcdef1234567890abcdef1234567890abcdef12' },
  },
};

export const WithoutEditButtons: Story = {
  args: {
    selectedNFT: mockNFT,
    fromAccount: mockFromAccount,
    toAccount: mockToAccount,
    showEditButtons: false,
  },
};

export const CustomFee: Story = {
  args: {
    selectedNFT: mockNFT,
    fromAccount: mockFromAccount,
    toAccount: mockToAccount,
    transactionFee: '0.005 FLOW',
    usdFee: '$0.004',
    showEditButtons: true,
  },
};

export const ConfirmationOpen: Story = {
  args: {
    selectedNFT: mockNFT,
    fromAccount: mockFromAccount,
    toAccount: mockToAccount,
    isConfirmationVisible: true,
  },
};

export const CompactPadding: Story = {
  args: {
    selectedNFT: mockNFT,
    fromAccount: mockFromAccount,
    toAccount: mockToAccount,
    contentPadding: 12,
  },
};

export const LargePadding: Story = {
  args: {
    selectedNFT: mockNFT,
    fromAccount: mockFromAccount,
    toAccount: mockToAccount,
    contentPadding: 32,
  },
};

export const BasketballMoment: Story = {
  args: {
    selectedNFT: basketballNFT,
    fromAccount: mockFromAccount,
    toAccount: mockToAccount,
  },
};

export const PixelArt: Story = {
  args: {
    selectedNFT: pixelArtNFT,
    fromAccount: mockFromAccount,
    toAccount: mockToAccount,
  },
};

export const NoImage: Story = {
  args: {
    selectedNFT: {
      ...mockNFT,
      image: undefined,
    },
    fromAccount: mockFromAccount,
    toAccount: mockToAccount,
  },
};

export const LongNames: Story = {
  args: {
    selectedNFT: {
      ...mockNFT,
      name: 'This is a very long NFT name that should wrap properly and demonstrate text handling',
      collection: 'Very Long Collection Name That Should Also Handle Text Wrapping Properly',
    },
    fromAccount: {
      ...mockFromAccount,
      name: 'Very Long Wallet Name That Demonstrates Text Handling',
    },
    toAccount: {
      ...mockToAccount,
      name: 'Another Very Long Account Name for Testing Purposes',
    },
  },
};

export const Interactive: Story = {
  render: function InteractiveRender() {
    const [selectedNFT, setSelectedNFT] = useState(mockNFT);
    const [isConfirmationVisible, setIsConfirmationVisible] = useState(false);
    const [editCount, setEditCount] = useState(0);

    const handleSendPress = () => {
      setIsConfirmationVisible(true);
    };

    const handleTransactionConfirm = async () => {
      // Simulate transaction delay
      await new Promise((resolve) => setTimeout(resolve, 2000));
      setIsConfirmationVisible(false);
      alert('NFT sent successfully!');
    };

    const handleEditNFT = () => {
      setEditCount((prev) => prev + 1);
      const nfts = [mockNFT, basketballNFT, pixelArtNFT];
      const nextNFT = nfts[editCount % nfts.length];
      setSelectedNFT(nextNFT);
    };

    return (
      <SendSingleNFTScreen
        selectedNFT={selectedNFT}
        fromAccount={mockFromAccount}
        toAccount={mockToAccount}
        isConfirmationVisible={isConfirmationVisible}
        onEditNFTPress={handleEditNFT}
        onEditAccountPress={() => alert('Edit account pressed!')}
        onSendPress={handleSendPress}
        onConfirmationClose={() => setIsConfirmationVisible(false)}
        onTransactionConfirm={handleTransactionConfirm}
      />
    );
  },
};

export const OnlyFromAccount: Story = {
  args: {
    selectedNFT: mockNFT,
    fromAccount: mockFromAccount,
    toAccount: null,
  },
};

export const OnlyToAccount: Story = {
  args: {
    selectedNFT: mockNFT,
    fromAccount: null,
    toAccount: mockToAccount,
  },
};

export const MinimalInfo: Story = {
  args: {
    selectedNFT: {
      id: '1',
      name: 'Simple NFT',
      collection: 'Basic Collection',
    },
    fromAccount: { address: '0x1234567890abcdef1234567890abcdef12345678' },
    toAccount: { address: '0xabcdef1234567890abcdef1234567890abcdef12' },
  },
};

export const CustomBackground: Story = {
  args: {
    selectedNFT: mockNFT,
    fromAccount: mockFromAccount,
    toAccount: mockToAccount,
    backgroundColor: '$gray1',
  },
};

export const HighFee: Story = {
  args: {
    selectedNFT: mockNFT,
    fromAccount: mockFromAccount,
    toAccount: mockToAccount,
    transactionFee: '0.1 FLOW',
    usdFee: '$0.075',
    showEditButtons: true,
  },
};

// New enhanced stories
export const WithStorageWarning: Story = {
  args: {
    selectedNFT: mockNFT,
    fromAccount: mockFromAccount,
    toAccount: mockToAccount,
    showStorageWarning: true,
    storageWarningMessage:
      'This NFT transfer may require additional storage setup on the recipient account.',
    usdFee: '$0.004',
    showEditButtons: true,
  },
};

export const BalanceLoading: Story = {
  args: {
    selectedNFT: mockNFT,
    fromAccount: mockFromAccount,
    toAccount: mockToAccount,
    isBalanceLoading: true,
    usdFee: '$0.004',
    showEditButtons: true,
  },
};

export const FreeFees: Story = {
  args: {
    selectedNFT: mockNFT,
    fromAccount: mockFromAccount,
    toAccount: mockToAccount,
    transactionFee: '0.000 FLOW',
    usdFee: '$0.00',
    isFeesFree: true,
    showEditButtons: true,
  },
};

export const AllEnhancedFeatures: Story = {
  args: {
    selectedNFT: basketballNFT,
    fromAccount: mockFromAccount,
    toAccount: mockToAccount,
    showStorageWarning: true,
    storageWarningMessage:
      'This NBA Top Shot moment requires special collection setup on the recipient account.',
    transactionFee: '0.000 FLOW',
    usdFee: '$0.00',
    isFeesFree: true,
    isBalanceLoading: false,
    showEditButtons: true,
  },
};

export const CustomStorageMessage: Story = {
  args: {
    selectedNFT: pixelArtNFT,
    fromAccount: mockFromAccount,
    toAccount: mockToAccount,
    showStorageWarning: true,
    storageWarningMessage:
      'Warning: Pixel Warriors NFTs require 0.001 FLOW storage deposit for new collections.',
    usdFee: '$0.004',
    showEditButtons: true,
  },
};

export const LoadingWithWarning: Story = {
  args: {
    selectedNFT: mockNFT,
    fromAccount: mockFromAccount,
    toAccount: mockToAccount,
    isBalanceLoading: true,
    showStorageWarning: true,
    storageWarningMessage: 'Account balance is loading. Please wait before proceeding.',
    usdFee: '$0.004',
    showEditButtons: true,
  },
};
