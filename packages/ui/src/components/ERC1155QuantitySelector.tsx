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
      bg="rgba(255, 255, 255, 0.1)"
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
        <Minus size={24} color="white" theme="outline" />
      </YStack>

      <Text
        fontSize="$4.5"
        fontWeight="600"
        color="$white"
        letterSpacing="$xs"
        textAlign="center"
        flex={1}
        numberOfLines={1}
        lineHeight="$4.5"
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
        <Plus size={24} color="white" theme="outline" />
      </YStack>
    </XStack>
  );
};
