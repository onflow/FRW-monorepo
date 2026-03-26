import { Button, Typography } from '@mui/material';
import { Box } from '@mui/system';
import { logger } from '@onflow/frw-context';
import React from 'react';
import { Link } from 'react-router';

import welcomeWallet from '@/ui/assets/svg/welcomeWallet.svg';
import LandingComponents from '@/ui/components/LandingPages/LandingComponents';
import {
  COLOR_DARK_GRAY_1A1A1A,
  COLOR_GREEN_FLOW_DARKMODE_00EF8B,
  COLOR_WHITE_ALPHA_80_FFFFFFCC,
  COLOR_GRADIENT_GREEN_00EF8B_00,
  COLOR_GRADIENT_GREEN_00EF8B_20,
  COLOR_GRADIENT_WHITE_FFFFFF_NEGATIVE_09,
} from '@/ui/style/color';
import { translateToComponents } from '@/ui/utils/i18n-components';
import { TERMS_OF_SERVICE_URL, PRIVACY_POLICY_URL } from '@/ui/utils/url-constants';

const Welcome = () => {
  const loggedI18nKeyRef = React.useRef<Set<string>>(new Set());

  const t = (key: string, fallback: string): string => {
    try {
      const message = chrome?.i18n?.getMessage?.(key);
      if (!message && !loggedI18nKeyRef.current.has(key)) {
        loggedI18nKeyRef.current.add(key);
        logger.warn('[Welcome] Missing i18n message key, using fallback', key);
      }
      return message || fallback;
    } catch (error) {
      if (!loggedI18nKeyRef.current.has(key)) {
        loggedI18nKeyRef.current.add(key);
        logger.error('[Welcome] Failed to read i18n message key, using fallback', key, error);
      }
      return fallback;
    }
  };

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
        className="welcome-box"
        sx={{
          px: '36px',
          background: `linear-gradient(283deg, ${COLOR_GRADIENT_GREEN_00EF8B_00} 9.38%, ${COLOR_GRADIENT_GREEN_00EF8B_20} 92.07%), ${COLOR_GRADIENT_WHITE_FFFFFF_NEGATIVE_09}`,
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
            {t('Get_Started_with_Flow_wallet', 'Get started with Flow Wallet')}
          </Typography>

          <Typography
            sx={{
              fontWeight: '400',
              fontSize: '16px',
              lineHeight: '120%',
              color: COLOR_WHITE_ALPHA_80_FFFFFFCC,
            }}
          >
            {t('Welcome_to_Flow_Wallet', 'Welcome to Flow Wallet')}
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
            {t('Create_an_account_to_get_started', 'Create an account to get started')}
          </Typography>

          <Button
            variant="contained"
            color="primary"
            component={Link}
            to="/welcome/register"
            size="large"
            data-testid="create-account-button"
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
              {t('Create_a_new_account', 'Create a new account')}
            </Typography>
          </Button>

          <Button
            variant="contained"
            color="secondary"
            component={Link}
            to="/welcome/importprofile"
            size="large"
            data-testid="recover-account-button"
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
              {t('I_already_have_an_account', 'I already have an account')}
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
            {translateToComponents('legal_text', {
              termslink: ({ children }) => (
                <Link
                  to={TERMS_OF_SERVICE_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    color: COLOR_GREEN_FLOW_DARKMODE_00EF8B,
                    textDecoration: 'none',
                  }}
                >
                  {children}
                </Link>
              ),
              privacylink: ({ children }) => (
                <Link
                  to={PRIVACY_POLICY_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    color: COLOR_GREEN_FLOW_DARKMODE_00EF8B,
                    textDecoration: 'none',
                  }}
                >
                  {children}
                </Link>
              ),
            })}
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
            {t('A_crypto_wallet_on_Flow', 'A crypto wallet on Flow')}{' '}
            <Box component="span" sx={{ color: 'primary.light' }}>
              {t('Explorers_Collectors_and_Gamers', 'for explorers, collectors, and gamers')}
            </Box>
          </Typography>
        </Box>
      </Box>
    </LandingComponents>
  );
};

export default Welcome;
