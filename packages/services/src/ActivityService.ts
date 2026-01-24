import { getServiceContext, type PlatformSpec } from '@onflow/frw-context';
import { type ActivityItem, type ActivityListResponse, WalletType } from '@onflow/frw-types';
import { logger } from '@onflow/frw-utils';

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
 * TODO: Implement actual API calls in separate ticket
 */
class FlowActivityProvider implements ActivityProvider {
  async getData(
    _address: string,
    _network: string,
    _offset: number,
    _limit: number
  ): Promise<ActivityListResponse> {
    // Stub: Return empty data for now
    // Actual implementation will use AccountService.transfers()
    logger.debug('[FlowActivityProvider] getData called - returning stub data');
    return {
      items: [],
      total: 0,
      hasMore: false,
    };
  }
}

/**
 * EVM activity provider
 * TODO: Implement actual API calls in separate ticket
 */
class EvmActivityProvider implements ActivityProvider {
  async getData(
    _address: string,
    _network: string,
    _offset: number,
    _limit: number
  ): Promise<ActivityListResponse> {
    // Stub: Return empty data for now
    // Actual implementation will use /api/evm/{address}/transactions
    logger.debug('[EvmActivityProvider] getData called - returning stub data');
    return {
      items: [],
      total: 0,
      hasMore: false,
    };
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
    const dayOffset = Math.floor(i / 2);

    mockItems.push({
      id: `mock-tx-${i}`,
      hash: `0x${Math.random().toString(16).slice(2, 10)}...${Math.random().toString(16).slice(2, 6)}`,
      cadenceTxId: `mock-cadence-${i}`,
      evmTxIds: undefined,

      title: isInteraction
        ? 'Contract Interaction'
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

      sender: isSent ? '0x1234...5678' : '0xabcd...efgh',
      receiver: isSent ? '0xabcd...efgh' : '0x1234...5678',

      status: i === 0 ? 'pending' : i === 1 ? 'failed' : 'sealed',
      error: i === 1,
      indexed: true,

      time: now - dayOffset * day - Math.random() * day * 0.5,
      type: isInteraction ? 'interaction' : isNft ? 'nft' : 'ft',
      transferType: isInteraction ? 'self' : isSent ? 'sent' : 'received',
    });
  }

  return mockItems.sort((a, b) => b.time - a.time);
}
