import { sendSelectors, useSendStore, useTokenStore } from '@onflow/frw-stores';
import { type TokenModel, type WalletAccount } from '@onflow/frw-types';
import { useNavigation } from '@react-navigation/native';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { SafeAreaView, ScrollView, StatusBar, View } from 'react-native';

import NativeFRWBridge from '@/bridge/NativeFRWBridge';
import { useConfirmationDrawer } from '@/contexts/ConfirmationDrawerContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useAccountCompatibilityModal } from '@/lib';
import {
  AccountCompatibilityModal,
  StorageWarning,
  Text,
  ToAccountSection,
  TokenSelectorModal,
  TransactionFeeSection,
} from 'ui';

// Import shared components
import { TokenAmountInput } from './components/TokenAmountInput';
import { AccountCard } from '../shared/components/AccountCard';
import { ContentContainer } from '../shared/components/ContentContainer';
import { DownArrowButton } from '../shared/components/DownArrowButton';
import { SectionDivider } from '../shared/components/SectionDivider';
import { SendButton } from '../shared/components/SendButton';

// Import local token-specific components

// Types

const SendTokensScreen = () => {
  const { t } = useTranslation();
  const { isDark } = useTheme();
  const navigation = useNavigation();
  const { openConfirmation } = useConfirmationDrawer();

  // Get data from send store
  const selectedToken = useSendStore(sendSelectors.selectedToken);
  const storeFromAccount = useSendStore(sendSelectors.fromAccount);
  const storeToAccount = useSendStore(sendSelectors.toAccount);

  // Use local state for account data to avoid circular dependencies
  const [, setFromAccountData] = useState({
    balance: '0 FLOW',
    nftCountDisplay: '0 NFTs',
  });

  const [, setToAccountData] = useState({
    balance: '0 FLOW',
    nftCountDisplay: '0 NFTs',
  });

  // Load account data when accounts change
  const loadAccountData = useCallback(
    async (address: string, setter: any, accountType?: string) => {
      if (!address) return;

      try {
        // Get the current token store state once
        const tokenStore = useTokenStore.getState();
        const result = await tokenStore.getAccountBalance(address, accountType);

        // Only update state if component is still mounted
        setter((prev: any) => {
          if (prev.balance !== result.balance || prev.nftCountDisplay !== result.nftCountDisplay) {
            return {
              balance: result.balance,
              nftCountDisplay: result.nftCountDisplay,
            };
          }
          return prev;
        });
      } catch (error) {
        console.error(`Error loading account data for ${address}:`, error);
        setter((prev: any) => {
          if (prev.balance !== '0 FLOW' || prev.nftCountDisplay !== '0 NFTs') {
            return { balance: '0 FLOW', nftCountDisplay: '0 NFTs' };
          }
          return prev;
        });
      }
    },
    []
  );

  // Initialize account data when accounts change
  useEffect(() => {
    if (storeFromAccount?.address) {
      loadAccountData(
        storeFromAccount.address,
        setFromAccountData,
        (storeFromAccount as any)?.type
      );
    }
  }, [storeFromAccount?.address, (storeFromAccount as any)?.type, loadAccountData]);

  useEffect(() => {
    if (storeToAccount?.address) {
      loadAccountData(storeToAccount.address, setToAccountData, (storeToAccount as any)?.type);
    }
  }, [storeToAccount?.address, (storeToAccount as any)?.type, loadAccountData]);

  // Helper function to round balance to reasonable decimal places

  const fromAccount: WalletAccount | null = storeFromAccount;

  const toAccount: WalletAccount | null = storeToAccount;
  const formData = useSendStore(sendSelectors.formData);
  const { updateFormData, setCurrentStep, setSelectedToken } = useSendStore();

  // Local state for UI - account compatibility should be determined by UI logic, not account properties
  const [isAccountIncompatible] = useState(false);
  const { isModalVisible, openModal, closeModal } = useAccountCompatibilityModal();
  const [isTokenSelectorVisible, setIsTokenSelectorVisible] = useState(false);

  // Update current step when screen loads
  useEffect(() => {
    setCurrentStep('send-tokens');
  }, []);

  // Account compatibility should be determined by UI logic based on transaction requirements
  // No longer reading from account.isIncompatible since it's not part of WalletAccount interface

  // Get actual USD rate from selected token
  const getTokenToUsdRate = () => {
    if (!selectedToken?.priceInUSD) return 0;
    const price = parseFloat(selectedToken.priceInUSD);
    return isNaN(price) ? 0 : price;
  };

  const tokenToUsdRate = getTokenToUsdRate();

  // Handle amount input with validation and conversion
  const handleAmountChange = (text: string) => {
    // Remove any non-numeric characters except decimal point
    const cleanedText = text.replace(/[^0-9.]/g, '');

    // Ensure only one decimal point
    const parts = cleanedText.split('.');
    if (parts.length > 2) {
      return; // Don't update if more than one decimal point
    }

    // Limit decimal places to 8 for tokens, 2 for fiat
    const maxDecimals = formData.isTokenMode ? 8 : 2;
    if (parts[1] && parts[1].length > maxDecimals) {
      return;
    }

    // Get available balance for validation
    const getAvailableBalance = () => {
      if (!selectedToken?.balance) return 0;
      const balanceString = selectedToken.balance.toString();
      const numericBalance = balanceString.replace(/[^0-9.]/g, '');
      return parseFloat(numericBalance) || 0;
    };

    const availableBalance = getAvailableBalance();
    const inputValue = parseFloat(cleanedText) || 0;

    if (formData.isTokenMode) {
      // Validate token amount doesn't exceed balance
      if (inputValue > availableBalance) {
        return; // Don't allow amounts greater than balance
      }

      // Convert to fiat
      updateFormData({
        tokenAmount: cleanedText,
        fiatAmount: tokenToUsdRate > 0 ? (inputValue * tokenToUsdRate).toFixed(2) : '0.00',
      });
    } else {
      // Convert to token amount and validate
      const tokenAmount = tokenToUsdRate > 0 ? inputValue / tokenToUsdRate : 0;

      // Validate converted token amount doesn't exceed balance
      if (tokenAmount > availableBalance) {
        return; // Don't allow amounts that would exceed balance
      }

      updateFormData({
        fiatAmount: cleanedText,
        tokenAmount: tokenAmount.toFixed(8).replace(/\.?0+$/, ''),
      });
    }
  };

  // Toggle between token and fiat input modes
  const toggleInputMode = () => {
    updateFormData({ isTokenMode: !formData.isTokenMode });
  };

  // Handle token selection from modal
  const handleTokenSelection = (token: TokenModel) => {
    setSelectedToken(token);
    setIsTokenSelectorVisible(false);

    // Reset amounts when token changes
    updateFormData({
      tokenAmount: '',
      fiatAmount: '',
    });
  };

  // Handle MAX button press - set amount to maximum available balance
  const handleMaxPress = () => {
    if (selectedToken?.balance) {
      // Extract numeric value from balance string (e.g., "550.66 FLOW" -> "550.66")
      const balanceString = selectedToken.balance.toString();
      const numericBalance = balanceString.replace(/[^0-9.]/g, '');

      // Limit to 8 decimal places to match input validation
      const limitedBalance = parseFloat(numericBalance)
        .toFixed(8)
        .replace(/\.?0+$/, '');

      if (formData.isTokenMode) {
        // Set token amount to max balance (limited to 8 decimals)
        updateFormData({
          tokenAmount: limitedBalance,
          fiatAmount:
            tokenToUsdRate > 0 ? (parseFloat(limitedBalance) * tokenToUsdRate).toFixed(2) : '0.00',
        });
      } else {
        // Set fiat amount to max USD value
        const maxUsdValue =
          tokenToUsdRate > 0 ? (parseFloat(limitedBalance) * tokenToUsdRate).toFixed(2) : '0.00';
        updateFormData({
          fiatAmount: maxUsdValue,
          tokenAmount: limitedBalance,
        });
      }
    }
  };

  return (
    <View className={isDark ? 'dark' : ''} style={{ flex: 1 }}>
      <SafeAreaView className="flex-1 bg-surface-base">
        <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

        {/* Main Content */}
        <View className={`flex-1 ${isDark ? 'bg-surface-1' : 'bg-white'} pt-4`}>
          <ScrollView className="flex-1 px-5 pt-2">
            {/* Main Content Container - From Account and Send Tokens */}
            <ContentContainer>
              <View className="gap-3">
                {/* From Account Section */}
                {fromAccount && (
                  <AccountCard account={fromAccount} title={t('labels.fromAccount')} />
                )}

                {/* Divider */}
                <SectionDivider />

                {/* Send Tokens Section */}
                <TokenAmountInput
                  selectedToken={selectedToken}
                  formData={formData}
                  onAmountChange={handleAmountChange}
                  onToggleInputMode={toggleInputMode}
                  onTokenSelectorPress={() => setIsTokenSelectorVisible(true)}
                  onMaxPress={handleMaxPress}
                  tokenToUsdRate={tokenToUsdRate}
                />
              </View>
            </ContentContainer>

            {/* Enhanced Down Arrow Button */}
            <DownArrowButton />

            {/* To Account Container - Separate container */}
            {toAccount && (
              <ContentContainer>
                <ToAccountSection
                  account={toAccount}
                  isAccountIncompatible={isAccountIncompatible}
                  onEditPress={() => {
                    // Replace current screen with SendTo to avoid stacking
                    (navigation as any).navigate(
                      'SendTo',
                      {
                        selectedToken: selectedToken,
                      },
                      {
                        pop: true,
                      }
                    );
                  }}
                  onLearnMorePress={openModal}
                />
              </ContentContainer>
            )}

            {/* Transaction Fee Section */}
            <TransactionFeeSection transactionFee={formData.transactionFee} />

            {/* Storage Warning */}
            <View className="mt-6">
              <StorageWarning />
            </View>
          </ScrollView>

          {/* Send Button */}
          <SendButton
            isAccountIncompatible={
              isAccountIncompatible || parseFloat(formData.tokenAmount || '0') === 0
            }
            onPress={() => {
              const tokenAmount = parseFloat(formData.tokenAmount || '0');
              if (!isAccountIncompatible && tokenAmount > 0) {
                // Ensure store has correct transaction type and navigate to confirmation
                console.log('[SendTokensScreen] Navigating to confirmation', {
                  hasSelectedToken: !!selectedToken,
                  amount: formData.tokenAmount,
                  transactionType: 'tokens',
                });

                // Open confirmation drawer instead of navigating to full screen
                if (storeFromAccount && storeToAccount) {
                  openConfirmation({
                    fromAccount: storeFromAccount,
                    toAccount: storeToAccount,
                    transactionType: 'tokens',
                    selectedToken: selectedToken
                      ? {
                          symbol: selectedToken.symbol,
                          name: selectedToken.name,
                          logoURI: selectedToken.logoURI,
                          identifier: selectedToken.identifier,
                          decimal: selectedToken.decimal,
                          contractAddress: selectedToken.contractAddress,
                        }
                      : undefined,
                    formData,
                    onConfirm: async () => {
                      // Execute transaction using store method
                      const { executeTransaction } = useSendStore.getState();
                      const result = await executeTransaction();
                      console.log('[SendTokensScreen] Transaction result:', result);
                      NativeFRWBridge.closeRN();
                    },
                    children: selectedToken ? (
                      <View className="w-full p-4 bg-surface-2 rounded-2xl">
                        <Text className="text-fg-1 font-semibold text-base mb-2">
                          Transaction Details
                        </Text>
                        <View className="flex-row justify-between">
                          <Text className="text-fg-2">Amount</Text>
                          <Text className="text-fg-1 font-semibold">
                            {formData.tokenAmount} {selectedToken.symbol}
                          </Text>
                        </View>
                        <View className="flex-row justify-between mt-2">
                          <Text className="text-fg-2">Token</Text>
                          <Text className="text-fg-1 font-semibold">{selectedToken.name}</Text>
                        </View>
                        <View className="flex-row justify-between mt-2">
                          <Text className="text-fg-2">Network Fee</Text>
                          <Text className="text-fg-1 font-semibold">~0.001 FLOW</Text>
                        </View>
                      </View>
                    ) : null,
                  });
                }
              }
            }}
          />
        </View>
      </SafeAreaView>

      {/* Account Compatibility Modal */}
      <AccountCompatibilityModal visible={isModalVisible} onClose={closeModal} />

      {/* Token Selector Modal */}
      <TokenSelectorModal
        visible={isTokenSelectorVisible}
        onClose={() => setIsTokenSelectorVisible(false)}
        onTokenSelect={handleTokenSelection}
        selectedToken={selectedToken}
      />
    </View>
  );
};

export default SendTokensScreen;
