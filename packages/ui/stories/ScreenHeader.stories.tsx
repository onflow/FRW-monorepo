import type { Meta, StoryObj } from '@storybook/react-vite';

import { ScreenHeader } from '../src/components/ScreenHeader';

const meta: Meta<typeof ScreenHeader> = {
  title: 'Components/ScreenHeader',
  component: ScreenHeader,
  parameters: {
    layout: 'fullscreen',
    backgrounds: {
      default: 'dark',
      values: [
        {
          name: 'dark',
          value: '#1a1a1a',
        },
      ],
    },
  },
  argTypes: {
    title: {
      control: 'text',
      description: 'Header title text',
    },
    titleColor: {
      control: 'color',
      description: 'Title text color',
    },
    backgroundColor: {
      control: 'color',
      description: 'Header background color',
    },
    showBackButton: {
      control: 'boolean',
      description: 'Show/hide back button',
    },
    showCloseButton: {
      control: 'boolean',
      description: 'Show/hide close button',
    },
    backButtonVariant: {
      control: { type: 'select' },
      options: ['primary', 'secondary', 'ghost'],
      description: 'Back button variant',
    },
    closeButtonVariant: {
      control: { type: 'select' },
      options: ['primary', 'secondary', 'ghost'],
      description: 'Close button variant',
    },
    buttonSize: {
      control: { type: 'select' },
      options: ['small', 'medium', 'large'],
      description: 'Button size',
    },
  },
  args: {
    onBackPress: () => console.log('Back pressed'),
    onClosePress: () => console.log('Close pressed'),
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    title: 'Send to',
  },
};

export const SendFlow: Story = {
  args: {
    title: 'Send to',
    titleColor: '#FFFFFF',
    backgroundColor: 'transparent',
  },
};

export const WithoutBackButton: Story = {
  args: {
    title: 'Settings',
    showBackButton: false,
  },
};

export const WithoutCloseButton: Story = {
  args: {
    title: 'Profile',
    showCloseButton: false,
  },
};

export const OnlyTitle: Story = {
  args: {
    title: 'Welcome',
    showBackButton: false,
    showCloseButton: false,
  },
};
