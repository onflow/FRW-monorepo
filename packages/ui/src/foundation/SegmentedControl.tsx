import React from 'react';
import { XStack, Stack, Text } from 'tamagui';

import type { SegmentedControlProps } from '../types';

export function SegmentedControl({
  segments,
  value,
  onChange,
  size = 'medium',
  fullWidth = false,
  constrainWidth = false,
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

  const containerWidth = fullWidth ? '100%' : constrainWidth ? 178 : 'auto';
  const useGap = constrainWidth ? 8 : undefined;
  const segmentWidth = fullWidth ? undefined : constrainWidth ? (178 - 10 - 8) / 2 : undefined;
  const segmentPx = fullWidth ? px : constrainWidth ? 6 : px;

  return (
    <XStack
      bg="transparent"
      borderWidth={2}
      borderColor="#292929"
      rounded={200}
      p={5}
      items="center"
      justify={constrainWidth ? 'center' : undefined}
      w={containerWidth}
      maxW={constrainWidth ? 178 : undefined}
      gap={useGap}
      {...props}
    >
      {segments.map((segment, index) => {
        const isSelected = selectedIndex === index;

        return (
          <Stack
            key={segment}
            flex={fullWidth ? 1 : undefined}
            w={segmentWidth}
            h={height}
            bg={isSelected ? '#242424' : 'transparent'}
            rounded={24}
            items="center"
            justify="center"
            px={segmentPx}
            pressStyle={{ opacity: 0.8, bg: isSelected ? '#242424' : 'rgba(255, 255, 255, 0.1)' }}
            onPress={() => onChange(segment)}
            cursor="pointer"
          >
            <Text
              data-testid={segment}
              fontSize={fontSize}
              fontWeight={600}
              opacity={isSelected ? 0.8 : 1}
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
