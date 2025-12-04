import { logger } from '@onflow/frw-context';
import { YStack, Text, useTheme } from '@onflow/frw-ui';
import React from 'react';
import { useTranslation } from 'react-i18next';

/**
 * ConfirmImportProfileScreen - Shows previously saved profiles for import
 * Allows users to select and restore a profile from device storage
 */

export function ConfirmImportProfileScreen(): React.ReactElement {
  const { t } = useTranslation();
  const theme = useTheme();

  const handleSelectProfile = (profileId: string) => {
    logger.info('[ConfirmImportProfileScreen] Profile selected:', profileId);
    // TODO: Implement profile restoration logic
  };

  return (
    <YStack flex={1} bg="$background">
      <YStack flex={1} px="$4" pt="$4">
        {/* Header Section */}
        <YStack mt="$8" mb="$6" items="center">
          <Text fontSize="$8" fontWeight="700" color="$text" text="center" lineHeight={38}>
            {t('onboarding.confirmImportProfile.title', {
              defaultValue: 'Confirm which profile to import',
            })}
          </Text>
        </YStack>

        {/* Profile List - TODO: Implement actual profile cards */}
        <YStack gap="$3" pt="$4">
          <Text color="$text">Previous profiles list will be shown here</Text>
        </YStack>

        {/* Spacer to push content up */}
        <YStack flex={1} />
      </YStack>
    </YStack>
  );
}
