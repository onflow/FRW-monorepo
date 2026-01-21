import { ChevronDown } from '@onflow/frw-icons';
import React, { useState } from 'react';
import { XStack, YStack, View } from 'tamagui';

import { Text } from '../../foundation/Text';

export interface AssetItem {
  /** Asset symbol (e.g., 'FLOW') */
  symbol: string;
  /** Asset amount */
  amount: string;
  /** Asset name */
  name?: string;
}

export interface MigrationAssetDrawerProps {
  /** List of assets being transferred */
  assets: AssetItem[];
  /** Whether drawer is expanded by default */
  defaultExpanded?: boolean;
  /** Label for the drawer */
  label?: string;
  /** Current count of transferred assets (for "X / Y assets transferred" format) */
  transferredCount?: number;
  /** Total count of assets (for "X / Y assets transferred" format) */
  totalCount?: number;
}

/**
 * MigrationAssetDrawer - Expandable drawer showing assets being migrated
 */
export function MigrationAssetDrawer({
  assets,
  defaultExpanded = false,
  label = 'Assets',
  transferredCount,
  totalCount,
}: MigrationAssetDrawerProps): React.ReactElement {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  // Use "X / Y assets transferred" format if counts are provided, otherwise use label with count
  const displayLabel =
    transferredCount !== undefined && totalCount !== undefined
      ? `${transferredCount} / ${totalCount} assets transferred`
      : label;

  return (
    <YStack bg="$bg2" rounded="$4" borderWidth={1} borderColor="$borderGlass" overflow="hidden">
      {/* Header - always visible */}
      <XStack
        items="center"
        justify="space-between"
        p="$4"
        onPress={() => setIsExpanded(!isExpanded)}
        cursor="pointer"
        pressStyle={{ opacity: 0.8 }}
      >
        <XStack items="center" gap="$2" flex={1}>
          {transferredCount !== undefined && totalCount !== undefined ? (
            <XStack items="center" gap="$1">
              <Text fontSize="$3" fontWeight="600" color="$text">
                {transferredCount}
              </Text>
              <Text fontSize="$3" fontWeight="400" color="$textSecondary">
                /
              </Text>
              <Text fontSize="$3" fontWeight="400" color="$textSecondary">
                {totalCount} assets transferred
              </Text>
            </XStack>
          ) : (
            <>
              <Text fontSize="$3" fontWeight="400" color="$text">
                {displayLabel}
              </Text>
              {assets.length > 0 && (
                <Text fontSize="$3" fontWeight="400" color="$textSecondary">
                  ({assets.length})
                </Text>
              )}
            </>
          )}
        </XStack>
        <View transform={[{ rotate: isExpanded ? '180deg' : '0deg' }]} animation="quick">
          <ChevronDown size={24} color="$textSecondary" />
        </View>
      </XStack>

      {/* Expanded content */}
      {isExpanded && (
        <YStack p="$4" pt="$0" gap="$2" animation="quick">
          {assets.length === 0 ? (
            <Text fontSize="$3" color="$textSecondary" textAlign="center" py="$2">
              No assets to display
            </Text>
          ) : (
            assets.map((asset, index) => (
              <XStack
                key={index}
                items="center"
                justify="space-between"
                py="$2"
                borderBottomWidth={index < assets.length - 1 ? 1 : 0}
                borderBottomColor="$borderGlass"
              >
                <XStack items="center" gap="$2">
                  <Text fontSize="$3" fontWeight="600" color="$text">
                    {asset.amount}
                  </Text>
                  <Text fontSize="$3" fontWeight="400" color="$textSecondary">
                    {asset.symbol}
                  </Text>
                  {asset.name && (
                    <Text fontSize="$2" color="$textSecondary">
                      {asset.name}
                    </Text>
                  )}
                </XStack>
              </XStack>
            ))
          )}
        </YStack>
      )}
    </YStack>
  );
}
