import { type CollectionModel, type NFTModel } from '@onflow/frw-types';
import {
  ScrollView,
  View,
  Text,
  Button,
  Input,
  XStack,
  YStack,
  Image,
  Spinner,
} from '@onflow/frw-ui';
import { getNFTId } from '@onflow/frw-utils';
import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { useDemoDataStore } from '../stores';
import type { BaseScreenProps } from '../types';

interface NFTListScreenProps extends BaseScreenProps {
  // Collection and address data
  collection?: CollectionModel;
  address?: string;
  selectedNFTIds?: string[];
  isEditing?: boolean;

  // Callbacks
  onNFTSelect?: (nft: NFTModel) => void;
  onConfirmSelection?: (selectedNFTs: NFTModel[]) => void;
  onNavigateToNFTDetail?: (params: {
    nft: NFTModel;
    selectedNFTs?: NFTModel[];
    onSelectionChange?: (nftId: string, selected: boolean) => void;
  }) => void;
}

// Simple NFT Card Component
const NFTCard: React.FC<{
  nft: NFTModel;
  selected: boolean;
  onSelect: () => void;
  onPress: () => void;
}> = ({ nft, selected, onSelect, onPress }) => (
  <View width="48%" mb="$4" bg="$bg2" borderRadius="$3" p="$2" position="relative">
    {/* NFT Image */}
    <Button
      unstyled
      onPress={onPress}
      width="100%"
      aspectRatio={1}
      borderRadius="$3"
      overflow="hidden"
      bg="$bg3"
      mb="$2"
    >
      <Image
        source={{ uri: nft.thumbnail || '' }}
        width="100%"
        height="100%"
        borderRadius="$3"
        resizeMode="cover"
      />
    </Button>

    {/* NFT Info */}
    <Text fontSize="$4" fontWeight="600" color="$color" numberOfLines={1}>
      {nft.name}
    </Text>

    {/* Selection Button */}
    <Button
      position="absolute"
      top="$2"
      right="$2"
      size="small"
      variant={selected ? 'primary' : 'outline'}
      onPress={onSelect}
      circular
      width={24}
      height={24}
    >
      <Text fontSize="$1">{selected ? '✓' : '○'}</Text>
    </Button>
  </View>
);

