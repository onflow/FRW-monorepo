import { type NFTModel } from '@onflow/frw-types';
import { View } from 'react-native';

import { IconView } from '@/components/ui/media/IconView';
import { Text } from 'ui';

interface NFTPreviewProps {
  nft: NFTModel;
}

export const NFTPreview = ({ nft }: NFTPreviewProps) => {
  return (
    <View className="flex-row items-center" style={{ gap: 16 }}>
      {/* NFT Image */}
      <IconView
        src={
          nft?.thumbnail && typeof nft.thumbnail === 'string' && nft.thumbnail.trim() !== ''
            ? nft.thumbnail
            : ''
        }
        size={92}
        borderRadius={16}
        resizeMode="cover"
      />

      {/* NFT Details */}
      <View className="flex-1" style={{ justifyContent: 'center', paddingLeft: 4 }}>
        {/* Collection Info */}
        <View className="flex-row items-center mb-2" style={{ gap: 8 }}>
          <Text
            className="text-fg-1 font-semibold flex-1"
            style={{
              fontSize: 14,
              fontWeight: '600',
              lineHeight: 20,
              includeFontPadding: false,
            }}
            numberOfLines={1}
            ellipsizeMode="tail"
            disableAndroidFix={true}
          >
            {nft.collectionName || nft.name}
          </Text>
        </View>

        {/* NFT Name */}
        <Text
          className="text-fg-2 font-medium"
          style={{
            fontSize: 20,
            fontWeight: '500',
            lineHeight: 16,
            includeFontPadding: false,
          }}
          numberOfLines={2}
          ellipsizeMode="tail"
          disableAndroidFix={true}
        >
          {nft.name}
        </Text>
      </View>
    </View>
  );
};
