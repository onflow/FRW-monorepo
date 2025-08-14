import type { Meta, StoryObj } from '@storybook/react-vite';
import React from 'react';
import { YStack } from 'tamagui';

import {
  RecipientItem,
  AccountItem,
  ContactItem,
  RecentItem,
} from '../src/components/RecipientItem';

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
    showEditButton: { control: 'boolean' },
    showCopyButton: { control: 'boolean' },
    isSelected: { control: 'boolean' },
    isDisabled: { control: 'boolean' },
    avatarSize: { control: 'number', min: 24, max: 80, step: 4 },
    onPress: { action: 'pressed' },
    onEdit: { action: 'edit' },
    onCopy: { action: 'copy' },
  },
  decorators: [
    (Story) => (
      <YStack p="$4" width={400}>
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

export const WithAvatar: Story = {
  args: {
    name: 'Avatar User',
    address: '0x1111222233334444555566667777888899990000',
    type: 'contact',
    avatar: 'https://via.placeholder.com/40x40/4F46E5/FFFFFF?text=AU',
    showEditButton: true,
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

export const Selected: Story = {
  args: {
    name: 'Selected Account',
    address: '0xaaaaaabbbbbbccccccddddddeeeeeeffffffffff',
    type: 'account',
    balance: '750.25 FLOW',
    showBalance: true,
    isSelected: true,
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
  render: (args) => (
    <AccountItem
      name="My Main Account"
      address="0x1234567890abcdef1234567890abcdef12345678"
      balance="1,250.50 FLOW"
      onPress={() => console.log('Account pressed')}
    />
  ),
};

export const ContactVariant: Story = {
  render: (args) => (
    <ContactItem
      name="Alice Cooper"
      address="0x9876543210fedcba9876543210fedcba98765432"
      onPress={() => console.log('Contact pressed')}
      onCopy={() => console.log('Copy contact')}
    />
  ),
};

export const RecentVariant: Story = {
  render: (args) => (
    <RecentItem
      name="Recent Transfer to Bob"
      address="0xabcdef1234567890abcdef1234567890abcdef12"
      onPress={() => console.log('Recent pressed')}
    />
  ),
};
