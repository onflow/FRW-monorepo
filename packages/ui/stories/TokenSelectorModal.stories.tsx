import type { Meta, StoryObj } from '@storybook/react-vite';
import React, { useState } from 'react';
import { Button, YStack } from 'tamagui';

import { TokenSelectorModal, type TokenModel } from '../src/components/TokenSelectorModal';

const meta: Meta<typeof TokenSelectorModal> = {
  title: 'Components/TokenSelectorModal',
  component: TokenSelectorModal,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'TokenSelectorModal displays a modal for selecting tokens with search functionality and balance information.',
      },
    },
  },
  argTypes: {
    visible: { control: 'boolean' },
    searchable: { control: 'boolean' },
    title: { control: 'text' },
    emptyMessage: { control: 'text' },
    backgroundColor: { control: 'color' },
    maxHeight: { control: 'number', min: 200, max: 800 },
    onTokenSelect: { action: 'token-selected' },
    onClose: { action: 'modal-closed' },
  },
  decorators: [
    (Story): React.JSX.Element => (
      <YStack width={400} height={300} items="center" justify="center">
        <Story />
      </YStack>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof TokenSelectorModal>;

// Mock token data
const mockTokens: TokenModel[] = [
  {
    id: '1',
    symbol: 'FLOW',
    name: 'Flow',
    logoURI: 'https://via.placeholder.com/40x40/00EF8B/FFFFFF?text=FLOW',
    balance: '1,234.56 FLOW',
    priceInUSD: '0.75',
    isVerified: true,
    contractAddress: '0x1654653399040a61',
  },
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
  {
    id: '4',
    symbol: 'FUSD',
    name: 'Flow USD',
    logoURI: 'https://via.placeholder.com/40x40/F59E0B/FFFFFF?text=FUSD',
    balance: '0 FUSD',
    priceInUSD: '1.00',
    isVerified: true,
    contractAddress: '0x3c5959b568896393',
  },
];

const flowToken = mockTokens[0];

export const Default: Story = {
  args: {
    visible: true,
    selectedToken: flowToken,
    tokens: mockTokens,
  },
};

export const WithoutSearch: Story = {
  args: {
    visible: true,
    selectedToken: flowToken,
    tokens: mockTokens,
    searchable: false,
  },
};

export const EmptyTokens: Story = {
  args: {
    visible: true,
    selectedToken: null,
    tokens: [],
    emptyMessage: 'No tokens found in your wallet',
  },
};

export const CustomTitle: Story = {
  args: {
    visible: true,
    selectedToken: flowToken,
    tokens: mockTokens,
    title: 'Choose Payment Token',
  },
};

export const LimitedHeight: Story = {
  args: {
    visible: true,
    selectedToken: flowToken,
    tokens: mockTokens,
    maxHeight: 300,
  },
};

export const ManyTokens: Story = {
  args: {
    visible: true,
    selectedToken: flowToken,
    tokens: [
      ...mockTokens,
      {
        id: '5',
        symbol: 'WBTC',
        name: 'Wrapped Bitcoin',
        logoURI: 'https://via.placeholder.com/40x40/F7931A/FFFFFF?text=BTC',
        balance: '0.5 WBTC',
        priceInUSD: '45000.00',
        isVerified: true,
      },
      {
        id: '6',
        symbol: 'WETH',
        name: 'Wrapped Ethereum',
        logoURI: 'https://via.placeholder.com/40x40/627EEA/FFFFFF?text=ETH',
        balance: '2.5 WETH',
        priceInUSD: '3000.00',
        isVerified: true,
      },
      {
        id: '7',
        symbol: 'LINK',
        name: 'Chainlink',
        logoURI: 'https://via.placeholder.com/40x40/375BD2/FFFFFF?text=LINK',
        balance: '100 LINK',
        priceInUSD: '15.00',
        isVerified: true,
      },
    ],
  },
};

export const Interactive: Story = {
  render: function InteractiveRender() {
    const [visible, setVisible] = useState(false);
    const [selectedToken, setSelectedToken] = useState<TokenModel | null>(flowToken);

    return (
      <YStack gap="$4" items="center">
        <Button onPress={() => setVisible(true)}>Open Token Selector</Button>

        {selectedToken && (
          <YStack items="center" gap="$2">
            <YStack fontSize="$3" color="$textSecondary">
              Selected Token:
            </YStack>
            <YStack fontSize="$4" fontWeight="600" color="$color">
              {selectedToken.symbol} - {selectedToken.name}
            </YStack>
          </YStack>
        )}

        <TokenSelectorModal
          visible={visible}
          selectedToken={selectedToken}
          tokens={mockTokens}
          onTokenSelect={setSelectedToken}
          onClose={() => setVisible(false)}
        />
      </YStack>
    );
  },
};

export const SearchDemo: Story = {
  render: function SearchDemoRender() {
    const [visible, setVisible] = useState(true);
    const [selectedToken, setSelectedToken] = useState<TokenModel | null>(null);

    const handleTokenSelect = (token: TokenModel): void => {
      setSelectedToken(token);
      alert(`Selected: ${token.name} (${token.symbol})`);
      setVisible(false);
    };

    return (
      <YStack gap="$4" items="center">
        <Button onPress={() => setVisible(true)}>Show Search Demo</Button>

        <TokenSelectorModal
          visible={visible}
          selectedToken={selectedToken}
          tokens={mockTokens}
          onTokenSelect={handleTokenSelect}
          onClose={() => setVisible(false)}
          title="Search Tokens Demo"
        />
      </YStack>
    );
  },
};

export const NoLogos: Story = {
  args: {
    visible: true,
    selectedToken: null,
    tokens: mockTokens.map((token) => ({ ...token, logoURI: undefined })),
  },
};
