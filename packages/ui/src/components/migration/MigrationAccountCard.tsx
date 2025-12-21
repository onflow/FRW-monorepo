import React from 'react';
import { XStack, YStack } from 'tamagui';

import { Avatar } from '../../foundation/Avatar';
import { Text } from '../../foundation/Text';

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
  const ChainPill = ({
    label,
    bg,
    color,
    width,
    mr,
  }: {
    label: string;
    bg: string;
    color: string;
    width?: number;
    mr?: number;
  }): React.ReactElement => {
    return (
      <XStack
        bg={bg as any}
        rounded={16}
        px={4}
        height={16}
        items="center"
        justify="center"
        style={{
          width,
          marginRight: mr,
        }}
      >
        <Text fontSize={8} fontWeight="500" color={color as any} style={{ lineHeight: 'normal' }}>
          {label}
        </Text>
      </XStack>
    );
  };

  const EvmFlowBadgePair = (): React.ReactElement => {
    // Match Figma: two overlapped pills
    const overlap = -8;
    return (
      <XStack items="center" style={{ paddingRight: 10 }}>
        <ChainPill label="EVM" bg="#627EEA" color="#FFFFFF" width={34} mr={overlap} />
        <ChainPill label="FLOW" bg="#00EF8B" color="#000000" width={31} mr={overlap} />
      </XStack>
    );
  };

  const hasEvm = badges.includes('EVM');
  const hasFlow = badges.includes('FLOW');

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
        <XStack items="center" justify="center">
          {hasEvm && hasFlow ? (
            <EvmFlowBadgePair />
          ) : hasEvm ? (
            <ChainPill label="EVM" bg="#627EEA" color="#FFFFFF" width={34} />
          ) : hasFlow ? (
            <ChainPill label="FLOW" bg="#00EF8B" color="#000000" width={31} />
          ) : (
            <XStack items="center" gap="$1" style={{ flexWrap: 'wrap' }}>
              {badges.map((badge, index) => (
                <ChainPill key={`${badge}-${index}`} label={badge} bg="#1f1f1f" color="#FFFFFF" />
              ))}
            </XStack>
          )}
        </XStack>
      )}
    </YStack>
  );
}
