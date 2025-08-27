import { NFTService } from '@onflow/frw-services';
import { sendSelectors, useSendStore } from '@onflow/frw-stores';
import { type CollectionModel, type NFTModel, addressType } from '@onflow/frw-types';
import { getCollectionLogo, getNFTId } from '@onflow/frw-utils';
import { useRoute } from '@react-navigation/native';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Dimensions, FlatList, TouchableOpacity, View } from 'react-native';

import BottomConfirmBar, { type BottomConfirmBarRef } from '@/components/NFTList/BottomConfirmBar';
import NFTListCard from '@/components/NFTList/NFTListCard';
import { IconView } from '@/components/ui/media/IconView';
import { useTheme } from '@/contexts/ThemeContext';
import { AddressSearchBox } from '@/screens/Send/SendTo/components/AddressSearchBox';
import { BackgroundWrapper, Skeleton, Text } from 'ui';

export default function NFTListScreen() {
  const { t } = useTranslation();
  const route = useRoute();
  const { isDark } = useTheme();
  // Get collection information from route parameters first
  const routeParams = route.params as
    | {
        collection?: CollectionModel;
        address?: string;
        selectedNFTIds?: string[];
        isEditing?: boolean;
      }
    | undefined;
  const collection = routeParams?.collection;
  const address = routeParams?.address;
  const preSelectedNFTIds = routeParams?.selectedNFTIds || [];
  const isEditing = routeParams?.isEditing || false;
  const collectionName = collection?.name || 'NBA Top Shot';

  const [search, setSearch] = useState('');
  const [nfts, setNfts] = useState<NFTModel[]>([]);
  const [nftLoading, setNftLoading] = useState(false);
  const [nftError, setNftError] = useState<string | null>(null);
  // Local state for NFT selection (replaces useNFTListSelect hook)

  const [selectedIds, setSelectedIds] = useState<string[]>(preSelectedNFTIds);
  const [isDrawerExpanded, setIsDrawerExpanded] = useState(false);
  const bottomConfirmBarRef = useRef<BottomConfirmBarRef>(null);

  // Keep default header configuration - no background changes needed
  // The header will use the default navigation theme colors

  const selectNFT = useCallback(
    (id: string) => {
      if (selectedIds.includes(id)) return true;
      if (selectedIds.length >= 9) {
        Alert.alert(t('alerts.notice'), t('alerts.maxNFTSelection'));
        return false;
      }
      setSelectedIds(prev => [...prev, id]);
      return true;
    },
    [selectedIds]
  );

  const unselectNFT = useCallback((id: string) => {
    setSelectedIds(prev => prev.filter(_id => _id !== id));
  }, []);

  const isSelected = useCallback((id: string) => selectedIds.includes(id), [selectedIds]);

  const getCollectionImage = () => {
    // Try logoURI first, then logo
    return getCollectionLogo(collection) || collection?.logoURI || collection?.logo || '';
  };

  const collectionImage = getCollectionImage();

  // Get fromAccount from send store
  const fromAccountForCard = useSendStore(sendSelectors.fromAccount);

  // Fetch NFTs from the collection
  const fetchNFTs = async () => {
    if (!collection || !address) {
      setNfts([]);
      return;
    }

    setNftLoading(true);
    setNftError(null);

    try {
      // Determine wallet type and create NFT service
      const walletType = addressType(address);
      const nftService = new NFTService(walletType);
      const nftModels = await nftService.getNFTs(address, collection, 0, 50);
      setNfts(nftModels);
    } catch (err: any) {
      console.error('[NFT] Failed to fetch NFTs:', err?.message || 'Unknown error');
      setNftError(err?.message || 'Failed to load NFTs');
      setNfts([]);
    } finally {
      setNftLoading(false);
    }
  };

  // Fetch NFTs when component mounts or collection changes
  useEffect(() => {
    fetchNFTs();
  }, [collection, address]);

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
      if (!nft) return null;
      return nft;
    })
    .filter(Boolean) as NFTModel[];

  // Handle NFT removal from the bottom bar
  const handleRemoveNFT = (nftId: string) => {
    unselectNFT(nftId);
  };

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

  // Calculate item width for consistent sizing
  const { width: screenWidth } = Dimensions.get('window');
  const containerPadding = 32; // 20px on each side
  const gap = 16;
  const itemWidth = (screenWidth - containerPadding - gap) / 2;

  return (
    <BackgroundWrapper>
      {/* Dark Tint Overlay - covers main content but not the BottomConfirmBar */}
      {isDrawerExpanded && (
        <Animated.View
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 10, // Lower z-index so it doesn't cover BottomConfirmBar
          }}
          pointerEvents="auto"
          onTouchEnd={() => {
            setIsDrawerExpanded(false);
            bottomConfirmBarRef.current?.collapse();
          }}
        />
      )}
      {/* Main Content */}
      <View className={`flex-1 ${isDark ? 'bg-surface-1' : 'bg-white'}`}>
        {/* Content Container with proper padding */}
        <View style={{ flex: 1, paddingHorizontal: 16, paddingTop: 6 }}>
          {/* Collection Info */}
          <View
            style={{
              marginBottom: 20,
              paddingVertical: 8,
              flexDirection: 'row',
              alignItems: 'flex-start', // Align icon with header text
              gap: 16,
              width: '100%',
              minHeight: 80,
            }}
          >
            {/* Larger Collection Image */}
            <IconView
              src={collectionImage}
              size={64}
              borderRadius={32}
              backgroundColor={isDark ? '#3A3A3E' : '#E9ECEF'}
              resizeMode="cover"
            />

            {/* Collection Info */}
            <View style={{ flex: 1, gap: 6 }}>
              <Text
                className="text-fg-1"
                disableAndroidFix={true}
                style={{
                  fontFamily: 'Inter',
                  fontWeight: '600', // semi-bold
                  fontSize: 16,
                  lineHeight: 19,
                  includeFontPadding: false,
                }}
                numberOfLines={2}
                ellipsizeMode="tail"
              >
                {collectionName}
              </Text>
              {!nftLoading && (
                <Text
                  className="text-fg-2"
                  disableAndroidFix={true}
                  style={{
                    fontFamily: 'Inter',
                    fontWeight: '400', // regular
                    fontSize: 12,
                    lineHeight: 15,
                    includeFontPadding: false,
                  }}
                >
                  {nfts.length} {nfts.length === 1 ? t('common.item') : t('common.items')}
                </Text>
              )}
              {collection?.description && (
                <Text
                  className="text-fg-3"
                  disableAndroidFix={true}
                  style={{
                    fontFamily: 'Inter',
                    fontWeight: '400', // regular
                    fontSize: 14,
                    lineHeight: 17,
                    includeFontPadding: false,
                  }}
                  numberOfLines={2}
                  ellipsizeMode="tail"
                >
                  {collection.description}
                </Text>
              )}
            </View>
          </View>

          {/* Search Bar */}
          <View style={{ marginBottom: 16 }}>
            <AddressSearchBox
              value={search}
              onChangeText={setSearch}
              placeholder={t('placeholders.searchNFTs')}
              showScanButton={false}
            />
          </View>

          {/* NFT Grid */}
          {nftLoading ? (
            <View>
              {/* Skeleton placeholder grid */}
              <View
                style={{
                  flexDirection: 'row',
                  flexWrap: 'wrap',
                  justifyContent: 'space-between',
                  paddingBottom: 80,
                }}
              >
                {[1, 2, 3, 4, 5, 6].map(index => (
                  <View
                    key={index}
                    style={{
                      width: '48%',
                      marginBottom: 16,
                      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
                      borderRadius: 12,
                      padding: 12,
                    }}
                  >
                    {/* Skeleton NFT image */}
                    <Skeleton
                      isDark={isDark}
                      style={{
                        width: '100%',
                        aspectRatio: 1,
                        borderRadius: 8,
                        marginBottom: 12,
                      }}
                    />
                    {/* Skeleton title */}
                    <Skeleton
                      isDark={isDark}
                      style={{
                        height: 16,
                        borderRadius: 4,
                        marginBottom: 8,
                      }}
                    />
                    {/* Skeleton author */}
                    <Skeleton
                      isDark={isDark}
                      style={{
                        height: 12,
                        width: '60%',
                        borderRadius: 4,
                      }}
                    />
                  </View>
                ))}
              </View>
            </View>
          ) : nftError ? (
            <View className="flex-1 justify-center items-center py-8">
              <Text className="text-error text-center mb-4">{nftError}</Text>
              <TouchableOpacity onPress={fetchNFTs} className="bg-primary px-4 py-2 rounded-lg">
                <Text className="text-white">{t('buttons.retry')}</Text>
              </TouchableOpacity>
            </View>
          ) : !nftLoading && filteredNFTs.length === 0 ? (
            <View
              className="flex-1 justify-center items-center"
              style={{ paddingVertical: 20, marginTop: -260 }}
            >
              {/* Title */}
              <Text
                className="text-fg-1 text-center mb-2"
                disableAndroidFix={true}
                style={{
                  fontFamily: 'Inter',
                  fontWeight: '600',
                  fontSize: 18,
                  lineHeight: 24,
                  includeFontPadding: false,
                }}
              >
                {search ? t('messages.noSearchResults') : t('messages.noNFTsFound')}
              </Text>

              {/* Description */}
              <Text
                className="text-fg-2 text-center mb-6"
                disableAndroidFix={true}
                style={{
                  fontFamily: 'Inter',
                  fontWeight: '400',
                  fontSize: 15,
                  lineHeight: 20,
                  includeFontPadding: false,
                  maxWidth: 280,
                }}
              >
                {search
                  ? t('messages.noNFTsMatchSearch', { search })
                  : t('messages.collectionEmpty')}
              </Text>

              {/* Action Button */}
              {search ? (
                <TouchableOpacity
                  onPress={() => setSearch('')}
                  style={{
                    backgroundColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.06)',
                    paddingHorizontal: 16,
                    paddingVertical: 10,
                    borderRadius: 10,
                    borderWidth: 1,
                    borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
                  }}
                >
                  <Text
                    className="text-fg-1 text-center"
                    disableAndroidFix={true}
                    style={{
                      fontFamily: 'Inter',
                      fontWeight: '500',
                      fontSize: 15,
                      includeFontPadding: false,
                    }}
                  >
                    {t('buttons.clearSearch')}
                  </Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  onPress={fetchNFTs}
                  style={{
                    backgroundColor: '#FFFFFF', // White background
                    paddingHorizontal: 24,
                    paddingVertical: 12,
                    borderRadius: 12,
                    alignItems: 'center', // Center text horizontally
                    justifyContent: 'center', // Center text vertically
                  }}
                >
                  <Text
                    disableAndroidFix={true}
                    style={{
                      fontFamily: 'Inter',
                      fontWeight: '600', // Semi-bold
                      fontSize: 15,
                      color: '#000000', // Black text
                      includeFontPadding: false,
                      textAlign: 'center',
                    }}
                  >
                    {t('buttons.refresh')}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          ) : (
            <FlatList
              data={filteredNFTs}
              keyExtractor={item => getNFTId(item)}
              numColumns={2}
              columnWrapperStyle={{ gap: 16 }}
              ItemSeparatorComponent={() => <View style={{ height: 16 }} />}
              renderItem={({ item }) => (
                <View style={{ width: itemWidth }}>
                  <NFTListCard
                    nft={item}
                    selected={isSelected(getNFTId(item))}
                    onSelect={() =>
                      isSelected(getNFTId(item))
                        ? unselectNFT(getNFTId(item))
                        : selectNFT(getNFTId(item))
                    }
                    fromAccount={fromAccountForCard || undefined}
                    selectedNFTs={nfts.filter((nft: NFTModel) => isSelected(getNFTId(nft)))}
                    onSelectionChange={handleSelectionChange}
                  />
                </View>
              )}
              contentContainerStyle={{ paddingBottom: 80 }} // Space for bottom bar
              showsVerticalScrollIndicator={false}
            />
          )}
        </View>
      </View>
      {/* Bottom Confirm Bar */}
      <BottomConfirmBar
        ref={bottomConfirmBarRef}
        selectedNFTs={selectedNFTsList}
        onRemoveNFT={handleRemoveNFT}
        onExpandedChange={setIsDrawerExpanded}
        isEditing={isEditing}
      />
    </BackgroundWrapper>
  );
}
