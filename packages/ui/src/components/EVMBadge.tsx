import React from 'react';
import { XStack } from 'tamagui';

import { Text } from '../foundation/Text';

export type EVMBadgeVariant = 'eoa' | 'coa';

export interface EVMBadgeProps {
  /**
   * Variant of the EVM badge
   * - 'eoa': Pure EVM account (solid blue chip)
   * - 'coa': Cadence Owned Account / Flow-linked EVM (overlapping blue EVM + green FLOW chip)
   */
  variant: EVMBadgeVariant;
}

/**
 * EVMBadge component displays account type indicators for EVM accounts
 *
 * @example
 * ```tsx
 * // EOA: Pure EVM account
 * <EVMBadge variant="eoa" />
 *
 * // COA: Flow-linked EVM account
 * <EVMBadge variant="coa" />
 * ```
 */
export function EVMBadge({ variant }: EVMBadgeProps): React.ReactElement {
  if (variant === 'eoa') {
    // EOA: Pure EVM account - solid blue chip
    return (
      <XStack bg="$accentEVM" rounded="$4" px={4} items="center" justify="center" height={16}>
        <Text fontSize={8} fontWeight="400" color="$white" lineHeight={9.7} letterSpacing={0.128}>
          EVM
        </Text>
      </XStack>
    );
  }

  // COA: Flow-linked EVM account - green FLOW pill overlaps blue EVM pill
  return (
    <XStack items="center">
      {/* Blue EVM pill (base layer) */}
      <XStack
        bg="$accentEVM"
        pl={4}
        pr={16}
        items="center"
        justify="center"
        height={16}
        rounded="$4"
        z={1}
      >
        <Text fontSize={8} fontWeight="400" color="$white" lineHeight={9.7} letterSpacing={0.128}>
          EVM
        </Text>
      </XStack>
      {/* Green FLOW pill (overlays on top with curved left edge) */}
      <XStack
        bg="$primary"
        px={4}
        ml="$-3"
        items="center"
        justify="center"
        height={16}
        rounded="$4"
        z={2}
      >
        <Text fontSize={8} fontWeight="400" color="$black" lineHeight={9.7} letterSpacing={0.128}>
          FLOW
        </Text>
      </XStack>
    </XStack>
  );
}
