import { Button, Typography } from '@mui/material';
import { Box } from '@mui/system';
import React from 'react';
import { Link } from 'react-router';

import welcomeWallet from '@/ui/assets/svg/welcomeWallet.svg';
import LandingComponents from '@/ui/components/LandingPages/LandingComponents';
import {
  COLOR_DARK_GRAY_1A1A1A,
  COLOR_GREEN_FLOW_DARKMODE_00EF8B,
  COLOR_WHITE_ALPHA_80_FFFFFFCC,
} from '@/ui/style/color';

const Welcome = () => {
  return (
    <LandingComponents
      activeIndex={0}
      direction="right"
      showBackButton={false}
      onBack={() => {}}
      showConfetti={false}
      showRegisterHeader={true}
      showSteps={false}
    >
      <Box
        sx={{
          px: '36px',
          background:
            'linear-gradient(283deg, rgba(0, 239, 139, 0.00) 9.38%, rgba(0, 239, 139, 0.20) 92.07%), rgba(255, 255, 255, -0.09)',
          height: '464px',
          position: 'relative',
          borderRadius: '24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
          }}
        >
          <Typography
            variant="h4"
            sx={{
              fontWeight: '700',
              fontSize: '40px',
              lineHeight: '120%',
              width: '363px',
            }}
          >
            {chrome.i18n.getMessage('Get_Started_with_Flow_wallet')}
          </Typography>

          <Typography
            sx={{
              fontWeight: '400',
              fontSize: '16px',
              lineHeight: '120%',
              color: COLOR_WHITE_ALPHA_80_FFFFFFCC,
            }}
          >
            {chrome.i18n.getMessage('Welcome_to_Flow_Wallet')}
          </Typography>

          <Typography
            sx={{
              fontWeight: '400',
              fontSize: '16px',
              lineHeight: '120%',
              color: COLOR_WHITE_ALPHA_80_FFFFFFCC,
              mt: '-12px',
              mb: '14px',
            }}
          >
            {chrome.i18n.getMessage('Create_an_account_to_get_started')}
          </Typography>

          <Button
            variant="contained"
            color="primary"
            component={Link}
            to="/welcome/register"
            size="large"
            sx={{
              display: 'flex',
              alignItems: 'center',
              width: '297px',
              height: '52px',
              borderRadius: '16px',
              textTransform: 'capitalize',
            }}
          >
            <Typography
              variant="subtitle1"
              sx={{ fontWeight: '600', fontSize: '14px', textAlign: 'center' }}
              color="primary.contrastText"
            >
              {chrome.i18n.getMessage('Create_a_new_account')}
            </Typography>
          </Button>

          <Button
            variant="contained"
            color="secondary"
            component={Link}
            to="/welcome/RecoverProfile"
            size="large"
            sx={{
              display: 'flex',
              width: '297px',
              height: '52px',
              borderRadius: '16px',
              alignItems: 'center',
              justifyContent: 'center',
              textTransform: 'capitalize',
              border: `1px solid ${COLOR_GREEN_FLOW_DARKMODE_00EF8B}`,
              backgroundColor: 'transparent',
              flexDirection: 'column',
              '&:hover': {
                backgroundColor: COLOR_GREEN_FLOW_DARKMODE_00EF8B,
                opacity: 0.8,
                color: COLOR_DARK_GRAY_1A1A1A,
              },
            }}
          >
            <Typography
              variant="subtitle1"
              sx={{
                fontWeight: '600',
                fontSize: '14px',
                color: '#FFF',
                textAlign: 'center',
              }}
            >
              {chrome.i18n.getMessage('I_already_have_an_account')}
            </Typography>
          </Button>

          <Typography
            sx={{
              textAlign: 'center',
              color: COLOR_WHITE_ALPHA_80_FFFFFFCC,
              fontSize: '12px',
              lineHeight: '140%',
              fontWeight: '400',
              width: '297px',
              '& a': {
                cursor: 'pointer',
              },
            }}
          >
            {chrome.i18n.getMessage('By_using_Flow_Wallet_you_agree_to_the')}{' '}
            <a
              href="https://lilico.app/about/terms"
              target="_blank"
              style={{
                color: COLOR_GREEN_FLOW_DARKMODE_00EF8B,
                textDecoration: 'none',
              }}
            >
              {chrome.i18n.getMessage('Terms__of__Service')}
            </a>{' '}
            {chrome.i18n.getMessage('and')}{' '}
            <a
              href="https://lilico.app/about/privacy-policy"
              target="_blank"
              style={{
                color: COLOR_GREEN_FLOW_DARKMODE_00EF8B,
                textDecoration: 'none',
              }}
            >
              {chrome.i18n.getMessage('Privacy__Policy')}
            </a>
          </Typography>
        </Box>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: '62px',
            padding: '88px 0 61px',
            alignItems: 'center',
          }}
        >
          <img
            src={welcomeWallet}
            style={{
              borderRadius: '24px',
              width: '170px',
            }}
          />

          <Typography
            variant="body1"
            sx={{
              color: 'text.secondary',
              pt: '16px',
              fontSize: '16px',
              textAlign: 'center',
              fontWeight: '400',
            }}
          >
            {chrome.i18n.getMessage('A_crypto_wallet_on_Flow')}{' '}
            <Box component="span" sx={{ color: 'primary.light' }}>
              {chrome.i18n.getMessage('Explorers_Collectors_and_Gamers')}
            </Box>
          </Typography>
        </Box>
      </Box>
    </LandingComponents>
  );
};

export default Welcome;
