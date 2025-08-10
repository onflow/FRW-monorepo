import React from 'react';
import { Button, XStack, Text } from 'tamagui';

import type { SegmentedControlProps } from '../types';

export function SegmentedControl({
  options,
  selectedIndex,
  onChange,
  size = 'medium',
}: SegmentedControlProps): React.ReactElement {
  const getSizeProps = (): Record<string, unknown> => {
    switch (size) {
      case 'small':
        return { height: 32, paddingHorizontal: '$3', fontSize: 14 };
      case 'large':
        return { height: 44, paddingHorizontal: '$5', fontSize: 16 };
      default:
        return { height: 38, paddingHorizontal: '$4', fontSize: 15 };
    }
  };

  const sizeProps = getSizeProps();

  return (
    <XStack bg="$gray3" rounded="$4" p="$1" items="center">
      {options.map((option, index) => (
        <Button
          key={option}
          onPress={() => onChange(index)}
          flex={1}
          height={(sizeProps.height as number) - 8}
          bg={selectedIndex === index ? '$background' : 'transparent'}
          rounded="$3"
          borderWidth={0}
          px={sizeProps.paddingHorizontal as any}
          pressStyle={{
            bg: selectedIndex === index ? '$gray1' : '$gray4',
          }}
          hoverStyle={{
            bg: selectedIndex === index ? '$gray1' : '$gray4',
          }}
        >
          <Text
            fontSize={sizeProps.fontSize as any}
            fontWeight={selectedIndex === index ? 600 : 500}
            color={selectedIndex === index ? '$gray12' : '$gray10'}
          >
            {option}
          </Text>
        </Button>
      ))}
    </XStack>
  );
}

export { SegmentedControl as UISegmentedControl };
