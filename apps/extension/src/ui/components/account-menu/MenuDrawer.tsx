import {
  Box,
  CircularProgress,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  Typography,
} from '@mui/material';
import { logger } from '@onflow/frw-context';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router';

import { MAX_MAIN_ACCOUNTS_PER_PROFILE } from '@/shared/constant';
import { type UserInfoResponse, type MainAccount, type WalletAccount } from '@/shared/types';
import { consoleError, hasReachedFlowAddressLimit } from '@/shared/utils';
import lock from '@/ui/assets/svg/sidebar-lock.svg';
import plus from '@/ui/assets/svg/sidebar-plus.svg';
import { AccountListing } from '@/ui/components/account/account-listing';
import ErrorModel from '@/ui/components/PopupModal/errorModel';
import { ProfileItemBase } from '@/ui/components/profile/profile-item-base';
import { MenuItem } from '@/ui/components/sidebar/menu-item';
import { useCurrentId, usePendingAccountCreationTransactions } from '@/ui/hooks/use-account-hooks';
import { useFeatureFlag } from '@/ui/hooks/use-feature-flags';
import { useWallet } from '@/ui/hooks/use-wallet';
import { COLOR_WHITE_ALPHA_10_FFFFFF1A, COLOR_WHITE_ALPHA_40_FFFFFF66 } from '@/ui/style/color';

import AddAccountPopup from './AddAccountPopup';

interface MenuDrawerProps {
  drawer: boolean;
  toggleDrawer: () => void;
  userInfo?: UserInfoResponse;
  togglePop: () => void;
  walletList: MainAccount[];
  activeAccount: WalletAccount;
  activeParentAccount: MainAccount;
  network: string;
  modeOn: boolean;
  mainAddressLoading: boolean;
  noAddress?: boolean;
}

