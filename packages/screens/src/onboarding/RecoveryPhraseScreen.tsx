import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { navigation } from '@onflow/frw-context';
import { BackArrow, Copy } from '@onflow/frw-icons';
import {
  YStack,
  XStack,
  Text,
  View,
  GradientBackground,
  Button,
  IconButton,
  Pressable,
} from '@onflow/frw-ui';

/**
 * RecoveryPhraseScreen - Screen displaying the 12-word recovery phrase
 * Shows the recovery phrase that users must write down and store safely
 */
export function RecoveryPhraseScreen(): React.ReactElement {
  const { t } = useTranslation();
  const [copiedToClipboard, setCopiedToClipboard] = useState(false);

  // Mock recovery phrase - in production this would be generated
  const recoveryPhrase = [
    'Trust', 'Ascot', 'Fanny', 'Craft',
    'Fit', 'Lo-fi', 'Juice', 'Funny',
    'Next', 'Big', 'Migas', 'Carry'
  ];

  const handleBack = () => {
    navigation.goBack();
  };

  const handleCopy = () => {
    // Copy recovery phrase to clipboard
    const phraseText = recoveryPhrase.join(' ');
    // TODO: Implement clipboard copy
    setCopiedToClipboard(true);
    setTimeout(() => setCopiedToClipboard(false), 2000);
  };

  const handleNext = () => {
    // Navigate to backup options
    navigation.navigate('BackupOptionsScreen');
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

        {/* Header with back button */}
        <XStack px="$4" pt="$6" pb="$2" items="center">
          <IconButton
            icon={<BackArrow size={24} color="$text" />}
            onPress={handleBack}
            variant="ghost"
          />
          <YStack flex={1} items="center">
            <Text
              fontSize="$5"
              fontWeight="600"
              color="$text"
            >
              {t('onboarding.recoveryPhrase.navTitle')}
            </Text>
          </YStack>
          <View w={24} /> {/* Spacer for centering */}
        </XStack>

        <YStack flex={1} px="$4" pt="$4">
          {/* Title and description */}
          <YStack items="center" mb="$6" gap="$2">
            <Text
              fontSize={30}
              fontWeight="700"
              color="$text"
              text="center"
              lineHeight={36}
            >
              {t('onboarding.recoveryPhrase.title')}
            </Text>
            <Text
              fontSize="$4"
              color="$textSecondary"
              text="center"
              lineHeight={16}
              maxW={280}
            >
              {t('onboarding.recoveryPhrase.description')}
            </Text>
          </YStack>

          {/* Recovery phrase grid */}
          <YStack
            bg="rgba(255, 255, 255, 0.1)"
            rounded={16}
            p="$4"
            px="$3"
            mb="$4"
          >
            <XStack flexWrap="wrap" gap="$3" justify="center">
              {recoveryPhrase.map((word, index) => (
                <XStack key={index} gap="$2" items="center" w={97}>
                  <View
                    w={32}
                    h={32}
                    bg="rgba(255, 255, 255, 0.1)"
                    rounded={8}
                    items="center"
                    justify="center"
                  >
                    <Text
                      fontSize="$5"
                      color="$text"
                    >
                      {index + 1}
                    </Text>
                  </View>
                  <Text
                    fontSize="$4"
                    color="$text"
                  >
                    {word}
                  </Text>
                </XStack>
              ))}
            </XStack>
          </YStack>

          {/* Copy button */}
          <XStack justify="center" mb="$4">
            <Pressable onPress={handleCopy}>
              <XStack gap="$3" items="center">
                <Copy size={24} color="$primary" />
                <Text
                  fontSize="$4"
                  fontWeight="600"
                  color="$primary"
                >
                  {copiedToClipboard ? t('messages.copied') : t('onboarding.recoveryPhrase.copy')}
                </Text>
              </XStack>
            </Pressable>
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
            <View
              w={24}
              h={24}
              items="center"
              justify="center"
            >
              <Text fontSize={20}>⚠️</Text>
            </View>
            <YStack flex={1} gap="$1">
              <Text
                fontSize="$4"
                fontWeight="600"
                color="$text"
              >
                {t('onboarding.recoveryPhrase.warning.title')}
              </Text>
              <Text
                fontSize="$4"
                color="$textSecondary"
                lineHeight={17}
              >
                {t('onboarding.recoveryPhrase.warning.description')}
              </Text>
            </YStack>
          </XStack>

          {/* Spacer */}
          <YStack flex={1} />

          {/* Next button */}
          <YStack pb="$6">
            <Button
              variant="secondary"
              onPress={handleNext}
              fullWidth
            >
              {t('onboarding.recoveryPhrase.next')}
            </Button>
          </YStack>
        </YStack>
      </YStack>
    </GradientBackground>
  );
}