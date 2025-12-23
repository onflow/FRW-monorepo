import { Visibility, VisibilityOff } from '@mui/icons-material';
import {
  Typography,
  Button,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  InputAdornment,
  IconButton,
} from '@mui/material';
import React, { useState } from 'react';

import { COLOR_DARKMODE_WHITE_3pc } from '@/ui/style/color';

import { CustomDialog } from '../custom-dialog';

interface PdfPasswordDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (password: string) => void;
  isIncorrect?: boolean;
  title?: string;
  message?: string;
  placeholder?: string;
  incorrectMessage?: string;
}

const PdfPasswordDialog = ({
  isOpen,
  onClose,
  onSubmit,
  isIncorrect = false,
  title,
  message,
  placeholder,
  incorrectMessage,
}: PdfPasswordDialogProps) => {
  const [password, setPassword] = useState('');
  const [isVisible, setIsVisible] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password.trim()) {
      onSubmit(password);
      setPassword('');
    }
  };

  const handleClose = () => {
    setPassword('');
    setIsVisible(false);
    onClose();
  };

  const toggleVisibility = () => setIsVisible(!isVisible);

  return (
    <CustomDialog open={isOpen} onClose={handleClose} sx={{ zIndex: 1500 }}>
      <DialogTitle sx={{ color: 'testnet.main', fontSize: '24px', fontWeight: '700' }}>
        {title || chrome.i18n.getMessage('PDF_Password_Required') || 'PDF Password Required'}
      </DialogTitle>
      <DialogContent sx={{ overflow: 'hidden' }}>
        <Typography sx={{ color: '#BABABA', margin: '20px 0 20px', fontSize: '16px' }}>
          {isIncorrect
            ? incorrectMessage ||
              chrome.i18n.getMessage('Incorrect_PDF_Password') ||
              'Incorrect password. Please try again.'
            : message ||
              chrome.i18n.getMessage('Enter_PDF_Password') ||
              'This PDF is password-protected. Please enter the password to continue.'}
        </Typography>
        <form id="pdf-password" onSubmit={handleSubmit}>
          <TextField
            className="sentry-mask"
            required
            placeholder={
              placeholder ||
              chrome.i18n.getMessage('Enter_PDF_Password_Placeholder') ||
              'Enter PDF password'
            }
            type={isVisible ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoFocus
            error={isIncorrect}
            sx={{
              width: '100%',
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
        </form>
      </DialogContent>
      <DialogActions sx={{ display: 'flex', flexDirection: 'column' }}>
        <Button
          className="registerButton"
          variant="contained"
          color="secondary"
          form="pdf-password"
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
        >
          <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }} color="background.paper">
            {chrome.i18n.getMessage('Submit') || 'Submit'}
          </Typography>
        </Button>
        <Button
          onClick={handleClose}
          sx={{
            cursor: 'pointer',
            textAlign: 'center',
            backgroundColor: 'transparent',
            height: '56px',
            borderRadius: '12px',
            textTransform: 'capitalize',
            marginTop: '8px',
          }}
        >
          <Typography variant="subtitle1" color="#E6E6E6" sx={{ fontWeight: 'bold' }}>
            {chrome.i18n.getMessage('Cancel') || 'Cancel'}
          </Typography>
        </Button>
      </DialogActions>
    </CustomDialog>
  );
};

export default PdfPasswordDialog;
