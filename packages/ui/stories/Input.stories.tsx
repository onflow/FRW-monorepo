import type { Meta, StoryObj } from '@storybook/react-vite';
import React from 'react';

import { YStack } from '../src';
import { Input } from '../src/components/Input';

const meta = {
  title: 'UI/Input',
  component: Input,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Input component with label, error states, and helper text support.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    placeholder: {
      control: 'text',
    },
    label: {
      control: 'text',
    },
    error: {
      control: 'text',
    },
    helperText: {
      control: 'text',
    },
    disabled: {
      control: 'boolean',
    },
  },
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    placeholder: 'Enter text...',
  },
};

export const WithLabel: Story = {
  args: {
    label: 'Email Address',
    placeholder: 'your@email.com',
  },
};

export const WithHelperText: Story = {
  args: {
    label: 'Password',
    placeholder: 'Enter your password',
    helperText: 'Must be at least 8 characters long',
    type: 'password',
  },
};

export const WithError: Story = {
  args: {
    label: 'Username',
    placeholder: 'Enter username',
    error: 'Username is already taken',
    defaultValue: 'johndoe',
  },
};

export const Disabled: Story = {
  args: {
    label: 'Disabled Input',
    placeholder: 'This input is disabled',
    disabled: true,
    helperText: 'This field is currently disabled',
  },
};

export const AllStates: Story = {
  render: (): React.ReactElement => (
    <YStack space="$4" width={300}>
      <Input label="Normal Input" placeholder="Enter text..." helperText="This is helper text" />

      <Input
        label="Input with Value"
        defaultValue="Sample text"
        helperText="Input with default value"
      />

      <Input
        label="Error State"
        placeholder="Invalid input"
        error="This field is required"
        defaultValue="invalid"
      />

      <Input
        label="Disabled Input"
        placeholder="Disabled"
        disabled={true}
        helperText="This field is disabled"
      />

      <Input
        label="Password"
        type="password"
        placeholder="Enter password"
        helperText="Keep your password secure"
      />
    </YStack>
  ),
};
