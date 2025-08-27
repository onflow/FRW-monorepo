import { navigation, bridge } from '@onflow/frw-context';
import { NFTService } from '@onflow/frw-services';
import { useSendStore } from '@onflow/frw-stores';
import { type CollectionModel, type NFTModel, addressType } from '@onflow/frw-types';
import {
  BackgroundWrapper,
  SearchableTabLayout,
  NFTGrid,
  NFTSelectionBar,
  CollectionHeader,
  type NFTData,
  YStack,
  ExtensionHeader,
} from '@onflow/frw-ui';
import { getNFTId } from '@onflow/frw-utils';
import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

interface NFTListScreenProps {
  collection?: CollectionModel;
  address?: string;
  selectedNFTIds?: string[];
  isEditing?: boolean;
}

export function NFTListScreen({
  collection,
  address,
  selectedNFTIds = [],
  isEditing = false,
}: NFTListScreenProps) {
  // navigation is imported directly from ServiceContext
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [nfts, setNfts] = useState<NFTModel[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>(selectedNFTIds);

  // Get store functions
  const { setSelectedNFTs, setCurrentStep, setTransactionType } = useSendStore();
  const isExtension = bridge.getPlatform() === 'extension';
  // Update current step when screen loads
  useEffect(() => {
    setCurrentStep('select-nfts');
  }, [setCurrentStep]);

  const collectionName = collection?.name || 'NFT Collection';

  // Convert NFTModel to NFTData for UI components
  const convertToNFTData = useCallback(
    (nft: NFTModel): NFTData => ({
      id: getNFTId(nft),
      name: nft.name || 'Untitled',
      image: nft.image || nft.thumbnail || '',
      thumbnail: nft.thumbnail || nft.image || '',
      collection: nft.collectionName || collectionName,
      amount: nft.amount,
    }),
    [collectionName]
  );

  const nftData: NFTData[] = nfts.map(convertToNFTData);

  // Filter NFTs based on search
  const filteredNFTs = nftData.filter(
    (nft) =>
      !searchQuery ||
      nft.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      nft.collection.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Fetch NFTs from the collection
  const fetchNFTs = useCallback(async () => {
    if (!collection || !address) {
      setNfts([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Determine wallet type and create NFT service
      const walletType = addressType(address);
      const nftService = new NFTService(walletType);
      const nftModels = await nftService.getNFTs(address, collection, 0, 50);
      setNfts(nftModels);
    } catch (err: any) {
      console.error('[NFT] Failed to fetch NFTs:', err?.message || 'Unknown error');
      setError(err?.message || t('errors.failedToLoadNFTs'));
      setNfts([]);
    } finally {
      setIsLoading(false);
    }
  }, [collection, address, t]);

  // Fetch NFTs when component mounts or collection changes
  useEffect(() => {
    fetchNFTs();
  }, [fetchNFTs]);

  // Handle NFT selection
  const handleNFTSelect = useCallback((nftId: string) => {
    setTransactionType('multiple-nfts');
    setSelectedIds((prev) => {
      const isSelected = prev.includes(nftId);
      if (isSelected) {
        return prev.filter((id) => id !== nftId);
      } else {
        if (prev.length >= 9) {
          // Show alert for max selection - this would need to be handled by the parent
          console.warn('Maximum 9 NFTs can be selected');
          return prev;
        }
        return [...prev, nftId];
      }
    });
  }, []);

  // Handle NFT removal from selection bar
  const handleNFTRemove = useCallback((nftId: string) => {
    setSelectedIds((prev) => prev.filter((id) => id !== nftId));
  }, []);

  // Handle continue action
  const handleContinue = useCallback(() => {
    const selectedNFTs = nfts.filter((nft) => selectedIds.includes(getNFTId(nft)));
    setSelectedNFTs(selectedNFTs);
    setCurrentStep('send-to');
    navigation.navigate('SendTo');
  }, [nfts, selectedIds, setSelectedNFTs, setCurrentStep, navigation]);

  // Get selected NFTs for the selection bar
  const selectedNFTs = filteredNFTs.filter((nft) => selectedIds.includes(nft.id));

  const getEmptyState = () => {
    if (searchQuery) {
      return {
        title: t('nft.noSearchResults'),
        message: t('nft.noNFTsMatchSearch', { search: searchQuery }),
      };
    }
    return {
      title: t('nft.noNFTsFound'),
      message: t('nft.collectionEmpty'),
    };
  };

  const emptyState = getEmptyState();

  return (
    <BackgroundWrapper backgroundColor="$background">
      <YStack flex={1} position="relative">
        {/* Collection Header */}
        {isExtension && (
          <ExtensionHeader
            title={t('send.title')}
            help={true}
            onGoBack={() => navigation.goBack()}
            onNavigate={(link: string) => navigation.navigate(link)}
          />
        )}
        {collection && (
          <YStack px="$4" pt="$2">
            <CollectionHeader
              name={collectionName}
              image={collection.logoURI || collection.logo}
              // description={collection.description}
              itemCount={nfts.length}
              isLoading={isLoading}
            />
          </YStack>
        )}

        {/* Search and Content */}
        <YStack flex={1} px="$4">
          {/* Search Bar */}
          <YStack mb="$4">
            <SearchableTabLayout
              showHeader={false}
              searchValue={searchQuery}
              searchPlaceholder={t('placeholders.searchNFTs')}
              showScanButton={false}
              onSearchChange={setSearchQuery}
              tabSegments={[]}
              activeTab={t('tabs.nfts')}
              onTabChange={() => {}} // Single tab, no action needed
              contentPadding={0}
            >
              <NFTGrid
                data={filteredNFTs}
                selectedIds={selectedIds}
                isLoading={isLoading}
                error={error}
                emptyTitle={emptyState.title}
                emptyMessage={emptyState.message}
                onNFTSelect={handleNFTSelect}
                onRetry={fetchNFTs}
                retryText={t('buttons.retry')}
                clearSearchText={t('buttons.clearSearch')}
                onClearSearch={() => setSearchQuery('')}
                showClearSearch={!!searchQuery}
              />
            </SearchableTabLayout>
          </YStack>
        </YStack>

        {/* Selection Bar */}
        <NFTSelectionBar
          selectedNFTs={selectedNFTs}
          onRemoveNFT={handleNFTRemove}
          onContinue={handleContinue}
          continueText={t('buttons.continue')}
          isEditing={isEditing}
        />
      </YStack>
    </BackgroundWrapper>
  );
}
