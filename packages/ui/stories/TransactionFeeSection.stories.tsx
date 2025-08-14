import type { Meta, StoryObj } from '@storybook/react-vite';
import React from 'react';
import { YStack } from 'tamagui';

import { TransactionFeeSection } from '../src/components/TransactionFeeSection';

const meta: Meta<typeof TransactionFeeSection> = {
  title: 'Components/TransactionFeeSection',
  component: TransactionFeeSection,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'TransactionFeeSection displays transaction fees with Flow and USD amounts, including strikethrough styling when fees are covered.',
      },
    },
  },
  argTypes: {
    flowFee: { control: 'text' },
    usdFee: { control: 'text' },
    title: { control: 'text' },
    showCovered: { control: 'boolean' },
    coveredMessage: { control: 'text' },
    isFree: { control: 'boolean' },
    backgroundColor: { control: 'color' },
    borderRadius: { control: 'text' },
    contentPadding: { control: 'number', min: 8, max: 32 },
    titleColor: { control: 'color' },
    feeColor: { control: 'color' },
  },
  decorators: [
    (Story) => (
      <YStack width={400} padding="$4">
        <Story />
      </YStack>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof TransactionFeeSection>;

export const Default: Story = {
  args: {
    flowFee: '0.001 FLOW',
    usdFee: '$0.02',
    showCovered: true,
  },
};

export const FreeFee: Story = {
  args: {
    flowFee: '0.001 FLOW',
    usdFee: '$0.02',
    isFree: true,
    showCovered: true,
    coveredMessage: 'Covered by Flow Wallet',
  },
};

export const WithoutCoveredMessage: Story = {
  args: {
    flowFee: '0.001 FLOW',
    usdFee: '$0.02',
    showCovered: false,
  },
};

export const WithBackground: Story = {
  args: {
    flowFee: '0.005 FLOW',
    usdFee: '$0.10',
    title: 'Network Fee',
    backgroundColor: 'rgba(0, 239, 139, 0.1)',
    borderRadius: 16,
    contentPadding: 16,
    titleColor: '#00EF8B',
    feeColor: '#00EF8B',
  },
};

export const HighFee: Story = {
  args: {
    flowFee: '0.1 FLOW',
    usdFee: '$2.50',
    title: 'Priority Fee',
    showCovered: false,
  },
};
