import type { Meta, StoryObj } from '@storybook/react-vite';
import { Button } from 'tamagui';

import { AccountSelectorModal } from '../src/components/AccountSelectorModal';
import type { Account } from '../src/types';

const mockAccounts: Account[] = [
  {
    name: 'Main Account',
    address: '0x1234567890abcdef1234567890abcdef12345678',
    avatar: undefined,
    balance: '10.5 FLOW',
  },
  {
    name: 'Trading Account',
    address: '0xabcdef1234567890abcdef1234567890abcdef12',
    avatar: undefined,
    balance: '25.0 FLOW',
  },
  {
    name: 'Savings Account',
    address: '0x567890abcdef1234567890abcdef1234567890ab',
    avatar: undefined,
    balance: '100.25 FLOW',
  },
];

const meta = {
  title: 'Components/AccountSelectorModal',
  component: AccountSelectorModal,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    title: { control: 'text' },
  },
} satisfies Meta<typeof AccountSelectorModal>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    accounts: mockAccounts,
    currentAccount: mockAccounts[0],
    title: 'Select Account',
    trigger: <Button>Open Account Selector</Button>,
    onAccountSelect: (account) => console.log('Selected:', account),
  },
};

export const WithoutCurrentAccount: Story = {
  args: {
    accounts: mockAccounts,
    currentAccount: null,
    title: 'Choose Your Account',
    trigger: <Button>Choose Account</Button>,
    onAccountSelect: (account) => console.log('Selected:', account),
  },
};

export const CustomTitle: Story = {
  args: {
    accounts: mockAccounts,
    currentAccount: mockAccounts[1],
    title: 'Switch to Different Account',
    trigger: <Button variant="outlined">Switch Account</Button>,
    onAccountSelect: (account) => console.log('Selected:', account),
  },
};
