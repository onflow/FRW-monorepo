import { YStack } from '@onflow/frw-ui';
import type { Meta, StoryObj } from '@storybook/react-vite';
import React, { useState } from 'react';

import { SendMultipleNFTsScreen } from '../src/send/SendMultipleNFTsScreen';

const meta: Meta<typeof SendMultipleNFTsScreen> = {
  title: 'Screens/SendMultipleNFTsScreen',
  component: SendMultipleNFTsScreen,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'SendMultipleNFTsScreen provides a complete interface for sending multiple NFTs, including expandable NFT preview, account selection, and transaction confirmation.',
      },
    },
  },
  argTypes: {
    isConfirmationVisible: { control: 'boolean' },
    isAccountIncompatible: { control: 'boolean' },
    showEditButtons: { control: 'boolean' },
    backgroundColor: { control: 'color' },
    contentPadding: { control: 'number', min: 8, max: 32 },
    transactionFee: { control: 'text' },
    usdFee: { control: 'text' },
    isBalanceLoading: { control: 'boolean' },
    showStorageWarning: { control: 'boolean' },
    storageWarningMessage: { control: 'text' },
    isFeesFree: { control: 'boolean' },
    onEditNFTsPress: { action: 'edit-nfts-pressed' },
    onEditAccountPress: { action: 'edit-account-pressed' },
    onLearnMorePress: { action: 'learn-more-pressed' },
    onRemoveNFT: { action: 'nft-removed' },
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
type Story = StoryObj<typeof SendMultipleNFTsScreen>;

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

const createMockNFTs = (count: number) =>
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
    selectedNFTs: twoNFTs,
    fromAccount: mockFromAccount,
    toAccount: mockToAccount,
    usdFee: '$0.004',
    isBalanceLoading: false,
    showStorageWarning: false,
    isFeesFree: false,
    showEditButtons: true,
  },
};

export const ThreeNFTs: Story = {
  args: {
    selectedNFTs: threeNFTs,
    fromAccount: mockFromAccount,
    toAccount: mockToAccount,
  },
};

export const FiveNFTs: Story = {
  args: {
    selectedNFTs: fiveNFTs,
    fromAccount: mockFromAccount,
    toAccount: mockToAccount,
  },
};

export const ManyNFTs: Story = {
  args: {
    selectedNFTs: twentyNFTs,
    fromAccount: mockFromAccount,
    toAccount: mockToAccount,
  },
};

export const NoNFTs: Story = {
  args: {
    selectedNFTs: [],
    fromAccount: mockFromAccount,
    toAccount: mockToAccount,
  },
};

export const NoAccounts: Story = {
  args: {
    selectedNFTs: fiveNFTs,
    fromAccount: null,
    toAccount: null,
  },
};

export const WithoutAccountNames: Story = {
  args: {
    selectedNFTs: fiveNFTs,
    fromAccount: { address: '0x1234567890abcdef1234567890abcdef12345678' },
    toAccount: { address: '0xabcdef1234567890abcdef1234567890abcdef12' },
  },
};

export const IncompatibleAccount: Story = {
  args: {
    selectedNFTs: fiveNFTs,
    fromAccount: mockFromAccount,
    toAccount: mockToAccount,
    isAccountIncompatible: true,
  },
};

export const WithoutEditButtons: Story = {
  args: {
    selectedNFTs: fiveNFTs,
    fromAccount: mockFromAccount,
    toAccount: mockToAccount,
    showEditButtons: false,
  },
};

export const CustomFee: Story = {
  args: {
    selectedNFTs: fiveNFTs,
    fromAccount: mockFromAccount,
    toAccount: mockToAccount,
    transactionFee: '0.005 FLOW',
    usdFee: '$0.004',
    showEditButtons: true,
  },
};

export const ConfirmationOpen: Story = {
  args: {
    selectedNFTs: fiveNFTs,
    fromAccount: mockFromAccount,
    toAccount: mockToAccount,
    isConfirmationVisible: true,
  },
};

export const CompactPadding: Story = {
  args: {
    selectedNFTs: fiveNFTs,
    fromAccount: mockFromAccount,
    toAccount: mockToAccount,
    contentPadding: 12,
  },
};