const MenuDrawer = ({
  userInfo,
  drawer,
  toggleDrawer,
  togglePop,
  activeAccount,
  activeParentAccount,
  walletList,
  network,
  mainAddressLoading,
  noAddress,
}: MenuDrawerProps) => {
  const MAX_EOA_ADDRESSES_PER_PROFILE = 5;
  const wallet = useWallet();
  const navigate = useNavigate();
  const scrollRef = useRef<HTMLDivElement>(null);
  // Add Account Drawer
  const [showAddAccount, setShowAddAccount] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isCreatingEoa, setIsCreatingEoa] = useState(false);
  const canCreateNewAccount = useFeatureFlag('create_new_account');
  const canAddMoreAccounts = !hasReachedFlowAddressLimit(walletList, MAX_MAIN_ACCOUNTS_PER_PROFILE);
  const currentId = useCurrentId();
  const pendingAccountTransactions = usePendingAccountCreationTransactions(network, currentId);
  const hasPendingCreation = (pendingAccountTransactions?.length ?? 0) > 0;
  const eoaAddressCount = React.useMemo(() => {
    if (!walletList || walletList.length === 0) {
      return 0;
    }
    const addressSet = new Set<string>();
    for (const account of walletList) {
      const eoas =
        Array.isArray(account.eoaAccounts) && account.eoaAccounts.length > 0
          ? account.eoaAccounts
          : account.eoaAccount
            ? [account.eoaAccount]
            : [];
      for (const eoa of eoas) {
        if (eoa?.address) {
          addressSet.add(eoa.address.toLowerCase());
        }
      }
    }
    return addressSet.size;
  }, [walletList]);
  const hasReachedEoaLimit = eoaAddressCount >= MAX_EOA_ADDRESSES_PER_PROFILE;
  const canOpenAddAccountPopup = canCreateNewAccount && (canAddMoreAccounts || !hasReachedEoaLimit);
  const prevHasPendingCreationRef = useRef(hasPendingCreation);
  // TODO: Uncomment this when we have the import existing account feature flag
  const canImportExistingAccount = false; // useFeatureFlag('import_existing_account');

  // Error state
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const scrollSidebarToBottom = useCallback((behavior: ScrollBehavior = 'smooth') => {
    if (!scrollRef.current) {
      return;
    }
    scrollRef.current.scrollTo({
      top: scrollRef.current.scrollHeight + 60,
      behavior,
    });
  }, []);

  const setActiveAccount = useCallback(
    (currentAccount: WalletAccount, parentAccount?: WalletAccount) => {
      wallet
        .setActiveAccount(currentAccount.address, parentAccount?.address || currentAccount.address)
        .then(() => {
          toggleDrawer();
          navigate('/dashboard');
        });
    },
    [wallet, toggleDrawer]
  );

  const addAccount = async () => {
    if (hasPendingCreation) {
      return;
    }
    try {
      toggleAddAccount();

      await wallet.createNewAccount(network);
    } catch (error) {
      consoleError('Failed to create account:', error);
      setErrorMessage(error.message || 'Failed to create account. Please try again.');
      setShowError(true);
    }
  };

  const addEoaAccount = async () => {
    if (isCreatingEoa) {
      logger.warn('[extension-ui] addEoaAccount ignored: already creating');
      return;
    }
    setIsCreatingEoa(true);
    try {
      logger.warn('[extension-ui] addEoaAccount clicked: calling wallet.addNewEOAAddress');
      setShowAddAccount(false);
      const created = await wallet.addNewEOAAddress();
      logger.warn('[extension-ui] addEoaAccount success', created);
    } catch (error) {
      consoleError('Failed to create EOA address:', error);
      setErrorMessage(error.message || 'Failed to create EOA address. Please try again.');
      setShowError(true);
    } finally {
      setIsCreatingEoa(false);
    }
  };

  const toggleAddAccount = () => {
    setShowAddAccount((prevShowAddAccount) => !prevShowAddAccount);
  };
  const handleEnableEvmClick = useCallback(
    (parentAddress: string) => {
      navigate(`/dashboard/enable?parentAddress=${parentAddress}`);
      toggleDrawer();
    },
    [navigate, toggleDrawer]
  );

  const handleMigrationClick = useCallback(
    (address: string) => {
      navigate(`/dashboard/setting/migration?address=${address}`);
      toggleDrawer();
    },
    [navigate, toggleDrawer]
  );

  useEffect(() => {
    const hadPendingCreation = prevHasPendingCreationRef.current;
    prevHasPendingCreationRef.current = hasPendingCreation;

    // Scroll only when pending creation first appears.
    if (!drawer || !hasPendingCreation || hadPendingCreation) {
      return;
    }
    // Ensure pending card has been rendered before scrolling.
    const timer = setTimeout(() => scrollSidebarToBottom('smooth'), 120);
    return () => clearTimeout(timer);
  }, [drawer, hasPendingCreation, scrollSidebarToBottom]);

  return (
    <Drawer
      open={drawer}
      onClose={toggleDrawer}
      sx={{ zIndex: '1400 !important' }}
      PaperProps={{ sx: { width: '75%', maxWidth: '400px', background: '#0A0A0B' } }}
    >
      <List
        sx={{
          backgroundColor: '#0A0A0B',
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
        }}
      >
        <Box sx={{ padding: '0px 0px 24px 0px' }}>
          <Box
            sx={{
              display: 'flex',
              padding: '0 0 12px',
              borderBottom: '1px solid rgba(255, 255, 255, 0.25)',
              justifyContent: 'space-between',
            }}
          >
            <ProfileItemBase
              profileId={userInfo?.id}
              selectedProfileId={userInfo?.id}
              onClick={(_profileId: string) => togglePop()}
              setLoadingId={() => {}}
              userInfo={userInfo}
              activeProfileVariant={true}
            />
          </Box>
        </Box>
        <Box
          ref={scrollRef}
          sx={{
            overflowY: 'auto',
            maxHeight: 'calc(100vh - 200px)',
            '&::-webkit-scrollbar': {
              width: '4px',
            },
            '&::-webkit-scrollbar-track': {
              background: 'transparent',
            },
            '&::-webkit-scrollbar-thumb': {
              background: 'rgba(255, 255, 255, 0.1)',
              borderRadius: '4px',
            },
          }}
        >
          <AccountListing
            network={network}
            accountList={walletList}
            activeAccount={activeAccount}
            activeParentAccount={activeParentAccount}
            onAccountClick={setActiveAccount}
            onEnableEvmClick={handleEnableEvmClick}
            onMigrationClick={handleMigrationClick}
            showActiveAccount={true}
            isCreatingEoaAddress={isCreatingEoa}
          />
        </Box>
        <Box sx={{ padding: '0 16px', flex: 1 }}></Box>
        <Box
          sx={{
            justifyContent: 'space-between',
            alignItems: 'center',
            flexDirection: 'column',
            display: 'flex',
            px: '0',
            marginTop: '24px',
            marginBottom: '8px',
            borderTop: `1px solid ${COLOR_WHITE_ALPHA_40_FFFFFF66}`,
            paddingTop: '8px',
          }}
        >
          {canOpenAddAccountPopup &&
            (isCreating ? (
              <ListItem disablePadding>
                <ListItemButton sx={{ padding: '8px 16px', margin: '0', borderRadius: '0' }}>
                  <ListItemIcon
                    sx={{
                      width: '40px',
                      minWidth: '40px',
                      height: '40px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginRight: '16px',
                      borderRadius: '40px',
                      backgroundColor: COLOR_WHITE_ALPHA_10_FFFFFF1A,
                    }}
                  >
                    <CircularProgress size={24} />
                  </ListItemIcon>
                  <Typography
                    variant="body1"
                    component="div"
                    display="inline"
                    sx={{ fontSize: '16px', color: '#FFFFFFCC', opacity: 0.7 }}
                  >
                    Creating...
                  </Typography>
                </ListItemButton>
              </ListItem>
            ) : (
              <MenuItem
                icon={plus}
                text={chrome.i18n.getMessage('Add_Account_Sidebar')}
                dataTestId="add-account-button"
                onClick={toggleAddAccount}
                disabled={hasPendingCreation}
              />
            ))}
          <MenuItem
            icon={lock}
            text={chrome.i18n.getMessage('Lock__Wallet')}
            onClick={() => {
              wallet.lockWallet().then(() => {
                navigate('/unlock');
              });
            }}
          />
          {showAddAccount && (
            <AddAccountPopup
              isConfirmationOpen={showAddAccount}
              handleCloseIconClicked={() => setShowAddAccount(false)}
              handleCancelBtnClicked={() => setShowAddAccount(false)}
              handleAddBtnClicked={() => {
                setShowAddAccount(false);
              }}
              addAccount={addAccount}
              addEoaAddress={addEoaAccount}
              importExistingAccount={canImportExistingAccount}
              disableCreateAccount={hasPendingCreation || !canAddMoreAccounts}
              disableAddEoaAddress={isCreatingEoa || hasReachedEoaLimit}
            />
          )}
        </Box>

        {showError && (
          <ErrorModel
            isOpen={showError}
            onOpenChange={() => setShowError(false)}
            errorName={chrome.i18n.getMessage('Error')}
            errorMessage={errorMessage}
          />
        )}
      </List>
    </Drawer>
  );
};

export default MenuDrawer;
