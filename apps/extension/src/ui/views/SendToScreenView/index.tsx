import { SendToScreen } from '@onflow/frw-screens';
import { useSendStore } from '@onflow/frw-stores';
import { type RecipientData } from '@onflow/frw-ui';
import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router';

import { getCachedData, accountBalanceKey } from '@/data-model';
import { type Contact } from '@/shared/types';
import { isValidEthereumAddress } from '@/shared/utils';
import { LLHeader } from '@/ui/components/LLHeader';
import { useWallet } from '@/ui/hooks/use-wallet';
import { useContacts } from '@/ui/hooks/useContactHook';
import { useNetwork } from '@/ui/hooks/useNetworkHook';
import { useProfiles } from '@/ui/hooks/useProfileHook';

const SendToScreenView = () => {
  const navigate = useNavigate();
  const params = useParams();
  const wallet = useWallet();

  const [accountBalances, setAccountBalances] = useState<Record<string, string>>({});
  const {
    recentContacts,
    addressBookContacts,
    cadenceAccounts,
    evmAccounts,
    childAccountsContacts,
  } = useContacts();
  const {
    childAccounts,
    currentWallet,
    userInfo,
    evmAddress,
    walletList,
    evmWallet,
    currentBalance,
    mainAddress,
  } = useProfiles();
  const { network } = useNetwork();

  const { selectedToken } = useSendStore();

  // Get token ID from URL params, selected token, or default to 'flow'
  const tokenId = params.id || selectedToken?.symbol?.toLowerCase() || 'flow';

  // If accessed from select-tokens flow, check for selected token
  useEffect(() => {
    if (window.location.pathname === '/dashboard/sendtoscreen' && !selectedToken) {
      // Redirect back to token selection if accessed via select-tokens flow but no token selected
      navigate('/dashboard/select-tokens');
    }
  }, [selectedToken, navigate]);

  // Load balances when accounts become available
  useEffect(() => {
    const loadBalances = async () => {
      const newBalances: Record<string, string> = {};

      // Load balances for wallet accounts
      if (walletList?.length > 0) {
        for (const account of walletList) {
          try {
            const balanceKey = accountBalanceKey(network, account.address);
            const balance = (await getCachedData(balanceKey)) as string;
            if (balance !== undefined) {
              const formattedBalance = formatBalance(balance);
              newBalances[account.address] = formattedBalance || '0 FLOW';
            } else {
              newBalances[account.address] = 'Loading...';
            }
          } catch (error) {
            console.error('Error loading balance for', account.address, error);
            newBalances[account.address] = 'Error';
          }
        }
      }

      // Load balance for EVM account
      if (evmWallet?.address) {
        try {
          const balanceKey = accountBalanceKey(network, evmWallet.address);
          const balance = (await getCachedData(balanceKey)) as string;
          if (balance !== undefined) {
            const formattedBalance = formatBalance(balance);
            newBalances[evmWallet.address] = formattedBalance || '0 FLOW';
          } else {
            newBalances[evmWallet.address] = 'Loading...';
          }
        } catch (error) {
          console.error('Error loading EVM balance', error);
          newBalances[evmWallet.address] = 'Error';
        }
      }

      // Load balances for child accounts
      if (childAccounts && childAccounts.length > 0) {
        for (const account of childAccounts) {
          try {
            const balanceKey = accountBalanceKey(network, account.address);
            const balance = (await getCachedData(balanceKey)) as string;
            if (balance !== undefined) {
              const formattedBalance = formatBalance(balance);
              newBalances[account.address] = formattedBalance || '0 FLOW';
            } else {
              newBalances[account.address] = 'Loading...';
            }
          } catch (error) {
            console.error('Error loading child balance for', account.address, error);
            newBalances[account.address] = 'Error';
          }
        }
      }

      setAccountBalances(newBalances);
    };

    loadBalances();
  }, [walletList, evmWallet, childAccounts, network]);

  // Convert extension contacts to RecipientData format
  const convertContactToRecipient = useCallback((contact: Contact): RecipientData => {
    try {
      // Handle different contact structures (regular contacts vs EVM contacts)
      const isEvmContact = isValidEthereumAddress(contact.address);

      // Map contact types to RecipientItem accepted types
      let recipientType: 'account' | 'contact' | 'recent' | 'unknown';
      if (contact.contact_type) {
        const contactTypeString = contact.contact_type.toString();
        if (contactTypeString === 'account' || contactTypeString === '1') {
          recipientType = 'account';
        } else {
          recipientType = 'contact';
        }
      } else if (isEvmContact) {
        // EVM contacts should be treated as accounts
        recipientType = 'account';
      } else {
        recipientType = 'contact';
      }

      // Generate unique ID to avoid collisions between different account types
      const uniqueId = isEvmContact
        ? `evm-${contact.id || contact.address}`
        : contact.id?.toString() || contact.address;

      return {
        id: uniqueId,
        name: contact.contact_name || contact.username || 'Contact',
        address: contact.address,
        type: recipientType,
        balance: recipientType === 'account' ? '0 FLOW' : undefined,
        showBalance: recipientType === 'account',
        avatar: contact.avatar,
      };
    } catch (error) {
      console.error('Error converting contact:', contact, error);
      return {
        id: contact.address || 'unknown',
        name: contact.contact_name || 'Unknown Contact',
        address: contact.address || '',
        type: 'contact',
        balance: undefined,
        showBalance: false,
        avatar: contact.avatar,
      };
    }
  }, []);

  // Helper to format balance for display
  const formatBalance = useCallback((bal?: string) => {
    if (!bal) return undefined;
    if (bal === '0') return '0 FLOW';
    const numBalance = parseFloat(bal);
    if (numBalance < 0.01) return '< 0.01 FLOW';
    return `${numBalance.toFixed(2)} FLOW`;
  }, []);

  const convertToRecipient = useCallback(
    (account: any, accountType: string, balance?: string): RecipientData => {
      console.log(currentWallet, 'currentWallet');
      let isLinked = false;
      let isEVM = false;
      let parentAvatar = null;
      if (accountType === 'evm') {
        isEVM = true;
      }
      if (accountType === 'child') {
        isLinked = true;
        parentAvatar = currentWallet ? currentWallet.icon : null;
      }
      const getAccountName = () => {
        if (account.name) return account.name;
        if (account.contact_name) return account.contact_name;

        switch (accountType) {
          case 'main':
            return 'Main Account';
          case 'evm':
            return 'EVM Account';
          case 'child':
            return 'Child Account';
          default:
            return `${accountType.toUpperCase()} Account`;
        }
      };

      const getAccountAvatar = () => {
        if (account.icon) return account.icon;
        if (account.avatar) return account.avatar;
      };

      const getAccountEmoji = () => {
        return {
          emoji: account.icon,
          name: getAccountName(),
          color: account.color,
        };
      };

      return {
        id: `${accountType}-${account.address}`,
        name: getAccountName(),
        address: account.address,
        type: accountType,
        balance: balance === '...' ? '...' : balance,
        isLoading: balance === '...',
        showBalance: true,
        avatar: getAccountAvatar(),
        parentAddress: mainAddress,
        showEditButton: false,
        showCopyButton: true,
        emojiInfo: getAccountEmoji(),
        parentAvatar,
        isLinked,
        isEVM,
      };
    },
    [formatBalance, walletList]
  );

  // Convert wallet account to RecipientData (balance will be passed in)
  const convertWalletToRecipient = useCallback(
    (account: any, accountType: string, balance?: string): any => {
      let isLinked = false;

      let isEVM = false;
      if (accountType === 'evm') {
        isEVM = true;
      }
      if (accountType === 'child') {
        isLinked = true;
      }
      const getAccountName = () => {
        if (account.name) return account.name;
        if (account.contact_name) return account.contact_name;

        switch (accountType) {
          case 'main':
            return 'Main Account';
          case 'evm':
            return 'EVM Account';
          case 'child':
            return 'Child Account';
          default:
            return `${accountType.toUpperCase()} Account`;
        }
      };

      const getAccountAvatar = () => {
        if (account.icon) return account.icon;
        if (account.avatar) return account.avatar;
      };

      const getAccountEmoji = () => {
        if (account.icon) return account.icon;
        if (account.avatar) return account.avatar;
        return {
          emoji: account.icon,
          name: getAccountName(),
          color: account.color,
        };
      };
      return {
        id: `${accountType}-${account.address}`,
        name: getAccountName(),
        address: account.address,
        type: 'account' as const,
        balance: balance === '...' ? '...' : balance,
        isLoading: balance === '...',
        showBalance: true,
        avatar: getAccountAvatar(),
        showEditButton: false,
        showCopyButton: true,
        emojiInfo: getAccountEmoji(),
        parentEmoji: null,
        isLinked,
        isEVM,
      };
    },
    [formatBalance]
  );

  // Data loading functions for the SendToScreen
  const loadAccountsData = useCallback(async (): Promise<RecipientData[]> => {
    const recipientsData: RecipientData[] = [];

    try {
      // Add main wallet accounts with loaded balances
      if (walletList?.length > 0) {
        walletList.forEach((account) => {
          const balance = accountBalances[account.address] || '...';
          recipientsData.push(convertToRecipient(account, 'main', balance));
        });
      }

      // Add EVM account if available with loaded balance
      if (evmWallet && evmWallet.address) {
        const balance = accountBalances[evmWallet.address] || '...';
        recipientsData.push(convertToRecipient(evmWallet, 'evm', balance));
      }

      // Add child accounts with loaded balances
      if (childAccounts && childAccounts.length > 0) {
        childAccounts.forEach((account) => {
          const balance = accountBalances[account.address] || '...';
          recipientsData.push(convertToRecipient(account, 'child', balance));
        });
      }

      console.log('Generated recipients data:', recipientsData.length, recipientsData); // Debug

      // Fallback: Add cadence, EVM, and child accounts from contacts if wallet data is not available
      // if (recipientsData.length === 0) {
      //   if (cadenceAccounts?.length > 0) {
      //     cadenceAccounts.forEach((account) => {
      //       recipientsData.push(convertContactToRecipient(account));
      //     });
      //   }

      //   if (evmAccounts?.length > 0) {
      //     evmAccounts.forEach((account) => {
      //       recipientsData.push(convertContactToRecipient(account));
      //     });
      //   }

      //   if (childAccountsContacts?.length > 0) {
      //     childAccountsContacts.forEach((account) => {
      //       recipientsData.push(convertContactToRecipient(account));
      //     });
      //   }
      // }
    } catch (error) {
      console.error('Error loading accounts data:', error);
    }

    return recipientsData;
  }, [
    walletList,
    evmWallet,
    childAccounts,
    cadenceAccounts,
    evmAccounts,
    childAccountsContacts,
    convertWalletToRecipient,
    convertContactToRecipient,
    accountBalances,
  ]);

  const loadRecentData = useCallback(async (): Promise<RecipientData[]> => {
    if (recentContacts) {
      return recentContacts.map(convertContactToRecipient);
    }
    return [];
  }, [recentContacts, convertContactToRecipient]);

  const loadContactsData = useCallback(async (): Promise<RecipientData[]> => {
    if (addressBookContacts) {
      return addressBookContacts.map(convertContactToRecipient);
    }
    return [];
  }, [addressBookContacts, convertContactToRecipient]);

  // Create the platform bridge interface
  const bridge = {
    getSelectedAddress: () => currentWallet?.address || '',
    getNetwork: () => 'mainnet', // Default network
  };

  // Create the navigation interface
  const navigation = {
    navigate: useCallback(
      (screen: string, screenParams?: Record<string, unknown>) => {
        // Handle navigation based on screen name
        if (screen === 'SendTokens') {
          const address = screenParams?.address;
          if (address) {
            navigate(`/dashboard/token/${tokenId}/send-tokens/${address}`);
          }
        }
      },
      [navigate, tokenId]
    ),
  };

  // Translation function using chrome i18n
  const t = useCallback((key: string) => {
    // Map screen translation keys to chrome i18n keys
    const keyMap: Record<string, string> = {
      'send.myAccounts': 'Accounts',
      'send.recent': 'Recent',
      'send.addressBook': 'AddressBook',
      'send.sendTo': 'Send_to',
      'send.searchPlaceholder': 'Search__PlaceHolder',
      'send.noAccounts.message': 'No_accounts_found',
    };

    const chromeKey = keyMap[key] || key;
    return chrome.i18n.getMessage(chromeKey) || key;
  }, []);

  const screenProps = {
    navigation,
    bridge,
    t,
    loadAccountsData,
    loadRecentData,
    loadContactsData,
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
      }}
    >
      <LLHeader
        title={
          selectedToken
            ? `Send ${selectedToken.name || selectedToken.symbol}`
            : chrome.i18n.getMessage('Send_to')
        }
        help={true}
      />
      <div style={{ flex: 1, overflow: 'hidden' }}>
        <SendToScreen {...screenProps} />
      </div>
    </div>
  );
};

export default SendToScreenView;
