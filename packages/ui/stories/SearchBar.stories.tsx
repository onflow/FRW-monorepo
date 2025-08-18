import type { Meta, StoryObj } from '@storybook/react-vite';
import React, { useState } from 'react';
import { YStack } from 'tamagui';

import { SearchBar } from '../src/components/SearchBar';

const meta: Meta<typeof SearchBar> = {
  title: 'Components/SearchBar',
  component: SearchBar,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'SearchBar is a clean, focused search input component that matches the Flow Wallet design system. Features a search icon container and smooth interactions.',
      },
    },
  },
  argTypes: {
    value: { control: 'text' },
    placeholder: { control: 'text' },
    width: { control: 'number', min: 200, max: 400 },
    disabled: { control: 'boolean' },
    onChangeText: { action: 'text-changed' },
    onClear: { action: 'cleared' },
  },
  decorators: [
    (Story) => (
      <YStack p="$4" bg="$background">
        <Story />
      </YStack>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof SearchBar>;

export const Default: Story = {
  args: {
    value: '',
    placeholder: 'Search address',
    width: '100%',
    disabled: false,
  },
  render: function DefaultRender(args) {
    const [value, setValue] = useState(args.value || '');

    return <SearchBar {...args} value={value} onChangeText={setValue} onClear={args.onClear} />;
  },
};

export const WithValue: Story = {
  args: {
    value: '0x1234567890abcdef',
    placeholder: 'Search address',
    width: '100%',
    disabled: false,
  },
  render: function WithValueRender(args) {
    const [value, setValue] = useState(args.value || '');

    return <SearchBar {...args} value={value} onChangeText={setValue} onClear={args.onClear} />;
  },
};

export const FullWidth: Story = {
  args: {
    value: '',
    placeholder: 'Search address',
    width: '100%',
    disabled: false,
  },
  render: function FullWidthRender(args) {
    const [value, setValue] = useState(args.value || '');

    return (
      <YStack w={400}>
        <SearchBar {...args} value={value} onChangeText={setValue} onClear={args.onClear} />
      </YStack>
    );
  },
};

export const CustomPlaceholder: Story = {
  args: {
    value: '',
    placeholder: 'Enter wallet address or name...',
    width: 320,
    disabled: false,
  },
  render: function CustomPlaceholderRender(args) {
    const [value, setValue] = useState(args.value || '');

    return <SearchBar {...args} value={value} onChangeText={setValue} onClear={args.onClear} />;
  },
};

export const Disabled: Story = {
  args: {
    value: '',
    placeholder: 'Search address',
    width: '100%',
    disabled: true,
  },
  render: function DisabledRender(args) {
    const [value, setValue] = useState(args.value || '');

    return <SearchBar {...args} value={value} onChangeText={setValue} onClear={args.onClear} />;
  },
};

export const WithClearButton: Story = {
  args: {
    value: '0x1234567890abcdef',
    placeholder: 'Search address',
    width: '100%',
    disabled: false,
  },
  render: function WithClearButtonRender(args) {
    const [value, setValue] = useState(args.value || '');
    const [clearCount, setClearCount] = useState(0);

    const handleClear = () => {
      setClearCount((prev) => prev + 1);
      args.onClear?.();
    };

    return (
      <YStack gap="$4">
        <SearchBar {...args} value={value} onChangeText={setValue} onClear={handleClear} />
        <text>Clear button clicked: {clearCount} times</text>
      </YStack>
    );
  },
};

export const Sizes: Story = {
  render: function SizesRender() {
    const [value1, setValue1] = useState('');
    const [value2, setValue2] = useState('');
    const [value3, setValue3] = useState('');

    return (
      <YStack gap="$4" items="center">
        <SearchBar
          value={value1}
          onChangeText={setValue1}
          placeholder="Compact (250px)"
          width={250}
        />
        <SearchBar
          value={value2}
          onChangeText={setValue2}
          placeholder="Default (295px)"
          width={295}
        />
        <SearchBar value={value3} onChangeText={setValue3} placeholder="Wide (350px)" width={350} />
      </YStack>
    );
  },
};
