import type { WalletAccount } from '@onflow/frw-types';
import React, { type ReactNode } from 'react';
import { SafeAreaView, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import ConfirmDialogBg from '@/assets/icons/send/ConfirmDialogBg';
import {
  AccountTransferDisplay,
  HoldToSendButton,
  TransactionDetailsCard,
  ConfirmationHeader,
} from '@/screens/Send/Confirmation/components';

interface Token {
  symbol?: string;
  name?: string;
  logoURI?: string;
  identifier?: string;
  decimal?: number;
  contractAddress?: string;
}

interface NFT {
  id: string | number;
  name?: string;
  thumbnail?: string | object;
}

interface FormData {
  tokenAmount: string;
  fiatAmount: string;
}

interface ConfirmationDrawerContentProps {
  fromAccount: WalletAccount;
  toAccount: WalletAccount;
  transactionType?: string;
  selectedToken?: Token;
  selectedNFTs?: NFT[];
  formData?: FormData;
  children?: ReactNode;
  onGoBack?: () => void;
  onClose?: () => void;
  onConfirm?: () => Promise<void>;
  isProcessing?: boolean;
}

export const ConfirmationDrawerContent: React.FC<ConfirmationDrawerContentProps> = ({
  fromAccount,
  toAccount,
  transactionType,
  selectedToken,
  selectedNFTs,
  formData,
  onGoBack,
  onClose,
  onConfirm,
}) => {
  const insets = useSafeAreaInsets();
  const handleGoBack = () => {
    onGoBack?.();
  };

  const handleClose = () => {
    onClose?.();
  };

  const handleConfirm = async () => {
    if (onConfirm) {
      await onConfirm();
    }
  };

  // Provide default values to prevent crashes
  const safeFormData = formData || { tokenAmount: '0', fiatAmount: '0' };

  return (
    <SafeAreaView className="flex-1">
      <View className="flex-1">
        {/* Background SVG - positioned at the top and bottom layer */}
        <View className="absolute top-0 left-0 right-0 -z-10 aspect-square">
          <ConfirmDialogBg width="100%" height="100%" />
        </View>

        {/* Custom Rounded Header */}
        <ConfirmationHeader onGoBack={handleGoBack} onClose={handleClose} />

        {/* Main Content */}
        <View className="flex-1">
          {/* Scrollable Content */}
          <ScrollView
            className="flex-1 px-5 pt-2"
            contentContainerStyle={{
              alignItems: 'center',
              gap: 24,
              paddingBottom: 20,
            }}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Account Transfer Display */}
            <AccountTransferDisplay fromAccount={fromAccount} toAccount={toAccount} />

            {/* Transaction Details Card */}
            <TransactionDetailsCard
              transactionType={
                transactionType ||
                (selectedNFTs && selectedNFTs.length > 0 ? 'single-nft' : 'tokens')
              }
              selectedToken={selectedToken}
              selectedNFTs={selectedNFTs}
              formData={safeFormData}
            />
          </ScrollView>

          {/* Hold to Send Button - Outside content container */}
          <View style={{ paddingBottom: insets.bottom + 8 }}>
            <HoldToSendButton onPress={handleConfirm} />
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};
