import { Box, IconButton } from '@mui/material';
import { ArrowBack } from '@onflow/frw-icons';
import { KeyRotationTipScreen, KeyRotationMnemonicScreen } from '@onflow/frw-screens';
import type { NewKeyInfo, KeyRotationServiceResult } from '@onflow/frw-types';
import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router';

import { getLocalData, removeLocalData } from '@/data-model';
import { FLOW_BIP44_PATH } from '@/shared/constant';
import SetPassword from '@/ui/components/LandingPages/SetPassword';
import { useWallet } from '@/ui/hooks/use-wallet';

type KeyRotationStep = 'tip' | 'mnemonic' | 'password' | 'complete';

const KeyRotationView: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const wallet = useWallet();
  const address = new URLSearchParams(location.search).get('address') || '';

  const [step, setStep] = useState<KeyRotationStep>('tip');
  const [newKeyInfo, setNewKeyInfo] = useState<NewKeyInfo | null>(null);
  const [rotationResult, setRotationResult] = useState<KeyRotationServiceResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [password, setPassword] = useState<string | null>(null);

  const handleTipContinue = (keyInfo: NewKeyInfo) => {
    setNewKeyInfo(keyInfo);
    setStep('password');
  };

  const handleTipBack = () => {
    navigate(-1);
  };

  const handlePasswordConfirm = async (confirmedPassword: string) => {
    setPassword(confirmedPassword);
    setStep('mnemonic');
  };

  const handlePasswordBack = () => {
    setStep('tip');
    setNewKeyInfo(null);
    setPassword(null);
  };

  const handleMnemonicComplete = async (result: KeyRotationServiceResult) => {
    setRotationResult(result);
    if (password) {
      await handlePasswordSubmit(password);
    } else {
      setError('Password is missing');
    }
  };

  const handleMnemonicBack = () => {
    setStep('password');
  };

  const handleMnemonicError = (errorMessage: string) => {
    setError(errorMessage);
  };

  const handlePasswordSubmit = async (passwordToUse: string) => {
    try {
      if (!newKeyInfo) {
        throw new Error('New key info is missing');
      }

      let oldPublicKeyToRemove: string | null = null;
      let currentUsername: string = address;

      try {
        const currentPublicKey = await wallet.getCurrentPublicKey?.();

        if (currentPublicKey && typeof currentPublicKey === 'string') {
          oldPublicKeyToRemove = currentPublicKey;
        }
      } catch (err) {
        // Empty catch block
      }

      if (!oldPublicKeyToRemove) {
        try {
          const OLD_KEY_TO_REMOVE_KEY = `keyRotation:oldKeyToRemove:${address}`;
          const storedOldKey = await getLocalData(OLD_KEY_TO_REMOVE_KEY);
          if (storedOldKey && typeof storedOldKey === 'string') {
            oldPublicKeyToRemove = storedOldKey;
          }
        } catch (err) {
          // Empty catch block
        }
      }

      try {
        const userInfo = await wallet.getUserInfo();
        if (userInfo && userInfo.username) {
          currentUsername = userInfo.username;
        }
      } catch (err) {
        // Empty catch block
      }

      await wallet.createKeyringWithMnemonics(
        newKeyInfo.flowKey.publicKey,
        newKeyInfo.flowKey.signAlgo || 2,
        passwordToUse,
        newKeyInfo.seedphrase,
        FLOW_BIP44_PATH,
        ''
      );

      if (oldPublicKeyToRemove) {
        try {
          await wallet.removeKeyring(passwordToUse, oldPublicKeyToRemove);

          const OLD_KEY_TO_REMOVE_KEY = `keyRotation:oldKeyToRemove:${address}`;
          await removeLocalData(OLD_KEY_TO_REMOVE_KEY);
        } catch (err) {
          // Empty catch block
        }
      }

      await wallet.loginWithKeyring();
      await wallet.refreshWallets();

      setStep('complete');
      setTimeout(() => {
        navigate(-1);
      }, 2000);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : String(err) || 'Failed to complete key rotation';
      setError(errorMessage);
    }
  };

  const handleBackClick = () => {
    navigate('/dashboard');
  };

  const Header = () => (
    <Box sx={{ display: 'flex', position: 'relative', mb: '4px' }}>
      <IconButton onClick={handleBackClick}>
        {/* @ts-expect-error - ArrowBack type definition issue, but works at runtime */}
        <ArrowBack color="rgba(255, 255, 255, 0.8)" />
      </IconButton>
      <Box sx={{ flexGrow: 1 }} />
    </Box>
  );

  if (step === 'tip') {
    return (
      <>
        <Header />
        <KeyRotationTipScreen onContinue={handleTipContinue} onBack={handleTipBack} />
      </>
    );
  }

  if (step === 'password') {
    return (
      <>
        <Header />
        <SetPassword onSubmit={handlePasswordConfirm} isLogin={true} />
      </>
    );
  }

  if (step === 'mnemonic' && newKeyInfo) {
    return (
      <>
        <Header />
        <KeyRotationMnemonicScreen
          newKeyInfo={newKeyInfo}
          address={address}
          onComplete={handleMnemonicComplete}
          onBack={handleMnemonicBack}
          onError={handleMnemonicError}
        />
      </>
    );
  }

  return null;
};

export default KeyRotationView;
