import type { Meta, StoryObj } from '@storybook/react-vite';
import { useTheme } from '@tamagui/core';
import React from 'react';
import { Circle, Text, View, XStack, YStack } from 'tamagui';

// Color palette component that matches Figma design exactly
const ColorPalette = () => {
  const theme = useTheme();
  const isDark = theme.name === 'dark';

  // Available theme keys: Object.keys(theme)
  // Theme colors: {
  //   primary: theme.primary,
  //   background: theme.background,
  //   success: theme.success,
  //   error: theme.error,
  //   color: theme.color,
  // });

  // Single color sections - theme handles light/dark automatically
  const colorSections = {
    title: isDark ? 'Dark Mode Colours' : 'Light Mode Colours',
    sections: [
      {
        title: 'Primary Colours',
        description: 'Used for main brand elements, key actions like buttons and highlights.',
        colors: [
          { token: '$primary', label: '00EF8B', opacity: '100%' },
          { token: '$primary20', label: '00EF8B', opacity: '20%' },
          { token: '$primary10', label: '00EF8B', opacity: '10%' },
        ],
      },
      {
        title: isDark ? 'Dark Mode' : 'Light Mode',
        description: isDark
          ? 'Represents the core dark mode colours, used from left to right for background, cards, icons, borders, and navigation elements.'
          : 'Represents the core light mode colours, used from left to right for background, cards, icons and borders.',
        colors: [
          { token: '$background', label: isDark ? '000000' : 'FFFFFF', opacity: '100%' },
          { token: '$backgroundHover', label: isDark ? '1A1A1A' : 'F2F2F7', opacity: '100%' },
          { token: '$backgroundPress', label: isDark ? 'AAAAB0' : '767676', opacity: '100%' },
          { token: '$backgroundStrong', label: isDark ? 'FFFFFF' : '000D07', opacity: '25%' },
        ],
      },
      {
        title: 'Text',
        description: 'Used for all written content, including headings, body text, and labels.',
        colors: [
          { token: '$color', label: isDark ? 'FFFFFF' : '000000', opacity: '100%' },
          { token: '$textSecondary', label: isDark ? 'B3B3B3' : '767676', opacity: '100%' },
          { token: '$textTertiary', label: isDark ? 'FFFFFF' : '000D07', opacity: '10%' },
        ],
      },
      {
        title: 'Light',
        description: 'Used mainly for lines, dividers, and subtle accents with white base.',
        colors: [
          { token: '$light80', label: 'FFFFFF', opacity: '80%' },
          { token: '$light40', label: 'FFFFFF', opacity: '40%' },
          { token: '$light25', label: 'FFFFFF', opacity: '25%' },
          { token: '$light10', label: 'FFFFFF', opacity: '10%' },
          { token: '$light5', label: 'FFFFFF', opacity: '5%' },
        ],
      },
      {
        title: 'Dark',
        description: 'Used mainly for lines, dividers, and subtle accents with black base.',
        colors: [
          { token: '$dark80', label: '000000', opacity: '80%' },
          { token: '$dark40', label: '000000', opacity: '40%' },
          { token: '$dark25', label: '000000', opacity: '25%' },
          { token: '$dark10', label: '000000', opacity: '10%' },
        ],
      },
      {
        title: 'System Colors',
        description: 'Used for status indicators like success, error, warning, and info messages.',
        colors: [
          { name: 'Success', token: '$success', label: '12B76A', opacity: '100%' },
          { name: 'Success 10%', token: '$success10', label: '12B76A', opacity: '10%' },
          { name: 'Warning', token: '$warning', label: 'FDB022', opacity: '100%' },
          { name: 'Warning 10%', token: '$warning10', label: 'FDB022', opacity: '10%' },
          { name: 'Error', token: '$error', label: 'F04438', opacity: '100%' },
          { name: 'Error 10%', token: '$error10', label: 'F04438', opacity: '10%' },
        ],
      },
    ],
  };

  return (
    <View bg="$background" p="$6" minH="100vh" width={400}>
      <YStack gap="$6">
        {/* Header */}
        <Text fontSize={24} fontWeight="600" color="$color" mb="$2">
          {colorSections.title}
        </Text>

        {/* Color sections */}
        {colorSections.sections.map((section, sectionIndex) => (
          <YStack key={sectionIndex} gap="$3">
            {/* Section title */}
            <Text fontSize={16} fontWeight="600" color="$color">
              {section.title}
            </Text>

            {/* Section description */}
            <Text fontSize={12} lineHeight={16} color="$color" opacity={0.7} mb="$2" maxW={350}>
              {section.description}
            </Text>

            {/* Color swatches */}
            {section.title === 'System Colors' ? (
              // System colors layout (with names)
              <YStack gap="$3">
                {section.colors
                  .filter((color) => color.name)
                  .map((colorItem, colorIndex) => (
                    <YStack key={colorIndex} gap="$2">
                      <Text fontSize={12} fontWeight="500" color="$color">
                        {colorItem.name}
                      </Text>
                      <XStack gap="$2" items="center">
                        <Circle bg={colorItem.token as any} size={60} />
                        <YStack>
                          <Text fontSize={11} fontWeight="500" color="$color">
                            {colorItem.label}
                          </Text>
                          <Text fontSize={10} color="$color" opacity={0.7}>
                            {colorItem.opacity}
                          </Text>
                        </YStack>
                      </XStack>
                    </YStack>
                  ))}
              </YStack>
            ) : (
              // Regular color grid layout
              <XStack gap="$2" flexWrap="wrap">
                {section.colors.map((colorItem, colorIndex) => (
                  <YStack key={colorIndex} gap="$1" items="center">
                    <Circle bg={colorItem.token as any} size={60} />
                    <Text fontSize={10} fontWeight="500" color="$color" text="center">
                      {colorItem.label}
                    </Text>
                    <Text fontSize={9} color="$color" opacity={0.7} text="center">
                      {colorItem.opacity}
                    </Text>
                  </YStack>
                ))}
              </XStack>
            )}
          </YStack>
        ))}
      </YStack>
    </View>
  );
};

const meta: Meta<typeof ColorPalette> = {
  title: 'Design System/Color System',
  component: ColorPalette,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Flow Wallet color system using Tamagui theme tokens, showing both light and dark mode palettes.',
      },
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

// Interactive story that lets you switch themes
export const Interactive: Story = {
  name: 'Interactive Color System',
  parameters: {
    backgrounds: {
      disable: true, // Let theme control the background
    },
  },
  render: () => <ColorPalette />,
};
