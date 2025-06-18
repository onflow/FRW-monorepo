import { type Meta, type StoryObj } from '@storybook/react-webpack5';
import React from 'react';

import { AboutIcon } from '@/ui/assets/icons/settings/About';
import { CurrencyIcon } from '@/ui/assets/icons/settings/Currency';
import { SecurityIcon } from '@/ui/assets/icons/settings/Security';
import IconEnd from '@/ui/components/iconfont/IconAVector11Stroke';

import { SettingsListItem } from '../list-item';

const meta: Meta<typeof SettingsListItem> = {
  title: 'Components/Settings/ListItem',
  component: SettingsListItem,
  parameters: {
    layout: 'centered',
  },
  decorators: [
    (Story) => (
      <div style={{ width: '400px', backgroundColor: '#282828', borderRadius: '16px' }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof SettingsListItem>;

export const Default: Story = {
  args: {
    to: '/dashboard/setting/currency',
    icon: <CurrencyIcon width={24} height={24} />,
    text: 'Display Currency',
    endIcon: <IconEnd size={12} />,
  },
};

export const WithoutEndIcon: Story = {
  args: {
    to: '/dashboard/setting/security',
    icon: <SecurityIcon width={24} height={24} />,
    text: 'Security',
  },
};

export const WithLongText: Story = {
  args: {
    to: '/dashboard/setting/about',
    icon: <AboutIcon width={24} height={24} />,
    text: 'This is a very long text that should wrap properly in the list item',
    endIcon: <IconEnd size={12} />,
  },
};

export const WithClickHandler: Story = {
  args: {
    to: '#',
    icon: <CurrencyIcon width={24} height={24} />,
    text: 'Click Me',
    endIcon: <IconEnd size={12} />,
    onClick: () => alert('Clicked!'),
  },
};
