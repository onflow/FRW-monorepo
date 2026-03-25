import { ChevronDown } from '@onflow/frw-icons';
import type { MigrationAssetsData } from '@onflow/frw-types';
import React, { useState } from 'react';
import { XStack, YStack, View } from 'tamagui';

import { Avatar } from '../../foundation/Avatar';
import { Text } from '../../foundation/Text';
import { Badge } from '../Badge';

export interface TokenMeta {
  name: string;
  symbol?: string;
  logoURI?: string;
}

export interface CollectionMeta {
  name: string;
  logoURI?: string;
}

export interface MigrationAssetDrawerProps {
  assets?: MigrationAssetsData;
  /** address (lowercase) → token metadata, used for enriched display */
  tokenMetadata?: Record<string, TokenMeta>;
  /** address (lowercase) → collection metadata, used for enriched display */
  collectionMetadata?: Record<string, CollectionMeta>;
  defaultExpanded?: boolean;
  /** Used during in-progress to show "X / Y assets transferred" */
  transferredCount?: number;
  totalCount?: number;
}

const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';
const FLOW_LOGO_URI = 'https://raw.githubusercontent.com/Outblock/Assets/main/ft/flow/logo.png';

function formatAddress(address: string): string {
  if (!address) return address;
  if (address.toLowerCase() === ZERO_ADDRESS) return 'FLOW';
  if (address.length <= 12) return address;
  return `${address.slice(0, 5)}...${address.slice(-5)}`;
}

/** Group ERC721 assets by contract address → count */
function groupERC721(items: Array<{ address: string; id: string }>): [string, number][] {
  const map = new Map<string, number>();
  for (const item of items) {
    map.set(item.address, (map.get(item.address) ?? 0) + 1);
  }
  return Array.from(map.entries());
}

/** Group ERC1155 assets by contract address → total amount */
function groupERC1155(
  items: Array<{ address: string; id: string; amount: string }>
): [string, number][] {
  const map = new Map<string, number>();
  for (const item of items) {
    map.set(item.address, (map.get(item.address) ?? 0) + (parseInt(item.amount, 10) || 1));
  }
  return Array.from(map.entries());
}

type TokenStandard = 'ERC20' | 'ERC721' | 'ERC1155';

const BADGE_VARIANT: Record<TokenStandard, 'primary' | 'secondary' | 'warning'> = {
  ERC20: 'primary',
  ERC721: 'secondary',
  ERC1155: 'warning',
};

function AssetRow({
  address,
  label,
  logoURI,
  right,
  standard,
  isLast,
}: {
  address: string;
  label: string;
  logoURI?: string;
  right: string;
  standard: TokenStandard;
  isLast: boolean;
}) {
  return (
    <XStack
      items="center"
      justify="space-between"
      py="$3"
      gap="$3"
      borderBottomWidth={isLast ? 0 : 1}
      borderBottomColor="$borderGlass"
    >
      <XStack items="center" gap="$2" style={{ flexShrink: 1, minWidth: 0 }}>
        <Avatar
          src={logoURI}
          fallback={label[0]?.toUpperCase() ?? '?'}
          size={24}
          borderRadius={12}
        />
        <Text
          fontSize="$3"
          fontWeight="500"
          color="$text"
          numberOfLines={1}
          style={{ flexShrink: 1 }}
        >
          {label}
        </Text>
        <Badge variant={BADGE_VARIANT[standard]} size="small">
          {standard}
        </Badge>
      </XStack>
      <Text
        fontSize="$3"
        fontWeight="400"
        color="$textSecondary"
        style={{ flexShrink: 0 }}
        numberOfLines={1}
      >
        {right}
      </Text>
    </XStack>
  );
}

/**
 * MigrationAssetDrawer - Collapsible list of assets to be migrated.
 * When token/collection metadata is provided (via tokenMetadata / collectionMetadata),
 * each row shows an icon and name. Falls back to truncated address otherwise.
 */
