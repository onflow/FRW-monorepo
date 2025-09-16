import { navigation, bridge } from '@onflow/frw-context';
import { useSendStore, sendSelectors, tokenQueryKeys, tokenQueries } from '@onflow/frw-stores';
import { type NFTModel } from '@onflow/frw-types';
import {
  BackgroundWrapper,
  NFTDetailView,
  NFTSelectionBar,
  type NFTDetailData,
  type NFTData,
  YStack,
  ExtensionHeader,
  Text,
} from '@onflow/frw-ui';
import { getNFTCover, getNFTId } from '@onflow/frw-utils';
import { useQuery } from '@tanstack/react-query';
import React, { useCallback, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { useQueryClient } from '../providers/QueryProvider';

/**
 * Query-integrated version of NFTDetailScreen following the established pattern
 * Uses TanStack Query for data fetching and caching, store-first data approach
 */
export function NFTDetailScreen(): React.ReactElement {
  const { t } = useTranslation();

  // Get shared QueryClient to ensure it matches the one in stores
  const _queryClient = useQueryClient();

  const isExtension = bridge.getPlatform() === 'extension';
  const network = bridge.getNetwork() || 'mainnet';

  // Get data from store using selectors (following established pattern)
  const fromAccount = useSendStore(sendSelectors.fromAccount);
  const selectedCollection = useSendStore((state) => state.selectedCollection);
  const selectedNFTs = useSendStore((state) => state.selectedNFTs);
  const setSelectedNFTs = useSendStore((state) => state.setSelectedNFTs);
  const setCurrentStep = useSendStore((state) => state.setCurrentStep);

  // Use store data only - store is the single source of truth
  const activeCollection = selectedCollection;
  const currentAddress = fromAccount?.address;

  // Update current step when screen loads
  useEffect(() => {
    setCurrentStep('nft-detail');
  }, [setCurrentStep]);

  // Memoize the query key to prevent unnecessary re-renders
  const queryKey = useMemo(() => {
    if (!activeCollection || !currentAddress) return null;
    const key = tokenQueryKeys.nftCollection(currentAddress, activeCollection, network);
    return key;
  }, [activeCollection, currentAddress, network]);

  // 🔥 TanStack Query: Fetch NFTs from collection to get the detailed NFT data
  const {
    data: collectionNFTs = [],
    isLoading,
    error,
  } = useQuery<NFTModel[]>({
    queryKey: queryKey || [],
    queryFn: () => {
      if (!currentAddress || !activeCollection) return Promise.resolve([]);
      return tokenQueries.fetchNFTCollection(currentAddress, activeCollection, network);
    },
    enabled: !!queryKey,
    staleTime: 5 * 60 * 1000, // NFT items can be cached for 5 minutes
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    retry: 1,
    gcTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
  });

  // Get the current NFT to display - either from selectedNFTs or first NFT in collection
  const currentNFT = useMemo(() => {
    if (selectedNFTs && selectedNFTs.length > 0) {
      return selectedNFTs[0]; // Show first selected NFT
    }
    if (collectionNFTs.length > 0) {
      return collectionNFTs[0]; // Show first NFT from collection as fallback
    }
    return null;
  }, [selectedNFTs, collectionNFTs]);

  // Convert NFTModel to NFTDetailData
  const convertToNFTDetailData = useCallback(
    (nftModel: NFTModel): NFTDetailData => {
      // Extract additional properties that might contain traits/attributes
      const additionalProperties: { label: string; value: string }[] = [];

      // Check if NFT has traits/attributes in metadata
      const nftAsAny = nftModel as any;

      // Common trait/attribute fields from NFT metadata
      if (nftAsAny.traits || nftAsAny.attributes) {
        const traits = nftAsAny.traits || nftAsAny.attributes;
        if (Array.isArray(traits)) {
          traits.forEach((trait: any) => {
            if (trait && typeof trait === 'object' && trait.trait_type && trait.value) {
              additionalProperties.push({
                label: trait.trait_type,
                value: trait.value.toString(),
              });
            }
          });
        }
      }

      // Check for properties in postMedia or other nested objects
      if (nftAsAny.postMedia?.traits || nftAsAny.postMedia?.attributes) {
        const mediaTraits = nftAsAny.postMedia.traits || nftAsAny.postMedia.attributes;
        if (Array.isArray(mediaTraits)) {
          mediaTraits.forEach((trait: any) => {
            if (trait && typeof trait === 'object' && trait.trait_type && trait.value) {
              additionalProperties.push({
                label: trait.trait_type,
                value: trait.value.toString(),
              });
            }
          });
        }
      }

      // Check for other common metadata fields that might contain properties
      ['rarity', 'edition', 'series', 'creator', 'royalty'].forEach((field) => {
        if (nftAsAny[field] && typeof nftAsAny[field] === 'string') {
          additionalProperties.push({
            label: field.charAt(0).toUpperCase() + field.slice(1),
            value: nftAsAny[field],
          });
        }
      });

      return {
        id: nftModel.id,
        name: nftModel.name || 'Untitled',
        image: getNFTCover(nftModel),
        collection: nftModel.collectionName || activeCollection?.name || 'Unknown',
        description: nftModel.description,
        contractName: nftModel.contractName,
        contractAddress: nftModel.contractAddress,
        collectionContractName: nftModel.collectionContractName,
        properties: additionalProperties.length > 0 ? additionalProperties : undefined,
        contractType: nftModel.contractType, // Preserve ERC1155/ERC721 type
        amount: nftModel.amount, // Include amount for ERC1155
      };
    },
    [activeCollection?.name]
  );

  // Convert NFTModel to NFTData for selection bar
  const convertToNFTData = useCallback(
    (nftModel: NFTModel): NFTData => ({
      id: getNFTId(nftModel),
      name: nftModel.name || 'Untitled',
      image: getNFTCover(nftModel),
      collection: nftModel.collectionName || activeCollection?.name || 'Unknown',
      amount: nftModel.amount,
      contractType: nftModel.contractType, // Preserve ERC1155/ERC721 type
    }),
    [activeCollection?.name]
  );

  // Memoize the NFT detail data conversion
  const nftDetailData = useMemo(() => {
    return currentNFT ? convertToNFTDetailData(currentNFT) : null;
  }, [currentNFT, convertToNFTDetailData]);

  // Check if current NFT is selected
  const isCurrentNFTSelected = useMemo(() => {
    if (!currentNFT || !selectedNFTs) return false;
    return selectedNFTs.some((nft) => getNFTId(nft) === getNFTId(currentNFT));
  }, [currentNFT, selectedNFTs]);

  // Determine if selection is enabled (we're in send flow)
  const isSelectable = selectedNFTs !== undefined && selectedNFTs !== null;

  // Handle NFT selection toggle
  const handleToggleSelection = useCallback(() => {
    if (!isSelectable || !currentNFT) return;

    const nftId = getNFTId(currentNFT);
    const isCurrentlySelected = selectedNFTs.some((nft) => getNFTId(nft) === nftId);

    if (isCurrentlySelected) {
      // Remove from selection
      const updatedSelectedNFTs = selectedNFTs.filter((nft) => getNFTId(nft) !== nftId);
      setSelectedNFTs(updatedSelectedNFTs);
    } else {
      // Add to selection (max 9)
      if (selectedNFTs.length < 9) {
        const updatedSelectedNFTs = [...selectedNFTs, currentNFT];
        setSelectedNFTs(updatedSelectedNFTs);
      } else {
        console.warn('Maximum 9 NFTs can be selected');
      }
    }
  }, [isSelectable, currentNFT, selectedNFTs, setSelectedNFTs]);

  // Handle NFT removal from selection bar
  const handleRemoveNFT = useCallback(
    (nftId: string) => {
      if (!selectedNFTs) return;
      const updatedSelectedNFTs = selectedNFTs.filter((nft) => getNFTId(nft) !== nftId);
      setSelectedNFTs(updatedSelectedNFTs);
    },
    [selectedNFTs, setSelectedNFTs]
  );

  // Handle continue action - navigate to SendTo screen
  const handleContinue = useCallback(() => {
    console.log('Continue with selected NFTs:', selectedNFTs?.length);

    // Get transaction type from store
    const setTransactionType = useSendStore.getState().setTransactionType;

    // Set transaction type based on number of selected NFTs
    if (selectedNFTs && selectedNFTs.length === 1) {
      setTransactionType('single-nft');
    } else if (selectedNFTs && selectedNFTs.length > 1) {
      setTransactionType('multiple-nfts');
    }

    setCurrentStep('send-to');
    navigation.navigate('SendTo');
  }, [selectedNFTs, setCurrentStep]);

  // Handle NFT press in selection bar (navigate to different NFT detail)
  const handleNFTPress = useCallback((nftId: string) => {
    console.log('🔍 Viewing different NFT:', nftId);
    // For now, just log - could implement NFT switching in future
  }, []);

  // Memoize selected NFTs for the selection bar to prevent recalculations
  const selectedNFTsForBar = useMemo(() => {
    if (!selectedNFTs) return [];
    return selectedNFTs.map(convertToNFTData);
  }, [selectedNFTs, convertToNFTData]);

  // Get current account for owner display
  const owner = useMemo(() => {
    if (!fromAccount) return undefined;
    return {
      name: fromAccount.name,
      avatar: fromAccount.avatar,
      address: fromAccount.address,
      emojiInfo: fromAccount.emojiInfo,
    };
  }, [fromAccount]);

  // Early return if essential data is missing from store
  if (!activeCollection || !currentAddress) {
    return (
      <BackgroundWrapper backgroundColor="$bgDrawer">
        <YStack flex={1} items="center" justify="center" px="$6">
          <Text fontSize="$6" fontWeight="600" color="$color" mb="$3" textAlign="center">
            {t('nft.notFound.title')}
          </Text>
          <Text fontSize="$4" color="$textSecondary" textAlign="center">
            {t('nft.notFound.message')}
          </Text>
        </YStack>
      </BackgroundWrapper>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <BackgroundWrapper backgroundColor="$bgDrawer">
        <YStack flex={1} items="center" justify="center" px="$6">
          <Text fontSize="$4" color="$textSecondary" textAlign="center">
            {t('messages.loading')}...
          </Text>
        </YStack>
      </BackgroundWrapper>
    );
  }

  // Error state
  if (error) {
    return (
      <BackgroundWrapper backgroundColor="$bgDrawer">
        <YStack flex={1} items="center" justify="center" px="$6">
          <Text fontSize="$6" fontWeight="600" color="$color" mb="$3" textAlign="center">
            {t('errors.unknown')}
          </Text>
          <Text fontSize="$4" color="$textSecondary" textAlign="center">
            {error.message || t('errors.failedToLoadNFTs')}
          </Text>
        </YStack>
      </BackgroundWrapper>
    );
  }

  // No NFT found state
  if (!currentNFT || !nftDetailData) {
    return (
      <BackgroundWrapper backgroundColor="$bgDrawer">
        <YStack flex={1} items="center" justify="center" px="$6">
          <Text fontSize="$6" fontWeight="600" color="$color" mb="$3" textAlign="center">
            {t('nft.notFound.title')}
          </Text>
          <Text fontSize="$4" color="$textSecondary" textAlign="center">
            {t('nft.notFound.message')}
          </Text>
        </YStack>
      </BackgroundWrapper>
    );
  }

  return (
    <BackgroundWrapper backgroundColor="$bgDrawer">
      <YStack flex={1} position="relative">
        {/* Header */}
        {isExtension && (
          <ExtensionHeader
            title={t('send.title')}
            help={true}
            onGoBack={() => navigation.goBack()}
            onNavigate={(link: string) => navigation.navigate(link)}
          />
        )}

        {/* NFT Detail View */}
        <NFTDetailView
          nft={nftDetailData}
          selected={isCurrentNFTSelected}
          selectable={isSelectable}
          onToggleSelection={handleToggleSelection}
          owner={owner}
          showOwner={!!owner}
        />

        {/* Selection Bar - only shown when selection is enabled and NFTs are selected */}
        {isSelectable && selectedNFTsForBar.length > 0 && (
          <NFTSelectionBar
            selectedNFTs={selectedNFTsForBar}
            onRemoveNFT={handleRemoveNFT}
            onNFTPress={handleNFTPress}
            onContinue={handleContinue}
            continueText={t('buttons.continue')}
            isEditing={false}
          />
        )}
      </YStack>
    </BackgroundWrapper>
  );
}
