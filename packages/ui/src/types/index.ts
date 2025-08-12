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
  borderColor?: string;
  borderWidth?: number;
}

export interface TokenCardProps {
  symbol: string;
  name: string;
  balance: string;
  logo?: string;
  price?: string;
  change24h?: number;
  isVerified?: boolean;
  onPress?: () => void;
}

export interface SegmentedControlProps {
  segments: string[];
  value: string;
  onChange: (value: string) => void;
  size?: 'small' | 'medium' | 'large';
  fullWidth?: boolean;
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

export interface RefreshViewProps {
  type?: 'empty' | 'error';
  message: string;
  onRefresh?: () => void;
  refreshText?: string;
}

export interface CollectionModel {
  id?: string;
  name?: string;
  logoURI?: string;
  logo?: string;
  count?: number;
  contractName?: string;
}

export interface NFTCollectionRowProps {
  collection?: CollectionModel;
  showDivider?: boolean;
  onPress?: () => void;
}

export interface Account {
  name?: string;
  address: string;
  avatar?: string;
  balance?: string;
}

export interface AccountCardProps {
  account: Account;
  title: string;
  isLoading?: boolean;
  // Modal-style selection props
  accounts?: Account[];
  onAccountSelect?: (account: Account) => void;
  modalTitle?: string;
  enableModalSelection?: boolean;
}

export interface NFTCoverProps {
  src?: string;
  size?: number | string;
  borderRadius?: string | number;
  fallbackIcon?: string;
}

export interface NFTModel {
  id?: string;
  name?: string;
  image?: string;
  thumbnail?: string;
  amount?: string | number;
}

export interface NFTListCardProps {
  nft: NFTModel;
  selected?: boolean;
  onPress?: () => void;
  onDetailPress?: () => void;
  account?: {
    name?: string;
    avatar?: string;
  };
  showAmount?: boolean;
  selectionIcon?: React.ReactNode;
}

export interface Token {
  symbol?: string;
  name?: string;
  logo?: string;
  logoURI?: string;
  balance?: string;
  price?: number;
  isVerified?: boolean;
}

export interface TokenAmountInputProps {
  selectedToken?: Token;
  amount?: string;
  onAmountChange?: (amount: string) => void;
  isTokenMode?: boolean;
  onToggleInputMode?: () => void;
  onTokenSelectorPress?: () => void;
  onMaxPress?: () => void;
  placeholder?: string;
  showBalance?: boolean;
  showConverter?: boolean;
  disabled?: boolean;
}

export interface AddressTextProps {
  address: string;
  truncate?: boolean;
  startLength?: number;
  endLength?: number;
  separator?: string;
  copyable?: boolean;
  onPress?: () => void;
}

export interface BadgeProps {
  variant?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'outline';
  size?: 'small' | 'medium' | 'large';
  children: React.ReactNode;
}

export interface ChipProps {
  variant?: 'default' | 'primary' | 'outline';
  size?: 'small' | 'medium' | 'large';
  selected?: boolean;
  disabled?: boolean;
  onPress?: () => void;
  onRemove?: () => void;
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
  children: React.ReactNode;
}

export interface EnhancedSegmentedControlProps {
  segments: string[];
  value: string;
  onChange: (value: string) => void;
  size?: 'small' | 'medium' | 'large';
  fullWidth?: boolean;
}
