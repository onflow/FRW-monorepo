import AndroidIcon from '@mui/icons-material/Android';
import AppleIcon from '@mui/icons-material/Apple';
import { Alert, Box, Divider, IconButton, List, Snackbar, Typography } from '@mui/material';
import * as Sentry from '@sentry/react';
import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router';

import { getLocalData, setLocalData } from '@/data-model';
import { MAX_MAIN_ACCOUNTS_PER_PROFILE } from '@/shared/constant';
import { hasReachedFlowAddressLimit } from '@/shared/utils';
import { AboutIcon } from '@/ui/assets/icons/settings/About';
import { AccountListIcon } from '@/ui/assets/icons/settings/AccountList';
import { AddProfileIcon } from '@/ui/assets/icons/settings/AddProfile';
import { AddressIcon } from '@/ui/assets/icons/settings/Address';
import { BackupIcon } from '@/ui/assets/icons/settings/Backup';
import { BugIcon } from '@/ui/assets/icons/settings/Bug';
import { CurrencyIcon } from '@/ui/assets/icons/settings/Currency';
import { DevicesIcon } from '@/ui/assets/icons/settings/Devices';
import { DevmodeIcon } from '@/ui/assets/icons/settings/Devmode';
import { EditIcon } from '@/ui/assets/icons/settings/Edit';
import { MobileIcon } from '@/ui/assets/icons/settings/Mobile';
import { SecurityIcon } from '@/ui/assets/icons/settings/Security';
import { LLHeader } from '@/ui/components';
import AddAccountPopup from '@/ui/components/account-menu/AddAccountPopup';
import IconEnd from '@/ui/components/iconfont/IconAVector11Stroke';
import { ProfileItem } from '@/ui/components/profile/profile-item';
import AddProfilePopup from '@/ui/components/settings/add-profile-popup';
import SettingsListItem from '@/ui/components/settings/setting-list-item';
import SettingsSwitchCard from '@/ui/components/settings/settings-switch';
import { useFeatureFlag } from '@/ui/hooks/use-feature-flags';
import { useWallet } from '@/ui/hooks/use-wallet';
import { useProfiles } from '@/ui/hooks/useProfileHook';
// Feature flags
const SHOW_DEVICES = false;
const SettingTab = () => {
  const MAX_EOA_ADDRESSES_PER_PROFILE = 5;
  const usewallet = useWallet();
  const {
    profileIds,
    activeAccountType,
    userInfo,
    network,
    walletList,
    pendingAccountTransactions,
  } = useProfiles();
  const [isKeyphrase, setIsKeyphrase] = useState(false);
  const [isAddProfilePopupOpen, setIsAddProfilePopupOpen] = useState(false);
  const [isAddAccountPopupOpen, setIsAddAccountPopupOpen] = useState(false);
  const [modeGas, setGasMode] = useState(false);
  const [gasKillSwitch, setGasKillSwitch] = useState(false);
  const [showError, setShowError] = useState(false);
  const [isCreatingAccount, setIsCreatingAccount] = useState(false);
  const [isCreatingEoaAddress, setIsCreatingEoaAddress] = useState(false);
  const [createAccountError, setCreateAccountError] = useState('');
  const isFreeGasFeeEnabled = useFeatureFlag('free_gas');
  const canCreateNewAccount = true;
  const canAddMoreAccounts = !hasReachedFlowAddressLimit(
    walletList ?? [],
    MAX_MAIN_ACCOUNTS_PER_PROFILE
  );
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

  const checkIsKeyphrase = useCallback(async () => {
    const keyrings = await usewallet.checkMnemonics();
    await setIsKeyphrase(keyrings);
  }, [usewallet]);

  const handleErrorClose = (event?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }
    setShowError(false);
  };

  const handleCreateAccountErrorClose = (event?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }
    setCreateAccountError('');
  };

  const loadGasMode = useCallback(async () => {
    const isFreeGasFeeEnabled = await getLocalData<boolean>('lilicoPayer');
    if (isFreeGasFeeEnabled) {
      setGasMode(isFreeGasFeeEnabled);
    }
  }, []);

  const loadGasKillSwitch = useCallback(async () => {
    await usewallet.getPayerAddressAndKeyId();
    if (isFreeGasFeeEnabled) {
      setGasKillSwitch(isFreeGasFeeEnabled);
    }
  }, [isFreeGasFeeEnabled, usewallet]);

  const switchGasMode = async () => {
    setGasMode(!modeGas);
    setLocalData('lilicoPayer', !modeGas);
    setShowError(true);
  };

  const createAccountFromSettings = async () => {
    if (isCreatingAccount || hasPendingCreation) {
      return;
    }

    setIsCreatingAccount(true);
    try {
      await usewallet.createNewAccount(network || 'mainnet');
    } catch (error) {
      setCreateAccountError(
        error instanceof Error ? error.message : 'Failed to create account. Please try again.'
      );
    } finally {
      setIsCreatingAccount(false);
    }
  };

  const createAccountFromPopup = async () => {
    setIsAddAccountPopupOpen(false);
    await createAccountFromSettings();
  };

  const createEoaAddressFromSettings = async () => {
    if (isCreatingEoaAddress) {
      return;
    }

    setIsCreatingEoaAddress(true);
    try {
      await usewallet.addNewEOAAddress();
    } catch (error) {
      setCreateAccountError(
        error instanceof Error ? error.message : 'Failed to create EOA address. Please try again.'
      );
    } finally {
      setIsCreatingEoaAddress(false);
    }
  };

  const createEoaAddressFromPopup = async () => {
    setIsAddAccountPopupOpen(false);
    await createEoaAddressFromSettings();
  };

  useEffect(() => {
    loadGasKillSwitch();
    checkIsKeyphrase();
    loadGasMode();
  }, [checkIsKeyphrase, loadGasMode, loadGasKillSwitch]);

  return (
    <div className="page">
      <LLHeader title={chrome.i18n.getMessage('Settings')} help={false} goBackLink="/dashboard" />
      {userInfo && profileIds && profileIds.length > 1 && (
        <Box
          sx={{
            margin: '8px auto',
            padding: '0 18px',
            borderRadius: '16px',
            overflow: 'hidden',
            backgroundColor: 'transparent',
          }}
        >
          <Link to="/dashboard/setting/profile" data-testid="setting-goto-account-button">
            <ProfileItem
              profileId={userInfo?.id}
              selectedProfileId={userInfo?.id}
              switchAccount={async () => {}}
              setLoadingId={() => {}}
              rightIcon={<EditIcon width={24} height={24} />}
              noPadding={true}
            />
          </Link>
        </Box>
      )}
      <Box
        sx={{
          justifyContent: 'center',
          alignItems: 'center',
          width: '100%',
          padding: '8px 18px',
        }}
      >
        {/* top link */}
        <List
          className="list"
          sx={{
            margin: '8px auto 16px auto',
            pt: 0,
            pb: 0,
            borderRadius: '16px',
            overflow: 'hidden',
            backgroundColor: '#282828',
            '&:hover': {
              backgroundColor: '#282828',
            },
          }}
        >
          <SettingsListItem
            to="/dashboard/setting/accountlist"
            icon={<AccountListIcon width={24} height={24} />}
            text={chrome.i18n.getMessage('Accounts')}
            showArrow={false}
          />
          <Divider sx={{ width: '90%' }} variant="middle" />
          <SettingsListItem
            to="/dashboard/setting/addressbook"
            icon={<AddressIcon width={24} height={24} />}
            text={chrome.i18n.getMessage('AddressBook')}
            showArrow={false}
          />
        </List>
        <List
          className="list"
          sx={{
            margin: '8px auto 16px auto',
            pt: 0,
            pb: 0,
            borderRadius: '16px',
            overflow: 'hidden',
            backgroundColor: '#282828',
            '&:hover': {
              backgroundColor: '#282828',
            },
          }}
        >
          <SettingsListItem
            to="/dashboard/setting/currency"
            icon={<CurrencyIcon width={24} height={24} />}
            text={chrome.i18n.getMessage('Display__Currency')}
            endIcon={<IconEnd size={12} />}
          />

          {activeAccountType === 'main' && <Divider sx={{ width: '90%' }} variant="middle" />}
          {isKeyphrase && activeAccountType === 'main' && (
            <SettingsListItem
              to="/dashboard/setting/backups"
              icon={<BackupIcon width={24} height={24} />}
              text={chrome.i18n.getMessage('Backup')}
              endIcon={<IconEnd size={12} />}
            />
          )}
          <Divider sx={{ width: '90%' }} variant="middle" />
          <SettingsListItem
            to="/dashboard/setting/changepassword"
            icon={<SecurityIcon width={24} height={24} />}
            text={chrome.i18n.getMessage('Password')}
            endIcon={<IconEnd size={12} />}
          />
        </List>
        <List
          className="list"
          sx={{
            margin: '8px auto 18px auto',
            pt: 0,
            pb: 0,
            borderRadius: '16px',
            overflow: 'hidden',
            backgroundColor: '#282828',
            '&:hover': {
              backgroundColor: '#282828',
            },
          }}
        >
          <SettingsListItem
            to="https://core.flow.com"
            icon={<MobileIcon width={24} height={24} />}
            text={chrome.i18n.getMessage('Try_Our_Mobile_APP')}
            endIcon={
              <>
                <IconButton
                  onClick={() =>
                    window.open(
                      'https://apps.apple.com/ca/app/flow-wallet-nfts-and-crypto/id6478996750'
                    )
                  }
                >
                  <AppleIcon fontSize="small" color="disabled" />
                </IconButton>
                <IconButton
                  onClick={() =>
                    window.open(
                      'https://play.google.com/store/apps/details?id=com.flowfoundation.wallet'
                    )
                  }
                >
                  <AndroidIcon fontSize="small" color="disabled" />
                </IconButton>
              </>
            }
          />

          <Divider sx={{ width: '90%' }} variant="middle" />

          <SettingsListItem
            to="/dashboard/setting/developerMode"
            icon={<DevmodeIcon width={24} height={24} />}
            text={chrome.i18n.getMessage('Developer__Mode')}
            endIcon={<IconEnd size={12} />}
          />

          <Divider sx={{ width: '90%' }} variant="middle" />
          <SettingsListItem
            icon={<BugIcon width={24} height={24} />}
            text={chrome.i18n.getMessage('Feedback')}
            onClick={async () => {
              try {
                const feedback = Sentry.getFeedback();
                const form = await feedback?.createForm();
                form!.appendToDom();
                form!.open();
              } catch (error) {
                Sentry.captureException(error);
              }
            }}
          />
          <Divider sx={{ width: '90%' }} variant="middle" />

          {SHOW_DEVICES && (
            <>
              <SettingsListItem
                to="/dashboard/setting/devices"
                icon={<DevicesIcon width={24} height={24} />}
                text={chrome.i18n.getMessage('Devices')}
                endIcon={<IconEnd size={12} />}
              />
              <Divider sx={{ width: '90%' }} variant="middle" />
            </>
          )}

          <SettingsListItem
            to="/dashboard/setting/about"
            icon={<AboutIcon width={24} height={24} />}
            text={chrome.i18n.getMessage('About')}
            endIcon={<IconEnd size={12} />}
          />
        </List>
        {isFreeGasFeeEnabled && (
          <List
            className="list"
            sx={{
              margin: '8px auto 2px auto',
              pt: 0,
              pb: 0,
              borderRadius: '16px',
              overflow: 'hidden',
              backgroundColor: '#282828',
              '&:hover': {
                backgroundColor: '#282828',
              },
            }}
          >
            <SettingsSwitchCard
              label="Free gas fee"
              checked={modeGas}
              onChange={() => {
                switchGasMode();
              }}
              disabled={!gasKillSwitch}
              customStyle={{
                paddingY: '8px',
              }}
            />
          </List>
        )}

        {isFreeGasFeeEnabled && (
          <Typography
            variant="body1"
            color="#717171"
            style={{ weight: 400, fontSize: '12px', marginBottom: '18px' }}
          >
            * {chrome.i18n.getMessage('Allow__lilico__to__pay__the__gas__fee')}
          </Typography>
        )}
        <List
          className="list"
          sx={{
            margin: '8px auto 18px auto',
            pt: 0,
            pb: 0,
            borderRadius: '16px',
            overflow: 'hidden',
            backgroundColor: '#282828',
            '&:hover': {
              backgroundColor: '#282828',
            },
          }}
        >
          <SettingsListItem
            onClick={() => setIsAddProfilePopupOpen(true)}
            icon={<AddProfileIcon width={24} height={24} />}
            text={chrome.i18n.getMessage('Add_Profile') || 'Add Profile'}
            endIcon={<IconEnd size={12} />}
          />
          {canOpenAddAccountPopup && (
            <>
              <Divider sx={{ width: '90%' }} variant="middle" />
              <SettingsListItem
                onClick={
                  isCreatingAccount || hasPendingCreation
                    ? undefined
                    : () => setIsAddAccountPopupOpen(true)
                }
                icon={<AddProfileIcon width={24} height={24} />}
                text={chrome.i18n.getMessage('Add_Account_Sidebar') || 'Add Account'}
                endIcon={<IconEnd size={12} />}
                showArrow={true}
              />
            </>
          )}
        </List>
      </Box>

      <Snackbar open={showError} autoHideDuration={6000} onClose={handleErrorClose}>
        <Alert
          onClose={handleErrorClose}
          variant="filled"
          severity="warning"
          sx={{ width: '100%' }}
        >
          {chrome.i18n.getMessage('You__will__need__to__connect__to__your__wallet__again')}
        </Alert>
      </Snackbar>

      <Snackbar
        open={Boolean(createAccountError)}
        autoHideDuration={6000}
        onClose={handleCreateAccountErrorClose}
      >
        <Alert
          onClose={handleCreateAccountErrorClose}
          variant="filled"
          severity="error"
          sx={{ width: '100%' }}
        >
          {createAccountError}
        </Alert>
      </Snackbar>

      <AddProfilePopup
        isOpen={isAddProfilePopupOpen}
        onClose={() => setIsAddProfilePopupOpen(false)}
      />
      <AddAccountPopup
        isConfirmationOpen={isAddAccountPopupOpen}
        handleCloseIconClicked={() => setIsAddAccountPopupOpen(false)}
        handleCancelBtnClicked={() => setIsAddAccountPopupOpen(false)}
        handleAddBtnClicked={() => setIsAddAccountPopupOpen(false)}
        addAccount={createAccountFromPopup}
        addEoaAddress={createEoaAddressFromPopup}
        importExistingAccount={false}
        modalVariant="profile"
        disableCreateAccount={hasPendingCreation || !canAddMoreAccounts}
        disableAddEoaAddress={isCreatingEoaAddress || hasReachedEoaLimit}
      />
    </div>
  );
};

export default SettingTab;
