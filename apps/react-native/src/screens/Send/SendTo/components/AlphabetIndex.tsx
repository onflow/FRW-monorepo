import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Text } from 'ui';

interface AlphabetIndexProps {
  letters: string[];
  activeIndex: string | null;
  onLetterPress: (letter: string) => void;
}

export const AlphabetIndex: React.FC<AlphabetIndexProps> = ({
  letters,
  activeIndex,
  onLetterPress,
}) => {
  if (letters.length === 0) return null;

  return (
    <View className="absolute right-1 top-4 bottom-0 justify-top z-10">
      <View className="py-2 px-1">
        {letters.map(letter => (
          <TouchableOpacity
            key={letter}
            onPress={() => onLetterPress(letter)}
            className="py-2 px-2 items-center justify-center min-h-[24px]"
            activeOpacity={0.7}
          >
            <Text
              className={`text-xs font-medium ${
                activeIndex === letter ? 'text-primary' : 'text-fg-2'
              }`}
              style={{ fontSize: 10, lineHeight: 12 }}
            >
              {letter}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};
