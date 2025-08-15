import { useWalletStore } from '@onflow/frw-stores';
import { ScrollView, View, Text, Button, XStack, YStack, Image, Avatar } from '@onflow/frw-ui';
import { getNFTCover } from '@onflow/frw-utils';
import React, { useState } from 'react';

import type { BaseScreenProps } from '../types';

interface NFTModel {
  id: string;
  name: string;
  description?: string;
  collectionName?: string;
  contractName?: string;
  contractAddress?: string;
  collectionContractName?: string;
  thumbnail?: string;
  type: any;
}

interface PropertyTagProps {
  label: string;
  value: string;
}

const PropertyTag: React.FC<PropertyTagProps> = ({ label, value }) => (
  <View bg="$bg2" borderRadius="$10" px="$3" py="$1.5">
    <XStack items="center" space="$1">
      <Text color="$textSecondary" fontSize="$3">
        {label}:
      </Text>
      <Text color="$color" fontSize="$3" fontWeight="500">
        {value}
      </Text>
    </XStack>
  </View>
);

interface NFTDetailScreenProps extends BaseScreenProps {
  // NFT data
  nft?: NFTModel;

  // Selection functionality
  selectedNFTs?: Array<{
    id: string;
    name: string;
    collectionName: string;
    type: any;
  }>;

  // Callbacks
  onSelectionChange?: (nftId: string, isSelected: boolean) => void;
  onConfirmSelection?: (selectedNFTs: NFTModel[]) => void;
}

export const NFTDetailScreen: React.FC<NFTDetailScreenProps> = ({
  navigation,
  bridge,
  t,
  nft,
  selectedNFTs,
  onSelectionChange,
  onConfirmSelection,
}) => {
  const { activeAccount } = useWalletStore();

  // Determine if selection is enabled: selection is allowed when selectedNFTs is not undefined/null
  const isSelectable = selectedNFTs !== undefined && selectedNFTs !== null;

  // Check if current NFT is in selected list (only when selection is enabled)
  const initialSelected =
    isSelectable && selectedNFTs.some((selectedNFT) => selectedNFT.id === nft?.id);
  const [isSelected, setIsSelected] = useState(initialSelected);

  const toggleSelection = () => {
    if (isSelectable && nft) {
      const newSelectedState = !isSelected;
      setIsSelected(newSelectedState);

      // Communicate the change back to the parent screen
      if (onSelectionChange) {
        onSelectionChange(nft.id, newSelectedState);
      }
    }
  };

  const handleConfirm = () => {
    if (isSelectable && selectedNFTs && onConfirmSelection) {
      // Create current selected NFTs array based on actual selection state
      const otherSelectedNFTs = selectedNFTs.filter((selectedNFT) => selectedNFT.id !== nft?.id);
      const currentSelectedNFTs =
        isSelected && nft ? [...otherSelectedNFTs, nft] : otherSelectedNFTs;
      onConfirmSelection(currentSelectedNFTs);
    }
  };

  if (!nft) {
    return (
      <View flex={1} items="center" justify="center" bg="$background">
        <Text color="$color">NFT not found</Text>
      </View>
    );
  }

  // Create dynamic properties based on available NFT data
  const getProperties = () => {
    const props: Array<{ label: string; value: string }> = [];

    if (nft.id) {
      props.push({ label: 'ID', value: nft.id });
    }
    if (nft.contractName) {
      props.push({ label: 'Contract', value: nft.contractName });
    }
    if (nft.contractAddress) {
      props.push({ label: 'Address', value: `${nft.contractAddress.slice(0, 8)}...` });
    }
    if (nft.collectionContractName && nft.collectionContractName !== nft.contractName) {
      props.push({ label: 'Collection Contract', value: nft.collectionContractName });
    }

    // Group properties into rows of max 2 items each
    const grouped: Array<Array<{ label: string; value: string }>> = [];
    for (let i = 0; i < props.length; i += 2) {
      grouped.push(props.slice(i, i + 2));
    }

    return grouped;
  };

  const properties = getProperties();

  return (
    <View flex={1} bg="$background">
      <ScrollView flex={1} showsVerticalScrollIndicator={false}>
        <YStack px="$4" pt="$6" pb="$6">
          {/* NFT Image */}
          <YStack mb="$6" position="relative">
            <View
              width="100%"
              aspectRatio={1}
              bg="$bg2"
              borderRadius="$4"
              mb="$6"
              overflow="hidden"
            >
              <Image
                source={{ uri: getNFTCover(nft) }}
                width="100%"
                height="100%"
                borderRadius="$4"
                resizeMode="cover"
              />
            </View>

            {/* Selection Button - only shown when selection is enabled */}
            {isSelectable && (
              <Button
                position="absolute"
                top="$3"
                right="$3"
                size="small"
                variant={isSelected ? 'primary' : 'outline'}
                onPress={toggleSelection}
                circular
                width={32}
                height={32}
              >
                <Text fontSize="$2">{isSelected ? '✓' : '○'}</Text>
              </Button>
            )}
          </YStack>

          {/* NFT Info */}
          <YStack mb="$8">
            <YStack mb="$5">
              <XStack items="center" justify="space-between" mb="$2">
                <Text color="$color" fontSize="$8" fontWeight="600">
                  {nft.name || 'Untitled NFT'}
                </Text>
                {activeAccount && (
                  <Avatar size={24} fallback={activeAccount.emojiInfo?.emoji || '👤'} />
                )}
              </XStack>
              <Text color="$textSecondary" fontSize="$3">
                {nft.collectionName || ' '}
              </Text>
            </YStack>

            {/* About Section */}
            {nft.description && (
              <YStack mb="$5">
                <Text color="$color" fontSize="$3" fontWeight="500" mb="$2">
                  About
                </Text>
                <Text color="$textSecondary" fontSize="$3" lineHeight="$1">
                  {nft.description}
                </Text>
              </YStack>
            )}

            {/* Properties Section */}
            {properties.length > 0 && (
              <YStack>
                <Text color="$color" fontSize="$3" fontWeight="500" mb="$2">
                  Properties
                </Text>
                <YStack space="$2">
                  {properties.map((row, rowIndex) => (
                    <XStack key={rowIndex} space="$2" flexWrap="wrap">
                      {row.map((property, propIndex) => (
                        <PropertyTag
                          key={`${rowIndex}-${propIndex}`}
                          label={property.label}
                          value={property.value}
                        />
                      ))}
                    </XStack>
                  ))}
                </YStack>
              </YStack>
            )}
          </YStack>
        </YStack>
      </ScrollView>

      {/* Bottom Action Bar - only shown when selection is enabled */}
      {isSelectable && (
        <View p="$4" borderTopWidth={1} borderTopColor="$borderColor">
          <XStack space="$3">
            <Button variant="secondary" flex={1} onPress={() => navigation.goBack()}>
              <Text>{t('common.cancel')}</Text>
            </Button>

            <Button variant="primary" flex={1} onPress={handleConfirm}>
              <Text>{t('common.confirm')}</Text>
            </Button>
          </XStack>
        </View>
      )}
    </View>
  );
};

export default NFTDetailScreen;
