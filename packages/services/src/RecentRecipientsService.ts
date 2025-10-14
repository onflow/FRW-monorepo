import {
  getServiceContext,
  type PlatformSpec,
  type Storage,
  type StorageKeyMap,
} from '@onflow/frw-context';
import { type WalletAccount, type RecentRecipient, FRWError, ErrorCode } from '@onflow/frw-types';
import { logger } from '@onflow/frw-utils';

const MAX_RECENT_RECIPIENTS = 10;

export class RecentRecipientsService {
  /**
   * Get all recent recipients (merged from MMKV + bridge)
   */
  private static instance: RecentRecipientsService;
  private bridge: PlatformSpec;
  private storage: Storage;

  private constructor(bridge: PlatformSpec, storage: Storage) {
    this.bridge = bridge;
    this.storage = storage;
  }

  // add bridge params
  public static getInstance(bridge?: PlatformSpec, storage?: Storage): RecentRecipientsService {
    if (!RecentRecipientsService.instance) {
      let bridgeToUse = bridge;
      let storageToUse = storage;

      // If bridge is not provided, try to get it from ServiceContext
      if (!bridgeToUse) {
        try {
          bridgeToUse = getServiceContext().bridge;
        } catch {
          throw new FRWError(
            ErrorCode.BRIDGE_NOT_FOUND,
            'RecentRecipientsService requires bridge parameter or initialized ServiceContext',
            { bridge }
          );
        }
      }

      // If storage is not provided, try to get it from ServiceContext
      if (!storageToUse) {
        try {
          storageToUse = getServiceContext().storage;
        } catch {
          throw new FRWError(
            ErrorCode.RECENT_RECIPIENTS_STORAGE_NOT_FOUND,
            'RecentRecipientsService requires storage parameter or initialized ServiceContext',
            { storage }
          );
        }
      }

      RecentRecipientsService.instance = new RecentRecipientsService(bridgeToUse, storageToUse);
    }
    return RecentRecipientsService.instance;
  }

  async getAllRecentRecipients(): Promise<WalletAccount[]> {
    try {
      // Get local recent recipients from storage
      const localRecents = await this.getLocalRecentRecipients();

      // Get server recent recipients from bridge
      const serverRecents = await this.getServerRecentRecipients();

      // Merge and deduplicate
      const merged = await this.mergeAndDeduplicateRecents(
        this.getLocalRecentRecipients(),
        this.getServerRecentRecipients()
      );

      // Convert to WalletAccount format
      return merged.map((recent) => ({
        id: recent.id,
        name: recent.name,
        emoji: recent.emoji || '👤', // Use emoji if available, fallback to default
        avatar: recent.avatar, // Keep avatar separate
        address: recent.address,
        isActive: false,
      }));
    } catch (_error) {
      logger.error('Error fetching all recent recipients', _error);
      throw new FRWError(
        ErrorCode.RECENT_RECIPIENTS_FETCH_FAILED,
        'Failed to fetch all recent recipients',
        {}
      );
    }
  }

  /**
   * Get local recent recipients from storage
   */
  async getLocalRecentRecipients(): Promise<RecentRecipient[]> {
    try {
      const recents = await this.storage.get('recentRecipients');
      if (!recents) return [];

      const recipientsArray = Array.isArray(recents) ? recents : [];
      return recipientsArray.sort((a, b) => b.lastUsed - a.lastUsed);
    } catch (_error) {
      logger.error('Error fetching local recent recipients', _error);
      throw new FRWError(
        ErrorCode.RECENT_RECIPIENTS_LOCAL_FETCH_FAILED,
        'Failed to fetch local recent recipients',
        {}
      );
    }
  }

