import React from 'react';
import { View } from 'react-native';
import { Text } from 'ui';
import { IconView } from '@/components/ui/media/IconView';

interface NFT {
  id: string | number;
  name?: string;
  thumbnail?: string | object;
}

interface NFTDisplayGridProps {
  nfts: NFT[];
  transactionType: string;
}

export const NFTDisplayGrid: React.FC<NFTDisplayGridProps> = ({ nfts, transactionType }) => {
  if ((transactionType !== 'single-nft' && transactionType !== 'multiple-nfts') || !nfts?.length) {
    return null;
  }

  const maxVisible = 3;

  // Enhanced debug logging
  console.log('[NFTDisplayGrid] NFT Data Debug:', {
    hasNfts: !!nfts,
    nftsLength: nfts.length,
    transactionType,
    processedNfts: nfts.map((nft, index) => ({
      index,
      id: nft?.id,
      name: nft?.name,
      thumbnail: nft?.thumbnail,
      thumbnailType: typeof nft?.thumbnail,
      hasValidThumbnail: !!(
        nft?.thumbnail &&
        typeof nft?.thumbnail === 'string' &&
        nft?.thumbnail.trim() !== ''
      ),
    })),
  });

  const visibleNFTs = Math.min(nfts.length, maxVisible);
  const showExtraCount = nfts.length > maxVisible;

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 14.4,
        width: 304,
      }}
    >
      {Array.from({ length: visibleNFTs }, (_, index) => {
        const nft = nfts[index];
        const isLast = index === visibleNFTs - 1;
        const shouldShowOverlay = isLast && showExtraCount;
        const hasNFT = !!nft;

        return (
          <View
            key={index}
            style={{
              width: 77.33,
              height: 77.33,
              borderRadius: 14.4,
              backgroundColor: hasNFT ? 'transparent' : '#333',
              position: 'relative',
            }}
          >
            <IconView
              src={
                hasNFT &&
                nft.thumbnail &&
                typeof nft.thumbnail === 'string' &&
                nft.thumbnail.trim() !== ''
                  ? nft.thumbnail
                  : ''
              }
              size={77.33}
              borderRadius={14.4}
              backgroundColor={hasNFT ? 'transparent' : '#333'}
              resizeMode="cover"
              fillContainer={true}
            />

            {/* Overlay on the 3rd NFT when there are more */}
            {shouldShowOverlay && (
              <View
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  backgroundColor: 'rgba(0, 0, 0, 0.6)',
                  borderRadius: 14.4,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Text
                  style={{
                    fontSize: 21.6,
                    fontWeight: '700',
                    lineHeight: 21.6,
                    letterSpacing: -0.6,
                    color: '#FFFFFF',
                    opacity: 0.6,
                    textAlign: 'center',
                  }}
                  disableAndroidFix={true}
                >
                  +{nfts.length - maxVisible}
                </Text>
              </View>
            )}
          </View>
        );
      })}
    </View>
  );
};
