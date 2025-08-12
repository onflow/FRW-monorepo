import React from 'react';
import { YStack, Button, Text } from 'tamagui';

export interface AlphabetIndexProps {
  letters: string[];
  activeIndex?: string | null;
  onLetterPress: (letter: string) => void;
  position?: 'right' | 'left';
}

export function AlphabetIndex({
  letters,
  activeIndex = null,
  onLetterPress,
  position = 'right',
}: AlphabetIndexProps): React.ReactElement | null {
  if (letters.length === 0) return null;

  return (
    <YStack
      pos="absolute"
      {...(position === 'right' ? { right: '$1' } : { left: '$1' })}
      top="$4"
      bottom={0}
      justify="flex-start"
      z={10}
      py="$2"
      px="$0.5"
    >
      {letters.map((letter) => (
        <Button
          key={letter}
          size="$1.5"
          circular
          bg="transparent"
          borderWidth={0}
          onPress={() => onLetterPress(letter)}
          pressStyle={{
            bg: '$bg3',
            scale: 0.95,
          }}
          hoverStyle={{
            bg: '$bg3',
          }}
          minHeight="$2"
          py="$1"
          px="$1"
        >
          <Text
            fontSize="$2"
            fontWeight={activeIndex === letter ? '600' : '500'}
            color={activeIndex === letter ? '$blue10' : '$textSecondary'}
            lineHeight="$1"
          >
            {letter}
          </Text>
        </Button>
      ))}
    </YStack>
  );
}
