import type { Meta, StoryObj } from '@storybook/react-vite';
import React, { useState } from 'react';
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
      <YStack width={400} p="$4">
        <Story />
      </YStack>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof ToAccountSection>;

// Mock accounts
const mockAccount: WalletAccount = {
  address: '0xabcdef1234567890abcdef1234567890abcdef12',
  name: 'John Doe',
  avatar: 'https://via.placeholder.com/40x40/6366F1/FFFFFF?text=JD',
};

const mockAccountWithoutName: WalletAccount = {
  address: '0xabcdef1234567890abcdef1234567890abcdef12',
};

const mockAccountLongName: WalletAccount = {
  address: '0xabcdef1234567890abcdef1234567890abcdef12',
  name: 'Very Long Account Name That Should Be Handled Properly',
  avatar: 'https://via.placeholder.com/40x40/F59E0B/FFFFFF?text=VL',
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

export const WithoutAvatar: Story = {
  args: {
    account: mockAccount,
    showAvatar: false,
  },
};

export const WithoutEditButton: Story = {
  args: {
    account: mockAccount,
    showEditButton: false,
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

export const IncompatibleWithCustomMessage: Story = {
  args: {
    account: mockAccount,
    isAccountIncompatible: true,
    incompatibilityMessage:
      'This account does not support NFT transfers. Please select a different account.',
  },
};

export const LargeAvatar: Story = {
  args: {
    account: mockAccount,
    avatarSize: 60,
  },
};

export const SmallAvatar: Story = {
  args: {
    account: mockAccount,
    avatarSize: 30,
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

export const DifferentAccountTypes: Story = {
  render: () => (
    <YStack gap="$4" width={400}>
      <ToAccountSection
        account={{ address: '0x1234...5678', name: 'Personal Wallet' }}
        title="Personal Account"
      />
      <ToAccountSection
        account={{ address: '0xabcd...efgh', name: 'Business Account' }}
        title="Business Account"
      />
      <ToAccountSection account={{ address: '0x9876...5432' }} title="External Account" />
    </YStack>
  ),
  decorators: [
    (Story) => (
      <YStack p="$4">
        <Story />
      </YStack>
    ),
  ],
};

export const Interactive: Story = {
  render: function InteractiveRender() {
    const [isIncompatible, setIsIncompatible] = useState(false);
    const [editCount, setEditCount] = useState(0);

    const handleEditPress = () => {
      setEditCount((prev) => prev + 1);
      alert(`Edit pressed ${editCount + 1} times!`);
    };

    const handleToggleCompatibility = () => {
      setIsIncompatible(!isIncompatible);
    };

    const handleLearnMore = () => {
      alert('Learn more about account compatibility!');
    };

    return (
      <YStack gap="$4" width={400}>
        <ToAccountSection
          account={{
            ...mockAccount,
            name: editCount > 0 ? `${mockAccount.name} (Edited ${editCount}x)` : mockAccount.name,
          }}
          isAccountIncompatible={isIncompatible}
          onEditPress={handleEditPress}
          onLearnMorePress={handleLearnMore}
        />

        <YStack gap="$2" flexDirection="row">
          <YStack
            bg="$blue9"
            rounded="$3"
            px="$3"
            py="$2"
            pressStyle={{ opacity: 0.8 }}
            onPress={handleToggleCompatibility}
            cursor="pointer"
          >
            <YStack fontSize="$3" color="$white" fontWeight="500">
              Toggle Compatibility
            </YStack>
          </YStack>
        </YStack>

        <YStack fontSize="$3" color="$gray11">
          Compatible: {isIncompatible ? 'No' : 'Yes'}
        </YStack>
      </YStack>
    );
  },
};

export const SendFlowExamples: Story = {
  render: () => (
    <YStack gap="$4" width={400}>
      <YStack fontSize="$5" fontWeight="600" color="$color" mb="$2">
        Send Flow Examples
      </YStack>

      <ToAccountSection account={mockAccount} title="Token Recipient" />

      <ToAccountSection account={mockAccount} title="NFT Recipient" />

      <ToAccountSection
        account={mockAccount}
        title="Multi-NFT Recipient"
        isAccountIncompatible={true}
        incompatibilityMessage="This account does not support batch NFT transfers"
      />
    </YStack>
  ),
  decorators: [
    (Story) => (
      <YStack p="$4">
        <Story />
      </YStack>
    ),
  ],
};

export const WarningStates: Story = {
  render: () => (
    <YStack gap="$4" width={400}>
      <ToAccountSection
        account={mockAccount}
        isAccountIncompatible={true}
        title="Token Transfer"
        incompatibilityMessage="This account may not support this token type"
      />

      <ToAccountSection
        account={mockAccount}
        isAccountIncompatible={true}
        title="NFT Transfer"
        incompatibilityMessage="This account does not have NFT capabilities enabled"
      />

      <ToAccountSection
        account={mockAccount}
        isAccountIncompatible={true}
        title="Batch Transfer"
        incompatibilityMessage="Batch transfers require account upgrade. Please contact support."
      />
    </YStack>
  ),
  decorators: [
    (Story) => (
      <YStack p="$4">
        <Story />
      </YStack>
    ),
  ],
};

export const NoAvatar: Story = {
  args: {
    account: {
      address: '0xabcdef1234567890abcdef1234567890abcdef12',
      name: 'No Avatar Account',
    },
  },
};

export const ColorVariations: Story = {
  render: () => (
    <YStack gap="$4" width={400}>
      <ToAccountSection account={mockAccount} backgroundColor="$green2" title="Verified Account" />

      <ToAccountSection
        account={mockAccount}
        backgroundColor="$red2"
        title="Restricted Account"
        isAccountIncompatible={true}
      />

      <ToAccountSection account={mockAccount} backgroundColor="$purple2" title="Premium Account" />
    </YStack>
  ),
  decorators: [
    (Story) => (
      <YStack p="$4">
        <Story />
      </YStack>
    ),
  ],
};
