import type { Meta, StoryObj } from '@storybook/react-vite';
import React from 'react';
import { YStack } from 'tamagui';

import { SendArrowDivider } from '../src/components/SendArrowDivider';

const meta: Meta<typeof SendArrowDivider> = {
  title: 'Components/SendArrowDivider',
  component: SendArrowDivider,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'SendArrowDivider displays a divider with an arrow icon to separate sections in send flows.',
      },
    },
  },
  argTypes: {
    size: { control: 'number', min: 20, max: 80 },
    backgroundColor: { control: 'color' },
    iconColor: { control: 'color' },
    variant: { control: 'select', options: ['arrow', 'text'] },
    text: { control: 'text' },
    padding: { control: 'number', min: 0, max: 32 },
  },
  decorators: [
    (Story) => (
      <YStack width={200} items="center" p="$4">
        <Story />
      </YStack>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof SendArrowDivider>;

export const Default: Story = {
  args: {},
};

export const TextVariant: Story = {
  args: {
    variant: 'text',
  },
};

export const CustomText: Story = {
  args: {
    variant: 'text',
    text: '→',
  },
};

export const SmallSize: Story = {
  args: {
    size: 30,
  },
};

export const LargeSize: Story = {
  args: {
    size: 60,
  },
};

export const CustomColors: Story = {
  args: {
    backgroundColor: '$blue3',
    iconColor: '$blue11',
  },
};

export const NoPadding: Story = {
  args: {
    padding: 0,
  },
};

export const LargePadding: Story = {
  args: {
    padding: 24,
  },
};

export const SendFlowExample: Story = {
  render: () => (
    <YStack gap="$4" width={300} items="center">
      {/* From Account Section */}
      <YStack bg="$gray2" rounded="$4" p="$4" width="100%" items="center">
        <YStack fontSize="$4" fontWeight="600" color="$color">
          From Account
        </YStack>
        <YStack fontSize="$3" color="$gray11">
          0x1234...5678
        </YStack>
      </YStack>

      {/* Arrow Divider */}
      <SendArrowDivider />

      {/* To Account Section */}
      <YStack bg="$gray2" rounded="$4" p="$4" width="100%" items="center">
        <YStack fontSize="$4" fontWeight="600" color="$color">
          To Account
        </YStack>
        <YStack fontSize="$3" color="$gray11">
          0xabcd...efgh
        </YStack>
      </YStack>
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

export const DifferentVariants: Story = {
  render: () => (
    <YStack gap="$6" items="center">
      <YStack items="center" gap="$2">
        <SendArrowDivider variant="arrow" />
        <YStack fontSize="$3" color="$gray11">
          Arrow Icon
        </YStack>
      </YStack>

      <YStack items="center" gap="$2">
        <SendArrowDivider variant="text" text="↓" />
        <YStack fontSize="$3" color="$gray11">
          Down Arrow
        </YStack>
      </YStack>

      <YStack items="center" gap="$2">
        <SendArrowDivider variant="text" text="→" />
        <YStack fontSize="$3" color="$gray11">
          Right Arrow
        </YStack>
      </YStack>

      <YStack items="center" gap="$2">
        <SendArrowDivider variant="text" text="•" />
        <YStack fontSize="$3" color="$gray11">
          Bullet Point
        </YStack>
      </YStack>
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

export const DifferentSizes: Story = {
  render: () => (
    <YStack gap="$4" items="center">
      <YStack items="center" gap="$2">
        <SendArrowDivider size={24} />
        <YStack fontSize="$2" color="$gray11">
          Small (24px)
        </YStack>
      </YStack>

      <YStack items="center" gap="$2">
        <SendArrowDivider size={40} />
        <YStack fontSize="$3" color="$gray11">
          Default (40px)
        </YStack>
      </YStack>

      <YStack items="center" gap="$2">
        <SendArrowDivider size={56} />
        <YStack fontSize="$3" color="$gray11">
          Large (56px)
        </YStack>
      </YStack>
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

export const ColorVariations: Story = {
  render: () => (
    <YStack gap="$4" items="center">
      <SendArrowDivider backgroundColor="$blue3" iconColor="$blue11" />
      <SendArrowDivider backgroundColor="$green3" iconColor="$green11" />
      <SendArrowDivider backgroundColor="$red3" iconColor="$red11" />
      <SendArrowDivider backgroundColor="$purple3" iconColor="$purple11" />
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
