import { logger, bridge } from '@onflow/frw-context';
import type { WalletProfile } from '@onflow/frw-types';
import { YStack, Text, ProfileImportList, Button } from '@onflow/frw-ui';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

/**
 * ConfirmImportProfileScreen - Shows previously saved profiles for import
 * Allows users to select and restore a profile from device storage
 */

export function ConfirmImportProfileScreen(): React.ReactElement {
  const { t } = useTranslation();
  const [profiles, setProfiles] = useState<WalletProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isImporting, setIsImporting] = useState(false);
  const [selectedProfileUid, setSelectedProfileUid] = useState<string | undefined>(undefined);

  // Fetch profiles from native bridge on mount
  useEffect(() => {
    const fetchProfiles = async () => {
      try {
        setIsLoading(true);
        const response = await bridge.getWalletProfiles();
        const fetchedProfiles = response?.profiles ?? [];
        setProfiles(fetchedProfiles);
        // Set first profile as default selected
        if (fetchedProfiles.length > 0) {
          setSelectedProfileUid(fetchedProfiles[0].uid);
        }
        logger.debug('[ConfirmImportProfileScreen] Fetched profiles:', fetchedProfiles.length);
      } catch (error) {
        logger.error('[ConfirmImportProfileScreen] Failed to fetch profiles:', error);
        setProfiles([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfiles();
  }, []);

  const handleProfilePress = (profile: WalletProfile) => {
    logger.info('[ConfirmImportProfileScreen] Profile selected:', profile.name);
    setSelectedProfileUid(profile.uid);
  };

  // No action on account press per design - only profile selection is supported
  const handleAccountPress = () => {};

  const handleImportProfile = async () => {
    if (!selectedProfileUid) return;

    const selectedProfile = profiles.find((p) => p.uid === selectedProfileUid);
    if (!selectedProfile) {
      logger.error('[ConfirmImportProfileScreen] Selected profile not found');
      return;
    }

    logger.info('[ConfirmImportProfileScreen] Importing profile:', selectedProfile.name);

    try {
      setIsImporting(true);
      const success = await bridge.switchToProfile?.(selectedProfileUid);

      if (success) {
        logger.info('[ConfirmImportProfileScreen] Profile switch successful');
        // Close the React Native screen and return to native app
        bridge.closeRN?.();
      } else {
        logger.error('[ConfirmImportProfileScreen] Profile switch failed');
      }
    } catch (error) {
      logger.error('[ConfirmImportProfileScreen] Error switching profile:', error);
    } finally {
      setIsImporting(false);
    }
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
          disabled={!selectedProfileUid || isImporting}
          loading={isImporting}
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
