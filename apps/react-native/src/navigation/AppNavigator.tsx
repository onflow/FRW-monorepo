import { SelectTokensScreen } from '@onflow/frw-screens';
import { useSendStore } from '@onflow/frw-stores';
import {
  createNFTModelsFromConfig,
  createTokenModelFromConfig,
  createWalletAccountFromConfig,
  type InitialProps,
  type NFTModel,
} from '@onflow/frw-types';
import { DarkTheme, DefaultTheme, NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React, { useEffect, useRef } from 'react';
// import { useTranslation } from 'react-i18next';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { reactNativeNavigation } from '@/bridge/ReactNativeNavigation';
import { HomeScreen } from '@/screens';

export type RootStackParamList = {
  Home: { address?: string; network?: string };
  ColorDemo: undefined;
  NFTDetail: {
    nft: NFTModel;
    selectedNFTs?: NFTModel[];
    onSelectionChange?: (nftId: string, selected: boolean) => void;
  };
  NFTList: {
    collection?: Record<string, unknown>;
    address?: string;
    selectedNFTIds?: string[];
    isEditing?: boolean;
  };
  SelectTokens: undefined;
  SendTo: undefined;
  SendTokens: undefined;
  SendSingleNFT: undefined;
  SendMultipleNFTs: undefined;
  Confirmation: {
    fromAccount: Record<string, unknown>;
    toAccount: Record<string, unknown>;
    amount?: string;
    token?: Record<string, unknown>;
    selectedNFTs?: Record<string, unknown>[];
  };
};

interface AppNavigatorProps {
  address?: string;
  network?: string;
  initialRoute?: string;
  embedded?: boolean;
  initialProps?: InitialProps;
}

const Stack = createNativeStackNavigator<RootStackParamList>();

const AppNavigator: React.FC<AppNavigatorProps> = props => {
  // const { t } = useTranslation();
  const { address, network, initialRoute, initialProps } = props;
  // const { isDark } = useTheme();
  const navigationRef = useRef<any>(null);

  // Send store actions
  const {
    setSelectedToken,
    setCurrentStep,
    setTransactionType,
    setFromAccount,
    setSelectedNFTs,
    setToAccount,
  } = useSendStore();

  // Set navigation ref for the platform implementation
  useEffect(() => {
    reactNativeNavigation.setNavigationRef(navigationRef);
  }, []);

  // Initialize SendTo flow if requested
  useEffect(() => {
    if (initialProps?.screen === 'send-asset') {
      const sendToConfig = initialProps?.sendToConfig;
      if (!sendToConfig) {
        return;
      }
      try {
        if (sendToConfig.fromAccount) {
          console.log('🚀 DEBUG: Setting from account', sendToConfig.fromAccount);
          const walletAccount = createWalletAccountFromConfig(sendToConfig.fromAccount);
          setFromAccount(walletAccount);
        }
        if (sendToConfig.selectedToken) {
          console.log('🚀 DEBUG: Setting selected token', sendToConfig.selectedToken);
          // Convert to TokenInfo type
          const tokenInfo = createTokenModelFromConfig(sendToConfig.selectedToken);
          setSelectedToken(tokenInfo);
          setCurrentStep('send-to');
        }

        if (sendToConfig.selectedNFTs && Array.isArray(sendToConfig.selectedNFTs)) {
          // Set selected NFTs if provided
          console.log('🚀 DEBUG: Setting selected NFTs', sendToConfig.selectedNFTs);
          const nftModels = createNFTModelsFromConfig(sendToConfig.selectedNFTs);
          setSelectedNFTs(nftModels);
        }

        if (sendToConfig.targetAddress) {
          const walletAccount = createWalletAccountFromConfig({
            address: sendToConfig.targetAddress,
            name: sendToConfig.targetAddress,
            emojiInfo: { emoji: '', name: '', color: '' },
          });
          setToAccount(walletAccount);
          setTransactionType('tokens');
          setCurrentStep('send-tokens');
        } else if (sendToConfig.selectedNFTs?.length === 1) {
          setTransactionType('single-nft');
          setCurrentStep('send-to');
        } else if (sendToConfig.selectedNFTs && sendToConfig.selectedNFTs.length > 1) {
          setTransactionType('multiple-nfts');
          setCurrentStep('send-to');
        }
      } catch (error) {
        console.error('Failed to initialize SendTo flow:', error);
      }
    }
  }, [
    initialProps?.sendToConfig,
    setSelectedToken,
    setCurrentStep,
    setTransactionType,
    setFromAccount,
    setSelectedNFTs,
  ]);

  const _customLightTheme = {
    ...DefaultTheme,
    colors: {
      ...DefaultTheme.colors,
      background: 'rgb(255, 255, 255)', // --background-base light
      card: 'rgb(242, 242, 247)', // --background-muted light
      text: 'rgb(0, 0, 0)', // --forend-primary light
      border: 'rgb(118, 118, 118)', // --forend-secondary light
      primary: 'rgb(0, 255, 149)', // --primary
    },
  };

  const customDarkTheme = {
    ...DarkTheme,
    colors: {
      ...DarkTheme.colors,
      background: 'rgb(0, 0, 0)', // --background-base dark
      card: 'rgb(26, 26, 26)', // --background-muted dark
      text: 'rgb(255, 255, 255)', // --forend-primary dark
      border: 'rgb(179, 179, 179)', // --forend-secondary dark
      primary: 'rgb(0, 255, 149)', // --primary
    },
  };

  return (
    <SafeAreaProvider>
      {/* <View className={isDark ? 'dark' : ''} style={{ flex: 1 }}> */}
      <NavigationContainer ref={navigationRef} theme={customDarkTheme}>
        <Stack.Navigator
          initialRouteName={(initialRoute as keyof RootStackParamList) || 'Home'}
          screenOptions={{
            headerTitleAlign: 'center',
            headerShadowVisible: false,
            headerShown: true,
          }}
        >
          <Stack.Screen name="Home" component={HomeScreen} initialParams={{ address, network }} />

          <Stack.Group
            screenOptions={{
              headerShown: true,
              // headerLeft: () => <NavigationBackButton />,
              // headerRight: () => <NavigationCloseButton />,
            }}
          >
            <Stack.Screen
              name="SelectTokens"
              component={SelectTokensScreen}
              options={
                {
                  // headerTitle: () => <NavigationTitle title={t('navigation.selectTokens')} />,
                }
              }
            />
          </Stack.Group>
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
};

export default AppNavigator;
