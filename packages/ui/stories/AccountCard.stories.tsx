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
    enableModalSelection: {
      control: 'boolean',
      description: 'Whether to enable modal selection',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

const mockAccount = {
  name: 'Panda',
  address: '0x0c666c888d8fb259',
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Panda',
  balance: '550.66 FLOW',
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
  },
};

export const Loading: Story = {
  args: {
    account: mockAccount,
    title: 'From Account',
    isLoading: true,
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
  },
};

export const WithModalSelection: Story = {
  args: {
    account: mockAccount,
    title: 'From Account',
    isLoading: false,
    enableModalSelection: true,
    accounts: mockAccounts,
    modalTitle: 'Select Account',
    onAccountSelect: (_account) => {
      /* Account selected: ${account} */
    },
  },
};
