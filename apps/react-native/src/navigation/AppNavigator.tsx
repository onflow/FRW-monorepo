import { logger } from '@onflow/frw-context';
import {
  NFTDetailScreen,
  NFTListScreen,
  SelectTokensScreen,
  SendSummaryScreen,
  SendTokensScreen,
  MigrationScreen,
  InfoScreen,
  type MigrationScreenProps,
  // Key rotation screens
  KeyRotationTipScreen,
  KeyRotationMnemonicScreen,
  SendToScreen,
  ReceiveScreen,
  // Activity screens
  ActivityScreen,
  ActivityDetailScreen,
  // Token screens
  AddTokensScreen,
  ClaimTokensScreen,
  ClaimTokenDetailScreen,
  // NFT screens
  AddNFTCollectionScreen,
  ClaimNFTDetailScreen,
  type ClaimItem,
  type ClaimSender,
  // Onboarding screens
  GetStartedScreen,
  ProfileTypeSelectionScreen,
  RecoveryPhraseScreen,
  ConfirmRecoveryPhraseScreen,
  SecureEnclaveScreen,
  NotificationPreferencesScreen,
  // Recovery screens
  ImportProfileScreen,
  ImportOtherMethodsScreen,
  ConfirmImportProfileScreen,
  KeystoreMigrationTipScreen,
} from '@onflow/frw-screens';
import { useSendStore } from '@onflow/frw-stores';
import {
  createNFTModelsFromConfig,
  createTokenModelFromConfig,
  createWalletAccountFromConfig,
  type ActivityItem,
  type InitialProps,
  type NewKeyInfo,
  type NFTModel,
} from '@onflow/frw-types';
import { useTheme } from '@onflow/frw-ui';
import { DarkTheme, DefaultTheme, NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React, { useEffect, useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useColorScheme } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { platform } from '@/bridge/PlatformImpl';
import { reactNativeNavigation } from '@/bridge/ReactNativeNavigation';
import { NavigationBackButton } from '@/components/NavigationBackButton';
import { NavigationCloseButton } from '@/components/NavigationCloseButton';
import { HomeScreen } from '@/screens';
// import { ErrorHandlingTest } from '@/screens/ErrorHandlingTest'; // For testing error handling

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
  Receive: undefined;
  Activity: undefined;
  ActivityDetail: { item: ActivityItem };
  AddTokens: undefined;
  AddNFTCollection: undefined;
  ClaimTokens: { initialTab?: 'token' | 'nft' } | undefined;
  ClaimTokenDetail: { item: ClaimItem; sender?: ClaimSender };
  ClaimNFTDetail: { item: ClaimItem; sender?: ClaimSender };
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
  ConfirmRecoveryPhrase: {
    mnemonic: string;
    accountKey: {
      publicKey: string;
      signAlgo: number;
      hashAlgo: number;
    };
  };
  SecureEnclave: undefined;
  NotificationPreferences: {
    accountType?: string;
  };
  // Recovery screens
  ImportProfile: undefined;
  ImportOtherMethods: undefined;
  ConfirmImportProfile: undefined;
  // Key rotation screens
  KeyRotationTip: undefined;
  KeyRotationMnemonic: {
    newKeyInfo: NewKeyInfo;
  };
  KeystoreMigrationTip: undefined;
  // Migration screens
  MigrationInfo: undefined;
  Migration: MigrationScreenProps | undefined;
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
  const theme = useTheme();
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
          setTransactionType('tokens');
          setSelectedNFTs([]);
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

  // Memoize navigation themes using Tamagui theme values
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
        background: theme.background.val, // Use Tamagui background color
        card: theme.background.val, // Use Tamagui background color for header
        text: theme.text.val, // Use Tamagui text color
        border: '#B3B3B3', // Light gray border
        primary: theme.primary.val, // Use Tamagui primary color
      },
    };

    return { customLightTheme, customDarkTheme };
  }, [theme]);

  // Use the current theme based on dark mode state
  const currentTheme = isDarkMode
    ? navigationThemes.customDarkTheme
    : navigationThemes.customLightTheme;

  const normalizedInitialRoute =
    initialRoute === 'Migration'
      ? 'MigrationInfo'
      : (initialRoute as keyof RootStackParamList) || 'Home';

  return (
    <SafeAreaProvider>
      <NavigationContainer ref={navigationRef} theme={currentTheme}>
        <Stack.Navigator
          initialRouteName={normalizedInitialRoute}
          screenOptions={{
            headerTitleAlign: 'center',
            headerShadowVisible: false,
            headerShown: true,
          }}
        >
          <Stack.Screen name="Home" component={HomeScreen} initialParams={{ address, network }} />

          {/* Send Workflow Screens Group */}
          <Stack.Group
            screenOptions={{
              headerShown: true,
              headerBackTitle: '', // Ensure no back title text
              headerBackTitleStyle: { fontSize: 0 }, // Additional fallback
              headerBackVisible: false, // Hide default back button
              headerLeft: () => <NavigationBackButton />,
              headerRight: () => <NavigationCloseButton />,
              headerStyle: { backgroundColor: theme.bgDrawer.val },
            }}
          >
            <Stack.Screen
              name="SelectTokens"
              component={SelectTokensScreen}
              // component={ErrorHandlingTest} // Uncomment for testing error handling
              options={{
                headerTitle: t('navigation.selectTokens'),
                headerLeft: () => null,
                // headerTitle: 'Error Test', // Use with ErrorHandlingTest
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
            <Stack.Screen
              name="Receive"
              component={ReceiveScreen}
              options={{
                headerTitle: t('navigation.receive'),
              }}
            />
            <Stack.Screen
              name="AddTokens"
              options={{
                headerTitle: t('navigation.addTokens', 'Add Tokens'),
                headerStyle: { backgroundColor: theme.bg.val },
              }}
            >
              {({ navigation: nav }) => (
                <AddTokensScreen onClaimPress={() => nav.navigate('ClaimTokens')} />
              )}
            </Stack.Screen>
            <Stack.Screen
              name="AddNFTCollection"
              options={{
                headerTitle: t('navigation.addNFTCollection', 'Add Collection'),
                headerStyle: { backgroundColor: theme.bg.val },
              }}
            >
              {({ navigation: nav }) => (
                <AddNFTCollectionScreen
                  onClaimPress={() => nav.navigate('ClaimTokens', { initialTab: 'nft' })}
                />
              )}
            </Stack.Screen>
            <Stack.Screen
              name="ClaimTokens"
              options={{
                headerTitle: t('navigation.claimTokens', 'Claim'),
                headerStyle: { backgroundColor: theme.bg.val },
              }}
            >
              {({ route, navigation: nav }) => (
                <ClaimTokensScreen
                  initialTab={route.params?.initialTab}
                  onItemPress={item =>
                    item.type === 'nft'
                      ? nav.navigate('ClaimNFTDetail', { item })
                      : nav.navigate('ClaimTokenDetail', { item })
                  }
                />
              )}
            </Stack.Screen>
            <Stack.Screen
              name="ClaimTokenDetail"
              options={{
                headerTitle: t('navigation.token', 'Token'),
                headerStyle: { backgroundColor: theme.bg.val },
              }}
            >
              {({ route, navigation: nav }) => (
                <ClaimTokenDetailScreen
                  item={route.params.item}
                  sender={route.params.sender}
                  onClaim={() => nav.goBack()}
                  onReject={() => nav.goBack()}
                />
              )}
            </Stack.Screen>
            <Stack.Screen
              name="ClaimNFTDetail"
              options={{
                headerTitle: t('navigation.nftCollection', 'Collection'),
                headerStyle: { backgroundColor: theme.bg.val },
              }}
            >
              {({ route, navigation: nav }) => (
                <ClaimNFTDetailScreen
                  item={route.params.item}
                  sender={route.params.sender}
                  onClaim={() => nav.goBack()}
                  onReject={() => nav.goBack()}
                />
              )}
            </Stack.Screen>
            <Stack.Screen
              name="Activity"
              options={{
                headerShown: false, // No header for embedded tab view
              }}
            >
              {({ navigation: nav }) => (
                <ActivityScreen
                  onActivityPress={item => nav.navigate('ActivityDetail', { item })}
                />
              )}
            </Stack.Screen>
            <Stack.Screen
              name="ActivityDetail"
              options={({ route }) => {
                // Determine header title based on transaction type
                const { item } = route.params;
                let headerTitle = t('activity.detail.title', 'Details');
                if (item.type === 'interaction') {
                  headerTitle = t('activity.detail.appInteraction', 'App Interaction');
                } else if (item.transferType === 'sent') {
                  headerTitle = t('activity.sent', 'Sent');
                } else if (item.transferType === 'received') {
                  headerTitle = t('activity.received', 'Received');
                }
                return {
                  headerTitle,
                  headerRight: () => null,
                  headerStyle: { backgroundColor: isDarkMode ? '#000000' : '#FFFFFF' },
                };
              }}
            >
              {({ route }) => <ActivityDetailScreen item={route.params.item} />}
            </Stack.Screen>
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
                headerTitle: '', // Empty title, show back button only
                headerRight: () => null, // No close button
                headerTransparent: true, // Transparent header for background image
                headerStyle: {
                  backgroundColor: 'transparent',
                },
              }}
            />
            <Stack.Screen
              name="RecoveryPhrase"
              component={RecoveryPhraseScreen}
              options={{
                headerTitle: t('onboarding.recoveryPhrase.navTitle'),
                headerRight: () => null, // No close button
                gestureEnabled: false, // Disable swipe-back to prevent state corruption
                headerStyle: {
                  backgroundColor: theme.bg.val,
                },
              }}
            />
            <Stack.Screen
              name="ConfirmRecoveryPhrase"
              component={ConfirmRecoveryPhraseScreen}
              options={{
                headerTitle: t('onboarding.confirmRecoveryPhrase.navTitle'),
                headerRight: () => null, // No close button
                gestureEnabled: false, // Disable swipe-back to prevent state corruption
                headerStyle: {
                  backgroundColor: theme.bg.val,
                },
              }}
            />
            <Stack.Screen
              name="SecureEnclave"
              component={SecureEnclaveScreen}
              options={{
                headerTitle: '', // No title text
                headerRight: () => null, // No close button
                gestureEnabled: false, // Disable swipe-back to prevent state corruption
                headerStyle: {
                  backgroundColor: theme.bg.val,
                },
              }}
            />
            <Stack.Screen
              name="NotificationPreferences"
              component={NotificationPreferencesScreen}
              options={{
                headerShown: false,
                gestureEnabled: false,
                headerStyle: {
                  backgroundColor: theme.bg.val,
                },
              }}
            />
          </Stack.Group>

          {/* Migration screens */}
          <Stack.Group
            screenOptions={{
              headerShown: true,
              headerBackTitle: '',
              headerBackTitleStyle: { fontSize: 0 },
              headerBackVisible: false,
              headerLeft: () => <NavigationBackButton />,
              headerRight: () => <NavigationCloseButton />,
              headerStyle: { backgroundColor: theme.bgDrawer.val },
            }}
          >
            <Stack.Screen
              name="MigrationInfo"
              options={{
                headerTitle: '',
              }}
            >
              {({ navigation: nav }) => (
                <InfoScreen
                  onStartMigration={async () => {
                    let sourceAccount: MigrationScreenProps['sourceAccount'] | undefined;
                    let destinationAccount: MigrationScreenProps['destinationAccount'] | undefined;
                    try {
                      const selectedAccount = await platform.getSelectedAccount();
                      const sourceAddress = selectedAccount?.address;
                      sourceAccount =
                        selectedAccount && sourceAddress
                          ? {
                              name: selectedAccount.name || sourceAddress,
                              address: sourceAddress,
                              avatar: selectedAccount.avatar,
                            }
                          : undefined;

                      if (!sourceAddress) {
                        logger.warn('[MigrationInfo] No source address available');
                        return;
                      }

                      const { accounts } = await platform.getWalletAccounts();
                      const parentAddress =
                        selectedAccount?.parentAddress || selectedAccount?.address || '';
                      const eoaAccount =
                        accounts.find(
                          account =>
                            account.type === 'eoa' &&
                            (account.parentAddress === parentAddress ||
                              (!account.parentAddress && !parentAddress))
                        ) ?? accounts.find(account => account.type === 'eoa');
                      destinationAccount = eoaAccount
                        ? {
                            name: eoaAccount.name || eoaAccount.address,
                            address: eoaAccount.address,
                            avatar: eoaAccount.avatar,
                          }
                        : undefined;

                      const assets = await platform.getMigrationAssets(sourceAddress);
                      nav.navigate('Migration', {
                        initialStage: 'ready',
                        assets,
                        sourceAccount,
                        destinationAccount,
                      });
                    } catch (error) {
                      logger.error('[MigrationInfo] Failed to fetch migration assets', error);
                      nav.navigate('Migration', {
                        initialStage: 'ready',
                        sourceAccount,
                        destinationAccount,
                      });
                    }
                  }}
                />
              )}
            </Stack.Screen>
            <Stack.Screen
              name="Migration"
              options={{
                headerTitle: '',
              }}
            >
              {({ route }) => <MigrationScreen {...(route.params ?? {})} />}
            </Stack.Screen>
          </Stack.Group>

          {/* Recovery screens with headers */}
          <Stack.Group
            screenOptions={{
              headerShown: true,
              headerBackTitle: '',
              headerBackTitleStyle: { fontSize: 0 },
              headerBackVisible: false,
              headerLeft: () => <NavigationBackButton />,
            }}
          >
            <Stack.Screen
              name="ImportProfile"
              component={ImportProfileScreen}
              options={{
                headerTitle: '',
              }}
            />
            <Stack.Screen
              name="ImportOtherMethods"
              component={ImportOtherMethodsScreen}
              options={{
                headerTitle: t('onboarding.importProfile.title'),
              }}
            />
            <Stack.Screen
              name="ConfirmImportProfile"
              component={ConfirmImportProfileScreen}
              options={{
                headerTitle: t('onboarding.importProfile.title'),
              }}
            />
          </Stack.Group>

          {/* Blocto key rotation screens */}
          <Stack.Group
            screenOptions={{
              headerShown: true,
              headerBackTitle: '',
              headerBackTitleStyle: { fontSize: 0 },
              headerBackVisible: false,
              headerLeft: () => <NavigationBackButton />,
            }}
          >
            <Stack.Screen
              name="KeyRotationTip"
              options={{
                headerTitle: '',
                headerLeft: () => null,
                headerStyle: {
                  backgroundColor: theme.bg.val,
                },
              }}
            >
              {({ navigation: nav }) => (
                <KeyRotationTipScreen
                  onContinue={newKeyInfo => {
                    logger.info(
                      '[KeyRotationTipScreen] Continue pressed - navigating to KeyRotationMnemonic'
                    );
                    nav.navigate('KeyRotationMnemonic', { newKeyInfo });
                  }}
                  onSkip={() => {
                    logger.info('[KeyRotationTipScreen] Skip pressed');
                    platform.closeRN();
                  }}
                />
              )}
            </Stack.Screen>
            <Stack.Screen
              name="KeyRotationMnemonic"
              options={{
                headerTitle: t('backup.mnemonic.navTitle', { defaultValue: 'Recovery Phrase' }),
                headerStyle: {
                  backgroundColor: theme.bg.val,
                },
              }}
            >
              {({ route, navigation: nav }) => (
                <KeyRotationMnemonicScreen
                  newKeyInfo={route.params.newKeyInfo}
                  address={address ?? ''}
                  onComplete={() => {
                    logger.info('[KeyRotationMnemonicScreen] Backup complete');
                    platform.closeRN();
                  }}
                  onBack={() => nav.goBack()}
                />
              )}
            </Stack.Screen>
            <Stack.Screen
              name="KeystoreMigrationTip"
              options={{
                headerTitle: '',
                headerLeft: () => null,
                headerStyle: {
                  backgroundColor: theme.bg.val,
                },
              }}
            >
              {() => (
                <KeystoreMigrationTipScreen
                  onContinue={async () => {
                    await platform.keystoreMigration();
                  }}
                  onSkip={() => {
                    platform.closeRN();
                  }}
                />
              )}
            </Stack.Screen>
          </Stack.Group>
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
};

export default AppNavigator;
