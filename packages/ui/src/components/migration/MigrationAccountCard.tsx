import React from 'react';
import { XStack, YStack } from 'tamagui';

import { Avatar } from '../../foundation/Avatar';
import { Text } from '../../foundation/Text';
import { Badge } from '../Badge';

export interface MigrationAccountCardProps {
  /** Account name */
  name: string;
  /** Account address */
  address: string;
  /** Account avatar/emoji */
  avatar?: string;
  /** Account type badges (e.g., ['EVM', 'FLOW']) */
  badges?: string[];
  /** Whether this is the source account */
  isSource?: boolean;
}

/**
 * MigrationAccountCard - Displays an account card in the migration flow
 * Shows account name, address, avatar, and type badges
 */
export function MigrationAccountCard({
  name,
  address,
  avatar,
  badges = [],
  isSource = false,
}: MigrationAccountCardProps): React.ReactElement {
  return (
    <YStack width={130} gap="$2">
      {/* Avatar */}
      <XStack items="center" justify="center" width="100%">
        <Avatar
          src={avatar?.startsWith('http') ? avatar : undefined}
          fallback={avatar && avatar.length <= 4 ? avatar : name.charAt(0).toUpperCase()}
          size={36}
          bgColor="$gray8"
          borderRadius="$1"
        />
      </XStack>

      {/* Account Name */}
      <YStack items="center" width="100%">
        <Text fontSize="$3" fontWeight="400" color="$text">
          {name}
        </Text>
      </YStack>

      {/* Address */}
      <YStack items="center" width="100%">
        <Text fontSize="$2" fontWeight="400" color="$textSecondary" numberOfLines={1}>
          {address}
        </Text>
      </YStack>

      {/* Badges */}
      {badges.length > 0 && (
        <XStack items="center" justify="center" gap="$1" flexWrap="wrap">
          {badges.map((badge, index) => (
            <Badge
              key={index}
              variant={badge === 'EVM' ? 'evm' : 'primary'}
              size="small"
              {...(badge === 'EVM'
                ? ({ bg: '#627EEA' } as any)
                : badge === 'FLOW'
                  ? ({ bg: '#00EF8B' } as any)
                  : {})}
            >
              {badge}
            </Badge>
          ))}
        </XStack>
      )}
    </YStack>
  );
}
