import { type Meta, type StoryObj } from '@storybook/react-webpack5';

import emojisJson from '@/background/utils/emoji.json';
const { emojis } = emojisJson;
import { MAINNET_CHAIN_ID } from '@/shared/types/network-types';
import { type WalletAccount } from '@/shared/types/wallet-types';

import { EnableEvmAccountCard } from '../enable-evm-account-card';
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

const meta: Meta<typeof EnableEvmAccountCard> = {
  title: 'Components/EnableEvmAccountCard',
  tags: ['autodocs'],

  component: EnableEvmAccountCard,
};

export default meta;

type Story = StoryObj<typeof EnableEvmAccountCard>;

export const Default: Story = {
  args: {},
};
