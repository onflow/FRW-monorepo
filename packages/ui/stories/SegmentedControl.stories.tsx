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
const InteractiveTemplate = (args: any): React.ReactElement => {
  const [value, setValue] = useState(args.segments[0]);
  return <SegmentedControl {...args} value={value} onChange={setValue} />;
};

export const Default: Story = {
  render: InteractiveTemplate,
  args: {
    segments: ['Tokens', 'NFTs'],
    size: 'medium',
  },
};

export const Small: Story = {
  render: InteractiveTemplate,
  args: {
    segments: ['One', 'Two', 'Three'],
    size: 'small',
  },
};

export const Large: Story = {
  render: InteractiveTemplate,
  args: {
    segments: ['Option A', 'Option B'],
    size: 'large',
  },
};

export const FourOptions: Story = {
  render: InteractiveTemplate,
  args: {
    segments: ['Home', 'Browse', 'Search', 'Profile'],
    size: 'medium',
  },
};

export const FullWidth: Story = {
  render: InteractiveTemplate,
  args: {
    segments: ['Tokens', 'NFTs'],
    size: 'medium',
    fullWidth: true,
  },
};
