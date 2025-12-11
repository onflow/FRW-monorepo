import { CloudUpload, Visibility, VisibilityOff } from '@mui/icons-material';
import {
  Box,
  Button,
  IconButton,
  InputAdornment,
  TextareaAutosize,
  TextField,
  Typography,
} from '@mui/material';
import * as pdfjsLib from 'pdfjs-dist';
import React, { useState } from 'react';

import { KEY_TYPE } from '@/shared/constant';
import { type PublicKeyAccount } from '@/shared/types';
import { consoleError } from '@/shared/utils';
import { LLSpinner } from '@/ui/components/LLSpinner';
import PasswordTextarea from '@/ui/components/password/PasswordTextarea';
import ErrorModel from '@/ui/components/PopupModal/errorModel';
import { useWallet } from '@/ui/hooks/use-wallet';
import { COLOR_DARKMODE_WHITE_3pc } from '@/ui/style/color';

// Configure PDF.js worker for browser extension
// Use chrome.runtime.getURL() to get the correct path to the bundled worker file
if (typeof window !== 'undefined' && typeof chrome !== 'undefined' && chrome.runtime) {
  try {
    // Use the extension's bundled worker file (copied by webpack)
    pdfjsLib.GlobalWorkerOptions.workerSrc = chrome.runtime.getURL('pdf.worker.min.mjs');
  } catch (error) {
    consoleError('Failed to set PDF.js worker source:', error);
    // Fallback: try to use a relative path (may not work in extension context)
    pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
      'pdfjs-dist/build/pdf.worker.min.mjs',
      import.meta.url
    ).toString();
  }
}

const JsonImport = ({
  onOpen,
  onImport,
  setPk,
  isSignLoading,
}: {
  onOpen: () => void;
  onImport: (accounts: PublicKeyAccount[]) => void;
  setPk: (pk: string) => void;
  isSignLoading: boolean;
}) => {
  const usewallet = useWallet();
  const [isLoading, setLoading] = useState(false);
  const [json, setJson] = useState('');
  const [errorMesssage, setErrorMessage] = useState('');
  const [isVisible, setIsVisible] = useState(false);
  const [isPdfLoading, setIsPdfLoading] = useState(false);
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

  const extractJsonFromPdf = async (file: File): Promise<string | null> => {
    try {
      setIsPdfLoading(true);
      const arrayBuffer = await file.arrayBuffer();
      const typedArray = new Uint8Array(arrayBuffer);

      const pdf = await pdfjsLib.getDocument({ data: typedArray }).promise;
      let extractedText = '';

      // Extract text from all pages
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map((item) => ('str' in item ? item.str : '')).join(' ');
        extractedText += pageText;
      }

      // Try to find JSON in the extracted text
      // Look for JSON object pattern (starts with { and ends with })
      const jsonMatch = extractedText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const jsonString = jsonMatch[0];
        // Validate it's valid JSON
        try {
          JSON.parse(jsonString);
          // Prettify the JSON before returning
          return JSON.stringify(JSON.parse(jsonString), null, 2);
        } catch {
          // If the matched string isn't valid JSON, try the whole text
          const trimmedText = extractedText.trim();
          if (hasJsonStructure(trimmedText)) {
            return JSON.stringify(JSON.parse(trimmedText), null, 2);
          }
        }
      }

      // If no JSON pattern found, check if the whole text is JSON
      const trimmedText = extractedText.trim();
      if (hasJsonStructure(trimmedText)) {
        return JSON.stringify(JSON.parse(trimmedText), null, 2);
      }

      return null;
    } catch (error) {
      consoleError('Error extracting JSON from PDF:', error);
      return null;
    } finally {
      setIsPdfLoading(false);
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

  const handlePdfFile = async (file: File) => {
    if (file.type !== 'application/pdf') {
      setErrorMessage('Please select a valid PDF file');
      return;
    }

    const extractedJson = await extractJsonFromPdf(file);
    if (extractedJson) {
      setJson(extractedJson);
      checkJSONImport(extractedJson);
    } else {
      setErrorMessage('Could not find valid JSON in the PDF file');
    }
  };

  const handleFile = async (file: File) => {
    if (isPdfLoading || isLoading || isSignLoading) {
      return;
    }

    // Handle PDF files
    if (file.type === 'application/pdf') {
      await handlePdfFile(file);
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

  const handlePdfUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    await handleFile(file);
    // Clear the file input so the same file can be selected again
    event.target.value = '';
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

    if (isPdfLoading || isLoading || isSignLoading) {
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

    if (isPdfLoading || isLoading || isSignLoading) {
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
          <Box
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: isDragOver ? '12px' : '0',
              borderRadius: '12px',
              border: isDragOver
                ? `2px dashed ${COLOR_DARKMODE_WHITE_3pc}`
                : '2px dashed transparent',
              backgroundColor: isDragOver ? `${COLOR_DARKMODE_WHITE_3pc}20` : 'transparent',
              transition: 'all 0.2s ease-in-out',
            }}
          >
            <input
              accept="application/pdf"
              style={{ display: 'none' }}
              id="pdf-upload-input"
              type="file"
              onChange={handlePdfUpload}
              disabled={isPdfLoading || isLoading || isSignLoading}
            />
            <label htmlFor="pdf-upload-input">
              <Button
                variant="outlined"
                component="span"
                startIcon={isPdfLoading ? <LLSpinner size={20} /> : <CloudUpload />}
                disabled={isPdfLoading || isLoading || isSignLoading}
                sx={{
                  textTransform: 'capitalize',
                  borderRadius: '12px',
                  borderColor: COLOR_DARKMODE_WHITE_3pc,
                  color: '#fff',
                  '&:hover': {
                    borderColor: COLOR_DARKMODE_WHITE_3pc,
                    backgroundColor: COLOR_DARKMODE_WHITE_3pc,
                  },
                }}
              >
                {isPdfLoading
                  ? chrome.i18n.getMessage('Processing') || 'Processing...'
                  : chrome.i18n.getMessage('Upload_PDF') || 'Upload PDF'}
              </Button>
            </label>
            {isDragOver && (
              <Typography
                variant="body2"
                sx={{
                  color: '#fff',
                  fontSize: '14px',
                  fontFamily: 'Inter',
                }}
              >
                Drop PDF file here
              </Typography>
            )}
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
