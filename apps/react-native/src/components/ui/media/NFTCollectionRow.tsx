import { type CollectionModel } from '@onflow/frw-types';
import { TouchableOpacity, View } from 'react-native';

import { ArrowRight } from 'icons';

import { AccessibilityStatus } from './AccessibilityStatus';
import { IconView } from './IconView';
import { Divider } from '../layout/divider';
import { Text } from '../typography/text';

interface NFTCollectionRowProps {
  collection?: CollectionModel;
  showDivider?: boolean;
  isAccessible?: boolean;
  onPress?: () => void;
}

export function NFTCollectionRow({
  collection,
  showDivider,
  isAccessible = true,
  onPress,
}: NFTCollectionRowProps) {
  if (!collection) {
    return null;
  }

  const count = collection?.count && collection.count > 0 ? `${collection.count} items` : '';

  return (
    <>
      <TouchableOpacity activeOpacity={0.7} onPress={onPress}>
        <View className="flex-row items-center py-4 px-0 w-full gap-4">
          {/* Collection Image */}
          <IconView src={collection.logo ?? ''} />

          <View className="flex-1 ml-0.5 gap-1">
            <Text className="text-fg-1 font-semibold text-base">{collection?.name}</Text>
            <View className="flex-row items-center gap-2">
              <Text className="text-fg-2 text-sm">{count}</Text>
              <AccessibilityStatus isAccessible={isAccessible} />
            </View>
          </View>
          <ArrowRight />
        </View>
      </TouchableOpacity>
      {showDivider && <Divider />}
    </>
  );
}
