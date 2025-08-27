import { useSendStore } from '@onflow/frw-stores';
import { type NFTModel, type InitialProps } from '@onflow/frw-types';
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

import NativeFRWBridge from '@/bridge/NativeFRWBridge';
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
  initialProps?: InitialProps;
}

const Stack = createNativeStackNavigator<RootStackParamList>();

const AppNavigator: React.FC<AppNavigatorProps> = props => {
  const { t } = useTranslation();
  const { address, network, initialRoute, initialProps } = props;
  const { isDark } = useTheme();

  // Send store actions
  const {
    setSelectedToken,
    setCurrentStep,
    setTransactionType,
    setFromAccount,
    setSelectedNFTs,
    setToAccount,
    clearTransactionData,
  } = useSendStore();

  // Initialize SendTo flow if requested
  useEffect(() => {
    console.log('🚀 DEBUG: AppNavigator useEffect triggered', {
      screen: initialProps?.screen,
      hasSendToConfig: !!initialProps?.sendToConfig,
      sendToConfig: initialProps?.sendToConfig,
    });

    // Clear any existing transaction state before initializing new flow
    if (initialProps?.screen === 'send-asset') {
      console.log('🚀 DEBUG: Clearing existing send state before initialization');
      clearTransactionData();
    }

    if (initialProps?.screen === 'send-asset') {
      let sendToConfig = initialProps?.sendToConfig;
      if (!sendToConfig) {
        console.log('🚀 DEBUG: No sendToConfig found!');
        return;
      }

      // Parse sendToConfig if it's a JSON string
      if (typeof sendToConfig === 'string') {
        try {
          sendToConfig = JSON.parse(sendToConfig);
          console.log('🚀 DEBUG: Parsed sendToConfig from JSON string', sendToConfig);
        } catch (error) {
          console.error('🚀 ERROR: Failed to parse sendToConfig JSON', error);
          return;
        }
      } else {
        console.log('🚀 DEBUG: Processing sendToConfig object', sendToConfig);
      }

      const initializeFlow = async () => {
        try {
          // 1. First determine transaction type and set assets
          if (sendToConfig.selectedNFTs && Array.isArray(sendToConfig.selectedNFTs)) {
            console.log('🚀 DEBUG: Setting selected NFTs', sendToConfig.selectedNFTs);
            const nftModels = createNFTModelsFromConfig(sendToConfig.selectedNFTs);
            console.log('🚀 DEBUG: Created NFT models', nftModels);
            setSelectedNFTs(nftModels);

            // Set NFT transaction type immediately
            if (sendToConfig.selectedNFTs.length === 1) {
              console.log('🚀 DEBUG: Setting transaction type to single-nft');
              setTransactionType('single-nft');
            } else if (sendToConfig.selectedNFTs.length > 1) {
              console.log('🚀 DEBUG: Setting transaction type to multiple-nfts');
              setTransactionType('multiple-nfts');
            }
          } else if (sendToConfig.selectedToken) {
            console.log('🚀 DEBUG: Setting selected token', sendToConfig.selectedToken);
            const tokenInfo = createTokenModelFromConfig(sendToConfig.selectedToken);
            setSelectedToken(tokenInfo);
            setTransactionType('tokens');
          }

          // 2. Then set from account
          if (sendToConfig.fromAccount) {
            console.log('🚀 DEBUG: Setting from account', sendToConfig.fromAccount);
            const walletAccount = createWalletAccountFromConfig(sendToConfig.fromAccount);
            setFromAccount(walletAccount);
          } else {
            // Fetch current selected account from bridge when no fromAccount is provided
            console.log('🚀 DEBUG: No fromAccount provided, fetching selected account from bridge');
            try {
              const selectedAccount = await NativeFRWBridge.getSelectedAccount();
              console.log('🚀 DEBUG: Setting selected account from bridge', selectedAccount);
              setFromAccount(selectedAccount);
            } catch (error) {
              console.error('Failed to get selected account from bridge:', error);
            }
          }

          // 3. Finally set target address and navigation
          if (sendToConfig.targetAddress) {
            const walletAccount = createWalletAccountFromConfig({
              address: sendToConfig.targetAddress,
              name: sendToConfig.targetAddress,
              emojiInfo: { emoji: '', name: '', color: '' },
            });
            setToAccount(walletAccount);
            setTransactionType('tokens'); // Override to tokens when target is specified
            setCurrentStep('send-tokens');
          } else {
            // Navigate to send-to screen for recipient selection
            // This works for both tokens and NFTs without target address
            setCurrentStep('send-to');
          }
        } catch (error) {
          console.error('Failed to initialize SendTo flow:', error);
        }
      };

      // Execute the initialization
      initializeFlow();
    }
  }, [
    initialProps?.sendToConfig,
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
      background: 'rgb(18, 18, 18)', // --surface-base dark (matches CSS variables)
      card: 'rgb(18, 18, 18)', // --surface-1 dark (matches CSS variables)
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
              headerTitleAlign: 'center',
              headerShadowVisible: false,
              headerShown: true,
              headerRight: () => <ThemeToggle />,
            }}
          >
            <Stack.Group
              screenOptions={{
                headerShown: true,
                headerLeft: () => <NavigationBackButton />,
                headerRight: () => <NavigationCloseButton />,
                headerStyle: {
                  backgroundColor: isDark ? 'rgb(18, 18, 18)' : 'rgb(255, 255, 255)',
                },
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
