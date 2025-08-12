import type { Meta, StoryObj } from '@storybook/react-vite';
import React, { useState } from 'react';
import { YStack, XStack } from 'tamagui';

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

export const Gallery: Story = {
  render: function GalleryRender() {
    const [selectedIds, setSelectedIds] = useState<string[]>(['2']);

    const images = [
      { id: '1', src: 'https://via.placeholder.com/300x300/EF4444/FFFFFF?text=1' },
      { id: '2', src: 'https://via.placeholder.com/300x300/10B981/FFFFFF?text=2' },
      { id: '3', src: 'https://via.placeholder.com/300x300/F59E0B/FFFFFF?text=3' },
      { id: '4', src: 'https://via.placeholder.com/300x300/8B5CF6/FFFFFF?text=4' },
    ];

    const handleToggle = (id: string) => {
      setSelectedIds((prev) =>
        prev.includes(id) ? prev.filter((selectedId) => selectedId !== id) : [...prev, id]
      );
    };

    return (
      <XStack flexWrap="wrap" gap="$3" maxWidth={400}>
        {images.map((image) => (
          <YStack key={image.id} width="45%">
            <SelectableNFTImage
              src={image.src}
              selected={selectedIds.includes(image.id)}
              selectable={true}
              onToggleSelection={() => handleToggle(image.id)}
            />
          </YStack>
        ))}
      </XStack>
    );
  },
  decorators: [
    (Story) => (
      <YStack p="$4" items="center" justify="center">
        <Story />
      </YStack>
    ),
  ],
};

export const AllSizes: Story = {
  render: () => (
    <XStack gap="$4" items="center">
      <YStack items="center" gap="$2">
        <SelectableNFTImage src={mockImage} size="small" selectable={true} />
        <YStack fontSize="$3" color="$textSecondary">
          Small
        </YStack>
      </YStack>

      <YStack items="center" gap="$2">
        <SelectableNFTImage src={mockImage} size="medium" selectable={true} selected={true} />
        <YStack fontSize="$3" color="$textSecondary">
          Medium
        </YStack>
      </YStack>

      <YStack items="center" gap="$2">
        <SelectableNFTImage src={mockImage} size="large" selectable={true} />
        <YStack fontSize="$3" color="$textSecondary">
          Large
        </YStack>
      </YStack>
    </XStack>
  ),
  decorators: [
    (Story) => (
      <YStack p="$4" items="center" justify="center">
        <Story />
      </YStack>
    ),
  ],
};
