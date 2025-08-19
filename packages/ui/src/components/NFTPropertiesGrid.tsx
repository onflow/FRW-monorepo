import React from 'react';
import { YStack, XStack, Text } from 'tamagui';

import { NFTPropertyTag } from './NFTPropertyTag';

export interface NFTProperty {
  label: string;
  value: string;
}

export interface NFTPropertiesGridProps {
  properties: NFTProperty[];
  title?: string;
  columns?: number;
  gap?: number;
  propertyGap?: number;
  variant?: 'default' | 'compact';
  showTitle?: boolean;
  titleSpacing?: number;
}

export function NFTPropertiesGrid({
  properties,
  title = 'Properties',
  columns = 2,
  gap = 8,
  propertyGap,
  variant = 'default',
  showTitle = true,
  titleSpacing = 13,
}: NFTPropertiesGridProps) {
  if (properties.length === 0) {
    return null;
  }

  // Group properties into rows
  const rows: NFTProperty[][] = [];
  for (let i = 0; i < properties.length; i += columns) {
    rows.push(properties.slice(i, i + columns));
  }

  return (
    <YStack gap={titleSpacing}>
      {showTitle && (
        <Text fontSize={14} fontWeight="500" lineHeight={19.6} color="$color">
          {title}
        </Text>
      )}

      <YStack gap={gap}>
        {rows.map((row, rowIndex) => (
          <XStack key={rowIndex} gap={propertyGap ?? gap} flexWrap="wrap">
            {row.map((property, propIndex) => (
              <NFTPropertyTag
                key={`${rowIndex}-${propIndex}`}
                label={property.label}
                value={property.value}
                variant={variant}
              />
            ))}
          </XStack>
        ))}
      </YStack>
    </YStack>
  );
}
