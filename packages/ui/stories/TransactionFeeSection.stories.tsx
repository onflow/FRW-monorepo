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
          'TransactionFeeSection displays transaction fees with optional descriptions and customizable styling.',
      },
    },
  },
  argTypes: {
    transactionFee: { control: 'text' },
    title: { control: 'text' },
    description: { control: 'text' },
    backgroundColor: { control: 'color' },
    borderRadius: { control: 'text' },
    contentPadding: { control: 'number', min: 8, max: 32 },
    titleColor: { control: 'color' },
    feeColor: { control: 'color' },
    showEstimate: { control: 'boolean' },
  },
  decorators: [
    (Story) => (
      <YStack width={300} p="$4">
        <Story />
      </YStack>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof TransactionFeeSection>;

export const Default: Story = {
  args: {
    transactionFee: '0.001 FLOW',
  },
};

export const WithEstimate: Story = {
  args: {
    transactionFee: '0.001 FLOW',
    showEstimate: true,
  },
};

export const WithoutEstimate: Story = {
  args: {
    transactionFee: '0.001 FLOW',
    showEstimate: false,
  },
};

export const CustomTitle: Story = {
  args: {
    transactionFee: '0.001 FLOW',
    title: 'Gas Fee',
  },
};

export const WithDescription: Story = {
  args: {
    transactionFee: '0.001 FLOW',
    description: 'This fee goes to validators to process your transaction',
  },
};

export const HighFee: Story = {
  args: {
    transactionFee: '0.1 FLOW (~$0.075)',
    title: 'Priority Fee',
    description: 'Higher fee for faster transaction processing',
  },
};

export const MultipleFees: Story = {
  args: {
    transactionFee: '0.001 FLOW + 0.0001 FLOW',
    title: 'Total Network Fees',
    description: 'Transaction fee + storage fee',
  },
};

export const CustomStyling: Story = {
  args: {
    transactionFee: '0.001 FLOW',
    backgroundColor: '$blue2',
    borderRadius: '$6',
    contentPadding: 20,
    titleColor: '$blue11',
    feeColor: '$blue12',
  },
};

export const CompactPadding: Story = {
  args: {
    transactionFee: '0.001 FLOW',
    contentPadding: 8,
  },
};

export const LargePadding: Story = {
  args: {
    transactionFee: '0.001 FLOW',
    contentPadding: 24,
  },
};

export const DifferentTokens: Story = {
  render: () => (
    <YStack gap="$4" width={300}>
      <TransactionFeeSection transactionFee="0.001 FLOW" title="Flow Fee" />
      <TransactionFeeSection transactionFee="0.21 USDC" title="USDC Fee" />
      <TransactionFeeSection transactionFee="$0.50" title="USD Equivalent" />
      <TransactionFeeSection transactionFee="0.0000123 BTC" title="Bitcoin Fee" />
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

export const SendFlowExamples: Story = {
  render: () => (
    <YStack gap="$4" width={350}>
      <YStack fontSize="$5" fontWeight="600" color="$color" mb="$2">
        Send Flow Examples
      </YStack>

      <TransactionFeeSection
        transactionFee="0.001 FLOW"
        title="Token Transfer Fee"
        description="Standard fee for token transfers"
      />

      <TransactionFeeSection
        transactionFee="0.001 FLOW"
        title="NFT Transfer Fee"
        description="Fee for transferring NFTs"
      />

      <TransactionFeeSection
        transactionFee="0.005 FLOW"
        title="Multi-NFT Transfer Fee"
        description="Fee for transferring multiple NFTs"
      />

      <TransactionFeeSection
        transactionFee="0.001 FLOW"
        title="Account Setup Fee"
        description="One-time fee for account initialization"
        backgroundColor="$yellow2"
        titleColor="$yellow11"
        feeColor="$yellow12"
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

export const ErrorState: Story = {
  args: {
    transactionFee: 'Fee calculation failed',
    title: 'Network Fee',
    backgroundColor: '$red2',
    titleColor: '$red11',
    feeColor: '$red12',
    showEstimate: false,
  },
};

export const LoadingState: Story = {
  args: {
    transactionFee: 'Calculating...',
    title: 'Network Fee',
    backgroundColor: '$gray2',
    titleColor: '$gray11',
    feeColor: '$gray10',
    showEstimate: false,
  },
};

export const FreeTransaction: Story = {
  args: {
    transactionFee: 'FREE',
    title: 'Network Fee',
    description: 'No fees for this transaction type',
    backgroundColor: '$green2',
    titleColor: '$green11',
    feeColor: '$green12',
    showEstimate: false,
  },
};

export const ComplexFee: Story = {
  args: {
    transactionFee: '0.001 FLOW',
    title: 'Transaction Breakdown',
    description: 'Base: 0.0005 FLOW • Priority: 0.0003 FLOW • Storage: 0.0002 FLOW',
  },
};
