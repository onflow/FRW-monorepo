import type { Meta, StoryObj } from '@storybook/react-vite';
import React, { useState } from 'react';
import { YStack, Text } from 'tamagui';

import { RecipientList, type RecipientData } from '../src/components/RecipientList';
import { SearchableTabLayout } from '../src/components/SearchableTabLayout';

const meta: Meta<typeof SearchableTabLayout> = {
  title: 'Components/SearchableTabLayout',
  component: SearchableTabLayout,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'SearchableTabLayout provides a unified layout combining header, search box, tabs, and content area. Perfect for screens that need search and tab functionality.',
      },
    },
  },
  argTypes: {
    title: { control: 'text' },
    showHeader: { control: 'boolean' },
    searchValue: { control: 'text' },
    searchPlaceholder: { control: 'text' },
    showScanButton: { control: 'boolean' },
    fullWidthTabs: { control: 'boolean' },
    headerSpacing: { control: 'number', min: 0, max: 32 },
    searchSpacing: { control: 'number', min: 0, max: 32 },
    tabSpacing: { control: 'number', min: 0, max: 32 },
    contentPadding: { control: 'number', min: 0, max: 32 },
    onSearchChange: { action: 'search-changed' },
    onScanPress: { action: 'scan-pressed' },
    onTabChange: { action: 'tab-changed' },
  },
  decorators: [
    (Story) => (
      <YStack height={600} width="100%">
        <Story />
      </YStack>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof SearchableTabLayout>;

// Sample content for different tabs
const TabContent = ({ tab, searchQuery }: { tab: string; searchQuery: string }) => (
  <YStack flex={1} justify="center" items="center" gap="$2">
    <Text fontSize="$6" fontWeight="600" color="$color">
      {tab} Tab
    </Text>
    {searchQuery ? (
      <Text fontSize="$4" color="$textSecondary">
        Searching for: "{searchQuery}"
      </Text>
    ) : (
      <Text fontSize="$4" color="$textSecondary">
        Content for {tab} tab goes here
      </Text>
    )}
  </YStack>
);

export const Default: Story = {
  args: {
    title: 'Send To',
    searchValue: '',
    searchPlaceholder: 'Search address',
    tabSegments: ['Accounts', 'Recent', 'Contacts'],
    activeTab: 'Accounts',
    showScanButton: true,
    children: <TabContent tab="Accounts" searchQuery="" />,
  },
  render: function DefaultRender(args) {
    const [searchValue, setSearchValue] = useState(args.searchValue || '');
    const [activeTab, setActiveTab] = useState(args.activeTab || 'Accounts');

    return (
      <SearchableTabLayout
        {...args}
        searchValue={searchValue}
        activeTab={activeTab}
        onSearchChange={setSearchValue}
        onTabChange={setActiveTab}
      >
        <TabContent tab={activeTab} searchQuery={searchValue} />
      </SearchableTabLayout>
    );
  },
};

export const WithRecipientList: Story = {
  render: function WithRecipientListRender() {
    const [searchValue, setSearchValue] = useState('');
    const [activeTab, setActiveTab] = useState('Accounts');

    const mockData: Record<string, RecipientData[]> = {
      Accounts: [
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
      ],
      Recent: [
        {
          id: '3',
          name: 'Recent Transfer #1',
          address: '0xdeadbeefcafebabe123456789abcdef012345678',
          type: 'recent',
        },
        {
          id: '4',
          name: 'Recent Transfer #2',
          address: '0x1234abcd5678efgh9012ijkl3456mnop7890qrst',
          type: 'recent',
        },
      ],
      Contacts: [
        {
          id: '5',
          name: 'Alice Cooper',
          address: '0x1111222233334444555566667777888899990000',
          type: 'contact',
          showEditButton: true,
        },
        {
          id: '6',
          name: 'Bob Smith',
          address: '0xaaaaaabbbbbbccccccddddddeeeeeeffffffffff',
          type: 'contact',
          showEditButton: true,
        },
      ],
    };

    const filteredData =
      mockData[activeTab]?.filter(
        (item) =>
          !searchValue ||
          item.name.toLowerCase().includes(searchValue.toLowerCase()) ||
          item.address.toLowerCase().includes(searchValue.toLowerCase())
      ) || [];

    return (
      <SearchableTabLayout
        title="Send To"
        searchValue={searchValue}
        searchPlaceholder="Search address"
        tabSegments={['Accounts', 'Recent', 'Contacts']}
        activeTab={activeTab}
        showScanButton={true}
        onSearchChange={setSearchValue}
        onTabChange={setActiveTab}
        onScanPress={() => alert('Scan QR code')}
      >
        <RecipientList
          data={filteredData}
          emptyTitle={`No ${activeTab}`}
          emptyMessage={`No ${activeTab.toLowerCase()} found${searchValue ? ' for your search' : ''}.`}
          onItemPress={(item) => alert(`Selected: ${item.name}`)}
          onItemEdit={(item) => alert(`Edit: ${item.name}`)}
          onItemCopy={(item) => alert(`Copy: ${item.address}`)}
          contentPadding={0}
        />
      </SearchableTabLayout>
    );
  },
};

export const NoScanButton: Story = {
  args: {
    title: 'Simple Layout',
    searchValue: '',
    searchPlaceholder: 'Type to search...',
    tabSegments: ['One', 'Two', 'Three'],
    activeTab: 'One',
    showScanButton: false,
    children: <TabContent tab="One" searchQuery="" />,
  },
  render: function NoScanButtonRender(args) {
    const [searchValue, setSearchValue] = useState(args.searchValue || '');
    const [activeTab, setActiveTab] = useState(args.activeTab || 'One');

    return (
      <SearchableTabLayout
        {...args}
        searchValue={searchValue}
        activeTab={activeTab}
        onSearchChange={setSearchValue}
        onTabChange={setActiveTab}
      >
        <TabContent tab={activeTab} searchQuery={searchValue} />
      </SearchableTabLayout>
    );
  },
};
