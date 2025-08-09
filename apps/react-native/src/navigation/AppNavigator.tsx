import { useSendStore } from '@onflow/frw-stores';
import { type NFTModel, type SendToConfig } from '@onflow/frw-types';
import {
  createWalletAccountFromConfig,
  createNFTModelsFromConfig,
  createTokenModelFromConfig,
} from '@onflow/frw-types';
import { DarkTheme, DefaultTheme, NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import NavigationBackButton from '@/components/NavigationBackButton';
import NavigationCloseButton from '@/components/NavigationCloseButton';
import NavigationTitle from '@/components/NavigationTitle';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useTheme } from '@/contexts/ThemeContext';
import {
  HomeScreen,
  NFTDetailScreen,
  SelectTokensScreen,
  SendMultipleNFTsScreen,
  SendSingleNFTScreen,
  SendTokensScreen,
  SendToScreen,
} from '@/screens';
import ColorDemoScreen from '@/screens/ColorDemo/ColorDemoScreen';
import NFTListScreen from '@/screens/NFTList/NFTListScreen';

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
  sendToConfig?: SendToConfig;
}

const Stack = createNativeStackNavigator<RootStackParamList>();

const AppNavigator: React.FC<AppNavigatorProps> = props => {
  const { t } = useTranslation();
  const { address, network, initialRoute, sendToConfig } = props;
  const { isDark } = useTheme();

  // Send store actions
  const { setSelectedToken, setCurrentStep, setTransactionType, setFromAccount, setSelectedNFTs } =
    useSendStore();

  // Initialize SendTo flow if requested
  useEffect(() => {
    if (sendToConfig) {
      try {
        // Set selected token
        if (sendToConfig.selectedToken) {
          console.log('🚀 DEBUG: Setting selected token', sendToConfig.selectedToken);
          // Convert to TokenInfo type
          const tokenInfo = createTokenModelFromConfig(sendToConfig.selectedToken);
          setSelectedToken(tokenInfo);
        }

        if (sendToConfig.fromAccount) {
          console.log('🚀 DEBUG: Setting from account', sendToConfig.fromAccount);
          const walletAccount = createWalletAccountFromConfig(sendToConfig.fromAccount);
          setFromAccount(walletAccount);
        }

        // Set selected NFTs if provided
        if (sendToConfig.selectedNFTs && Array.isArray(sendToConfig.selectedNFTs)) {
          console.log('🚀 DEBUG: Setting selected NFTs', sendToConfig.selectedNFTs);
          const nftModels = createNFTModelsFromConfig(sendToConfig.selectedNFTs);
          setSelectedNFTs(nftModels);
        }

        // Set transaction type
        if (sendToConfig.transactionType) {
          setTransactionType(
            sendToConfig.transactionType as 'tokens' | 'single-nft' | 'multiple-nfts'
          );
        }

        // Set current step to send-to
        setCurrentStep('send-to');
      } catch (error) {
        console.error('Failed to initialize SendTo flow:', error);
      }
    }
  }, [
    sendToConfig,
    setSelectedToken,
    setCurrentStep,
    setTransactionType,
    setFromAccount,
    setSelectedNFTs,
  ]);

  const customLightTheme = {
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
      <View className={isDark ? 'dark' : ''} style={{ flex: 1 }}>
        <NavigationContainer theme={isDark ? customDarkTheme : customLightTheme}>
          <Stack.Navigator
            initialRouteName={(initialRoute as keyof RootStackParamList) || 'Home'}
            screenOptions={{
              headerShown: true,
              headerRight: () => <ThemeToggle />,
            }}
          >
            <Stack.Group
              screenOptions={{
                headerShown: true,
                headerLeft: () => <NavigationBackButton />,
                headerRight: () => <NavigationCloseButton />,
              }}
            >
              <Stack.Screen
                name="Home"
                component={HomeScreen}
                initialParams={{ address, network }}
              />
              <Stack.Screen
                name="ColorDemo"
                component={ColorDemoScreen}
                options={{ title: t('navigation.colorDemo') }}
              />
              <Stack.Screen
                name="NFTDetail"
                component={NFTDetailScreen}
                options={({ route }) => ({
                  headerTitle: () => <NavigationTitle title={route.params?.nft?.name || 'NFT'} />,
                })}
              />

              <Stack.Screen
                name="SendTokens"
                component={SendTokensScreen}
                options={{
                  headerTitle: () => <NavigationTitle title={t('navigation.sending')} />,
                }}
              />
              <Stack.Screen
                name="SendSingleNFT"
                component={SendSingleNFTScreen}
                options={{
                  headerTitle: () => <NavigationTitle title={t('navigation.sending')} />,
                }}
              />
              <Stack.Screen
                name="SendMultipleNFTs"
                component={SendMultipleNFTsScreen}
                options={{
                  headerTitle: () => <NavigationTitle title={t('navigation.sending')} />,
                }}
              />

              <Stack.Screen
                name="SelectTokens"
                component={SelectTokensScreen}
                options={{
                  headerTitle: () => <NavigationTitle title={t('navigation.selectTokens')} />,
                }}
              />
              <Stack.Screen
                name="NFTList"
                component={NFTListScreen}
                options={{
                  headerTitle: () => <NavigationTitle title={t('navigation.send')} />,
                }}
              />
              <Stack.Screen
                name="SendTo"
                component={SendToScreen}
                options={{
                  headerTitle: () => <NavigationTitle title={t('navigation.sendTo')} />,
                }}
              />
            </Stack.Group>
          </Stack.Navigator>
        </NavigationContainer>
      </View>
    </SafeAreaProvider>
  );
};

export default AppNavigator;
