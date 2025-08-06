import { View, TouchableOpacity } from 'react-native';

import { Edit as EditIcon } from 'icons';
import { Text } from 'ui';

interface NFTSectionHeaderProps {
  title: string;
  onEditPress: () => void;
}

export const NFTSectionHeader = ({ title, onEditPress }: NFTSectionHeaderProps) => {
  return (
    <View className="flex-row items-center justify-between mb-3">
      <Text className="text-fg-1  font-normal" style={{ width: 69, fontSize: 12 }}>
        {title}
      </Text>

      {/* Edit Icon */}
      <View className="flex-row items-center justify-end">
        <TouchableOpacity
          style={{ width: 24, height: 24 }}
          className="items-center justify-center"
          onPress={onEditPress}
        >
          <EditIcon width={24} height={24} />
        </TouchableOpacity>
      </View>
    </View>
  );
};
