import { validateSearchAddress, addressExistsInLists } from './recipientUtils';
import type { ListItem, ExtendedWalletAccount, GroupedContacts } from '../types/recipientTypes';
import type { RecipientTabType } from '../SendToScreen';
import { WalletAccount } from '@/types/bridge';

/**
 * Generate list data for accounts tab
 */
export const generateAccountsListData = (
  walletAccounts: ExtendedWalletAccount[],
  searchQuery: string
): ListItem[] => {
  const items: ListItem[] = [];

  // Filter wallet accounts based on search query
  const filteredAccounts = walletAccounts.filter(account => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      account.name.toLowerCase().includes(query) || account.address.toLowerCase().includes(query)
    );
  });

  // Add wallet accounts directly (no profile grouping needed)
  filteredAccounts.forEach((account, accountIndex) => {
    items.push({
      id: `account-${account.id}`,
      type: 'account',
      data: account,
    });

    if (accountIndex < filteredAccounts.length - 1) {
      items.push({
        id: `divider-${account.id}`,
        type: 'divider',
      });
    }
  });

  return items;
};

/**
 * Generate list data for recent tab
 */
export const generateRecentListData = (
  recentContacts: WalletAccount[],
  searchQuery: string
): ListItem[] => {
  const items: ListItem[] = [];
  const accounts = recentContacts.filter(account => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      account.name.toLowerCase().includes(query) || account.address.toLowerCase().includes(query)
    );
  });

  accounts.forEach((account, index) => {
    items.push({
      id: `item-${account.id}`,
      type: 'account',
      data: account,
    });

    if (index < accounts.length - 1) {
      items.push({
        id: `divider-${account.id}`,
        type: 'divider',
      });
    }
  });

  return items;
};

/**
 * Generate list data for contacts tab
 */
export const generateContactsListData = (
  addressBookContacts: WalletAccount[],
  searchQuery: string
): ListItem[] => {
  const items: ListItem[] = [];
  const contacts = addressBookContacts.filter(contact => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      contact.name.toLowerCase().includes(query) || contact.address.toLowerCase().includes(query)
    );
  });

  if (searchQuery) {
    // Search mode: display filtered contact list
    contacts.forEach((contact, index) => {
      items.push({
        id: `item-${contact.id}`,
        type: 'contact',
        data: contact,
      });

      if (index < contacts.length - 1) {
        items.push({
          id: `divider-${contact.id}`,
          type: 'divider',
        });
      }
    });
  } else {
    // Normal mode: display grouped contacts
    const grouped = contacts.reduce((groups, contact) => {
      const firstLetter = contact.name.charAt(0).toUpperCase();
      if (!groups[firstLetter]) {
        groups[firstLetter] = [];
      }
      groups[firstLetter].push(contact);
      return groups;
    }, {} as GroupedContacts);

    const letters = Object.keys(grouped).sort();
    letters.forEach((letter, letterIndex) => {
      items.push({
        id: `header-${letter}`,
        type: 'header',
        title: letter,
      });

      grouped[letter].forEach((contact, contactIndex) => {
        items.push({
          id: `contact-${contact.id}`,
          type: 'contact',
          data: contact,
          isLast: contactIndex === grouped[letter].length - 1,
        });

        if (contactIndex < grouped[letter].length - 1) {
          items.push({
            id: `divider-contact-${contact.id}`,
            type: 'divider',
          });
        }
      });

      if (letterIndex < letters.length - 1) {
        items.push({
          id: `divider-letter-${letter}`,
          type: 'divider',
        });
      }
    });
  }

  return items;
};

/**
 * Generate combined search results across all tabs
 */
