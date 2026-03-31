import { Box, Drawer, Typography } from '@mui/material';
import type { SxProps, Theme } from '@mui/material/styles';
import React from 'react';

import createEoa from '@/ui/assets/svg/create-eoa.svg';
import createNew from '@/ui/assets/svg/create-new.svg';
import importExisting from '@/ui/assets/svg/import-existing.svg';
import { ProfileButton } from '@/ui/components/profile/profile-button';
import { useWallet } from '@/ui/hooks/use-wallet';

interface TransferConfirmationProps {
  isConfirmationOpen: boolean;
  handleCloseIconClicked: () => void;
  handleCancelBtnClicked: () => void;
  handleAddBtnClicked: () => void;
  addAccount: () => Promise<void>;
  addEoaAddress?: () => Promise<void>;
  importExistingAccount: boolean;
  paperSx?: SxProps<Theme>;
  modalVariant?: 'compact' | 'profile';
  disableCreateAccount?: boolean;
  disableAddEoaAddress?: boolean;
}

const AddAccountPopup = (props: TransferConfirmationProps) => {
  const usewallet = useWallet();
  const isProfileModal = props.modalVariant === 'profile';

  return (
    <Drawer
      anchor="bottom"
      sx={{
        zIndex: '1500 !important',
      }}
      open={props.isConfirmationOpen}
      onClose={props.handleCancelBtnClicked}
      transitionDuration={300}
      slotProps={{
        paper: {
          sx: {
            width: '100%',
            height: 'auto',
            maxHeight: '80%',
            background: 'var(--Drawer, #121212)',
            borderRadius: '32px 32px 0 0',
            p: 0,
            pb: 0,
            ...(props.paperSx || {}),
          },
        },
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: isProfileModal ? '10px' : 0,
          pb: 0,
          p: '20px 18px 18px 18px',
        }}
      >
        {isProfileModal && (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              width: '100%',
              margin: '12px 0 9px',
              alignItems: 'center',
              px: '20px',
              gap: '24px',
            }}
          >
            <Box
              sx={{
                borderRadius: '100px',
                background: 'rgba(217, 217, 217, 0.10)',
                width: '54px',
                height: '4px',
              }}
            />
            <Typography
              variant="body1"
              component="div"
              display="inline"
              color="text"
              sx={{ fontSize: '18px', textAlign: 'center', lineHeight: '24px', fontWeight: '700' }}
            >
              {chrome.i18n.getMessage('Add_Account_Sidebar') || 'Add Account'}
            </Typography>
          </Box>
        )}

        <Box
          sx={{
            justifyContent: 'space-between',
            alignItems: 'center',
            flexDirection: 'column',
            display: 'flex',
            borderRadius: '16px',
            background: '#2A2A2A',
            overflow: 'hidden',
            mx: 0,
            mb: 0,
          }}
        >
          <ProfileButton
            icon={createNew}
            text={
              chrome.i18n.getMessage('Create_Flow_Address_Sidebar') ||
              'Create a new Flow Cadence account'
            }
            onClick={props.addAccount}
            disabled={props.disableCreateAccount}
          />
          {props.addEoaAddress && (
            <Box
              sx={{
                height: '1px',
                width: 'calc(100% - 32px)',
                mx: '16px',
                backgroundColor: 'rgba(255, 255, 255, 0.12)',
              }}
            />
          )}
          {props.addEoaAddress && (
            <ProfileButton
              icon={createEoa}
              text={
                chrome.i18n.getMessage('Create_EOA_Address_Sidebar') ||
                'Create a new Flow EVM Account'
              }
              dataTestId="add-eoa-address-button"
              onClick={props.addEoaAddress}
              disabled={props.disableAddEoaAddress}
            />
          )}
          {props.importExistingAccount && (
            <Box
              sx={{
                height: '1px',
                width: 'calc(100% - 32px)',
                mx: '16px',
                backgroundColor: 'rgba(255, 255, 255, 0.12)',
              }}
            />
          )}

          {props.importExistingAccount && (
            <ProfileButton
              icon={importExisting}
              text={chrome.i18n.getMessage('Import_an_existing_account')}
              dataTestId="import-existing-account-button"
              onClick={async () => await usewallet.lockAdd()}
            />
          )}
        </Box>

        {isProfileModal && (
          <Box
            sx={{
              mx: '18px',
              mt: '10px',
              mb: '35px',
            }}
          />
        )}
      </Box>
    </Drawer>
  );
};

export default AddAccountPopup;
