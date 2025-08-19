import type { Meta, StoryObj } from '@storybook/react-vite';
import React, { useState } from 'react';
import { Button, YStack } from 'tamagui';

import { ErrorDialog } from '../src/components/ErrorDialog';

const meta: Meta<typeof ErrorDialog> = {
  title: 'Components/ErrorDialog',
  component: ErrorDialog,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'ErrorDialog displays error, warning, or informational messages in a modal dialog with proper accessibility features, keyboard support, and theming.',
      },
    },
  },
  argTypes: {
    visible: { control: 'boolean' },
    title: { control: 'text' },
    message: { control: 'text' },
    buttonText: { control: 'text' },

    onClose: { action: 'dialog-closed' },
    onConfirm: { action: 'dialog-confirmed' },
  },
  decorators: [
    (Story): React.JSX.Element => (
      <YStack w="100vw" h="100vh" items="center" justify="center" bg="$bg">
        <Story />
      </YStack>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof ErrorDialog>;

export const Default: Story = {
  args: {
    visible: true,
    title: 'Account Compatibility',
    message:
      'Flow Wallet manages your EVM and your Cadence accounts on Flow. EVM accounts are compatible with EVM apps, and Cadence accounts are compatible with Cadence apps.\n\nIf an application is on EVM or Cadence, only compatible accounts will be available to connect.',
    buttonText: 'Okay',
    variant: 'info',
  },
};

export const WarningVariant: Story = {
  args: {
    visible: true,
    title: 'Network Congestion',
    message:
      'The Flow network is experiencing high traffic. Your transaction may take longer than usual to process.',
    buttonText: 'Continue Anyway',
    variant: 'warning',
  },
};

export const LongMessage: Story = {
  args: {
    visible: true,
    title: 'Security Notice',
    message:
      'Your wallet has detected suspicious activity on your account. For your security, certain features have been temporarily restricted. Please review your recent transactions and contact support if you notice any unauthorized activity. This is a precautionary measure to protect your assets.',
    buttonText: 'Review Account',
    variant: 'warning',
  },
};

export const Interactive: Story = {
  render: function InteractiveRender() {
    const [visible, setVisible] = useState(false);

    return (
      <YStack gap="$4" items="center">
        <Button onPress={() => setVisible(true)}>Show Error Dialog</Button>

        <ErrorDialog
          visible={visible}
          title="Account Compatibility"
          message="Flow Wallet manages your EVM and your Cadence accounts on Flow. EVM accounts are compatible with EVM apps, and Cadence accounts are compatible with Cadence apps.\n\nIf an application is on EVM or Cadence, only compatible accounts will be available to connect."
          buttonText="Okay"
          onClose={() => setVisible(false)}
          onConfirm={() => {
            // User confirmed error dialog
            setVisible(false);
          }}
        />
      </YStack>
    );
  },
};
