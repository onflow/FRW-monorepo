import type { Meta, StoryObj } from '@storybook/react-vite';
import React from 'react';
import { YStack } from 'tamagui';

import { RecipientList, type RecipientData } from '../src/components/RecipientList';

const meta: Meta<typeof RecipientList> = {
  title: 'Components/RecipientList',
  component: RecipientList,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'RecipientList displays a list or sections of recipients with various states (loading, empty, error). Supports both flat data and sectioned data.',
      },
    },
  },
  argTypes: {
    isLoading: { control: 'boolean' },
    isRefreshing: { control: 'boolean' },
    showSeparators: { control: 'boolean' },
    showSectionHeaders: { control: 'boolean' },
    itemSpacing: { control: 'number', min: 0, max: 32 },
    sectionSpacing: { control: 'number', min: 0, max: 32 },
    contentPadding: { control: 'number', min: 0, max: 32 },
    emptyTitle: { control: 'text' },
    emptyMessage: { control: 'text' },
    error: { control: 'text' },
    onItemPress: { action: 'item-pressed' },
    onItemEdit: { action: 'item-edited' },
    onItemCopy: { action: 'item-copied' },
    onRefresh: { action: 'refreshed' },
    onRetry: { action: 'retry' },
  },
  decorators: [
    (Story): React.JSX.Element => (
      <YStack height={600} width="100%" padding="$4">
        <Story />
      </YStack>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof RecipientList>;

// Sample data
const mockAccounts: RecipientData[] = [
  {
    id: '1',
    name: 'Main Account',
    address: '0x1234567890abcdef1234567890abcdef12345678',
    type: 'account',
    balance: '1,250.50 FLOW',
    showBalance: true,
  },
  {
    id: '2',
    name: 'Secondary Account',
    address: '0x9876543210fedcba9876543210fedcba98765432',
    type: 'account',
    balance: '750.25 FLOW',
    showBalance: true,
  },
  {
    id: '3',
    name: 'Development Account',
    address: '0xabcdef1234567890abcdef1234567890abcdef12',
    type: 'account',
    balance: '25.00 FLOW',
    showBalance: true,
  },
];

const mockContacts: RecipientData[] = [
  {
    id: '4',
    name: 'Alice Cooper',
    address: '0x1111222233334444555566667777888899990000',
    type: 'contact',
    showEditButton: true,
  },
  {
    id: '5',
    name: 'Bob Smith',
    address: '0xaaaaaabbbbbbccccccddddddeeeeeeffffffffff',
    type: 'contact',
    showEditButton: true,
  },
  {
    id: '6',
    name: 'Carol Johnson',
    address: '0x5555666677778888999900001111222233334444',
    type: 'contact',
    showEditButton: true,
  },
];

const mockRecent: RecipientData[] = [
  {
    id: '7',
    name: 'Recent Transfer #1',
    address: '0xdeadbeefcafebabe123456789abcdef012345678',
    type: 'recent',
  },
  {
    id: '8',
    name: 'Recent Transfer #2',
    address: '0x1234abcd5678efgh9012ijkl3456mnop7890qrst',
    type: 'recent',
  },
];

export const Default: Story = {
  args: {
    data: mockAccounts,
    showSeparators: true,
  },
};

export const Accounts: Story = {
  args: {
    data: mockAccounts,
    emptyTitle: 'No Accounts',
    emptyMessage: "You don't have any accounts yet.",
  },
};

export const Contacts: Story = {
  args: {
    data: mockContacts,
    emptyTitle: 'No Contacts',
    emptyMessage: "You haven't added any contacts yet.",
  },
};

export const Recent: Story = {
  args: {
    data: mockRecent,
    emptyTitle: 'No Recent',
    emptyMessage: 'No recent transactions found.',
  },
};

export const Sectioned: Story = {
  args: {
    sections: [
      { title: 'My Accounts', data: mockAccounts },
      { title: 'Contacts', data: mockContacts },
      { title: 'Recent', data: mockRecent },
    ],
    showSectionHeaders: true,
    sectionSpacing: 24,
  },
};

export const Loading: Story = {
  args: {
    data: [],
    isLoading: true,
  },
};

export const Empty: Story = {
  args: {
    data: [],
    emptyTitle: 'No Recipients',
    emptyMessage: "You haven't added any recipients yet. Add your first recipient to get started.",
  },
};

export const Error: Story = {
  args: {
    data: [],
    error: 'Failed to load recipients. Please check your connection and try again.',
    retryButtonText: 'Retry',
  },
};

export const Refreshing: Story = {
  args: {
    data: mockAccounts,
    isRefreshing: true,
  },
};
