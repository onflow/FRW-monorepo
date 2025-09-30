import {
  NFTDetailScreen,
  NFTListScreen,
  SelectTokensScreen,
  SendSummaryScreen,
  SendTokensScreen,
} from '@onflow/frw-screens';
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
import React, { useEffect, useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useColorScheme } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { reactNativeNavigation } from '@/bridge/ReactNativeNavigation';
import { NavigationBackButton } from '@/components/NavigationBackButton';
import { NavigationCloseButton } from '@/components/NavigationCloseButton';
import { HomeScreen } from '@/screens';

import { SendToScreen } from '../screens/SendToScreenWrapper';

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
  SendSummary: undefined;
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
          const walletAccount = createWalletAccountFromConfig(sendToConfig.fromAccount);
          setFromAccount(walletAccount);
        }
        if (sendToConfig.selectedToken) {
          // Convert to TokenInfo type
          const tokenInfo = createTokenModelFromConfig(sendToConfig.selectedToken);
          setSelectedToken(tokenInfo);
          setCurrentStep('send-to');
        }

        if (sendToConfig.selectedNFTs && Array.isArray(sendToConfig.selectedNFTs)) {
          // Set selected NFTs if provided
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
        } else if (sendToConfig.selectedNFTs && sendToConfig.selectedNFTs.length >= 1) {
          // Use single navigation for both single and multiple NFTs - the screen will handle the logic
          setTransactionType(
            sendToConfig.selectedNFTs.length === 1 ? 'single-nft' : 'multiple-nfts'
          );
          setCurrentStep('send-to');
        }
      } catch (error) {
        //  console.error('Failed to initialize SendTo flow:', error);
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

  // Since TamaguiProvider is set to defaultTheme="dark", use that
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';

  // Memoize navigation themes with hardcoded colors
  const navigationThemes = useMemo(() => {
    const customLightTheme = {
      ...DefaultTheme,
      colors: {
        ...DefaultTheme.colors,
        background: '#FFFFFF', // White background for light mode
        card: '#FFFFFF', // Header should be white in light mode (per Figma)
        text: '#000000', // Black text for light mode
        border: '#767676', // Gray border
        primary: '#00EF8B', // Flow brand green
      },
    };

    const customDarkTheme = {
      ...DarkTheme,
      colors: {
        ...DarkTheme.colors,
        background: '#121212', // surfaceDarkDrawer color for dark mode
        card: '#121212', // Use surfaceDarkDrawer for header background consistency
        text: '#FFFFFF', // White text for dark mode
        border: '#B3B3B3', // Light gray border
        primary: '#00EF8B', // Flow brand green
      },
    };

    return { customLightTheme, customDarkTheme };
  }, []);

  // Use the current theme based on dark mode state
  const currentTheme = isDarkMode
    ? navigationThemes.customDarkTheme
    : navigationThemes.customLightTheme;

  return (
    <SafeAreaProvider>
      <NavigationContainer ref={navigationRef} theme={currentTheme}>
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
              headerBackTitle: '', // Ensure no back title text
              headerBackTitleStyle: { fontSize: 0 }, // Additional fallback
              headerBackVisible: false, // Hide default back button
              headerLeft: () => <NavigationBackButton />,
              headerRight: () => <NavigationCloseButton />,
            }}
          >
            <Stack.Screen
              name="SelectTokens"
              component={SelectTokensScreen}
              options={{
                headerTitle: t('navigation.send'),
              }}
            />
            <Stack.Screen
              name="NFTList"
              component={NFTListScreen}
              options={{
                headerTitle: t('navigation.send'),
              }}
            />
            <Stack.Screen
              name="NFTDetail"
              component={NFTDetailScreen}
              options={{
                headerTitle: t('navigation.nftDetails'),
              }}
            />
            <Stack.Screen
              name="SendTo"
              component={SendToScreen}
              options={{
                headerTitle: t('navigation.sendTo'),
              }}
            />
            <Stack.Screen
              name="SendTokens"
              component={SendTokensScreen}
              options={{
                headerTitle: t('navigation.sendTokens'),
              }}
            />
            <Stack.Screen
              name="SendSummary"
              component={SendSummaryScreen}
              options={{
                headerTitle: t('navigation.sending'),
              }}
            />
          </Stack.Group>
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
};

export default AppNavigator;
