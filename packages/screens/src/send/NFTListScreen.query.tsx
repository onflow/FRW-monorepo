import { bridge, navigation } from '@onflow/frw-context';
import { useSendStore, sendSelectors, tokenQueryKeys, tokenQueries } from '@onflow/frw-stores';
import { type NFTModel } from '@onflow/frw-types';
import {
  BackgroundWrapper,
  NFTGrid,
  NFTSelectionBar,
  CollectionHeader,
  type NFTData,
  YStack,
  ExtensionHeader,
  Text,
} from '@onflow/frw-ui';
import { getNFTId } from '@onflow/frw-utils';
import { useQuery } from '@tanstack/react-query';
import React, { useCallback, useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import { useQueryClient } from '../providers/QueryProvider';

/**
 * Query-integrated version of NFTListScreen following the established pattern
 * Uses TanStack Query for data fetching and caching
 */
export function NFTListScreen(): React.ReactElement {

  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Get shared QueryClient to ensure it matches the one in stores
  const _queryClient = useQueryClient();

  const isExtension = bridge.getPlatform() === 'extension';
  const network = bridge.getNetwork() || 'mainnet';

  // Get data from store using selectors (following SendToScreen pattern)
  const fromAccount = useSendStore(sendSelectors.fromAccount);
  const selectedCollection = useSendStore((state) => state.selectedCollection);
  const setSelectedNFTs = useSendStore((state) => state.setSelectedNFTs);
  const setCurrentStep = useSendStore((state) => state.setCurrentStep);  
  const setTransactionType = useSendStore((state) => state.setTransactionType);

  // Use store data only - store is the single source of truth
  const activeCollection = selectedCollection;
  const currentAddress = fromAccount?.address;

  // Update current step when screen loads (following SendToScreen pattern)
  useEffect(() => {
    setCurrentStep('select-nfts');
  }, [setCurrentStep]);

  const collectionName = activeCollection?.name || 'NFT Collection';

  // Early return if essential data is missing from store
  if (!activeCollection) {
    return (
      <BackgroundWrapper backgroundColor="$background">
        <YStack flex={1} items="center" justify="center" px="$6">
          <Text fontSize="$6" fontWeight="600" color="$color" mb="$3" textAlign="center">
            {t('nft.noNFTsFound')}
          </Text>
          <Text fontSize="$4" color="$textSecondary" textAlign="center">
            No collection selected. Please go back and select an NFT collection.
          </Text>
        </YStack>
      </BackgroundWrapper>
    );
  }

  if (!currentAddress) {
    return (
      <BackgroundWrapper backgroundColor="$background">
        <YStack flex={1} items="center" justify="center" px="$6">
          <Text fontSize="$6" fontWeight="600" color="$color" mb="$3" textAlign="center">
            {t('errors.unknown')}
          </Text>
          <Text fontSize="$4" color="$textSecondary" textAlign="center">
            No account address available. Please select an account.
          </Text>
        </YStack>
      </BackgroundWrapper>
    );
  }

  // Memoize the query key to prevent unnecessary re-renders
  const queryKey = useMemo(() => {
    // Since we have early returns above, this should always have valid data
    const key = tokenQueryKeys.nftCollection(currentAddress, activeCollection, network);
    return key;
  }, [
    activeCollection?.id,
    activeCollection?.contractName,
    activeCollection?.name,
    currentAddress,
    network,
  ]);

  // Query is always enabled since we have early returns for missing data
  const isQueryEnabled = true;
  
  console.log('🔍 NFTListScreen loading state:', { isLoading, hasData: (nfts || []).length > 0, error: !!error });

  // 🔥 TanStack Query: Fetch NFTs from collection with intelligent caching
  const {
    data: nfts = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey,
    queryFn: () => {
      // Safe to use non-null assertion due to early returns
      return tokenQueries.fetchNFTCollection(currentAddress, activeCollection, network);
    },
    enabled: isQueryEnabled,
    staleTime: 5 * 60 * 1000, // NFT items can be cached for 5 minutes
    refetchOnWindowFocus: false, // Keep disabled for now
    refetchOnReconnect: false, // Keep disabled for now
    retry: 1, // Only retry once to avoid infinite loops
    gcTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
  });

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

  // Memoize the NFT data conversion to prevent unnecessary recalculations
  const nftData: NFTData[] = useMemo(() => {
    if (!nfts || !Array.isArray(nfts)) {
      console.log('Converting NFT data: No NFTs available or invalid data');
      return [];
    }
    console.log('Converting NFT data:', nfts.length, 'NFTs');
    return nfts.map(convertToNFTData);
  }, [nfts, convertToNFTData]);

  // Memoize filtered NFTs to prevent unnecessary recalculations
  const filteredNFTs = useMemo(() => {
    if (!Array.isArray(nftData)) {
      console.log('Filtered NFTs: nftData is not an array, returning empty array');
      return [];
    }
    const filtered = nftData.filter(
      (nft) =>
        !searchQuery ||
        nft.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        nft.collection.toLowerCase().includes(searchQuery.toLowerCase())
    );
    console.log('Filtered NFTs:', filtered.length, 'from', nftData.length);
    return filtered;
  }, [nftData, searchQuery]);

  // Temporarily disable store updates to isolate the issue
  // const selectedNFTsToStore = useMemo(() => {
  //   return nfts.filter((nft) => selectedIds.includes(getNFTId(nft)));
  // }, [selectedIds, nfts]);

  // useEffect(() => {
  //   setSelectedNFTs(selectedNFTsToStore);
  // }, [selectedNFTsToStore]);

  // Handle NFT selection
  const handleNFTSelect = useCallback(
    (nftId: string) => {

      setSelectedIds((prev) => {
        const isSelected = prev.includes(nftId);
        const newSelectedIds = isSelected
          ? prev.filter((id) => id !== nftId)
          : prev.length >= 9
            ? prev // Don't add more than 9
            : [...prev, nftId];

        // Set transaction type based on selection count
        if (newSelectedIds.length === 1) {
          setTransactionType('single-nft');
        } else if (newSelectedIds.length > 1) {
          setTransactionType('multiple-nfts');
        }

        if (prev.length >= 9 && !isSelected) {
          console.warn('Maximum 9 NFTs can be selected');
        }

        return newSelectedIds;
      });
    },
    [setTransactionType]
  );

  const handleNFTDetail = useCallback((nftId: string) => {
    console.log('🔍 Opening NFT detail for:', nftId);
    const foundNFT = (nfts || []).find(n => getNFTId(n) === nftId);
    if (foundNFT) {
      navigation.navigate('NFTDetail', { nft: foundNFT });
    } else {
      console.warn('NFT not found for ID:', nftId);
    }
  }, [nfts]);

  // Handle NFT removal from selection bar
  const handleNFTRemove = useCallback((nftId: string) => {
    console.log('🗑️ Removing NFT from selection:', nftId);
    setSelectedIds((prev) => {
      const newIds = prev.filter((id) => id !== nftId);
      console.log('🗑️ Selected IDs before:', prev, 'after:', newIds);
      return newIds;
    });
  }, []);

  // Handle continue action - navigate to SendTo screen
  const handleContinue = useCallback(() => {
    console.log('Continue pressed with selected NFTs:', selectedIds.length);
    const selectedNFTs = (nfts || []).filter((nft) => selectedIds.includes(getNFTId(nft)));
    setSelectedNFTs(selectedNFTs);
    setCurrentStep('send-to');
    navigation.navigate('SendTo');
  }, [selectedIds, nfts, setSelectedNFTs, setCurrentStep]);

  // Refresh function - TanStack Query makes this super simple!
  const refreshNFTs = useCallback(() => {
    refetch();
  }, [refetch]);

  // Memoize selected NFTs for the selection bar to prevent recalculations
  const selectedNFTsForBar = useMemo(
    () => filteredNFTs.filter((nft) => (selectedIds || []).includes(nft.id)),
    [filteredNFTs, selectedIds]
  );

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
    <BackgroundWrapper backgroundColor="$bgDrawer">
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
        {activeCollection && (
          <YStack px="$4" pt="$2">
            <CollectionHeader
              name={collectionName}
              image={activeCollection.logoURI || activeCollection.logo}
              // description={activeCollection.description}
              itemCount={(nfts || []).length}
              isLoading={isLoading}
            />
          </YStack>
        )}

        {/* Search and Content */}
        <YStack flex={1} px="$4">
          <NFTGrid
            data={filteredNFTs}
            selectedIds={selectedIds}
            isLoading={isLoading}
            error={error?.message || null}
            emptyTitle={emptyState.title}
            emptyMessage={emptyState.message}
            onNFTSelect={handleNFTSelect}
            onNFTPress={handleNFTDetail}
            onRetry={refreshNFTs}
            retryText={t('buttons.retry')}
            clearSearchText={t('buttons.clearSearch')}
            onClearSearch={() => setSearchQuery('')}
            showClearSearch={!!searchQuery}
          />
        </YStack>

        {/* Selection Bar */}
        <NFTSelectionBar
          selectedNFTs={selectedNFTsForBar}
          onRemoveNFT={handleNFTRemove}
          onNFTPress={handleNFTDetail}
          onContinue={handleContinue}
          continueText={t('buttons.continue')}
          isEditing={false}
        />
      </YStack>
    </BackgroundWrapper>
  );
}
