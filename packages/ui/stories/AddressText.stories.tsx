import type { Meta, StoryObj } from '@storybook/react-vite';

import { AddressText } from '../src/components/AddressText';

const meta = {
  title: 'Components/AddressText',
  component: AddressText,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'A text component for displaying blockchain addresses with optional truncation, copying, and interaction capabilities.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    address: {
      control: 'text',
      description: 'The blockchain address to display',
    },
    truncate: {
      control: 'boolean',
      description: 'Whether to truncate the address',
    },
    startLength: {
      control: 'number',
      description: 'Number of characters to show at the start when truncated',
    },
    endLength: {
      control: 'number',
      description: 'Number of characters to show at the end when truncated',
    },
    separator: {
      control: 'text',
      description: 'Separator string between start and end when truncated',
    },
    copyable: {
      control: 'boolean',
      description: 'Whether the address can be copied (affects cursor style)',
    },
    onPress: {
      action: 'pressed',
      description: 'Callback fired when the address is pressed',
    },
  },
} satisfies Meta<typeof AddressText>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    address: '0x1234567890abcdef1234567890abcdef12345678',
    truncate: true,
  },
};

export const FullAddress: Story = {
  args: {
    address: '0x1234567890abcdef1234567890abcdef12345678',
    truncate: false,
  },
};

export const CustomTruncation: Story = {
  args: {
    address: '0x1234567890abcdef1234567890abcdef12345678',
    truncate: true,
    startLength: 8,
    endLength: 6,
    separator: '...',
  },
};

export const FlowAddress: Story = {
  args: {
    address: '0xa0b86991c431e60e',
    truncate: true,
    startLength: 4,
    endLength: 4,
  },
};

export const LongAddress: Story = {
  args: {
    address: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234',
    truncate: true,
    startLength: 6,
    endLength: 6,
  },
};

export const ShortAddress: Story = {
  args: {
    address: '0x12345',
    truncate: true,
    startLength: 6,
    endLength: 4,
  },
};

export const Copyable: Story = {
  args: {
    address: '0x1234567890abcdef1234567890abcdef12345678',
    truncate: true,
    copyable: true,
  },
};

export const Clickable: Story = {
  args: {
    address: '0x1234567890abcdef1234567890abcdef12345678',
    truncate: true,
    copyable: false,
  },
};

export const CustomSeparator: Story = {
  args: {
    address: '0x1234567890abcdef1234567890abcdef12345678',
    truncate: true,
    separator: ' ... ',
    startLength: 6,
    endLength: 6,
  },
};

export const MinimalTruncation: Story = {
  args: {
    address: '0x1234567890abcdef1234567890abcdef12345678',
    truncate: true,
    startLength: 2,
    endLength: 2,
    separator: '..',
  },
};

export const ExtensiveTruncation: Story = {
  args: {
    address: '0x1234567890abcdef1234567890abcdef12345678',
    truncate: true,
    startLength: 10,
    endLength: 10,
    separator: '---',
  },
};
