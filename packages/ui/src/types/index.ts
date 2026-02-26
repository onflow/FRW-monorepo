import type {
  TokenModel,
  WalletAccount,
  Currency,
  NFTModel,
  ActivityItem,
  FungibleTokenCatalogItem,
} from '@onflow/frw-types';
import type { ComponentProps } from 'react';
import type { Button as TamaguiButton, Input as TamaguiInput, Text as TamaguiText } from 'tamagui';

// Re-export from frw-types
export type { NFTModel, ActivityItem };

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
  baseBgLight?: string | `$${string}`;
  baseBgDark?: string | `$${string}`;
  animationType?: 'pulse' | 'none';
  pulseDuration?: number;
  pulseMinOpacity?: number;
  pulseMaxOpacity?: number;
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
  title?: string; // Optional - if not provided, title is hidden
  isLoading?: boolean;
  // Modal-style selection props
  accounts?: WalletAccount[];
  onAccountSelect?: (account: WalletAccount) => void;
  modalTitle?: string;
  enableModalSelection?: boolean;
  showEditButton?: boolean;
  showCopyButton?: boolean;
  onCopyAddress?: (address: string) => void;
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

// Claim screen components props
export interface PriceChangeBadgeProps {
  value: number;
}

export interface ClaimSenderRowProps {
  name: string;
  address: string;
  avatar?: string;
  emojiInfo?: { emoji: string; name: string; color: string };
  parentEmoji?: { emoji: string; name: string; color: string };
  isCollapsed: boolean;
  onPress: () => void;
}

export interface ClaimDateHeaderProps {
  date: string;
}

export interface ClaimItemRowProps {
  name: string;
  symbol: string;
  logoURI?: string;
  amount: string;
  price?: number;
  priceChange24h?: number;
  usdValue?: number;
  isLast: boolean;
}

// Token list components props
export interface AddTokenListItemProps {
  token: FungibleTokenCatalogItem;
  isEnabled: boolean;
  isLast: boolean;
  onAdd: () => void;
}

export interface TokenSectionHeaderProps {
  letter: string;
}

export interface ClaimBannerProps {
  title: string;
  onPress?: () => void;
}

// Activity components props
export interface ActivityCardProps {
  item: ActivityItem;
  onPress?: () => void;
}

export interface ActivityGroupHeaderProps {
  title: string;
}

export interface ActivitySkeletonProps {
  count?: number;
}

export interface ActivityDetailRowProps {
  /** Label on the left side */
  label: string;
  /** Value on the right side */
  value: string;
  /** Optional color for the value text */
  valueColor?: string;
  /** Optional secondary text below the value (e.g., "Covered by Flow Wallet") */
  secondaryText?: string;
  /** Show strikethrough on original value (for free fees) */
  showStrikethrough?: boolean;
  /** Original value to show with strikethrough */
  originalValue?: string;
  /** Show Flow logo after value */
  showFlowLogo?: boolean;
  /** Show skeleton placeholder instead of value while loading */
  skeleton?: boolean;
}
