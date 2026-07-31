import { Box, Button, Typography } from '@mui/material';
import { generateRandomUsername } from '@onflow/frw-utils';
import * as bip39 from 'bip39';
import React, { useCallback, useEffect, useReducer, useState } from 'react';
import { useLocation, useNavigate } from 'react-router';

import {
  INITIAL_REGISTER_STATE,
  registerReducer,
  type RegisterState,
  type StepType,
  STEPS,
} from '@/reducers';
import { consoleError } from '@/shared/utils';
import { LLSpinner } from '@/ui/components';
import AllSet from '@/ui/components/LandingPages/AllSet';
import GoogleBackup from '@/ui/components/LandingPages/GoogleBackup';
import LandingComponents from '@/ui/components/LandingPages/LandingComponents';
import RecoveryPhrase from '@/ui/components/LandingPages/RecoveryPhrase';
import RepeatPhrase from '@/ui/components/LandingPages/RepeatPhrase';
import SetPassword from '@/ui/components/LandingPages/SetPassword';
import { useWallet } from '@/ui/hooks/use-wallet';

export const initRegisterState = (initialState: RegisterState): RegisterState => {
  return {
    ...initialState,
    mnemonic: bip39.generateMnemonic(),
    nickname: generateRandomUsername(),
  };
};

// Shown when a vault already exists on this device but the wallet is locked. In that state the
// create-account flow can never succeed: any new password fails verification against the existing
// vault and the user just sees a confusing 'Incorrect password' (#1428).
const ExistingWalletNotice = ({
  onUnlock,
  onReset,
}: {
  onUnlock: () => void;
  onReset: () => void;
}) => (
  <Box
    sx={{
      display: 'flex',
      flexDirection: 'column',
      gap: '16px',
      alignItems: 'center',
      textAlign: 'center',
      px: '36px',
      py: '48px',
    }}
  >
    <Typography variant="h4">{chrome.i18n.getMessage('Existing_Wallet_Found')}</Typography>
    <Typography variant="body1" color="text.secondary">
      {chrome.i18n.getMessage('Existing_Wallet_Found_Description')}
    </Typography>
    <Button variant="contained" color="primary" onClick={onUnlock} fullWidth>
      {chrome.i18n.getMessage('Unlock_Wallet')}
    </Button>
    <Button variant="outlined" color="error" onClick={onReset} fullWidth>
      {chrome.i18n.getMessage('Reset_my_wallet')}
    </Button>
    <Typography variant="body2" color="text.secondary">
      {chrome.i18n.getMessage(
        'This_will_remove_any_existing_wallets_and_replace_them_with_new_wallets_Make_sure_you_have_your_recovery_phrase_backed_up'
      )}
    </Typography>
  </Box>
);

