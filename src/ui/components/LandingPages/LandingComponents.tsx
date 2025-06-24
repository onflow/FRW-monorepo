import { Box, IconButton, Typography } from '@mui/material';
import React from 'react';

import { LLPinAlert } from '@/ui/components';
import Confetti from '@/ui/components/Confetti';
import BackButtonIcon from '@/ui/components/iconfont/IconBackButton';
import RegisterHeader from '@/ui/components/LandingPages/RegisterHeader';
import SlideLeftRight from '@/ui/components/SlideLeftRight';
import { COLOR_DARKMODE_WHITE_10pc } from '@/ui/style/color';

import { FlowBackgroundSVG } from './flow-background-svg';

const LandingComponents = ({
  activeIndex,
  direction,
  showBackButton,
  onBack,
  children,
  showConfetti,
  showRegisterHeader,
}) => (
  <Box
    sx={{
      display: 'flex',
      flexDirection: 'column',
      background:
        'linear-gradient(122deg, rgba(0, 239, 139, 0.00) 30.91%, hsla(155, 100.00%, 46.90%, 0.20) 99.99%), #000;',
      width: '100%',
      height: '100vh',
      justifyContent: 'center',
      alignItems: 'center',
      overflow: 'hidden',
    }}
  >
    <Box
      sx={{ position: 'absolute', top: 464, right: 0, zIndex: 0 }}
      data-testid="flow-background-svg"
    >
      <FlowBackgroundSVG />
    </Box>
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        height: '100vh',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1,
      }}
    >
      {showConfetti && <Confetti />}
      {showRegisterHeader && <RegisterHeader />}
      <LLPinAlert open={showConfetti} />

      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          width: 744,
          marginTop: '80px',
          height: 'auto',
          transition: 'all .3s ease-in-out',
          borderRadius: '24px',
          boxShadow: '0px 24px 24px rgba(0,0,0,0.36)',
          overflowY: 'auto',
          overflowX: 'hidden',
          backgroundColor: COLOR_DARKMODE_WHITE_10pc,
          zIndex: 1,
        }}
      >
        <Box
          sx={{
            display: 'flex',
            padding: '24px 24px 0px 24px',
          }}
        >
          {showBackButton && (
            <IconButton onClick={onBack} size="small">
              <BackButtonIcon color="#5E5E5E" size={27} />
            </IconButton>
          )}

          <div style={{ flexGrow: 1 }}></div>

          <Typography
            variant="body1"
            sx={{
              color: '#5E5E5E',
              alignSelf: 'end',
              lineHeight: '37px',
              fontWeight: '700',
              fontSize: '16px',
            }}
          >
            {chrome.i18n.getMessage('STEP')} {activeIndex + 1}/6
          </Typography>
        </Box>

        <SlideLeftRight direction={direction === 'left' ? 'left' : 'right'} show={true}>
          {children}
        </SlideLeftRight>
      </Box>

      <Box sx={{ flexGrow: 1 }} />
    </Box>
  </Box>
);

export default LandingComponents;
