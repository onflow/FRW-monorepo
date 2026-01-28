import { AccountService, EvmService } from '@onflow/frw-api';
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
 * Based on actual API data:
 * 0 = interaction (default/unknown)
 * 1 = ft (fungible token, e.g., FlowToken)
 * 2 = nft (e.g., TopShot, NBA Top Shot)
 */
function mapActivityType(type: number | undefined): ActivityType {
  switch (type) {
    case 1:
      return 'ft';
    case 2:
      return 'nft';
    default:
      return 'interaction';
  }
}

/**
 * Maps API transfer_type number to TransferDirection
 * Based on actual user testing:
 * 0 = interaction/unknown (default to sent for UI)
 * 1 = sent
 * 2 = received
 */
function mapTransferDirection(transferType: number | undefined): TransferDirection {
  switch (transferType) {
    case 1:
      return 'sent';
    case 2:
      return 'received';
    default:
      return 'sent'; // interactions/unknown default to sent
  }
}

/**
 * ActivityProvider interface for fetching activity data
 * Implemented by FlowActivityProvider and EvmActivityProvider
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
    try {
      const response = await AccountService.transfers({
        address,
        limit,
        after: offset,
      });

      // API response structure: { status, message, data: { total, transactions, next } }
      // The generated API returns res.data, so we need to access response.data for the actual data
      const data = response?.data ?? response;
      const transactions = data?.transactions ?? [];

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

      return {
        items,
        total: data?.total ?? items.length,
        hasMore: data?.next ?? false,
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
 * Fetches transaction history for EVM addresses using the EVM-specific API endpoint
 */
class EvmActivityProvider implements ActivityProvider {
  async getData(
    address: string,
    _network: string,
    offset: number,
    limit: number
  ): Promise<ActivityListResponse> {
    try {
      const response = await EvmService.getTransactions(address, offset, limit);

      const transactions = response?.trxs ?? [];
      const items: ActivityItem[] = transactions.map((tx) => ({
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
      }));

      // EVM API uses next_page_params for pagination
      const hasMore = !!response?.next_page_params;
      const total = response?.next_page_params?.items_count ?? items.length;

      return {
        items,
        total,
        hasMore,
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
   */
  async getActivity(
    address: string,
    network: string = 'mainnet',
    offset: number = 0,
    limit: number = 15
  ): Promise<ActivityListResponse> {
    return this.activityProvider.getData(address, network, offset, limit);
  }

  /**
   * Get the wallet type this service is configured for
   */
  getWalletType(): WalletType {
    return this.walletType;
  }
}
