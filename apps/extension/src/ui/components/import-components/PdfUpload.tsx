import { CloudUpload } from '@mui/icons-material';
import { Button } from '@mui/material';
import * as pdfjsLib from 'pdfjs-dist';
import React, { useState } from 'react';

import { consoleError } from '@/shared/utils';
import { LLSpinner } from '@/ui/components/LLSpinner';
import PdfPasswordDialog from '@/ui/components/PopupModal/pdfPasswordDialog';
import { COLOR_DARKMODE_WHITE_3pc } from '@/ui/style/color';

// Configure PDF.js worker for browser extension
if (typeof window !== 'undefined' && typeof chrome !== 'undefined' && chrome.runtime) {
  try {
    pdfjsLib.GlobalWorkerOptions.workerSrc = chrome.runtime.getURL('pdf.worker.min.mjs');
  } catch (error) {
    consoleError('Failed to set PDF.js worker source:', error);
    pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
      'pdfjs-dist/build/pdf.worker.min.mjs',
      import.meta.url
    ).toString();
  }
}

interface PdfUploadProps {
  onExtracted: (json: string, isEncrypted: boolean, password?: string) => Promise<void>;
  disabled?: boolean;
  buttonText?: string;
}

const PdfUpload = ({ onExtracted, disabled = false, buttonText }: PdfUploadProps) => {
  const [isPdfLoading, setIsPdfLoading] = useState(false);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [pendingPdfFile, setPendingPdfFile] = useState<File | null>(null);
  const [pendingUpdatePassword, setPendingUpdatePassword] = useState<
    ((password: string) => void) | null
  >(null);
  const [pendingPdfPromise, setPendingPdfPromise] = useState<Promise<string | null> | null>(null);
  const [isPasswordIncorrect, setIsPasswordIncorrect] = useState(false);

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

  const extractJsonFromPdf = async (file: File, password?: string): Promise<string | null> => {
    try {
      setIsPdfLoading(true);
      const arrayBuffer = await file.arrayBuffer();
      const typedArray = new Uint8Array(arrayBuffer);

      const loadingTask = pdfjsLib.getDocument({
        data: typedArray,
        ...(password && { password }),
      });

      const pdfPromise = new Promise<string | null>((resolve, reject) => {
        let passwordCallback: ((password: string) => void) | null = null;

        loadingTask.onPassword = (updatePassword: (password: string) => void, reason: number) => {
          passwordCallback = updatePassword;

          if (reason === pdfjsLib.PasswordResponses.NEED_PASSWORD) {
            setPendingPdfFile(file);
            setPendingUpdatePassword(() => (pwd: string) => {
              if (passwordCallback) {
                passwordCallback(pwd);
              }
            });
            setPendingPdfPromise(pdfPromise);
            setIsPasswordIncorrect(false);
            setShowPasswordDialog(true);
            setIsPdfLoading(false);
          } else if (reason === pdfjsLib.PasswordResponses.INCORRECT_PASSWORD) {
            setPendingPdfFile(file);
            setPendingUpdatePassword(() => (pwd: string) => {
              if (passwordCallback) {
                passwordCallback(pwd);
              }
            });
            setPendingPdfPromise(pdfPromise);
            setIsPasswordIncorrect(true);
            setShowPasswordDialog(true);
            setIsPdfLoading(false);
          }
        };

        loadingTask.promise
          .then(async (pdf) => {
            try {
              let extractedText = '';

              for (let i = 1; i <= pdf.numPages; i++) {
                const page = await pdf.getPage(i);
                const textContent = await page.getTextContent();
                const pageText = textContent.items
                  .map((item) => ('str' in item ? item.str : ''))
                  .join(' ');
                extractedText += pageText;
              }

              const jsonMatch = extractedText.match(/\{[\s\S]*\}/);
              if (jsonMatch) {
                const jsonString = jsonMatch[0];
                try {
                  JSON.parse(jsonString);
                  const result = JSON.stringify(JSON.parse(jsonString), null, 2);
                  setIsPdfLoading(false);
                  resolve(result);
                  return;
                } catch {
                  const trimmedText = extractedText.trim();
                  if (hasJsonStructure(trimmedText)) {
                    const result = JSON.stringify(JSON.parse(trimmedText), null, 2);
                    setIsPdfLoading(false);
                    resolve(result);
                    return;
                  }
                }
              }

              const trimmedText = extractedText.trim();
              if (hasJsonStructure(trimmedText)) {
                const result = JSON.stringify(JSON.parse(trimmedText), null, 2);
                setIsPdfLoading(false);
                resolve(result);
              } else {
                setIsPdfLoading(false);
                resolve(null);
              }
            } catch (error) {
              setIsPdfLoading(false);
              reject(error);
            }
          })
          .catch((error) => {
            if (error.name === 'PasswordException') {
              return;
            }
            consoleError('Error extracting JSON from PDF:', error);
            setIsPdfLoading(false);
            reject(error);
          });
      });

      return pdfPromise;
    } catch (error) {
      consoleError('Error extracting JSON from PDF:', error);
      setIsPdfLoading(false);
      return null;
    }
  };

  const handlePasswordSubmit = async (password: string) => {
    if (!pendingUpdatePassword || !pendingPdfPromise) {
      setShowPasswordDialog(false);
      setPendingPdfFile(null);
      setPendingUpdatePassword(null);
      setPendingPdfPromise(null);
      return;
    }

    setShowPasswordDialog(false);
    setIsPdfLoading(true);
    setIsPasswordIncorrect(false);

    try {
      pendingUpdatePassword(password);

      const extractedJson = await Promise.race([
        pendingPdfPromise,
        new Promise<null>((_, reject) =>
          setTimeout(() => reject(new Error('PDF processing timeout')), 30000)
        ),
      ]);

      setPendingPdfFile(null);
      setPendingUpdatePassword(null);
      setPendingPdfPromise(null);
      setIsPasswordIncorrect(false);
      setIsPdfLoading(false);

      if (extractedJson) {
        await onExtracted(extractedJson, true, password);
      }
    } catch (error: any) {
      if (error.name === 'PasswordException' || error.message?.includes('password')) {
        setIsPdfLoading(false);
        return;
      }
      consoleError('Error processing PDF:', error);
      setPendingPdfFile(null);
      setPendingUpdatePassword(null);
      setPendingPdfPromise(null);
      setIsPdfLoading(false);
    }
  };

  const handlePasswordDialogClose = () => {
    setShowPasswordDialog(false);
    setPendingPdfFile(null);
    setPendingUpdatePassword(null);
    setPendingPdfPromise(null);
    setIsPasswordIncorrect(false);
    setIsPdfLoading(false);
  };

  const handlePdfUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    if (file.type !== 'application/pdf') {
      return;
    }

    try {
      const extractedJson = await extractJsonFromPdf(file);
      if (extractedJson) {
        await onExtracted(extractedJson, false);
      }
    } catch (error: any) {
      if (error.name !== 'PasswordException') {
        consoleError('Error processing PDF:', error);
      }
    } finally {
      event.target.value = '';
    }
  };

  return (
    <>
      <input
        accept="application/pdf"
        style={{ display: 'none' }}
        id="pdf-upload-input"
        type="file"
        onChange={handlePdfUpload}
        disabled={isPdfLoading || disabled}
      />
      <label htmlFor="pdf-upload-input">
        <Button
          variant="outlined"
          component="span"
          startIcon={isPdfLoading ? <LLSpinner size={20} /> : <CloudUpload />}
          disabled={isPdfLoading || disabled}
          size="small"
          sx={{
            textTransform: 'capitalize',
            borderRadius: '8px',
            borderColor: COLOR_DARKMODE_WHITE_3pc,
            color: '#fff',
            minWidth: 'auto',
            padding: '4px 12px',
            fontSize: '12px',
            '&:hover': {
              borderColor: COLOR_DARKMODE_WHITE_3pc,
              backgroundColor: COLOR_DARKMODE_WHITE_3pc,
            },
          }}
        >
          {isPdfLoading
            ? chrome.i18n.getMessage('Processing') || 'Processing...'
            : buttonText || chrome.i18n.getMessage('Upload_PDF') || 'Upload PDF'}
        </Button>
      </label>
      <PdfPasswordDialog
        isOpen={showPasswordDialog}
        onClose={handlePasswordDialogClose}
        onSubmit={handlePasswordSubmit}
        isIncorrect={isPasswordIncorrect}
      />
    </>
  );
};

export default PdfUpload;
