import { logger } from '@onflow/frw-context';
import type { WalletProfile } from '@onflow/frw-types';
import { YStack, Text, useTheme, ProfileImportList, Button } from '@onflow/frw-ui';
import React from 'react';
import { useTranslation } from 'react-i18next';

/**
 * ConfirmImportProfileScreen - Shows previously saved profiles for import
 * Allows users to select and restore a profile from device storage
 */

// Mock data - TODO: Replace with actual data from device storage
const mockProfiles: WalletProfile[] = [
  {
    uid: 'profile-1',
    name: 'Nick Name',
    avatar: '👤',
    accounts: [
      {
        id: 'account-1',
        address: '0x1234567890abcdef',
        name: 'Main Account',
        emojiInfo: { emoji: '🦊', name: 'Fox', color: '#FF6B35' },
        type: 'main',
        balance: '1,234.56 FLOW',
        isActive: true,
      },
      {
        id: 'account-2',
        address: '0xabcdef1234567890',
        name: 'Linked Account',
        emojiInfo: { emoji: '🐼', name: 'Panda', color: '#4ECDC4' },
        parentEmoji: { emoji: '🦊', name: 'Fox', color: '#FF6B35' },
        type: 'child',
        balance: '567.89 FLOW',
        isActive: true,
      },
    ],
  },
  {
    uid: 'profile-2',
    name: 'EVM Profile',
    avatar: '⚡',
    accounts: [
      {
        id: 'account-3',
        address: '0x9876543210fedcba',
        name: 'Main Account',
        emojiInfo: { emoji: '⚡', name: 'Zap', color: '#9B59B6' },
        type: 'main',
        balance: '1,567.34 FLOW',
        isActive: true,
      },
      {
        id: 'account-4',
        address: '0x000000000000000000000002a7f32b3700000000',
        name: 'EVM Account',
        emojiInfo: { emoji: '🔷', name: 'Diamond', color: '#3498DB' },
        parentEmoji: { emoji: '⚡', name: 'Zap', color: '#9B59B6' },
        type: 'evm',
        balance: '89.12 FLOW',
        isActive: true,
      },
    ],
  },
];

export function ConfirmImportProfileScreen(): React.ReactElement {
  const { t } = useTranslation();
  const theme = useTheme();
  const [isLoading] = React.useState(false);
  // Set first profile as default selected
  const [selectedProfileUid, setSelectedProfileUid] = React.useState<string | undefined>(
    mockProfiles[0]?.uid
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

    const selectedProfile = mockProfiles.find((p) => p.uid === selectedProfileUid);
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
          profiles={mockProfiles}
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
