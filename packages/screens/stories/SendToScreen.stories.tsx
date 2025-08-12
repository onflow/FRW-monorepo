import { YStack } from '@onflow/frw-ui';
import type { Meta, StoryObj } from '@storybook/react-vite';
import React, { useState } from 'react';

import { SendToScreen, type RecipientTabType } from '../src/send/SendToScreen';

// Mock navigation and bridge for stories
const mockNavigation = {
  navigate: (screen: string, params?: any) => {
    console.log(`Navigate to ${screen}`, params);
  },
  goBack: () => console.log('Go back'),
  canGoBack: () => true,
};

const mockBridge = {
  getNetwork: () => 'mainnet',
  getSelectedAddress: () => '0x1234567890abcdef1234567890abcdef12345678',
};

const mockT = (key: string, params?: any) => {
  const translations: Record<string, string> = {
    'send.myAccounts': 'My Accounts',
    'send.recent': 'Recent',
    'send.addressBook': 'Address Book',
    'send.sendTo.title': 'Send To',
    'send.searchAddress': 'Search addresses...',
    'send.selectedToken': 'Selected Token',
    'send.noAccounts.title': 'No Accounts',
    'send.noAccounts.message': 'No accounts available for sending',
    'send.noRecent.title': 'No Recent Recipients',
    'send.noRecent.message': "You haven't sent to anyone recently",
    'send.noContacts.title': 'No Contacts',
    'send.noContacts.message': 'Your address book is empty',
    'send.noRecipients': 'No recipients found',
  };
  return translations[key] || key;
};

