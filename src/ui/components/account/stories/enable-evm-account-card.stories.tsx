import { type Meta, type StoryObj } from '@storybook/react-webpack5';

import { EnableEvmAccountCard } from '../enable-evm-account-card';

const meta: Meta<typeof EnableEvmAccountCard> = {
  title: 'Components/account/EnableEvmAccountCard',
  tags: ['autodocs'],

  component: EnableEvmAccountCard,
};

export default meta;

type Story = StoryObj<typeof EnableEvmAccountCard>;

export const Default: Story = {
  args: {},
};