export const generateSearchAllTabsData = (
  searchQuery: string,
  walletAccounts: ExtendedWalletAccount[],
  recentContacts: WalletAccount[],
  addressBookContacts: WalletAccount[],
  t: (key: string, options?: any) => string
): ListItem[] => {
  if (!searchQuery) return [];

  const items: ListItem[] = [];

  // Check if the search query is a valid address and doesn't exist in current lists
  const addressValidation = validateSearchAddress(searchQuery);
  const isValidAddress = addressValidation.isValid;
  const addressExists =
    isValidAddress &&
    addressExistsInLists(searchQuery.trim(), walletAccounts, recentContacts, addressBookContacts);

  // Search in wallet accounts (My Accounts tab)
  const filteredAccounts = walletAccounts.filter(account => {
    const query = searchQuery.toLowerCase();
    return (
      account.name.toLowerCase().includes(query) || account.address.toLowerCase().includes(query)
    );
  });

  // Search in recent contacts
  const filteredRecent = recentContacts.filter(account => {
    const query = searchQuery.toLowerCase();
    return (
      account.name.toLowerCase().includes(query) || account.address.toLowerCase().includes(query)
    );
  });

  // Search in address book contacts
  const filteredContacts = addressBookContacts.filter(contact => {
    const query = searchQuery.toLowerCase();
    return (
      contact.name.toLowerCase().includes(query) || contact.address.toLowerCase().includes(query)
    );
  });

  // Add unknown address option if search query is valid address and doesn't exist
  if (isValidAddress && !addressExists) {
    items.push({
      id: 'unknown-address-option',
      type: 'unknown-address',
      address: searchQuery.trim(),
      title: `Send to ${searchQuery.trim()}`,
    });

    // Add divider if there are search results following
    if (filteredAccounts.length > 0 || filteredRecent.length > 0 || filteredContacts.length > 0) {
      items.push({
        id: 'unknown-address-divider',
        type: 'divider',
      });
    }
  }

  // Add My Accounts section if there are results
  if (filteredAccounts.length > 0) {
    items.push({
      id: 'header-accounts',
      type: 'header',
      title: t('sections.myAccounts'),
    });

    filteredAccounts.forEach((account, index) => {
      items.push({
        id: `search-account-${account.id}`,
        type: 'account',
        data: account,
      });

      if (index < filteredAccounts.length - 1) {
        items.push({
          id: `search-divider-account-${account.id}`,
          type: 'divider',
        });
      }
    });

    // Add section divider if there are more sections coming
    if (filteredRecent.length > 0 || filteredContacts.length > 0) {
      items.push({
        id: 'section-divider-accounts',
        type: 'divider',
      });
    }
  }

  // Add Recent section if there are results
  if (filteredRecent.length > 0) {
    items.push({
      id: 'header-recent',
      type: 'header',
      title: t('sections.recent'),
    });

    filteredRecent.forEach((account, index) => {
      items.push({
        id: `search-recent-${account.id}`,
        type: 'account',
        data: account,
      });

      if (index < filteredRecent.length - 1) {
        items.push({
          id: `search-divider-recent-${account.id}`,
          type: 'divider',
        });
      }
    });

    // Add section divider if there are contacts coming
    if (filteredContacts.length > 0) {
      items.push({
        id: 'section-divider-recent',
        type: 'divider',
      });
    }
  }

  // Add Address Book section if there are results
  if (filteredContacts.length > 0) {
    items.push({
      id: 'header-contacts',
      type: 'header',
      title: t('sections.addressBook'),
    });

    filteredContacts.forEach((contact, index) => {
      items.push({
        id: `search-contact-${contact.id}`,
        type: 'contact',
        data: contact,
      });

      if (index < filteredContacts.length - 1) {
        items.push({
          id: `search-divider-contact-${contact.id}`,
          type: 'divider',
        });
      }
    });
  }

  return items;
};

/**
 * Select appropriate list data based on search state and active tab
 */
export const selectListData = (
  searchQuery: string,
  activeTab: RecipientTabType,
  accountsListData: ListItem[],
  recentListData: ListItem[],
  contactsListData: ListItem[],
  searchAllTabsData: ListItem[]
): ListItem[] => {
  // If there's a search query, show combined results from all tabs
  if (searchQuery) {
    return searchAllTabsData;
  }

  // Otherwise, show tab-specific data
  switch (activeTab) {
    case 'accounts':
      return accountsListData;
    case 'recent':
      return recentListData;
    case 'contacts':
      return contactsListData;
    default:
      return [];
  }
};
