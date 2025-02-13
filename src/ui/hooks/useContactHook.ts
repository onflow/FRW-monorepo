import { isEmpty } from 'lodash';
import { useCallback } from 'react';

import { type Contact } from '@/shared/types/network-types';
import { type WalletAddress } from '@/shared/types/wallet-types';
import { withPrefix, isValidEthereumAddress } from '@/shared/utils/address';
import { useContactStore } from '@/ui/stores/contactStore';
import { useProfileStore } from '@/ui/stores/profileStore';
import { useWallet } from '@/ui/utils';

const DEFAULT_CONTACT: Contact = {
  address: '',
  id: 0,
  contact_name: '',
  avatar: '',
  domain: {
    domain_type: 999,
    value: '',
  },
};

export function useContactHook() {
  const usewallet = useWallet();
  const contactStore = useContactStore();
  const { mainAddress, evmAddress, walletList, evmWallet, childAccounts } = useProfileStore();

  const updateToContact = (contact: Partial<Contact> & { address: string }) => {
    contactStore.setToContact(
      contact.address === contactStore.toContact.address
        ? { ...contactStore.toContact, ...contact }
        : { ...DEFAULT_CONTACT, ...contact }
    );
  };

  const updateFromContact = (contact: Partial<Contact> & { address: string }) => {
    contactStore.setFromContact(
      contact.address === contactStore.fromContact.address
        ? { ...contactStore.fromContact, ...contact }
        : { ...DEFAULT_CONTACT, ...contact }
    );
  };

  const fetchAddressBook = useCallback(async () => {
    await usewallet.setDashIndex(0);
    try {
      const response = await usewallet.getAddressBook();
      let recent = await usewallet.getRecent();

      if (recent) {
        recent.forEach((c) => {
          if (response) {
            response.forEach((s) => {
              if (c.address === s.address && c.contact_name === s.contact_name) {
                c.type = 1;
              }
            });
          }
        });
      } else {
        recent = [];
      }

      let sortedContacts = [];
      if (response) {
        sortedContacts = response.sort((a, b) =>
          a.contact_name.toLowerCase().localeCompare(b.contact_name.toLowerCase())
        );
      }

      contactStore.setRecentContacts(recent);
      contactStore.setSortedContacts(sortedContacts);
      contactStore.setFilteredContacts(sortedContacts);

      return { recent, sortedContacts };
    } catch (err) {
      console.error('Error fetching address book:', err);
      return { recent: [], sortedContacts: [] };
    }
  }, [usewallet, contactStore]);

  const convertObjectToContactArray = (
    data: Record<
      string,
      {
        name: string;
        thumbnail: { url: string };
      }
    >
  ) => {
    return Object.keys(data).map((address, index) => ({
      id: index,
      contact_name: data[address].name || address,
      username: data[address].name.toLowerCase().replace(/\s+/g, ''),
      avatar: data[address].thumbnail.url,
      address: address,
      contact_type: 1,
      domain: {
        domain_type: 999,
        value: data[address].name,
      },
    }));
  };

  const convertArrayToContactArray = (array: any[]) => {
    return array.map((item) => ({
      id: item.id,
      contact_name: item.name,
      username: item.name,
      avatar: item.icon,
      address: withPrefix(item.address) || '',
      contact_type: 1,
      bgColor: item.color,
      domain: {
        domain_type: 0,
        value: '',
      },
    })) as Contact[];
  };

  const setupAccounts = useCallback(async () => {
    const wdArray = convertArrayToContactArray(walletList);
    if (childAccounts) {
      const cAccountArray = convertObjectToContactArray(childAccounts);
      contactStore.setChildAccounts(cAccountArray);
    }

    contactStore.setAccountList(wdArray);

    if (mainAddress && isValidEthereumAddress(evmAddress) && evmWallet) {
      const evmData = {
        ...evmWallet,
        address: evmAddress,
        avatar: evmWallet.icon,
        contact_name: evmWallet.name,
        bgcolor: evmWallet.color,
      };
      contactStore.setEvmAccounts([evmData]);
    }
  }, [walletList, childAccounts, mainAddress, evmAddress, evmWallet, contactStore]);

  const useContact = useCallback(
    (address: string): Contact | null => {
      return (
        contactStore.recentContacts.find((c) => c.address === address) ||
        contactStore.accountList.find((c) => c.address === address) ||
        contactStore.evmAccounts.find((c) => c.address === address) ||
        contactStore.childAccounts.find((c) => c.address === address) ||
        contactStore.filteredContacts.find((c) => c.address === address) ||
        null
      );
    },
    [contactStore]
  );

  const filterContacts = useCallback(
    (keyword: string) => {
      const filtered = contactStore.sortedContacts.filter((item) => {
        for (const key in item) {
          if (typeof item[key] === 'string') {
            if (item[key].includes(keyword)) return true;
          }
        }
        if (item.domain?.value.includes(keyword)) return true;
        return false;
      });

      contactStore.setFilteredContacts(filtered);
      contactStore.setHasNoFilteredContacts(isEmpty(filtered));

      return filtered;
    },
    [contactStore]
  );

  const searchUser = useCallback(
    async (searchKey: string) => {
      let result = await usewallet.openapi.searchUser(searchKey);
      result = result.data.users;
      const fArray = contactStore.searchContacts;
      const reg = /^((0x))/g;
      const lilicoResult = {
        address: '',
        contact_name: '',
        avatar: '',
        domain: {
          domain_type: 0,
          value: '',
        },
      } as Contact;

      if (result) {
        result.map((data) => {
          let address = data.address;
          if (!reg.test(data.address)) {
            address = '0x' + data.address;
          }
          lilicoResult['group'] = 'Flow Wallet user';
          lilicoResult.address = address;
          lilicoResult.contact_name = data.username;
          lilicoResult.domain!.domain_type = 999;
          lilicoResult.avatar = data.avatar;
          lilicoResult.type! = contactStore.sortedContacts.some(
            (e) => e.contact_name === data.username
          )
            ? 1
            : 4;
          fArray.push(lilicoResult);
        });
        contactStore.setSearchContacts(fArray);
      }
      return;
    },
    [usewallet, contactStore]
  );

  return {
    toContact: contactStore.toContact,
    fromContact: contactStore.fromContact,
    updateToContact,
    updateFromContact,
    fetchAddressBook,
    setupAccounts,
    useContact,
    filterContacts,
    searchUser,
  };
}
