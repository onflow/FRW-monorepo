import type { Meta, StoryObj } from '@storybook/react-vite';
import React from 'react';

import { Text, YStack } from '../src';
import { Card } from '../src/components/Card';

const meta = {
  title: 'UI/Card',
  component: Card,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Card component with different variants: default, elevated, and outlined.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'elevated', 'outlined'],
    },
  },
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;

const CardContent = (): React.ReactElement => (
  <YStack p="$4" space="$2">
    <Text variant="heading">Card Title</Text>
    <Text variant="body" color="$gray11">
      This is some example content inside the card component. Cards are useful for grouping related
      content together.
    </Text>
  </YStack>
);

export const Default: Story = {
  args: {
    variant: 'default',
  },
  render: (args): React.ReactElement => (
    <Card {...args}>
      <CardContent />
    </Card>
  ),
};

export const Elevated: Story = {
  args: {
    variant: 'elevated',
  },
  render: (args): React.ReactElement => (
    <Card {...args}>
      <CardContent />
    </Card>
  ),
};

export const Outlined: Story = {
  args: {
    variant: 'outlined',
  },
  render: (args): React.ReactElement => (
    <Card {...args}>
      <CardContent />
    </Card>
  ),
};

export const WithCustomPadding: Story = {
  args: {
    variant: 'elevated',
    padding: '$6',
  },
  render: (args): React.ReactElement => (
    <Card {...args}>
      <Text variant="heading">Custom Padding</Text>
      <Text variant="body" color="$gray11" mt="$2">
        This card has custom padding applied.
      </Text>
    </Card>
  ),
};

export const AllVariants: Story = {
  render: (): React.ReactElement => (
    <YStack space="$4" width={300}>
      <Card variant="default">
        <YStack p="$3">
          <Text variant="label" color="$gray11">
            DEFAULT
          </Text>
          <Text variant="body">Basic card style</Text>
        </YStack>
      </Card>

      <Card variant="elevated">
        <YStack p="$3">
          <Text variant="label" color="$gray11">
            ELEVATED
          </Text>
          <Text variant="body">Card with shadow</Text>
        </YStack>
      </Card>

      <Card variant="outlined">
        <YStack p="$3">
          <Text variant="label" color="$gray11">
            OUTLINED
          </Text>
          <Text variant="body">Card with border</Text>
        </YStack>
      </Card>
    </YStack>
  ),
};
