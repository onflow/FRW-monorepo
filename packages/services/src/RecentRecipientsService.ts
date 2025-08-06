import { getServiceContext, type PlatformSpec, type Storage } from '@onflow/frw-context';
import type { WalletAccount } from '@onflow/frw-types';
import { logger } from '@onflow/frw-utils';

const RECENT_RECIPIENTS_KEY = 'recent_recipients';
const MAX_RECENT_RECIPIENTS = 10;

export interface RecentRecipient {
  id: string;
  name: string;
  address: string;
  emoji?: string;
  avatar?: string;
  lastUsed: number; // timestamp
  source: 'local' | 'server'; // track where it came from
}

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
        } catch (_error) {
          throw new Error(
            'RecentRecipientsService requires bridge parameter or initialized ServiceContext'
          );
        }
      }

      // If storage is not provided, try to get it from ServiceContext
      if (!storageToUse) {
        try {
          storageToUse = getServiceContext().storage;
        } catch (_error) {
          throw new Error(
            'RecentRecipientsService requires storage parameter or initialized ServiceContext'
          );
        }
      }

      RecentRecipientsService.instance = new RecentRecipientsService(bridgeToUse, storageToUse);
    }
    return RecentRecipientsService.instance;
  }

  async getAllRecentRecipients(): Promise<WalletAccount[]> {
    try {
      // Get local recent recipients from MMKV
      const localRecents = this.getLocalRecentRecipients();

      // Get server recent recipients from bridge
      const serverRecents = await this.getServerRecentRecipients();

      // Merge and deduplicate
      const merged = this.mergeAndDeduplicateRecents(localRecents, serverRecents);

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
      logger.error('Failed to get recent recipients', error);
      return [];
    }
  }

  /**
   * Get local recent recipients from MMKV
   */
  getLocalRecentRecipients(): RecentRecipient[] {
    try {
      const data = this.storage.getString(RECENT_RECIPIENTS_KEY);
      if (!data) return [];

      const recents: RecentRecipient[] = JSON.parse(data);
      return recents.sort((a, b) => b.lastUsed - a.lastUsed); // Most recent first
    } catch (_error) {
      logger.error('Failed to get local recent recipients', error);
      return [];
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
      logger.error('Failed to get server recent recipients', error);
      return [];
    }
  }

  /**
   * Add a new recent recipient (when user selects someone)
   */
  addRecentRecipient(recipient: {
    id?: string;
    name: string;
    address: string;
    emoji?: string;
    avatar?: string;
  }): void {
    try {
      const localRecents = this.getLocalRecentRecipients();

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
      const updated = [newRecent, ...filtered].slice(0, MAX_RECENT_RECIPIENTS);

      // Save to MMKV
      this.storage.set(RECENT_RECIPIENTS_KEY, JSON.stringify(updated));

      logger.debug('Added recent recipient', { name: recipient.name, address: recipient.address });
    } catch (_error) {
      logger.error('Failed to add recent recipient', error);
    }
  }

  /**
   * Clear all local recent recipients
   */
  clearLocalRecentRecipients(): void {
    try {
      this.storage.delete(RECENT_RECIPIENTS_KEY);
      logger.debug('Cleared local recent recipients');
    } catch (_error) {
      logger.error('Failed to clear recent recipients', error);
    }
  }

  /**
   * Merge and deduplicate recent recipients from local and server
   */
  private mergeAndDeduplicateRecents(
    localRecents: RecentRecipient[],
    serverRecents: RecentRecipient[]
  ): RecentRecipient[] {
    const addressMap = new Map<string, RecentRecipient>();

    // Add server recents first (lower priority)
    for (const recent of serverRecents) {
      if (recent.address) {
        addressMap.set(recent.address, recent);
      }
    }

    // Add local recents (higher priority, will overwrite server entries)
    for (const recent of localRecents) {
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
  isAddressInRecents(address: string): boolean {
    const localRecents = this.getLocalRecentRecipients();
    return localRecents.some((r) => r.address === address);
  }

  /**
   * Get recent recipient by address
   */
  getRecentRecipientByAddress(address: string): RecentRecipient | null {
    const localRecents = this.getLocalRecentRecipients();
    return localRecents.find((r) => r.address === address) || null;
  }
}
