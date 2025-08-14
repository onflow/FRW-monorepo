import type { Meta, StoryObj } from '@storybook/react-vite';
import React, { useState } from 'react';
import { YStack } from 'tamagui';

import { SelectableNFTImage } from '../src/components/SelectableNFTImage';

const meta: Meta<typeof SelectableNFTImage> = {
  title: 'Components/SelectableNFTImage',
  component: SelectableNFTImage,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'SelectableNFTImage displays an NFT image with optional selection functionality and various sizing options.',
      },
    },
  },
  argTypes: {
    src: { control: 'text' },
    selected: { control: 'boolean' },
    selectable: { control: 'boolean' },
    aspectRatio: { control: 'number', min: 0.5, max: 3, step: 0.1 },
    borderRadius: { control: 'text' },
    size: { control: 'select', options: ['small', 'medium', 'large', 'full'] },
    onToggleSelection: { action: 'selection-toggled' },
    onImagePress: { action: 'image-pressed' },
  },
  decorators: [
    (Story) => (
      <YStack p="$4" width={400} height={400} items="center" justify="center">
        <Story />
      </YStack>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof SelectableNFTImage>;

const mockImage = 'https://via.placeholder.com/400x400/6366F1/FFFFFF?text=NFT';

export const Default: Story = {
  args: {
    src: mockImage,
  },
};

export const Selectable: Story = {
  args: {
    src: mockImage,
    selectable: true,
  },
};

export const Selected: Story = {
  args: {
    src: mockImage,
    selectable: true,
    selected: true,
  },
};

export const SmallSize: Story = {
  args: {
    src: mockImage,
    size: 'small',
    selectable: true,
  },
};

export const MediumSize: Story = {
  args: {
    src: mockImage,
    size: 'medium',
    selectable: true,
  },
};

export const LargeSize: Story = {
  args: {
    src: mockImage,
    size: 'large',
    selectable: true,
  },
};

export const WideAspectRatio: Story = {
  args: {
    src: 'https://via.placeholder.com/600x300/F59E0B/FFFFFF?text=Wide+NFT',
    aspectRatio: 2,
    selectable: true,
  },
  decorators: [
    (Story) => (
      <YStack p="$4" width={500} height={300} items="center" justify="center">
        <Story />
      </YStack>
    ),
  ],
};

export const TallAspectRatio: Story = {
  args: {
    src: 'https://via.placeholder.com/300x600/10B981/FFFFFF?text=Tall+NFT',
    aspectRatio: 0.5,
    selectable: true,
  },
  decorators: [
    (Story) => (
      <YStack p="$4" width={300} height={600} items="center" justify="center">
        <Story />
      </YStack>
    ),
  ],
};

export const CustomBorderRadius: Story = {
  args: {
    src: mockImage,
    borderRadius: '$6',
    selectable: true,
    selected: true,
    size: 'medium',
  },
};

export const Interactive: Story = {
  render: function InteractiveRender() {
    const [selected, setSelected] = useState(false);

    return (
      <SelectableNFTImage
        src={mockImage}
        selected={selected}
        selectable={true}
        size="medium"
        onToggleSelection={() => setSelected(!selected)}
        onImagePress={() => alert('Image pressed!')}
      />
    );
  },
};

export const FallbackImage: Story = {
  args: {
    src: 'invalid-url',
    selectable: true,
    size: 'medium',
  },
};
