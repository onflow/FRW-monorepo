import { Visibility, VisibilityOff } from '@mui/icons-material';
import {
  Box,
  Button,
  IconButton,
  InputAdornment,
  TextareaAutosize,
  TextField,
  Typography,
} from '@mui/material';
import React, { useState } from 'react';

import { KEY_TYPE } from '@/shared/constant';
import { type PublicKeyAccount } from '@/shared/types';
import { consoleError } from '@/shared/utils';
import PdfUpload from '@/ui/components/import-components/PdfUpload';
import { LLSpinner } from '@/ui/components/LLSpinner';
import PasswordTextarea from '@/ui/components/password/PasswordTextarea';
import ErrorModel from '@/ui/components/PopupModal/errorModel';
import { useWallet } from '@/ui/hooks/use-wallet';
import { COLOR_DARKMODE_WHITE_3pc } from '@/ui/style/color';

const JsonImport = ({
  onOpen,
  onImport,
  setPk,
  isSignLoading,
  initialJson,
}: {
  onOpen: () => void;
  onImport: (accounts: PublicKeyAccount[]) => void;
  setPk: (pk: string) => void;
  isSignLoading: boolean;
  initialJson?: string;
}) => {
  const usewallet = useWallet();
  const [isLoading, setLoading] = useState(false);
  const [json, setJson] = useState(initialJson || '');

  React.useEffect(() => {
    if (initialJson) {
      setJson(initialJson);
      checkJSONImport(initialJson);
    }
  }, [initialJson]);
  const [errorMesssage, setErrorMessage] = useState('');
  const [isVisible, setIsVisible] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isTextareaDragOver, setIsTextareaDragOver] = useState(false);
  const toggleVisibility = () => setIsVisible(!isVisible);

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

  /**
   * Prettifies JSON string with 2-space indentation
   * Returns the original string if prettification fails
   */
  const prettifyJson = (jsonString: string): string => {
    try {
      const parsed = JSON.parse(jsonString);
      return JSON.stringify(parsed, null, 2);
    } catch {
      // If parsing fails, return original string
      return jsonString;
    }
  };

  const handleImport = async (e: React.FormEvent<HTMLFormElement>) => {
    try {
      setLoading(true);
      e.preventDefault();

      const formData = new FormData(e.currentTarget);
      const keystoreInput = formData.get('keystore') as string;
      const passwordInput = formData.get('password') as string;
      const addressInput = formData.get('address') as string;

      if (!checkJSONImport(keystoreInput)) {
        setErrorMessage('JSON not valid');
        return;
      }

      if (!passwordInput) {
        setErrorMessage('Password cannot be empty');
        return;
      }
      let privateKeyHex;
      try {
        privateKeyHex = await usewallet.jsonToPrivateKeyHex(keystoreInput, passwordInput);
        if (!privateKeyHex) {
          setErrorMessage('Password incorrect');
          return;
        }
      } catch (conversionError) {
        consoleError('Error decoding JSON to private key:', conversionError);
        setErrorMessage(
          'Failed to decode JSON to private key. Please check the keystore and password.'
        );
        return;
      }

      const foundAccounts = await usewallet.findAddressWithPrivateKey(privateKeyHex, addressInput);
      setPk(privateKeyHex);

      if (!foundAccounts) {
        onOpen();
        return;
      }

      const accounts: (PublicKeyAccount & { type: string })[] = foundAccounts.map((account) => ({
        ...account,
        type: KEY_TYPE.KEYSTORE,
      }));

      onImport(accounts);
    } catch (error) {
      consoleError('Error during import:', error);
      setErrorMessage('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const checkJSONImport = (event: string): boolean => {
    if (event.length === 0) {
      setJson('');
      setErrorMessage('');
      return false;
    }
    const result = hasJsonStructure(event);
    setErrorMessage(!result ? 'Not a valid json input' : '');

    // Prettify JSON if it's valid
    if (result) {
      const prettified = prettifyJson(event);
      setJson(prettified);
    } else {
      setJson(event);
    }

    return result;
  };

  const handlePdfExtracted = async (
    extractedJson: string,
    isEncrypted: boolean,
    password?: string
  ) => {
    if (isEncrypted && password) {
      try {
        setLoading(true);

        let privateKeyHex: string | null = null;

        try {
          const parsedJson = JSON.parse(extractedJson);

          if (parsedJson.private_key) {
            privateKeyHex = parsedJson.private_key;
            if (privateKeyHex && privateKeyHex.startsWith('0x')) {
              privateKeyHex = privateKeyHex.substring(2);
            }
          } else {
            privateKeyHex = await usewallet.jsonToPrivateKeyHex(extractedJson, password);
          }
        } catch (parseError) {
          privateKeyHex = await usewallet.jsonToPrivateKeyHex(extractedJson, password);
        }

        if (!privateKeyHex) {
          setErrorMessage('Failed to extract private key. The PDF password may be incorrect.');
          setLoading(false);
          return;
        }

        const foundAccounts = await usewallet.findAddressWithPrivateKey(privateKeyHex, '');
        setPk(privateKeyHex);

        if (!foundAccounts || foundAccounts.length === 0) {
          onOpen();
          setLoading(false);
          return;
        }

        const accounts: (PublicKeyAccount & { type: string })[] = foundAccounts.map((account) => ({
          ...account,
          type: KEY_TYPE.KEYSTORE,
        }));

        onImport(accounts);
      } catch (error) {
        consoleError('Error extracting private key from PDF:', error);
        setErrorMessage('Failed to extract private key from PDF. The password may be incorrect.');
      } finally {
        setLoading(false);
      }
    } else {
      setJson(extractedJson);
      checkJSONImport(extractedJson);
    }
  };

  const handleTextFile = async (file: File): Promise<string | null> => {
    try {
      const text = await file.text();
      const trimmedText = text.trim();
      if (hasJsonStructure(trimmedText)) {
        return prettifyJson(trimmedText);
      }
      return null;
    } catch (error) {
      consoleError('Error reading text file:', error);
      return null;
    }
  };

  const handleFile = async (file: File) => {
    if (isLoading || isSignLoading) {
      return;
    }

    // Handle text/JSON files
    if (
      file.type === 'application/json' ||
      file.type === 'text/plain' ||
      file.name.endsWith('.json') ||
      file.name.endsWith('.txt')
    ) {
      const jsonContent = await handleTextFile(file);
      if (jsonContent) {
        setJson(jsonContent);
        checkJSONImport(jsonContent);
      } else {
        setErrorMessage('Could not find valid JSON in the file');
      }
      return;
    }

    setErrorMessage('Please drop a valid PDF or JSON file');
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    if (isLoading || isSignLoading) {
      return;
    }

    const files = Array.from(e.dataTransfer.files);
    const file = files[0];

    if (file) {
      await handleFile(file);
    }
  };

  const handleTextareaDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsTextareaDragOver(true);
  };

  const handleTextareaDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsTextareaDragOver(false);
  };

  const handleTextareaDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsTextareaDragOver(false);

    if (isLoading || isSignLoading) {
      return;
    }

    const files = Array.from(e.dataTransfer.files);
    const file = files[0];

    if (file) {
      await handleFile(file);
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
            minRows={5}
            placeholder={chrome.i18n.getMessage('You_can_import_the')}
            name="keystore"
            value={json}
            onChange={(e) => {
              const newValue = e.target.value;
              setJson(newValue);
              checkJSONImport(newValue);
            }}
            onDragOver={handleTextareaDragOver}
            onDragLeave={handleTextareaDragLeave}
            onDrop={handleTextareaDrop}
            required
            sx={{
              marginBottom: '0',
              border: isTextareaDragOver
                ? `2px dashed ${COLOR_DARKMODE_WHITE_3pc}`
                : '1px solid #767676',
              backgroundColor: isTextareaDragOver ? `${COLOR_DARKMODE_WHITE_3pc}20` : undefined,
              transition: 'all 0.2s ease-in-out',
            }}
          />
          <Box sx={{ display: 'flex', justifyContent: 'flex-start' }}>
            <PdfUpload onExtracted={handlePdfExtracted} disabled={isLoading || isSignLoading} />
          </Box>
        </Box>
        <TextField
          className="sentry-mask"
          required
          placeholder={chrome.i18n.getMessage('Enter_password_for_json_file')}
          type={isVisible ? 'text' : 'password'}
          name="password"
          sx={{
            '& .MuiInputBase-input': {
              padding: '0 20px',
              fontWeight: 400,
            },
          }}
          InputProps={{
            sx: {
              width: '100%',
              borderRadius: '16px',
              backgroundColor: COLOR_DARKMODE_WHITE_3pc,
              padding: '20px 0',
              color: '#fff',
              marginBottom: '16px',
              resize: 'none',
              fontSize: '16px',
              fontFamily: 'Inter',
              fontWeight: 400,
            },
            endAdornment: (
              <InputAdornment position="end" sx={{ paddingRight: '20px' }}>
                <IconButton onClick={toggleVisibility} edge="end">
                  {isVisible ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />

        <TextareaAutosize
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
            fontWeight: 400,
          }}
          defaultValue={''}
          name="address"
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
      {errorMesssage !== '' && (
        <ErrorModel
          isOpen={errorMesssage !== ''}
          onOpenChange={() => {
            setErrorMessage('');
          }}
          errorName={chrome.i18n.getMessage('Error')}
          errorMessage={errorMesssage}
        />
      )}
    </Box>
  );
};

export default JsonImport;
