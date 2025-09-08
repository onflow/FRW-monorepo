import { type WalletAccount, type NFTModel } from '@onflow/frw-types';
import { getNFTCover, isERC1155 } from '@onflow/frw-utils';
import { useNavigation } from '@react-navigation/native';
import type { NavigationProp } from '@react-navigation/native';
import { View, Image, TouchableOpacity } from 'react-native';

import { IconView } from '@/components/ui/media/IconView';
import type { RootStackParamList } from '@/navigation/AppNavigator';
import { CheckCircle as CheckCircleIcon, CheckCircleFill as CheckCircleFillIcon } from 'icons';
import ChevronRight from 'icons/ChevronRight';
import { Text } from 'ui';

interface NFTListCardProps {
  nft: NFTModel;
  selected: boolean;
  onSelect: () => void;
  fromAccount?: WalletAccount;
  selectedNFTs?: NFTModel[];
  onSelectionChange?: (nftId: string, selected: boolean) => void;
}

export default function NFTListCard({
  nft,
  selected,
  onSelect,
  fromAccount,
  selectedNFTs,
  onSelectionChange,
}: NFTListCardProps) {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  function onPress() {
    onSelect(); // Handle selection logic
  }

  function onDetailPress() {
    navigation.navigate('NFTDetail', {
      nft: nft,
      selectedNFTs: selectedNFTs || [],
      onSelectionChange: onSelectionChange,
    });
  }

  return (
    <View className="w-full">
      <View className="bg-background-base rounded-lg relative p-1">
        {/* NFT Image */}
        <TouchableOpacity
          onPress={onDetailPress}
          className="rounded-lg overflow-hidden aspect-square bg-sf-1 mb-2"
        >
          <IconView
            src={getNFTCover(nft)}
            size={200}
            borderRadius={8}
            resizeMode="cover"
            fillContainer={true}
          />
          {/* ERC1155 Account Badge */}
          {isERC1155(nft) && nft.amount && (
            <View className="absolute top-2 left-2 bg-sf-1 rounded-full px-2 py-1">
              <Text className="text-fg-1 text-xs font-medium font-inter">{nft.amount}</Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Title */}
        <Text className="font-semibold text-fg-1 text-base" numberOfLines={1}>
          {nft.name}
        </Text>
        {/* Account Info Row */}
        {fromAccount && (
          <View className="flex-row items-center">
            {/* Account Emoji/Avatar */}
            <View
              className="w-4 h-4 rounded-full mr-1 bg-surface-2 items-center justify-center overflow-hidden"
              style={{
                backgroundColor: fromAccount.emojiInfo?.color || '#FFBD68',
                width: 15.36,
                height: 15.36,
              }}
            >
              {fromAccount.avatar ? (
                // Display image for child account avatars
                <Image
                  source={{ uri: fromAccount.avatar }}
                  style={{
                    width: 15.36,
                    height: 15.36,
                    borderRadius: 7.68,
                  }}
                  resizeMode="cover"
                />
              ) : (
                // Display emoji text for regular accounts
                <Text
                  style={{
                    fontSize: 11.52,
                    fontWeight: '600',
                    lineHeight: 15.36,
                    textAlign: 'center',
                    width: 15.36,
                    height: 15.36,
                  }}
                >
                  {fromAccount.emojiInfo?.emoji || '🦊'}
                </Text>
              )}
            </View>

            <Text
              className="text-fg-2 flex-1"
              style={{
                fontSize: 14,
                fontWeight: '300',
                opacity: 0.6,
              }}
              numberOfLines={1}
            >
              {fromAccount.name}
            </Text>
          </View>
        )}

        {/* Chevron Right Arrow - positioned at bottom-right corner */}
        <TouchableOpacity
          onPress={onDetailPress}
          className="absolute"
          style={{ bottom: 8, right: 8 }}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <ChevronRight width={24} height={24} color="rgba(255, 255, 255, 0.5)" />
        </TouchableOpacity>
        {/* Selection Button */}
        <TouchableOpacity
          onPress={onPress}
          className="absolute"
          style={{ top: 10, right: 16 }}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          {selected ? (
            <CheckCircleFillIcon width={24} height={24} />
          ) : (
            <CheckCircleIcon width={24} height={24} />
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}
