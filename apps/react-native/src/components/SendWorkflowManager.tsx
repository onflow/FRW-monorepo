import React from 'react';
import { View, Alert } from 'react-native';
import {
  SelectTokensScreen,
  SendToScreen,
  SendTokensScreen,
  SendSingleNFTScreen,
  SendMultipleNFTsScreen,
} from '@/screens';
import { Text } from 'ui';
import { useConfirmationDrawer } from '@/contexts/ConfirmationDrawerContext';
import { useSendStore } from '@/stores/sendStore';
import { SendTransaction, isValidSendTransactionPayload } from '@/network/cadence';
import NativeFRWBridge from '@/bridge/NativeFRWBridge';
import { useTranslation } from 'react-i18next';

export type SendWorkflowStep =
  | 'SelectTokens'
  | 'SendTo'
  | 'SendTokens'
  | 'SendSingleNFT'
  | 'SendMultipleNFTs';

interface SendWorkflowManagerProps {
  currentStep: SendWorkflowStep;
  params?: Record<string, unknown>;
  onNavigate: (step: SendWorkflowStep, params?: Record<string, unknown>) => void;
  onClose: () => void;
}

export const SendWorkflowManager: React.FC<SendWorkflowManagerProps> = ({
  currentStep,
  params,
  onNavigate,
  onClose,
}) => {
  const { t } = useTranslation();
  const { openConfirmation } = useConfirmationDrawer();
  const {
    fromAccount,
    toAccount,
    selectedToken,
    selectedNFTs,
    formData,
    transactionType,
    createSendPayload,
    resetSendFlow,
  } = useSendStore();

  // Create a mock navigation object for the screens
  const mockNavigation = {
    navigate: (screenName: string, navParams?: Record<string, unknown>) => {
      if (screenName === 'Confirmation') {
        // Instead of navigating to Confirmation screen, open the confirmation drawer
        handleConfirmationRequest();
      } else {
        onNavigate(screenName as SendWorkflowStep, navParams);
      }
    },
    goBack: () => {
      onClose();
    },
    // Add other navigation methods as needed
  };

  const handleConfirmationRequest = () => {
    if (!fromAccount || !toAccount) {
      console.error('[SendWorkflowManager] Missing required accounts for confirmation');
      return;
    }

    // Create transaction details content based on transaction type
    const renderTransactionDetails = () => {
      const isTokenTransaction = transactionType === 'tokens';
      const isNFTTransaction = ['single-nft', 'multiple-nfts'].includes(transactionType);

      return (
        <View className="w-full p-4 bg-surface-2 rounded-2xl">
          <Text className="text-fg-1 font-semibold text-base mb-2">Transaction Details</Text>
          {isTokenTransaction && selectedToken && (
            <>
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
            </>
          )}
          {isNFTTransaction && selectedNFTs && (
            <View className="flex-row justify-between">
              <Text className="text-fg-2">NFTs</Text>
              <Text className="text-fg-1 font-semibold">{selectedNFTs.length} NFT(s)</Text>
            </View>
          )}
          <View className="flex-row justify-between mt-2">
            <Text className="text-fg-2">Network Fee</Text>
            <Text className="text-fg-1 font-semibold">~0.001 FLOW</Text>
          </View>
        </View>
      );
    };

    openConfirmation({
      fromAccount,
      toAccount,
      transactionType,
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
      selectedNFTs: selectedNFTs
        .filter(nft => nft.id)
        .map(nft => ({
          id: nft.id || '',
          name: nft.name,
          thumbnail: nft.thumbnail,
        })),
      formData,
      onConfirm: async () => {
        try {
          // Create payload using the store
          const payload = await createSendPayload();

          if (!payload) {
            console.error('[SendWorkflowManager] Failed to create payload');
            Alert.alert(t('errors.title'), t('errors.failedToCreateTransaction'));
            throw new Error('Failed to create payload');
          }

          console.log('[SendWorkflowManager] Send payload:', payload);

          if (isValidSendTransactionPayload(payload)) {
            const result = await SendTransaction(payload);
            console.log('[SendWorkflowManager] Transfer result:', result);
            resetSendFlow();
            onClose();
            NativeFRWBridge.closeRN();
          } else {
            console.error('[SendWorkflowManager] Invalid send payload:', payload);
            Alert.alert(t('errors.title'), t('errors.invalidTransaction'));
            throw new Error('Invalid transaction payload');
          }
        } catch (error) {
          console.error('[SendWorkflowManager] Transfer error:', error);
          Alert.alert(t('errors.title'), t('errors.transactionFailed'));
          throw error; // Let the drawer handle the error state
        }
      },
      children: renderTransactionDetails(),
    });
  };

  // Create a mock route object
  const mockRoute = {
    params: params || {},
    name: currentStep,
    key: currentStep,
  };

  const renderCurrentStep = () => {
    // Each screen will receive the mock navigation and route objects
    const screenProps = {
      navigation: mockNavigation as never,
      route: mockRoute as never,
    };

    switch (currentStep) {
      case 'SelectTokens':
        return <SelectTokensScreen {...screenProps} />;
      case 'SendTo':
        return <SendToScreen {...screenProps} />;
      case 'SendTokens':
        return <SendTokensScreen {...screenProps} />;
      case 'SendSingleNFT':
        return <SendSingleNFTScreen {...screenProps} />;
      case 'SendMultipleNFTs':
        return <SendMultipleNFTsScreen {...screenProps} />;
      default:
        return <SelectTokensScreen {...screenProps} />;
    }
  };

  return renderCurrentStep();
};
