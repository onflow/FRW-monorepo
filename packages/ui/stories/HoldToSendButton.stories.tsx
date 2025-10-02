import type { Meta, StoryObj } from '@storybook/react-vite';
import React from 'react';
import { YStack } from 'tamagui';

import { HoldToSendButton } from '../src/components/HoldToSendButton';

const meta = {
  title: 'Components/HoldToSendButton',
  component: HoldToSendButton,
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    holdDuration: { control: { type: 'number', min: 300, step: 100 } },
    stopSignal: { control: { type: 'boolean' } },
  },
} satisfies Meta<typeof HoldToSendButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Basic: Story = {
  args: {
    holdDuration: 1500,
    stopSignal: false,
    holdToSendText: 'Hold to Send',
  },
  render: (args) => (
    <YStack width={360} padding="$4">
      <HoldToSendButton
        holdDuration={args.holdDuration}
        stopSignal={args.stopSignal}
        holdToSendText={args.holdToSendText as string}
        onPress={() => new Promise((res) => setTimeout(res, 2000))}
        onComplete={() => void 0}
      />
    </YStack>
  ),
};
