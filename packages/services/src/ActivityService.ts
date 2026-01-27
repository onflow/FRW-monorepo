import { AccountService } from '@onflow/frw-api';
import { getServiceContext, type PlatformSpec } from '@onflow/frw-context';
import {
  type ActivityItem,
  type ActivityListResponse,
  type ActivityType,
  mapActivityStatus,
  type TransferDirection,
  WalletType,
} from '@onflow/frw-types';
import { logger } from '@onflow/frw-utils';

/**
 * Maps API type number to ActivityType
 * 0 = ft (fungible token), 1 = nft, 2 = interaction
 */
function mapActivityType(type: number | undefined): ActivityType {
  switch (type) {
    case 1:
      return 'nft';
    case 2:
      return 'interaction';
    default:
      return 'ft';
  }
}

/**
 * Maps API transfer_type number to TransferDirection
 * 0 = sent, 1 = received, 2 = self
 */
function mapTransferDirection(transferType: number | undefined): TransferDirection {
  switch (transferType) {
    case 1:
      return 'received';
    case 2:
      return 'self';
    default:
      return 'sent';
  }
}

/**
 * ActivityProvider interface for fetching activity data
 * Note: Actual API implementation will be added in a separate ticket
 */
interface ActivityProvider {
  getData(
    address: string,
    network: string,
    offset: number,
    limit: number
  ): Promise<ActivityListResponse>;
}

/**
 * Flow (Cadence) activity provider
 * Fetches transaction history for Flow addresses
 */
class FlowActivityProvider implements ActivityProvider {
  async getData(
    address: string,
    _network: string,
    offset: number,
    limit: number
  ): Promise<ActivityListResponse> {
    logger.debug('[FlowActivityProvider] getData called', { address, offset, limit });

    try {
      const response = await AccountService.transfers({
        address,
        limit,
        after: offset,
      });

      const transactions = response?.transactions ?? [];
      const items: ActivityItem[] = transactions.map(
        (tx: {
          txid?: string;
          title?: string;
          token?: string;
          image?: string;
          amount?: string;
          additional_message?: string;
          sender?: string;
          receiver?: string;
          status?: string;
          time?: string;
          type?: number;
          transfer_type?: number;
          error?: boolean;
        }) => ({
          id: tx.txid ?? '',
          hash: tx.txid ?? '',
          cadenceTxId: tx.txid,
          evmTxIds: undefined,
          title: tx.title ?? '',
          token: tx.token ?? '',
          image: tx.image ?? '',
          amount: tx.amount ?? '',
          additionalMessage: tx.additional_message,
          sender: tx.sender ?? '',
          receiver: tx.receiver ?? '',
          senderProfile: undefined,
          receiverProfile: undefined,
          status: mapActivityStatus(tx.status ?? 'PENDING'),
          error: tx.error ?? false,
          indexed: true,
          time: tx.time ? new Date(tx.time).getTime() : Date.now(),
          type: mapActivityType(tx.type),
          transferType: mapTransferDirection(tx.transfer_type),
          walletType: WalletType.Flow,
        })
      );

      logger.debug('[FlowActivityProvider] fetched items', { count: items.length });

      return {
        items,
        total: response?.total ?? items.length,
        hasMore: response?.next ?? false,
      };
    } catch (error) {
      logger.error('[FlowActivityProvider] failed to fetch activity', error);
      return {
        items: [],
        total: 0,
        hasMore: false,
      };
    }
  }
}

/**
 * EVM activity provider
 * Fetches transaction history for EVM addresses
 */
class EvmActivityProvider implements ActivityProvider {
  async getData(
    address: string,
    _network: string,
    offset: number,
    limit: number
  ): Promise<ActivityListResponse> {
    logger.debug('[EvmActivityProvider] getData called', { address, offset, limit });

    try {
      const response = await AccountService.transfers({
        address,
        limit,
        after: offset,
      });

      const transactions = response?.transactions ?? [];
      const items: ActivityItem[] = transactions.map(
        (tx: {
          txid?: string;
          title?: string;
          token?: string;
          image?: string;
          amount?: string;
          additional_message?: string;
          sender?: string;
          receiver?: string;
          status?: string;
          time?: string;
          type?: number;
          transfer_type?: number;
          error?: boolean;
        }) => ({
          id: tx.txid ?? '',
          hash: tx.txid ?? '',
          cadenceTxId: undefined,
          evmTxIds: tx.txid ? [tx.txid] : undefined,
          title: tx.title ?? '',
          token: tx.token ?? '',
          image: tx.image ?? '',
          amount: tx.amount ?? '',
          additionalMessage: tx.additional_message,
          sender: tx.sender ?? '',
          receiver: tx.receiver ?? '',
          senderProfile: undefined,
          receiverProfile: undefined,
          status: mapActivityStatus(tx.status ?? 'PENDING'),
          error: tx.error ?? false,
          indexed: true,
          time: tx.time ? new Date(tx.time).getTime() : Date.now(),
          type: mapActivityType(tx.type),
          transferType: mapTransferDirection(tx.transfer_type),
          walletType: WalletType.EVM,
        })
      );

      logger.debug('[EvmActivityProvider] fetched items', { count: items.length });

      return {
        items,
        total: response?.total ?? items.length,
        hasMore: response?.next ?? false,
      };
    } catch (error) {
      logger.error('[EvmActivityProvider] failed to fetch activity', error);
      return {
        items: [],
        total: 0,
        hasMore: false,
      };
    }
  }
}

