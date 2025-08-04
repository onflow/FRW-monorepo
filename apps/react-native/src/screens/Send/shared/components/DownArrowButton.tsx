import { View, TouchableOpacity } from 'react-native';
import { DownArrow } from 'ui';

export const DownArrowButton = () => {
  return (
    <View className="self-center -my-5 z-10">
      <TouchableOpacity className="w-11 h-11 rounded-full bg-primary items-center justify-center shadow-lg">
        <DownArrow width={20} height={20} />
      </TouchableOpacity>
    </View>
  );
};
