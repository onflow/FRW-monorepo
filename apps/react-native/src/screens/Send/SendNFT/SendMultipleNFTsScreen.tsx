import { sendSelectors, useSendStore, useTokenStore } from '@onflow/frw-stores';
import { type NavigationProp, type WalletAccount } from '@onflow/frw-types';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { SafeAreaView, ScrollView, StatusBar, View } from 'react-native';

import NativeFRWBridge from '@/bridge/NativeFRWBridge';
import { useConfirmationDrawer } from '@/contexts/ConfirmationDrawerContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useAccountCompatibilityModal } from '@/lib';
import { AccountCompatibilityModal, Text, ToAccountSection, TransactionFeeSection } from 'ui';

// Import shared components
import { AccountCard } from '../shared/components/AccountCard';
import { ContentContainer } from '../shared/components/ContentContainer';
import { DownArrowButton } from '../shared/components/DownArrowButton';
import { MultipleNFTsPreview } from '../shared/components/MultipleNFTsPreview';
import { NFTSectionHeader } from '../shared/components/NFTSectionHeader';
import { SectionDivider } from '../shared/components/SectionDivider';
import { SendButton } from '../shared/components/SendButton';

const SendMultipleNFTsScreen = ({ navigation }: { navigation: NavigationProp }) => {
  const { t } = useTranslation();
  const { isDark } = useTheme();
  const { openConfirmation } = useConfirmationDrawer();
  const [transactionFee] = useState('0.001');
  const { isModalVisible, openModal, closeModal } = useAccountCompatibilityModal();

  // Get data from sendStore
  const selectedNFTs = useSendStore(sendSelectors.selectedNFTs);
  const fromAccount = useSendStore(sendSelectors.fromAccount);
  const toAccount = useSendStore(sendSelectors.toAccount);

  // Use local state for account data to avoid circular dependencies
  const [, setFromAccountBalance] = useState({ displayBalance: '0 FLOW' });
  const [, setFromAccountData] = useState({ nftCountDisplay: '0 NFTs' });

  // Load account data when fromAccount changes
  useEffect(() => {
    if (fromAccount?.address) {
      const loadAccountData = async () => {
        try {
          const tokenStore = useTokenStore.getState();
          const result = await tokenStore.getAccountBalance(
            fromAccount.address,
            (fromAccount as Record<string, unknown>)?.type as string
          );
          setFromAccountBalance({ displayBalance: result.balance });
          setFromAccountData({ nftCountDisplay: result.nftCountDisplay });
        } catch (error) {
          console.error(`Error loading account data for ${fromAccount.address}:`, error);
          setFromAccountBalance({ displayBalance: '0 FLOW' });
          setFromAccountData({ nftCountDisplay: '0 NFTs' });
        }
      };

      loadAccountData();
    }
  }, [fromAccount?.address]);

  const { removeSelectedNFT, setTransactionType } = useSendStore();

  // Handle NFT removal
  const handleRemoveNFT = (nftId: string) => {
    removeSelectedNFT(nftId);

    // Update transaction type based on remaining NFTs
    const remainingNFTs = selectedNFTs.filter(nft => nft.id !== nftId);
    if (remainingNFTs.length === 0) {
      // Navigate back if no NFTs remain
      navigation.goBack();
    } else if (remainingNFTs.length === 1) {
      // Switch to single NFT flow
      setTransactionType('single-nft');
      navigation.navigate('SendSingleNFT' as never);
    }
    // Otherwise stay in multiple NFTs flow
  };

  // Debug logging
  console.log('[SendMultipleNFTsScreen] Debug info:', {
    selectedNFTsLength: selectedNFTs.length,
    selectedNFTs: selectedNFTs,
  });

  const currentFromAccount: WalletAccount | null = fromAccount;

  const currentToAccount: WalletAccount | null = toAccount;

  const [isAccountIncompatible] = useState(false);

  // If no NFTs are selected, show error or navigate back
  if (!selectedNFTs || selectedNFTs.length === 0) {
    navigation.goBack();
    return null;
  }

  // If no accounts are available, don't render
  if (!currentFromAccount || !currentToAccount) {
    return null;
  }

  return (
    <View className={isDark ? 'dark' : ''} style={{ flex: 1 }}>
      <SafeAreaView className="flex-1 bg-surface-base">
        <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

        {/* Main Content */}
        <View className={`flex-1 ${isDark ? 'bg-surface-1' : 'bg-white'} pt-4`}>
          <ScrollView className="flex-1 px-5 pt-2">
            {/* From Account Container */}
            <ContentContainer>
              <AccountCard account={currentFromAccount} title={t('labels.fromAccount')} />

              {/* Divider */}
              <SectionDivider />

              {/* Send NFTs Section */}
              <NFTSectionHeader
                title={t('labels.sendNFTs')}
                onEditPress={() => {
                  // Get cached collections from tokenStore to find the proper collection data
                  const tokenStore = useTokenStore.getState();
                  const address = fromAccount?.address || NativeFRWBridge.getSelectedAddress();
                  const collections = address
                    ? tokenStore.getNFTCollectionsForAddress(address)
                    : null;

                  // Find the matching collection for the first selected NFT (assume all from same collection)
                  const firstNFT = selectedNFTs[0];
                  const matchingCollection = collections?.find(
                    collection =>
                      collection.name === firstNFT?.collectionName ||
                      collection.contractName === firstNFT?.collectionContractName
                  );

                  if (matchingCollection && address) {
                    // Navigate to NFTList with proper collection data including paths
                    // Pass current selected NFT IDs so they show as checked
                    (navigation as any).replace('NFTList', {
                      collection: matchingCollection,
                      address: address,
                      selectedNFTIds: selectedNFTs.map(nft => nft.id),
                      isEditing: true,
                    });
                  } else {
                    // Fallback to SelectTokens if we can't find the collection
                    (navigation as any).replace('SelectTokens');
                  }
                }}
              />

              {/* Multiple NFTs Preview */}
              <MultipleNFTsPreview
                nfts={selectedNFTs}
                selectedNFTs={selectedNFTs}
                onRemoveNFT={handleRemoveNFT}
              />
            </ContentContainer>

            {/* Enhanced Down Arrow Button */}
            <DownArrowButton />

            {/* To Account Container - Separate container */}
            <ContentContainer>
              <ToAccountSection
                account={currentToAccount}
                isAccountIncompatible={isAccountIncompatible}
                onEditPress={() => {
                  // Replace current screen with SendTo to avoid stacking
                  (navigation as any).replace('SendTo', {
                    selectedNFTs: selectedNFTs,
                  });
                }}
                onLearnMorePress={openModal}
              />
            </ContentContainer>

            {/* Transaction Fee Section */}
            <TransactionFeeSection transactionFee={transactionFee} />
          </ScrollView>

          {/* Send Button */}
          <SendButton
            isAccountIncompatible={isAccountIncompatible}
            onPress={() => {
              if (!isAccountIncompatible) {
                // Ensure store has the correct data before navigation
                const { setTransactionType } = useSendStore.getState();
                setTransactionType('multiple-nfts');

                console.log('[SendMultipleNFTsScreen] Navigating to confirmation with:', {
                  selectedNFTsLength: selectedNFTs.length,
                  transactionType: 'multiple-nfts',
                });

                // Open confirmation drawer instead of navigating to full screen
                if (fromAccount && toAccount) {
                  openConfirmation({
                    fromAccount,
                    toAccount,
                    transactionType: 'multiple-nfts',
                    selectedNFTs: selectedNFTs
                      .filter(nft => nft.id)
                      .map(nft => ({
                        id: nft.id!,
                        name: nft.name,
                        thumbnail: nft.thumbnail,
                      })),
                    onConfirm: async () => {
                      // Execute transaction using store method
                      const { executeTransaction } = useSendStore.getState();
                      const result = await executeTransaction();
                      console.log('[SendMultipleNFTsScreen] Transaction result:', result);
                      NativeFRWBridge.closeRN();
                    },
                    children:
                      selectedNFTs && selectedNFTs.length > 0 ? (
                        <View className="w-full p-4 bg-surface-2 rounded-2xl">
                          <Text className="text-fg-1 font-semibold text-base mb-2">
                            Transaction Details
                          </Text>
                          <View className="flex-row justify-between">
                            <Text className="text-fg-2">NFTs</Text>
                            <Text className="text-fg-1 font-semibold">
                              {selectedNFTs.length} NFT(s)
                            </Text>
                          </View>
                          <View className="flex-row justify-between mt-2">
                            <Text className="text-fg-2">Network Fee</Text>
                            <Text className="text-fg-1 font-semibold">~{transactionFee} FLOW</Text>
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
    </View>
  );
};

export default SendMultipleNFTsScreen;
