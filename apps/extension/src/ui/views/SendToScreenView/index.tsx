import { SendToScreen } from '@onflow/frw-screens';
import { type RecipientData } from '@onflow/frw-ui';
import React, { useCallback } from 'react';
import { useNavigate, useParams } from 'react-router';

import { type Contact } from '@/shared/types';
import { LLHeader } from '@/ui/components/LLHeader';
import { useWallet } from '@/ui/hooks/use-wallet';
import { useContacts } from '@/ui/hooks/useContactHook';
import { useProfiles } from '@/ui/hooks/useProfileHook';

const SendToScreenView = () => {
  const navigate = useNavigate();
  const params = useParams();
  const wallet = useWallet();
  const {
    recentContacts,
    addressBookContacts,
    cadenceAccounts,
    evmAccounts,
    childAccountsContacts,
  } = useContacts();
  const { childAccounts, currentWallet, userInfo, evmAddress } = useProfiles();

  // Get token ID from URL params or default to 'flow'
  const tokenId = params.id || 'flow';

  // Convert extension contacts to RecipientData format
  const convertContactToRecipient = useCallback((contact: Contact): RecipientData => {
    try {
      // Handle different contact structures (regular contacts vs EVM contacts)
      const isEvmContact = contact.chain !== undefined || !contact.contact_type;

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
        name: contact.contact_name || contact.name || contact.username || 'Contact',
        address: contact.address,
        type: recipientType,
        balance: recipientType === 'account' ? '0 FLOW' : undefined,
        showBalance: recipientType === 'account',
        avatar: contact.avatar || contact.icon,
      };
    } catch (error) {
      console.error('Error converting contact:', contact, error);
      // Return a fallback recipient
      return {
        id: contact.address || 'unknown',
        name: contact.contact_name || contact.name || 'Unknown Contact',
        address: contact.address || '',
        type: 'contact',
        balance: undefined,
        showBalance: false,
        avatar: contact.avatar || contact.icon,
      };
    }
  }, []);

  // Data loading functions for the SendToScreen
  const loadAccountsData = useCallback(async (): Promise<RecipientData[]> => {
    const recipientsData: RecipientData[] = [];

    // Add cadence accounts (main wallet accounts)
    if (cadenceAccounts?.length > 0) {
      cadenceAccounts.forEach((account) => {
        recipientsData.push(convertContactToRecipient(account));
      });
    }

    // Add EVM accounts
    if (evmAccounts?.length > 0) {
      evmAccounts.forEach((account) => {
        recipientsData.push(convertContactToRecipient(account));
      });
    }

    // Add child accounts
    if (childAccountsContacts?.length > 0) {
      childAccountsContacts.forEach((account) => {
        recipientsData.push(convertContactToRecipient(account));
      });
    }

    return recipientsData;
  }, [cadenceAccounts, evmAccounts, childAccountsContacts, convertContactToRecipient]);

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
      <LLHeader title={chrome.i18n.getMessage('Send_to')} help={true} />
      <div style={{ flex: 1, overflow: 'hidden' }}>
        <SendToScreen {...screenProps} />
      </div>
    </div>
  );
};

export default SendToScreenView;
