import { Button, Typography } from '@mui/material';
import React from 'react';
import { useNavigate } from 'react-router';

import { CustomDialog } from '../custom-dialog';

const ErrorModel = ({
  isOpen,
  onOpenChange,
  errorName,
  errorMessage,
  isGoback = false,
  customAction = undefined,
  customActionText = '',
  onCustomAction = undefined,
}: {
  isOpen: boolean;
  onOpenChange: (value: boolean) => void;
  errorName: string;
  errorMessage: string;
  isGoback?: boolean;
  customAction?: boolean | undefined;
  customActionText?: string;
  onCustomAction?: (() => void) | undefined;
}) => {
  const navigate = useNavigate();

  const handleSubmit = () => {
    navigate(-1);
  };

  return (
    <CustomDialog open={isOpen} onClose={() => onOpenChange(true)}>
      <Typography sx={{ color: 'testnet.main', fontSize: '24px', fontWeight: '700' }}>
        {errorName}
      </Typography>
      <Typography sx={{ color: '#BABABA', margin: '20px 0 40px', fontSize: '16px' }}>
        {errorMessage}
      </Typography>
      <Button
        className="registerButton"
        variant="contained"
        color="secondary"
        form="seed"
        size="large"
        onClick={() => onOpenChange(true)}
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
          {chrome.i18n.getMessage('OK')}
        </Typography>
      </Button>
      {customAction && (
        <Button
          className="registerButton"
          variant="contained"
          color="secondary"
          form="seed"
          size="large"
          onClick={() => onCustomAction?.()}
          sx={{
            height: '56px',
            width: '100%',
            borderRadius: '12px',
            textTransform: 'capitalize',
            gap: '12px',
            display: 'flex',
            marginTop: '8px',
          }}
        >
          <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }} color="background.paper">
            {customActionText}
          </Typography>
        </Button>
      )}
      {isGoback && (
        <Button
          className="registerButton"
          variant="contained"
          color="info"
          form="seed"
          size="large"
          onClick={() => handleSubmit()}
          sx={{
            height: '56px',
            width: '100%',
            borderRadius: '12px',
            textTransform: 'capitalize',
            gap: '12px',
            display: 'flex',
            marginTop: '8px',
          }}
        >
          <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }} color="background">
            {chrome.i18n.getMessage('Back')}
          </Typography>
        </Button>
      )}
    </CustomDialog>
  );
};

export default ErrorModel;
