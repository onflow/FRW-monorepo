import { useState, useEffect } from 'react';
import { View, TouchableOpacity, Image } from 'react-native';
import { SvgUri } from 'react-native-svg';
import { Text } from '../typography/text';
import { Divider } from '../layout/divider';
import { ArrowRight } from 'icons';
import { CollectionModel } from '@/types/NFTModel';
import { useTheme } from '@/contexts/ThemeContext';

interface NFTCollectionRowProps {
  collection?: CollectionModel;
  showDivider?: boolean;
  onPress?: () => void;
}

export function NFTCollectionRow({ collection, showDivider, onPress }: NFTCollectionRowProps) {
  const { isDark } = useTheme();
  const [imageError, setImageError] = useState(false);
  const [svgLoadAttempted, setSvgLoadAttempted] = useState(false);

  // Reset image error when collection changes
  useEffect(() => {
    setImageError(false);
    setSvgLoadAttempted(false);
  }, [collection?.id, collection?.logoURI, collection?.logo]);

  // Add timeout for SVG loading
  useEffect(() => {
    const collectionImage = getCollectionImage();
    const isImageSvg = typeof collectionImage === 'string' && isSvgUrl(collectionImage);

    if (isImageSvg && !imageError && !svgLoadAttempted) {
      setSvgLoadAttempted(true);
      const timeout = setTimeout(() => {
        console.log(`[NFTCollectionRow] SVG timeout for ${collection?.name}, using placeholder`);
        setImageError(true);
      }, 3000); // 3 second timeout

      return () => clearTimeout(timeout);
    }
  }, [collection, imageError, svgLoadAttempted]);

  if (!collection) {
    return null;
  }

  const count = collection?.count && collection.count > 0 ? `${collection.count} items` : '';

  // Get the appropriate placeholder image based on collection name
  const getPlaceholderImage = () => {
    // Default placeholder for any other collection
    return require('@/assets/placeholder_nft.png');
  };

  // Helper function to detect if URL is an SVG
  const isSvgUrl = (url: string): boolean => {
    return url.toLowerCase().endsWith('.svg') || url.toLowerCase().includes('.svg');
  };

  const getCollectionImage = () => {
    // If there's an error or no logoURI/logo, use placeholder
    if (imageError || (!collection?.logoURI && !collection?.logo)) {
      return getPlaceholderImage();
    }

    // Try logoURI first, then logo
    const imageUrl = collection.logoURI || collection.logo;
    return imageUrl;
  };

  const collectionImage = getCollectionImage();
  const isImageSvg = typeof collectionImage === 'string' && isSvgUrl(collectionImage);
  const shouldShowPlaceholder = imageError || (!collection?.logoURI && !collection?.logo);

  return (
    <>
      <TouchableOpacity activeOpacity={0.7} onPress={onPress}>
        <View className="flex-row items-center py-4 px-0 w-full gap-4">
          {/* Collection Image */}
          <View
            style={{
              width: 54,
              height: 54,
              borderRadius: 27,
              backgroundColor: isDark ? '#3A3A3E' : '#E9ECEF',
              overflow: 'hidden',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            {shouldShowPlaceholder ? (
              // Always show placeholder when needed
              <Image
                source={getPlaceholderImage()}
                style={{
                  width: 54,
                  height: 54,
                  borderRadius: 27,
                }}
                resizeMode="cover"
                onError={error => {
                  console.log(
                    `[NFTCollectionRow] Placeholder image failed to load for ${collection?.name}:`,
                    {
                      error: error.nativeEvent?.error,
                    }
                  );
                }}
              />
            ) : isImageSvg ? (
              (() => {
                // Set a timeout to fallback to placeholder if SVG doesn't load
                if (!svgLoadAttempted) {
                  setSvgLoadAttempted(true);
                  setTimeout(() => {
                    if (!imageError) {
                      console.log(
                        `[NFTCollectionRow] SVG timeout for ${collection?.name}, using placeholder`
                      );
                      setImageError(true);
                    }
                  }, 3000); // 3 second timeout
                }

                return (
                  <SvgUri
                    uri={collectionImage as string}
                    width={54}
                    height={54}
                    onError={(error: any) => {
                      console.log(
                        `[NFTCollectionRow] SVG image failed to load for ${collection?.name}:`,
                        {
                          imageUrl: collectionImage,
                          collectionId: collection?.id,
                          error: error?.message || 'SVG load error',
                        }
                      );
                      setImageError(true);
                    }}
                    onLoad={() => {
                      console.log(
                        `[NFTCollectionRow] SVG image loaded successfully for ${collection?.name}`
                      );
                    }}
                  />
                );
              })()
            ) : (
              <Image
                source={{ uri: collectionImage as string, cache: 'default' }}
                style={{
                  width: 54,
                  height: 54,
                  borderRadius: 27,
                }}
                resizeMode="cover"
                onError={error => {
                  console.log(
                    `[NFTCollectionRow] Collection image failed to load for ${collection?.name}:`,
                    {
                      imageUrl: collectionImage,
                      collectionId: collection?.id,
                      error: error.nativeEvent?.error,
                    }
                  );
                  setImageError(true);
                }}
                onLoad={() => {
                  console.log(
                    `[NFTCollectionRow] Collection image loaded successfully for ${collection?.name}`
                  );
                }}
              />
            )}
          </View>

          <View className="flex-1 ml-0.5 gap-1">
            <Text className="text-fg-1 font-semibold text-base">{collection?.name}</Text>
            <Text className="text-fg-2 text-sm">{count}</Text>
          </View>
          <ArrowRight />
        </View>
      </TouchableOpacity>
      {showDivider && <Divider />}
    </>
  );
}
