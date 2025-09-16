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
import React, { useCallback, useState, useMemo, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';

// import { useQueryClient } from '../providers/QueryProvider'; // Currently unused

/**
 * Query-integrated version of NFTListScreen following the established pattern
 * Uses TanStack Query for data fetching and caching
 */
export function NFTListScreen(): React.ReactElement {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Get shared QueryClient to ensure it matches the one in stores
  // const _queryClient = useQueryClient(); // Currently unused, kept for future use

  const isExtension = bridge.getPlatform() === 'extension';
  const network = bridge.getNetwork() || 'mainnet';

  // Get data from store using selectors (following SendToScreen pattern)
  const fromAccount = useSendStore(sendSelectors.fromAccount);
  const selectedCollection = useSendStore((state) => state.selectedCollection);
  const selectedNFTs = useSendStore((state) => state.selectedNFTs);
  const setSelectedNFTs = useSendStore((state) => state.setSelectedNFTs);
  const setCurrentStep = useSendStore((state) => state.setCurrentStep);
  const setTransactionType = useSendStore((state) => state.setTransactionType);

  // Use store data only - store is the single source of truth
  const activeCollection = selectedCollection;
  const currentAddress = fromAccount?.address;

  // Update current step when screen loads (following SendToScreen pattern)
  useEffect(() => {
    setCurrentStep('select-tokens');
  }, [setCurrentStep]);

  // Initialize selectedIds from store's selectedNFTs when component mounts
  useEffect(() => {
    if (selectedNFTs && selectedNFTs.length > 0) {
      const nftIds = selectedNFTs.map((nft) => getNFTId(nft));
      setSelectedIds(nftIds);

      // Set transaction type based on selection count
      if (nftIds.length === 1) {
        setTransactionType('single-nft');
      } else if (nftIds.length > 1) {
        setTransactionType('multiple-nfts');
      }
    }
  }, []); // Only run on mount

  const collectionName = activeCollection?.name || 'NFT Collection';

  // Memoize the query key to prevent unnecessary re-renders
  const queryKey = useMemo(() => {
    // Only create key if we have valid data
    if (!currentAddress || !activeCollection) return null;
    const key = tokenQueryKeys.nftCollection(currentAddress, activeCollection, network);
    return key;
  }, [
    activeCollection?.id,
    activeCollection?.contractName,
    activeCollection?.name,
    currentAddress,
    network,
  ]);

  // Query is enabled only when we have valid data
  const isQueryEnabled = !!currentAddress && !!activeCollection;

  // 🔥 TanStack Query: Fetch NFTs from collection with intelligent caching
  const {
    data: nfts = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: queryKey || [],
    queryFn: () => {
      // Safe to use non-null assertion due to early returns
      return tokenQueries.fetchNFTCollection(currentAddress!, activeCollection!, network);
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
      image: nft.thumbnail || '',
      thumbnail: nft.thumbnail || '',
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
        (nft.collection && nft.collection.toLowerCase().includes(searchQuery.toLowerCase()))
    );
    console.log('Filtered NFTs:', filtered.length, 'from', nftData.length);
    return filtered;
  }, [nftData, searchQuery]);

  // Update store with selected NFTs - only when selection actually changes
  const selectedNFTsToStore = useMemo(() => {
    return nfts.filter((nft) => selectedIds.includes(getNFTId(nft)));
  }, [selectedIds, nfts]);

  // Use a ref to track the previous selected NFTs to prevent unnecessary updates
  const prevSelectedNFTsRef = useRef<NFTModel[]>([]);

  useEffect(() => {
    // Only update store if the selected NFTs have actually changed
    const hasChanged =
      selectedNFTsToStore.length !== prevSelectedNFTsRef.current.length ||
      selectedNFTsToStore.some(
        (nft, index) =>
          !prevSelectedNFTsRef.current[index] ||
          getNFTId(nft) !== getNFTId(prevSelectedNFTsRef.current[index])
      );

    if (hasChanged) {
      setSelectedNFTs(selectedNFTsToStore);
      prevSelectedNFTsRef.current = selectedNFTsToStore;
    }
  }, [selectedNFTsToStore, setSelectedNFTs]);

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

  const handleNFTDetail = useCallback(
    (nftId: string) => {
      const foundNFT = (nfts || []).find((n) => getNFTId(n) === nftId);
      if (foundNFT) {
        navigation.navigate('NFTDetail', { nft: foundNFT });
      } else {
        console.warn('NFT not found for ID:', nftId);
      }
    },
    [nfts]
  );

  // Handle NFT removal from selection bar
  const handleNFTRemove = useCallback((nftId: string) => {
    setSelectedIds((prev) => {
      const newIds = prev.filter((id) => id !== nftId);
      return newIds;
    });
  }, []);

  // Handle continue action - navigate to SendTo screen
  const handleContinue = useCallback(() => {
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

  // Early return if essential data is missing from store
  if (!activeCollection) {
    return (
      <BackgroundWrapper backgroundColor="$background">
        <YStack flex={1} items="center" justify="center" px="$6">
          <Text fontSize="$6" fontWeight="600" color="$color" mb="$3">
            {t('nft.noNFTsFound')}
          </Text>
          <Text fontSize="$4" color="$textSecondary">
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
          <Text fontSize="$6" fontWeight="600" color="$color" mb="$3">
            {t('errors.unknown')}
          </Text>
          <Text fontSize="$4" color="$textSecondary">
            No account address available. Please select an account.
          </Text>
        </YStack>
      </BackgroundWrapper>
    );
  }

  const getEmptyState = (): { title: string; message: string } => {
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
        <YStack flex={1} pl="$4" pr="$6">
          <NFTGrid
            data={filteredNFTs}
            selectedIds={selectedIds}
            isLoading={isLoading}
            error={error?.message || undefined}
            emptyTitle={emptyState.title}
            emptyMessage={emptyState.message}
            onNFTSelect={handleNFTSelect}
            onNFTPress={handleNFTDetail}
            onRetry={refreshNFTs}
            retryText={t('buttons.retry')}
            clearSearchText={t('buttons.clearSearch')}
            onClearSearch={() => setSearchQuery('')}
            showClearSearch={!!searchQuery}
            accountEmoji={fromAccount?.emojiInfo?.emoji}
            accountAvatar={fromAccount?.avatar}
            accountName={fromAccount?.name}
            accountColor={fromAccount?.emojiInfo?.color}
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
