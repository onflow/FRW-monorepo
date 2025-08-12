import type { Meta, StoryObj } from '@storybook/react-vite';
import { YStack, Text } from 'tamagui';

import { Divider } from '../src/foundation/Divider';

const meta = {
  title: 'Foundation/Divider',
  component: Divider,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: ['default', 'strong'],
    },
  },
} satisfies Meta<typeof Divider>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    variant: 'default',
  },
};

export const Strong: Story = {
  args: {
    variant: 'strong',
  },
};

export const InList: Story = {
  render: () => (
    <YStack w={300} gap="$0">
      <YStack p="$4">
        <Text fontWeight="600" fontSize="$4">
          First Item
        </Text>
        <Text color="$gray11" fontSize="$3">
          This is the first list item
        </Text>
      </YStack>
      <Divider />
      <YStack p="$4">
        <Text fontWeight="600" fontSize="$4">
          Second Item
        </Text>
        <Text color="$gray11" fontSize="$3">
          This is the second list item
        </Text>
      </YStack>
      <Divider />
      <YStack p="$4">
        <Text fontWeight="600" fontSize="$4">
          Third Item
        </Text>
        <Text color="$gray11" fontSize="$3">
          This is the third list item
        </Text>
      </YStack>
    </YStack>
  ),
};

export const WithStrongVariant: Story = {
  render: () => (
    <YStack w={300} gap="$0">
      <YStack p="$4">
        <Text fontWeight="600" fontSize="$4">
          Important Section
        </Text>
        <Text color="$gray11" fontSize="$3">
          This section uses strong dividers
        </Text>
      </YStack>
      <Divider variant="strong" />
      <YStack p="$4">
        <Text fontWeight="600" fontSize="$4">
          Another Important Section
        </Text>
        <Text color="$gray11" fontSize="$3">
          Strong dividers provide better separation
        </Text>
      </YStack>
    </YStack>
  ),
};

export const CustomStyling: Story = {
  render: () => (
    <YStack w={300} gap="$0">
      <YStack p="$4">
        <Text fontWeight="600" fontSize="$4">
          Custom Styled
        </Text>
        <Text color="$gray11" fontSize="$3">
          Divider with custom margin
        </Text>
      </YStack>
      <Divider mx="$4" />
      <YStack p="$4">
        <Text fontWeight="600" fontSize="$4">
          Another Item
        </Text>
        <Text color="$gray11" fontSize="$3">
          With horizontal margins on divider
        </Text>
      </YStack>
    </YStack>
  ),
};