export function MigrationAssetDrawer({
  assets,
  tokenMetadata = {},
  collectionMetadata = {},
  defaultExpanded = false,
  transferredCount,
  totalCount,
}: MigrationAssetDrawerProps): React.ReactElement {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  const erc20 = assets?.erc20 ?? [];
  const erc721groups = groupERC721(assets?.erc721 ?? []);
  const erc1155groups = groupERC1155(assets?.erc1155 ?? []);

  const displayTotal =
    totalCount ?? (assets ? assets.erc20.length + assets.erc721.length + assets.erc1155.length : 0);

  type RowData = {
    address: string;
    label: string;
    logoURI?: string;
    right: string;
    standard: TokenStandard;
  };

  const rows: RowData[] = [
    ...erc20.map((t): RowData => {
      const isFlow = t.address.toLowerCase() === ZERO_ADDRESS;
      const meta = isFlow
        ? { name: 'FLOW', symbol: 'FLOW', logoURI: FLOW_LOGO_URI }
        : tokenMetadata[t.address.toLowerCase()];
      const label = meta
        ? meta.symbol
          ? `${meta.name} (${meta.symbol})`
          : meta.name
        : formatAddress(t.address);
      return {
        address: t.address,
        label,
        logoURI: meta?.logoURI,
        right: t.amount,
        standard: 'ERC20',
      };
    }),
    ...erc721groups.map(([addr, count]): RowData => {
      const meta = collectionMetadata[addr.toLowerCase()];
      const label = meta?.name ?? formatAddress(addr);
      return {
        address: addr,
        label,
        logoURI: meta?.logoURI,
        right: `${count}`,
        standard: 'ERC721',
      };
    }),
    ...erc1155groups.map(([addr, total]): RowData => {
      const meta = collectionMetadata[addr.toLowerCase()];
      const label = meta?.name ?? formatAddress(addr);
      return {
        address: addr,
        label,
        logoURI: meta?.logoURI,
        right: `${total}`,
        standard: 'ERC1155',
      };
    }),
  ];

  return (
    <YStack bg="$bg2" rounded="$4" borderWidth={1} borderColor="$borderGlass" overflow="hidden">
      {/* Header */}
      <XStack
        items="center"
        justify="space-between"
        p="$4"
        onPress={() => setIsExpanded(!isExpanded)}
        cursor="pointer"
        pressStyle={{ opacity: 0.8 }}
      >
        <XStack items="center" gap="$1" flex={1}>
          {transferredCount !== undefined && totalCount !== undefined ? (
            <>
              <Text fontSize="$3" fontWeight="600" color="$text">
                {transferredCount}
              </Text>
              <Text fontSize="$3" fontWeight="400" color="$textSecondary">
                {' '}
                /{' '}
              </Text>
              <Text fontSize="$3" fontWeight="400" color="$textSecondary">
                {totalCount} assets transferred
              </Text>
            </>
          ) : (
            <>
              <Text fontSize="$3" fontWeight="400" color="$text">
                Assets
              </Text>
              {displayTotal > 0 && (
                <Text fontSize="$3" fontWeight="400" color="$textSecondary">
                  {' '}
                  ({displayTotal})
                </Text>
              )}
            </>
          )}
        </XStack>
        <View transform={[{ rotate: isExpanded ? '180deg' : '0deg' }]} animation="quick">
          {/* @ts-expect-error icon JSX compatible at runtime */}
          <ChevronDown size={20} color="#767676" theme="outline" />
        </View>
      </XStack>

      {/* Expanded list */}
      {isExpanded && (
        <YStack px="$4" pb="$3" pt="$0" animation="quick">
          {rows.length === 0 ? (
            <Text fontSize="$3" color="$textSecondary" py="$2" style={{ textAlign: 'center' }}>
              No assets to display
            </Text>
          ) : (
            rows.map((row, i) => (
              <AssetRow
                key={row.address + i}
                address={row.address}
                label={row.label}
                logoURI={row.logoURI}
                right={row.right}
                standard={row.standard}
                isLast={i === rows.length - 1}
              />
            ))
          )}
        </YStack>
      )}
    </YStack>
  );
}
