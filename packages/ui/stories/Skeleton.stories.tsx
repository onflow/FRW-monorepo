import type { Meta, StoryObj } from '@storybook/react-vite';
import React from 'react';

import { Text, XStack, YStack } from '../src';
import { Skeleton } from '../src/components/Skeleton';

const meta = {
  title: 'Foundation/Skeleton',
  component: Skeleton,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Skeleton component for loading states with customizable dimensions and animation.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    width: {
      control: 'text',
    },
    height: {
      control: {
        type: 'range',
        min: 10,
        max: 200,
        step: 5,
      },
    },
    borderRadius: {
      control: {
        type: 'range',
        min: 0,
        max: 20,
        step: 1,
      },
    },
    animated: {
      control: 'boolean',
    },
  },
} satisfies Meta<typeof Skeleton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    width: 200,
    height: 20,
    borderRadius: 4,
    animated: true,
  },
};

export const Circle: Story = {
  args: {
    width: 60,
    height: 60,
    borderRadius: 30,
    animated: true,
  },
};

export const Rectangle: Story = {
  args: {
    width: 300,
    height: 100,
    borderRadius: 8,
    animated: true,
  },
};

export const Static: Story = {
  args: {
    width: 200,
    height: 20,
    borderRadius: 4,
    animated: false,
  },
};

export const CardSkeleton: Story = {
  render: (): React.ReactElement => (
    <YStack width={280} p="$4" gap="$3" bg="$background" rounded="$4">
      <XStack gap="$3" items="center">
        <Skeleton width={50} height={50} borderRadius={25} animated={true} />
        <YStack flex={1} gap="$2">
          <Skeleton width="70%" height={16} animated={true} />
          <Skeleton width="50%" height={14} animated={true} />
        </YStack>
      </XStack>

      <Skeleton width="100%" height={120} borderRadius={8} animated={true} />

      <YStack gap="$2">
        <Skeleton width="100%" height={14} animated={true} />
        <Skeleton width="80%" height={14} animated={true} />
        <Skeleton width="60%" height={14} animated={true} />
      </YStack>
    </YStack>
  ),
};

export const ListSkeleton: Story = {
  render: (): React.ReactElement => (
    <YStack width={300} gap="$3">
      <Text variant="label" color="$gray11">
        LIST LOADING STATE
      </Text>

      {[1, 2, 3, 4].map((item) => (
        <XStack key={item} gap="$3" items="center" p="$3">
          <Skeleton width={40} height={40} borderRadius={20} animated={true} />
          <YStack flex={1} gap="$2">
            <Skeleton width="60%" height={16} animated={true} />
            <Skeleton width="40%" height={12} animated={true} />
          </YStack>
          <Skeleton width={60} height={24} borderRadius={4} animated={true} />
        </XStack>
      ))}
    </YStack>
  ),
};

export const Sizes: Story = {
  render: (): React.ReactElement => (
    <YStack gap="$4" width={250}>
      <YStack gap="$2">
        <Text variant="caption">Small (12px height)</Text>
        <Skeleton width="100%" height={12} animated={true} />
      </YStack>

      <YStack gap="$2">
        <Text variant="caption">Medium (20px height)</Text>
        <Skeleton width="100%" height={20} animated={true} />
      </YStack>

      <YStack gap="$2">
        <Text variant="caption">Large (32px height)</Text>
        <Skeleton width="100%" height={32} animated={true} />
      </YStack>

      <YStack gap="$2">
        <Text variant="caption">Extra Large (48px height)</Text>
        <Skeleton width="100%" height={48} borderRadius={8} animated={true} />
      </YStack>
    </YStack>
  ),
};
