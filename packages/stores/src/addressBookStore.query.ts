import { queryClient } from '@onflow/frw-context';
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
      const addressBookService = AddressBookService.getInstance();
      const response = await addressBookService.getAddressBook();

      // Convert AddressBookResponse to Contact[] format
      const contacts: Contact[] = response.contacts.map((contact) => ({
        id: contact.id,
        name: contact.name,
        address: contact.address,
        avatar: contact.avatar,
        isFavorite: false, // API doesn't provide favorite status yet
        createdAt: Date.now(),
        updatedAt: Date.now(),
      }));

      logger.debug('[AddressBookQuery] Fetched contacts:', {
        count: contacts.length,
      });

      return contacts;
    } catch (error: unknown) {
      logger.error('[AddressBookQuery] Error fetching contacts:', error);
      throw error;
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

  // Fetch recent contacts
  fetchRecent: async (): Promise<Contact[]> => {
    try {
      const recentService = RecentRecipientsService.getInstance();
      const recentAccounts = await recentService.getAllRecentRecipients();

      // Convert WalletAccount[] to Contact[] format
      const contacts: Contact[] = recentAccounts.map((account) => ({
        id: account.id,
        name: account.name,
        address: account.address,
        avatar: account.avatar,
        isFavorite: false,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      }));

      logger.debug('[AddressBookQuery] Fetched recent contacts:', {
        count: contacts.length,
      });

      return contacts;
    } catch (error: unknown) {
      logger.error('[AddressBookQuery] Error fetching recent contacts:', error);
      throw error;
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

  // Cache management
  invalidateContacts: () => void;
  invalidateContact: (id: string) => void;

  // Getters with cached data
  getContacts: () => Contact[] | undefined;
  getContact: (id: string) => Contact | undefined;
}

type AddressBookStore = AddressBookStoreState & AddressBookStoreActions;

export const useAddressBookStore = create<AddressBookStore>((_set, _get) => ({
  // Query methods - Automatic 5-minute cache for USER_SETTINGS category
  fetchContacts: async () => {
    return await queryClient.fetchQuery({
      queryKey: addressBookQueryKeys.contacts(),
      queryFn: () => addressBookQueries.fetchContacts(),
      // staleTime: 5 minutes handled automatically for 'addressbook' user settings data
    });
  },

  fetchContact: async (id: string) => {
    return await queryClient.fetchQuery({
      queryKey: addressBookQueryKeys.contact(id),
      queryFn: () => addressBookQueries.fetchContact(id),
      // Automatic cache management
    });
  },

  fetchFavorites: async () => {
    return await queryClient.fetchQuery({
      queryKey: addressBookQueryKeys.favorites(),
      queryFn: () => addressBookQueries.fetchFavorites(),
      // Automatic cache management
    });
  },

  fetchRecent: async () => {
    return await queryClient.fetchQuery({
      queryKey: addressBookQueryKeys.recent(),
      queryFn: () => addressBookQueries.fetchRecent(),
      // Automatic cache management
    });
  },

  // Mutation methods with optimistic cache updates
  createContact: async (data: CreateContactRequest): Promise<Contact> => {
    const newContact = await addressBookMutations.createContact(data);

    // Optimistically update contacts cache
    queryClient.setQueryData<Contact[]>(addressBookQueryKeys.contacts(), (oldContacts) =>
      oldContacts ? [newContact, ...oldContacts] : [newContact]
    );

    // Invalidate related queries
    queryClient.invalidateQueries({
      queryKey: addressBookQueryKeys.favorites(),
    });

    return newContact;
  },

  updateContact: async (id: string, data: UpdateContactRequest): Promise<Contact> => {
    const updatedContact = await addressBookMutations.updateContact(id, data);

    // Update individual contact cache
    queryClient.setQueryData<Contact>(addressBookQueryKeys.contact(id), updatedContact);

    // Update contacts list cache
    queryClient.setQueryData<Contact[]>(
      addressBookQueryKeys.contacts(),
      (oldContacts) =>
        oldContacts?.map((contact) => (contact.id === id ? updatedContact : contact)) || []
    );

    // Invalidate favorites if favorite status changed
    if ('isFavorite' in data) {
      queryClient.invalidateQueries({
        queryKey: addressBookQueryKeys.favorites(),
      });
    }

    return updatedContact;
  },

  deleteContact: async (id: string): Promise<void> => {
    await addressBookMutations.deleteContact(id);

    // Remove from all caches
    queryClient.removeQueries({
      queryKey: addressBookQueryKeys.contact(id),
    });

    queryClient.setQueriesData<Contact[]>(
      { queryKey: addressBookQueryKeys.contacts() },
      (oldContacts) => oldContacts?.filter((contact) => contact.id !== id) || []
    );

    queryClient.setQueriesData<Contact[]>(
      { queryKey: addressBookQueryKeys.favorites() },
      (oldFavorites) => oldFavorites?.filter((contact) => contact.id !== id) || []
    );

    queryClient.setQueriesData<Contact[]>(
      { queryKey: addressBookQueryKeys.recent() },
      (oldRecent) => oldRecent?.filter((contact) => contact.id !== id) || []
    );
  },

  // Cache management
  invalidateContacts: (): void => {
    queryClient.invalidateQueries({
      queryKey: addressBookQueryKeys.contacts(),
    });
  },

  invalidateContact: (id: string): void => {
    queryClient.invalidateQueries({
      queryKey: addressBookQueryKeys.contact(id),
    });
  },

  // Getters - Return cached data without triggering fetch
  getContacts: (): Contact[] | undefined => {
    return queryClient.getQueryData<Contact[]>(addressBookQueryKeys.contacts());
  },

  getContact: (id: string): Contact | undefined => {
    return queryClient.getQueryData<Contact>(addressBookQueryKeys.contact(id));
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
