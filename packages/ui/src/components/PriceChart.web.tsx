import React, { useState } from 'react';
import { Pressable } from 'react-native';
import { Text, XStack, YStack } from 'tamagui';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type PriceChartPeriod = '1D' | '1W' | '1M' | '1Y';

export interface PriceChartProps {
  /** Price data points for the currently selected period. */
  data: number[];
  /** Width of the chart in pixels. Defaults to 320. */
  width?: number;
  /** Height of the chart in pixels. Defaults to 120. */
  height?: number;
  /** Accent color for the line and gradient. Defaults to '#00C853' */
  color?: string;
  /** Currently selected period. */
  period?: PriceChartPeriod;
  /** Called when the user selects a different period. */
  onPeriodChange?: (period: PriceChartPeriod) => void;
  /** Override which period tabs to show. Defaults to all four. */
  periods?: PriceChartPeriod[];
}

const PERIODS: PriceChartPeriod[] = ['1D', '1W', '1M', '1Y'];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function buildPaths(
  data: number[],
  width: number,
  height: number
): { linePath: string; areaPath: string } {
  if (data.length < 2) {
    return { linePath: '', areaPath: '' };
  }

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  const pad = 4; // vertical padding in px
  const usableH = height - pad * 2;

  const toX = (i: number): number => (i / (data.length - 1)) * width;
  const toY = (v: number): number => pad + usableH - ((v - min) / range) * usableH;

  // Build a smooth cubic bezier path through the points
  let linePath = `M ${toX(0)} ${toY(data[0])}`;
  for (let i = 0; i < data.length - 1; i++) {
    const x0 = toX(i);
    const y0 = toY(data[i]);
    const x1 = toX(i + 1);
    const y1 = toY(data[i + 1]);
    const cpX = (x0 + x1) / 2;
    linePath += ` C ${cpX} ${y0}, ${cpX} ${y1}, ${x1} ${y1}`;
  }

  // Close the area path along the bottom edge
  const lastX = toX(data.length - 1);
  const areaPath = linePath + ` L ${lastX} ${height} L ${toX(0)} ${height} Z`;

  return { linePath, areaPath };
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function PriceChart({
  data,
  width = 320,
  height = 120,
  color = '#00C853',
  period: externalPeriod,
  onPeriodChange,
  periods: customPeriods,
}: PriceChartProps): React.ReactElement {
  const [internalPeriod, setInternalPeriod] = useState<PriceChartPeriod>('1D');
  const activePeriod = externalPeriod ?? internalPeriod;

  const handlePeriodPress = (p: PriceChartPeriod): void => {
    setInternalPeriod(p);
    onPeriodChange?.(p);
  };

  const { linePath, areaPath } = buildPaths(data, width, height);

  const gradientId = 'priceGradient';

  return (
    <YStack gap="$2">
      {/* Chart */}
      <svg width={width} height={height}>
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.4} />
            <stop offset="100%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        {/* Area fill */}
        {areaPath ? <path d={areaPath} fill={`url(#${gradientId})`} /> : null}
        {/* Line */}
        {linePath ? (
          <path
            d={linePath}
            fill="none"
            stroke={color}
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ) : null}
      </svg>

      {/* Period selector */}
      <XStack justify="center" gap="$4">
        {(customPeriods ?? PERIODS).map((p) => {
          const isActive = p === activePeriod;
          return (
            <Pressable key={p} onPress={() => handlePeriodPress(p)}>
              <YStack
                px="$3"
                py="$1"
                rounded="$10"
                bg={isActive ? '$bg3' : 'transparent'}
                items="center"
                justify="center"
              >
                <Text
                  fontSize={12}
                  fontWeight={isActive ? '600' : '400'}
                  color={isActive ? '$text1' : '$text2'}
                >
                  {p}
                </Text>
              </YStack>
            </Pressable>
          );
        })}
      </XStack>
    </YStack>
  );
}
