import React, { useState } from 'react';
import { View, ScrollView, TouchableOpacity } from 'react-native';
import { Text } from 'ui';
import { Trash as TrashIcon } from 'icons';
import { IconView } from '@/components/ui/media/IconView';
import { useTheme } from '@/contexts/ThemeContext';
import { ChevronDown, ChevronUp } from 'icons';
import { type ExpandedNFTData } from '@/types';

interface MultipleNFTsPreviewProps {
  nfts: any[];
  selectedNFTs: any[];
  onRemoveNFT: (nftId: string) => void;
}

interface ExpandedNFTItemProps {
  nft: ExpandedNFTData;
  onRemove: (nftId: string) => void;
}

const ExpandedNFTItem = ({ nft, onRemove }: ExpandedNFTItemProps) => {
  return (
    <View style={{ paddingHorizontal: 1, paddingVertical: 8 }}>
      <View className="flex-row items-start" style={{ gap: 12, height: 60 }}>
        {/* NFT Image */}
        <IconView
          src={
            nft?.thumbnail && typeof nft.thumbnail === 'string' && nft.thumbnail.trim() !== ''
              ? nft.thumbnail
              : ''
          }
          size={70}
          borderRadius={16}
          resizeMode="cover"
        />

        {/* NFT Details */}
        <View className="flex-1" style={{ gap: 4, justifyContent: 'center' }}>
          <Text
            className="text-fg-1"
            style={{
              fontSize: 14,
              fontWeight: '600',
              lineHeight: 20,
              letterSpacing: -0.006,
              includeFontPadding: false,
            }}
          >
            {nft.name}
          </Text>
          <Text
            className="text-fg-2"
            style={{
              fontSize: 14,
              fontWeight: '400',
              lineHeight: 16,
              letterSpacing: -0.006,
              includeFontPadding: false,
            }}
            disableAndroidFix={true}
          >
            {nft.collectionName}
          </Text>
        </View>

        {/* Trash Icon for Delete */}
        <TouchableOpacity
          style={{
            width: 24,
            height: 24,
            alignItems: 'center',
            justifyContent: 'center',
            padding: 2,
          }}
          onPress={() => nft.id && onRemove(nft.id)}
          activeOpacity={0.7}
        >
          <TrashIcon width={24} height={24} color="rgba(255, 255, 255, 0.5)" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export const MultipleNFTsPreview = ({
  nfts,
  selectedNFTs,
  onRemoveNFT,
}: MultipleNFTsPreviewProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { isDark } = useTheme();

  // Create expanded NFT list from the selected NFTs for display
  const expandedNFTList: any[] = selectedNFTs.map(nft => ({
    id: nft.id,
    name: nft.name,
    collectionName: nft.collectionName,
    thumbnail: nft.thumbnail,
    isSelected: true,
  }));

  if (isExpanded) {
    return (
      <View>
        {/* Header Row */}
        <View
          className="flex-row items-center justify-between"
          style={{ width: '100%', marginBottom: 16 }}
        >
          <Text
            className="text-fg-1"
            style={{
              fontSize: 20,
              fontWeight: '500',
              lineHeight: 24,
              includeFontPadding: false,
              flex: 1,
              marginRight: 12,
            }}
            numberOfLines={1}
            adjustsFontSizeToFit={true}
            minimumFontScale={0.9}
            disableAndroidFix={true}
          >
            {selectedNFTs.length} NFT{selectedNFTs.length !== 1 ? 's' : ''}
          </Text>
          <TouchableOpacity
            style={{
              width: 24,
              height: 24,
              alignItems: 'center',
              justifyContent: 'center',
            }}
            onPress={() => setIsExpanded(false)}
          >
            <ChevronUp width={20} height={20} />
          </TouchableOpacity>
        </View>

        {/* Expanded List */}
        <View
          style={{
            borderRadius: 16,
            width: '100%',
            maxHeight: 300,
            overflow: 'hidden',
          }}
        >
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingVertical: 4 }}
            nestedScrollEnabled={true}
          >
            {expandedNFTList.map((nft, index) => (
              <View key={nft.id}>
                <ExpandedNFTItem nft={nft} onRemove={onRemoveNFT} />
                {/* Show divider between items, but not after the last item */}
                {index < expandedNFTList.length - 1 && (
                  <View
                    style={{
                      height: 1,
                      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 13, 7, 0.1)',
                      marginHorizontal: 1,
                      marginVertical: 12,
                    }}
                  />
                )}
              </View>
            ))}
          </ScrollView>
        </View>
      </View>
    );
  }

  return (
    <View className="flex-row items-center justify-between">
      {/* NFT Thumbnails with proper spacing */}
      <View className="flex-row items-center" style={{ gap: 9 }}>
        {(() => {
          const maxVisible = 3;
          const totalNFTs = expandedNFTList.length;
          const visibleNfts = nfts.slice(0, maxVisible);
          const remainingCount = Math.max(0, totalNFTs - maxVisible);

          return (
            <>
              {visibleNfts.map((nft, index) => {
                const isLast = index === visibleNfts.length - 1;
                const shouldShowOverlay = isLast && remainingCount > 0;

                return (
                  <View
                    key={index}
                    style={{
                      marginLeft: index === 2 ? -0.5 : 0,
                      position: 'relative',
                    }}
                  >
                    <IconView
                      src={
                        nft?.thumbnail &&
                        typeof nft.thumbnail === 'string' &&
                        nft.thumbnail.trim() !== ''
                          ? nft.thumbnail
                          : ''
                      }
                      size={77.33}
                      borderRadius={14.4}
                      resizeMode="cover"
                    />

                    {/* Dynamic overlay - only show when there are remaining NFTs */}
                    {shouldShowOverlay && (
                      <>
                        {/* Dark overlay */}
                        <View
                          style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            backgroundColor: 'rgba(0, 0, 0, 0.5)',
                            borderRadius: 14.4,
                          }}
                        />
                        {/* Dynamic remaining count text */}
                        <Text
                          style={{
                            position: 'absolute',
                            left: 15.84,
                            top: 25.2,
                            width: 40.5,
                            height: 22,
                            fontSize: 21.6,
                            fontWeight: '700',
                            lineHeight: 21.6,
                            letterSpacing: -0.006,
                            color: '#FFFFFF',
                            opacity: 0.6,
                            includeFontPadding: false,
                            textAlign: 'center',
                          }}
                          disableAndroidFix={true}
                        >
                          +{remainingCount}
                        </Text>
                      </>
                    )}
                  </View>
                );
              })}
            </>
          );
        })()}
      </View>

      {/* Chevron Down */}
      <TouchableOpacity style={{ width: 21.6, height: 21.6 }} onPress={() => setIsExpanded(true)}>
        <ChevronDown width={21.6} height={21.6} />
      </TouchableOpacity>
    </View>
  );
};
