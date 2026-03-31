import { navigation, logger } from '@onflow/frw-context';
import { LockBackup, LinkBackup, Settings } from '@onflow/frw-icons';
import {
  YStack,
  Text,
  OnboardingBackground,
  Button,
  TipCard,
  ShieldAnimation,
  useTheme,
  View,
  Spinner,
  ScrollView,
} from '@onflow/frw-ui';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

/**
 * KeystoreMigrationTipScreen - Explains the keystore migration process
 * Used when upgrading account security with a new hardware key
 */

export interface KeystoreMigrationTipScreenProps {
  /** Callback when user presses Start */
  onContinue: () => void | Promise<void>;
  /** Callback when user presses "Not now" */
  onSkip?: () => void;
  /** Callback when user presses back/close */
  onBack?: () => void;
}

export function KeystoreMigrationTipScreen({
  onContinue,
  onSkip,
  onBack,
}: KeystoreMigrationTipScreenProps): React.ReactElement {
  const { t } = useTranslation();
  const theme = useTheme();
  const [isLoading, setIsLoading] = useState(false);

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigation.goBack();
    }
  };

  const handleSkip = () => {
    if (onSkip) {
      onSkip();
    }
  };

  const handleStart = async () => {
    logger.info('[KeystoreMigrationTipScreen] User pressed Start');
    setIsLoading(true);
    try {
      await onContinue();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <OnboardingBackground>
      <ScrollView>
        <YStack flex={1} px="$4">
          {/* Title */}
          <YStack items="center" mb="$4" gap="$2">
            <Text fontSize="$8" fontWeight="700" color="$text" text="center" lineHeight="$8">
              {t('keystoreMigration.tip.title', { defaultValue: 'Upgrade\nyour account' })}
            </Text>
          </YStack>

          {/* Shield Animation */}
          <YStack items="center" mb="$4">
            <ShieldAnimation width={200} height={180} autoPlay={true} loop={true} />
          </YStack>

          {/* Description */}
          <YStack items="center" mb="$6">
            <Text fontSize="$4" color="$text" text="center" maxW={320}>
              {t('keystoreMigration.tip.description', {
                defaultValue:
                  'Flow Wallet needs to upgrade the security of your account. This process will take just a few seconds to complete.',
              })}
            </Text>
          </YStack>

          {/* Section title */}
          <YStack items="center" mb="$4">
            <Text fontSize="$5" fontWeight="700" color="$text">
              {t('keystoreMigration.tip.sectionTitle', { defaultValue: 'What does this mean?' })}
            </Text>
          </YStack>

          {/* Separator */}
          <View height={1} bg="$borderGlass" />

          {/* Tips Section */}
          <YStack mb="$4">
            <TipCard
              icon={<LockBackup size={20} color={theme.primary.val} />}
              title={t('keystoreMigration.tip.fullControl.title', {
                defaultValue:
                  "You'll have full control over your accounts and keys. Your backups will not be affected.",
              })}
              showSeparator
            />

            <TipCard
              icon={<LinkBackup size={20} color={theme.primary.val} />}
              title={t('keystoreMigration.tip.newKey.title', {
                defaultValue:
                  "We'll create a new hardware key to secure your account, improving account security.",
              })}
              showSeparator
            />

            <TipCard
              icon={<Settings size={20} color={theme.primary.val} />}
              title={t('keystoreMigration.tip.noChanges.title', {
                defaultValue:
                  "Nothing changes, you'll continue to benefit from the hardware grade security of Flow Wallet.",
              })}
              showSeparator
            />
          </YStack>

          {/* Spacer */}
          <YStack flex={1} />

          {/* Start button */}
          <YStack pb="$2">
            <Button
              variant="inverse"
              size="large"
              fullWidth
              onPress={handleStart}
              disabled={isLoading}
            >
              {isLoading ? (
                <Spinner size="small" color="$background" />
              ) : (
                t('keystoreMigration.tip.start', { defaultValue: 'Start' })
              )}
            </Button>
          </YStack>

          {/* Not now link */}
          {onSkip && !isLoading && (
            <YStack items="center" pb="$6">
              <Text
                fontSize="$4"
                color="$textSecondary"
                onPress={handleSkip}
                cursor="pointer"
                pressStyle={{ opacity: 0.7 }}
              >
                {t('keystoreMigration.tip.notNow', { defaultValue: 'Not now' })}
              </Text>
            </YStack>
          )}
        </YStack>
      </ScrollView>
    </OnboardingBackground>
  );
}