export const LargePadding: Story = {
  args: {
    selectedNFTs: fiveNFTs,
    fromAccount: mockFromAccount,
    toAccount: mockToAccount,
    contentPadding: 32,
  },
};

export const DifferentCollections: Story = {
  args: {
    selectedNFTs: [
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
    ],
    fromAccount: mockFromAccount,
    toAccount: mockToAccount,
  },
};

export const WithoutImages: Story = {
  args: {
    selectedNFTs: fiveNFTs.map((nft) => ({ ...nft, image: undefined })),
    fromAccount: mockFromAccount,
    toAccount: mockToAccount,
  },
};

export const LongNames: Story = {
  args: {
    selectedNFTs: [
      {
        id: '1',
        name: 'This is a very long NFT name that should be truncated properly in the interface',
        image: 'https://via.placeholder.com/400x400/6366F1/FFFFFF?text=Long+Name',
        collection: 'Very Long Collection Name That Should Also Be Truncated Appropriately',
        description: 'A very long description for this NFT',
      },
      {
        id: '2',
        name: 'Another extremely long NFT name for testing text overflow behavior',
        image: 'https://via.placeholder.com/400x400/F59E0B/FFFFFF?text=Long+2',
        collection: 'Another Very Long Collection Name That Tests Wrapping',
        description: 'Another lengthy description',
      },
      {
        id: '3',
        name: 'Short Name',
        image: 'https://via.placeholder.com/400x400/10B981/FFFFFF?text=Short',
        collection: 'Short Collection',
        description: 'Short description',
      },
    ],
    fromAccount: {
      ...mockFromAccount,
      name: 'Very Long Wallet Name That Demonstrates Text Handling In Account Sections',
    },
    toAccount: {
      ...mockToAccount,
      name: 'Another Very Long Account Name for Testing Purposes and Layout Handling',
    },
  },
};

export const Interactive: Story = {
  render: function InteractiveRender() {
    const [selectedNFTs, setSelectedNFTs] = useState(fiveNFTs);
    const [isConfirmationVisible, setIsConfirmationVisible] = useState(false);
    const [isAccountIncompatible, setIsAccountIncompatible] = useState(false);

    const handleRemoveNFT = (nftId: string) => {
      setSelectedNFTs((prev) => prev.filter((nft) => nft.id !== nftId));
    };

    const handleSendPress = () => {
      setIsConfirmationVisible(true);
    };

    const handleTransactionConfirm = async () => {
      // Simulate transaction delay
      await new Promise((resolve) => setTimeout(resolve, 2000));
      setIsConfirmationVisible(false);
      alert(`${selectedNFTs.length} NFTs sent successfully!`);
    };

    const handleToggleCompatibility = () => {
      setIsAccountIncompatible(!isAccountIncompatible);
    };

    const handleAddNFT = () => {
      const newNFT = {
        id: `nft-${Date.now()}`,
        name: `New NFT #${selectedNFTs.length + 1}`,
        image: `https://via.placeholder.com/400x400/EC4899/FFFFFF?text=New+${selectedNFTs.length + 1}`,
        collection: 'New Collection',
        description: 'A newly added NFT',
      };
      setSelectedNFTs((prev) => [...prev, newNFT]);
    };

    return (
      <YStack height="100vh" position="relative">
        <SendMultipleNFTsScreen
          selectedNFTs={selectedNFTs}
          fromAccount={mockFromAccount}
          toAccount={mockToAccount}
          isConfirmationVisible={isConfirmationVisible}
          isAccountIncompatible={isAccountIncompatible}
          onRemoveNFT={handleRemoveNFT}
          onSendPress={handleSendPress}
          onEditNFTsPress={handleAddNFT}
          onEditAccountPress={handleToggleCompatibility}
          onLearnMorePress={() => alert('Learn more about account compatibility')}
          onConfirmationClose={() => setIsConfirmationVisible(false)}
          onTransactionConfirm={handleTransactionConfirm}
        />

        {/* Debug Info */}
        <YStack
          position="absolute"
          top={10}
          right={10}
          bg="$backgroundTransparent"
          p="$2"
          rounded="$3"
          gap="$1"
        >
          <YStack fontSize="$2" color="$color">
            NFTs: {selectedNFTs.length}
          </YStack>
          <YStack fontSize="$2" color="$color">
            Incompatible: {isAccountIncompatible ? 'Yes' : 'No'}
          </YStack>
        </YStack>
      </YStack>
    );
  },
};

