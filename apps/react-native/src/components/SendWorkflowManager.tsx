import { useSendStore } from '@onflow/frw-stores';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, View } from 'react-native';

import NativeFRWBridge from '@/bridge/NativeFRWBridge';
import { useConfirmationDrawer } from '@/contexts/ConfirmationDrawerContext';
import {
  SelectTokensScreen,
  SendMultipleNFTsScreen,
  SendSingleNFTScreen,
  SendToScreen,
  SendTokensScreen,
} from '@/screens';
import { Text } from 'ui';

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
  const { fromAccount, toAccount, selectedToken, selectedNFTs, formData, transactionType } =
    useSendStore();

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

  const handleConfirmationRequest = async () => {
    if (!fromAccount || !toAccount) {
      console.error('[SendWorkflowManager] Missing required accounts for confirmation');
      return;
    }

    // Get transaction details from store
    const { getTransactionDetailsForDisplay, executeTransaction } = useSendStore.getState();
    const transactionDetails = getTransactionDetailsForDisplay();

    // Create transaction details content
    const renderTransactionDetails = () => {
      return (
        <View className="w-full p-4 bg-surface-2 rounded-2xl">
          <Text className="text-fg-1 font-semibold text-base mb-2">Transaction Details</Text>
          {transactionDetails.isTokenTransaction && (
            <>
              <View className="flex-row justify-between">
                <Text className="text-fg-2">Amount</Text>
                <Text className="text-fg-1 font-semibold">
                  {transactionDetails.tokenAmount} {transactionDetails.tokenSymbol}
                </Text>
              </View>
              <View className="flex-row justify-between mt-2">
                <Text className="text-fg-2">Token</Text>
                <Text className="text-fg-1 font-semibold">{transactionDetails.tokenName}</Text>
              </View>
            </>
          )}
          {transactionDetails.isNFTTransaction && (
            <View className="flex-row justify-between">
              <Text className="text-fg-2">NFTs</Text>
              <Text className="text-fg-1 font-semibold">{transactionDetails.nftCount} NFT(s)</Text>
            </View>
          )}
          <View className="flex-row justify-between mt-2">
            <Text className="text-fg-2">Network Fee</Text>
            <Text className="text-fg-1 font-semibold">{transactionDetails.networkFee}</Text>
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
          const result = await executeTransaction();
          console.log('[SendWorkflowManager] Transaction result:', result);
          onClose();
          NativeFRWBridge.closeRN();
        } catch (error) {
          console.error('[SendWorkflowManager] Transaction error:', error);
          Alert.alert(t('errors.title'), t('errors.transactionFailed'));
          throw error;
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
