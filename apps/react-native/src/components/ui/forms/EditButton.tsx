import React from 'react';
import { TouchableOpacity } from 'react-native';
import { Edit as EditIcon } from 'icons';

interface EditButtonProps {
  onPress?: () => void;
}

const EditButton: React.FC<EditButtonProps> = ({ onPress }) => {
  return (
    <TouchableOpacity onPress={onPress} className="items-center justify-center p-2">
      <EditIcon width={24} height={24} />
    </TouchableOpacity>
  );
};

export default EditButton;
