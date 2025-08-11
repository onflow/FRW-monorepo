import type { ComponentProps } from 'react';
import type { Button as TamaguiButton, Input as TamaguiInput, Text as TamaguiText } from 'tamagui';

// Base component props
export type ButtonProps = ComponentProps<typeof TamaguiButton>;
export type InputProps = ComponentProps<typeof TamaguiInput>;
export type TextProps = ComponentProps<typeof TamaguiText>;

// Custom component props
export interface AvatarProps {
  src?: string;
  alt?: string;
  size?: number;
  fallback?: string;
  showOnlineIndicator?: boolean;
}

export interface TokenCardProps {
  symbol: string;
  name: string;
  balance: string;
  logo?: string;
  price?: string;
  change24h?: number;
  onPress?: () => void;
}

export interface SegmentedControlProps {
  options: string[];
  selectedIndex: number;
  onChange: (index: number) => void;
  size?: 'small' | 'medium' | 'large';
}

export interface SkeletonProps {
  width?: number | string;
  height?: number | string;
  borderRadius?: number;
  animated?: boolean;
}

export interface BackgroundWrapperProps {
  children: React.ReactNode;
  backgroundColor?: string | `$${string}`;
}
