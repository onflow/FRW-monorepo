import React from 'react';
import { useTranslation } from 'react-i18next';
import { View, TouchableOpacity } from 'react-native';

import { useTheme } from '@/contexts/ThemeContext';
import { cn } from '@/lib/utils';
import { TabMyAccountsIcon, TabRecentIcon, TabAddressBookIcon, Text } from 'ui';

import type { RecipientTabType } from '../SendToScreen';

// Import themed icon components

interface TabItem {
  id: RecipientTabType;
  icon: React.ComponentType<{ width?: number; height?: number; isActive?: boolean }>;
  labelKey: string;
}

interface RecipientTabsProps {
  activeTab: RecipientTabType;
  onTabChange: (tab: RecipientTabType) => void;
}

const tabs: TabItem[] = [
  { id: 'accounts', icon: TabMyAccountsIcon, labelKey: 'send.myAccounts' },
  { id: 'recent', icon: TabRecentIcon, labelKey: 'send.recent' },
  { id: 'contacts', icon: TabAddressBookIcon, labelKey: 'send.addressBook' },
];

export const RecipientTabs: React.FC<RecipientTabsProps> = ({ activeTab, onTabChange }) => {
  const { t } = useTranslation();
  const { isDark } = useTheme();

  return (
    <View className="mb-4">
      <View
        className="flex-row justify-between pb-4"
        style={{
          borderBottomWidth: 1,
          borderBottomColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
        }}
      >
        {tabs.map(tab => {
          const isActive = activeTab === tab.id;
          const IconComponent = tab.icon;

          return (
            <TouchableOpacity
              key={tab.id}
              onPress={() => onTabChange(tab.id)}
              className="flex-1 items-center py-3 mx-1"
              style={{ minWidth: 80 }}
            >
              {/* Themed icon component */}
              <View className="mb-2" style={{ width: 24, height: 24 }}>
                <IconComponent width={24} height={24} isActive={isActive} />
              </View>

              {/* Label text */}
              <Text
                className={cn(
                  'text-xs-custom',
                  isActive ? 'text-primary font-semibold' : 'text-fg-2 font-medium'
                )}
                style={{
                  includeFontPadding: false,
                  textAlign: 'center',
                  minWidth: 70,
                  paddingHorizontal: 4,
                }}
                numberOfLines={1}
                adjustsFontSizeToFit={true}
                minimumFontScale={0.8}
              >
                {t(tab.labelKey)}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};
