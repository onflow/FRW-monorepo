import React from 'react';
import { useTranslation } from 'react-i18next';
import { navigation } from '@onflow/frw-context';
import { BackArrow, InfoIcon } from '@onflow/frw-icons';
import {
  YStack,
  XStack,
  Text,
  View,
  GradientBackground,
  IconButton,
  BackupOptionCard,
} from '@onflow/frw-ui';

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
    navigation.navigate('DeviceBackupSetup');
  };

  const handleCloudBackup = () => {
    // Navigate to cloud backup setup
    navigation.navigate('CloudBackupSetup');
  };

  const handleRecoveryPhrase = () => {
    // Navigate to recovery phrase setup
    navigation.navigate('RecoveryPhraseScreen');
  };

  return (
    <GradientBackground>
      <YStack flex={1}>
        {/* Header with title and info button */}
        <XStack px="$4" pt="$6" pb="$2" items="center" justify="space-between">
          <IconButton
            icon={<BackArrow size={24} color="$text" />}
            onPress={handleBack}
            variant="ghost"
          />

          <Text
            fontSize="$5"
            fontWeight="600"
            color="$text"
          >
            {t('onboarding.backupOptions.navTitle')}
          </Text>

          <IconButton
            icon={<InfoIcon size={24} color="$text" />}
            onPress={() => {}}
            variant="ghost"
          />
        </XStack>

        <YStack flex={1} px="$4">
          {/* Description */}
          <YStack mb="$6" mt="$4">
            <Text
              fontSize="$4"
              color="$textSecondary"
              lineHeight={20}
            >
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
                    pos="absolute"
                    left={0}
                    top={0}
                    w={44}
                    h={56}
                    rounded={6}
                    borderWidth={1}
                    borderColor="rgba(255, 255, 255, 0.5)"
                    bg="rgba(255, 255, 255, 0.05)"
                    style={{
                      backdropFilter: 'blur(57px)',
                      WebkitBackdropFilter: 'blur(57px)',
                    }}
                  />
                  <View
                    pos="absolute"
                    left={24}
                    bottom={0}
                    w={3}
                    h={3}
                    rounded={999}
                    bg="white"
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
                    pos="absolute"
                    left={0}
                    top={14}
                    w={59}
                    h={34}
                    rounded={6}
                    borderWidth={1}
                    borderColor="rgba(255, 255, 255, 0.5)"
                    bg="rgba(255, 255, 255, 0.05)"
                    style={{
                      backdropFilter: 'blur(57px)',
                      WebkitBackdropFilter: 'blur(57px)',
                    }}
                  />
                  <View
                    pos="absolute"
                    left={0}
                    top={0}
                    w={59}
                    h={34}
                    rounded={6}
                    borderWidth={1}
                    borderColor="rgba(255, 255, 255, 0.5)"
                    bg="rgba(255, 255, 255, 0.05)"
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
                  pos="absolute"
                  left={1}
                  top={7}
                  bg="rgba(255, 255, 255, 0.05)"
                  borderWidth={1}
                  borderColor="rgba(255, 255, 255, 0.5)"
                  rounded={6}
                  p="$1.5"
                  style={{
                    backdropFilter: 'blur(83px)',
                    WebkitBackdropFilter: 'blur(83px)',
                  }}
                >
                  <XStack gap={4}>
                    <View w={6} h={6} rounded={999} bg="rgba(255, 255, 255, 0.5)" />
                    <View w={6} h={6} rounded={999} bg="rgba(255, 255, 255, 0.5)" />
                    <View w={6} h={6} rounded={999} bg="rgba(255, 255, 255, 0.5)" />
                    <View w={6} h={6} rounded={999} bg="rgba(255, 255, 255, 0.5)" />
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