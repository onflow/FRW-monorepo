import { bridge, navigation } from '@onflow/frw-context';
import { useSendStore, tokenQueryKeys, tokenQueries } from '@onflow/frw-stores';
import { type CollectionModel, type NFTModel } from '@onflow/frw-types';
import {
  BackgroundWrapper,
  NFTGrid,
  NFTSelectionBar,
  CollectionHeader,
  type NFTData,
  YStack,
  ExtensionHeader,
} from '@onflow/frw-ui';
import { getNFTId } from '@onflow/frw-utils';
import { useQuery } from '@tanstack/react-query';
import React, { useCallback, useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { useQueryClient } from '../providers/QueryProvider';

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
  console.log('🟢 NFTListScreen COMPONENT RENDERED!');

  // Debug props at the very start
  console.log('NFTListScreen props:', {
    collection: collection
      ? {
          name: collection.name,
          id: collection.id,
          contractName: collection.contractName,
        }
      : null,
    address,
    selectedNFTIds,
    isEditing,
  });

  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>(selectedNFTIds);

  // Get shared QueryClient to ensure it matches the one in stores
  const _queryClient = useQueryClient();

  // Get store functions and data
  const { setSelectedNFTs, setCurrentStep, setTransactionType, selectedCollection, fromAccount } =
    useSendStore();
  const isExtension = bridge.getPlatform() === 'extension';
  const network = bridge.getNetwork() || 'mainnet';

  // Get address from send store's fromAccount, fallback to prop only
  const currentAddress = fromAccount?.address || address;

  // Use collection from store if not provided as prop (React Native case)
  const activeCollection = collection || selectedCollection;

  console.log('🔍 Data sources:', {
    propCollection: !!collection,
    storeCollection: !!selectedCollection,
    propAddress: address,
    fromAccountAddress: fromAccount?.address,
    currentAddress,
    activeCollection: activeCollection
      ? {
          name: activeCollection.name,
          id: activeCollection.id,
          contractName: activeCollection.contractName,
        }
      : null,
  });
  // Temporarily disable store updates to isolate the issue
  // useEffect(() => {
  //   setCurrentStep('select-nfts');
  // }, []);

  const collectionName = activeCollection?.name || 'NFT Collection';

  // Memoize the query key to prevent unnecessary re-renders
  const queryKey = useMemo(() => {
    console.log('Computing query key with:', {
      collection: !!activeCollection,
      address: currentAddress,
      network,
    });
    if (!activeCollection || !currentAddress) {
      console.log('Query disabled - missing collection or address');
      return ['nft-collection', 'disabled'];
    }
    const key = tokenQueryKeys.nftCollection(currentAddress, activeCollection, network);
    console.log('Generated query key:', key);
    return key;
  }, [
    activeCollection?.id,
    activeCollection?.contractName,
    activeCollection?.name,
    currentAddress,
    network,
  ]);

  // Check enabled condition
  const isQueryEnabled = !!activeCollection && !!currentAddress;
  console.log('Query enabled?', isQueryEnabled, {
    hasCollection: !!activeCollection,
    hasAddress: !!currentAddress,
  });

  // 🔥 TanStack Query: Fetch NFTs from collection with intelligent caching
  const {
    data: nfts = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey,
    queryFn: () => {
      console.log(
        '🔥 QUERY RUNNING - Fetching NFTs for collection:',
        activeCollection?.name,
        'at address:',
        currentAddress
      );
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
      image: nft.image || nft.thumbnail || '',
      thumbnail: nft.thumbnail || nft.image || '',
      collection: nft.collectionName || collectionName,
      amount: nft.amount,
    }),
    [collectionName]
  );

  // Add debugging
  console.log(
    'NFTListScreen render - NFTs:',
    nfts.length,
    'isLoading:',
    isLoading,
    'error:',
    error?.message
  );

  // Memoize the NFT data conversion to prevent unnecessary recalculations
  const nftData: NFTData[] = useMemo(() => {
    console.log('Converting NFT data:', nfts.length, 'NFTs');
    return nfts.map(convertToNFTData);
  }, [nfts, convertToNFTData]);

  // Memoize filtered NFTs to prevent unnecessary recalculations
  const filteredNFTs = useMemo(() => {
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
      console.log('NFT selected:', nftId);

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
    navigation.navigate('NFTView', { id: nftId });
  }, []);

  // Handle NFT removal from selection bar
  const handleNFTRemove = useCallback((nftId: string) => {
    setSelectedIds((prev) => prev.filter((id) => id !== nftId));
  }, []);

  // Handle continue action - navigate to SendTo screen
  const handleContinue = useCallback(() => {
    console.log('Continue pressed with selected NFTs:', selectedIds.length);
    const selectedNFTs = nfts.filter((nft) => selectedIds.includes(getNFTId(nft)));
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
    () => filteredNFTs.filter((nft) => selectedIds.includes(nft.id)),
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
        {activeCollection && (
          <YStack px="$4" pt="$2">
            <CollectionHeader
              name={collectionName}
              image={activeCollection.logoURI || activeCollection.logo}
              // description={activeCollection.description}
              itemCount={nfts.length}
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
          isEditing={isEditing}
        />
      </YStack>
    </BackgroundWrapper>
  );
}
