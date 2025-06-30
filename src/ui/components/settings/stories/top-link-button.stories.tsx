import type { Meta, StoryObj } from '@storybook/react-webpack5';
import React from 'react';

import { AccountListIcon } from '@/ui/assets/icons/settings/AccountList';
import { AddressIcon } from '@/ui/assets/icons/settings/Address';

import TopLinkButton from '../top-link-button';

const meta: Meta<typeof TopLinkButton> = {
  title: 'Settings/TopLinkButton',
  component: TopLinkButton,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    backgrounds: {
      default: 'dark',
    },
    docs: {
      description: {
        component:
          'A top-level navigation button used in settings for Address and Account List navigation.',
      },
    },
  },
  decorators: [
    (Story) => {
      return (
        <div
          style={{
            width: '400px',
            backgroundColor: '#282828',
            borderRadius: '16px',
            padding: '8px',
            color: 'white',
          }}
        >
          <style>
            {`
              /* Hover state for TopLinkButton */
              .MuiListItemButton-root:hover {
                background-color: rgba(255, 255, 255, 0.08) !important;
                transition: background-color 0.2s ease;
              }
            `}
          </style>
          <Story />
        </div>
      );
    },
  ],
  argTypes: {
    icon: {
      control: false,
      description: 'Icon component to display',
    },
    text: {
      control: 'text',
      description: 'Text label for the button',
    },
    onClick: {
      action: 'clicked',
      description: 'Click handler for the button',
    },
  },
};

export default meta;
type Story = StoryObj<typeof TopLinkButton>;

export const Address: Story = {
  args: {
    icon: <AddressIcon width={28} height={28} />,
    text: 'Address',
  },
  parameters: {
    docs: {
      description: {
        story: 'Address navigation button with address book icon. Hover to see interactive state.',
      },
    },
  },
};

export const AccountList: Story = {
  args: {
    icon: <AccountListIcon width={28} height={28} />,
    text: 'Account List',
  },
  parameters: {
    docs: {
      description: {
        story:
          'Account List navigation button with account list icon. Hover to see interactive state.',
      },
    },
  },
};

export const BothButtons: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '8px' }}>
      <TopLinkButton
        icon={<AddressIcon width={28} height={28} />}
        text="Address"
        onClick={() => {}}
      />
      <TopLinkButton
        icon={<AccountListIcon width={28} height={28} />}
        text="Account List"
        onClick={() => {}}
      />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Both Address and Account List buttons displayed together as they appear in the settings. Hover over each button to see interactive states.',
      },
    },
  },
};

export const HoverStates: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
      <TopLinkButton
        icon={<AddressIcon width={28} height={28} />}
        text="Address"
        onClick={() => {}}
      />
      <TopLinkButton
        icon={<AccountListIcon width={28} height={28} />}
        text="Account List"
        onClick={() => {}}
      />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Hover over the buttons to see the interactive hover state with background color change.',
      },
    },
  },
};
