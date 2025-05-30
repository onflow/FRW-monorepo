import { type Meta, type StoryObj } from '@storybook/react-webpack5';

import { CurrencyValue } from '../CurrencyValue';

const meta: Meta<typeof CurrencyValue> = {
  title: 'Components/CurrencyValue',
  tags: ['autodocs'],

  component: CurrencyValue,
};

export default meta;

type Story = StoryObj<typeof CurrencyValue>;

export const Default: Story = {
  args: {
    value: '3000.66005012',
    currencySymbol: '$',
    currencyCode: 'USD',
  },
};

export const SmallCanadianDollar: Story = {
  args: {
    value: '0.000000000000000001',
    currencySymbol: '$',
    currencyCode: 'CAD',
  },
};

export const VeryLargeNumber: Story = {
  args: {
    value: '1000000000000000000',
    currencySymbol: '$',
    currencyCode: 'CAD',
  },
};