/**
 * ActivityService for fetching transaction activity history
 * Supports both Flow (Cadence) and EVM addresses
 */
export class ActivityService {
  private static instances: Map<string, ActivityService> = new Map();
  private activityProvider: ActivityProvider;
  private walletType: WalletType;
  private bridge?: PlatformSpec;

  constructor(type: WalletType, bridge?: PlatformSpec) {
    this.walletType = type;
    this.activityProvider =
      type === WalletType.Flow ? new FlowActivityProvider() : new EvmActivityProvider();

    if (bridge) {
      this.bridge = bridge;
    } else {
      try {
        this.bridge = getServiceContext().bridge;
      } catch (error) {
        logger.warn('[ActivityService] ServiceContext not initialized, bridge will be null');
        this.bridge = undefined;
      }
    }
  }

  static getInstance(type: WalletType, bridge?: PlatformSpec): ActivityService {
    const key = `${type}-${bridge ? 'with-bridge' : 'no-bridge'}`;

    if (!ActivityService.instances.has(key)) {
      ActivityService.instances.set(key, new ActivityService(type, bridge));
    }

    return ActivityService.instances.get(key)!;
  }

  /**
   * Get activity items for an address
   * TODO: Actual API implementation will be added in separate ticket
   */
  async getActivity(
    address: string,
    network: string = 'mainnet',
    offset: number = 0,
    limit: number = 15
  ): Promise<ActivityListResponse> {
    logger.debug('[ActivityService] getActivity called', {
      address,
      network,
      offset,
      limit,
      walletType: this.walletType,
    });

    return this.activityProvider.getData(address, network, offset, limit);
  }

  /**
   * Get the wallet type this service is configured for
   */
  getWalletType(): WalletType {
    return this.walletType;
  }
}

/**
 * Helper function to create mock activity items for testing/development
 * Can be used by screens to display sample data during development
 */
export function createMockActivityItems(count: number = 5): ActivityItem[] {
  const now = Date.now();
  const day = 24 * 60 * 60 * 1000;

  const mockItems: ActivityItem[] = [];

  for (let i = 0; i < count; i++) {
    const isSent = i % 2 === 0;
    const isNft = i % 3 === 0;
    const isInteraction = i === 2; // Add dApp interaction example
    const isSelfTransfer = i === 4; // Add self transfer example (between own accounts)
    const dayOffset = Math.floor(i / 2);

    mockItems.push({
      id: `mock-tx-${i}`,
      hash: `0x${Math.random().toString(16).slice(2, 10)}...${Math.random().toString(16).slice(2, 6)}`,
      cadenceTxId: `mock-cadence-${i}`,
      evmTxIds: undefined,

      title: isInteraction
        ? 'Contract Interaction'
        : isSelfTransfer
          ? 'Transferred FLOW'
          : isNft
            ? isSent
              ? 'Sent NFT'
              : 'Received NFT'
            : isSent
              ? 'Sent FLOW'
              : 'Received FLOW',
      token: isInteraction ? '' : isNft ? `NFT Collection #${i}` : 'FLOW',
      image: '',
      amount: isInteraction ? '' : isNft ? '' : `${(Math.random() * 100).toFixed(2)}`,
      additionalMessage: undefined,

      sender: isSelfTransfer ? '0x1234...5678' : isSent ? '0x1234...5678' : '0xabcd...efgh',
      receiver: isSelfTransfer ? '0x1234...5678' : isSent ? '0xabcd...efgh' : '0x1234...5678',
      // Include profile info for self transfers (between own accounts)
      // Format matches emojiInfo used in AccountDisplayData and RecipientItem
      senderProfile: isSelfTransfer
        ? { emoji: '🦊', name: 'Main Wallet', color: '#FFB347' }
        : undefined,
      receiverProfile: isSelfTransfer
        ? { emoji: '🐸', name: 'Savings', color: '#77DD77' }
        : undefined,

      status: i === 0 ? 'pending' : i === 1 ? 'failed' : 'sealed',
      error: i === 1,
      indexed: true,

      time: now - dayOffset * day - Math.random() * day * 0.5,
      type: isInteraction ? 'interaction' : isNft ? 'nft' : 'ft',
      transferType: isInteraction ? 'self' : isSelfTransfer ? 'self' : isSent ? 'sent' : 'received',
    });
  }

  return mockItems.sort((a, b) => b.time - a.time);
}
