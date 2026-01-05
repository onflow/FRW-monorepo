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
 * Used in RecoveryPhraseScreen and BackupMnemonicScreen
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
        <YStack gap="$5">
          {/* Generate 6 rows with 2 columns each */}
          {Array.from({ length: 6 }, (_, rowIndex) => (
            <XStack key={rowIndex} gap="$10" justify="space-between">
              {/* Left column */}
              {words[rowIndex * 2] && (
                <XStack gap="$2" items="center" flex={1}>
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
                      {rowIndex * 2 + 1}
                    </Text>
                  </YStack>
                  <Text fontSize="$4" color="$text">
                    {words[rowIndex * 2]}
                  </Text>
                </XStack>
              )}

              {/* Right column */}
              {words[rowIndex * 2 + 1] && (
                <XStack gap="$2" items="center" flex={1}>
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
                      {rowIndex * 2 + 2}
                    </Text>
                  </YStack>
                  <Text fontSize="$4" color="$text">
                    {words[rowIndex * 2 + 1]}
                  </Text>
                </XStack>
              )}
            </XStack>
          ))}
        </YStack>
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
