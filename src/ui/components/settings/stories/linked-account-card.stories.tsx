import { Box } from '@mui/material';
import type { Meta, StoryObj } from '@storybook/react-webpack5';
import React from 'react';

import { LinkedAccountCard } from '@/ui/components/settings/linked-account-card';

const meta: Meta<typeof LinkedAccountCard> = {
  title: 'Components/Settings/LinkedAccountCard',
  component: LinkedAccountCard,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    backgrounds: {
      default: 'dark',
    },
    docs: {
      description: {
        component: 'A card component for displaying linked accounts in settings.',
      },
    },
  },
  decorators: [
    (Story) => (
      <div
        style={{
          width: '500px',
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
    network: {
      control: 'text',
      description: 'Network identifier',
    },
    account: {
      control: 'object',
      description: 'Account data object',
    },
    parentName: {
      control: 'text',
      description: 'Parent account name',
    },
    active: {
      control: 'boolean',
      description: 'Whether the account is active',
    },
    spinning: {
      control: 'boolean',
      description: 'Whether the avatar is spinning',
    },
    onClick: {
      action: 'clicked',
      description: 'Click handler for the card',
    },
    onEditClick: {
      action: 'edit clicked',
      description: 'Edit button click handler',
    },
    showCard: {
      control: 'boolean',
      description: 'Whether to show card styling',
    },
    isPending: {
      control: 'boolean',
      description: 'Whether the account is in pending state',
    },
  },
};

export default meta;
type Story = StoryObj<typeof LinkedAccountCard>;

export const Default: Story = {
  args: {
    account: {
      name: 'Panda',
      icon: '🐼',
      color: '#fff',
      address: '0x0c666c888d8fb259',
      chain: 1,
      id: 1,
    },
    parentName: 'Main Account',
    onEditClick: () => alert('Edit clicked'),
    showCard: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'Default linked account card with all props.',
      },
    },
  },
};

export const WithoutCard: Story = {
  args: {
    account: {
      name: 'Panda',
      icon: '🐼',
      color: '#fff',
      address: '0x0c666c888d8fb259',
      chain: 1,
      id: 1,
    },
    parentName: 'Main Account',
    onEditClick: () => alert('Edit clicked'),
    showCard: false,
  },
  parameters: {
    docs: {
      description: {
        story: 'Linked account card without card styling.',
      },
    },
  },
};

export const Active: Story = {
  args: {
    account: {
      name: 'Panda',
      icon: '🐼',
      color: '#fff',
      address: '0x0c666c888d8fb259',
      chain: 1,
      id: 1,
    },
    parentName: 'Main Account',
    active: true,
    onEditClick: () => alert('Edit clicked'),
    showCard: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'Linked account card in active state.',
      },
    },
  },
};

export const Spinning: Story = {
  args: {
    account: {
      name: 'Panda',
      icon: '🐼',
      color: '#fff',
      address: '0x0c666c888d8fb259',
      chain: 1,
      id: 1,
    },
    parentName: 'Main Account',
    spinning: true,
    onEditClick: () => alert('Edit clicked'),
    showCard: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'Linked account card with spinning avatar.',
      },
    },
  },
};

export const Pending: Story = {
  args: {
    account: {
      name: 'Panda',
      icon: '🐼',
      color: '#fff',
      address: '0x0c666c888d8fb259',
      chain: 1,
      id: 1,
    },
    parentName: 'Main Account',
    isPending: true,
    showCard: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'Linked account card in pending state (no edit button).',
      },
    },
  },
};

export const WithoutEditButton: Story = {
  args: {
    account: {
      name: 'Panda',
      icon: '🐼',
      color: '#fff',
      address: '0x0c666c888d8fb259',
      chain: 1,
      id: 1,
    },
    parentName: 'Main Account',
    showCard: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'Linked account card without edit button.',
      },
    },
  },
};

export const WithoutParentName: Story = {
  args: {
    account: {
      name: 'Panda',
      icon: '🐼',
      color: '#fff',
      address: '0x0c666c888d8fb259',
      chain: 1,
      id: 1,
    },
    onEditClick: () => alert('Edit clicked'),
    showCard: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'Linked account card without parent name (shows skeleton).',
      },
    },
  },
};

export const WithoutAccount: Story = {
  args: {
    parentName: 'Main Account',
    onEditClick: () => alert('Edit clicked'),
    showCard: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'Linked account card without account data (shows skeletons).',
      },
    },
  },
};

export const LongNames: Story = {
  args: {
    account: {
      name: 'This is a very long account name that should wrap properly',
      icon: '🐼',
      color: '#fff',
      address: '0x0c666c888d8fb259',
      chain: 1,
      id: 1,
    },
    parentName: 'This is a very long parent account name that should also wrap properly',
    onEditClick: () => alert('Edit clicked'),
    showCard: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'Linked account card with long names to test text wrapping.',
      },
    },
  },
};

export const MultipleCards: Story = {
  args: {
    account: {
      name: 'Panda',
      icon: '🐼',
      color: '#fff',
      address: '0x0c666c888d8fb259',
      chain: 1,
      id: 1,
    },
    parentName: 'Main Account',
    active: true,
    onEditClick: () => alert('Edit clicked'),
    showCard: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'Linked account card in active state.',
      },
    },
  },
};
