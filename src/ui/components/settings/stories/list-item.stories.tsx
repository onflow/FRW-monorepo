import type { Meta, StoryObj } from '@storybook/react-webpack5';
import React from 'react';

import { AboutIcon } from '@/ui/assets/icons/settings/About';
import { CurrencyIcon } from '@/ui/assets/icons/settings/Currency';
import { SecurityIcon } from '@/ui/assets/icons/settings/Security';
import IconEnd from '@/ui/components/iconfont/IconAVector11Stroke';

import { SettingsListItem } from '../list-item';

const meta: Meta<typeof SettingsListItem> = {
  title: 'Settings/ListItem',
  component: SettingsListItem,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    backgrounds: {
      default: 'dark',
    },
    docs: {
      description: {
        component:
          'A list item component used in the settings page with icon, text, and optional end icon.',
      },
    },
  },
  decorators: [
    (Story) => (
      <div
        style={{
          width: '400px',
          backgroundColor: '#282828',
          borderRadius: '16px',
          padding: '8px',
          color: 'white',
        }}
      >
        <Story />
      </div>
    ),
  ],
  argTypes: {
    to: {
      control: 'text',
      description: 'Navigation path (optional)',
    },
    icon: {
      control: false,
      description: 'Icon component to display',
    },
    text: {
      control: 'text',
      description: 'Text label for the list item',
    },
    endIcon: {
      control: false,
      description: 'Optional end icon component',
    },
    onClick: {
      action: 'clicked',
      description: 'Click handler function (optional)',
    },
  },
};

export default meta;
type Story = StoryObj<typeof SettingsListItem>;

export const Default: Story = {
  args: {
    icon: <CurrencyIcon width={24} height={24} />,
    text: 'Display Currency',
    endIcon: <IconEnd size={12} />,
  },
  parameters: {
    mockData: {
      icon: 'CurrencyIcon',
      text: 'Display Currency',
      endIcon: 'IconEnd',
    },
  },
};

export const WithoutEndIcon: Story = {
  args: {
    icon: <SecurityIcon width={24} height={24} />,
    text: 'Security',
    onClick: () => alert('Clicked!'),
  },
  parameters: {
    docs: {
      description: {
        story: 'List item without an end icon.',
      },
    },
  },
};

export const WithLongText: Story = {
  args: {
    icon: <AboutIcon width={24} height={24} />,
    text: 'This is a very long text that should wrap properly in the list item',
    endIcon: <IconEnd size={12} />,
    onClick: () => alert('Clicked!'),
  },
  parameters: {
    docs: {
      description: {
        story: 'List item with long text to test text wrapping.',
      },
    },
  },
};

export const WithClickHandler: Story = {
  args: {
    icon: <CurrencyIcon width={24} height={24} />,
    text: 'Click Me',
    endIcon: <IconEnd size={12} />,
    onClick: () => alert('List item clicked!'),
  },
  parameters: {
    docs: {
      description: {
        story: 'Interactive list item with click handler.',
      },
    },
  },
};

export const WithoutNavigation: Story = {
  args: {
    icon: <SecurityIcon width={24} height={24} />,
    text: 'No Navigation',
    endIcon: <IconEnd size={12} />,
    onClick: () => alert('List item clicked!'),
  },
  parameters: {
    docs: {
      description: {
        story: 'List item without navigation, only click handler.',
      },
    },
  },
};

export const MultipleItems: Story = {
  render: () => (
    <div>
      <SettingsListItem
        icon={<CurrencyIcon width={24} height={24} />}
        text="Display Currency"
        endIcon={<IconEnd size={12} />}
        onClick={() => alert('Clicked!')}
      />
      <SettingsListItem
        icon={<SecurityIcon width={24} height={24} />}
        text="Security"
        endIcon={<IconEnd size={12} />}
        onClick={() => alert('Clicked!')}
      />
      <SettingsListItem
        icon={<AboutIcon width={24} height={24} />}
        text="About"
        endIcon={<IconEnd size={12} />}
        onClick={() => alert('Clicked!')}
      />
      <SettingsListItem
        icon={<SecurityIcon width={24} height={24} />}
        text="Logout"
        onClick={() => alert('Logout clicked!')}
      />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Multiple list items displayed together.',
      },
    },
  },
};
