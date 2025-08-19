import type { Meta, StoryObj } from '@storybook/react-vite';
import React from 'react';
import { YStack } from 'tamagui';

import { CollectionHeader } from '../src/components/CollectionHeader';

const meta: Meta<typeof CollectionHeader> = {
  title: 'Components/CollectionHeader',
  component: CollectionHeader,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'CollectionHeader displays collection information including name, image, description, and item count.',
      },
    },
  },
  argTypes: {
    name: { control: 'text' },
    image: { control: 'text' },
    description: { control: 'text' },
    itemCount: { control: 'number', min: 0 },
    isLoading: { control: 'boolean' },
    size: { control: 'select', options: ['small', 'medium', 'large'] },
  },
  decorators: [
    (Story): React.JSX.Element => (
      <YStack p="$4" width={400}>
        <Story />
      </YStack>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof CollectionHeader>;

export const Default: Story = {
  args: {
    name: 'NBA Top Shot',
    itemCount: 42,
  },
};

export const WithImage: Story = {
  args: {
    name: 'CryptoPunks',
    image: 'https://via.placeholder.com/64x64/6366F1/FFFFFF?text=CP',
    itemCount: 156,
  },
};

export const WithDescription: Story = {
  args: {
    name: 'Bored Ape Yacht Club',
    image: 'https://via.placeholder.com/64x64/F59E0B/FFFFFF?text=BAYC',
    description:
      'A collection of 10,000 unique Bored Ape NFTs— unique digital collectibles living on the Ethereum blockchain.',
    itemCount: 23,
  },
};

export const Loading: Story = {
  args: {
    name: 'Loading Collection',
    image: 'https://via.placeholder.com/64x64/9CA3AF/FFFFFF?text=LC',
    isLoading: true,
  },
};

export const NoItems: Story = {
  args: {
    name: 'Empty Collection',
    image: 'https://via.placeholder.com/64x64/EF4444/FFFFFF?text=EC',
    itemCount: 0,
  },
};

export const LongName: Story = {
  args: {
    name: 'This is a Very Long Collection Name That Should Wrap to Multiple Lines',
    image: 'https://via.placeholder.com/64x64/8B5CF6/FFFFFF?text=LC',
    description: 'This collection has a very long name to test how it handles text wrapping.',
    itemCount: 7,
  },
};

export const SmallSize: Story = {
  args: {
    name: 'Small Collection',
    image: 'https://via.placeholder.com/48x48/10B981/FFFFFF?text=S',
    itemCount: 12,
    size: 'small',
  },
};

export const LargeSize: Story = {
  args: {
    name: 'Large Collection',
    image: 'https://via.placeholder.com/80x80/F59E0B/FFFFFF?text=L',
    description: 'A collection displayed with large size.',
    itemCount: 89,
    size: 'large',
  },
};

export const NoImage: Story = {
  args: {
    name: 'Collection Without Image',
    description: 'This collection uses a fallback letter avatar since no image is provided.',
    itemCount: 5,
  },
};

export const SingleItem: Story = {
  args: {
    name: 'Single Item Collection',
    image: 'https://via.placeholder.com/64x64/EF4444/FFFFFF?text=1',
    itemCount: 1,
  },
};

export const AllSizes: Story = {
  render: () => (
    <YStack gap="$4">
      <CollectionHeader
        name="Small Size"
        image="https://via.placeholder.com/48x48/10B981/FFFFFF?text=S"
        itemCount={12}
        size="small"
      />
      <CollectionHeader
        name="Medium Size (Default)"
        image="https://via.placeholder.com/64x64/6366F1/FFFFFF?text=M"
        description="Default medium size"
        itemCount={45}
        size="medium"
      />
      <CollectionHeader
        name="Large Size"
        image="https://via.placeholder.com/80x80/F59E0B/FFFFFF?text=L"
        description="Large size with more prominent display"
        itemCount={89}
        size="large"
      />
    </YStack>
  ),
  decorators: [
    (Story): React.JSX.Element => (
      <YStack p="$4" width={500}>
        <Story />
      </YStack>
    ),
  ],
};
