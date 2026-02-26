import { ChevronRight, Inbox } from '@onflow/frw-icons';
import React from 'react';
import { Text, XStack, YStack, useTheme } from 'tamagui';

import type { ClaimBannerProps } from '../types';

export function ClaimBanner({ title, count, onPress }: ClaimBannerProps): React.ReactElement {
  const theme = useTheme();

  return (
    <XStack
      mx="$4"
      mt="$3"
      mb="$3"
      bg="$bg1"
      rounded="$4"
      px="$3"
      py="$3"
      items="center"
      gap="$3"
      onPress={onPress}
      pressStyle={onPress ? { opacity: 0.75 } : undefined}
      cursor={onPress ? 'pointer' : undefined}
    >
      <Inbox size={24} color={theme.primary?.val ?? '#00EF8B'} theme="outline" />
      <Text flex={1} fontSize={14} fontWeight="600" color="$text1">
        {title}
      </Text>
      {count !== undefined && count > 0 && (
        <YStack
          items="center"
          justify="center"
          style={{
            width: 28,
            height: 28,
            borderRadius: 14,
            backgroundColor: theme.bg3?.val,
          }}
        >
          <Text fontSize={14} fontWeight="600" lineHeight={17} style={{ color: theme.text2?.val }}>
            {count > 99 ? '99+' : count}
          </Text>
        </YStack>
      )}
      <ChevronRight size={24} color={theme.text2?.val ?? '#767676'} theme="outline" />
    </XStack>
  );
}
