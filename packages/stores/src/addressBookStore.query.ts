import { context, queryClient } from '@onflow/frw-context';
import { AddressBookService, RecentRecipientsService } from '@onflow/frw-services';
import { FlatQueryDomain } from '@onflow/frw-types';
import { logger } from '@onflow/frw-utils';
import { create } from 'zustand';

// Address book data interfaces
interface Contact {
  id: string;
  name: string;
  address: string;
  avatar?: string;
  isFavorite?: boolean;
  createdAt: number;
  updatedAt: number;
}

interface CreateContactRequest {
  name: string;
  address: string;
  avatar?: string;
}

interface UpdateContactRequest {
  name?: string;
  avatar?: string;
  isFavorite?: boolean;
}

// Query Keys Factory for Address Book - Using optimized domain structure
export const addressBookQueryKeys = {
  all: [FlatQueryDomain.ADDRESSBOOK] as const, // Uses USER_SETTINGS domain
  contacts: () => [...addressBookQueryKeys.all, FlatQueryDomain.CONTACTS] as const,
  contact: (id: string) => [...addressBookQueryKeys.contacts(), id] as const,
  favorites: () => [...addressBookQueryKeys.all, 'favorites'] as const,
  recent: () => [...addressBookQueryKeys.all, FlatQueryDomain.RECENT] as const,
};

// Query Functions - Pure data fetching logic for address book
export const addressBookQueries = {
  // Fetch all contacts
  fetchContacts: async (): Promise<Contact[]> => {
    try {
      // Use real address book API service
      const addressBookService = AddressBookService.getInstance();
      const response = await addressBookService.getAddressBook();

      // Convert API response to Contact format
      const contacts: Contact[] = response.contacts.map((contact) => ({
        id: contact.id,
        name: contact.name,
        address: contact.address,
        avatar: contact.avatar || '',
        isFavorite: false, // API doesn't provide this, default to false
        createdAt: Date.now(),
        updatedAt: Date.now(),
      }));

      logger.debug('[AddressBookQuery] Fetched contacts:', {
        count: contacts.length,
        contacts: contacts,
      });

      return contacts;
    } catch (error: unknown) {
      logger.error('[AddressBookQuery] Error fetching contacts:', error);

      // Return empty array if API fails - no mock service needed
      return [];
    }
  },

  // Fetch single contact
  fetchContact: async (id: string): Promise<Contact> => {
    try {
      // Try to find in address book first
      const addressBookService = AddressBookService.getInstance();
      const response = await addressBookService.getAddressBook();

      const foundContact = response.contacts.find((c) => c.id === id);
      if (foundContact) {
        const contact: Contact = {
          id: foundContact.id,
          name: foundContact.name,
          address: foundContact.address,
          avatar: foundContact.avatar,
          isFavorite: false,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };

        logger.debug('[AddressBookQuery] Fetched contact from address book:', { id, contact });
        return contact;
      }

      // If not found in address book, try recent contacts
      const recentService = RecentRecipientsService.getInstance();
      const recentAccounts = await recentService.getAllRecentRecipients();

      const foundRecent = recentAccounts.find((a) => a.id === id);
      if (foundRecent) {
        const contact: Contact = {
          id: foundRecent.id,
          name: foundRecent.name,
          address: foundRecent.address,
          avatar: foundRecent.avatar,
          isFavorite: false,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };

        logger.debug('[AddressBookQuery] Fetched contact from recent:', { id, contact });
        return contact;
      }

      throw new Error(`Contact ${id} not found`);
    } catch (error: unknown) {
      logger.error('[AddressBookQuery] Error fetching contact:', error);
      throw error;
    }
  },

  // Fetch favorite contacts
  fetchFavorites: async (): Promise<Contact[]> => {
    try {
      // Since real API doesn't have favorites yet, we'll return empty array
      // In the future, this could filter contacts marked as favorites
      const favorites: Contact[] = [];

      logger.debug('[AddressBookQuery] Fetched favorites:', {
        count: favorites.length,
      });

      return favorites;
    } catch (error: unknown) {
      logger.error('[AddressBookQuery] Error fetching favorites:', error);
      throw error;
    }
  },

  // Fetch recent contacts from storage
  fetchRecent: async (): Promise<Contact[]> => {
    try {
      const storage = context.storage;
      const recentContactsData = await storage.get('recentRecipients');

      if (recentContactsData) {
        // The storage returns StorageData<RecentRecipient[]> which is RecentRecipient[] with metadata
        // We need to extract the array items (excluding metadata properties)
        let recipientsArray: any[] = [];

        if (Array.isArray(recentContactsData)) {
          // If it's already an array, use it directly
          recipientsArray = recentContactsData;
        } else if (recentContactsData && typeof recentContactsData === 'object') {
          // If it's a StorageData object, extract array items (exclude metadata)
          const dataObj = recentContactsData as any;
          recipientsArray = Object.values(dataObj).filter(
            (item) =>
              item &&
              typeof item === 'object' &&
              'address' in item &&
              !['version', 'createdAt', 'updatedAt'].includes(String(item))
          );
        }

        // Convert RecentRecipient[] to Contact[]
        const recent: Contact[] = recipientsArray.map((recipient: any) => ({
          id: recipient.id || recipient.address,
          name: recipient.name || 'Recent Contact',
          address: recipient.address,
          avatar: recipient.avatar || '',
          isFavorite: false,
          createdAt: recipient.createdAt || Date.now(),
          updatedAt: recipient.updatedAt || Date.now(),
        }));

        logger.debug('[AddressBookQuery] Fetched recent contacts from storage:', recent);
        return recent;
      }

      logger.debug('[AddressBookQuery] No recent contacts found in storage');
      return [];
    } catch (error: unknown) {
      logger.error('[AddressBookQuery] Error fetching recent contacts:', error);
      return [];
    }
  },
};

