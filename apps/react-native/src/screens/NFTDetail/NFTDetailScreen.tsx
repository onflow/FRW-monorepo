import { useWalletStore } from '@onflow/frw-stores';
import { getNFTCover } from '@onflow/frw-utils';
import { useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import React, { useState } from 'react';
import { View, ScrollView, TouchableOpacity } from 'react-native';

import BottomConfirmBar from '@/components/NFTList/BottomConfirmBar';
import { IconView } from '@/components/ui/media/IconView';
import type { RootStackParamList } from '@/navigation/AppNavigator';
import { CheckCircle as CheckCircleIcon, CheckCircleFill as CheckCircleFillIcon } from 'icons';
import { BackgroundWrapper, Text, WalletAvatar } from 'ui';



interface PropertyTagProps {
  label: string;
  value: string;
}

const PropertyTag: React.FC<PropertyTagProps> = ({ label, value }) => (
  <View className="bg-sf-1 rounded-full px-3 py-1.5 flex-row items-center gap-1">
    <Text className="text-fg-2 text-sm">{label}:</Text>
    <Text className="text-fg-1 text-sm font-medium">{value}</Text>
  </View>
);

export const NFTDetailScreen: React.FC = () => {
  const route = useRoute<RouteProp<RootStackParamList, 'NFTDetail'>>();
  const { activeAccount } = useWalletStore();

  const { nft, selectedNFTs, onSelectionChange } = route.params || {};

  // Determine if selection is enabled: selection is allowed when selectedNFTs is not undefined/null
  const isSelectable = selectedNFTs !== undefined && selectedNFTs !== null;

  // Check if current NFT is in selected list (only when selection is enabled)
  const initialSelected =
    isSelectable && selectedNFTs.some(selectedNFT => selectedNFT.id === nft?.id);
  const [isSelected, setIsSelected] = useState(initialSelected);

  // Calculate total selected count (including current NFT state change)

  // Create current selected NFTs array based on actual selection state
  const getCurrentSelectedNFTs = () => {
    if (!isSelectable || !selectedNFTs || !nft) return [];

    const otherSelectedNFTs = selectedNFTs.filter(selectedNFT => selectedNFT.id !== nft.id);
    return isSelected ? [...otherSelectedNFTs, nft] : otherSelectedNFTs;
  };

  const currentSelectedNFTs = getCurrentSelectedNFTs();

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

  const handleRemoveNFT = (nftId: string) => {
    if (onSelectionChange) {
      onSelectionChange(nftId, false);
    }
    // If the removed NFT is the current one, update local state
    if (nft?.id === nftId) {
      setIsSelected(false);
    }
  };

  if (!nft) {
    return (
      <BackgroundWrapper>
        <View className="flex-1 items-center justify-center">
          <Text className="text-fg-1">NFT not found</Text>
        </View>
      </BackgroundWrapper>
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
    <BackgroundWrapper>
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="px-4 pt-6 pb-6">
          {/* NFT Image */}
          <View className="relative mb-6">
            <View className="w-full aspect-square bg-sf-1 rounded-2xl mb-6 overflow-hidden">
              <IconView
                src={getNFTCover(nft)}
                borderRadius={16}
                resizeMode="cover"
                fillContainer={true}
              />
            </View>

            {/* Selection Button - only shown when selection is enabled */}
            {isSelectable && (
              <TouchableOpacity
                onPress={toggleSelection}
                className="absolute top-3 right-3"
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                {isSelected ? (
                  <CheckCircleFillIcon width={24} height={24} />
                ) : (
                  <CheckCircleIcon width={24} height={24} />
                )}
              </TouchableOpacity>
            )}
          </View>

          {/* NFT Info */}
          <View className="mb-8">
            <View className="mb-5">
              <View className="flex-row items-center justify-between mb-2">
                <Text className="text-fg-1 text-2xl font-semibold">
                  {nft.name || 'Untitled NFT'}
                </Text>
                {activeAccount && (
                  <WalletAvatar
                    value={activeAccount.avatar || activeAccount.emojiInfo?.emoji || '👤'}
                    fallback={activeAccount.emojiInfo?.emoji || '👤'}
                    size={24}
                    backgroundColor={activeAccount.emojiInfo?.color}
                  />
                )}
              </View>
              <Text className="text-fg-2 text-sm">{nft.collectionName || ' '}</Text>
            </View>

            {/* About Section */}
            {nft.description && (
              <View className="mb-5">
                <Text className="text-fg-1 text-sm font-medium mb-2">About</Text>
                <Text className="text-fg-2 text-sm font-light leading-5">{nft.description}</Text>
              </View>
            )}

            {/* Properties Section */}
            {properties.length > 0 && (
              <View>
                <Text className="text-fg-1 text-sm font-medium mb-2">Properties</Text>
                <View className="gap-y-2">
                  {properties.map((row, rowIndex) => (
                    <View key={rowIndex} className="flex-row gap-x-2 flex-wrap">
                      {row.map((property, propIndex) => (
                        <PropertyTag
                          key={`${rowIndex}-${propIndex}`}
                          label={property.label}
                          value={property.value}
                        />
                      ))}
                    </View>
                  ))}
                </View>
              </View>
            )}
          </View>
        </View>
      </ScrollView>

      {/* Bottom Confirm Bar - only shown when selection is enabled and NFTs are selected */}
      {isSelectable && currentSelectedNFTs.length > 0 && (
        <BottomConfirmBar selectedNFTs={currentSelectedNFTs} onRemoveNFT={handleRemoveNFT} />
      )}
    </BackgroundWrapper>
  );
};

export default NFTDetailScreen;
