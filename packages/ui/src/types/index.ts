import type { TokenModel, WalletAccount, Currency, NFTModel } from '@onflow/frw-types';
import type { ComponentProps } from 'react';
import type { Button as TamaguiButton, Input as TamaguiInput, Text as TamaguiText } from 'tamagui';

// Re-export from frw-types
export type { NFTModel };

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
  bgColor?: string;
  textColor?: string;
  borderColor?: string;
  borderWidth?: number;
  borderRadius?: number | string;
  style?: React.CSSProperties;
}

export interface TokenCardProps {
  token: TokenModel;
  currency: Currency;
  isVerified?: boolean;
  onPress?: () => void;
  isAccessible?: boolean;
  inaccessibleText?: string;
}

export interface SegmentedControlProps {
  segments: string[];
  value: string;
  onChange: (value: string) => void;
  size?: 'small' | 'medium' | 'large';
  fullWidth?: boolean;
  constrainWidth?: boolean;
}

export interface SkeletonProps {
  width?: number | string;
  height?: number | string;
  borderRadius?: number | string;
  animated?: boolean;
  [key: string]: any; // Allow additional props like mb, mt, etc.
}

export interface BackgroundWrapperProps {
  children: React.ReactNode;
  backgroundColor?: string | `$${string}`;
}

export interface RefreshViewProps {
  type?: 'empty' | 'error';
  title?: string;
  message?: string;
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
  onPress?: () => void;
  isAccessible?: boolean; // For child account accessibility
  inaccessibleText?: string;
}

export interface AccountCardProps {
  account: WalletAccount;
  title: string;
  isLoading?: boolean;
  // Modal-style selection props
  accounts?: WalletAccount[];
  onAccountSelect?: (account: WalletAccount) => void;
  modalTitle?: string;
  enableModalSelection?: boolean;
  showEditButton?: boolean;
}

export interface NFTCoverProps {
  src?: string;
  size?: number | string;
  borderRadius?: string | number;
  fallbackIcon?: string;
}

export interface TokenAmountInputProps {
  selectedToken?: TokenModel;
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
  inputRef?: React.RefObject<any>;
  currency?: Currency;
  amountError?: string;
  headerText?: string;
}

export interface AddressTextProps extends Omit<TextProps, 'children'> {
  address: string | undefined | null;
  truncate?: boolean;
  startLength?: number;
  endLength?: number;
  separator?: string;
  copyable?: boolean;
  onPress?: () => void;
}

export interface BadgeProps {
  variant?:
    | 'default'
    | 'primary'
    | 'secondary'
    | 'success'
    | 'warning'
    | 'error'
    | 'outline'
    | 'evm';
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