// Mutation Functions for address book operations
export const addressBookMutations = {
  // Create a new contact
  createContact: async (data: CreateContactRequest): Promise<Contact> => {
    try {
      // For now, creating contacts is not supported by the real API
      // This would need to be implemented when backend supports it
      throw new Error('Creating contacts is not yet supported by the backend API');
    } catch (error: unknown) {
      logger.error('[AddressBookMutation] Error creating contact:', error);
      throw error;
    }
  },

  // Update an existing contact
  updateContact: async (id: string, data: UpdateContactRequest): Promise<Contact> => {
    try {
      // For now, updating contacts is not supported by the real API
      // This would need to be implemented when backend supports it
      throw new Error('Updating contacts is not yet supported by the backend API');
    } catch (error: unknown) {
      logger.error('[AddressBookMutation] Error updating contact:', error);
      throw error;
    }
  },

  // Delete a contact
  deleteContact: async (id: string): Promise<void> => {
    try {
      // For now, deleting contacts is not supported by the real API
      // This would need to be implemented when backend supports it
      throw new Error('Deleting contacts is not yet supported by the backend API');
    } catch (error: unknown) {
      logger.error('[AddressBookMutation] Error deleting contact:', error);
      throw error;
    }
  },

  // Set recent contact after transaction completion
  setRecentContact: async (contact: Contact): Promise<void> => {
    try {
      // Get existing recent contacts from storage
      const storage = context.storage;
      const existingRecentData = await storage.get('recentRecipients');
      let recentRecipients: any[] = [];

      if (existingRecentData) {
        // Handle both array format and StorageData format
        if (Array.isArray(existingRecentData)) {
          recentRecipients = existingRecentData;
        } else if (existingRecentData && typeof existingRecentData === 'object') {
          // If it's a StorageData object, extract the array
          recentRecipients = Object.values(existingRecentData).filter(
            (item) => item && typeof item === 'object' && 'address' in item
          );
        }
      }

      // Convert Contact to RecentRecipient format
      const newRecipient = {
        id: contact.id,
        name: contact.name,
        address: contact.address,
        avatar: contact.avatar || '',
        emoji: '',
        createdAt: contact.createdAt,
        updatedAt: contact.updatedAt,
      };

      // Remove existing recipient with same address to avoid duplicates
      recentRecipients = recentRecipients.filter((r) => r.address !== contact.address);

      // Add new recipient to the beginning
      recentRecipients.unshift(newRecipient);

      // Keep only the last 10 recent recipients
      recentRecipients = recentRecipients.slice(0, 10);

      // Store the array directly - ExtensionStorage.set will automatically add metadata
      await storage.set('recentRecipients', recentRecipients as any);

      // Invalidate the recent contacts query to trigger a refetch
      queryClient.invalidateQueries({ queryKey: addressBookQueryKeys.recent() });

      logger.debug('[AddressBookMutation] Set recent contact:', {
        contact,
        totalRecent: recentRecipients.length,
      });
    } catch (error: unknown) {
      logger.error('[AddressBookMutation] Error setting recent contact:', error);
      throw error;
    }
  },
};

