import CloseIcon from '@mui/icons-material/Close';
import { Box, Button, DialogContent, IconButton, Typography } from '@mui/material';
import React from 'react';

import {
  COLOR_ACCENT_EVM_627EEA,
  COLOR_BLACK_000000,
  COLOR_DARKMODE_BACKGROUND_CARDS_1A1A1A,
  COLOR_DARKMODE_TEXT_PRIMARY_FFFFFF,
  COLOR_GREEN_FLOW_DARKMODE_00EF8B,
} from '@/ui/style/color';

import { CustomDialog } from '../custom-dialog';

interface COAAddressCopyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  address: string;
}

export const COAAddressCopyModal: React.FC<COAAddressCopyModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  address,
}) => {
  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <CustomDialog
      open={isOpen}
      onClose={onClose}
      sx={{ zIndex: 1500 }}
      PaperProps={{ sx: { padding: '0px' } }}
    >
      <Box sx={{ position: 'relative' }}>
        <DialogContent sx={{ padding: '18px', overflow: 'hidden' }}>
          <IconButton
            onClick={onClose}
            sx={{
              position: 'absolute',
              right: 0,
              top: 0,
              color: COLOR_DARKMODE_TEXT_PRIMARY_FFFFFF,
              margin: '14px',
              padding: '4px',
            }}
            aria-label="Close"
          >
            <CloseIcon sx={{ fontSize: '14px' }} />
          </IconButton>
          <Typography
            variant="h6"
            sx={{
              color: COLOR_DARKMODE_TEXT_PRIMARY_FFFFFF,
              fontSize: '20px',
              fontWeight: 700,
              marginBottom: '12px',
              textAlign: 'center',
            }}
          >
            {chrome.i18n.getMessage('EVM__on__Flow__address') || 'EVM on Flow address'}
          </Typography>

          {/* Network Badge */}
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'center',
              marginBottom: '16px',
              gap: 0,
            }}
          >
            <Box
              sx={{
                backgroundColor: COLOR_ACCENT_EVM_627EEA,
                color: COLOR_DARKMODE_TEXT_PRIMARY_FFFFFF,
                padding: '4px 8px',
                borderTopLeftRadius: '16px',
                borderBottomLeftRadius: '16px',
                fontSize: '10px',
                fontWeight: 600,
              }}
            >
              EVM
            </Box>
            <Box
              sx={{
                backgroundColor: COLOR_GREEN_FLOW_DARKMODE_00EF8B,
                color: COLOR_BLACK_000000,
                padding: '4px 8px',
                borderTopRightRadius: '16px',
                borderBottomRightRadius: '16px',
                fontSize: '10px',
                fontWeight: 600,
              }}
            >
              FLOW
            </Box>
          </Box>

          {/* Warning Message */}
          <Typography
            sx={{
              color: COLOR_DARKMODE_TEXT_PRIMARY_FFFFFF,
              fontSize: '14px',
              marginBottom: '16px',
              lineHeight: '20px',
              textAlign: 'center',
            }}
          >
            {chrome.i18n.getMessage('COA__address__copy__warning') ||
              'You have copied an EVM address on the Flow network, please make sure you only send assets on the Flow network to this address otherwise they will be lost.'}
          </Typography>

          {/* Address Display */}
          <Box
            sx={{
              backgroundColor: COLOR_DARKMODE_BACKGROUND_CARDS_1A1A1A,
              borderRadius: '8px',
              padding: '12px',
              marginBottom: '16px',
            }}
          >
            <Typography
              sx={{
                color: COLOR_DARKMODE_TEXT_PRIMARY_FFFFFF,
                fontSize: '14px',
                wordBreak: 'break-all',
                textAlign: 'left',
              }}
            >
              {address}
            </Typography>
          </Box>

          {/* Confirm Button */}
          <Button
            variant="contained"
            onClick={handleConfirm}
            fullWidth
            sx={{
              height: '48px',
              borderRadius: '12px',
              backgroundColor: COLOR_DARKMODE_TEXT_PRIMARY_FFFFFF,
              color: COLOR_BLACK_000000,
              textTransform: 'none',
              fontSize: '14px',
              fontWeight: 600,
              '&:hover': {
                backgroundColor: '#E0E0E0',
              },
            }}
          >
            {chrome.i18n.getMessage('Confirm__to__copy__address') || 'Confirm to copy address'}
          </Button>
        </DialogContent>
      </Box>
    </CustomDialog>
  );
};
