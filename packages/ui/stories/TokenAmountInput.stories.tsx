import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';

import { TokenAmountInput } from '../src/components/TokenAmountInput';

const mockToken = {
  symbol: 'FLOW',
  name: 'Flow',
  logoURI:
    'https://cdn.jsdelivr.net/gh/FlowFoundation/flow-token-list@main/token-registry/A.1654653399040a61.FlowToken/logo.svg',
  balance: '550.66',
  price: 0.69,
  isVerified: true,
};

const mockUSDCToken = {
  symbol: 'USDC',
  name: 'USD Coin',
  logoURI: 'https://cryptologos.cc/logos/usd-coin-usdc-logo.png',
  balance: '1,234.56',
  price: 1.0,
  isVerified: true,
};

const meta = {
  title: 'Components/TokenAmountInput',
  component: TokenAmountInput,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Token amount input component with token selector, converter, and balance display',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    selectedToken: {
      description:
        'Selected token object with symbol, name, logo, balance, price, and verification status',
      control: { type: 'object' },
    },
    amount: {
      description: 'Current amount value',
      control: { type: 'text' },
    },
    onAmountChange: {
      description: 'Callback when amount changes',
      action: 'amount changed',
    },
    isTokenMode: {
      description: 'Whether input is in token mode (true) or fiat mode (false)',
      control: { type: 'boolean' },
    },
    onToggleInputMode: {
      description: 'Callback to toggle between token and fiat input modes',
      action: 'input mode toggled',
    },
    onTokenSelectorPress: {
      description: 'Callback when token selector is pressed',
      action: 'token selector pressed',
    },
    onMaxPress: {
      description: 'Callback when MAX button is pressed',
      action: 'max pressed',
    },
    placeholder: {
      description: 'Input placeholder text',
      control: { type: 'text' },
    },
    showBalance: {
      description: 'Whether to show balance and MAX button',
      control: { type: 'boolean' },
    },
    showConverter: {
      description: 'Whether to show currency converter toggle and converted amount',
      control: { type: 'boolean' },
    },
    disabled: {
      description: 'Whether the component is disabled',
      control: { type: 'boolean' },
    },
  },
  decorators: [
    (Story) => (
      <div style={{ width: '400px', padding: '20px' }}>
        <Story />
      </div>
    ),
  ],
  render: (args) => {
    const [isTokenMode, setIsTokenMode] = useState(args.isTokenMode ?? true);
    const [amount, setAmount] = useState(args.amount ?? '');

    return (
      <TokenAmountInput
        {...args}
        isTokenMode={isTokenMode}
        amount={amount}
        onAmountChange={setAmount}
        onToggleInputMode={() => {
          setIsTokenMode(!isTokenMode);
          console.log('Input mode toggled to:', !isTokenMode ? 'token' : 'fiat');
        }}
        onTokenSelectorPress={() => console.log('Token selector pressed')}
        onMaxPress={() => console.log('Max pressed')}
      />
    );
  },
} satisfies Meta<typeof TokenAmountInput>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    selectedToken: mockToken,
    amount: '0.69092',
    isTokenMode: true,
    placeholder: '0.00',
    showBalance: true,
    showConverter: true,
    disabled: false,
  },
};

export const WithFiatMode: Story = {
  args: {
    selectedToken: mockToken,
    amount: '0.48',
    isTokenMode: false,
    placeholder: '0.00',
    showBalance: true,
    showConverter: true,
    disabled: false,
  },
};

export const WithUSDC: Story = {
  args: {
    selectedToken: mockUSDCToken,
    amount: '100.00',
    isTokenMode: true,
    placeholder: '0.00',
    showBalance: true,
    showConverter: true,
    disabled: false,
  },
};

export const EmptyState: Story = {
  args: {
    selectedToken: mockToken,
    amount: '',
    isTokenMode: true,
    placeholder: '0.00',
    showBalance: true,
    showConverter: true,
    disabled: false,
  },
};

export const UnverifiedToken: Story = {
  args: {
    selectedToken: {
      ...mockToken,
      isVerified: false,
    },
    amount: '10.0',
    isTokenMode: true,
    placeholder: '0.00',
    showBalance: true,
    showConverter: true,
    disabled: false,
  },
};

export const LargeAmount: Story = {
  args: {
    selectedToken: mockToken,
    amount: '123456.789123',
    isTokenMode: true,
    placeholder: '0.00',
    showBalance: true,
    showConverter: true,
    disabled: false,
  },
};
