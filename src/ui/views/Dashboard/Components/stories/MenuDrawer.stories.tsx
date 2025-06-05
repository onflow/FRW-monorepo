import { type Meta, type StoryObj } from '@storybook/react-webpack5';
import React from 'react';
import { MemoryRouter } from 'react-router-dom';

import { type UserInfoResponse } from '@/shared/types/network-types';
import { type WalletAccount } from '@/shared/types/wallet-types';

import MenuDrawer from '../MenuDrawer';

// Mock wallet accounts
const mockMainAccount: WalletAccount = {
  id: 0,
  address: '0x1234567890abcdef',
  name: 'Main Account 🦄',
  icon: '🦄',
  color: '#FF6B9D',
  chain: 747,
  balance: '123.4567',
};

const mockEvmAccount: WalletAccount = {
  id: 1,
  address: '0xabcdef1234567890',
  name: 'EVM Account 🔷',
  icon: '🔷',
  color: '#627EEA',
  chain: 747,
  balance: '45.6789',
};

const mockPendingAccount: WalletAccount = {
  id: 2,
  address: '',
  name: '',
  icon: 'pendingAccount',
  color: '#fff',
  chain: 747,
};

const mockChildAccount: WalletAccount = {
  id: 3,
  address: '0x9876543210fedcba',
  name: 'Child Account 🎮',
  icon: '🎮',
  color: '#9945FF',
  chain: 747,
  nfts: 5,
};

const mockUserInfo: UserInfoResponse = {
  id: '12345',
  nickname: 'John Doe',
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=John',
  username: 'johndoe',
  private: 0,
  created: '2024-01-01T00:00:00Z',
};

const mockWalletList: WalletAccount[] = [mockMainAccount, mockEvmAccount, mockChildAccount];

const mockWalletListWithPending: WalletAccount[] = [
  mockMainAccount,
  mockEvmAccount,
  mockPendingAccount,
  mockChildAccount,
];

const meta: Meta<typeof MenuDrawer> = {
  title: 'Views/Dashboard/MenuDrawer',
  tags: ['autodocs'],
  component: MenuDrawer,
  decorators: [
    (Story) => (
      <MemoryRouter>
        <div style={{ height: '100vh', backgroundColor: '#000' }}>
          <Story />
        </div>
      </MemoryRouter>
    ),
  ],
  argTypes: {
    drawer: {
      control: 'boolean',
    },
    network: {
      control: 'select',
      options: ['mainnet', 'testnet'],
    },
    modeOn: {
      control: 'boolean',
    },
    mainAddressLoading: {
      control: 'boolean',
    },
    noAddress: {
      control: 'boolean',
    },
    toggleDrawer: { action: 'toggle drawer' },
    togglePop: { action: 'toggle popup' },
  },
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;

type Story = StoryObj<typeof MenuDrawer>;

export const Default: Story = {
  args: {
    drawer: true,
    userInfo: mockUserInfo,
    walletList: mockWalletList,
    activeAccount: mockMainAccount,
    activeParentAccount: mockMainAccount,
    network: 'mainnet',
    modeOn: false,
    mainAddressLoading: false,
    noAddress: false,
    toggleDrawer: () => {},
    togglePop: () => {},
  },
};

export const Loading: Story = {
  args: {
    drawer: true,
    userInfo: null,
    walletList: [],
    activeAccount: mockMainAccount,
    activeParentAccount: mockMainAccount,
    network: 'mainnet',
    modeOn: false,
    mainAddressLoading: true,
    noAddress: false,
    toggleDrawer: () => {},
    togglePop: () => {},
  },
};

export const WithPendingAccount: Story = {
  args: {
    drawer: true,
    userInfo: mockUserInfo,
    walletList: mockWalletListWithPending,
    activeAccount: mockMainAccount,
    activeParentAccount: mockMainAccount,
    network: 'mainnet',
    modeOn: false,
    mainAddressLoading: false,
    noAddress: false,
    toggleDrawer: () => {},
    togglePop: () => {},
  },
};

export const Testnet: Story = {
  args: {
    drawer: true,
    userInfo: mockUserInfo,
    walletList: mockWalletList,
    activeAccount: mockMainAccount,
    activeParentAccount: mockMainAccount,
    network: 'testnet',
    modeOn: false,
    mainAddressLoading: false,
    noAddress: false,
    toggleDrawer: () => {},
    togglePop: () => {},
  },
};

export const EvmAccountActive: Story = {
  args: {
    drawer: true,
    userInfo: mockUserInfo,
    walletList: mockWalletList,
    activeAccount: mockEvmAccount,
    activeParentAccount: mockMainAccount,
    network: 'mainnet',
    modeOn: false,
    mainAddressLoading: false,
    noAddress: false,
    toggleDrawer: () => {},
    togglePop: () => {},
  },
};

export const ChildAccountActive: Story = {
  args: {
    drawer: true,
    userInfo: mockUserInfo,
    walletList: mockWalletList,
    activeAccount: mockChildAccount,
    activeParentAccount: mockMainAccount,
    network: 'mainnet',
    modeOn: false,
    mainAddressLoading: false,
    noAddress: false,
    toggleDrawer: () => {},
    togglePop: () => {},
  },
};

export const NoAddress: Story = {
  args: {
    drawer: true,
    userInfo: mockUserInfo,
    walletList: [],
    activeAccount: mockMainAccount,
    activeParentAccount: mockMainAccount,
    network: 'mainnet',
    modeOn: false,
    mainAddressLoading: false,
    noAddress: true,
    toggleDrawer: () => {},
    togglePop: () => {},
  },
};

export const Closed: Story = {
  args: {
    drawer: false,
    userInfo: mockUserInfo,
    walletList: mockWalletList,
    activeAccount: mockMainAccount,
    activeParentAccount: mockMainAccount,
    network: 'mainnet',
    modeOn: false,
    mainAddressLoading: false,
    noAddress: false,
    toggleDrawer: () => {},
    togglePop: () => {},
  },
};
