import NativeFRWBridge from '@/bridge/NativeFRWBridge';
import { useConfirmationDrawer } from '@/contexts/ConfirmationDrawerContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useAccountCompatibilityModal } from '@/lib';
import { sendSelectors, useSendStore, useTokenStore } from '@onflow/frw-stores';
import { type NavigationProp, type WalletAccount } from '@onflow/frw-types';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { SafeAreaView, ScrollView, StatusBar, View } from 'react-native';
import {
  AccountCompatibilityModal,
  StorageWarning,
  Text,
  ToAccountSection,
  TransactionFeeSection,
} from 'ui';

// Import shared components
import { AccountCard } from '../shared/components/AccountCard';
import { ContentContainer } from '../shared/components/ContentContainer';
import { DownArrowButton } from '../shared/components/DownArrowButton';
import { NFTPreview } from '../shared/components/NFTPreview';
import { NFTSectionHeader } from '../shared/components/NFTSectionHeader';
import { SectionDivider } from '../shared/components/SectionDivider';
import { SendButton } from '../shared/components/SendButton';

const SendSingleNFTScreen = ({ navigation }: { navigation: NavigationProp }) => {
  const { t } = useTranslation();
  const { isDark } = useTheme();
  const { openConfirmation } = useConfirmationDrawer();
  const [transactionFee] = useState('0.001');
  const { isModalVisible, closeModal } = useAccountCompatibilityModal();

  // Get data from sendStore
  const selectedNFTs = useSendStore(sendSelectors.selectedNFTs);
  const fromAccount = useSendStore(sendSelectors.fromAccount);
  const toAccount = useSendStore(sendSelectors.toAccount);

  // State for account balance and NFT data
  const [, setFromAccountBalance] = useState({ displayBalance: '0 FLOW' });
  const [, setFromAccountData] = useState({ nftCountDisplay: '0 NFTs' });

  // Get the first NFT (should be only one for single NFT flow)
  const selectedNFT = selectedNFTs[0];

  // Load account data when accounts change
  const loadAccountData = useCallback(async (address: string, accountType?: string) => {
    if (!address) return { balance: '0 FLOW', nftCountDisplay: '0 NFTs' };

    try {
      const tokenStore = useTokenStore.getState();
      return await tokenStore.getAccountBalance(address, accountType);
    } catch (error) {
      console.error(`Error loading account data for ${address}:`, error);
      return { balance: '0 FLOW', nftCountDisplay: '0 NFTs' };
    }
  }, []);

  // Load from account data
  useEffect(() => {
    if (fromAccount?.address) {
      loadAccountData(
        fromAccount.address,
        (fromAccount as Record<string, unknown>)?.type as string
      ).then(result => {
        setFromAccountBalance({ displayBalance: result.balance });
        setFromAccountData({ nftCountDisplay: result.nftCountDisplay });
      });
    }
  }, [fromAccount?.address, loadAccountData]);

  const currentFromAccount: WalletAccount | null = fromAccount;

  const currentToAccount: WalletAccount | null = toAccount;

  const [isAccountIncompatible] = useState(false);

  // If no NFT is selected, show error or navigate back
  if (!selectedNFT) {
    navigation.goBack();
    return null;
  }

  const handleSend = () => {
    if (currentFromAccount && currentToAccount && selectedNFT) {
      console.log('[SendSingleNFTScreen] Opening confirmation drawer with:', {
        fromAccount: currentFromAccount,
        toAccount: currentToAccount,
        selectedNFTs: [selectedNFT],
      });

      // Open confirmation drawer instead of navigating to full screen
      openConfirmation({
        fromAccount: currentFromAccount,
        toAccount: currentToAccount,
        transactionType: 'single-nft',
        selectedNFTs: selectedNFT?.id
          ? [
              {
                id: selectedNFT.id,
                name: selectedNFT.name,
                thumbnail: selectedNFT.thumbnail,
              },
            ]
          : [],
        onConfirm: async () => {
          // Execute transaction using store method
          const { executeTransaction, setTransactionType } = useSendStore.getState();
          setTransactionType('single-nft');
          const result = await executeTransaction();
          console.log('[SendSingleNFTScreen] Transaction result:', result);
          NativeFRWBridge.closeRN();
        },
        children: (
          <View className="w-full p-4 bg-surface-2 rounded-2xl">
            <Text className="text-fg-1 font-semibold text-base mb-2">Transaction Details</Text>
            <View className="flex-row justify-between">
              <Text className="text-fg-2">NFT</Text>
              <Text className="text-fg-1 font-semibold">{selectedNFT.name || 'NFT'}</Text>
            </View>
            <View className="flex-row justify-between mt-2">
              <Text className="text-fg-2">Collection</Text>
              <Text className="text-fg-1 font-semibold">
                {selectedNFT.collectionName || 'Unknown'}
              </Text>
            </View>
            <View className="flex-row justify-between mt-2">
              <Text className="text-fg-2">Network Fee</Text>
              <Text className="text-fg-1 font-semibold">~{transactionFee} FLOW</Text>
            </View>
          </View>
        ),
      });
    }
  };

  return (
    <View className={isDark ? 'dark' : ''} style={{ flex: 1 }}>
      <SafeAreaView className="flex-1 bg-surface-base">
        <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

        {/* Main Content */}
        <View className={`flex-1 ${isDark ? 'bg-surface-1' : 'bg-white'} pt-4`}>
          <ScrollView className="flex-1 px-5 pt-2">
            {/* From Account Container */}
            {currentFromAccount && (
              <ContentContainer>
                <AccountCard account={currentFromAccount} title={t('labels.fromAccount')} />

                {/* Divider */}
                <SectionDivider />

                {/* NFT Preview Section */}
                <NFTSectionHeader
                  title={t('labels.sendNFT')}
                  onEditPress={() => {
                    // Get cached collections from tokenStore to find the proper collection data
                    const tokenStore = useTokenStore.getState();
                    const address = fromAccount?.address || NativeFRWBridge.getSelectedAddress();
                    const collections = address
                      ? tokenStore.getNFTCollectionsForAddress(address)
                      : null;

                    // Find the matching collection for the selected NFT
                    const matchingCollection = collections?.find(
                      collection =>
                        collection.name === selectedNFT?.collectionName ||
                        collection.contractName === selectedNFT?.collectionContractName
                    );

                    if (matchingCollection && address) {
                      // Navigate to NFTList with proper collection data including paths
                      // Pass current selected NFT ID so it shows as checked
                      (navigation as any).replace('NFTList', {
                        collection: matchingCollection,
                        address: address,
                        selectedNFTIds: selectedNFT ? [selectedNFT.id] : [],
                        isEditing: true,
                      });
                    } else {
                      // Fallback to SelectTokens if we can't find the collection
                      (navigation as any).replace('SelectTokens');
                    }
                  }}
                />
                <NFTPreview nft={selectedNFT} />
              </ContentContainer>
            )}

            {/* Down Arrow */}
            <DownArrowButton />

            {/* To Account Container */}
            {currentToAccount && (
              <ContentContainer>
                <ToAccountSection
                  account={currentToAccount}
                  isAccountIncompatible={isAccountIncompatible}
                  onEditPress={() => {
                    // Replace current screen with SendTo to avoid stacking
                    (navigation as any).replace('SendTo', {
                      selectedNFTs: [selectedNFT],
                    });
                  }}
                  onLearnMorePress={() => {
                    // Open account compatibility modal if needed
                  }}
                />
              </ContentContainer>
            )}

            {/* Transaction Fee Section */}
            <TransactionFeeSection transactionFee={transactionFee} />

            {/* Storage Warning */}
            <StorageWarning />
          </ScrollView>

          {/* Send Button */}
          <SendButton onPress={handleSend} isAccountIncompatible={isAccountIncompatible} />
        </View>
      </SafeAreaView>

      {/* Account Compatibility Modal */}
      <AccountCompatibilityModal visible={isModalVisible} onClose={closeModal} />
    </View>
  );
};

export default SendSingleNFTScreen;
