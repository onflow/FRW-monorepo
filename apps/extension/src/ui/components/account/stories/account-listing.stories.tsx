import { type Meta, type StoryObj } from '@storybook/react-webpack5';
import React from 'react';
import { withRouter } from 'storybook-addon-remix-react-router';

import { emoji as emojisJson, MAINNET_CHAIN_ID } from '@/shared/constant';
import {
  type Emoji,
  type MainAccount,
  type WalletAccount,
  type NftCollectionAndIds,
} from '@/shared/types';
import { AccountListing } from '@/ui/components/account/account-listing';
import {
  useCadenceNftCollectionsAndIds as importedMockUseCadenceNftCollectionsAndIds, // Aliased import from the mock file
} from '@/ui/hooks/useNftHook.mock';
import {
  USE_PROFILES_MOCK,
  useProfiles as importedMockUseProfiles,
} from '@/ui/hooks/useProfileHook.mock';

const { emojis } = emojisJson as { emojis: Emoji[] };

const mainWalletAccount: MainAccount = {
  name: emojis[2].name,
  icon: emojis[2].emoji,
  color: emojis[2].bgcolor,
  address: '0x0c666c888d8fb259',
  chain: MAINNET_CHAIN_ID,
  id: 1,
  balance: '550.66005012',
  nfts: 12,
  publicKey: '0x0000000000000000000000000000000000000000000000000000000000000000',
  keyIndex: 0,
  weight: 1000,
  signAlgo: 0,
  signAlgoString: 'ECDSA',
  hashAlgo: 0,
  hashAlgoString: 'SHA256',
};
const mainWalletAccount2: MainAccount = {
  name: emojis[3].name,
  icon: emojis[3].emoji,
  color: emojis[3].bgcolor,
  address: '0x0c555c888d8fb259', // Note: Same address as mainWalletAccount for some stories, differentiate if needed
  chain: MAINNET_CHAIN_ID,
  id: 1, // Differentiate ID if it matters for keying or logic
  balance: '0.00000077',
  nfts: 4,
  publicKey: '0x0000000000000000000000000000000000000000000000000000000000000000',
  keyIndex: 0,
  weight: 1000,
  signAlgo: 0,
  signAlgoString: 'ECDSA',
  hashAlgo: 0,
  hashAlgoString: 'SHA256',
};

const evmWalletAccount: WalletAccount = {
  name: emojis[6].name,
  icon: emojis[6].emoji,
  color: emojis[6].bgcolor,
  address: '0x00000000000000000000000279356d1221d883F5',
  chain: MAINNET_CHAIN_ID,
  id: 1,
  balance: '550.66005012',
  nfts: 12,
};
const evmWalletAccount2: WalletAccount = {
  name: emojis[7].name,
  icon: emojis[7].emoji,
  color: emojis[7].bgcolor,
  address: '0x00000000000000000000000279356d1221d883F6',
  chain: MAINNET_CHAIN_ID,
  id: 1,
  balance: '201.66005012',
  nfts: 0,
};

const noEvmWalletAccount: WalletAccount = {
  name: '',
  icon: '',
  color: '',
  address: '',
  chain: MAINNET_CHAIN_ID,
  id: 1,
};

const childWallet1: WalletAccount = {
  name: 'Dapper Wallet ',
  icon: 'https://accounts.meetdapper.com/static/img/dapper/dapper.png',
  color: emojis[6].bgcolor,
  address: '0x863ac53e3aa7b411',
  chain: MAINNET_CHAIN_ID,
  id: 1,
  balance: '550.66005012',
  nfts: 12,
};

const childWallet2: WalletAccount = {
  name: 'Dapper Wallet 2',
  icon: 'https://accounts.meetdapper.com/static/img/dapper/dapper.png',
  color: emojis[6].bgcolor,
  address: '0x863ac53e33a7b411', // Note: Same address as childWallet1, differentiate if they need to be unique linked accounts for the same parent
  chain: MAINNET_CHAIN_ID,
  id: 1, // Differentiate ID if it matters
  balance: '550.66005012',
  nfts: 12,
};

