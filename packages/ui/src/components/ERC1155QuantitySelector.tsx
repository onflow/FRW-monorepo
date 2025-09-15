import { Minus, Plus } from '@onflow/frw-icons';
import React from 'react';
import { XStack, Text, View } from 'tamagui';

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
      py="$0.75"
      gap="$2.5"
      alignSelf="stretch"
    >
      <View
        onPress={handleDecrease}
        opacity={isDecreaseDisabled ? 0.3 : 1}
        cursor={isDecreaseDisabled ? 'not-allowed' : 'pointer'}
        pressStyle={{ opacity: 0.7 }}
        w={24}
        h={24}
        items="center"
        justify="center"
      >
        <Minus size={24} color="#FFFFFF" theme="outline" />
      </View>

      <Text
        fontSize="$4.5"
        fontWeight="600"
        color="$white"
        letterSpacing={-0.006}
        textAlign="center"
        flex={1}
        numberOfLines={1}
      >
        {formatNumber(quantity)}
      </Text>

      <View
        onPress={handleIncrease}
        opacity={isIncreaseDisabled ? 0.3 : 1}
        cursor={isIncreaseDisabled ? 'not-allowed' : 'pointer'}
        pressStyle={{ opacity: 0.7 }}
        w={24}
        h={24}
        items="center"
        justify="center"
      >
        <Plus size={24} color="#FFFFFF" theme="outline" />
      </View>
    </XStack>
  );
};
