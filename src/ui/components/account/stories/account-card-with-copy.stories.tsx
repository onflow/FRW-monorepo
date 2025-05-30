import { type Meta, type StoryObj } from '@storybook/react-webpack5';
import React from 'react';

import { emojis } from '@/background/utils/emoji.json';
import { MAINNET_CHAIN_ID } from '@/shared/types/network-types';
import { MainAccount, type WalletAccount } from '@/shared/types/wallet-types';

import { CopyButton } from '../../CopyButton';
import { AccountCardWithCopy } from '../account-card';
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

const meta: Meta<typeof AccountCardWithCopy> = {
  title: 'Components/AccountCardWithCopy',

  component: AccountCardWithCopy,
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
  },
};

export default meta;

type Story = StoryObj<typeof AccountCardWithCopy>;

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

export const Loading: Story = {
  args: {
    network: 'mainnet',
    active: true,
  },
};
