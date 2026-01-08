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

  const handleTipContinue = (keyInfo: NewKeyInfo) => {
    setNewKeyInfo(keyInfo);
    setStep('mnemonic');
  };

  const handleTipBack = () => {
    navigate(-1);
  };

  const handleMnemonicComplete = async (result: KeyRotationServiceResult) => {
    // Store the rotation result and move to password step
    setRotationResult(result);
    setStep('password');
  };

  const handleMnemonicBack = () => {
    setStep('tip');
    setNewKeyInfo(null);
  };

  const handleMnemonicError = (errorMessage: string) => {
    setError(errorMessage);
  };

  const handlePasswordSubmit = async (password: string) => {
    try {
      console.log('[KeyRotation] Starting password submit process');
      if (!newKeyInfo) {
        throw new Error('New key info is missing');
      }

      // Get the old public key and username before signing out (needed for removal and new profile creation)
      let oldPublicKeyToRemove: string | null = null;
      let currentUsername: string = address; // Default to address if we can't get username

      // Get the old public key from the current keyring BEFORE any changes
      // This is the most reliable way since we're still logged in with the old key
      try {
        console.log('[KeyRotation] Getting current public key from keyring');
        // Get the current public key directly as a hex string
        const currentPublicKey = await wallet.getCurrentPublicKey?.();
        console.log('[KeyRotation] Current public key retrieved:', currentPublicKey);

        if (currentPublicKey && typeof currentPublicKey === 'string') {
          oldPublicKeyToRemove = currentPublicKey;
          console.log(
            '[KeyRotation] Retrieved current public key as old key to remove:',
            oldPublicKeyToRemove
          );
        } else {
          console.warn('[KeyRotation] Invalid public key format:', currentPublicKey);
        }
      } catch (err) {
        console.error('[KeyRotation] Error getting current public key:', {
          error: err,
          message: err instanceof Error ? err.message : String(err),
        });
      }

      // Fallback: try to get from storage (stored during rotation)
      if (!oldPublicKeyToRemove) {
        try {
          const OLD_KEY_TO_REMOVE_KEY = `keyRotation:oldKeyToRemove:${address}`;
          console.log('[KeyRotation] Looking for old key in storage:', OLD_KEY_TO_REMOVE_KEY);
          const storedOldKey = await getLocalData(OLD_KEY_TO_REMOVE_KEY);
          if (storedOldKey && typeof storedOldKey === 'string') {
            oldPublicKeyToRemove = storedOldKey;
            console.log(
              '[KeyRotation] Found old key to remove from storage:',
              oldPublicKeyToRemove
            );
          }
        } catch (err) {
          console.error('[KeyRotation] Error getting old key from storage:', err);
        }
      }

      if (!oldPublicKeyToRemove) {
        console.warn('[KeyRotation] Could not determine old public key - removal will be skipped');
      }

      // Get the current username before signing out
      try {
        const userInfo = await wallet.getUserInfo();
        if (userInfo && userInfo.username) {
          currentUsername = userInfo.username;
          console.log('[KeyRotation] Retrieved current username:', currentUsername);
        }
      } catch (err) {
        console.warn('[KeyRotation] Could not get current username, using address:', err);
      }

      // Create the keyring with the new mnemonic
      // createKeyringWithMnemonics already clears the current keyring internally
      // We don't need to sign out from Firebase since we're the same user in the backend
      console.log('[KeyRotation] Creating keyring with new mnemonic');
      await wallet.createKeyringWithMnemonics(
        newKeyInfo.flowKey.publicKey,
        newKeyInfo.flowKey.signAlgo || 2,
        password,
        newKeyInfo.seedphrase,
        FLOW_BIP44_PATH,
        ''
      );

      // After switching to the new key, remove the old keyring
      if (oldPublicKeyToRemove) {
        try {
          console.log('[KeyRotation] Attempting to remove old keyring:', {
            oldPublicKey: oldPublicKeyToRemove,
            length: oldPublicKeyToRemove.length,
          });

          console.log('[KeyRotation] Calling removeKeyring with password and publicKey');
          await wallet.removeKeyring(password, oldPublicKeyToRemove);
          console.log('[KeyRotation] removeKeyring call completed');

          const OLD_KEY_TO_REMOVE_KEY = `keyRotation:oldKeyToRemove:${address}`;
          await removeLocalData(OLD_KEY_TO_REMOVE_KEY);
          console.log('[KeyRotation] Old keyring removed successfully and local data cleared');
        } catch (err) {
          console.error('[KeyRotation] Failed to remove old keyring:', {
            error: err,
            message: err instanceof Error ? err.message : String(err),
            stack: err instanceof Error ? err.stack : undefined,
            oldPublicKey: oldPublicKeyToRemove,
          });
          // Continue even if removal fails - the new key is already active
        }
      } else {
        console.warn('[KeyRotation] No old public key found to remove');
      }

      // Navigate to success or back
      console.log('[KeyRotation] Key rotation completed successfully');
      setStep('complete');
      // Navigate back after a short delay to show success
      setTimeout(() => {
        navigate(-1);
      }, 2000);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : String(err) || 'Failed to complete key rotation';
      setError(errorMessage);
      console.error('[KeyRotation] Error during completion:', {
        error: err,
        message: errorMessage,
        stack: err instanceof Error ? err.stack : undefined,
        errorString: String(err),
        errorType: err?.constructor?.name,
      });
    }
  };

  const handlePasswordBack = () => {
    setStep('mnemonic');
    setRotationResult(null);
  };

  if (step === 'tip') {
    return <KeyRotationTipScreen onContinue={handleTipContinue} onBack={handleTipBack} />;
  }

  if (step === 'mnemonic' && newKeyInfo) {
    return (
      <KeyRotationMnemonicScreen
        newKeyInfo={newKeyInfo}
        address={address}
        onComplete={handleMnemonicComplete}
        onBack={handleMnemonicBack}
        onError={handleMnemonicError}
      />
    );
  }

  if (step === 'password') {
    return <SetPassword onSubmit={handlePasswordSubmit} isLogin={true} />;
  }

  // Complete state - could show a success message or just navigate
  return null;
};

export default KeyRotationView;
