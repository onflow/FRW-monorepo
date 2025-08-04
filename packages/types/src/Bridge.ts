// Bridge-related types for native module communication

export interface Contact {
  id: string;
  name: string;
  address: string;
  avatar?: string;
  username?: string;
  contactName?: string;
}

export interface AddressBookContact {
  id: string;
  name: string;
  address: string;
  avatar?: string;
  username?: string;
  contactName?: string;
}

export interface WalletAccount {
  id: string;
  name: string;
  address: string;
  emoji: string;
  avatar?: string;
  isActive: boolean;
  type?: 'main' | 'child' | 'evm';
}

export interface RecentContactsResponse {
  contacts: Contact[];
}

export interface WalletAccountsResponse {
  accounts: WalletAccount[];
}

export interface AddressBookResponse {
  contacts: AddressBookContact[];
}
