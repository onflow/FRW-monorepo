import type { Meta, StoryObj } from '@storybook/react-vite';
import React from 'react';
import { YStack } from 'tamagui';

import { NFTPropertiesGrid } from '../src/components/NFTPropertiesGrid';

const sampleProperties = [
  { label: 'ID', value: '1234' },
  { label: 'Contract', value: 'TopShot' },
  { label: 'Rarity', value: 'Legendary' },
  { label: 'Edition', value: '1 of 100' },
  { label: 'Season', value: '2023-24' },
  { label: 'Team', value: 'Lakers' },
  { label: 'Player', value: 'LeBron James' },
  { label: 'Position', value: 'Forward' },
];

const rarityProperties = [
  { label: 'Tier', value: 'Legendary' },
  { label: 'Rarity Score', value: '95.2' },
  { label: 'Rank', value: '#47 of 10,000' },
  { label: 'Generation', value: 'Gen 1' },
];

const gameProperties = [
  { label: 'Level', value: '42' },
  { label: 'XP', value: '12,450' },
  { label: 'Class', value: 'Warrior' },
  { label: 'Guild', value: 'Dragon Slayers' },
  { label: 'Power', value: '8,750' },
  { label: 'Defense', value: '6,320' },
  { label: 'Speed', value: '7,890' },
  { label: 'Magic', value: '4,560' },
  { label: 'Health', value: '9,100' },
];

const meta: Meta<typeof NFTPropertiesGrid> = {
  title: 'Components/NFTPropertiesGrid',
  component: NFTPropertiesGrid,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'NFTPropertiesGrid displays a grid of NFT properties using NFTPropertyTag components. It supports customizable columns, spacing, and variants.',
      },
    },
  },
  argTypes: {
    properties: { control: 'object' },
    title: { control: 'text' },
    columns: { control: 'number', min: 1, max: 4 },
    gap: { control: 'number', min: 0, max: 32 },
    variant: { control: 'select', options: ['default', 'compact'] },
    showTitle: { control: 'boolean' },
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
type Story = StoryObj<typeof NFTPropertiesGrid>;

export const Default: Story = {
  args: {
    properties: sampleProperties.slice(0, 6),
  },
};

export const WithoutTitle: Story = {
  args: {
    properties: sampleProperties.slice(0, 4),
    showTitle: false,
  },
};

export const CustomTitle: Story = {
  args: {
    properties: rarityProperties,
    title: 'Rarity & Stats',
  },
};

export const SingleColumn: Story = {
  args: {
    properties: sampleProperties.slice(0, 4),
    columns: 1,
    title: 'Single Column Layout',
  },
};

export const ThreeColumns: Story = {
  args: {
    properties: gameProperties.slice(0, 9),
    columns: 3,
    title: 'Game Statistics',
  },
  decorators: [
    (Story): React.JSX.Element => (
      <YStack p="$4" width={600}>
        <Story />
      </YStack>
    ),
  ],
};

export const CompactVariant: Story = {
  args: {
    properties: sampleProperties.slice(0, 8),
    variant: 'compact',
    title: 'Compact Properties',
  },
};

export const CustomGap: Story = {
  args: {
    properties: sampleProperties.slice(0, 6),
    gap: 16,
    title: 'Large Gap (16px)',
  },
};

export const SmallGap: Story = {
  args: {
    properties: sampleProperties.slice(0, 6),
    gap: 4,
    title: 'Small Gap (4px)',
  },
};

export const ManyProperties: Story = {
  args: {
    properties: gameProperties,
    columns: 3,
    title: 'Game Character Stats',
  },
  decorators: [
    (Story): React.JSX.Element => (
      <YStack p="$4" width={700}>
        <Story />
      </YStack>
    ),
  ],
};

export const EmptyProperties: Story = {
  args: {
    properties: [],
    title: 'No Properties',
  },
};

export const NFTShowcase: Story = {
  render: () => (
    <YStack gap="$6" width={500}>
      <NFTPropertiesGrid
        properties={[
          { label: 'Collection', value: 'Bored Ape Yacht Club' },
          { label: 'Token ID', value: '#3749' },
          { label: 'Blockchain', value: 'Ethereum' },
          { label: 'Standard', value: 'ERC-721' },
        ]}
        title="Basic Info"
        columns={2}
      />

      <NFTPropertiesGrid
        properties={[
          { label: 'Background', value: 'Blue' },
          { label: 'Fur', value: 'Golden Brown' },
          { label: 'Eyes', value: 'Sleepy' },
          { label: 'Mouth', value: 'Bored' },
          { label: 'Clothes', value: 'Striped Tee' },
          { label: 'Hat', value: 'Beanie' },
        ]}
        title="Traits"
        columns={2}
        variant="compact"
      />

      <NFTPropertiesGrid
        properties={[
          { label: 'Rarity Rank', value: '#847 / 10,000' },
          { label: 'Rarity Score', value: '42.73' },
          { label: 'Trait Count', value: '6' },
        ]}
        title="Rarity"
        columns={1}
      />
    </YStack>
  ),
  decorators: [
    (Story): React.JSX.Element => (
      <YStack p="$4">
        <Story />
      </YStack>
    ),
  ],
};

export const ResponsiveExample: Story = {
  render: () => (
    <YStack gap="$4">
      <YStack width={300}>
        <NFTPropertiesGrid
          properties={sampleProperties.slice(0, 4)}
          title="Mobile (2 columns)"
          columns={2}
        />
      </YStack>

      <YStack width={500}>
        <NFTPropertiesGrid
          properties={sampleProperties.slice(0, 6)}
          title="Tablet (3 columns)"
          columns={3}
        />
      </YStack>

      <YStack width={700}>
        <NFTPropertiesGrid properties={sampleProperties} title="Desktop (4 columns)" columns={4} />
      </YStack>
    </YStack>
  ),
  decorators: [
    (Story): React.JSX.Element => (
      <YStack p="$4">
        <Story />
      </YStack>
    ),
  ],
};
