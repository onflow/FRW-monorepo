import { navigation } from '@onflow/frw-context';
// import { Copy } from '@onflow/frw-icons'; // Temporarily disabled
import {
  YStack,
  XStack,
  Text,
  View,
  GradientBackground,
  Button,
  copyToClipboard,
} from '@onflow/frw-ui';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

/**
 * RecoveryPhraseScreen - Screen displaying the 12-word recovery phrase
 * Shows the recovery phrase that users must write down and store safely
 */
export function RecoveryPhraseScreen(): React.ReactElement {
  const { t } = useTranslation();
  const [copiedToClipboard, setCopiedToClipboard] = useState(false);

  // Mock recovery phrase - in production this would be generated
  const recoveryPhrase = [
    'Trust',
    'Ascot',
    'Fanny',
    'Craft',
    'Fit',
    'Lo-fi',
    'Juice',
    'Funny',
    'Next',
    'Big',
    'Migas',
    'Carry',
  ];

  const handleBack = () => {
    navigation.goBack();
  };

  const handleCopy = async () => {
    // Copy recovery phrase to clipboard
    const phraseText = recoveryPhrase.join(' ');
    const success = await copyToClipboard(phraseText);

    if (success) {
      setCopiedToClipboard(true);
      setTimeout(() => setCopiedToClipboard(false), 2000);
    }
  };

  const handleNext = () => {
    // Navigate to confirm recovery phrase with the recovery phrase
    navigation.navigate('ConfirmRecoveryPhraseScreen', {
      recoveryPhrase: recoveryPhrase,
    });
  };

  return (
    <GradientBackground>
      <YStack flex={1}>
        {/* Green glow effect */}
        <View
          pos="absolute"
          top={131}
          left={-41}
          w={467}
          h={467}
          rounded={999}
          bg="$primary"
          opacity={0.25}
          style={{
            filter: 'blur(400px)',
          }}
        />

        <YStack flex={1} px="$4" pt="$4">
          {/* Title and description */}
          <YStack items="center" mb="$6" gap="$2">
            <Text fontSize={30} fontWeight="700" color="$text" text="center" lineHeight={36}>
              {t('onboarding.recoveryPhrase.title')}
            </Text>
            <Text fontSize="$4" color="$textSecondary" text="center" lineHeight={16} maxW={280}>
              {t('onboarding.recoveryPhrase.description')}
            </Text>
          </YStack>

          {/* Recovery phrase grid - 3 columns x 4 rows */}
          <View
            w={286}
            bg="rgba(255, 255, 255, 0.1)"
            rounded={16}
            pt={24}
            pb={24}
            pl={18}
            pr={18}
            mb="$4"
            alignSelf="center"
          >
            <YStack gap={20}>
              {/* Row 1 */}
              <XStack gap={29}>
                {recoveryPhrase.slice(0, 3).map((word, index) => (
                  <XStack key={index} gap="$2" items="center" w={68}>
                    <View
                      w={32}
                      h={32}
                      bg="rgba(255, 255, 255, 0.1)"
                      rounded={8}
                      items="center"
                      justify="center"
                    >
                      <Text fontSize="$5" color="$text">
                        {index + 1}
                      </Text>
                    </View>
                    <Text fontSize="$4" color="$text">
                      {word}
                    </Text>
                  </XStack>
                ))}
              </XStack>

              {/* Row 2 */}
              <XStack gap={29}>
                {recoveryPhrase.slice(3, 6).map((word, index) => (
                  <XStack key={index + 3} gap="$2" items="center" w={68}>
                    <View
                      w={32}
                      h={32}
                      bg="rgba(255, 255, 255, 0.1)"
                      rounded={8}
                      items="center"
                      justify="center"
                    >
                      <Text fontSize="$5" color="$text">
                        {index + 4}
                      </Text>
                    </View>
                    <Text fontSize="$4" color="$text">
                      {word}
                    </Text>
                  </XStack>
                ))}
              </XStack>

              {/* Row 3 */}
              <XStack gap={29}>
                {recoveryPhrase.slice(6, 9).map((word, index) => (
                  <XStack key={index + 6} gap="$2" items="center" w={68}>
                    <View
                      w={32}
                      h={32}
                      bg="rgba(255, 255, 255, 0.1)"
                      rounded={8}
                      items="center"
                      justify="center"
                    >
                      <Text fontSize="$5" color="$text">
                        {index + 7}
                      </Text>
                    </View>
                    <Text fontSize="$4" color="$text">
                      {word}
                    </Text>
                  </XStack>
                ))}
              </XStack>

              {/* Row 4 */}
              <XStack gap={29}>
                {recoveryPhrase.slice(9, 12).map((word, index) => (
                  <XStack key={index + 9} gap="$2" items="center" w={68}>
                    <View
                      w={32}
                      h={32}
                      bg="rgba(255, 255, 255, 0.1)"
                      rounded={8}
                      items="center"
                      justify="center"
                    >
                      <Text fontSize="$5" color="$text">
                        {index + 10}
                      </Text>
                    </View>
                    <Text fontSize="$4" color="$text">
                      {word}
                    </Text>
                  </XStack>
                ))}
              </XStack>
            </YStack>
          </View>

          {/* Copy button */}
          <XStack justify="center" mb="$4">
            <Button variant="ghost" onPress={handleCopy}>
              <XStack gap="$3" items="center">
                <Text fontSize="$4" fontWeight="600" color="$primary">
                  {copiedToClipboard ? t('messages.copied') : t('onboarding.recoveryPhrase.copy')}
                </Text>
              </XStack>
            </Button>
          </XStack>

          {/* Warning card */}
          <XStack
            gap="$3"
            p="$4"
            rounded={16}
            borderWidth={1}
            borderColor="rgba(255, 255, 255, 0.15)"
            mb="$6"
          >
            <View w={24} h={24} items="center" justify="center">
              <Text fontSize={20}>⚠️</Text>
            </View>
            <YStack flex={1} gap="$1">
              <Text fontSize="$4" fontWeight="600" color="$text">
                {t('onboarding.recoveryPhrase.warning.title')}
              </Text>
              <Text fontSize="$4" color="$textSecondary" lineHeight={17}>
                {t('onboarding.recoveryPhrase.warning.description')}
              </Text>
            </YStack>
          </XStack>

          {/* Spacer */}
          <YStack flex={1} />

          {/* Next button */}
          <YStack pb="$6">
            <Button variant="secondary" onPress={handleNext} fullWidth>
              {t('onboarding.recoveryPhrase.next')}
            </Button>
          </YStack>
        </YStack>
      </YStack>
    </GradientBackground>
  );
}
