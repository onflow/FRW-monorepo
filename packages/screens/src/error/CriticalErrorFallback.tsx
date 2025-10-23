import { bridge } from '@onflow/frw-context';
import { X, WarningOctagonFill } from '@onflow/frw-icons';
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

interface CriticalErrorFallbackProps {
  error: Error;
  resetError: () => void;
}

/**
 * Critical error fallback component for severe app errors
 * Matches GenericErrorFallback design with red warning octagon icon
 */
export const CriticalErrorFallback: React.FC<CriticalErrorFallbackProps> = ({
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
      <YStack flex={1} backgroundColor="$inverseBg">
        {/* Header with close button */}
        <XStack
          justifyContent="space-between"
          alignItems="center"
          paddingTop="$12"
          paddingBottom="$2.5"
          paddingHorizontal="$4.5"
          backgroundColor="$inverseBg"
        >
          <YStack width="$11" />
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
          <YStack flex={1} justifyContent="center" alignItems="center" width="304" gap="$3">
            {/* Error Icon - Red circle with warning octagon */}
            <YStack
              width="$16"
              height="$16"
              borderRadius="1000"
              backgroundColor="$error"
              alignItems="center"
              justifyContent="center"
              marginBottom="$2"
            >
              <WarningOctagonFill size={32} color="#FFFFFF" />
            </YStack>

            {/* Error Title */}
            <Text fontSize={16} fontWeight="600" color="$inverseText" textAlign="center">
              {screensI18n.t('errors.critical.title')}
            </Text>

            {/* Error Message */}
            <Text fontSize={14} color="$textSecondary" textAlign="center">
              {screensI18n.t('errors.critical.message')}
            </Text>

            {/* Error Details (only in development) */}
            {__DEV__ && (
              <YStack
                width="100%"
                height="337"
                backgroundColor="$bg2"
                borderRadius="$4"
                overflow="hidden"
                marginTop="$4"
              >
                <ScrollView height="300">
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
            )}
          </YStack>

          {/* Restart Button - Bottom anchored, red for critical */}
          <YStack width="100%">
            <Button
              height="$12"
              backgroundColor="$error"
              borderRadius="$4"
              onPress={resetError}
              pressStyle={{ opacity: 0.9 }}
            >
              <Text fontSize={16} fontWeight="600" color="#FFFFFF">
                {screensI18n.t('errors.critical.button')}
              </Text>
            </Button>
          </YStack>
        </YStack>
      </YStack>
    </TamaguiProvider>
  );
};
