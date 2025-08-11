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
    <XStack bg="$bg2" rounded="$3" p="$1" items="center" w={fullWidth ? '100%' : 'auto'} {...props}>
      {segments.map((segment, index) => {
        const isSelected = selectedIndex === index;

        return (
          <Stack
            key={segment}
            flex={fullWidth ? 1 : undefined}
            h={height}
            bg={isSelected ? '$text' : 'transparent'}
            rounded="$2"
            items="center"
            justify="center"
            px={px}
            pressStyle={{ opacity: 0.8, bg: isSelected ? '$text' : '$bg3' }}
            onPress={() => onChange(segment)}
            cursor="pointer"
          >
            <Text
              fontSize={fontSize}
              fontWeight={isSelected ? '600' : '500'}
              color={isSelected ? '$bg' : '$textSecondary'}
              numberOfLines={1}
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
