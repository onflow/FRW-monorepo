import { Box, Drawer, Typography } from '@mui/material';
import type { SxProps, Theme } from '@mui/material/styles';
import React from 'react';

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
  importExistingAccount: boolean;
  paperSx?: SxProps<Theme>;
  modalVariant?: 'compact' | 'profile';
  disableCreateAccount?: boolean;
}

const AddAccountPopup = (props: TransferConfirmationProps) => {
  const usewallet = useWallet();
  const isProfileModal = props.modalVariant === 'profile';

  return (
    <Drawer
      anchor="bottom"
      sx={{
        zIndex: '1500 !important',
        ...(isProfileModal
          ? {}
          : {
              '& .MuiDrawer-paper': {
                width: '75%',
                maxWidth: '400px',
                marginRight: 'auto',
                borderTopLeftRadius: '16px',
                borderTopRightRadius: '16px',
                background: 'transparent',
                padding: '18px',
                ...(props.paperSx || {}),
              },
            }),
      }}
      open={props.isConfirmationOpen}
      onClose={props.handleCancelBtnClicked}
      transitionDuration={300}
      slotProps={
        isProfileModal
          ? {
              paper: {
                sx: {
                  width: '100%',
                  height: 'auto',
                  maxHeight: '80%',
                  background: '#121212',
                  borderRadius: '18px 18px 0px 0px',
                  p: 0,
                  pb: 0,
                },
              },
            }
          : undefined
      }
    >
      <Box
        sx={{ display: 'flex', flexDirection: 'column', gap: isProfileModal ? '10px' : 0, pb: 0 }}
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
            mx: isProfileModal ? '18px' : 0,
            mb: 0,
          }}
        >
          <ProfileButton
            icon={createNew}
            text={chrome.i18n.getMessage('Create_a_new_account')}
            onClick={props.addAccount}
            disabled={props.disableCreateAccount}
          />
          {props.importExistingAccount && (
            <Box
              sx={{
                height: '1px',
                width: '100%',
                padding: '1px 16px',
                backgroundColor: 'rgba(255, 255, 255, 0.25)',
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

        {!props.importExistingAccount && !isProfileModal && (
          <Box
            sx={{
              height: '49px',
              width: '100%',
              padding: '1px 16px',
              backgroundColor: 'transparent',
            }}
          />
        )}

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
