import { Alert, Box, Button, Typography } from '@mui/material';
import type { BloctoDetectionResult } from '@onflow/frw-types';
import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router';

import { usePlatform } from '@/bridge/PlatformContext';

interface AccountMigrationBannerProps {
  address?: string;
  onDismiss?: () => void;
}

const AccountMigrationBanner: React.FC<AccountMigrationBannerProps> = ({ address, onDismiss }) => {
  const { platform } = usePlatform();
  const navigate = useNavigate();
  const [detection, setDetection] = useState<BloctoDetectionResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDismissed, setIsDismissed] = useState(false);

  const checkMigrationNeeded = useCallback(async () => {
    try {
      setIsLoading(true);
      const result = await platform.checkKeyRotationNeeded(address);
      setDetection(result);
    } catch (error) {
      console.error('Failed to check key rotation:', error);
      setDetection(null);
    } finally {
      setIsLoading(false);
    }
  }, [platform, address]);

  useEffect(() => {
    checkMigrationNeeded();
  }, [checkMigrationNeeded]);

  const handleDismiss = () => {
    setIsDismissed(true);
    onDismiss?.();
  };

  const handleStartMigration = () => {
    // Navigate to key list page where migration can be initiated
    navigate('/dashboard/nested/keylist?address=' + (address || ''));
  };

  // Don't show if loading, dismissed, or no migration needed
  if (isLoading || isDismissed || !detection?.isBloctoKey) {
    return null;
  }

  return (
    <Box
      sx={{
        margin: '16px 18px',
        borderRadius: '16px',
        overflow: 'hidden',
      }}
    >
      <Alert
        severity="warning"
        onClose={handleDismiss}
        sx={{
          backgroundColor: '#FF980029', // Warning color with transparency
          border: '1px solid #FF9800',
          borderRadius: '16px',
          '& .MuiAlert-icon': {
            color: '#FF9800',
          },
          '& .MuiAlert-message': {
            width: '100%',
            padding: '0',
          },
        }}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            padding: '4px 0',
          }}
        >
          <Typography
            sx={{
              color: '#FFFFFF',
              fontSize: '14px',
              fontWeight: 600,
              lineHeight: '1.5',
            }}
          >
            Account Migration Required
          </Typography>
          <Typography
            sx={{
              color: '#BABABA',
              fontSize: '12px',
              lineHeight: '1.5',
            }}
          >
            Your account contains Blocto keys that need to be rotated for security. Please migrate
            your account keys to continue using your wallet safely.
          </Typography>
          <Button
            variant="contained"
            color="warning"
            onClick={handleStartMigration}
            sx={{
              marginTop: '8px',
              textTransform: 'capitalize',
              borderRadius: '8px',
              fontWeight: 600,
              fontSize: '14px',
              height: '40px',
            }}
          >
            Start Migration
          </Button>
        </Box>
      </Alert>
    </Box>
  );
};

export default AccountMigrationBanner;
