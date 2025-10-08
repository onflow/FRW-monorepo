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
    medium: { height: 40, px: 16, fontSize: '$4' },
    large: { height: 48, px: 20, fontSize: '$4.5' },
  };

  const { px, fontSize } = sizeConfig[size];

  const containerWidth = fullWidth ? '100%' : constrainWidth ? 178 : 'auto';
  const useGap = constrainWidth ? 8 : undefined;
  const segmentWidth = fullWidth ? undefined : constrainWidth ? (178 - 10 - 8) / 2 : undefined;
  const segmentPx = fullWidth ? px : constrainWidth ? 6 : px;

  return (
    <XStack
      bg="transparent"
      borderWidth={2}
      borderColor="$border1"
      rounded={200}
      p={3}
      items="center"
      height={40}
      width={containerWidth}
      alignSelf="flex-start"
      {...props}
    >
      {segments.map((segment, index) => {
        const isSelected = selectedIndex === index;

        return (
          <Stack
            key={segment}
            flex={fullWidth ? 1 : undefined}
            bg={isSelected ? '$border1' : 'transparent'}
            rounded={20}
            height={30}
            items="center"
            justify="center"
            px={segmentPx}
            pressStyle={{ opacity: 0.8, bg: isSelected ? '$dark20' : '$light5' }}
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