// Store interface
interface AddressBookStoreState {
  // Minimal state - queries handle data
  placeholder?: never; // Prevent empty interface warning
}

interface AddressBookStoreActions {
  // Query methods
  fetchContacts: () => Promise<Contact[]>;
  fetchContact: (id: string) => Promise<Contact>;
  fetchFavorites: () => Promise<Contact[]>;
  fetchRecent: () => Promise<Contact[]>;

  // Mutation methods with cache updates
  createContact: (data: CreateContactRequest) => Promise<Contact>;
  updateContact: (id: string, data: UpdateContactRequest) => Promise<Contact>;
  deleteContact: (id: string) => Promise<void>;
  setRecentContact: (contact: Contact) => Promise<void>;

  // Cache management
  invalidateContacts: () => void;
  invalidateContact: (id: string) => void;

  // Getters with cached data
  getContacts: () => Contact[] | undefined;
  getContact: (id: string) => Contact | undefined;
}

type AddressBookStore = AddressBookStoreState & AddressBookStoreActions;

export const useAddressBookStore = create<AddressBookStore>((_set, _get) => ({
  // Query methods - Direct API calls without TanStack Query for now
  fetchContacts: async () => {
    try {
      const result = await addressBookQueries.fetchContacts();
      return result;
    } catch (error) {
      throw error;
    }
  },

  fetchContact: async (id: string) => {
    return await addressBookQueries.fetchContact(id);
  },

  fetchFavorites: async () => {
    return await addressBookQueries.fetchFavorites();
  },

  fetchRecent: async () => {
    return await addressBookQueries.fetchRecent();
  },

  // Mutation methods with optimistic cache updates
  createContact: async (data: CreateContactRequest): Promise<Contact> => {
    const newContact = await addressBookMutations.createContact(data);
    return newContact;
  },

  updateContact: async (id: string, data: UpdateContactRequest): Promise<Contact> => {
    const updatedContact = await addressBookMutations.updateContact(id, data);
    return updatedContact;
  },

  deleteContact: async (id: string): Promise<void> => {
    await addressBookMutations.deleteContact(id);
  },

  setRecentContact: async (contact: Contact): Promise<void> => {
    await addressBookMutations.setRecentContact(contact);
  },

  // Cache management - No-op for now since we're not using TanStack Query
  invalidateContacts: (): void => {
    // No-op
  },

  invalidateContact: (id: string): void => {
    // No-op
  },

  // Getters - Return undefined for now since we're not using TanStack Query
  getContacts: (): Contact[] | undefined => {
    return undefined;
  },

  getContact: (id: string): Contact | undefined => {
    return undefined;
  },
}));

// Real services are now integrated above - no more mock service needed!

// Query keys, queries, and mutations are already exported above

// Example usage in a React component:
/*
import { useQuery, useMutation } from '@tanstack/react-query';
import { addressBookQueryKeys, addressBookQueries, addressBookMutations } from '@onflow/frw-stores/src/addressBookStore.query';

export function ContactsScreen() {
  // Fetch contacts with automatic 5-minute cache
  const { data: contacts, isLoading, error } = useQuery({
    queryKey: addressBookQueryKeys.contacts(),
    queryFn: () => addressBookQueries.fetchContacts(),
    // staleTime automatically set to 5 minutes for USER_SETTINGS category
  });

  // Create contact mutation with cache updates
  const createContactMutation = useMutation({
    mutationFn: addressBookMutations.createContact,
    onSuccess: (newContact) => {
      // Cache automatically updated by store method
      showSuccessToast('Contact created!');
    },
  });

  return (
    <YStack>
      {contacts?.map(contact => (
        <ContactCard key={contact.id} contact={contact} />
      ))}
    </YStack>
  );
}
*/
