import React from 'react';
import { TouchableOpacity } from 'react-native';

import { CloseIcon } from 'icons';

interface CloseButtonProps {
  onPress?: () => void;
}

const CloseButton: React.FC<CloseButtonProps> = ({ onPress }) => {
  return (
    <TouchableOpacity onPress={onPress} className="items-center justify-center p-2">
      <CloseIcon width={15} height={15} />
    </TouchableOpacity>
  );
};

export default CloseButton;
