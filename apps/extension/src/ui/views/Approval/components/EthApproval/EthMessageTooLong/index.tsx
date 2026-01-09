import { Alert, Box, Stack, Typography } from '@mui/material';
import React from 'react';

import { LLPrimaryButton } from '@/ui/components';
import { useApproval } from '@/ui/hooks/use-approval';
import {
  COLOR_DARKMODE_TEXT_PRIMARY_80_FFFFFF80,
  COLOR_WHITE_ALPHA_80_FFFFFFCC,
} from '@/ui/style/color';

interface EthMessageTooLongProps {
  params: {
    method?: string;
    data?: any[];
    session?: {
      origin?: string;
      name?: string;
      icon?: string;
    };
    rawMessage?: string;
    rawMessageLength?: number;
  };
}

const EthMessageTooLong = ({ params }: EthMessageTooLongProps) => {
  const [, , rejectApproval] = useApproval();
  const { session = {}, rawMessage, rawMessageLength, method } = params;
  const { origin, name, icon } = session;

  const handleClose = () => {
    rejectApproval('Message is too long and cannot be signed.');
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        padding: '18px',
        gap: '18px',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
        }}
      >
        {origin && (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px',
              backgroundColor: '#282828',
              borderRadius: '12px',
            }}
          >
            {icon && (
              <img
                src={icon}
                alt={name || origin}
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '16px',
                }}
              />
            )}
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography
                sx={{
                  fontSize: '16px',
                  fontWeight: 600,
                  color: COLOR_WHITE_ALPHA_80_FFFFFFCC,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {name || origin}
              </Typography>
              <Typography
                sx={{
                  fontSize: '12px',
                  color: COLOR_DARKMODE_TEXT_PRIMARY_80_FFFFFF80,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {origin}
              </Typography>
            </Box>
          </Box>
        )}

        <Alert
          severity="warning"
          sx={{
            backgroundColor: '#FDB02226',
            color: '#FDB022',
            borderRadius: '12px',
            '& .MuiAlert-icon': {
              color: '#FDB022',
            },
          }}
        >
          <Typography
            sx={{
              fontSize: '14px',
              fontWeight: 600,
              color: '#FDB022',
              marginBottom: '8px',
            }}
          >
            Message Too Long
          </Typography>
          <Typography
            sx={{
              fontSize: '14px',
              color: '#FDB022',
              lineHeight: '20px',
            }}
          >
            The sign message is too long and cannot be signed. Please contact the dApp developer to
            use a shorter message.
          </Typography>
        </Alert>

        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
          }}
        >
          <Typography
            sx={{
              fontSize: '14px',
              fontWeight: 600,
              color: COLOR_WHITE_ALPHA_80_FFFFFFCC,
            }}
          >
            Raw Message:
          </Typography>
          <Box
            sx={{
              padding: '12px',
              backgroundColor: '#1A1A1A',
              borderRadius: '8px',
              border: '1px solid #333',
              maxHeight: '300px',
              overflow: 'auto',
            }}
          >
            <Typography
              component="pre"
              sx={{
                fontSize: '12px',
                fontFamily: 'monospace',
                color: COLOR_DARKMODE_TEXT_PRIMARY_80_FFFFFF80,
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-all',
                margin: 0,
              }}
            >
              {rawMessage || ''}
            </Typography>
          </Box>
          <Typography
            sx={{
              fontSize: '12px',
              color: COLOR_DARKMODE_TEXT_PRIMARY_80_FFFFFF80,
              fontStyle: 'italic',
            }}
          >
            Message length: {rawMessageLength} characters
          </Typography>
        </Box>
      </Box>

      <Box sx={{ flexGrow: 1 }} />

      <Stack direction="row" spacing={1} sx={{ paddingTop: '18px' }}>
        <LLPrimaryButton
          label={chrome.i18n.getMessage('Close') || 'Close'}
          fullWidth
          onClick={handleClose}
        />
      </Stack>
    </Box>
  );
};

export default EthMessageTooLong;
