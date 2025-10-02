import { Minus, Plus } from '@onflow/frw-icons';
import React from 'react';
import { XStack, Text, YStack } from 'tamagui';

export interface ERC1155QuantitySelectorProps {
  quantity: number;
  maxQuantity: number;
  onQuantityChange: (quantity: number) => void;
  disabled?: boolean;
}

export const ERC1155QuantitySelector: React.FC<ERC1155QuantitySelectorProps> = ({
  quantity,
  maxQuantity,
  onQuantityChange,
  disabled = false,
}) => {
  const handleDecrease = () => {
    if (quantity > 1 && !disabled) {
      onQuantityChange(quantity - 1);
    }
  };

  const handleIncrease = () => {
    if (quantity < maxQuantity && !disabled) {
      onQuantityChange(quantity + 1);
    }
  };

  const isDecreaseDisabled = disabled || quantity <= 1;
  const isIncreaseDisabled = disabled || quantity >= maxQuantity;

  const formatNumber = (num: number) => {
    return num.toLocaleString();
  };

  return (
    <XStack
      bg="$light10"
      rounded="$10"
      items="center"
      justify="space-between"
      px="$2.5"
      py="$1"
      gap="$2.5"
      alignSelf="stretch"
    >
      <YStack
        onPress={handleDecrease}
        opacity={isDecreaseDisabled ? 0.3 : 1}
        cursor={isDecreaseDisabled ? 'not-allowed' : 'pointer'}
        pressStyle={{ opacity: 0.7 }}
        width={24}
        height={24}
        items="center"
        justify="center"
      >
        <Minus size={24} color="#767676" theme="outline" />
      </YStack>

      <Text
        fontSize="$5"
        fontWeight="600"
        color="$text"
        textAlign="center"
        flex={1}
        numberOfLines={1}
        lineHeight="$5"
      >
        {formatNumber(quantity)}
      </Text>

      <YStack
        onPress={handleIncrease}
        opacity={isIncreaseDisabled ? 0.3 : 1}
        cursor={isIncreaseDisabled ? 'not-allowed' : 'pointer'}
        pressStyle={{ opacity: 0.7 }}
        width={24}
        height={24}
        items="center"
        justify="center"
      >
        <Plus size={24} color="#767676" theme="outline" />
      </YStack>
    </XStack>
  );
};
