import type { Meta, StoryObj } from '@storybook/react-vite';
import React from 'react';
import { YStack } from 'tamagui';

import { RecipientItem, AccountItem } from '../src/components/RecipientItem';

const meta: Meta<typeof RecipientItem> = {
  title: 'Components/RecipientItem',
  component: RecipientItem,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'RecipientItem displays recipient information with different types, actions, and states. Includes preset variants for different recipient types.',
      },
    },
  },
  argTypes: {
    name: { control: 'text' },
    address: { control: 'text' },
    type: {
      control: 'select',
      options: ['account', 'contact', 'recent', 'unknown'],
    },
    balance: { control: 'text' },
    isLoading: { control: 'boolean' },
    showBalance: { control: 'boolean' },
    showCopyButton: { control: 'boolean' },
    isSelected: { control: 'boolean' },
    isDisabled: { control: 'boolean' },
    avatarSize: { control: 'number', min: 24, max: 80, step: 4 },
    onPress: { action: 'pressed' },
    onCopy: { action: 'copy' },
  },
  decorators: [
    (Story): React.JSX.Element => (
      <YStack padding="$4" width={400}>
        <Story />
      </YStack>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof RecipientItem>;

export const Default: Story = {
  args: {
    name: 'Main Account',
    address: '0x1234567890abcdef1234567890abcdef12345678',
    type: 'account',
    balance: '100.50 FLOW',
    showBalance: true,
  },
};

export const Account: Story = {
  args: {
    name: 'Flow Account',
    address: '0x1234567890abcdef1234567890abcdef12345678',
    type: 'account',
    balance: '2,450.75 FLOW',
    showBalance: true,
  },
};

export const Contact: Story = {
  args: {
    name: 'John Doe',
    address: '0x9876543210fedcba9876543210fedcba98765432',
    type: 'contact',
    showCopyButton: true,
  },
};

export const Recent: Story = {
  args: {
    name: 'Recent Transfer',
    address: '0xabcdef1234567890abcdef1234567890abcdef12',
    type: 'recent',
  },
};

export const UnknownAddress: Story = {
  args: {
    name: 'Unknown Address',
    address: '0x5555666677778888999900001111222233334444',
    type: 'unknown',
    showCopyButton: true,
  },
};

export const Loading: Story = {
  args: {
    name: 'Loading Account',
    address: '0x0000111122223333444455556666777788889999',
    type: 'account',
    balance: '...',
    showBalance: true,
    isLoading: true,
  },
};

export const Disabled: Story = {
  args: {
    name: 'Disabled Account',
    address: '0xdeadbeefcafebabe123456789abcdef012345678',
    type: 'account',
    balance: '0.00 FLOW',
    showBalance: true,
    isDisabled: true,
  },
};

// Preset variants stories
export const AccountVariant: Story = {
  render: (): React.JSX.Element => (
    <AccountItem
      name="My Main Account"
      address="0x1234567890abcdef1234567890abcdef12345678"
      balance="1,250.50 FLOW"
      onPress={() => void 0}
    />
  ),
};

export const LinkedAccount: Story = {
  args: {
    name: 'Penguin',
    address: '0x0c666c888d8fb259',
    type: 'account',
    balance: '550.66 Flow | 12 NFTs',
    showBalance: true,
    isLinked: true,
    avatar: '🐧',
  },
};

export const EVMAccount: Story = {
  args: {
    name: 'EVM Account',
    address: '0x1234567890abcdef1234567890abcdef12345678',
    type: 'account',
    balance: '100.50 ETH',
    showBalance: true,
    isEVM: true,
  },
};

export const LinkedEVMAccount: Story = {
  args: {
    name: 'Linked EVM',
    address: '0x0c666c888d8fb259',
    type: 'account',
    balance: '550.66 ETH | 5 NFTs',
    showBalance: true,
    isLinked: true,
    isEVM: true,
    avatar: '🐧',
  },
};

export const LinkedAccountWithParent: Story = {
  args: {
    name: 'Penguin',
    address: '0x0c666c888d8fb259',
    type: 'account',
    balance: '550.66 Flow | 12 NFTs',
    showBalance: true,
    isLinked: true,
    avatar: '🐧',
    parentAvatar: '🐼',
  },
};
