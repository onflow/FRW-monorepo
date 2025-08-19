import { Send, Coins, Activity } from '@onflow/frw-icons';
import { YStack, XStack, Text } from '@onflow/frw-ui';
import React, { useState } from 'react';

import type { WalletTabProps } from './types';

const TabButton: React.FC<{
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  onPress: () => void;
}> = ({ icon, label, isActive, onPress }) => (
  <XStack
    style={{
      flex: 1,
      height: 48,
      justifyContent: 'center',
      alignItems: 'center',
      gap: 8,
      borderBottomWidth: isActive ? 2 : 0,
      borderBottomColor: isActive ? '#FFFFFF' : 'transparent',
    }}
    onPress={onPress}
  >
    {icon}
    <Text
      fontSize="$4"
      fontWeight={isActive ? '600' : '500'}
      color={isActive ? '#FFFFFF' : '#777E90'}
      style={{ textTransform: 'capitalize' }}
    >
      {label}
    </Text>
  </XStack>
);

const TabPanel: React.FC<{
  children: React.ReactNode;
  isActive: boolean;
}> = ({ children, isActive }) => {
  if (!isActive) return null;

  return <YStack style={{ flex: 1, height: '100%' }}>{children}</YStack>;
};

export const WalletTab: React.FC<WalletTabProps> = ({
  network,
  activeAccountType,
  currentWallet,
  parentWallet,
  tokensComponent,
  nftsComponent,
  activityComponent,
  showActivityTab = true,
  initialTab = 0,
}) => {
  const [currentTab, setCurrentTab] = useState(initialTab);

  const tabs = [
    {
      key: 'tokens',
      label: 'Coins',
      icon: <Coins size="$4" color={currentTab === 0 ? '#FFFFFF' : '#777E90'} />,
      component: tokensComponent,
    },
    {
      key: 'nfts',
      label: 'NFTs',
      icon: <Send size="$4" color={currentTab === 1 ? '#FFFFFF' : '#777E90'} />, // Using Send as placeholder
      component: nftsComponent,
    },
  ];

  if (showActivityTab) {
    tabs.push({
      key: 'activity',
      label: 'Activity',
      icon: <Activity size="$4" color={currentTab === 2 ? '#FFFFFF' : '#777E90'} />,
      component: activityComponent,
    });
  }

  return (
    <YStack
      style={{
        flex: 1,
        backgroundColor: '#000000',
        width: '100%',
        minHeight: '100%',
      }}
    >
      {/* Tab Headers */}
      <XStack
        style={{
          width: '100%',
          backgroundColor: '#000000',
          borderBottomWidth: 1,
          borderBottomColor: '#333333',
        }}
      >
        {tabs.map((tab, index) => (
          <TabButton
            key={tab.key}
            icon={tab.icon}
            label={tab.label}
            isActive={currentTab === index}
            onPress={() => setCurrentTab(index)}
          />
        ))}
      </XStack>

      {/* Tab Content */}
      <YStack style={{ flex: 1, overflow: 'hidden' }}>
        {tabs.map((tab, index) => (
          <TabPanel key={tab.key} isActive={currentTab === index}>
            {tab.component || (
              <YStack style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <Text color="#777E90" fontSize="$4">
                  {tab.label} content not provided
                </Text>
              </YStack>
            )}
          </TabPanel>
        ))}
      </YStack>
    </YStack>
  );
};
