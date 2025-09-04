import type { Meta, StoryObj } from '@storybook/react-vite';
import React from 'react';
import { YStack } from 'tamagui';

import { StorageWarning } from '../src/components/StorageWarning';
import { Text } from '../src/foundation/Text';

const meta = {
  title: 'Components/StorageWarning',
  component: StorageWarning,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'StorageWarning displays important storage-related warnings to users about their Flow account balance and storage requirements.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    message: {
      control: { type: 'text' },
      description: 'Custom warning message text',
    },
    showIcon: {
      control: { type: 'boolean' },
      description: 'Whether to show the info icon next to the title',
    },
    title: {
      control: { type: 'text' },
      description: 'Title text for the warning section',
    },
    visible: {
      control: { type: 'boolean' },
      description: 'Whether to show the warning',
    },
    infoDialogContent: {
      control: false,
      description: 'Custom content to show in the info dialog when info icon is clicked',
    },
    infoDialogTitle: {
      control: { type: 'text' },
      description: 'Title for the info dialog',
    },
    infoDialogButtonText: {
      control: { type: 'text' },
      description: 'Optional button text for the info dialog',
    },
    onInfoDialogButtonClick: {
      action: 'onInfoDialogButtonClick',
      description: 'Callback when info dialog button is clicked',
    },
  },
  decorators: [
    (Story): React.JSX.Element => (
      <YStack width={400} p="$4" bg="$bg" rounded="$4">
        <Story />
      </YStack>
    ),
  ],
} satisfies Meta<typeof StorageWarning>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    message:
      'Account balance will fall below the minimum FLOW required for storage after this transaction, causing this transaction to fail.',
    showIcon: true,
    title: 'Storage warning',
    visible: true,
  },
};

export const WithoutIcon: Story = {
  args: {
    message:
      'Account balance will fall below the minimum FLOW required for storage after this transaction, causing this transaction to fail.',
    showIcon: false,
    title: 'Storage warning',
    visible: true,
  },
};

export const CustomTitle: Story = {
  args: {
    message:
      'Account balance will fall below the minimum FLOW required for storage after this transaction, causing this transaction to fail.',
    showIcon: true,
    title: 'Flow Storage Alert',
    visible: true,
  },
};

export const ShortMessage: Story = {
  args: {
    message: 'Insufficient FLOW for storage requirements.',
    showIcon: true,
    title: 'Storage warning',
    visible: true,
  },
};

export const LongMessage: Story = {
  args: {
    message:
      "Your Flow account balance will fall below the minimum amount required for storage after this transaction. This means the transaction will fail because there won't be enough FLOW to cover the storage costs. Please ensure you have sufficient FLOW balance to cover both the transaction fees and the minimum storage requirements before proceeding.",
    showIcon: true,
    title: 'Storage warning',
    visible: true,
  },
};

export const CustomMessage: Story = {
  args: {
    message:
      'Warning: This transaction may exceed your available storage capacity. Consider increasing your FLOW balance or reducing the transaction amount.',
    showIcon: true,
    title: 'Transaction Alert',
    visible: true,
  },
};

export const WithCustomInfoDialog: Story = {
  args: {
    message:
      'Account balance will fall below the minimum FLOW required for storage after this transaction, causing this transaction to fail.',
    showIcon: true,
    title: 'Storage warning',
    visible: true,
    infoDialogTitle: 'Storage Information',
    infoDialogContent: (
      <YStack gap={12}>
        <Text fontSize="$3" fontWeight="400" color="$white" lineHeight={20}>
          Flow accounts require a minimum balance of FLOW tokens to cover storage costs.
        </Text>
        <Text fontSize="$3" fontWeight="400" color="$white" lineHeight={20}>
          When sending tokens or NFTs, ensure your account maintains sufficient FLOW balance to cover storage requirements, otherwise the transaction will fail.
        </Text>
        <Text fontSize="$3" fontWeight="400" color="rgba(255, 255, 255, 0.7)" lineHeight={20}>
          Learn more about Flow account storage at docs.onflow.org
        </Text>
      </YStack>
    ),
  },
};

export const WithDialogButton: Story = {
  args: {
    message: 'Insufficient FLOW balance for this transaction.',
    showIcon: true,
    title: 'Storage warning',
    visible: true,
    infoDialogTitle: 'Storage Requirements',
    infoDialogButtonText: 'Add FLOW',
    infoDialogContent: (
      <YStack gap={12}>
        <Text fontSize="$3" fontWeight="400" color="$white" lineHeight={20}>
          Your account needs more FLOW tokens to cover storage costs for this transaction.
        </Text>
        <Text fontSize="$3" fontWeight="400" color="$white" lineHeight={20}>
          You can add FLOW to your account to proceed with this transaction.
        </Text>
      </YStack>
    ),
  },
};