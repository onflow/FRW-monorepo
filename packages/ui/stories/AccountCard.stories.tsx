import type { Meta, StoryObj } from '@storybook/react-vite';

import { AccountCard } from '../src/components/AccountCard';

const meta: Meta<typeof AccountCard> = {
  title: 'Components/AccountCard',
  component: AccountCard,
  parameters: {
    layout: 'padded',
  },
  argTypes: {
    account: {
      control: 'object',
      description: 'The account data',
    },
    title: {
      control: 'text',
      description: 'Title to display above the account',
    },
    isLoading: {
      control: 'boolean',
      description: 'Loading state',
    },
    showBackground: {
      control: 'boolean',
      description: 'Whether to show background container',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

const mockAccount = {
  name: 'Main Account',
  address: '0x1234567890abcdef',
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Flow',
  balance: '123.45 FLOW | 5 NFTs',
};

const mockAccounts = [
  mockAccount,
  {
    name: 'Trading Account',
    address: '0xabcdef1234567890',
    avatar: undefined,
    balance: '25.0 FLOW',
  },
  {
    name: 'Savings Account',
    address: '0x567890abcdef1234',
    avatar: undefined,
    balance: '100.25 FLOW',
  },
];

export const Default: Story = {
  args: {
    account: mockAccount,
    title: 'From Account',
    isLoading: false,
    showBackground: false,
  },
};

export const WithBackground: Story = {
  args: {
    account: mockAccount,
    title: 'From Account',
    isLoading: false,
    showBackground: true,
  },
};

export const Loading: Story = {
  args: {
    account: mockAccount,
    title: 'From Account',
    isLoading: true,
    showBackground: false,
  },
};

export const LoadingWithBackground: Story = {
  args: {
    account: mockAccount,
    title: 'From Account',
    isLoading: true,
    showBackground: true,
  },
};

export const NoBalance: Story = {
  args: {
    account: {
      name: 'Empty Account',
      address: '0xabcdef1234567890',
    },
    title: 'To Account',
    isLoading: false,
    showBackground: false,
  },
};

export const LongAccountName: Story = {
  args: {
    account: {
      name: 'My Very Long Account Name That Might Wrap',
      address: '0x1234567890abcdefghijklmnop',
      balance: '999,999.99 FLOW | 150 NFTs',
    },
    title: 'From Account',
    isLoading: false,
    showBackground: true,
  },
};

export const WithModalSelection: Story = {
  args: {
    account: mockAccount,
    title: 'From Account',
    isLoading: false,
    showBackground: true,
    enableModalSelection: true,
    accounts: mockAccounts,
    modalTitle: 'Select Account',
    onAccountSelect: (account) => console.log('Account selected:', account),
  },
};
