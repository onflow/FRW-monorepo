import { create } from 'zustand';

import { type Contact } from '@/shared/types/network-types';

interface ContactStore {
  // Contact Lists
  searchContacts: Contact[];
  // I think this is the same as filteredContacts still checking why we have two here.
  sortedContacts: Contact[];
  recentContacts: Contact[];

  // States
  isSearched: boolean;

  // Actions
  setSearchContacts: (contacts: Contact[]) => void;
  setSortedContacts: (contacts: Contact[]) => void;
  setRecentContacts: (contacts: Contact[]) => void;
  setIsSearched: (searched: boolean) => void;

  // Reset
  resetContactLists: () => void;

  // Account Lists
  accountList: Contact[];
  evmAccounts: Contact[];
  childAccounts: Contact[];

  // Account Actions
  setAccountList: (accounts: Contact[]) => void;
  setEvmAccounts: (accounts: Contact[]) => void;
  setChildAccounts: (accounts: Contact[]) => void;
}

export const useContactStore = create<ContactStore>((set) => ({
  // Address Book Initial states
  searchContacts: [],
  sortedContacts: [],
  recentContacts: [],
  isSearched: false,
  setSearchContacts: (contacts) => set({ searchContacts: contacts }),
  setSortedContacts: (contacts) => set({ sortedContacts: contacts }),
  setRecentContacts: (contacts) => set({ recentContacts: contacts }),
  setIsSearched: (searched) => set({ isSearched: searched }),

  // Account Lists Initial State
  accountList: [],
  evmAccounts: [],
  childAccounts: [],

  // Account Setters
  setAccountList: (accounts) => set({ accountList: accounts }),
  setEvmAccounts: (accounts) => set({ evmAccounts: accounts }),
  setChildAccounts: (accounts) => set({ childAccounts: accounts }),

  // Reset all lists
  resetContactLists: () =>
    set({
      searchContacts: [],
      sortedContacts: [],
      recentContacts: [],
      accountList: [],
      evmAccounts: [],
      childAccounts: [],
      isSearched: false,
    }),
}));
