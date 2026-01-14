import { RevealPhrase } from '@onflow/frw-icons';
import React from 'react';
import { YStack, XStack, View, useTheme } from 'tamagui';

import { Text } from '../../foundation/Text';

export interface MnemonicGridProps {
  /** The words to display in the grid (12 words) */
  words: string[];
  /** Whether the words are revealed or hidden */
  isRevealed: boolean;
  /** Callback when reveal is triggered */
  onReveal?: () => void;
  /** Label for the reveal overlay */
  revealLabel?: string;
  /** Optional margin bottom */
  mb?: string | number;
}

/**
 * MnemonicGrid - Displays a 2x6 grid of numbered mnemonic words
 * Reusable component for displaying seed phrases with reveal functionality
 * Used in RecoveryPhraseScreen and KeyRotationMnemonicScreen
 */
export function MnemonicGrid({
  words,
  isRevealed,
  onReveal,
  revealLabel = 'Click to reveal phrase',
  mb = '$4',
}: MnemonicGridProps): React.ReactElement {
  const theme = useTheme();

  return (
    <YStack
      width={320}
      bg="$bgGlass"
      rounded="$4"
      pt="$6"
      pb="$6"
      px="$4.5"
      mb={mb as any}
      self="center"
      position="relative"
    >
      {isRevealed ? (
        <XStack gap="$10">
          {/* Left column (1-6) */}
          <YStack gap="$5" flex={1} minWidth={0}>
            {words.slice(0, 6).map((word, index) => (
              <XStack key={index} gap="$2" items="center" minWidth={0}>
                <YStack
                  width="$8"
                  height="$8"
                  bg="$bgGlass"
                  rounded="$2"
                  items="center"
                  justify="center"
                  shrink={0}
                >
                  <Text fontSize="$5" color="$text">
                    {index + 1}
                  </Text>
                </YStack>
                <Text fontSize="$4" color="$text" flexShrink={1} numberOfLines={1}>
                  {word}
                </Text>
              </XStack>
            ))}
          </YStack>

          {/* Right column (7-12) */}
          <YStack gap="$5" flex={1} minWidth={0}>
            {words.slice(6, 12).map((word, index) => (
              <XStack key={index + 6} gap="$2" items="center" minWidth={0}>
                <YStack
                  width="$8"
                  height="$8"
                  bg="$bgGlass"
                  rounded="$2"
                  items="center"
                  justify="center"
                  shrink={0}
                >
                  <Text fontSize="$5" color="$text">
                    {index + 7}
                  </Text>
                </YStack>
                <Text fontSize="$4" color="$text" flexShrink={1} numberOfLines={1}>
                  {word}
                </Text>
              </XStack>
            ))}
          </YStack>
        </XStack>
      ) : (
        /* Click to reveal overlay */
        <YStack height={340} items="center" justify="center" cursor="pointer" onPress={onReveal}>
          <YStack items="center" gap="$3">
            <View width={42} height={40} bg="$bgGlass" rounded="$2" items="center" justify="center">
              <RevealPhrase size={20} color={theme.iconGlass.val} />
            </View>
            <Text fontSize="$4" fontWeight="500" color="$text" text="center">
              {revealLabel}
            </Text>
          </YStack>
        </YStack>
      )}
    </YStack>
  );
}