export default function NFTListScreen({
  navigation,
  bridge,
  t,
  collection,
  address,
  selectedNFTIds = [],
  isEditing = false,
  onNFTSelect,
  onConfirmSelection,
  onNavigateToNFTDetail,
}: NFTListScreenProps) {
  const [search, setSearch] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>(selectedNFTIds);

  // Use demo data store
  const {
    nfts: allNfts,
    collections,
    isLoadingNFTs: nftLoading,
    nftsError: nftError,
    fetchNFTs: loadNFTs,
    fetchCollections,
    getNFTsByCollection,
  } = useDemoDataStore();

  const collectionName = collection?.name || 'NFT Collection';

  // Get NFTs for the current collection
  const nfts = useMemo(() => {
    if (collection) {
      return getNFTsByCollection(collection.id || '');
    }
    return allNfts;
  }, [collection, allNfts, getNFTsByCollection]);

  const selectNFT = useCallback(
    (id: string) => {
      if (selectedIds.includes(id)) return true;
      if (selectedIds.length >= 9) {
        alert(t('alerts.maxNFTSelection'));
        return false;
      }
      setSelectedIds((prev) => [...prev, id]);
      return true;
    },
    [selectedIds, t]
  );

  const unselectNFT = useCallback((id: string) => {
    setSelectedIds((prev) => prev.filter((_id) => _id !== id));
  }, []);

  const isSelected = useCallback((id: string) => selectedIds.includes(id), [selectedIds]);

  // Load NFTs when component mounts
  useEffect(() => {
    console.log('🖼️ NFTListScreen: Loading data...');
    loadNFTs();
    fetchCollections();
  }, [loadNFTs, fetchCollections]);

  // Debug log to see data state
  useEffect(() => {
    console.log('🖼️ NFTListScreen data state:', {
      allNfts: allNfts.length,
      filteredNfts: nfts.length,
      collections: collections.length,
      collection: collection?.name,
      nftLoading,
      nftError,
    });
  }, [allNfts, nfts, collections, collection, nftLoading, nftError]);

  const filteredNFTs = useMemo(() => {
    if (!search) return nfts;
    return nfts.filter(
      (nft: NFTModel) =>
        nft.name?.toLowerCase().includes(search.toLowerCase()) ||
        nft.description?.toLowerCase().includes(search.toLowerCase())
    );
  }, [search, nfts]);

  // Get selected NFTs for the bottom bar
  const selectedNFTsList = selectedIds
    .map((selectedId: string) => {
      const nft = nfts.find((n: NFTModel) => n.id === selectedId);
      return nft || null;
    })
    .filter(Boolean) as NFTModel[];

  // Handle selection change from NFTDetailScreen
  const handleSelectionChange = useCallback(
    (nftId: string, selected: boolean) => {
      if (selected) {
        selectNFT(nftId);
      } else {
        unselectNFT(nftId);
      }
    },
    [selectNFT, unselectNFT]
  );

  const handleNFTPress = (nft: NFTModel) => {
    if (onNavigateToNFTDetail) {
      onNavigateToNFTDetail({
        nft,
        selectedNFTs: selectedNFTsList,
        onSelectionChange: handleSelectionChange,
      });
    } else {
      navigation.navigate('NFTDetail', {
        nft,
        selectedNFTs: selectedNFTsList,
        onSelectionChange: handleSelectionChange,
      });
    }
  };

  const handleConfirm = () => {
    if (selectedNFTsList.length === 0) {
      alert(t('alerts.selectAtLeastOneNFT'));
      return;
    }

    if (onConfirmSelection) {
      onConfirmSelection(selectedNFTsList);
    } else {
      // Default navigation behavior
      navigation.navigate('SendTo', { selectedNFTs: selectedNFTsList });
    }
  };

  return (
    <View flex={1} bg="$background">
      <YStack flex={1} p="$4">
        {/* Collection Info */}
        <XStack items="center" space="$4" mb="$5" p="$2">
          <View width={64} height={64} bg="$bg2" borderRadius="$8" overflow="hidden">
            <Image
              source={{ uri: collection?.logoURI || collection?.logo || '' }}
              width={64}
              height={64}
              borderRadius="$8"
              resizeMode="cover"
            />
          </View>

          <YStack flex={1} space="$1">
            <Text fontSize="$6" fontWeight="700" color="$color" numberOfLines={2}>
              {collectionName}
            </Text>
            {!nftLoading && (
              <Text fontSize="$4" fontWeight="500" color="$textSecondary">
                {nfts.length} {nfts.length === 1 ? t('common.item') : t('common.items')}
              </Text>
            )}
            {collection?.description && (
              <Text fontSize="$3" color="$textTertiary" numberOfLines={2}>
                {collection.description}
              </Text>
            )}
          </YStack>
        </XStack>

        {/* Search Bar */}
        <Input
          value={search}
          onChangeText={setSearch}
          placeholder={t('placeholders.searchNFTs')}
          mb="$4"
        />

        {/* NFT Grid */}
        <ScrollView flex={1} showsVerticalScrollIndicator={false}>
          {nftLoading ? (
            <YStack items="center" justify="center" py="$8">
              <Spinner size="large" />
              <Text mt="$4" color="$textSecondary">
                {t('common.loading')}
              </Text>
            </YStack>
          ) : nftError ? (
            <YStack items="center" justify="center" py="$8">
              <Text color="$error" textAlign="center" mb="$4">
                {nftError}
              </Text>
              <Button variant="primary" onPress={loadNFTs}>
                <Text>{t('buttons.retry')}</Text>
              </Button>
            </YStack>
          ) : filteredNFTs.length === 0 ? (
            <YStack items="center" justify="center" py="$8">
              <Text fontSize="$6" fontWeight="600" color="$color" textAlign="center" mb="$2">
                {search ? t('messages.noSearchResults') : t('messages.noNFTsFound')}
              </Text>
              <Text fontSize="$4" color="$textSecondary" textAlign="center" mb="$6" maxWidth={280}>
                {search
                  ? t('messages.noNFTsMatchSearch', { search })
                  : t('messages.collectionEmpty')}
              </Text>
              {search ? (
                <Button variant="secondary" onPress={() => setSearch('')}>
                  <Text>{t('buttons.clearSearch')}</Text>
                </Button>
              ) : (
                <Button variant="primary" onPress={loadNFTs}>
                  <Text>{t('buttons.refresh')}</Text>
                </Button>
              )}
            </YStack>
          ) : (
            <XStack flexWrap="wrap" justify="space-between" pb="$20">
              {filteredNFTs.map((nft) => (
                <NFTCard
                  key={getNFTId(nft)}
                  nft={nft}
                  selected={isSelected(getNFTId(nft))}
                  onSelect={() =>
                    isSelected(getNFTId(nft))
                      ? unselectNFT(getNFTId(nft))
                      : selectNFT(getNFTId(nft))
                  }
                  onPress={() => handleNFTPress(nft)}
                />
              ))}
            </XStack>
          )}
        </ScrollView>
      </YStack>

      {/* Bottom Action Bar */}
      {selectedNFTsList.length > 0 && (
        <View p="$4" borderTopWidth={1} borderTopColor="$borderColor">
          <XStack items="center" justify="space-between" mb="$3">
            <Text fontSize="$4" fontWeight="500" color="$color">
              {t('nft.selectedCount', { count: selectedNFTsList.length })}
            </Text>
          </XStack>

          <XStack space="$3">
            <Button variant="secondary" flex={1} onPress={() => setSelectedIds([])}>
              <Text>{t('common.clear')}</Text>
            </Button>

            <Button variant="primary" flex={1} onPress={handleConfirm}>
              <Text>{t('nft.confirmCount', { count: selectedNFTsList.length })}</Text>
            </Button>
          </XStack>
        </View>
      )}
    </View>
  );
}
