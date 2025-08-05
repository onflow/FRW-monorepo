import { AddressbookService } from '@onflow/frw-api';
import type { AddressBookResponse } from '@onflow/frw-types';

import type { BridgeSpec } from '@onflow/frw-context';
import { getServiceContext } from '@onflow/frw-context';

/**
 * AddressBook service using direct network requests instead of native bridge
 */
export class AddressBookService {
  private static instance: AddressBookService;
  private bridge: BridgeSpec;

  private constructor(bridge: BridgeSpec) {
    this.bridge = bridge;
  }

  public static getInstance(bridge?: BridgeSpec): AddressBookService {
    if (!AddressBookService.instance) {
      let bridgeToUse = bridge;
      
      // If bridge is not provided, try to get it from ServiceContext
      if (!bridgeToUse) {
        try {
          bridgeToUse = getServiceContext().bridge;
        } catch (error) {
          throw new Error('AddressBookService requires bridge parameter or initialized ServiceContext');
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
        // Single contact or unexpected structure
        const contact = response;
        return {
          contacts: [
            {
              id: String(contact.id || contact.address || ''),
              name: contact.username || contact.contact_name || 'Unknown Contact',
              address: contact.address || '',
              avatar: contact.avatar,
              username: contact.username,
              contactName: contact.contact_name,
            },
          ],
        };
      }
    } catch (error) {
      console.error('[AddressBookService] Failed to fetch address book:', error);
      // Return empty array on error
      return {
        contacts: [],
      };
    }
  }
}
