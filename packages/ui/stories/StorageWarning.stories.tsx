import type { Meta, StoryObj } from '@storybook/react-vite';
import React from 'react';
import { YStack } from 'tamagui';

import { StorageWarning } from '../src/components/StorageWarning';

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
