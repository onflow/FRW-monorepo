import { AddressbookService } from '@onflow/frw-api';
import { context, type PlatformSpec } from '@onflow/frw-context';
import type { AddressBookResponse, FRWError, ErrorCode } from '@onflow/frw-types';
import { logger } from '@onflow/frw-utils';

/**
 * AddressBook service using direct network requests instead of native bridge
 */
export class AddressBookService {
  private static instance: AddressBookService;
  private bridge: PlatformSpec;

  private constructor(bridge: PlatformSpec) {
    this.bridge = bridge;
  }

  public static getInstance(bridge?: PlatformSpec): AddressBookService {
    if (!AddressBookService.instance) {
      let bridgeToUse = bridge;

      // If bridge is not provided, try to get it from ServiceContext
      if (!bridgeToUse) {
        try {
          bridgeToUse = context.bridge;
        } catch {
          throw new FRWError(
            ErrorCode.BRIDGE_NOT_FOUND,
            'AddressBookService requires bridge parameter or initialized ServiceContext',
            { bridge }
          );
        }
      }

      AddressBookService.instance = new AddressBookService(bridgeToUse);
    }
    return AddressBookService.instance;
  }
  /**
   * Get all address book contacts using the existing goservice
   * Replaces the native bridge call with direct network request
   */
  async getAddressBook(): Promise<AddressBookResponse> {
    try {
      // The goservice returns the full response structure like the Android API
      const response: any = await AddressbookService.contact();

      // The response should have the structure: { data: { contacts: [...] }, status: number, message: string }
      // But if it's just an array or different structure, we need to handle it
      if (Array.isArray(response)) {
        // Direct array response
        return {
          contacts: response.map((contact: any) => ({
            id: String(contact.id || contact.address || ''),
            name: contact.username || contact.contact_name || 'Unknown Contact',
            address: contact.address || '',
            avatar: contact.avatar,
            username: contact.username,
            contactName: contact.contact_name,
          })),
        };
      } else if (response.data?.contacts) {
        // Wrapped response like Android
        return {
          contacts: response.data.contacts.map((contact: any) => ({
            id: String(contact.id || contact.address || ''),
            name: contact.username || contact.contact_name || 'Unknown Contact',
            address: contact.address || '',
            avatar: contact.avatar,
            username: contact.username,
            contactName: contact.contact_name,
          })),
        };
      } else if (response.contacts) {
        // Direct contacts property
        return {
          contacts: response.contacts.map((contact: any) => ({
            id: String(contact.id || contact.address || ''),
            name: contact.username || contact.contact_name || 'Unknown Contact',
            address: contact.address || '',
            avatar: contact.avatar,
            username: contact.username,
            contactName: contact.contact_name,
          })),
        };
      } else {
        return {
          contacts: [],
        };
      }
    } catch (error) {
      logger.error('[AddressBookService] Failed to fetch address book:', error);
      throw new FRWError(
        ErrorCode.ADDRESSBOOK_FETCH_FAILED,
        'Failed to fetch address book contacts',
        {}
      );
    }
  }
}
