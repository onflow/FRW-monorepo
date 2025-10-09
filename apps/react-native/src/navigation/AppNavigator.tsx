import { logger } from '@onflow/frw-context';
import {
  NFTDetailScreen,
  NFTListScreen,
  SelectTokensScreen,
  SendSummaryScreen,
  SendTokensScreen,
  // Onboarding screens
  GetStartedScreen,
  ProfileTypeSelectionScreen,
  RecoveryPhraseScreen,
  ConfirmRecoveryPhraseScreen,
  SecureEnclaveScreen,
  NotificationPreferencesScreen,
  BackupOptionsScreen,
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
  // Onboarding screens
  GetStarted: undefined;
  ProfileTypeSelection: undefined;
  RecoveryPhrase: undefined;
  ConfirmRecoveryPhrase: { recoveryPhrase?: string[] };
  SecureEnclave: undefined;
  NotificationPreferences: undefined;
  BackupOptions: undefined;
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
      const sendToConfigRaw: unknown = (initialProps as any)?.sendToConfig;
      if (!sendToConfigRaw) {
        return;
      }
      try {
        const sendToConfig =
          typeof sendToConfigRaw === 'string' ? JSON.parse(sendToConfigRaw) : sendToConfigRaw;
        logger.debug('SendTo flow initialization started', { sendToConfig });

        if (sendToConfig.fromAccount) {
          logger.debug('Processing fromAccount config', { fromAccount: sendToConfig.fromAccount });
          const walletAccount = createWalletAccountFromConfig(sendToConfig.fromAccount);
          setFromAccount(walletAccount);
          logger.debug('FromAccount set successfully', { walletAccount });
        }

        if (sendToConfig.selectedToken) {
          logger.debug('Processing selectedToken config', {
            selectedToken: sendToConfig.selectedToken,
          });
          // Convert to TokenInfo type
          const tokenInfo = createTokenModelFromConfig(sendToConfig.selectedToken);
          setSelectedToken(tokenInfo);
          setCurrentStep('send-to');
          logger.debug('SelectedToken set and step updated to send-to', { tokenInfo });
        }

        if (sendToConfig.selectedNFTs && Array.isArray(sendToConfig.selectedNFTs)) {
          logger.debug('Processing selectedNFTs config', {
            selectedNFTs: sendToConfig.selectedNFTs,
            count: sendToConfig.selectedNFTs.length,
          });
          // Set selected NFTs if provided
          const nftModels = createNFTModelsFromConfig(sendToConfig.selectedNFTs);
          setSelectedNFTs(nftModels);
          logger.debug('SelectedNFTs set successfully', { nftModels });
        }

        if (sendToConfig.targetAddress) {
          logger.debug('Processing targetAddress config', {
            targetAddress: sendToConfig.targetAddress,
          });
          const walletAccount = createWalletAccountFromConfig({
            address: sendToConfig.targetAddress,
            name: sendToConfig.targetAddress,
            emojiInfo: { emoji: '', name: '', color: '' },
          });
          setToAccount(walletAccount);
          setTransactionType('tokens');
          setCurrentStep('send-tokens');
          logger.debug(
            'TargetAddress processed, transaction type set to tokens and step updated to send-tokens',
            { walletAccount }
          );
        } else if (sendToConfig.selectedNFTs && sendToConfig.selectedNFTs.length >= 1) {
          // Use single navigation for both single and multiple NFTs - the screen will handle the logic
          const transactionType =
            sendToConfig.selectedNFTs.length === 1 ? 'single-nft' : 'multiple-nfts';
          logger.debug('Setting NFT transaction type based on count', {
            nftCount: sendToConfig.selectedNFTs.length,
            transactionType,
          });
          setTransactionType(transactionType);
          setCurrentStep('send-to');
          logger.debug('NFT transaction flow configured and step updated to send-to');
        }

        logger.debug('SendTo flow initialization completed successfully');
      } catch (error) {
        logger.error('Failed to initialize SendTo flow', {
          error,
          sendToConfigJson: sendToConfigRaw,
        });
      }
    }
  }, [
    // note: effect depends on raw value which could be object or string
    (initialProps as any)?.sendToConfig,
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

          {/* Onboarding Screens Group */}
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
              name="GetStarted"
              component={GetStartedScreen}
              options={{
                headerShown: false, // First screen doesn't need header
              }}
            />
            <Stack.Screen
              name="ProfileTypeSelection"
              component={ProfileTypeSelectionScreen}
              options={{
                headerShown: false, // No header for profile type selection
              }}
            />
            <Stack.Screen
              name="RecoveryPhrase"
              component={RecoveryPhraseScreen}
              options={{
                headerTitle: t('onboarding.recoveryPhrase.navTitle'),
              }}
            />
            <Stack.Screen
              name="ConfirmRecoveryPhrase"
              component={ConfirmRecoveryPhraseScreen}
              options={{
                headerTitle: t('onboarding.confirmRecoveryPhrase.navTitle'),
              }}
            />
            <Stack.Screen
              name="SecureEnclave"
              component={SecureEnclaveScreen}
              options={{
                headerTitle: '', // No title text
                headerRight: () => null, // No close button
                headerStyle: {
                  backgroundColor: isDarkMode ? '#000000' : '#FFFFFF', // Use $bg colors
                },
              }}
            />
            <Stack.Screen
              name="NotificationPreferences"
              component={NotificationPreferencesScreen}
              options={{
                headerTitle: t('onboarding.notificationPreferences.headerTitle'),
                headerRight: () => null, // No close button
                headerStyle: {
                  backgroundColor: isDarkMode ? '#000000' : '#FFFFFF', // Use $bg colors
                },
              }}
            />
            <Stack.Screen
              name="BackupOptions"
              component={BackupOptionsScreen}
              options={{
                headerTitle: t('onboarding.backupOptions.navTitle'),
              }}
            />
          </Stack.Group>
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
};

export default AppNavigator;
