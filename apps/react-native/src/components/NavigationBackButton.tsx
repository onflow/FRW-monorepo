import { useNavigation } from '@react-navigation/native';
import React from 'react';
import { TouchableOpacity } from 'react-native';
import { BackArrow } from './ui/icons/BackArrow';

interface NavigationBackButtonProps {
  width?: number;
  height?: number;
  onPress?: () => void;
}

const NavigationBackButton: React.FC<NavigationBackButtonProps> = ({
  width = 24,
  height = 24,
  onPress,
}) => {
  const navigation = useNavigation();
  const canGoBack = navigation.canGoBack();

  if (!canGoBack) {
    return null;
  }

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      navigation.goBack();
    }
  };

  return (
    <TouchableOpacity onPress={handlePress}>
      <BackArrow width={width} height={height} />
    </TouchableOpacity>
  );
};

export default NavigationBackButton;
