import { Button, Typography } from '@mui/material';
import { Box } from '@mui/system';
import { logger } from '@onflow/frw-context';
import React, { useState } from 'react';

import { FLOW_BIP44_PATH } from '@/shared/constant';
import type { PublicKeyAccount } from '@/shared/types';
import { LLSpinner } from '@/ui/components';
import PasswordTextarea from '@/ui/components/password/PasswordTextarea';
import { useWallet } from '@/ui/hooks/use-wallet';

interface EnterSeedPhraseProps {
  mnemonicFromGoogle: string;
  handleSwitchTab: () => void;
  onVerifiedPhrase?: (phrase: string) => void;
  derivationPath?: string;
  passphrase?: string;
}

/**
 * Asks user to enter their 12 or 24 word recovery phrase to verify it matches the Google Drive backup.
 * Restore flow: Google Drive first, then seed phrase verification.
 */
const EnterSeedPhrase: React.FC<EnterSeedPhraseProps> = ({
  mnemonicFromGoogle,
  handleSwitchTab,
  onVerifiedPhrase,
  derivationPath = FLOW_BIP44_PATH,
  passphrase = '',
}) => {
  const usewallet = useWallet();
  const [enteredPhrase, setEnteredPhrase] = useState('');
  const [isLoading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [debugDetails, setDebugDetails] = useState<{
    pubKeyGoogleP256: string;
    pubKeyGoogleSecp256k1: string;
    pubKeyEnteredP256: string;
    pubKeyEnteredSecp256k1: string;
    accountsGoogle: PublicKeyAccount[];
    accountsEntered: PublicKeyAccount[];
    matchedAddress: string | null;
    totalWeight: number;
    requiredWeight: number;
  } | null>(null);
  const [showDebug, setShowDebug] = useState(false);

  const normalizeMnemonic = (v: string) => v.trim().split(/\s+/g).join(' ');
  const wordCount = (v: string) => (v ? normalizeMnemonic(v).split(' ').length : 0);
  const shortKey = (k: string) => {
    if (!k) return '';
    const v = k.startsWith('0x') ? k.slice(2) : k;
    return v.length <= 16 ? v : `${v.slice(0, 10)}...${v.slice(-6)}`;
  };

  const handleVerify = async () => {
    const phrase = normalizeMnemonic(enteredPhrase);
    if (!phrase) {
      setErrorMessage(
        chrome.i18n.getMessage('Import_12_or_24_words') ||
          'Enter your 12 or 24 word recovery phrase.'
      );
      return;
    }
    setErrorMessage(null);
    setDebugDetails(null);
    setShowDebug(false);
    setLoading(true);
    try {
      const [tupleGoogle, tupleEntered] = await Promise.all([
        usewallet.getPublicKeyTupleFromMnemonic(mnemonicFromGoogle, derivationPath, passphrase),
        usewallet.getPublicKeyTupleFromMnemonic(phrase, derivationPath, passphrase),
      ]);

      // iOS multi-backup validity rule: the 2 selected sources must combine to >= 1000 key weight
      // on the same Flow account (address). Seed phrase does NOT need to match the backup's public key.
      const requiredWeight = 1000;
      const preferredKeyType = (mn: string): 'P256' | 'SECP256K1' =>
        wordCount(mn) === 12 ? 'SECP256K1' : 'P256';

      const keyTypeGoogle = preferredKeyType(mnemonicFromGoogle);
      const keyTypeEntered = preferredKeyType(phrase);

      const pubKeyGooglePrimary =
        keyTypeGoogle === 'P256' ? tupleGoogle.P256 : tupleGoogle.SECP256K1;
      const pubKeyEnteredPrimary =
        keyTypeEntered === 'P256' ? tupleEntered.P256 : tupleEntered.SECP256K1;

      const [accountsGoogle, accountsEntered] = await Promise.all([
        usewallet
          .fetchAccountsByPublicKeyRawForDebug(pubKeyGooglePrimary, 'mainnet')
          .catch(() => [] as PublicKeyAccount[]),
        usewallet
          .fetchAccountsByPublicKeyRawForDebug(pubKeyEnteredPrimary, 'mainnet')
          .catch(() => [] as PublicKeyAccount[]),
      ]);

      const addressesGoogle = new Set(accountsGoogle.map((a) => a.address));
      const sharedAddresses = Array.from(new Set(accountsEntered.map((a) => a.address))).filter(
        (a) => addressesGoogle.has(a)
      );

      const weightForAddress = (address: string) => {
        const byKey = new Map<string, number>();
        const add = (acc: PublicKeyAccount) => {
          if (acc.address !== address) return;
          const k = `${acc.publicKey}:${acc.keyIndex}`;
          if (!byKey.has(k)) byKey.set(k, acc.weight);
        };
        for (const a of accountsGoogle) add(a);
        for (const a of accountsEntered) add(a);
        let sum = 0;
        for (const w of byKey.values()) sum += w;
        return sum;
      };

      let matchedAddress: string | null = null;
      let totalWeight = 0;
      for (const addr of sharedAddresses) {
        const w = weightForAddress(addr);
        if (w > totalWeight) {
          totalWeight = w;
          matchedAddress = addr;
        }
      }

      if (matchedAddress && totalWeight >= requiredWeight) {
        logger.info('EnterSeedPhrase verification ok (weight threshold)', {
          derivationPath,
          passphraseLength: passphrase.length,
          wordCountGoogle: wordCount(mnemonicFromGoogle),
          wordCountEntered: wordCount(phrase),
          keyTypeGoogle,
          keyTypeEntered,
          pubKeyGoogle: shortKey(pubKeyGooglePrimary),
          pubKeyEntered: shortKey(pubKeyEnteredPrimary),
          address: matchedAddress,
          totalWeight,
          requiredWeight,
        });
        if (onVerifiedPhrase) {
          onVerifiedPhrase(phrase);
        }
        handleSwitchTab();
        return;
      }

      logger.warn('EnterSeedPhrase mismatch (weight threshold)', {
        derivationPath,
        passphraseLength: passphrase.length,
        wordCountGoogle: wordCount(mnemonicFromGoogle),
        wordCountEntered: wordCount(phrase),
        keyTypeGoogle,
        keyTypeEntered,
        address: matchedAddress,
        totalWeight,
        requiredWeight,
      });

      setDebugDetails({
        pubKeyGoogleP256: tupleGoogle.P256,
        pubKeyGoogleSecp256k1: tupleGoogle.SECP256K1,
        pubKeyEnteredP256: tupleEntered.P256,
        pubKeyEnteredSecp256k1: tupleEntered.SECP256K1,
        accountsGoogle,
        accountsEntered,
        matchedAddress,
        totalWeight,
        requiredWeight,
      });

      if (!matchedAddress) {
        setErrorMessage(
          chrome.i18n.getMessage('Seed_phrase_does_not_match_backup') ||
            'Seed phrase does not match the backup. Please check and try again.'
        );
      } else {
        setErrorMessage(
          `Not enough key weight to restore. Total weight on ${matchedAddress} is ${totalWeight}, require ${requiredWeight}.`
        );
      }
    } catch (err) {
      logger.error('EnterSeedPhrase verification failed', err as Error);
      setErrorMessage(
        chrome.i18n.getMessage('Invalid_mnemonic_format') ||
          'Invalid recovery phrase. Please enter a valid 12 or 24 word phrase.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box className="registerBox">
      <Typography variant="h4" sx={{ fontWeight: 700 }} color="neutral.contrastText">
        {chrome.i18n.getMessage('Enter_Recovery_Phrase') || 'Enter Recovery Phrase'}
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mt: 1, mb: 2 }}>
        {chrome.i18n.getMessage('Enter_seed_phrase_to_verify_backup') ||
          'Enter your 12 or 24 word recovery phrase to verify it matches your Google Drive backup.'}
      </Typography>

      <PasswordTextarea
        className="sentry-mask"
        minRows={4}
        placeholder={chrome.i18n.getMessage('Import_12_or_24_words')}
        value={enteredPhrase}
        onChange={(e) => {
          setEnteredPhrase(e.target.value);
          setErrorMessage(null);
        }}
        sx={{ marginBottom: '16px' }}
      />

      {errorMessage && (
        <Box sx={{ mb: 2, width: '100%', maxWidth: '640px' }}>
          <Typography variant="body2" color="error">
            {errorMessage}
          </Typography>
          {debugDetails && (
            <>
              <Button
                variant="text"
                size="small"
                onClick={() => setShowDebug((v) => !v)}
                sx={{ mt: 1, textTransform: 'none' }}
              >
                {showDebug ? 'Hide debug details' : 'Show debug details'}
              </Button>
              {showDebug && (
                <Box sx={{ mt: 1, p: 1.5, borderRadius: 1, bgcolor: 'action.hover' }}>
                  <Typography variant="caption" component="div" sx={{ fontFamily: 'monospace' }}>
                    pubKeyFromGoogleP256: {debugDetails.pubKeyGoogleP256}
                  </Typography>
                  <Typography
                    variant="caption"
                    component="div"
                    sx={{ fontFamily: 'monospace', mt: 0.5 }}
                  >
                    pubKeyFromGoogleSecp256k1: {debugDetails.pubKeyGoogleSecp256k1}
                  </Typography>
                  <Typography
                    variant="caption"
                    component="div"
                    sx={{ fontFamily: 'monospace', mt: 1 }}
                  >
                    pubKeyFromEnteredP256: {debugDetails.pubKeyEnteredP256}
                  </Typography>
                  <Typography
                    variant="caption"
                    component="div"
                    sx={{ fontFamily: 'monospace', mt: 0.5 }}
                  >
                    pubKeyFromEnteredSecp256k1: {debugDetails.pubKeyEnteredSecp256k1}
                  </Typography>
                  <Typography
                    variant="caption"
                    component="div"
                    sx={{ fontFamily: 'monospace', mt: 1 }}
                  >
                    accountsFromGoogle:{' '}
                    {debugDetails.accountsGoogle.map((a) => a.address).join(', ') || '(none)'}
                  </Typography>
                  <Typography
                    variant="caption"
                    component="div"
                    sx={{ fontFamily: 'monospace', mt: 0.5 }}
                  >
                    accountsFromEntered:{' '}
                    {debugDetails.accountsEntered.map((a) => a.address).join(', ') || '(none)'}
                  </Typography>
                  <Typography
                    variant="caption"
                    component="div"
                    sx={{ fontFamily: 'monospace', mt: 1 }}
                  >
                    matchedAddress: {debugDetails.matchedAddress || '(none)'}
                  </Typography>
                  <Typography
                    variant="caption"
                    component="div"
                    sx={{ fontFamily: 'monospace', mt: 0.5 }}
                  >
                    totalWeight: {debugDetails.totalWeight} / {debugDetails.requiredWeight}
                  </Typography>
                </Box>
              )}
            </>
          )}
        </Box>
      )}

      <Box sx={{ flexGrow: 1 }} />
      <Button
        className="registerButton"
        onClick={handleVerify}
        disabled={isLoading || !enteredPhrase.trim()}
        variant="contained"
        color="secondary"
        size="large"
        sx={{
          height: '56px',
          borderRadius: '12px',
          width: '100%',
          maxWidth: '640px',
          textTransform: 'capitalize',
          display: 'flex',
          gap: '12px',
        }}
      >
        {isLoading && <LLSpinner color="secondary" size={28} />}
        <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }} color="background.paper">
          {chrome.i18n.getMessage('Verify_and_Continue') || 'Verify and Continue'}
        </Typography>
      </Button>
    </Box>
  );
};

export default EnterSeedPhrase;
