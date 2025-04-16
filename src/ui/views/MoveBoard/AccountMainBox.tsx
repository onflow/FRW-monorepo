import { Typography, Box, CardMedia } from '@mui/material';
import { makeStyles } from '@mui/styles';
import React, { useCallback, useEffect, useState } from 'react';

import { type Contact } from '@/shared/types/network-types';
import { ensureEvmAddressPrefix } from '@/shared/utils/address';
import { useContacts } from '@/ui/hooks/useContactHook';
import { useProfiles } from '@/ui/hooks/useProfileHook';
import accountMove from 'ui/FRWAssets/svg/accountMove.svg';
import { FWMoveDropdown } from 'ui/FRWComponent';
import { useWallet } from 'ui/utils';
const USER_CONTACT = {
  contact_name: '',
  avatar: '',
};

function AccountMainBox({ isChild, setSelectedChildAccount, selectedAccount, isEvm = false }) {
  const usewallet = useWallet();
  const { childAccountsContacts, evmAccounts, mainAccountContact } = useContacts();
  const { mainAddress, evmAddress, evmWallet, currentWallet } = useProfiles();
  const [first, setFirst] = useState<string>('');
  const [userInfo, setUser] = useState<any>(USER_CONTACT);
  const [firstEmoji, setFirstEmoji] = useState<any>(null);
  const [childWallets, setChildWallets] = useState<Contact[]>([]);

  const requestAddress = useCallback(async () => {
    const address = await usewallet.getCurrentAddress();

    if (isChild) {
      // Merge wallet lists
      const walletList = [...childAccountsContacts, ...mainAccountContact, ...evmAccounts].filter(
        (account) => account.address !== currentWallet.address
      );
      const firstWallet = walletList[0];
      setChildWallets(walletList);

      const userContact = {
        avatar: currentWallet.icon,
        contact_name: currentWallet.name,
      };
      if (firstWallet) {
        setSelectedChildAccount(firstWallet);
      }
      setUser(userContact);
      setFirst(address!);
    } else {
      let eWallet = {};
      if (evmAddress) {
        eWallet = {
          [evmAddress!]: {
            name: evmWallet.name,
            description: evmWallet.name,
            thumbnail: {
              url: evmWallet.icon,
            },
          },
        };
      }

      const walletList = [...childAccountsContacts, ...evmAccounts];
      console.log('walletList', childAccountsContacts, evmAccounts);
      setChildWallets(walletList);
      const firstWallet = walletList[0];
      if (firstWallet) {
        setSelectedChildAccount(firstWallet);
      }
      setFirst(mainAddress!);
      setFirstEmoji(currentWallet);
    }
  }, [
    usewallet,
    isChild,
    setSelectedChildAccount,
    mainAddress,
    evmAddress,
    currentWallet,
    evmWallet,
    childAccountsContacts,
    evmAccounts,
    mainAccountContact,
  ]);

  useEffect(() => {
    requestAddress();
  }, [requestAddress]);

  return (
    <Box sx={{ padding: '0 18px' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Box
          sx={{
            padding: '16px 12px',
            height: '106px',
            flex: '1',
            backgroundColor: '#2C2C2C',
            borderRadius: '12px',
            flexDirection: 'column',
            display: 'flex',
            gap: '5px',
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box
              sx={{
                display: 'flex',
                height: '32px',
                width: '32px',
                borderRadius: '32px',
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: firstEmoji ? firstEmoji['bgcolor'] : 'none',
                marginRight: '4px',
              }}
            >
              {firstEmoji ? (
                <Typography sx={{ fontSize: '32px', fontWeight: '400' }}>
                  {firstEmoji.icon}
                </Typography>
              ) : (
                <CardMedia
                  sx={{
                    margin: '0 auto',
                    width: '20px',
                    height: '20px',
                    borderRadius: '20px',
                    display: 'block',
                  }}
                  image={userInfo.avatar}
                />
              )}
            </Box>
          </Box>
          <Typography sx={{ fontSize: '14px', fontWeight: '600' }}>
            {firstEmoji ? firstEmoji.name : userInfo.contact_name}
          </Typography>

          <Typography
            sx={{
              color: '#FFFFFFCC',
              lineHeight: '1',
              textAlign: 'start',
              fontSize: '12px',
              fontWeight: '400',
            }}
          >
            {first}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', mx: '8px' }}>
          <CardMedia sx={{ width: '24px', height: '24px' }} image={accountMove} />
        </Box>
        <Box
          sx={{
            padding: '16px 12px',
            height: '106px',
            flex: '1',
            backgroundColor: '#2C2C2C',
            borderRadius: '12px',
          }}
        >
          {selectedAccount && (
            <FWMoveDropdown
              contacts={childWallets}
              setSelectedChildAccount={setSelectedChildAccount}
            />
          )}
        </Box>
      </Box>
      <Box sx={{ padding: '8px 0' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Typography sx={{ fontSize: '12px', fontWeight: '600' }}>Move Fee</Typography>
          <Typography sx={{ fontSize: '12px', fontWeight: '600' }}>0.001 FLOW</Typography>
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Typography
            sx={{ fontSize: '12px', fontWeight: '400', color: 'rgba(255, 255, 255, 0.60)' }}
          >
            It appears when moving between VM accounts
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}

export default AccountMainBox;
