import type { Meta, StoryObj } from '@storybook/react-vite';
import React from 'react';

import { XStack, YStack } from '../src';
import { Text } from '../src/components/Text';

const meta = {
  title: 'Foundation/Text',
  component: Text,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Text component with different variants (heading, body, caption, label) and weights.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['heading', 'body', 'caption', 'label'],
    },
    weight: {
      control: 'select',
      options: ['light', 'normal', 'medium', 'semibold', 'bold'],
    },
    color: {
      control: 'text',
    },
  },
} satisfies Meta<typeof Text>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    variant: 'body',
    weight: 'normal',
    children: 'This is default body text',
  },
};

export const Heading: Story = {
  args: {
    variant: 'heading',
    weight: 'semibold',
    children: 'This is a heading',
  },
};

export const Caption: Story = {
  args: {
    variant: 'caption',
    weight: 'normal',
    color: '$gray10',
    children: 'This is caption text - smaller and subtle',
  },
};

export const Label: Story = {
  args: {
    variant: 'label',
    weight: 'medium',
    color: '$gray11',
    children: 'LABEL TEXT',
  },
};

export const AllVariants: Story = {
  render: (): React.ReactElement => (
    <YStack space="$4" width={400}>
      <Text variant="heading" weight="bold">
        Heading - Bold
      </Text>

      <Text variant="heading" weight="semibold">
        Heading - Semibold
      </Text>

      <Text variant="body" weight="normal">
        Body text with normal weight. This is the most commonly used text variant for paragraphs and
        general content.
      </Text>

      <Text variant="body" weight="medium">
        Body text with medium weight for emphasis.
      </Text>

      <Text variant="label" weight="medium" color="$gray11">
        LABEL TEXT - UPPERCASE
      </Text>

      <Text variant="caption" weight="normal" color="$gray10">
        Caption text is smaller and used for secondary information, timestamps, or helper text.
      </Text>
    </YStack>
  ),
};

export const AllWeights: Story = {
  render: (): React.ReactElement => (
    <YStack space="$3" width={300}>
      <Text variant="body" weight="light">
        Light weight text
      </Text>

      <Text variant="body" weight="normal">
        Normal weight text
      </Text>

      <Text variant="body" weight="medium">
        Medium weight text
      </Text>

      <Text variant="body" weight="semibold">
        Semibold weight text
      </Text>

      <Text variant="body" weight="bold">
        Bold weight text
      </Text>
    </YStack>
  ),
};

export const ColorVariations: Story = {
  render: (): React.ReactElement => (
    <YStack space="$3" width={300}>
      <Text variant="body" color="$gray12">
        Default text color ($gray12)
      </Text>

      <Text variant="body" color="$gray11">
        Secondary text color ($gray11)
      </Text>

      <Text variant="body" color="$gray10">
        Tertiary text color ($gray10)
      </Text>

      <Text variant="body" color="$blue10">
        Blue accent color ($blue10)
      </Text>

      <Text variant="body" color="$green10">
        Green success color ($green10)
      </Text>

      <Text variant="body" color="$red10">
        Red error color ($red10)
      </Text>
    </YStack>
  ),
};

export const Typography: Story = {
  render: (): React.ReactElement => (
    <YStack space="$4" width={400}>
      <YStack space="$2">
        <Text variant="label" color="$gray11">
          TYPOGRAPHY SCALE
        </Text>

        <XStack space="$4" items="baseline">
          <Text variant="caption" color="$gray10" width={80}>
            24px
          </Text>
          <Text variant="heading">Heading Text</Text>
        </XStack>

        <XStack space="$4" items="baseline">
          <Text variant="caption" color="$gray10" width={80}>
            16px
          </Text>
          <Text variant="body">Body Text</Text>
        </XStack>

        <XStack space="$4" items="baseline">
          <Text variant="caption" color="$gray10" width={80}>
            14px
          </Text>
          <Text variant="label">Label Text</Text>
        </XStack>

        <XStack space="$4" items="baseline">
          <Text variant="caption" color="$gray10" width={80}>
            12px
          </Text>
          <Text variant="caption">Caption Text</Text>
        </XStack>
      </YStack>
    </YStack>
  ),
};
