import React from 'react';
import { XStack, Stack, Text } from 'tamagui';

import type { SegmentedControlProps } from '../types';

export function SegmentedControl({
  segments,
  value,
  onChange,
  size = 'medium',
  fullWidth = false,
  ...props
}: SegmentedControlProps): React.ReactElement {
  const selectedIndex = segments.indexOf(value);

  // Size configurations
  const sizeConfig = {
    small: { height: 32, px: 12, fontSize: 14 },
    medium: { height: 40, px: 16, fontSize: 16 },
    large: { height: 48, px: 20, fontSize: 18 },
  };

  const { height, px, fontSize } = sizeConfig[size];

  return (
    <XStack
      bg="transparent"
      borderWidth={2}
      borderColor="#292929"
      rounded={200}
      p={5}
      items="center"
      w={fullWidth ? '100%' : 'auto'}
      {...props}
    >
      {segments.map((segment, index) => {
        const isSelected = selectedIndex === index;

        return (
          <Stack
            key={segment}
            flex={fullWidth ? 1 : undefined}
            h={height}
            bg={isSelected ? '#242424' : 'transparent'}
            rounded={24}
            items="center"
            justify="center"
            px={px}
            pressStyle={{ opacity: 0.8, bg: isSelected ? '#242424' : 'rgba(255, 255, 255, 0.1)' }}
            onPress={() => onChange(segment)}
            cursor="pointer"
          >
            <Text
              fontSize={fontSize}
              fontWeight={600}
              color={isSelected ? 'rgba(255, 255, 255, 0.8)' : '#FFFFFF'}
              numberOfLines={1}
              my="$0.5"
            >
              {segment}
            </Text>
          </Stack>
        );
      })}
    </XStack>
  );
}

export { SegmentedControl as UISegmentedControl };
