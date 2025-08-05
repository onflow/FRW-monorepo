import { useTheme } from '@/contexts/ThemeContext';
import { sendSelectors, useSendStore } from '@onflow/frw-stores';
import { useNavigation } from '@react-navigation/native';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { SafeAreaView, StatusBar, View } from 'react-native';
import { SegmentedControl } from 'ui';
import { AddressSearchBox } from './components/AddressSearchBox';
import { RecipientContent } from './components/RecipientContent';

export type RecipientTabType = 'accounts' | 'recent' | 'contacts';

interface TabConfig {
  type: RecipientTabType;
  title: string;
}

const SendToScreen = () => {
  const { t } = useTranslation();

  const TABS: TabConfig[] = [
    { type: 'accounts', title: t('send.myAccounts') },
    { type: 'recent', title: t('send.recent') },
    { type: 'contacts', title: t('send.addressBook') },
  ];

  const navigation = useNavigation();
  const { isDark } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<RecipientTabType>('accounts');

  // Get selected token from send store
  const selectedToken = useSendStore(sendSelectors.selectedToken);
  const setCurrentStep = useSendStore(state => state.setCurrentStep);

  // Update current step when screen loads
  useEffect(() => {
    setCurrentStep('send-to');
  }, []);

  const getTitleByType = (type: RecipientTabType): string => {
    return TABS.find(tab => tab.type === type)?.title || '';
  };

  const getTypeByTitle = (title: string): RecipientTabType => {
    return TABS.find(tab => tab.title === title)?.type || 'accounts';
  };

  const tabTitles = TABS.map(tab => tab.title);

  const handleTabChange = (title: string) => {
    const tabType = getTypeByTitle(title);
    setActiveTab(tabType);
  };

  return (
    <View className={isDark ? 'dark' : ''} style={{ flex: 1 }}>
      <SafeAreaView className={`flex-1 ${isDark ? 'bg-surface-base' : 'bg-white'}`}>
        <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

        {/* Main Content */}
        <View className={`flex-1 ${isDark ? 'bg-surface-1' : 'bg-white'}`}>
          <View className="flex-1 px-5 pt-4">
            {/* Search box area */}
            <View className="mb-6">
              <AddressSearchBox
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder={t('send.searchAddress')}
              />
            </View>

            {/* Tab area */}
            <View className="mb-4">
              <SegmentedControl
                segments={tabTitles}
                value={getTitleByType(activeTab)}
                onChange={handleTabChange}
                fullWidth={true}
              />
            </View>

            {/* Content area - use flex-1 to let FlatList occupy remaining space */}
            <View className="flex-1 -mx-5">
              <RecipientContent
                activeTab={activeTab}
                searchQuery={searchQuery}
                navigation={navigation}
                selectedToken={
                  selectedToken
                    ? {
                        name: selectedToken.name,
                        symbol: selectedToken.symbol || '',
                        balance: selectedToken.balance || '',
                        displayBalance: selectedToken.displayBalance || '',
                        logoURI: selectedToken.logoURI || '',
                        isVerified: selectedToken.isVerified || false,
                        contractName: selectedToken.contractName || '',
                        change: selectedToken.change || '',
                      }
                    : undefined
                }
              />
            </View>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
};

export default SendToScreen;