export const OnlyFromAccount: Story = {
  args: {
    selectedNFTs: fiveNFTs,
    fromAccount: mockFromAccount,
    toAccount: null,
  },
};

export const OnlyToAccount: Story = {
  args: {
    selectedNFTs: fiveNFTs,
    fromAccount: null,
    toAccount: mockToAccount,
  },
};

export const MinimalInfo: Story = {
  args: {
    selectedNFTs: [
      {
        id: '1',
        name: 'Simple NFT',
        collection: 'Basic Collection',
      },
      {
        id: '2',
        name: 'Another NFT',
        collection: 'Basic Collection',
      },
    ],
    fromAccount: { address: '0x1234567890abcdef1234567890abcdef12345678' },
    toAccount: { address: '0xabcdef1234567890abcdef1234567890abcdef12' },
  },
};

export const CustomBackground: Story = {
  args: {
    selectedNFTs: fiveNFTs,
    fromAccount: mockFromAccount,
    toAccount: mockToAccount,
    backgroundColor: '$gray1',
  },
};

export const HighFee: Story = {
  args: {
    selectedNFTs: fiveNFTs,
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
    selectedNFTs: fiveNFTs,
    fromAccount: mockFromAccount,
    toAccount: mockToAccount,
    showStorageWarning: true,
    storageWarningMessage:
      'Sending multiple NFTs may require additional storage setup on the recipient account.',
    usdFee: '$0.004',
    showEditButtons: true,
  },
};

export const BalanceLoading: Story = {
  args: {
    selectedNFTs: threeNFTs,
    fromAccount: mockFromAccount,
    toAccount: mockToAccount,
    isBalanceLoading: true,
    usdFee: '$0.004',
    showEditButtons: true,
  },
};

export const FreeFees: Story = {
  args: {
    selectedNFTs: twoNFTs,
    fromAccount: mockFromAccount,
    toAccount: mockToAccount,
    transactionFee: '0.000 FLOW',
    usdFee: '$0.00',
    isFeesFree: true,
    showEditButtons: true,
  },
};

export const IncompatibleWithWarning: Story = {
  args: {
    selectedNFTs: threeNFTs,
    fromAccount: mockFromAccount,
    toAccount: mockToAccount,
    isAccountIncompatible: true,
    showStorageWarning: true,
    storageWarningMessage:
      'This account cannot receive these NFT types. Setup is required before transfer.',
    usdFee: '$0.004',
    showEditButtons: true,
  },
};

export const AllEnhancedFeatures: Story = {
  args: {
    selectedNFTs: twentyNFTs,
    fromAccount: mockFromAccount,
    toAccount: mockToAccount,
    isAccountIncompatible: true,
    showStorageWarning: true,
    storageWarningMessage:
      'Large NFT batch transfers to incompatible accounts require significant storage setup.',
    transactionFee: '0.000 FLOW',
    usdFee: '$0.00',
    isFeesFree: true,
    isBalanceLoading: false,
    showEditButtons: true,
  },
};

export const CustomStorageMessage: Story = {
  args: {
    selectedNFTs: fiveNFTs,
    fromAccount: mockFromAccount,
    toAccount: mockToAccount,
    showStorageWarning: true,
    storageWarningMessage:
      'Warning: Multiple NFT collections require 0.001 FLOW storage deposit per unique collection.',
    usdFee: '$0.004',
    showEditButtons: true,
  },
};

export const LoadingLargeCollection: Story = {
  args: {
    selectedNFTs: tenNFTs,
    fromAccount: mockFromAccount,
    toAccount: mockToAccount,
    isBalanceLoading: true,
    showStorageWarning: true,
    storageWarningMessage:
      'Loading account balance for large NFT collection transfer. Please wait.',
    usdFee: '$0.006',
    showEditButtons: true,
  },
};

export const SingleNFTFallback: Story = {
  args: {
    selectedNFTs: [
      {
        id: '1',
        name: 'Single NFT',
        image: 'https://via.placeholder.com/400x400/6366F1/FFFFFF?text=Single',
        collection: 'Single Collection',
        description: 'Only one NFT selected',
      },
    ],
    fromAccount: mockFromAccount,
    toAccount: mockToAccount,
  },
};
