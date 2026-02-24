import { CheckCircleFill, Plus, VerifiedToken } from '@onflow/frw-icons';
import React from 'react';
import { Text, XStack, YStack, useTheme } from 'tamagui';

import { Avatar } from '../foundation/Avatar';
import { Separator } from '../foundation/Separator';
import type { AddTokenListItemProps } from '../types';

export function AddTokenListItem({
  token,
  isEnabled,
  isLast,
  onAdd,
}: AddTokenListItemProps): React.ReactElement {
  const theme = useTheme();

  return (
    <YStack>
      <XStack py="$3" items="center" gap="$3">
        <Avatar
          src={token.logoURI}
          alt={token.name}
          fallback={token.symbol?.[0] ?? '?'}
          size={44}
        />
        <YStack flex={1} gap="$0.5">
          <XStack items="center" gap="$1.5">
            <Text fontSize={15} fontWeight="600" color="$text1" numberOfLines={1} shrink={1}>
              {token.name}
            </Text>
            {token.isVerified && (
              <VerifiedToken size={14} color={theme.success?.val ?? '#41CC5D'} />
            )}
          </XStack>
          <Text fontSize={13} color="$text2">
            {token.symbol}
          </Text>
        </YStack>
        {isEnabled ? (
          <CheckCircleFill size={24} color={theme.primary?.val ?? '#00EF8B'} />
        ) : (
          <XStack
            w={32}
            h={32}
            rounded="$10"
            borderWidth={1.5}
            borderColor="$primary"
            items="center"
            justify="center"
            onPress={onAdd}
            pressStyle={{ opacity: 0.7 }}
            cursor="pointer"
          >
            <Plus size={16} color={theme.primary?.val ?? '#00EF8B'} theme="outline" />
          </XStack>
        )}
      </XStack>
      {!isLast && <Separator borderColor="$borderGlass" borderWidth={0.5} />}
    </YStack>
  );
}
