import type { Meta, StoryObj } from '@storybook/react-vite';

import { RefreshView } from '../src/components/RefreshView';

const meta: Meta<typeof RefreshView> = {
  title: 'Components/RefreshView',
  component: RefreshView,
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    type: {
      control: 'select',
      options: ['empty', 'error'],
      description: 'The type of state to display',
    },
    message: {
      control: 'text',
      description: 'The message to display',
    },
    refreshText: {
      control: 'text',
      description: 'Text for the refresh button',
    },
    onRefresh: {
      action: 'refresh clicked',
      description: 'Callback when refresh button is pressed',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Empty: Story = {
  args: {
    type: 'empty',
    message: 'No tokens found with balance',
    refreshText: 'Refresh',
    onRefresh: () => console.log('Refresh clicked'),
  },
};

export const Error: Story = {
  args: {
    type: 'error',
    message: 'Failed to load tokens. Please try again.',
    refreshText: 'Retry',
    onRefresh: () => console.log('Retry clicked'),
  },
};

export const EmptyWithoutButton: Story = {
  args: {
    type: 'empty',
    message: 'No NFT collections found for this account',
    onRefresh: undefined,
  },
};
