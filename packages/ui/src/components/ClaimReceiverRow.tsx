import { ChevronDown, ChevronUp } from '@onflow/frw-icons';
import React from 'react';
import { Text, XStack, YStack, useTheme } from 'tamagui';

import { EVMBadge } from './EVMBadge';
import { Avatar } from '../foundation/Avatar';
import type { ClaimReceiverRowProps } from '../types';

function truncateAddress(address: string): string {
  if (address.length <= 12) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function ClaimReceiverRow({
  name,
  address,
  avatar,
  emojiInfo,
  parentEmoji,
  type,
  isCollapsed,
  onPress,
}: ClaimReceiverRowProps): React.ReactElement {
  const theme = useTheme();
  const initial = name !== '—' ? name[0].toUpperCase() : '?';

  return (
    <XStack
      testID={`claim-receiver-${address}`}
      px="$4"
      py="$3.5"
      items="center"
      gap="$3"
      bg="$bg1"
      onPress={onPress}
      pressStyle={{ opacity: 0.7 }}
    >
      {/* Avatar with optional parent emoji bubble */}
      <XStack pos="relative" w={28} h={28}>
        <Avatar
          src={emojiInfo ? undefined : avatar}
          fallback={emojiInfo?.emoji ?? initial}
          bgColor={emojiInfo?.color}
          textColor={emojiInfo?.color ? undefined : '$text'}
          size={28}
        />
        {parentEmoji && (
          <YStack
            pos="absolute"
            left={-5}
            top={-5}
            w={14}
            h={14}
            rounded={7}
            bg={(parentEmoji.color as any) || '$bg2'}
            borderWidth={1.5}
            borderColor="$bg1"
            items="center"
            justify="center"
            overflow="hidden"
          >
            <Text fontSize={7} lineHeight={10}>
              {parentEmoji.emoji}
            </Text>
          </YStack>
        )}
      </XStack>

      <XStack flex={1} items="center" gap="$2" shrink={1}>
        <Text fontSize={16} fontWeight="700" color="$text1" numberOfLines={1}>
          {name}
        </Text>
        {(type === 'evm' || type === 'eoa') && (
          <EVMBadge variant={type === 'eoa' ? 'eoa' : 'coa'} />
        )}
        <Text fontSize={13} color="$text2" numberOfLines={1} shrink={1}>
          {truncateAddress(address)}
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
