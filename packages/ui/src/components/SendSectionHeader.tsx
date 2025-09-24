import { Edit } from '@onflow/frw-icons';
import React from 'react';
import { XStack } from 'tamagui';

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
}) => {
  return (
    <XStack items="center" justify="space-between">
      <Text fontSize="$2" fontWeight="400" color="$color" lineHeight={16}>
        {title}
      </Text>
      {showEditButton && onEditPress && (
        <XStack justify="flex-end" items="center" gap={16}>
          <XStack
            width={24}
            height={24}
            items="center"
            justify="center"
            pressStyle={{ opacity: 0.7 }}
            onPress={onEditPress}
            cursor="pointer"
            opacity={1}
          >
            <Edit size={24} color={'#767676'} theme="outline" />
          </XStack>
        </XStack>
      )}
    </XStack>
  );
};
