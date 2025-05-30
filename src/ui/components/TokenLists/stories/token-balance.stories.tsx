import { type Meta, type StoryObj } from '@storybook/react-webpack5';

import { TokenBalance } from '../TokenBalance';

const meta: Meta<typeof TokenBalance> = {
  title: 'Components/TokenBalance',
  tags: ['autodocs'],

  component: TokenBalance,
};

export default meta;

type Story = StoryObj<typeof TokenBalance>;

export const FlowBalance: Story = {
  args: {
    value: '550.6600501213041234567890',
    prefix: '$',
    postFix: 'USD',
    decimals: 8,
    showFull: true,
  },
};

export const FlowEvmBalance: Story = {
  args: {
    value: '550.6600501213041234567890',
    prefix: '£',
    postFix: 'GBP',
    decimals: 18,
    showFull: false,
  },
};

export const SmallNumber: Story = {
  args: {
    value: '0.6600501213041234567890',
    prefix: '$',
    postFix: 'USD',
    decimals: 8,
    showFull: false,
  },
};

export const SmallFlowEvmBalance: Story = {
  args: {
    value: '0.6600501213041234567890',
    prefix: '$',
    postFix: 'USD',
    decimals: 18,
    showFull: true,
  },
};

export const VerySmallNumber: Story = {
  args: {
    value: '0.000000000000000001',
    prefix: '$',
    postFix: 'USD',
    decimals: 8,
    showFull: true,
  },
};

export const VerySmallNumberEvm: Story = {
  args: {
    value: '0.000000000000000001',
    prefix: '$',
    postFix: 'USD',
    decimals: 18,
    showFull: false,
  },
};
