import { ScrollView, View, Text, Button, XStack, YStack } from '@onflow/frw-ui';
import React from 'react';

import type { BaseScreenProps } from '../types';

interface ColorDemoScreenProps extends BaseScreenProps {
  theme?: { isDark: boolean };
  onThemeToggle?: () => void;
}

const ColorDemoScreen: React.FC<ColorDemoScreenProps> = ({
  navigation,
  bridge,
  t,
  theme = { isDark: false },
  onThemeToggle,
}) => {
  const isDark = theme.isDark;
  const currentTheme = isDark ? 'dark' : 'light';

  const OverlappingCircles = ({ colors }: { colors: string[] }) => (
    <XStack height={64} mb="$4">
      {colors.map((color, index) => (
        <View
          key={index}
          width={64}
          height={64}
          borderRadius="$12"
          bg={color}
          marginLeft={index > 0 ? -12 : 0}
          zIndex={colors.length - index}
        />
      ))}
    </XStack>
  );

  return (
    <ScrollView flex={1} bg="$background">
      <YStack p="$6">
        {/* Header */}
        <XStack justify="space-between" items="center" mb="$8">
          <Text fontSize="$8" fontWeight="bold" color="$color">
            {currentTheme === 'light'
              ? t('colorDemo.lightModeColors')
              : t('colorDemo.darkModeColors')}
          </Text>
          {onThemeToggle && (
            <Button variant="primary" onPress={onThemeToggle} px="$4" py="$2">
              <Text color="white" fontWeight="500">
                {currentTheme === 'light'
                  ? t('colorDemo.switchToDark')
                  : t('colorDemo.switchToLight')}
              </Text>
            </Button>
          )}
        </XStack>

        {/* Primary Colors */}
        <YStack mb="$8">
          <Text fontSize="$6" fontWeight="600" mb="$2" color="$color">
            {t('colorDemo.primaryColors')}
          </Text>
          <Text fontSize="$3" mb="$4" color="$textSecondary">
            Used for main brand elements, key actions like buttons and highlights.
          </Text>

          <OverlappingCircles colors={['$primary', '$primary20', '$primary10']} />

          <XStack mt="$2">
            <YStack width={64} items="center" mr="$4">
              <Text fontSize="$2" color="$color">
                00EF8B
              </Text>
              <Text fontSize="$2" color="$textSecondary">
                100%
              </Text>
            </YStack>
            <YStack width={64} items="center" mr="$4">
              <Text fontSize="$2" color="$color">
                00EF8B
              </Text>
              <Text fontSize="$2" color="$textSecondary">
                20%
              </Text>
            </YStack>
            <YStack width={64} items="center" mr="$4">
              <Text fontSize="$2" color="$color">
                00EF8B
              </Text>
              <Text fontSize="$2" color="$textSecondary">
                10%
              </Text>
            </YStack>
          </XStack>
        </YStack>

        {/* Background Colors */}
        <YStack mb="$8">
          <Text fontSize="$6" fontWeight="600" mb="$2" color="$color">
            {currentTheme === 'light' ? 'Light Mode' : 'Dark Mode'}
          </Text>
          <Text fontSize="$3" mb="$4" color="$textSecondary">
            {currentTheme === 'light'
              ? 'Represents the core light mode colours, used from left to right for background, cards, icons and borders.'
              : 'Represents the core dark mode colours, used from left to right for background, cards, icons, borders, and navigation elements.'}
          </Text>

          <OverlappingCircles
            colors={
              isDark
                ? ['$background', '$bg2', '$bg3', '$bg4', '$surface4']
                : ['$background', '$bg2', '$bg3', '$bg4']
            }
          />

          <XStack mt="$2">
            <YStack width={64} items="center" mr="$4">
              <Text fontSize="$2" color="$color">
                {currentTheme === 'light' ? 'FFFFFF' : '000000'}
              </Text>
              <Text fontSize="$2" color="$textSecondary">
                100%
              </Text>
            </YStack>
            <YStack width={64} items="center" mr="$4">
              <Text fontSize="$2" color="$color">
                {currentTheme === 'light' ? 'F2F2F7' : '1A1A1A'}
              </Text>
              <Text fontSize="$2" color="$textSecondary">
                100%
              </Text>
            </YStack>
            <YStack width={64} items="center" mr="$4">
              <Text fontSize="$2" color="$color">
                {currentTheme === 'light' ? '767676' : 'FFFFFF'}
              </Text>
              <Text fontSize="$2" color="$textSecondary">
                50%
              </Text>
            </YStack>
            <YStack width={64} items="center" mr="$4">
              <Text fontSize="$2" color="$color">
                {currentTheme === 'light' ? '000007' : 'FFFFFF'}
              </Text>
              <Text fontSize="$2" color="$textSecondary">
                25%
              </Text>
            </YStack>
            {isDark && (
              <YStack width={64} items="center" mr="$4">
                <Text fontSize="$2" color="$color">
                  0A0A08
                </Text>
                <Text fontSize="$2" color="$textSecondary">
                  100%
                </Text>
              </YStack>
            )}
          </XStack>
        </YStack>

        {/* Text Colors */}
        <YStack mb="$8">
          <Text fontSize="$6" fontWeight="600" mb="$2" color="$color">
            {t('colorDemo.text')}
          </Text>
          <Text fontSize="$3" mb="$4" color="$textSecondary">
            Used for all written content, including headings, body text, and labels. Includes
            primary, secondary, and muted tones {isDark ? 'for disabled text ' : ''}
            to indicate hierarchy and readability.
          </Text>

          <OverlappingCircles colors={['$color', '$textSecondary', '$textTertiary']} />

          <XStack mt="$2">
            <YStack width={64} items="center" mr="$4">
              <Text fontSize="$2" color="$color">
                {currentTheme === 'light' ? '000000' : 'FFFFFF'}
              </Text>
              <Text fontSize="$2" color="$textSecondary">
                100%
              </Text>
            </YStack>
            <YStack width={64} items="center" mr="$4">
              <Text fontSize="$2" color="$color">
                {currentTheme === 'light' ? '767676' : 'B3B3B3'}
              </Text>
              <Text fontSize="$2" color="$textSecondary">
                100%
              </Text>
            </YStack>
            <YStack width={64} items="center" mr="$4">
              <Text fontSize="$2" color="$color">
                {currentTheme === 'light' ? '000007' : 'FFFFFF'}
              </Text>
              <Text fontSize="$2" color="$textSecondary">
                10%
              </Text>
            </YStack>
          </XStack>
        </YStack>

        {/* System Colors */}
        <YStack mb="$8">
          <Text fontSize="$6" fontWeight="600" mb="$2" color="$color">
            {t('colorDemo.system')}
          </Text>
          <Text fontSize="$3" mb="$4" color="$textSecondary">
            Used for status indicators like success, error, warning, and info messages. They provide
            visual feedback for user actions and system states.
          </Text>

          <OverlappingCircles
            colors={['$success', '$success15', '$warning', '$warning15', '$error', '$error15']}
          />

          <XStack mt="$2">
            <YStack width={64} items="center" mr="$4">
              <Text fontSize="$2" color="$color">
                12B76A
              </Text>
              <Text fontSize="$2" color="$textSecondary">
                100%
              </Text>
            </YStack>
            <YStack width={64} items="center" mr="$4">
              <Text fontSize="$2" color="$color">
                12B76A
              </Text>
              <Text fontSize="$2" color="$textSecondary">
                15%
              </Text>
            </YStack>
            <YStack width={64} items="center" mr="$4">
              <Text fontSize="$2" color="$color">
                FDB022
              </Text>
              <Text fontSize="$2" color="$textSecondary">
                100%
              </Text>
            </YStack>
            <YStack width={64} items="center" mr="$4">
              <Text fontSize="$2" color="$color">
                FDB022
              </Text>
              <Text fontSize="$2" color="$textSecondary">
                15%
              </Text>
            </YStack>
            <YStack width={64} items="center" mr="$4">
              <Text fontSize="$2" color="$color">
                F04438
              </Text>
              <Text fontSize="$2" color="$textSecondary">
                100%
              </Text>
            </YStack>
            <YStack width={64} items="center" mr="$4">
              <Text fontSize="$2" color="$color">
                F04438
              </Text>
              <Text fontSize="$2" color="$textSecondary">
                15%
              </Text>
            </YStack>
          </XStack>
        </YStack>
      </YStack>
    </ScrollView>
  );
};

export default ColorDemoScreen;
