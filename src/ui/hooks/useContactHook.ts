import { isEmpty } from 'lodash';
import { useCallback, useState } from 'react';

import { type Contact } from '@/shared/types/network-types';
import { withPrefix, isValidEthereumAddress } from '@/shared/utils/address';
import { useProfiles } from '@/ui/hooks/useProfileHook';
import { useContactStore } from '@/ui/stores/contactStore';
import { useWallet } from '@/ui/utils';

export function useContacts() {
  const usewallet = useWallet();
  const {
    mainAddress,
    evmAddress,
    walletList,
    evmWallet,
    childAccounts: childAccountsProfile,
  } = useProfiles();

  // Individual selectors for actions
  const setRecentContacts = useContactStore((state) => state.setRecentContacts);
  const setSortedContacts = useContactStore((state) => state.setSortedContacts);
  const setChildAccounts = useContactStore((state) => state.setChildAccounts);
  const setAccountList = useContactStore((state) => state.setAccountList);
  const setEvmAccounts = useContactStore((state) => state.setEvmAccounts);
  const setSearchContacts = useContactStore((state) => state.setSearchContacts);

  // Individual selectors for state values
  const sortedContacts = useContactStore((state) => state.sortedContacts);
  const recentContacts = useContactStore((state) => state.recentContacts);
  const searchContacts = useContactStore((state) => state.searchContacts);
  const accountList = useContactStore((state) => state.accountList);
  const evmAccounts = useContactStore((state) => state.evmAccounts);
  const childAccounts = useContactStore((state) => state.childAccounts);

  const [filteredContacts, setFilteredContacts] = useState<Contact[]>([]);
  const [hasNoFilteredContacts, setHasNoFilteredContacts] = useState(false);

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

      setRecentContacts(recent);
      setSortedContacts(sortedContacts);
      setFilteredContacts(sortedContacts);

      return { recent, sortedContacts };
    } catch (err) {
      console.error('Error fetching address book:', err);
      return { recent: [], sortedContacts: [] };
    }
  }, [usewallet, setFilteredContacts, setRecentContacts, setSortedContacts]);

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
      const cAccountArray = convertObjectToContactArray(childAccountsProfile);
      setChildAccounts(cAccountArray);
    }

    setAccountList(wdArray);

    if (mainAddress && isValidEthereumAddress(evmAddress) && evmWallet) {
      const evmData = {
        ...evmWallet,
        address: evmAddress,
        avatar: evmWallet.icon,
        contact_name: evmWallet.name,
        bgcolor: evmWallet.color,
      };
      setEvmAccounts([evmData]);
    }
  }, [
    walletList,
    childAccountsProfile,
    setAccountList,
    setChildAccounts,
    setEvmAccounts,
    childAccounts,
    evmAddress,
    evmWallet,
    mainAddress,
  ]);

  const useContact = useCallback(
    (address: string): Contact | null => {
      return (
        accountList.find((c) => c.address === address) ||
        evmAccounts.find((c) => c.address === address) ||
        childAccounts.find((c) => c.address === address) ||
        filteredContacts.find((c) => c.address === address) ||
        recentContacts.find((c) => c.address === address) ||
        null
      );
    },
    [accountList, childAccounts, evmAccounts, filteredContacts, recentContacts]
  );

  const filterContacts = useCallback(
    (keyword: string) => {
      const filtered = sortedContacts.filter((item) => {
        for (const key in item) {
          if (typeof item[key] === 'string') {
            if (item[key].includes(keyword)) return true;
          }
        }
        if (item.domain?.value.includes(keyword)) return true;
        return false;
      });

      setFilteredContacts(filtered);
      setHasNoFilteredContacts(isEmpty(filtered));

      return filtered;
    },
    [sortedContacts]
  );

  const searchUser = useCallback(
    async (searchKey: string) => {
      let result = await usewallet.openapi.searchUser(searchKey);
      result = result.data.users;
      const fArray = searchContacts;
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
          lilicoResult.type! = sortedContacts.some((e) => e.contact_name === data.username) ? 1 : 4;
          fArray.push(lilicoResult);
        });
        setSearchContacts(fArray);
      }
      return;
    },
    [usewallet, searchContacts, setSearchContacts, sortedContacts]
  );

  return {
    fetchAddressBook,
    setupAccounts,
    useContact,
    filterContacts,
    searchUser,
    sortedContacts,
    recentContacts,
    filteredContacts,
    searchContacts,
    hasNoFilteredContacts,
    accountList,
    evmAccounts,
    childAccounts,
  };
}
