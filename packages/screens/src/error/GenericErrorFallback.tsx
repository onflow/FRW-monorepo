import { bridge } from '@onflow/frw-context';
import { X, AlertTriangle } from '@onflow/frw-icons';
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

interface GenericErrorFallbackProps {
  error: Error;
  resetError: () => void;
  onReportBug?: (error: Error) => void;
}

/**
 * Generic error fallback component for React error boundaries
 */
export const GenericErrorFallback: React.FC<GenericErrorFallbackProps> = ({
  error,
  resetError,
  onReportBug,
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
            {/* Error Icon - Red circle with alert triangle */}
            <YStack
              width="$16"
              height="$16"
              borderRadius="$16"
              backgroundColor="$error"
              alignItems="center"
              justifyContent="center"
              marginBottom="$2"
            >
              <AlertTriangle size={32} color="#FFFFFF" />
            </YStack>

            {/* Error Title */}
            <Text fontSize={16} fontWeight="600" color="$color" textAlign="center">
              {screensI18n.t('errors.generic.title')}
            </Text>

            {/* Error Message */}
            <Text fontSize={14} color="$textSecondary" textAlign="center">
              {screensI18n.t('errors.generic.message')}
            </Text>

            {/* Error Details - always shown */}
            <YStack
              width="100%"
              height="$49"
              backgroundColor="$bg2"
              borderRadius="$4"
              overflow="hidden"
              marginTop="$4"
            >
              <ScrollView>
                <YStack padding="$4">
                  <Text fontSize={12} fontFamily="monospace" color="$error" marginBottom="$2">
                    {error.message}
                  </Text>
                  {error.stack && (
                    <Text fontSize={12} fontFamily="monospace" color="$textSecondary">
                      {error.stack}
                    </Text>
                  )}
                </YStack>
              </ScrollView>
            </YStack>
          </YStack>

          {/* Action Buttons - Bottom anchored */}
          <YStack width="100%" gap="$3">
            <Button variant="inverse" size="large" onPress={resetError} fullWidth>
              {screensI18n.t('errors.generic.button')}
            </Button>
            {onReportBug && (
              <Button variant="secondary" size="large" onPress={() => onReportBug(error)} fullWidth>
                {screensI18n.t('errors.generic.reportBug')}
              </Button>
            )}
          </YStack>
        </YStack>
      </YStack>
    </TamaguiProvider>
  );
};
