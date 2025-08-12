import type { Meta, StoryObj } from '@storybook/react-vite';
import { XStack, YStack } from 'tamagui';

import { Badge } from '../src/components/Badge';

const meta = {
  title: 'Components/Badge',
  component: Badge,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: ['default', 'primary', 'secondary', 'success', 'warning', 'error', 'outline'],
    },
    size: {
      control: { type: 'select' },
      options: ['small', 'medium', 'large'],
    },
    children: {
      control: { type: 'text' },
    },
  },
} satisfies Meta<typeof Badge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: 'Default',
    variant: 'default',
    size: 'medium',
  },
};

export const Primary: Story = {
  args: {
    children: 'Primary',
    variant: 'primary',
    size: 'medium',
  },
};

export const Secondary: Story = {
  args: {
    children: 'Secondary',
    variant: 'secondary',
    size: 'medium',
  },
};

export const Success: Story = {
  args: {
    children: 'Success',
    variant: 'success',
    size: 'medium',
  },
};

export const Warning: Story = {
  args: {
    children: 'Warning',
    variant: 'warning',
    size: 'medium',
  },
};

export const Error: Story = {
  args: {
    children: 'Error',
    variant: 'error',
    size: 'medium',
  },
};

export const Outline: Story = {
  args: {
    children: 'Outline',
    variant: 'outline',
    size: 'medium',
  },
};

export const AllVariants: Story = {
  render: () => (
    <YStack gap="$4">
      <XStack gap="$3" wrap="wrap">
        <Badge variant="default">Default</Badge>
        <Badge variant="primary">Primary</Badge>
        <Badge variant="secondary">Secondary</Badge>
        <Badge variant="success">Success</Badge>
        <Badge variant="warning">Warning</Badge>
        <Badge variant="error">Error</Badge>
        <Badge variant="outline">Outline</Badge>
      </XStack>
    </YStack>
  ),
};

export const AllSizes: Story = {
  render: () => (
    <YStack gap="$4">
      <XStack gap="$3" items="center">
        <Badge size="small" variant="primary">
          Small
        </Badge>
        <Badge size="medium" variant="primary">
          Medium
        </Badge>
        <Badge size="large" variant="primary">
          Large
        </Badge>
      </XStack>
    </YStack>
  ),
};

export const Numbers: Story = {
  render: () => (
    <XStack gap="$3" items="center">
      <Badge variant="error" size="small">
        99+
      </Badge>
      <Badge variant="primary" size="medium">
        12
      </Badge>
      <Badge variant="success" size="large">
        1
      </Badge>
    </XStack>
  ),
};

export const LongText: Story = {
  args: {
    children: 'This is a long badge text',
    variant: 'primary',
    size: 'medium',
  },
};