// Helper to create mock data for stories
const createMockData = (config: {
  [address: string]: {
    evm?: WalletAccount;
    children?: WalletAccount[];
    nfts?: number;
  };
}) => {
  const evmAccounts: Record<string, WalletAccount | undefined> = {};
  const childAccounts: Record<string, WalletAccount[] | undefined> = {};
  const nfts: Record<string, number | undefined> = {};
  for (const addr in config) {
    if (Object.prototype.hasOwnProperty.call(config, addr)) {
      evmAccounts[addr] = config[addr].evm;
      childAccounts[addr] = config[addr].children;
      nfts[addr] = config[addr].nfts;
    }
  }
  return { evmAccounts, childAccounts, nfts };
};

const meta: Meta<typeof AccountListing> = {
  title: 'Components/account/AccountListing',
  tags: ['autodocs'],

  component: AccountListing,
  argTypes: {
    accountList: {
      control: 'object',
    },
    activeAccount: {
      control: 'object',
    },
    network: { control: 'text' },
  },
  decorators: [
    withRouter,
    (Story, context) => {
      importedMockUseCadenceNftCollectionsAndIds.mockReset();
      importedMockUseProfiles.mockReset();
      const { mockData } = context.parameters;
      if (mockData) {
        importedMockUseCadenceNftCollectionsAndIds.mockImplementation(
          (network?: string, address?: string) => {
            if (typeof address === 'string' && mockData.nfts) {
              return [
                { collection: { name: 'test' }, ids: ['test'], count: mockData.nfts[address] },
              ] as NftCollectionAndIds[];
            }
            return [];
          }
        );
        importedMockUseProfiles.mockReturnValue({
          ...USE_PROFILES_MOCK,
          pendingAccountTransactions: mockData.pendingAccountTransactions || [],
        });
      } else {
        importedMockUseProfiles.mockReturnValue({
          ...USE_PROFILES_MOCK,
          pendingAccountTransactions: [],
        });
      }
      return <Story />;
    },
  ],
};

export default meta;

type Story = StoryObj<typeof AccountListing>;

export const Default: Story = {
  args: {
    network: 'mainnet',
    accountList: [
      {
        ...mainWalletAccount,
        evmAccount: evmWalletAccount,
        childAccounts: [childWallet1, childWallet2],
      },
      {
        ...mainWalletAccount2,
        evmAccount: evmWalletAccount2,
        childAccounts: [],
      },
    ],
    activeAccount: undefined,
  },
  parameters: {
    mockData: createMockData({
      [mainWalletAccount.address]: {
        evm: evmWalletAccount,
        children: [childWallet1, childWallet2],
      },
      // Assuming mainWalletAccount2 might have a different address if it's a distinct primary account.
      // If its address is the same as mainWalletAccount, the mockData for that address will be overwritten
      // or used for both depending on map iteration order, which is not guaranteed.
      // For clarity, ensure distinct primary accounts have distinct addresses.
      [mainWalletAccount2.address]: {
        // Ensure this address is unique if mainWalletAccount2 is a separate entity
        evm: evmWalletAccount2,
        children: [], // Example: mainWalletAccount2 has no children in this story
      },
      [childWallet1.address]: {
        nfts: 65000,
      },
      [childWallet2.address]: {
        nfts: 12,
      },
    }),
  },
};

export const Active: Story = {
  args: {
    network: 'mainnet',
    accountList: [
      {
        ...mainWalletAccount,
        childAccounts: [childWallet1, childWallet2],
      },
    ],
    activeAccount: mainWalletAccount,
    activeParentAccount: mainWalletAccount, // not necessary if activeAccount is a main account
    showActiveAccount: true,
  },
  parameters: {
    mockData: createMockData({
      [mainWalletAccount.address]: {
        children: [childWallet1, childWallet2],
      },
      [childWallet1.address]: {
        nfts: 65000,
      },
      [childWallet2.address]: {
        nfts: 12,
      },
    }),
  },
};

