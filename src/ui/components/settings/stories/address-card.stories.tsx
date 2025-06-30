import { Box } from '@mui/material';
import type { Meta, StoryObj } from '@storybook/react-webpack5';
import React from 'react';

import AddressCard from '@/ui/components/settings/address-card';

const meta: Meta<typeof AddressCard> = {
  title: 'Components/Settings/AddressCard',
  component: AddressCard,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    backgrounds: {
      default: 'dark',
    },
    docs: {
      description: {
        component: 'A card component for displaying addresses in settings.',
      },
    },
  },
  decorators: [
    (Story) => (
      <div
        style={{
          width: '400px',
          backgroundColor: '#181818',
          borderRadius: '16px',
          padding: '16px',
          color: 'white',
        }}
      >
        <Story />
      </div>
    ),
  ],
  argTypes: {
    address: {
      control: 'text',
      description: 'Address to display',
    },
    label: {
      control: 'text',
      description: 'Label for the address',
    },
  },
};

export default meta;
type Story = StoryObj<typeof AddressCard>;

export const Default: Story = {
  args: {
    address: '0x0c666c888d8fb259',
    label: 'Address',
  },
  parameters: {
    docs: {
      description: {
        story: 'Default address card with standard address format.',
      },
    },
  },
};

export const LongAddress: Story = {
  args: {
    address: '0x1234567890abcdef1234567890abcdef12345678',
    label: 'Long Address',
  },
  parameters: {
    docs: {
      description: {
        story: 'Address card with a longer address to test text wrapping.',
      },
    },
  },
};

export const ShortAddress: Story = {
  args: {
    address: '0x1234',
    label: 'Short Address',
  },
  parameters: {
    docs: {
      description: {
        story: 'Address card with a shorter address.',
      },
    },
  },
};

export const FlowAddress: Story = {
  args: {
    address: '0x1d777c999e9fc370',
    label: 'Flow Address',
  },
  parameters: {
    docs: {
      description: {
        story: 'Address card with Flow blockchain address format.',
      },
    },
  },
};

export const EthereumAddress: Story = {
  args: {
    address: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
    label: 'Ethereum Address',
  },
  parameters: {
    docs: {
      description: {
        story: 'Address card with Ethereum address format.',
      },
    },
  },
};

export const LongLabel: Story = {
  args: {
    address: '0x0c666c888d8fb259',
    label: 'This is a very long label that should wrap properly',
  },
  parameters: {
    docs: {
      description: {
        story: 'Address card with long label to test text wrapping.',
      },
    },
  },
};

export const MultipleCards: Story = {
  args: {
    address: '0x0c666c888d8fb259',
    label: 'Main Address',
  },
  parameters: {
    docs: {
      description: {
        story: 'Address card with main address.',
      },
    },
  },
};
