import { type WalletAccount, type NFTModel } from '@onflow/frw-types';
import { isERC1155 } from '@onflow/frw-utils';
import { useNavigation } from '@react-navigation/native';
import type { NavigationProp } from '@react-navigation/native';
import { View, Image, TouchableOpacity } from 'react-native';

import { IconView } from '@/components/ui/media/IconView';
import type { RootStackParamList } from '@/navigation/AppNavigator';
import { CheckCircle as CheckCircleIcon, CheckCircleFill as CheckCircleFillIcon } from 'icons';
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
            src={nft.thumbnail || ''}
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
        {/* From Account */}
        {fromAccount && (
          <View className="flex-row items-center">
            {/* Account Emoji/Avatar */}
            <View
              className="w-5 h-5 rounded-full mr-2 bg-surface-2 items-center justify-center overflow-hidden"
              style={{
                backgroundColor: fromAccount.emojiInfo?.color || 'rgba(214, 214, 214, 1)',
              }}
            >
              {fromAccount.avatar ? (
                // Display image for child account avatars
                <Image
                  source={{ uri: fromAccount.avatar }}
                  style={{
                    width: 20,
                    height: 20,
                    borderRadius: 10,
                  }}
                  resizeMode="cover"
                />
              ) : (
                // Display emoji text for regular accounts
                <Text
                  style={{
                    fontSize: 10,
                    lineHeight: 20,
                    textAlign: 'center',
                    width: 20,
                    height: 20,
                  }}
                  disableAndroidFix={true}
                >
                  {fromAccount.emojiInfo?.emoji}
                </Text>
              )}
            </View>

            <Text className="text-fg-2 text-sm">{fromAccount.name}</Text>
          </View>
        )}
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
