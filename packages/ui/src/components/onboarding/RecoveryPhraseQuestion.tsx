import React from 'react';
import { YStack, XStack, Text, View, Button } from 'tamagui';

interface RecoveryPhraseQuestionProps {
  position: number;
  options: string[];
  selectedAnswer?: string;
  correctAnswer: string;
  onSelectWord: (word: string) => void;
  questionLabel: string;
}

export function RecoveryPhraseQuestion({
  position,
  options,
  selectedAnswer,
  correctAnswer,
  onSelectWord,
  questionLabel,
}: RecoveryPhraseQuestionProps): React.ReactElement {
  return (
    <YStack gap="$3" items="center">
      <Text fontSize="$5" fontWeight="700" color="$text" text="center">
        {questionLabel}
      </Text>

      {/* Word options container - Single horizontal row as per Figma */}
      <View
        width="100%"
        maxW={339}
        height={57}
        rounded="$4"
        bg="$bgGlass"
        borderWidth={1}
        borderColor="$borderGlass"
        px="$3"
        items="center"
        justify="center"
      >
        <XStack gap="$2" width="100%" justify="space-between">
          {options.map((word, wordIndex) => {
            const isSelected = selectedAnswer === word;
            const isWrong = isSelected && word !== correctAnswer;
            const isCorrectSelection = isSelected && word === correctAnswer;

            return (
              <Button
                key={`${position}-${wordIndex}-${word}`}
                variant="ghost"
                onPress={() => onSelectWord(word)}
                padding={0}
                flex={1}
              >
                <View
                  width="100%"
                  minW={58}
                  height={45}
                  rounded={10}
                  bg={isCorrectSelection ? '#FFFFFF' : isWrong ? '#FFFFFF' : 'transparent'}
                  items="center"
                  justify="center"
                >
                  <Text
                    fontSize="$4"
                    fontWeight="500"
                    color={isCorrectSelection ? '$success' : isWrong ? '$error' : '$text'}
                    text="center"
                    lineHeight={28}
                  >
                    {word}
                  </Text>
                </View>
              </Button>
            );
          })}
        </XStack>
      </View>
    </YStack>
  );
}
