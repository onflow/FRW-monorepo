import type { Meta, StoryObj } from '@storybook/react-vite';
import React from 'react';
import { YStack } from 'tamagui';

import { ToAccountSection, type WalletAccount } from '../src/components/ToAccountSection';

const meta: Meta<typeof ToAccountSection> = {
  title: 'Components/ToAccountSection',
  component: ToAccountSection,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'ToAccountSection displays recipient account information with optional compatibility warnings and edit functionality.',
      },
    },
  },
  argTypes: {
    isAccountIncompatible: { control: 'boolean' },
    showEditButton: { control: 'boolean' },
    showAvatar: { control: 'boolean' },
    title: { control: 'text' },
    backgroundColor: { control: 'color' },
    borderRadius: { control: 'text' },
    contentPadding: { control: 'number', min: 8, max: 32 },
    avatarSize: { control: 'number', min: 24, max: 80 },
    incompatibilityMessage: { control: 'text' },
    onEditPress: { action: 'edit-pressed' },
    onLearnMorePress: { action: 'learn-more-pressed' },
  },
  decorators: [
    (Story) => (
      <YStack width={375} p="$4" bg="$gray12">
        <Story />
      </YStack>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof ToAccountSection>;

// Mock accounts
const mockAccount: WalletAccount = {
  address: '0x0c666c888d8fb259',
  name: 'Fox',
  avatar: 'https://via.placeholder.com/36x36/FFD787/FFFFFF?text=🦊',
};

const mockAccountWithoutName: WalletAccount = {
  address: '0x0c666c888d8fb259',
};

const mockAccountLongName: WalletAccount = {
  address: '0x0c666c888d8fb259',
  name: 'Very Long Account Name That Should Be Handled Properly',
  avatar: 'https://via.placeholder.com/36x36/FFD787/FFFFFF?text=VL',
};

export const Default: Story = {
  args: {
    account: mockAccount,
  },
};

export const WithoutName: Story = {
  args: {
    account: mockAccountWithoutName,
  },
};

export const CustomTitle: Story = {
  args: {
    account: mockAccount,
    title: 'Recipient',
  },
};

export const IncompatibleAccount: Story = {
  args: {
    account: mockAccount,
    isAccountIncompatible: true,
  },
};

export const CustomStyling: Story = {
  args: {
    account: mockAccount,
    backgroundColor: '$blue2',
    borderRadius: '$6',
    contentPadding: 20,
  },
};

export const CompactPadding: Story = {
  args: {
    account: mockAccount,
    contentPadding: 8,
  },
};

export const LongName: Story = {
  args: {
    account: mockAccountLongName,
  },
};

export const LongAddress: Story = {
  args: {
    account: {
      address: '0xabcdefghijklmnopqrstuvwxyz1234567890abcdefghijklmnopqrstuvwxyz1234567890',
      name: 'Account with Very Long Address',
    },
  },
};

export const NoAvatar: Story = {
  args: {
    account: {
      address: '0xabcdef1234567890abcdef1234567890abcdef12',
      name: 'No Avatar Account',
    },
  },
};
