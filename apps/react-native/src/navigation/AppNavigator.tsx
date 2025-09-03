import { SelectTokensScreen, SendToScreen, SendTokensScreen } from '@onflow/frw-screens';
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
import React, { useEffect, useRef, useMemo } from 'react';
// import { useTranslation } from 'react-i18next';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useTheme } from 'tamagui';

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

  // Get theme from Tamagui
  const theme = useTheme();

  // Memoize navigation themes to avoid unnecessary re-renders
  const navigationThemes = useMemo(() => {
    const customLightTheme = {
      ...DefaultTheme,
      colors: {
        ...DefaultTheme.colors,
        background: theme.background?.val || '#FFFFFF',
        card: theme.bg2?.val || '#F2F2F7',
        text: theme.text?.val || '#000000',
        border: theme.border?.val || '#767676',
        primary: theme.primary?.val || '#00EF8B',
      },
    };

    const customDarkTheme = {
      ...DarkTheme,
      colors: {
        ...DarkTheme.colors,
        background: theme.background?.val || '#121212',
        card: theme.bg2?.val || '#1A1A1A', 
        text: theme.text?.val || '#FFFFFF',
        border: theme.border?.val || '#B3B3B3',
        primary: theme.primary?.val || '#00EF8B',
      },
    };

    return { customLightTheme, customDarkTheme };
  }, [theme]);

  // Determine if we're in dark mode based on background color
  const isDarkMode = theme.background?.val === '#121212';
  const currentTheme = isDarkMode ? navigationThemes.customDarkTheme : navigationThemes.customLightTheme;

  return (
    <SafeAreaProvider>
      {/* <View className={isDark ? 'dark' : ''} style={{ flex: 1 }}> */}
      <NavigationContainer 
        ref={navigationRef} 
        theme={currentTheme}
      >
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
              headerBackTitleVisible: false, // Hide the "Back" text next to chevron
              headerBackTitle: '', // Ensure no back title text
              headerBackTitleStyle: { fontSize: 0 }, // Additional fallback
              // headerLeft: () => <NavigationBackButton />,
              // headerRight: () => <NavigationCloseButton />,
            }}
          >
            <Stack.Screen
              name="SelectTokens"
              component={SelectTokensScreen}
              options={{
                headerTitle: 'Select Tokens',
              }}
            />
            <Stack.Screen
              name="SendTo"
              component={SendToScreen}
              options={{
                headerTitle: 'Send To',
              }}
            />
            <Stack.Screen
              name="SendTokens"
              component={SendTokensScreen}
              options={{
                headerTitle: 'Send Tokens',
              }}
            />
          </Stack.Group>
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
};

export default AppNavigator;
