import { Box, Button, TextareaAutosize, Typography } from '@mui/material';
import React, { useState, useRef } from 'react';

import { KEY_TYPE } from '@/shared/constant';
import { type PublicKeyAccount } from '@/shared/types';
import { consoleError } from '@/shared/utils';
import PdfUpload from '@/ui/components/import-components/PdfUpload';
import { LLSpinner } from '@/ui/components/LLSpinner';
import PasswordTextarea from '@/ui/components/password/PasswordTextarea';
import { useWallet } from '@/ui/hooks/use-wallet';
import { COLOR_DARKMODE_WHITE_3pc } from '@/ui/style/color';

const KeyImport = ({
  onOpen,
  onImport,
  setPk,
  isSignLoading,
  onSwitchToKeystoreTab,
  onSetKeystoreJson,
}: {
  onOpen: () => void;
  onImport: (accounts: PublicKeyAccount[]) => void;
  setPk: (pk: string) => void;
  isSignLoading: boolean;
  onSwitchToKeystoreTab?: () => void;
  onSetKeystoreJson?: (json: string) => void;
}) => {
  const usewallet = useWallet();
  const [isLoading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const hasPasswordErrorRef = useRef(false);

  const hasJsonStructure = (str: string): boolean => {
    if (typeof str !== 'string') return false;
    try {
      const result = JSON.parse(str);
      const type = Object.prototype.toString.call(result);
      return type === '[object Object]' || type === '[object Array]';
    } catch {
      return false;
    }
  };

  const handlePdfExtracted = async (
    extractedJson: string,
    isEncrypted: boolean,
    password?: string
  ) => {
    const isFromEncryptedPdf = isEncrypted && !!password;

    if (isFromEncryptedPdf && (!extractedJson || extractedJson.trim().length === 0)) {
      hasPasswordErrorRef.current = true;
      setErrorMessage('Could not extract private key from PDF. The password may be incorrect.');
      setLoading(false);
      return;
    }

    hasPasswordErrorRef.current = false;

    const safeOnOpen = () => {
      if (!isFromEncryptedPdf) {
        onOpen();
      } else {
        setErrorMessage('Could not extract private key from PDF. The password may be incorrect.');
      }
    };

    try {
      setLoading(true);
      setErrorMessage('');

      if (isEncrypted && !password) {
        setErrorMessage('Password is required for encrypted PDF.');
        setLoading(false);
        return;
      }

      let privateKeyHex: string | null = null;

      try {
        const parsedJson = JSON.parse(extractedJson);

        if (parsedJson.private_key) {
          privateKeyHex = parsedJson.private_key;
          if (privateKeyHex && privateKeyHex.startsWith('0x')) {
            privateKeyHex = privateKeyHex.substring(2);
          }
        } else if (isEncrypted && password) {
          privateKeyHex = await usewallet.jsonToPrivateKeyHex(extractedJson, password);
          if (!privateKeyHex || privateKeyHex.trim().length === 0) {
            setErrorMessage(
              'Could not extract private key from PDF. The password may be incorrect.'
            );
            setLoading(false);
            return;
          }
        }
      } catch (parseError) {
        if (isEncrypted && password) {
          try {
            privateKeyHex = await usewallet.jsonToPrivateKeyHex(extractedJson, password);
            if (!privateKeyHex || privateKeyHex.trim().length === 0) {
              setErrorMessage(
                'Could not extract private key from PDF. The password may be incorrect.'
              );
              setLoading(false);
              return;
            }
          } catch (decryptError) {
            setErrorMessage(
              'Could not extract private key from PDF. The password may be incorrect.'
            );
            setLoading(false);
            return;
          }
        } else {
          setErrorMessage('Could not extract valid JSON from PDF.');
          setLoading(false);
          return;
        }
      }

      if (privateKeyHex && privateKeyHex.trim().length > 0) {
        const foundAccounts = await usewallet.findAddressWithPrivateKey(privateKeyHex, '');
        setPk(privateKeyHex);

        if (!foundAccounts || foundAccounts.length === 0) {
          if (isFromEncryptedPdf) {
            setErrorMessage(
              'Could not extract private key from PDF. The password may be incorrect.'
            );
            setLoading(false);
            return;
          }
          safeOnOpen();
          setLoading(false);
          return;
        }

        const accounts: (PublicKeyAccount & { type: string })[] = foundAccounts.map((account) => ({
          ...account,
          type: KEY_TYPE.PRIVATE_KEY,
        }));

        onImport(accounts);
        setLoading(false);
        return;
      }

      if (!isEncrypted) {
        if (hasJsonStructure(extractedJson) && onSwitchToKeystoreTab && onSetKeystoreJson) {
          onSetKeystoreJson(extractedJson);
          onSwitchToKeystoreTab();
        } else {
          setErrorMessage(
            'Could not extract private key from PDF. This appears to be a keystore JSON. Please use the Keystore tab to import it.'
          );
        }
      } else {
        setErrorMessage('Could not extract private key from PDF. The password may be incorrect.');
      }
    } catch (error) {
      consoleError('Error processing PDF JSON:', error);
      if (isEncrypted || isFromEncryptedPdf) {
        setErrorMessage('Could not extract private key from PDF. The password may be incorrect.');
      } else {
        setErrorMessage('Failed to process PDF. Please check the file and try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleImport = async (e) => {
    try {
      setLoading(true);
      e.preventDefault();

      if (errorMessage && errorMessage.includes('password')) {
        setLoading(false);
        return;
      }

      const pk = e.target[0].value.replace(/^0x/, '');
      const flowAddressRegex = /^(0x)?[0-9a-fA-F]{16}$/;
      const inputValue = e.target[2].value;
      setPk(pk);
      const address = flowAddressRegex.test(inputValue) ? inputValue : null;

      const result = await usewallet.findAddressWithPrivateKey(pk, address);

      if (!result || result.length === 0) {
        if (hasPasswordErrorRef.current) {
          setLoading(false);
          return;
        }
        onOpen();
        return;
      }

      const accounts: (PublicKeyAccount & { type: string })[] = result.map((a) => ({
        ...a,
        type: KEY_TYPE.PRIVATE_KEY,
      }));

      onImport(accounts);
    } catch (error) {
      if (hasPasswordErrorRef.current) {
        setLoading(false);
        return;
      }
      onOpen();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ padding: '0' }}>
      <form
        id="seed"
        onSubmit={handleImport}
        style={{ width: '100%', display: 'flex', flexDirection: 'column' }}
      >
        <Box sx={{ marginBottom: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <PasswordTextarea
            className="sentry-mask"
            minRows={2}
            maxRows={2}
            placeholder={chrome.i18n.getMessage('Enter_your_Private_key')}
            aria-label="Private Key"
            required
            sx={{ marginBottom: '0' }}
          />
          <Box sx={{ display: 'flex', justifyContent: 'flex-start' }}>
            <PdfUpload onExtracted={handlePdfExtracted} disabled={isLoading || isSignLoading} />
          </Box>
        </Box>
        <TextareaAutosize
          className="sentry-mask"
          placeholder={chrome.i18n.getMessage('Enter_your_flow_address')}
          style={{
            width: '100%',
            borderRadius: '16px',
            backgroundColor: COLOR_DARKMODE_WHITE_3pc,
            padding: '20px',
            color: '#fff',
            marginBottom: '16px',
            resize: 'none',
            fontSize: '16px',
            fontFamily: 'Inter',
          }}
          defaultValue={''}
        />
        <Button
          className="registerButton"
          variant="contained"
          color="secondary"
          form="seed"
          size="large"
          type="submit"
          sx={{
            height: '56px',
            width: '100%',
            borderRadius: '12px',
            textTransform: 'capitalize',
            gap: '12px',
            display: 'flex',
          }}
          disabled={isLoading || isSignLoading}
        >
          {(isLoading || isSignLoading) && <LLSpinner size={28} />}
          <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }} color="background.paper">
            {chrome.i18n.getMessage('Import')}
          </Typography>
        </Button>
      </form>
      {errorMessage && (
        <Typography sx={{ color: 'error.main', marginTop: '8px', fontSize: '14px' }}>
          {errorMessage}
        </Typography>
      )}
    </Box>
  );
};

export default KeyImport;