const meta: Meta<typeof SendToScreen> = {
  title: 'Screens/SendToScreen',
  component: SendToScreen,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'SendToScreen provides recipient selection interface with tabbed navigation for accounts, recent recipients, and address book contacts.',
      },
    },
  },
  decorators: [
    (Story) => (
      <YStack height={800} width="100%">
        <Story />
      </YStack>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof SendToScreen>;

export const Default: Story = {
  args: {
    navigation: mockNavigation,
    bridge: mockBridge,
    t: mockT,
  },
};

export const WithDarkTheme: Story = {
  args: {
    navigation: mockNavigation,
    bridge: mockBridge,
    t: mockT,
    theme: { isDark: true },
  },
};

export const WithLightTheme: Story = {
  args: {
    navigation: mockNavigation,
    bridge: mockBridge,
    t: mockT,
    theme: { isDark: false },
  },
};

export const AccountsTab: Story = {
  args: {
    navigation: mockNavigation,
    bridge: mockBridge,
    t: mockT,
  },
};

export const RecentTab: Story = {
  args: {
    navigation: mockNavigation,
    bridge: mockBridge,
    t: mockT,
  },
};

export const ContactsTab: Story = {
  args: {
    navigation: mockNavigation,
    bridge: mockBridge,
    t: mockT,
  },
};

export const WithSearchQuery: Story = {
  args: {
    navigation: mockNavigation,
    bridge: mockBridge,
    t: mockT,
  },
};

export const LoadingRecipients: Story = {
  args: {
    navigation: mockNavigation,
    bridge: mockBridge,
    t: mockT,
  },
};

export const EmptyAccountsTab: Story = {
  args: {
    navigation: mockNavigation,
    bridge: mockBridge,
    t: mockT,
  },
};

export const EmptyRecentTab: Story = {
  args: {
    navigation: mockNavigation,
    bridge: mockBridge,
    t: mockT,
  },
};

export const EmptyContactsTab: Story = {
  args: {
    navigation: mockNavigation,
    bridge: mockBridge,
    t: mockT,
  },
};

export const Interactive: Story = {
  render: function InteractiveRender() {
    const [activeTab, setActiveTab] = useState<RecipientTabType>('accounts');
    const [searchQuery, setSearchQuery] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleTabChange = (tab: RecipientTabType) => {
      setActiveTab(tab);
      // Simulate loading
      setIsLoading(true);
      setTimeout(() => setIsLoading(false), 1000);
    };

    const handleSearch = (query: string) => {
      setSearchQuery(query);
      // Simulate search
      if (query) {
        setIsLoading(true);
        setTimeout(() => setIsLoading(false), 500);
      }
    };

    const handleScanQR = () => {
      alert('QR Scanner would open here');
    };

    return (
      <YStack height="100vh" position="relative">
        <SendToScreen navigation={mockNavigation} bridge={mockBridge} t={mockT} />

        {/* Debug Controls */}
        <YStack
          position="absolute"
          top={10}
          right={10}
          bg="$backgroundTransparent"
          p="$3"
          rounded="$3"
          gap="$2"
        >
          <YStack fontSize="$4" fontWeight="600" color="$color" mb="$2">
            Debug Controls
          </YStack>

          <YStack
            bg="$blue9"
            rounded="$3"
            px="$3"
            py="$2"
            pressStyle={{ opacity: 0.8 }}
            onPress={() => handleTabChange('accounts')}
            cursor="pointer"
          >
            <YStack fontSize="$3" color="$white" fontWeight="500">
              Accounts Tab
            </YStack>
          </YStack>

          <YStack
            bg="$green9"
            rounded="$3"
            px="$3"
            py="$2"
            pressStyle={{ opacity: 0.8 }}
            onPress={() => handleTabChange('recent')}
            cursor="pointer"
          >
            <YStack fontSize="$3" color="$white" fontWeight="500">
              Recent Tab
            </YStack>
          </YStack>

          <YStack
            bg="$purple9"
            rounded="$3"
            px="$3"
            py="$2"
            pressStyle={{ opacity: 0.8 }}
            onPress={() => handleTabChange('contacts')}
            cursor="pointer"
          >
            <YStack fontSize="$3" color="$white" fontWeight="500">
              Contacts Tab
            </YStack>
          </YStack>

          <YStack
            bg="$orange9"
            rounded="$3"
            px="$3"
            py="$2"
            pressStyle={{ opacity: 0.8 }}
            onPress={handleScanQR}
            cursor="pointer"
          >
            <YStack fontSize="$3" color="$white" fontWeight="500">
              Scan QR
            </YStack>
          </YStack>

          <YStack fontSize="$2" color="$color">
            Active Tab: {activeTab}
          </YStack>
          <YStack fontSize="$2" color="$color">
            Search: "{searchQuery}"
          </YStack>
          <YStack fontSize="$2" color="$color">
            Loading: {isLoading ? 'Yes' : 'No'}
          </YStack>
        </YStack>
      </YStack>
    );
  },
};

export const TabComparison: Story = {
  render: () => (
    <YStack gap="$4" width="100%">
      <YStack fontSize="$5" fontWeight="600" color="$color" mb="$2" px="$4">
        Tab Comparison
      </YStack>

      {/* Accounts Tab */}
      <YStack height={300}>
        <YStack fontSize="$4" fontWeight="500" color="$color" mb="$2" px="$4">
          My Accounts Tab
        </YStack>
        <SendToScreen navigation={mockNavigation} bridge={mockBridge} t={mockT} />
      </YStack>

      {/* Recent Tab */}
      <YStack height={300}>
        <YStack fontSize="$4" fontWeight="500" color="$color" mb="$2" px="$4">
          Recent Recipients Tab
        </YStack>
        <SendToScreen navigation={mockNavigation} bridge={mockBridge} t={mockT} />
      </YStack>

      {/* Contacts Tab */}
      <YStack height={300}>
        <YStack fontSize="$4" fontWeight="500" color="$color" mb="$2" px="$4">
          Address Book Tab
        </YStack>
        <SendToScreen navigation={mockNavigation} bridge={mockBridge} t={mockT} />
      </YStack>
    </YStack>
  ),
  decorators: [
    (Story) => (
      <YStack height="100vh" overflow="scroll">
        <Story />
      </YStack>
    ),
  ],
};

export const SearchStates: Story = {
  render: () => (
    <YStack gap="$4" width="100%">
      <YStack fontSize="$5" fontWeight="600" color="$color" mb="$2" px="$4">
        Search States
      </YStack>

      {/* No Search */}
      <YStack height={300}>
        <YStack fontSize="$4" fontWeight="500" color="$color" mb="$2" px="$4">
          Default State
        </YStack>
        <SendToScreen navigation={mockNavigation} bridge={mockBridge} t={mockT} />
      </YStack>

      {/* With Search Query */}
      <YStack height={300}>
        <YStack fontSize="$4" fontWeight="500" color="$color" mb="$2" px="$4">
          With Search Query
        </YStack>
        <SendToScreen navigation={mockNavigation} bridge={mockBridge} t={mockT} />
      </YStack>

      {/* Loading Search Results */}
      <YStack height={300}>
        <YStack fontSize="$4" fontWeight="500" color="$color" mb="$2" px="$4">
          Loading Search Results
        </YStack>
        <SendToScreen navigation={mockNavigation} bridge={mockBridge} t={mockT} />
      </YStack>
    </YStack>
  ),
  decorators: [
    (Story) => (
      <YStack height="100vh" overflow="scroll">
        <Story />
      </YStack>
    ),
  ],
};

export const EmptyStates: Story = {
  render: () => (
    <YStack gap="$4" width="100%">
      <YStack fontSize="$5" fontWeight="600" color="$color" mb="$2" px="$4">
        Empty States
      </YStack>

      {/* Empty Accounts */}
      <YStack height={300}>
        <YStack fontSize="$4" fontWeight="500" color="$color" mb="$2" px="$4">
          Empty Accounts
        </YStack>
        <SendToScreen navigation={mockNavigation} bridge={mockBridge} t={mockT} />
      </YStack>

      {/* Empty Recent */}
      <YStack height={300}>
        <YStack fontSize="$4" fontWeight="500" color="$color" mb="$2" px="$4">
          Empty Recent
        </YStack>
        <SendToScreen navigation={mockNavigation} bridge={mockBridge} t={mockT} />
      </YStack>

      {/* Empty Contacts */}
      <YStack height={300}>
        <YStack fontSize="$4" fontWeight="500" color="$color" mb="$2" px="$4">
          Empty Contacts
        </YStack>
        <SendToScreen navigation={mockNavigation} bridge={mockBridge} t={mockT} />
      </YStack>
    </YStack>
  ),
  decorators: [
    (Story) => (
      <YStack height="100vh" overflow="scroll">
        <Story />
      </YStack>
    ),
  ],
};

export const WithSelectedToken: Story = {
  args: {
    navigation: mockNavigation,
    bridge: mockBridge,
    t: mockT,
  },
};

export const RecipientInteractions: Story = {
  render: function RecipientInteractionsRender() {
    const [lastAction, setLastAction] = useState('None');

    const mockInteractiveNavigation = {
      navigate: (screen: string, params?: any) => {
        setLastAction(`Navigate to ${screen}`);
        console.log(`Navigate to ${screen}`, params);
      },
      goBack: () => {
        setLastAction('Go back');
        console.log('Go back');
      },
      canGoBack: () => true,
    };

    return (
      <YStack height="100vh" position="relative">
        <SendToScreen navigation={mockInteractiveNavigation} bridge={mockBridge} t={mockT} />

        {/* Action Display */}
        <YStack
          position="absolute"
          bottom={20}
          left="50%"
          transform="translateX(-50%)"
          bg="$backgroundTransparent"
          p="$3"
          rounded="$4"
          minWidth={200}
          items="center"
        >
          <YStack fontSize="$3" color="$color" fontWeight="500">
            Last Action: {lastAction}
          </YStack>
        </YStack>
      </YStack>
    );
  },
};

export const QRScannerIntegration: Story = {
  render: function QRScannerRender() {
    const [scanResult, setScanResult] = useState('No scan performed');

    const mockBridgeWithScan = {
      ...mockBridge,
      scanQRCode: () => {
        setScanResult('0xabcdef1234567890abcdef1234567890abcdef12');
        return Promise.resolve('0xabcdef1234567890abcdef1234567890abcdef12');
      },
    };

    return (
      <YStack height="100vh" position="relative">
        <SendToScreen navigation={mockNavigation} bridge={mockBridgeWithScan} t={mockT} />

        {/* Scan Result Display */}
        <YStack
          position="absolute"
          bottom={20}
          left="50%"
          transform="translateX(-50%)"
          bg="$backgroundTransparent"
          p="$3"
          rounded="$4"
          maxWidth={300}
          items="center"
        >
          <YStack fontSize="$3" color="$color" fontWeight="500" mb="$2">
            QR Scan Result:
          </YStack>
          <YStack fontSize="$2" color="$color" textAlign="center">
            {scanResult}
          </YStack>
        </YStack>
      </YStack>
    );
  },
};
