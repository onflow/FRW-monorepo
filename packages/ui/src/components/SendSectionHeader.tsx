// import { Edit } from '@onflow/frw-icons';
import React from 'react';
import { XStack } from 'tamagui';

import { Button } from '../foundation/Button';
import { Text } from '../foundation/Text';

export interface SendSectionHeaderProps {
  title: string;
  onEditPress?: () => void;
  showEditButton?: boolean;
  editButtonText?: string;
  titleColor?: string;
  editButtonVariant?: 'primary' | 'secondary' | 'ghost';
  editButtonSize?: 'small' | 'medium' | 'large';
}

export const SendSectionHeader: React.FC<SendSectionHeaderProps> = ({
  title,
  onEditPress,
  showEditButton = true,
  editButtonText = 'Edit',
  titleColor = '$gray11',
  editButtonVariant = 'ghost',
  editButtonSize = 'small',
}) => {
  return (
    <XStack items="center" justify="space-between">
      <Text fontSize="$3" fontWeight="600" color={titleColor}>
        {title}
      </Text>
      {showEditButton && onEditPress && (
        <Button
          size={editButtonSize}
          variant={editButtonVariant}
          onPress={onEditPress}
          // icon={<Edit size={16} />}
        >
          {editButtonText}
        </Button>
      )}
    </XStack>
  );
};
