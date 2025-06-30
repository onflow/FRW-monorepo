import type { Meta, StoryObj } from '@storybook/react-webpack5';
import React from 'react';

import SettingButton from '../setting-button';

const meta: Meta<typeof SettingButton> = {
  title: 'Settings/SettingButton',
  component: SettingButton,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    backgrounds: {
      default: 'dark',
    },
    docs: {
      description: {
        component: 'A setting button component used for navigation or actions in settings.',
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
    label: {
      control: 'text',
      description: 'Button label text',
    },
    to: {
      control: 'text',
      description: 'Navigation path (optional)',
    },
    onClick: {
      action: 'clicked',
      description: 'Click handler function (optional)',
    },
    showArrow: {
      control: 'boolean',
      description: 'Whether to show the arrow icon',
    },
  },
};

export default meta;
type Story = StoryObj<typeof SettingButton>;

export const Default: Story = {
  args: {
    label: 'Display Currency',
    showArrow: true,
  },
  parameters: {
    mockData: { label: 'Display Currency', showArrow: true },
  },
};

export const WithoutArrow: Story = {
  args: {
    label: 'Security Settings',
    showArrow: false,
    onClick: () => alert('Clicked!'),
  },
  parameters: {
    docs: {
      description: {
        story: 'Setting button without arrow icon.',
      },
    },
  },
};

export const WithClickHandler: Story = {
  args: {
    label: 'Click Me',
    onClick: () => alert('Button clicked!'),
    showArrow: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'Setting button with click handler instead of navigation.',
      },
    },
  },
};

export const LongText: Story = {
  args: {
    label: 'This is a very long text that should wrap properly in the setting button',
    showArrow: true,
    onClick: () => alert('Clicked!'),
  },
  parameters: {
    docs: {
      description: {
        story: 'Setting button with long text to test text wrapping.',
      },
    },
  },
};

export const MultipleButtons: Story = {
  render: () => (
    <div>
      <SettingButton label="Display Currency" showArrow={true} onClick={() => alert('Clicked!')} />
      <SettingButton label="Security Settings" showArrow={true} onClick={() => alert('Clicked!')} />
      <SettingButton label="About" showArrow={true} onClick={() => alert('Clicked!')} />
      <SettingButton label="Logout" onClick={() => alert('Logout clicked!')} showArrow={false} />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Multiple setting buttons displayed together.',
      },
    },
  },
};
