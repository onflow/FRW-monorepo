import { cadence } from '@onflow/frw-context';
import { sendSelectors, useSendStore, useTokenStore } from '@onflow/frw-stores';
import { SendTransaction, isValidSendTransactionPayload } from '@onflow/frw-workflow';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { SafeAreaView, ScrollView, StatusBar, View } from 'react-native';

import NativeFRWBridge from '@/bridge/NativeFRWBridge';
import { useConfirmationDrawer } from '@/contexts/ConfirmationDrawerContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useAccountCompatibilityModal } from '@/lib';
import { type NavigationProp } from '@/types';
import { type WalletAccount } from '@/types/bridge';
import { AccountCompatibilityModal, Text, ToAccountSection, TransactionFeeSection } from 'ui';

// Import shared components
import { AccountCard } from '../shared/components/AccountCard';
import { ContentContainer } from '../shared/components/ContentContainer';
import { DownArrowButton } from '../shared/components/DownArrowButton';
import { NFTPreview } from '../shared/components/NFTPreview';
import { NFTSectionHeader } from '../shared/components/NFTSectionHeader';
import { SectionDivider } from '../shared/components/SectionDivider';
import { SendButton } from '../shared/components/SendButton';

const SendSingleNFTScreen = ({ navigation }: { navigation?: NavigationProp }) => {
  const { t } = useTranslation();
  const { isDark } = useTheme();
  const { openConfirmation } = useConfirmationDrawer();
  const [transactionFee] = useState('0.001');
  const { isModalVisible, closeModal } = useAccountCompatibilityModal();
  const [isLoading, setIsLoading] = useState(true);

  // Get data from sendStore
  const selectedNFTs = useSendStore(sendSelectors.selectedNFTs);
  const fromAccount = useSendStore(sendSelectors.fromAccount);
  const toAccount = useSendStore(sendSelectors.toAccount);

  // Add debugging
  console.log('[SendSingleNFTScreen] Render with:', {
    selectedNFTsLength: selectedNFTs?.length || 0,
    hasFromAccount: !!fromAccount,
    hasToAccount: !!toAccount,
    isLoading,
  });

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

  // Wait for data to load before checking NFT availability
  useEffect(() => {
    // If we have NFT data or enough time has passed, stop loading
    if (selectedNFTs.length > 0 || fromAccount) {
      setIsLoading(false);
    } else {
      // Give some time for async data loading, then stop loading
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [selectedNFTs.length, fromAccount]);

  // If still loading, show loading state
  if (isLoading) {
    return (
      <SafeAreaView
        style={{ flex: 1, backgroundColor: isDark ? 'rgb(18, 18, 18)' : 'rgb(255, 255, 255)' }}
      >
        <Text
          style={{
            textAlign: 'center',
            marginTop: 32,
            color: isDark ? 'rgb(255, 255, 255)' : 'rgb(0, 0, 0)',
          }}
        >
          Loading...
        </Text>
      </SafeAreaView>
    );
  }

  // If no NFT is selected after loading, navigate back or close app
  if (!selectedNFT) {
    console.log('[SendSingleNFTScreen] No NFT selected after loading, exiting');
    if (navigation?.canGoBack()) {
      navigation.goBack();
    } else {
      // If launched directly from native, close the app
      NativeFRWBridge.closeRN(null);
    }
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
        selectedNFTs: selectedNFT ? [selectedNFT] : [],
        onConfirm: async () => {
          // Create send payload using store
          const { createSendPayload, resetSendFlow, setTransactionType } = useSendStore.getState();
          setTransactionType('single-nft');
          const payload = await createSendPayload();

          if (payload) {
            if (isValidSendTransactionPayload(payload)) {
              const result = await SendTransaction(payload, cadence);
              console.log('[SendSingleNFTScreen] Transfer result:', result);
              resetSendFlow();
              NativeFRWBridge.closeRN(null);
            }
          }
        },
        children: (
          <View
            style={{
              width: '100%',
              padding: 16,
              backgroundColor: isDark ? 'rgba(255, 255, 255, 0.1)' : '#F2F2F7',
              borderRadius: 16,
            }}
          >
            <Text
              style={{
                color: isDark ? 'rgb(255, 255, 255)' : 'rgb(0, 0, 0)',
                fontWeight: '600',
                fontSize: 16,
                marginBottom: 8,
              }}
            >
              Transaction Details
            </Text>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ color: isDark ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.7)' }}>
                NFT
              </Text>
              <Text
                numberOfLines={2}
                ellipsizeMode="tail"
                style={{
                  color: isDark ? 'rgb(255, 255, 255)' : 'rgb(0, 0, 0)',
                  fontWeight: '600',
                  flex: 1,
                  textAlign: 'right',
                  marginLeft: 8,
                }}
              >
                {selectedNFT.name || 'NFT'}
              </Text>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 }}>
              <Text style={{ color: isDark ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.7)' }}>
                Collection
              </Text>
              <Text
                numberOfLines={1}
                ellipsizeMode="tail"
                style={{
                  color: isDark ? 'rgb(255, 255, 255)' : 'rgb(0, 0, 0)',
                  fontWeight: '600',
                  flex: 1,
                  textAlign: 'right',
                  marginLeft: 8,
                }}
              >
                {selectedNFT.collectionName || 'Unknown'}
              </Text>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 }}>
              <Text style={{ color: isDark ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.7)' }}>
                Network Fee
              </Text>
              <Text
                style={{
                  color: isDark ? 'rgb(255, 255, 255)' : 'rgb(0, 0, 0)',
                  fontWeight: '600',
                }}
              >
                ~{transactionFee} FLOW
              </Text>
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
        <View className="flex-1 bg-surface-1 pt-4">
          <ScrollView style={{ flex: 1, paddingHorizontal: 20, paddingTop: 8 }}>
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