  /**
   * Get server recent recipients from bridge
   */
  async getServerRecentRecipients(): Promise<RecentRecipient[]> {
    try {
      const recentData = await this.bridge.getRecentContacts();

      return recentData.contacts.map((contact: any) => ({
        id: contact.id || contact.address,
        name: contact.name || contact.contactName || 'Unknown',
        address: contact.address || '',
        emoji: contact.emoji, // Use actual emoji field
        avatar: contact.avatar, // Use actual avatar field
        lastUsed: Date.now(), // Server doesn't provide timestamp, use current time
        source: 'server' as const,
      }));
    } catch (_error) {
      logger.error('Error fetching server recent recipients', _error);
      throw new FRWError(
        ErrorCode.RECENT_RECIPIENTS_SERVER_FETCH_FAILED,
        'Failed to fetch server recent recipients',
        {}
      );
    }
  }

  /**
   * Add a new recent recipient (when user selects someone)
   */
  async addRecentRecipient(recipient: {
    id?: string;
    name: string;
    address: string;
    emoji?: string;
    avatar?: string;
  }): Promise<void> {
    try {
      const localRecents = await this.getLocalRecentRecipients();

      const newRecent: RecentRecipient = {
        id: recipient.id || recipient.address,
        name: recipient.name,
        address: recipient.address,
        emoji: recipient.emoji,
        avatar: recipient.avatar,
        lastUsed: Date.now(),
        source: 'local',
      };

      // Remove existing entry with same address (if any)
      const filtered = localRecents.filter((r) => r.address !== recipient.address);

      // Add new entry at the beginning
      const updated: RecentRecipient[] = [newRecent, ...filtered].slice(0, MAX_RECENT_RECIPIENTS);

      await this.storage.set<keyof StorageKeyMap>('recentRecipients', updated);

      logger.debug('Added recent recipient', { name: recipient.name, address: recipient.address });
    } catch (_error) {
      logger.error('Error adding recent recipient', _error);
      throw new FRWError(ErrorCode.RECENT_RECIPIENTS_ADD_FAILED, 'Failed to add recent recipient', {
        recipient,
      });
    }
  }

  /**
   * Clear all local recent recipients
   */
  async clearLocalRecentRecipients(): Promise<void> {
    try {
      await this.storage.delete('recentRecipients');
      logger.debug('Cleared local recent recipients');
    } catch (_error) {
      logger.error('Error clearing local recent recipients', _error);
      throw new FRWError(
        ErrorCode.RECENT_RECIPIENTS_CLEAR_FAILED,
        'Failed to clear local recent recipients',
        {}
      );
    }
  }

  /**
   * Merge and deduplicate recent recipients from local and server
   */
  private async mergeAndDeduplicateRecents(
    localRecents: Promise<RecentRecipient[]>,
    serverRecents: Promise<RecentRecipient[]>
  ): Promise<RecentRecipient[]> {
    const [localRecentsResolved, serverRecentsResolved] = await Promise.all([
      localRecents,
      serverRecents,
    ]);
    const addressMap = new Map<string, RecentRecipient>();

    // Add server recents first (lower priority)
    for (const recent of serverRecentsResolved) {
      if (recent.address) {
        addressMap.set(recent.address, recent);
      }
    }

    // Add local recents (higher priority, will overwrite server entries)
    for (const recent of localRecentsResolved) {
      if (recent.address) {
        addressMap.set(recent.address, recent);
      }
    }

    // Convert back to array and sort by lastUsed
    return Array.from(addressMap.values())
      .sort((a, b) => b.lastUsed - a.lastUsed)
      .slice(0, MAX_RECENT_RECIPIENTS);
  }

  /**
   * Check if an address is in recent recipients
   */
  async isAddressInRecents(address: string): Promise<boolean> {
    const localRecents = await this.getLocalRecentRecipients();
    return localRecents.some((r) => r.address === address);
  }

  /**
   * Get recent recipient by address
   */
  async getRecentRecipientByAddress(address: string): Promise<RecentRecipient | null> {
    const localRecents = await this.getLocalRecentRecipients();
    return localRecents.find((r) => r.address === address) || null;
  }
}
