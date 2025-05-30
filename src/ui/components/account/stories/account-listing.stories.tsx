import { type Meta, type StoryObj } from '@storybook/react-webpack5';

import { emojis } from '@/background/utils/emoji.json';
import { MAINNET_CHAIN_ID } from '@/shared/types/network-types';
import { type WalletAccount } from '@/shared/types/wallet-types';

import { AccountCard } from '../account-card';
const mainWalletAccount: WalletAccount = {
  name: emojis[2].name,
  icon: emojis[2].emoji,
  color: emojis[2].bgcolor,
  address: '0x0c666c888d8fb259',
  chain: MAINNET_CHAIN_ID,
  id: 1,
  balance: '550.66005012',
  nfts: 12,
};

const evmWalletAccount: WalletAccount = {
  name: emojis[6].name,
  icon: emojis[6].emoji,
  color: emojis[6].bgcolor,
  address: '0x00000000000000000000000279356d1221d883F5', // Flow COA EVM address
  chain: MAINNET_CHAIN_ID,
  id: 1,
  balance: '550.66005012',
  nfts: 12,
};

const childWallet1: WalletAccount = {
  name: emojis[6].name,
  icon: 'https://accounts.meetdapper.com/static/img/dapper/dapper.png',
  color: emojis[6].bgcolor,
  address: '0x863ac53e3aa7b411', // Flow COA EVM address
  chain: MAINNET_CHAIN_ID,
  id: 1,
  balance: '550.66005012',
  nfts: 12,
};

const childWallet2: WalletAccount = {
  name: 'Dapper Wallet 2',
  icon: 'https://accounts.meetdapper.com/static/img/dapper/dapper.png',
  color: '#FFFFFF',
  address: '0x863ac53e33a7b411', // Flow COA EVM address
  chain: MAINNET_CHAIN_ID,
  id: 1,
  balance: '550.66005012',
  nfts: 12,
};

const meta: Meta<typeof AccountCard> = {
  title: 'Components/AccountCard',

  component: AccountCard,
  argTypes: {
    network: {
      control: 'select',
      options: ['mainnet', 'testnet'],
    },
    account: {
      control: 'object',
      options: [mainWalletAccount, undefined],
    },
    active: {
      control: 'boolean',
    },
    spinning: {
      control: 'boolean',
    },
    showLink: {
      control: 'boolean',
    },
  },
};

export default meta;

type Story = StoryObj<typeof AccountCard>;

export const Default: Story = {
  args: {
    network: 'mainnet',
    account: mainWalletAccount,
  },
};
export const SmallFlow: Story = {
  args: {
    network: 'mainnet',
    account: {
      ...mainWalletAccount,
      balance: '0.00000001',
    },
  },
};

export const LargeFlow: Story = {
  args: {
    network: 'mainnet',
    account: {
      ...mainWalletAccount,
      balance: '1000000000000000000',
    },
  },
};

export const Active: Story = {
  args: {
    network: 'mainnet',
    account: mainWalletAccount,
    active: true,
  },
};

export const EVM: Story = {
  args: {
    network: 'mainnet',
    account: evmWalletAccount,
    parentAccount: mainWalletAccount,
  },
};

export const EVMActive: Story = {
  args: {
    network: 'mainnet',
    account: evmWalletAccount,
    parentAccount: mainWalletAccount,
    active: true,
  },
};

export const EVMSpinning: Story = {
  args: {
    network: 'mainnet',
    account: evmWalletAccount,
    parentAccount: mainWalletAccount,
    spinning: true,
  },
};
export const EVMLink: Story = {
  args: {
    network: 'mainnet',
    account: evmWalletAccount,
    parentAccount: mainWalletAccount,
    showLink: true,
  },
};

export const Loading: Story = {
  args: {
    network: 'mainnet',
    active: true,
  },
};
