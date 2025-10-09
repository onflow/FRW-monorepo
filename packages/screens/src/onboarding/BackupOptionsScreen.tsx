import { navigation } from '@onflow/frw-context';
// import { InfoIcon } from '@onflow/frw-icons'; // Temporarily disabled
import { YStack, XStack, Text, View, GradientBackground, BackupOptionCard } from '@onflow/frw-ui';
import React from 'react';
import { useTranslation } from 'react-i18next';

/**
 * BackupOptionsScreen - Screen for selecting backup method
 * Allows users to choose between device backup, cloud backup, or recovery phrase
 */
export function BackupOptionsScreen(): React.ReactElement {
  const { t } = useTranslation();

  const handleBack = () => {
    navigation.goBack();
  };

  const handleDeviceBackup = () => {
    // Navigate to device backup setup
  };

  const handleCloudBackup = () => {
    // Navigate to cloud backup setup
  };

  const handleRecoveryPhrase = () => {
    // Navigate to recovery phrase setup
  };

  return (
    <GradientBackground>
      <YStack flex={1}>
        <YStack flex={1} px="$4">
          {/* Description */}
          <YStack mb="$6" mt="$4">
            <Text fontSize="$4" color="$textSecondary" lineHeight={20}>
              {t('onboarding.backupOptions.subtitle')}
            </Text>
          </YStack>

          {/* Backup options */}
          <YStack gap="$3" pb="$6">
            {/* Device Backup Option */}
            <BackupOptionCard
              icon={<Text fontSize={14}>🔒</Text>}
              iconBackground={
                <>
                  <View
                    position="absolute"
                    left={0}
                    top={0}
                    width={44}
                    height={56}
                    borderRadius={6}
                    borderWidth={1}
                    borderColor="rgba(255, 255, 255, 0.5)"
                    background="rgba(255, 255, 255, 0.05)"
                    style={{
                      backdropFilter: 'blur(57px)',
                      WebkitBackdropFilter: 'blur(57px)',
                    }}
                  />
                  <View
                    position="absolute"
                    left={24}
                    bottom={0}
                    width={3}
                    height={3}
                    borderRadius={999}
                    background="white"
                  />
                </>
              }
              title={t('onboarding.backupOptions.deviceBackup.title')}
              description={t('onboarding.backupOptions.deviceBackup.description')}
              recommended={true}
              onPress={handleDeviceBackup}
            />

            {/* Cloud Backup Option */}
            <BackupOptionCard
              icon={<Text fontSize={14}>☁️</Text>}
              iconBackground={
                <>
                  <View
                    position="absolute"
                    left={0}
                    top={14}
                    width={59}
                    height={34}
                    borderRadius={6}
                    borderWidth={1}
                    borderColor="rgba(255, 255, 255, 0.5)"
                    background="rgba(255, 255, 255, 0.05)"
                    style={{
                      backdropFilter: 'blur(57px)',
                      WebkitBackdropFilter: 'blur(57px)',
                    }}
                  />
                  <View
                    position="absolute"
                    left={0}
                    top={0}
                    width={59}
                    height={34}
                    borderRadius={6}
                    borderWidth={1}
                    borderColor="rgba(255, 255, 255, 0.5)"
                    background="rgba(255, 255, 255, 0.05)"
                    style={{
                      backdropFilter: 'blur(57px)',
                      WebkitBackdropFilter: 'blur(57px)',
                    }}
                  />
                </>
              }
              title={t('onboarding.backupOptions.cloudBackup.title')}
              description={t('onboarding.backupOptions.cloudBackup.description')}
              recommended={true}
              onPress={handleCloudBackup}
            />

            {/* Recovery Phrase Option */}
            <BackupOptionCard
              icon={<Text fontSize={14}>📝</Text>}
              iconBackground={
                <View
                  position="absolute"
                  left={1}
                  top={7}
                  background="rgba(255, 255, 255, 0.05)"
                  borderWidth={1}
                  borderColor="rgba(255, 255, 255, 0.5)"
                  borderRadius={6}
                  padding={6}
                  style={{
                    backdropFilter: 'blur(83px)',
                    WebkitBackdropFilter: 'blur(83px)',
                  }}
                >
                  <XStack gap={4}>
                    <View
                      width={6}
                      height={6}
                      borderRadius={999}
                      background="rgba(255, 255, 255, 0.5)"
                    />
                    <View
                      width={6}
                      height={6}
                      borderRadius={999}
                      background="rgba(255, 255, 255, 0.5)"
                    />
                    <View
                      width={6}
                      height={6}
                      borderRadius={999}
                      background="rgba(255, 255, 255, 0.5)"
                    />
                    <View
                      width={6}
                      height={6}
                      borderRadius={999}
                      background="rgba(255, 255, 255, 0.5)"
                    />
                  </XStack>
                </View>
              }
              title={t('onboarding.backupOptions.recoveryPhrase.title')}
              description={t('onboarding.backupOptions.recoveryPhrase.description')}
              onPress={handleRecoveryPhrase}
            />
          </YStack>
        </YStack>
      </YStack>
    </GradientBackground>
  );
}
