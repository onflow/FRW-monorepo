import { ChevronDown, ChevronUp } from '@onflow/frw-icons';
import React from 'react';
import { Text, XStack, useTheme } from 'tamagui';

import { Avatar } from '../foundation/Avatar';
import type { ClaimSenderRowProps } from '../types';

export function ClaimSenderRow({
  name,
  address,
  avatar,
  isCollapsed,
  onPress,
}: ClaimSenderRowProps): React.ReactElement {
  const theme = useTheme();
  const initial = name !== '—' ? name[0].toUpperCase() : '?';

  return (
    <XStack
      px="$4"
      py="$3.5"
      items="center"
      gap="$3"
      bg="$bg1"
      onPress={onPress}
      pressStyle={{ opacity: 0.7 }}
    >
      <Avatar src={avatar} alt={name} fallback={initial} size={24} />
      <XStack flex={1} items="center" gap="$2" shrink={1}>
        <Text fontSize={16} fontWeight="700" color="$text1">
          {name}
        </Text>
        <Text fontSize={13} color="$text2" numberOfLines={1} shrink={1}>
          {address}
        </Text>
      </XStack>
      {isCollapsed ? (
        <ChevronDown size={24} color={theme.text2?.val ?? '#767676'} theme="outline" />
      ) : (
        <ChevronUp size={24} color={theme.text2?.val ?? '#767676'} theme="outline" />
      )}
    </XStack>
  );
}
