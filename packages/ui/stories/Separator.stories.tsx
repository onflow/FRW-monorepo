import type { Meta, StoryObj } from '@storybook/react-vite';

import { YStack, Text, XStack } from '../src';
import { Separator } from '../src/components/Separator';

const meta = {
  title: 'UI/Separator',
  component: Separator,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Separator component for dividing content with default and strong variants.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'strong'],
    },
  },
} satisfies Meta<typeof Separator>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    variant: 'default',
  },
  render: (args): React.ReactElement => (
    <YStack width={200} space="$3">
      <Text>Content above</Text>
      <Separator {...args} />
      <Text>Content below</Text>
    </YStack>
  ),
};

export const Strong: Story = {
  args: {
    variant: 'strong',
  },
  render: (args): React.ReactElement => (
    <YStack width={200} space="$3">
      <Text>Content above</Text>
      <Separator {...args} />
      <Text>Content below</Text>
    </YStack>
  ),
};

export const Vertical: Story = {
  args: {
    variant: 'default',
    vertical: true,
  },
  render: (args): React.ReactElement => (
    <XStack height={100} alignItems="center" space="$3">
      <Text>Left</Text>
      <Separator {...args} />
      <Text>Right</Text>
    </XStack>
  ),
};

export const AllVariants: Story = {
  render: (): React.ReactElement => (
    <YStack width={300} space="$6">
      {/* Horizontal Separators */}
      <YStack space="$3">
        <Text variant="label">HORIZONTAL SEPARATORS</Text>

        <YStack space="$2">
          <Text variant="caption">Default variant</Text>
          <Separator variant="default" />
        </YStack>

        <YStack space="$2">
          <Text variant="caption">Strong variant</Text>
          <Separator variant="strong" />
        </YStack>
      </YStack>

      {/* Vertical Separators */}
      <YStack space="$3">
        <Text variant="label">VERTICAL SEPARATORS</Text>
        <XStack height={60} alignItems="center" space="$4">
          <Text>Item 1</Text>
          <Separator vertical variant="default" />
          <Text>Item 2</Text>
          <Separator vertical variant="strong" />
          <Text>Item 3</Text>
        </XStack>
      </YStack>
    </YStack>
  ),
};
