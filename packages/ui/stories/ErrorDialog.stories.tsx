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
          'ErrorDialog displays an error message in a modal dialog with a close button and confirmation action.',
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
    (Story) => (
      <YStack w={400} h={400} items="center" justify="center">
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
  },
};

export const SimpleError: Story = {
  args: {
    visible: true,
    title: 'Transaction Failed',
    message: 'The transaction could not be completed. Please try again later.',
    buttonText: 'Try Again',
  },
};

export const NetworkError: Story = {
  args: {
    visible: true,
    title: 'Network Error',
    message:
      'Unable to connect to the Flow network. Please check your internet connection and try again.',
    buttonText: 'Retry',
  },
};

export const ValidationError: Story = {
  args: {
    visible: true,
    title: 'Invalid Input',
    message: 'The amount you entered is invalid. Please enter a valid number.',
    buttonText: 'Fix Input',
  },
};

export const LongMessage: Story = {
  args: {
    visible: true,
    title: 'Detailed Error Information',
    message:
      'This is a longer error message that provides more detailed information about what went wrong. It includes multiple sentences and explains the context of the error, what the user was trying to do, and potential next steps they can take to resolve the issue.',
    buttonText: 'I Understand',
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
            console.log('User confirmed error dialog');
            setVisible(false);
          }}
        />
      </YStack>
    );
  },
};

export const CustomButton: Story = {
  args: {
    visible: true,
    title: 'Wallet Locked',
    message: 'Your wallet has been locked for security. Please enter your password to unlock it.',
    buttonText: 'Unlock Wallet',
  },
};
