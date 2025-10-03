import type { Meta, StoryObj } from '@storybook/react-vite';
import React, { useState } from 'react';
import { Button, YStack } from 'tamagui';

import {
  TransactionConfirmationModal,
  type TokenModel,
  type WalletAccount,
  type SendFormData,
} from '../src/components/TransactionConfirmationModal';

const meta: Meta<typeof TransactionConfirmationModal> = {
  title: 'Components/TransactionConfirmationModal',
  component: TransactionConfirmationModal,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'TransactionConfirmationModal displays transaction details and allows users to confirm or cancel the transaction.',
      },
    },
  },
  argTypes: {
    visible: { control: 'boolean' },
    transactionType: { control: 'select', options: ['tokens', 'nfts'] },
    title: { control: 'text' },
    backgroundColor: { control: 'color' },
    isSending: { control: 'boolean' },
    onConfirm: { action: 'transaction-confirmed' },
    onClose: { action: 'modal-closed' },
  },
  decorators: [
    (Story): React.JSX.Element => (
      <YStack width={400} height={300} alignItems="center" justifyContent="center">
        <Story />
      </YStack>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof TransactionConfirmationModal>;

// Mock data
const mockFromAccount: WalletAccount = {
  address: '0x1234567890abcdef1234567890abcdef12345678',
  name: 'Main Wallet',
  avatar: 'https://via.placeholder.com/40x40/10B981/FFFFFF?text=MW',
};

const mockToAccount: WalletAccount = {
  address: '0xabcdef1234567890abcdef1234567890abcdef12',
  name: 'John Doe',
  avatar: 'https://via.placeholder.com/40x40/6366F1/FFFFFF?text=JD',
};

const mockToken: TokenModel = {
  symbol: 'FLOW',
  name: 'Flow',
  logoURI: 'https://via.placeholder.com/40x40/00EF8B/FFFFFF?text=FLOW',
  balance: '1,234.56 FLOW',
  priceInUSD: '0.75',
  isVerified: true,
};

const mockFormData: SendFormData = {
  tokenAmount: '100.0',
  fiatAmount: '75.00',
  isTokenMode: true,
  transactionFee: '0.001 FLOW',
};

export const Default: Story = {
  args: {
    visible: true,
    transactionType: 'tokens',
    selectedToken: mockToken,
    fromAccount: mockFromAccount,
    toAccount: mockToAccount,
    formData: mockFormData,
  },
};

export const WithoutNames: Story = {
  args: {
    visible: true,
    transactionType: 'tokens',
    selectedToken: mockToken,
    fromAccount: { address: '0x1234567890abcdef1234567890abcdef12345678' },
    toAccount: { address: '0xabcdef1234567890abcdef1234567890abcdef12' },
    formData: mockFormData,
  },
};

export const LoadingState: Story = {
  args: {
    visible: true,
    transactionType: 'tokens',
    selectedToken: mockToken,
    fromAccount: mockFromAccount,
    toAccount: mockToAccount,
    formData: mockFormData,
    isSending: true,
  },
};

export const CustomTitle: Story = {
  args: {
    visible: true,
    transactionType: 'tokens',
    selectedToken: mockToken,
    fromAccount: mockFromAccount,
    toAccount: mockToAccount,
    formData: mockFormData,
    title: 'Review Your Transaction',
  },
};

export const LargeAmount: Story = {
  args: {
    visible: true,
    transactionType: 'tokens',
    selectedToken: mockToken,
    fromAccount: mockFromAccount,
    toAccount: mockToAccount,
    formData: {
      ...mockFormData,
      tokenAmount: '10,000.123456',
      fiatAmount: '7,500.09',
    },
  },
};

export const SmallAmount: Story = {
  args: {
    visible: true,
    transactionType: 'tokens',
    selectedToken: mockToken,
    fromAccount: mockFromAccount,
    toAccount: mockToAccount,
    formData: {
      ...mockFormData,
      tokenAmount: '0.001',
      fiatAmount: '0.0008',
    },
  },
};

export const DifferentToken: Story = {
  args: {
    visible: true,
    transactionType: 'tokens',
    selectedToken: {
      symbol: 'USDC',
      name: 'USD Coin',
      logoURI: 'https://via.placeholder.com/40x40/2775CA/FFFFFF?text=USDC',
      balance: '500.00 USDC',
      priceInUSD: '1.00',
      isVerified: true,
    },
    fromAccount: mockFromAccount,
    toAccount: mockToAccount,
    formData: {
      tokenAmount: '250.0',
      fiatAmount: '250.00',
      isTokenMode: true,
      transactionFee: '0.001 FLOW',
    },
  },
};

export const HighFee: Story = {
  args: {
    visible: true,
    transactionType: 'tokens',
    selectedToken: mockToken,
    fromAccount: mockFromAccount,
    toAccount: mockToAccount,
    formData: {
      ...mockFormData,
      transactionFee: '0.1 FLOW (~$0.075)',
    },
  },
};

export const Interactive: Story = {
  render: function InteractiveRender() {
    const [visible, setVisible] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleConfirm = async (): Promise<void> => {
      setIsLoading(true);
      // Simulate transaction delay
      await new Promise((resolve) => setTimeout(resolve, 2000));
      setIsLoading(false);
      setVisible(false);
      alert('Transaction confirmed!');
    };

    return (
      <YStack gap="$4" alignItems="center">
        <Button onPress={() => setVisible(true)}>Open Transaction Confirmation</Button>

        <TransactionConfirmationModal
          visible={visible}
          transactionType="tokens"
          selectedToken={mockToken}
          fromAccount={mockFromAccount}
          toAccount={mockToAccount}
          formData={mockFormData}
          isSending={isLoading}
          onConfirm={handleConfirm}
          onClose={() => setVisible(false)}
        />
      </YStack>
    );
  },
};

export const NoToken: Story = {
  args: {
    visible: true,
    transactionType: 'tokens',
    selectedToken: null,
    fromAccount: mockFromAccount,
    toAccount: mockToAccount,
    formData: mockFormData,
  },
};

export const NFTTransaction: Story = {
  args: {
    visible: true,
    transactionType: 'nfts',
    selectedToken: null,
    fromAccount: mockFromAccount,
    toAccount: mockToAccount,
    formData: {
      tokenAmount: '1',
      fiatAmount: '0.00',
      isTokenMode: true,
      transactionFee: '0.001 FLOW',
    },
    title: 'Confirm NFT Transfer',
  },
};
