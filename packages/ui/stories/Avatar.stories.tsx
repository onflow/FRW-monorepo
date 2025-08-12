import type { Meta, StoryObj } from '@storybook/react-vite';

import { Avatar } from '../src/foundation/Avatar';

const meta = {
  title: 'Foundation/Avatar',
  component: Avatar,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Avatar component with optional online indicator and fallback support.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: {
        type: 'range',
        min: 20,
        max: 100,
        step: 5,
      },
    },
  },
} satisfies Meta<typeof Avatar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    src: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
    alt: 'John Doe',
    size: 40,
  },
};

export const WithFallback: Story = {
  args: {
    src: '',
    alt: 'John Doe',
    fallback: 'JD',
    size: 40,
  },
};

export const Large: Story = {
  args: {
    src: 'https://images.unsplash.com/photo-1494790108755-2616b612d5eb?w=100&h=100&fit=crop&crop=face',
    alt: 'Sarah Wilson',
    size: 80,
  },
};

export const Small: Story = {
  args: {
    src: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face',
    alt: 'Emma Davis',
    size: 24,
  },
};
