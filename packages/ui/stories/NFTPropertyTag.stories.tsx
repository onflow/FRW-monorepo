import type { Meta, StoryObj } from '@storybook/react-vite';
import React from 'react';
import { YStack, XStack } from 'tamagui';

import { NFTPropertyTag } from '../src/components/NFTPropertyTag';

const meta: Meta<typeof NFTPropertyTag> = {
  title: 'Components/NFTPropertyTag',
  component: NFTPropertyTag,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'NFTPropertyTag displays key-value pairs for NFT properties in a styled tag format.',
      },
    },
  },
  argTypes: {
    label: { control: 'text' },
    value: { control: 'text' },
    variant: { control: 'select', options: ['default', 'compact'] },
    backgroundColor: { control: 'color' },
    textColor: { control: 'color' },
    labelColor: { control: 'color' },
  },
  decorators: [
    (Story) => (
      <YStack p="$4" width={300}>
        <Story />
      </YStack>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof NFTPropertyTag>;

export const Default: Story = {
  args: {
    label: 'ID',
    value: '1234',
  },
};

export const Contract: Story = {
  args: {
    label: 'Contract',
    value: 'TopShotContract',
  },
};

export const Address: Story = {
  args: {
    label: 'Address',
    value: '0x1234...5678',
  },
};

export const Compact: Story = {
  args: {
    label: 'Rarity',
    value: 'Legendary',
    variant: 'compact',
  },
};

export const CustomColors: Story = {
  args: {
    label: 'Status',
    value: 'Active',
    backgroundColor: '#10B981',
    textColor: '#FFFFFF',
    labelColor: '#D1FAE5',
  },
};

export const LongValues: Story = {
  args: {
    label: 'Description',
    value: 'This is a very long property value that should be handled properly',
  },
};

export const MultipleProperties: Story = {
  render: () => (
    <XStack flexWrap="wrap" gap="$2">
      <NFTPropertyTag label="ID" value="1234" />
      <NFTPropertyTag label="Contract" value="TopShot" />
      <NFTPropertyTag label="Rarity" value="Legendary" />
      <NFTPropertyTag label="Edition" value="1 of 100" />
      <NFTPropertyTag label="Season" value="2023-24" />
      <NFTPropertyTag label="Team" value="Lakers" />
    </XStack>
  ),
};

export const ColorVariations: Story = {
  render: () => (
    <YStack gap="$3">
      <NFTPropertyTag
        label="Legendary"
        value="Gold"
        backgroundColor="#F59E0B"
        textColor="#FFFFFF"
        labelColor="#FDE68A"
      />
      <NFTPropertyTag
        label="Epic"
        value="Purple"
        backgroundColor="#8B5CF6"
        textColor="#FFFFFF"
        labelColor="#DDD6FE"
      />
      <NFTPropertyTag
        label="Rare"
        value="Blue"
        backgroundColor="#3B82F6"
        textColor="#FFFFFF"
        labelColor="#DBEAFE"
      />
      <NFTPropertyTag
        label="Common"
        value="Gray"
        backgroundColor="#6B7280"
        textColor="#FFFFFF"
        labelColor="#E5E7EB"
      />
    </YStack>
  ),
};
