import type { Meta, StoryObj } from '@storybook/react-vite';
import React from 'react';
import { YStack } from 'tamagui';

import { TokenAmountInput } from '../src/components/TokenAmountInput';
import type { Token } from '../src/types';

const meta: Meta<typeof TokenAmountInput> = {
  title: 'Components/TokenAmountInput',
  component: TokenAmountInput,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'TokenAmountInput allows users to input token amounts with token selection, USD conversion, and balance management features.',
      },
    },
  },
  argTypes: {
    amount: { control: 'text' },
    isTokenMode: { control: 'boolean' },
    placeholder: { control: 'text' },
    showBalance: { control: 'boolean' },
    showConverter: { control: 'boolean' },
    disabled: { control: 'boolean' },
    onAmountChange: { action: 'amount-changed' },
    onToggleInputMode: { action: 'input-mode-toggled' },
    onTokenSelectorPress: { action: 'token-selector-pressed' },
    onMaxPress: { action: 'max-pressed' },
  },
  decorators: [
    (Story) => (
      <YStack width={375} padding="$4" backgroundColor="$gray12" alignItems="center">
        <Story />
      </YStack>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof TokenAmountInput>;

// Mock tokens - matching Figma design
const flowToken: Token = {
  symbol: 'FLOW',
  name: 'Flow',
  logo: 'https://via.placeholder.com/35x35/2775CA/FFFFFF?text=FLOW',
  balance: '134.912',
  price: 1.01,
  isVerified: true,
};

const usdcToken: Token = {
  symbol: 'USDC',
  name: 'USD Coin',
  logo: 'https://via.placeholder.com/36x36/2775CA/FFFFFF?text=USDC',
  balance: '500.00',
  price: 1.0,
  isVerified: true,
};

const unverifiedToken: Token = {
  symbol: 'TEST',
  name: 'Test Token',
  logo: 'https://via.placeholder.com/36x36/FF6B6B/FFFFFF?text=TEST',
  balance: '10,000.00',
  price: 0.001,
  isVerified: false,
};

const tokenWithoutLogo: Token = {
  symbol: 'NOLOGO',
  name: 'Token Without Logo',
  balance: '25.75',
  price: 2.5,
  isVerified: true,
};

export const Default: Story = {
  args: {
    selectedToken: flowToken,
    amount: '0',
    placeholder: '0.00',
  },
};

export const WithAmount: Story = {
  args: {
    selectedToken: flowToken,
    amount: '100.50',
  },
};

export const USDMode: Story = {
  args: {
    selectedToken: usdcToken,
    amount: '85.25',
    isTokenMode: false,
  },
};

export const VerifiedToken: Story = {
  args: {
    selectedToken: flowToken,
    amount: '50.00',
  },
};

export const UnverifiedToken: Story = {
  args: {
    selectedToken: unverifiedToken,
    amount: '1000.00',
  },
};

export const NoLogo: Story = {
  args: {
    selectedToken: tokenWithoutLogo,
    amount: '10.25',
  },
};

export const Disabled: Story = {
  args: {
    selectedToken: flowToken,
    amount: '100.00',
    disabled: true,
  },
};

export const NoBalance: Story = {
  args: {
    selectedToken: flowToken,
    amount: '25.50',
    showBalance: false,
  },
};

export const LongTokenName: Story = {
  args: {
    selectedToken: {
      ...flowToken,
      symbol: 'VERYLONGTOKEN',
      name: 'Very Long Token Name That Might Overflow',
    },
    amount: '123.45',
  },
};

export const HighValue: Story = {
  args: {
    selectedToken: {
      ...flowToken,
      balance: '1,234,567.89',
      price: 1250.75,
    },
    amount: '999.99',
  },
};

export const LowValue: Story = {
  args: {
    selectedToken: {
      ...unverifiedToken,
      price: 0.000001,
    },
    amount: '1000000.00',
  },
};
