import type { Meta, StoryObj } from '@storybook/react';
import { YStack } from 'tamagui';

import { InfoDialog } from '../src/components/InfoDialog';
import { Text } from '../src/foundation/Text';

const meta: Meta<typeof InfoDialog> = {
  title: 'Components/InfoDialog',
  component: InfoDialog,
  parameters: {
    layout: 'fullscreen',
    backgrounds: {
      default: 'dark',
      values: [
        { name: 'dark', value: '#000000' },
        { name: 'light', value: '#ffffff' },
      ],
    },
  },
  argTypes: {
    visible: {
      control: 'boolean',
      description: 'Controls whether the dialog is visible',
    },
    title: {
      control: 'text',
      description: 'Optional title for the dialog',
    },
    children: {
      control: false,
      description: 'Content to display in the dialog',
    },
    onClose: {
      action: 'onClose',
      description: 'Callback when dialog is closed',
    },
    buttonText: {
      control: 'text',
      description: 'Optional button text to show at bottom of dialog',
    },
    onButtonClick: {
      action: 'onButtonClick',
      description: 'Callback when bottom button is clicked',
    },
  },
  args: {
    visible: true,
    title: 'Storage Information',
    onClose: () => console.log('Dialog closed'),
    children: (
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

export default meta;
type Story = StoryObj<typeof InfoDialog>;

export const Default: Story = {};

export const WithoutTitle: Story = {
  args: {
    title: undefined,
  },
};

export const CustomContent: Story = {
  args: {
    title: 'Custom Dialog',
    children: (
      <YStack gap={16}>
        <Text fontSize="$4" fontWeight="600" color="$white">
          This is a custom dialog with different content.
        </Text>
        <Text fontSize="$3" fontWeight="400" color="rgba(255, 255, 255, 0.8)">
          You can put any React content here, including buttons, forms, or other components.
        </Text>
      </YStack>
    ),
  },
};

export const WithButton: Story = {
  args: {
    title: 'Confirm Action',
    buttonText: 'Continue',
    children: (
      <YStack gap={12}>
        <Text fontSize="$3" fontWeight="400" color="$white" lineHeight={20}>
          Are you sure you want to proceed with this action?
        </Text>
        <Text fontSize="$3" fontWeight="400" color="rgba(255, 255, 255, 0.7)" lineHeight={20}>
          This action cannot be undone.
        </Text>
      </YStack>
    ),
  },
};