export const EVMActive: Story = {
  args: {
    network: 'mainnet',
    accountList: [
      {
        ...mainWalletAccount,
        evmAccount: evmWalletAccount,
        childAccounts: [childWallet2],
      },
    ],
    activeAccount: evmWalletAccount,
    activeParentAccount: mainWalletAccount,
    showActiveAccount: true,
  },
  parameters: {
    mockData: createMockData({
      [mainWalletAccount.address]: {
        evm: evmWalletAccount,
        children: [childWallet2], // ChildWallet1 is omitted as per original story logic
      },
      [childWallet1.address]: {
        nfts: 65000,
      },
      [childWallet2.address]: {
        nfts: 12,
      },
    }),
  },
};

export const NoEVM: Story = {
  args: {
    network: 'mainnet',
    accountList: [
      {
        ...mainWalletAccount,
        evmAccount: noEvmWalletAccount,
        childAccounts: [childWallet1, childWallet2],
      },
    ],
    activeAccount: mainWalletAccount,
    activeParentAccount: {
      ...mainWalletAccount,
      evmAccount: noEvmWalletAccount,
      childAccounts: [childWallet1, childWallet2],
    },
    showActiveAccount: true,
  },
  parameters: {
    mockData: createMockData({
      [mainWalletAccount.address]: {
        evm: noEvmWalletAccount,
        children: [childWallet2], // ChildWallet1 is omitted as per original story logic
      },
      [childWallet1.address]: {
        nfts: 65000,
      },
      [childWallet2.address]: {
        nfts: 12,
      },
    }),
  },
};

export const Loading: Story = {
  args: {
    network: 'mainnet',
    accountList: undefined,
    activeAccount: undefined,
  },
};

export const LoadingActive: Story = {
  args: {
    network: 'mainnet',
    accountList: undefined,
    activeAccount: undefined,
    showActiveAccount: true,
  },
};

export const PendingAccountTransaction: Story = {
  args: {
    network: 'mainnet',
    accountList: [
      {
        ...mainWalletAccount,
        evmAccount: noEvmWalletAccount,
        childAccounts: [childWallet2],
      },
    ],
    activeAccount: mainWalletAccount,
    activeParentAccount: {
      ...mainWalletAccount,
      evmAccount: noEvmWalletAccount,
      childAccounts: [childWallet1, childWallet2],
    },
    showActiveAccount: true,
  },
  parameters: {
    mockData: {
      ...createMockData({
        [mainWalletAccount.address]: {
          evm: noEvmWalletAccount,
          children: [childWallet2], // ChildWallet1 is omitted as per original story logic
        },
        [childWallet1.address]: {
          nfts: 65000,
        },
        [childWallet2.address]: {
          nfts: 12,
        },
      }),
      pendingAccountTransactions: ['1'],
    },
  },
};

export const MultiplePendingAccountTransaction: Story = {
  args: {
    network: 'mainnet',
    accountList: [
      {
        ...mainWalletAccount,
        evmAccount: evmWalletAccount2,
        childAccounts: [childWallet1, childWallet2],
      },
    ],
    activeAccount: mainWalletAccount,
    activeParentAccount: mainWalletAccount,
    showActiveAccount: true,
  },
  parameters: {
    mockData: {
      ...createMockData({
        [mainWalletAccount.address]: {
          evm: evmWalletAccount2,
          children: [childWallet1, childWallet2], // ChildWallet1 is omitted as per original story logic
        },
        [childWallet1.address]: {
          nfts: 65000,
        },
        [childWallet2.address]: {
          nfts: 12,
        },
      }),
      pendingAccountTransactions: ['1', '2', '3'],
    },
  },
};
