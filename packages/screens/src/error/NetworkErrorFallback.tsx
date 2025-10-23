import { bridge } from '@onflow/frw-context';
import { X, WifiOff } from '@onflow/frw-icons';
import {
  tamaguiConfig,
  IconButton,
  TamaguiProvider,
  YStack,
  XStack,
  ScrollView,
  Button,
  Text,
} from '@onflow/frw-ui';
import React from 'react';
import { useColorScheme } from 'react-native';

import screensI18n from '../lib/i18n';

interface NetworkErrorFallbackProps {
  error: Error;
  resetError: () => void;
}

/**
 * Network error fallback component for connection-related errors
 * Matches GenericErrorFallback design with wifi-off icon
 */
export const NetworkErrorFallback: React.FC<NetworkErrorFallbackProps> = ({
  error,
  resetError,
}) => {
  const colorScheme = useColorScheme();

  const handleClose = () => {
    bridge.closeRN();
  };

  return (
    <TamaguiProvider
      config={tamaguiConfig}
      defaultTheme={colorScheme === 'dark' ? 'dark' : 'light'}
    >
      <YStack flex={1} backgroundColor="$background">
        {/* Header with close button */}
        <XStack
          justifyContent="flex-end"
          alignItems="flex-start"
          paddingTop="$6"
          paddingRight="$1"
          backgroundColor="$background"
        >
          <IconButton
            icon={<X color="#FFFFFF" size={24} />}
            variant="ghost"
            size="medium"
            onPress={handleClose}
          />
        </XStack>

        {/* Main content - centered */}
        <YStack
          flex={1}
          justifyContent="space-between"
          alignItems="center"
          paddingHorizontal="$4"
          paddingBottom="$4"
        >
          <YStack justifyContent="center" alignItems="center" width="304" gap="$3" marginTop="$20">
            {/* Error Icon - Red circle with wifi-off icon */}
            <YStack
              width="$16"
              height="$16"
              borderRadius="$16"
              backgroundColor="$error"
              alignItems="center"
              justifyContent="center"
              marginBottom="$2"
            >
              <WifiOff size={32} color="#FFFFFF" />
            </YStack>

            {/* Error Title */}
            <Text fontSize={16} fontWeight="600" color="$color" textAlign="center">
              {screensI18n.t('errors.network.title')}
            </Text>

            {/* Error Message */}
            <Text fontSize={14} color="$textSecondary" textAlign="center">
              {screensI18n.t('errors.network.message')}
            </Text>

            {/* Error Details - always shown */}
            <YStack
              width="100%"
              height="$40"
              backgroundColor="$bg2"
              borderRadius="$4"
              overflow="hidden"
              marginTop="$4"
            >
              <ScrollView>
                <YStack padding="$4">
                  <Text fontSize={12} fontFamily="monospace" color="$error">
                    {error.message}
                  </Text>
                </YStack>
              </ScrollView>
            </YStack>
          </YStack>

          {/* Retry Button - Bottom anchored */}
          <Button variant="inverse" size="large" onPress={resetError} fullWidth>
            {screensI18n.t('errors.network.button')}
          </Button>
        </YStack>
      </YStack>
    </TamaguiProvider>
  );
};
