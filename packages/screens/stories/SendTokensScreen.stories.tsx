import { YStack } from '@onflow/frw-ui';
import type { Meta, StoryObj } from '@storybook/react-vite';
import React, { useState } from 'react';

import { SendTokensScreen } from '../src/send/SendTokensScreen';

const meta: Meta<typeof SendTokensScreen> = {
  title: 'Screens/SendTokensScreen',
  component: SendTokensScreen,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'SendTokensScreen provides a complete interface for sending tokens, including amount input, account selection, and transaction confirmation.',
      },
    },
  },
  argTypes: {
    amount: { control: 'text' },
    isTokenMode: { control: 'boolean' },
    isTokenSelectorVisible: { control: 'boolean' },
    isConfirmationVisible: { control: 'boolean' },
    backgroundColor: { control: 'color' },
    contentPadding: { control: 'number', min: 8, max: 32 },
    transactionFee: { control: 'text' },
    onTokenSelect: { action: 'token-selected' },
    onAmountChange: { action: 'amount-changed' },
    onToggleInputMode: { action: 'input-mode-toggled' },
    onMaxPress: { action: 'max-pressed' },
    onSendPress: { action: 'send-pressed' },
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
type Story = StoryObj<typeof SendTokensScreen>;

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

const mockFlowToken = {
  id: '1',
  symbol: 'FLOW',
  name: 'Flow',
  logoURI: 'https://via.placeholder.com/40x40/00EF8B/FFFFFF?text=FLOW',
  balance: '1,234.56 FLOW',
  priceInUSD: '0.75',
  isVerified: true,
  contractAddress: '0x1654653399040a61',
};

const mockTokens = [
  mockFlowToken,
  {
    id: '2',
    symbol: 'USDC',
    name: 'USD Coin',
    logoURI: 'https://via.placeholder.com/40x40/2775CA/FFFFFF?text=USDC',
    balance: '500.00 USDC',
    priceInUSD: '1.00',
    isVerified: true,
    contractAddress: '0xa983fecbed621163',
  },
  {
    id: '3',
    symbol: 'BLT',
    name: 'Blocto Token',
    logoURI: 'https://via.placeholder.com/40x40/6366F1/FFFFFF?text=BLT',
    balance: '10,000 BLT',
    priceInUSD: '0.05',
    isVerified: false,
    contractAddress: '0x0f9df91c9121c460',
  },
];

export const Default: Story = {
  args: {
    selectedToken: mockFlowToken,
    fromAccount: mockFromAccount,
    toAccount: mockToAccount,
    amount: '100.0',
    isTokenMode: true,
    tokens: mockTokens,
  },
};

export const EmptyAmount: Story = {
  args: {
    selectedToken: mockFlowToken,
    fromAccount: mockFromAccount,
    toAccount: mockToAccount,
    amount: '',
    isTokenMode: true,
    tokens: mockTokens,
  },
};

export const FiatMode: Story = {
  args: {
    selectedToken: mockFlowToken,
    fromAccount: mockFromAccount,
    toAccount: mockToAccount,
    amount: '75.00',
    isTokenMode: false,
    tokens: mockTokens,
  },
};

export const NoToken: Story = {
  args: {
    selectedToken: null,
    fromAccount: mockFromAccount,
    toAccount: mockToAccount,
    amount: '',
    isTokenMode: true,
    tokens: mockTokens,
  },
};

export const NoAccounts: Story = {
  args: {
    selectedToken: mockFlowToken,
    fromAccount: null,
    toAccount: null,
    amount: '100.0',
    isTokenMode: true,
    tokens: mockTokens,
  },
};

export const WithoutAccountNames: Story = {
  args: {
    selectedToken: mockFlowToken,
    fromAccount: { address: '0x1234567890abcdef1234567890abcdef12345678' },
    toAccount: { address: '0xabcdef1234567890abcdef1234567890abcdef12' },
    amount: '100.0',
    isTokenMode: true,
    tokens: mockTokens,
  },
};

export const CustomFee: Story = {
  args: {
    selectedToken: mockFlowToken,
    fromAccount: mockFromAccount,
    toAccount: mockToAccount,
    amount: '100.0',
    isTokenMode: true,
    tokens: mockTokens,
    transactionFee: '0.005 FLOW (~$0.004)',
  },
};

export const TokenSelectorOpen: Story = {
  args: {
    selectedToken: mockFlowToken,
    fromAccount: mockFromAccount,
    toAccount: mockToAccount,
    amount: '100.0',
    isTokenMode: true,
    tokens: mockTokens,
    isTokenSelectorVisible: true,
  },
};

export const ConfirmationOpen: Story = {
  args: {
    selectedToken: mockFlowToken,
    fromAccount: mockFromAccount,
    toAccount: mockToAccount,
    amount: '100.0',
    isTokenMode: true,
    tokens: mockTokens,
    isConfirmationVisible: true,
  },
};

export const CompactPadding: Story = {
  args: {
    selectedToken: mockFlowToken,
    fromAccount: mockFromAccount,
    toAccount: mockToAccount,
    amount: '100.0',
    isTokenMode: true,
    tokens: mockTokens,
    contentPadding: 12,
  },
};

export const LargePadding: Story = {
  args: {
    selectedToken: mockFlowToken,
    fromAccount: mockFromAccount,
    toAccount: mockToAccount,
    amount: '100.0',
    isTokenMode: true,
    tokens: mockTokens,
    contentPadding: 32,
  },
};

export const Interactive: Story = {
  render: function InteractiveRender() {
    const [selectedToken, setSelectedToken] = useState(mockFlowToken);
    const [amount, setAmount] = useState('100.0');
    const [isTokenMode, setIsTokenMode] = useState(true);
    const [isTokenSelectorVisible, setIsTokenSelectorVisible] = useState(false);
    const [isConfirmationVisible, setIsConfirmationVisible] = useState(false);

    const handleMaxPress = () => {
      if (selectedToken?.balance) {
        const balanceString = selectedToken.balance.toString();
        const numericBalance = balanceString.replace(/[^0-9.]/g, '');
        setAmount(numericBalance);
      }
    };

    const handleSendPress = () => {
      setIsConfirmationVisible(true);
    };

    const handleTransactionConfirm = async () => {
      // Simulate transaction delay
      await new Promise((resolve) => setTimeout(resolve, 2000));
      setIsConfirmationVisible(false);
      alert('Transaction sent successfully!');
      setAmount('');
    };

    return (
      <SendTokensScreen
        selectedToken={selectedToken}
        fromAccount={mockFromAccount}
        toAccount={mockToAccount}
        amount={amount}
        isTokenMode={isTokenMode}
        tokens={mockTokens}
        isTokenSelectorVisible={isTokenSelectorVisible}
        isConfirmationVisible={isConfirmationVisible}
        onTokenSelect={(token) => {
          setSelectedToken(token);
          setIsTokenSelectorVisible(false);
        }}
        onAmountChange={setAmount}
        onToggleInputMode={() => setIsTokenMode(!isTokenMode)}
        onMaxPress={handleMaxPress}
        onSendPress={handleSendPress}
        onTokenSelectorOpen={() => setIsTokenSelectorVisible(true)}
        onTokenSelectorClose={() => setIsTokenSelectorVisible(false)}
        onConfirmationClose={() => setIsConfirmationVisible(false)}
        onTransactionConfirm={handleTransactionConfirm}
      />
    );
  },
};

export const DifferentToken: Story = {
  args: {
    selectedToken: mockTokens[1], // USDC
    fromAccount: mockFromAccount,
    toAccount: mockToAccount,
    amount: '250.0',
    isTokenMode: true,
    tokens: mockTokens,
  },
};

export const LargeAmount: Story = {
  args: {
    selectedToken: mockFlowToken,
    fromAccount: mockFromAccount,
    toAccount: mockToAccount,
    amount: '10000.123456',
    isTokenMode: true,
    tokens: mockTokens,
  },
};
