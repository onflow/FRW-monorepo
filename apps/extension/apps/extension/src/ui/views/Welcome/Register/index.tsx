import { Box } from '@mui/material';
import {
  INITIAL_REGISTER_STATE,
  registerReducer,
  type RegisterState,
  STEPS,
} from '@onflow/frw-reducers';
import * as bip39 from 'bip39';
import React, { useCallback, useEffect, useReducer } from 'react';
import { useLocation, useNavigate } from 'react-router';

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

  const submitPassword = useCallback(
    async (newPassword: string) => {
      dispatch({ type: 'SET_PASSWORD', payload: newPassword });
      // We're registering the new profile with the password, nickname, and mnemonic
      await usewallet.registerNewProfile(nickname, newPassword, mnemonic);

      // Get the proper username
      const userInfo = await usewallet.getUserInfo();
      dispatch({ type: 'SET_USERNAME', payload: userInfo.username });

      // But after all this, we haven't updated loggedInAccounts so if we close the window before the account refreshes, we won't be able to login
      dispatch({ type: 'SET_ACTIVE_TAB', payload: STEPS.BACKUP });
    },
    [nickname, mnemonic, usewallet]
  );

  const goBack = () => {
    if (activeTab === STEPS.USERNAME || activeTab === STEPS.ALL_SET) {
      navigate(-1);
    } else {
      dispatch({ type: 'GO_BACK' });
    }
  };

  // Only show the back button if there is a page to go back to
  const showBackButton =
    activeTab !== STEPS.ALL_SET && (activeTab !== STEPS.USERNAME || location.key !== 'default');

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
