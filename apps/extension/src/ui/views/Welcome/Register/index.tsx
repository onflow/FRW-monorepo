import { Box } from '@mui/material';
import * as bip39 from 'bip39';
import React, { useCallback, useEffect, useReducer } from 'react';
import { useLocation, useNavigate } from 'react-router';

import { INITIAL_REGISTER_STATE, registerReducer, type RegisterState, STEPS } from '@/reducers';
import AllSet from '@/ui/components/LandingPages/AllSet';
import GoogleBackup from '@/ui/components/LandingPages/GoogleBackup';
import LandingComponents from '@/ui/components/LandingPages/LandingComponents';
import PickNickname from '@/ui/components/LandingPages/PickNickname';
import RecoveryPhrase from '@/ui/components/LandingPages/RecoveryPhrase';
import RepeatPhrase from '@/ui/components/LandingPages/RepeatPhrase';
import SetPassword from '@/ui/components/LandingPages/SetPassword';
import { useWallet } from '@/ui/hooks/use-wallet';

export const initRegisterState = (initialState: RegisterState): RegisterState => {
  return {
    ...initialState,
    mnemonic: bip39.generateMnemonic(),
  };
};

const Register = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const usewallet = useWallet();

  const [state, dispatch] = useReducer(registerReducer, INITIAL_REGISTER_STATE, initRegisterState);
  const { activeTab, username, password, mnemonic, isAddWallet, nickname } = state;

  useEffect(() => {
    const checkWalletStatus = async () => {
      const isBooted = await usewallet.isBooted();
      dispatch({ type: 'SET_IS_ADD_WALLET', payload: isBooted });
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
        console.error('Error during registration/import:', error);
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
        // You might want to add error state management here
        // For now, we'll let the error bubble up to be handled by the SetPassword component
        throw error;
      }
    },
    [nickname, mnemonic, usewallet, location.state]
  );

  const goBack = () => {
    if (location.state?.isFromImport) {
      // Coming from import flow - go back to import page
      navigate('/welcome/importprofile');
    } else if (activeTab === STEPS.USERNAME || activeTab === STEPS.ALL_SET) {
      navigate(-1);
    } else {
      dispatch({ type: 'GO_BACK' });
    }
  };

  // Only show the back button if there is a page to go back to
  const showBackButton =
    activeTab !== STEPS.ALL_SET &&
    (location.state?.isFromImport || activeTab !== STEPS.USERNAME || location.key !== 'default');

  return (
    <LandingComponents
      activeIndex={Object.values(STEPS).indexOf(activeTab)}
      direction="right"
      showBackButton={showBackButton}
      onBack={goBack}
      showConfetti={activeTab === STEPS.ALL_SET}
      showRegisterHeader={true}
    >
      <Box>
        {activeTab === STEPS.USERNAME && (
          <PickNickname
            handleSwitchTab={() => dispatch({ type: 'SET_ACTIVE_TAB', payload: STEPS.RECOVERY })}
            nickname={nickname}
            setNickname={(name) => dispatch({ type: 'SET_NICKNAME', payload: name })}
          />
        )}

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
    </LandingComponents>
  );
};

export default Register;