const Register = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const usewallet = useWallet();

  const [state, dispatch] = useReducer(registerReducer, INITIAL_REGISTER_STATE, initRegisterState);
  const { activeTab, username, password, mnemonic, isAddWallet, nickname } = state;

  // undefined = still checking; true = a booted vault exists and the wallet is locked
  const [isExistingWalletLocked, setIsExistingWalletLocked] = useState<boolean | undefined>(
    undefined
  );

  useEffect(() => {
    const checkWalletStatus = async () => {
      const isBooted = await usewallet.isBooted();
      dispatch({ type: 'SET_IS_ADD_WALLET', payload: isBooted });
      setIsExistingWalletLocked(isBooted && !(await usewallet.isUnlocked()));
    };

    checkWalletStatus();
  }, [usewallet]);

  // Handle input data from import flow
  useEffect(() => {
    if (location.state?.isFromImport && location.state?.importData && location.state?.username) {
      // Set the auto-generated username
      dispatch({ type: 'SET_NICKNAME', payload: location.state.username });

      // Skip all seed phrase steps and go directly to password
      dispatch({ type: 'SET_ACTIVE_TAB', payload: STEPS.PASSWORD });
    }
  }, [location.state]);

  const submitPassword = useCallback(
    async (newPassword: string) => {
      dispatch({ type: 'SET_PASSWORD', payload: newPassword });

      try {
        if (location.state?.isFromImport && location.state?.importData) {
          // Coming from import flow - use the appropriate import method
          const importData = location.state.importData;

          if (importData.type === 'mnemonic') {
            if (!importData.mnemonic || importData.mnemonic.trim() === '') {
              throw new Error('Mnemonic is empty or invalid');
            }

            // For "Register New Profile" flow, we should create a new account, not import an existing one
            // The mnemonic will be used to generate a new Flow account
            await usewallet.registerNewProfile(nickname, newPassword, importData.mnemonic);
          } else if (importData.type === 'privateKey') {
            // For "Register New Profile" flow with private key, create a new account
            await usewallet.registerNewProfileUsingPrivateKey(
              nickname,
              newPassword,
              importData.privateKey
            );
          }
        } else {
          // Normal registration flow - register with mnemonic
          await usewallet.registerNewProfile(nickname, newPassword, mnemonic);
        }

        // Get the proper username
        const userInfo = await usewallet.getUserInfo();
        dispatch({ type: 'SET_USERNAME', payload: userInfo.username });

        // But after all this, we haven't updated loggedInAccounts so if we close the window before the account refreshes, we won't be able to login
        dispatch({ type: 'SET_ACTIVE_TAB', payload: STEPS.BACKUP });
      } catch (error) {
        consoleError('Error during registration/import:', error);
        // Let the error bubble up to be handled by the SetPassword component
        throw error;
      }
    },
    [nickname, mnemonic, usewallet, location.state]
  );

  const goBack = () => {
    if (location.state?.isFromImport) {
      // Coming from import flow - go back to import page
      navigate('/welcome/importprofile');
    } else if (activeTab === STEPS.RECOVERY || activeTab === STEPS.ALL_SET) {
      navigate(-1);
    } else {
      dispatch({ type: 'GO_BACK' });
    }
  };

  // Only show the back button if there is a page to go back to
  const showBackButton =
    activeTab !== STEPS.ALL_SET &&
    (location.state?.isFromImport || activeTab !== STEPS.RECOVERY || location.key !== 'default');

  // Calculate active index excluding USERNAME step
  const stepValues = Object.values(STEPS).filter((step) => step !== STEPS.USERNAME) as Array<
    Exclude<StepType, typeof STEPS.USERNAME>
  >;
  const activeIndex = stepValues.indexOf(activeTab as Exclude<StepType, typeof STEPS.USERNAME>);

  return (
    <LandingComponents
      activeIndex={activeIndex}
      direction="right"
      showBackButton={showBackButton}
      onBack={goBack}
      showConfetti={activeTab === STEPS.ALL_SET}
      showRegisterHeader={true}
    >
      {isExistingWalletLocked === true && !location.state?.isFromImport ? (
        <ExistingWalletNotice
          onUnlock={() => navigate('/unlock')}
          onReset={() => navigate('/forgot')}
        />
      ) : isExistingWalletLocked === undefined && !location.state?.isFromImport ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: '48px' }}>
          <LLSpinner />
        </Box>
      ) : (
        <Box>
          {activeTab === STEPS.RECOVERY && (
            <RecoveryPhrase
              handleSwitchTab={() => dispatch({ type: 'SET_ACTIVE_TAB', payload: STEPS.REPEAT })}
              mnemonic={mnemonic}
            />
          )}

          {activeTab === STEPS.REPEAT && (
            <RepeatPhrase
              handleSwitchTab={() => dispatch({ type: 'SET_ACTIVE_TAB', payload: STEPS.PASSWORD })}
              mnemonic={mnemonic}
            />
          )}

          {activeTab === STEPS.PASSWORD && (
            <SetPassword onSubmit={submitPassword} isLogin={isAddWallet} />
          )}

          {activeTab === STEPS.BACKUP && username && password && (
            <GoogleBackup
              handleSwitchTab={() => dispatch({ type: 'SET_ACTIVE_TAB', payload: STEPS.ALL_SET })}
              mnemonic={mnemonic}
              username={username}
              password={password}
            />
          )}

          {activeTab === STEPS.ALL_SET && (
            <AllSet handleSwitchTab={() => window.close()} variant="add" />
          )}
        </Box>
      )}
    </LandingComponents>
  );
};

export default Register;
