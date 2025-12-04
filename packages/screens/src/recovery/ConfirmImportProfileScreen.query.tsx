import { logger } from '@onflow/frw-context';
import type { WalletProfile } from '@onflow/frw-types';
import { YStack, Text, ProfileImportList, Button } from '@onflow/frw-ui';
import React from 'react';
import { useTranslation } from 'react-i18next';

/**
 * ConfirmImportProfileScreen - Shows previously saved profiles for import
 * Allows users to select and restore a profile from device storage
 */

// TODO: Fetch profiles from device storage
// TODO: Use a hook or query to load previously saved profiles
const profiles: WalletProfile[] = [];

export function ConfirmImportProfileScreen(): React.ReactElement {
  const { t } = useTranslation();
  const [isLoading] = React.useState(false);
  // Set first profile as default selected
  const [selectedProfileUid, setSelectedProfileUid] = React.useState<string | undefined>(
    profiles[0]?.uid
  );

  const handleProfilePress = (profile: WalletProfile) => {
    logger.info('[ConfirmImportProfileScreen] Profile selected:', profile);
    setSelectedProfileUid(profile.uid);
    // TODO: Implement profile restoration logic
  };

  const handleAccountPress = (account: any) => {
    logger.info('[ConfirmImportProfileScreen] Account selected:', account);
    // When an account is pressed, we could also select its parent profile
    // For now, just log it
  };

  const handleImportProfile = () => {
    if (!selectedProfileUid) return;

    const selectedProfile = profiles.find((p) => p.uid === selectedProfileUid);
    logger.info('[ConfirmImportProfileScreen] Importing profile:', selectedProfile);
    // TODO: Implement actual profile import/restoration logic
  };

  return (
    <YStack flex={1} bg="$background">
      {/* Header Section */}
      <YStack mt="$8" mb="$6" px="$4" items="center">
        <Text fontSize="$8" fontWeight="700" color="$text" text="center" lineHeight={38}>
          {t('onboarding.confirmImportProfile.title', {
            defaultValue: 'Confirm which profile to import',
          })}
        </Text>
      </YStack>

      {/* Profile List */}
      <YStack flex={1}>
        <ProfileImportList
          profiles={profiles}
          onAccountPress={handleAccountPress}
          onProfilePress={handleProfilePress}
          selectedProfileUid={selectedProfileUid}
          isLoading={isLoading}
          emptyTitle={t('onboarding.confirmImportProfile.emptyTitle', {
            defaultValue: 'No profiles found',
          })}
          emptyMessage={t('onboarding.confirmImportProfile.emptyMessage', {
            defaultValue: 'No previous profiles were found on this device',
          })}
          isMobile={true}
          contentPaddingHorizontal={16}
        />
      </YStack>

      {/* Bottom Button - anchored to bottom */}
      <YStack px="$4" pb="$6">
        <Button
          variant="inverse"
          size="large"
          fullWidth
          disabled={!selectedProfileUid}
          onPress={handleImportProfile}
        >
          {t('onboarding.confirmImportProfile.importButton', {
            defaultValue: 'Import profile',
          })}
        </Button>
      </YStack>
    </YStack>
  );
}
