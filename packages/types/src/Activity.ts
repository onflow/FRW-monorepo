import { type WalletType } from './Wallet';

/**
 * Activity types for transaction history display
 * Supports both Flow (Cadence) and Flow-EVM transactions
 */

/**
 * Transaction status values
 */
export type ActivityStatus = 'pending' | 'executed' | 'sealed' | 'finalized' | 'expired' | 'failed';

/**
 * Type of activity/transaction
 */
export type ActivityType = 'ft' | 'nft' | 'interaction';

/**
 * Direction of the transfer relative to the user's wallet
 */
export type TransferDirection = 'sent' | 'received' | 'self';

/**
 * Profile info for sender/receiver when they are the user's own accounts
 * Matches the emojiInfo format used in AccountDisplayData and RecipientItem
 */
export interface ActivityProfile {
  /** Emoji identifier for the account */
  emoji: string;
  /** Display name for the account */
  name: string;
  /** Background color for the avatar */
  color: string;
}

/**
 * Represents a single activity/transaction item
 */
export interface ActivityItem {
  // Identifiers
  id: string;
  hash: string;
  cadenceTxId?: string;
  evmTxIds?: string[];

  // Display information
  title: string;
  token: string;
  image: string;
  amount: string;
  additionalMessage?: string;

  // Addresses
  sender: string;
  receiver: string;
  /** Profile info when sender is user's own account */
  senderProfile?: ActivityProfile;
  /** Profile info when receiver is user's own account */
  receiverProfile?: ActivityProfile;

  // Status
  status: ActivityStatus;
  error: boolean;
  indexed: boolean;

  // Metadata
  time: number;
  type: ActivityType;
  transferType: TransferDirection;
  /** Wallet type (flow or evm) for chain badge display */
  walletType?: WalletType;
}

/**
 * Activity items grouped by date for UI display
 */
export interface ActivityGroup {
  /** Display string: "Today", "Yesterday", "May 28, 2025" */
  date: string;
  /** Unix timestamp for sorting */
  timestamp: number;
  /** Activity items for this date */
  items: ActivityItem[];
}

/**
 * Response from activity list API
 */
export interface ActivityListResponse {
  items: ActivityItem[];
  total: number;
  hasMore: boolean;
}

/**
 * Asset entry in the activity detail response
 */
export interface ActivityDetailAsset {
  id: string;
  type: 'ft' | 'nft';
  thumbnail: string;
  amount: string;
}

/**
 * Response from GET /api/activityDetail
 */
export interface ActivityDetailResponse {
  time: string;
  type: number;
  status: string;
  error: boolean;
  txid: string;
  amount: string;
  fee: string;
  assets: ActivityDetailAsset[];
}

/**
 * Maps raw API status string to ActivityStatus
 */
export function mapActivityStatus(statusString: string): ActivityStatus {
  const statusMap: Record<string, ActivityStatus> = {
    PENDING: 'pending',
    EXECUTED: 'executed',
    SEALED: 'sealed',
    EXPIRED: 'expired',
    FINALIZED: 'finalized',
    SUCCESS: 'sealed',
    FAILED: 'failed',
  };

  return statusMap[statusString.toUpperCase()] || 'pending';
}

/**
 * Gets the display-friendly status string
 */
export function getActivityStatusDisplay(status: ActivityStatus): string {
  const displayMap: Record<ActivityStatus, string> = {
    pending: 'Pending',
    executed: 'Executed',
    sealed: 'Success',
    finalized: 'Success',
    expired: 'Expired',
    failed: 'Failed',
  };

  return displayMap[status];
}

/**
 * Determines if a status represents a successful transaction
 */
export function isActivityStatusSuccess(status: ActivityStatus): boolean {
  return status === 'sealed' || status === 'finalized' || status === 'executed';
}

/**
 * Determines if a status represents a pending transaction
 */
export function isActivityStatusPending(status: ActivityStatus): boolean {
  return status === 'pending';
}

/**
 * Determines if a status represents a failed transaction
 */
export function isActivityStatusFailed(status: ActivityStatus): boolean {
  return status === 'failed' || status === 'expired';
}
