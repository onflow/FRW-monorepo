import type { Meta, StoryObj } from '@storybook/react-vite';

import { TokenCard } from '../src/components/TokenCard';

const meta = {
  title: 'Components/TokenCard',
  component: TokenCard,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    onPress: { action: 'pressed' },
  },
} satisfies Meta<typeof TokenCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    symbol: 'FLOW',
    name: 'Flow Token',
    balance: '1,234.56',
    logo: 'https://cdn.jsdelivr.net/gh/trustwallet/assets@master/blockchains/flow/info/logo.png',
    price: '0.95',
    change24h: 5.2,
  },
};

export const Negative: Story = {
  args: {
    symbol: 'USDC',
    name: 'USD Coin',
    balance: '999.99',
    price: '1.00',
    change24h: -0.1,
  },
};

export const WithoutPrice: Story = {
  args: {
    symbol: 'MYTOKEN',
    name: 'My Custom Token',
    balance: '50,000.00',
  },
};

export const LongNames: Story = {
  args: {
    symbol: 'VERYLONGTOKENSYMBOL',
    name: 'This is a very long token name that might overflow',
    balance: '1,000,000.123456789',
    price: '0.000001',
    change24h: 1234.56,
  },
};
