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

export const LongAddress: Story = {
  args: {
    visible: true,
    title: 'Confirm address',
    message:
      'We noticed this may be your first time sending to this address. Please confirm the destination address.',
    address: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
    buttonText: 'Confirm address',
  },
};

export const CustomMessage: Story = {
  args: {
    visible: true,
    title: 'Verify Recipient',
    message:
      'This address is not in your contacts. Please double-check that this is the correct recipient before proceeding.',
    address: '0xf8d6e0586b0a20c7',
    buttonText: 'Send Anyway',
  },
};

export const ShortAddress: Story = {
  args: {
    visible: true,
    title: 'Confirm address',
    message:
      'We noticed this may be your first time sending to this address. Please confirm the destination address.',
    address: '0xf8d6e0586b0a20c7',
    buttonText: 'Confirm address',
  },
};

export const CustomTitle: Story = {
  args: {
    visible: true,
    title: 'New Address Detected',
    message: 'This appears to be a new address. Please verify it is correct before continuing.',
    address: '0x8b148183c28ff88f',
    buttonText: 'Proceed',
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

export const MultipleScenarios: Story = {
  render: function MultipleScenariosRender() {
    const [currentScenario, setCurrentScenario] = useState<string | null>(null);

    const scenarios = [
      {
        id: 'new-address',
        title: 'New Address',
        address: '0x5519456601b51057815CD2d78dB03326Dcc329bF',
      },
      {
        id: 'flow-address',
        title: 'Flow Address',
        address: '0xf8d6e0586b0a20c7',
      },
      {
        id: 'long-address',
        title: 'Long Address',
        address: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
      },
    ];

    return (
      <YStack gap="$4" items="center">
        <YStack gap="$2" items="center">
          {scenarios.map((scenario) => (
            <Button
              key={scenario.id}
              onPress={() => setCurrentScenario(scenario.id)}
              variant="outline"
            >
              {scenario.title}
            </Button>
          ))}
        </YStack>

        {scenarios.map((scenario) => (
          <ConfirmAddressDialog
            key={scenario.id}
            visible={currentScenario === scenario.id}
            address={scenario.address}
            onClose={() => setCurrentScenario(null)}
            onConfirm={() => {
              console.log(`Confirmed ${scenario.title}: ${scenario.address}`);
              setCurrentScenario(null);
            }}
          />
        ))}
      </YStack>
    );
  },
};
