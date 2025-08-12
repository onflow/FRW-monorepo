import type { Meta, StoryObj } from '@storybook/react-vite';
import React, { useState } from 'react';
import { YStack } from 'tamagui';

import { SendSectionHeader } from '../src/components/SendSectionHeader';

const meta: Meta<typeof SendSectionHeader> = {
  title: 'Components/SendSectionHeader',
  component: SendSectionHeader,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'SendSectionHeader displays a section title with an optional edit button for send flow screens.',
      },
    },
  },
  argTypes: {
    title: { control: 'text' },
    showEditButton: { control: 'boolean' },
    editButtonText: { control: 'text' },
    titleColor: { control: 'color' },
    editButtonVariant: { control: 'select', options: ['primary', 'secondary', 'ghost'] },
    editButtonSize: { control: 'select', options: ['small', 'medium', 'large'] },
    onEditPress: { action: 'edit-pressed' },
  },
  decorators: [
    (Story) => (
      <YStack width={300} p="$4">
        <Story />
      </YStack>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof SendSectionHeader>;

export const Default: Story = {
  args: {
    title: 'Send Tokens',
  },
};

export const WithoutEditButton: Story = {
  args: {
    title: 'Transaction Details',
    showEditButton: false,
  },
};

export const CustomEditText: Story = {
  args: {
    title: 'From Account',
    editButtonText: 'Change',
  },
};

export const PrimaryButton: Story = {
  args: {
    title: 'To Account',
    editButtonVariant: 'primary',
  },
};

export const SecondaryButton: Story = {
  args: {
    title: 'Selected NFT',
    editButtonVariant: 'secondary',
  },
};

export const LargeButton: Story = {
  args: {
    title: 'Payment Method',
    editButtonSize: 'large',
  },
};

export const MediumButton: Story = {
  args: {
    title: 'Recipient',
    editButtonSize: 'medium',
  },
};

export const CustomTitleColor: Story = {
  args: {
    title: 'Important Section',
    titleColor: '$red11',
  },
};

export const LongTitle: Story = {
  args: {
    title: 'This is a very long section title that should wrap properly',
  },
};

export const Interactive: Story = {
  render: function InteractiveRender() {
    const [editCount, setEditCount] = useState(0);

    return (
      <SendSectionHeader
        title={`Send NFT ${editCount > 0 ? `(${editCount} edits)` : ''}`}
        onEditPress={() => setEditCount((prev) => prev + 1)}
        editButtonText={editCount > 0 ? 'Edit Again' : 'Edit'}
        editButtonVariant={editCount > 2 ? 'primary' : 'ghost'}
      />
    );
  },
};

export const AllVariants: Story = {
  render: () => (
    <YStack gap="$4" width={350}>
      <SendSectionHeader title="Ghost Button (Default)" editButtonVariant="ghost" />
      <SendSectionHeader title="Primary Button" editButtonVariant="primary" />
      <SendSectionHeader title="Secondary Button" editButtonVariant="secondary" />
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

export const AllSizes: Story = {
  render: () => (
    <YStack gap="$4" width={350}>
      <SendSectionHeader title="Small Edit Button" editButtonSize="small" />
      <SendSectionHeader title="Medium Edit Button" editButtonSize="medium" />
      <SendSectionHeader title="Large Edit Button" editButtonSize="large" />
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

export const SendFlowExamples: Story = {
  render: () => (
    <YStack gap="$4" width={350} bg="$gray1" rounded="$4" p="$4">
      <SendSectionHeader title="From Account" />
      <SendSectionHeader title="Send Tokens" />
      <SendSectionHeader title="To Account" />
      <SendSectionHeader title="Network Fee" showEditButton={false} />
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

export const NFTSendExample: Story = {
  render: () => (
    <YStack gap="$4" width={350} bg="$gray1" rounded="$4" p="$4">
      <SendSectionHeader title="Send NFT" editButtonText="Change" />
      <SendSectionHeader title="To Account" />
      <SendSectionHeader title="Transaction Fee" showEditButton={false} titleColor="$gray10" />
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
