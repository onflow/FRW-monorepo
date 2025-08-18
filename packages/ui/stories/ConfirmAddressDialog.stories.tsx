import type { Meta, StoryObj } from '@storybook/react-vite';
import React, { useState } from 'react';
import { Button, YStack } from 'tamagui';

import { ConfirmAddressDialog } from '../src/components/ConfirmAddressDialog';

const meta: Meta<typeof ConfirmAddressDialog> = {
  title: 'Components/ConfirmAddressDialog',
  component: ConfirmAddressDialog,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'ConfirmAddressDialog asks users to confirm a destination address before sending transactions, helping prevent accidental transfers to wrong addresses.',
      },
    },
  },
  argTypes: {
    visible: { control: 'boolean' },
    title: { control: 'text' },
    message: { control: 'text' },
    address: { control: 'text' },
    buttonText: { control: 'text' },
    onClose: { action: 'dialog-closed' },
    onConfirm: { action: 'address-confirmed' },
  },
  decorators: [
    (Story) => (
      <YStack w="100vw" h="100vh" items="center" justify="center" bg="$bg">
        <Story />
      </YStack>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof ConfirmAddressDialog>;

export const Default: Story = {
  args: {
    visible: true,
    title: 'Confirm address',
    message:
      'We noticed this may be your first time sending to this address. Please confirm the destination address.',
    address: '0x5519456601b51057815CD2d78dB03326Dcc329bF',
    buttonText: 'Confirm address',
  },
};

export const Interactive: Story = {
  render: function InteractiveRender() {
    const [visible, setVisible] = useState(false);

    return (
      <YStack gap="$4" items="center">
        <Button onPress={() => setVisible(true)}>Show Address Confirmation</Button>

        <ConfirmAddressDialog
          visible={visible}
          title="Confirm address"
          message="We noticed this may be your first time sending to this address. Please confirm the destination address."
          address="0x5519456601b51057815CD2d78dB03326Dcc329bF"
          buttonText="Confirm address"
          onClose={() => setVisible(false)}
          onConfirm={() => {
            console.log('Address confirmed');
            setVisible(false);
          }}
        />
      </YStack>
    );
  },
};
