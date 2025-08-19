import type { Meta, StoryObj } from '@storybook/react-vite';
import { YStack } from 'tamagui';

import { TokenCard } from '../src/components/TokenCard';
import { Divider } from '../src/foundation/Divider';

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
    balance: '2.16',
    logo: 'https://cdn.jsdelivr.net/gh/trustwallet/assets@master/blockchains/flow/info/logo.png',
    price: '1173.61',
    usdBalance: '$2,534.99',
    change24h: 5.2,
    isVerified: true,
  },
};

export const Negative: Story = {
  args: {
    symbol: 'USDC',
    name: 'USD Coin',
    balance: '999.99',
    logo: 'https://cryptologos.cc/logos/usd-coin-usdc-logo.png',
    price: '999.99',
    usdBalance: '$999.99',
    change24h: -0.1,
    isVerified: true,
  },
};

export const WithoutPrice: Story = {
  args: {
    symbol: 'MYTOKEN',
    name: 'My Custom Token',
    balance: '50,000.00',
    isVerified: false,
  },
};

export const Verified: Story = {
  args: {
    symbol: 'BTC',
    name: 'Bitcoin',
    balance: '0.05421',
    price: '2671.05',
    change24h: 12.5,
    isVerified: true,
  },
};

export const LongNames: Story = {
  args: {
    symbol: 'VERYLONGTOKENSYMBOL',
    name: 'This is a very long token name that might overflow',
    balance: '1,000,000.123456789',
    price: '0.000001',
    change24h: 1234.56,
    isVerified: false,
  },
};

export const TokenList: Story = {
  render: () => (
    <YStack width={400} gap="$0">
      <TokenCard
        symbol="FLOW"
        name="Flow Token"
        balance="1,234.56"
        logo="https://cdn.jsdelivr.net/gh/trustwallet/assets@master/blockchains/flow/info/logo.png"
        price="1173.61"
        usdBalance="$1,448,756.84"
        change24h={5.2}
        isVerified={true}
      />
      <Divider />
      <TokenCard
        symbol="USDC"
        name="USD Coin"
        balance="999.99"
        price="999.99"
        usdBalance="$999.99"
        change24h={-0.1}
        isVerified={true}
      />
      <Divider />
      <TokenCard
        symbol="BTC"
        name="Bitcoin"
        balance="0.05421"
        price="2671.05"
        usdBalance="$2,671.05"
        change24h={12.5}
        isVerified={true}
      />
      <Divider />
      <TokenCard symbol="MYTOKEN" name="My Custom Token" balance="50,000.00" isVerified={false} />
    </YStack>
  ),
};
