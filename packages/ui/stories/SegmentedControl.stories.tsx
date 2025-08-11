import type { Meta, StoryObj } from '@storybook/react-vite';
import React, { useState } from 'react';

import { SegmentedControl } from '../src/foundation/SegmentedControl';

const meta = {
  title: 'Components/SegmentedControl',
  component: SegmentedControl,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: { type: 'select' },
      options: ['small', 'medium', 'large'],
    },
  },
} satisfies Meta<typeof SegmentedControl>;

export default meta;
type Story = StoryObj<typeof meta>;

// Interactive story
const InteractiveTemplate = (args: unknown): React.ReactElement => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  return <SegmentedControl {...args} selectedIndex={selectedIndex} onChange={setSelectedIndex} />;
};

export const Default: Story = {
  render: InteractiveTemplate,
  args: {
    options: ['Tokens', 'NFTs'],
    size: 'medium',
  },
};

export const Small: Story = {
  render: InteractiveTemplate,
  args: {
    options: ['One', 'Two', 'Three'],
    size: 'small',
  },
};

export const Large: Story = {
  render: InteractiveTemplate,
  args: {
    options: ['Option A', 'Option B'],
    size: 'large',
  },
};

export const FourOptions: Story = {
  render: InteractiveTemplate,
  args: {
    options: ['Home', 'Browse', 'Search', 'Profile'],
    size: 'medium',
  },
};
