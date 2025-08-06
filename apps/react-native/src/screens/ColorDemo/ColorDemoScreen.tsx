import React from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, View, Text, TouchableOpacity } from 'react-native';

import { useAndroidTextFix } from '@/lib/androidTextFix';

import { useTheme } from '../../contexts/ThemeContext';

const ColorDemoScreen = () => {
  const { t } = useTranslation();
  const { theme, toggleTheme } = useTheme();
  const androidTextFix = useAndroidTextFix();

  const OverlappingCircles = ({ colors }: { colors: string[] }) => (
    <View className="flex-row h-16 mb-4">
      {colors.map((color, index) => (
        <View
          key={index}
          className={`w-16 h-16 rounded-full ${color}`}
          style={{
            marginLeft: index > 0 ? -12 : 0,
            zIndex: colors.length - index,
          }}
        />
      ))}
    </View>
  );

  return (
    <ScrollView className="flex-1 bg-sf" key={theme}>
      <View className="p-6">
        {/* Header */}
        <View className="flex-row justify-between items-center mb-8">
          <Text className="text-fg-1 text-2xl font-bold">
            {theme === 'light' ? t('colorDemo.lightModeColors') : t('colorDemo.darkModeColors')}
          </Text>
          <TouchableOpacity onPress={toggleTheme} className="bg-primary px-4 py-2 rounded-lg">
            <Text className="text-white font-medium" style={androidTextFix}>
              {theme === 'light' ? t('colorDemo.switchToDark') : t('colorDemo.switchToLight')}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Primary Colors */}
        <View className="mb-8">
          <Text className="text-fg-1 text-lg font-semibold mb-2">
            {t('colorDemo.primaryColors')}
          </Text>
          <Text className="text-fg-2 text-sm mb-4">
            Used for main brand elements, key actions like buttons and highlights.
          </Text>

          <OverlappingCircles colors={['bg-primary', 'bg-primary-20', 'bg-primary-10']} />

          <View className="flex-row mt-2">
            <View className="w-16 text-center mr-4">
              <Text className="text-fg-1 text-xs">00EF8B</Text>
              <Text className="text-fg-2 text-xs">100%</Text>
            </View>
            <View className="w-16 text-center mr-4">
              <Text className="text-fg-1 text-xs">00EF8B</Text>
              <Text className="text-fg-2 text-xs">20%</Text>
            </View>
            <View className="w-16 text-center mr-4">
              <Text className="text-fg-1 text-xs">00EF8B</Text>
              <Text className="text-fg-2 text-xs">10%</Text>
            </View>
          </View>
        </View>

        {/* Background Colors */}
        <View className="mb-8">
          <Text className="text-fg-1 text-lg font-semibold mb-2">
            {theme === 'light' ? 'Light Mode' : 'Dark Mode'}
          </Text>
          <Text className="text-fg-2 text-sm mb-4">
            {theme === 'light'
              ? 'Represents the core light mode colours, used from left to right for background, cards, icons and borders.'
              : 'Represents the core dark mode colours, used from left to right for background, cards, icons, borders, and navigation elements.'}
          </Text>

          <OverlappingCircles
            colors={
              theme === 'dark'
                ? ['bg-sf', 'bg-sf-1', 'bg-sf-2', 'bg-sf-3', 'bg-surface-quaternary-alt']
                : ['bg-sf', 'bg-sf-1', 'bg-sf-2', 'bg-sf-3']
            }
          />

          <View className="flex-row mt-2">
            <View className="w-16 text-center mr-4">
              <Text className="text-fg-1 text-xs">{theme === 'light' ? 'FFFFFF' : '000000'}</Text>
              <Text className="text-fg-2 text-xs">100%</Text>
            </View>
            <View className="w-16 text-center mr-4">
              <Text className="text-fg-1 text-xs">{theme === 'light' ? 'F2F2F7' : '1A1A1A'}</Text>
              <Text className="text-fg-2 text-xs">100%</Text>
            </View>
            <View className="w-16 text-center mr-4">
              <Text className="text-fg-1 text-xs">{theme === 'light' ? '767676' : 'FFFFFF'}</Text>
              <Text className="text-fg-2 text-xs">50%</Text>
            </View>
            <View className="w-16 text-center mr-4">
              <Text className="text-fg-1 text-xs">{theme === 'light' ? '000007' : 'FFFFFF'}</Text>
              <Text className="text-fg-2 text-xs">25%</Text>
            </View>
            {theme === 'dark' && (
              <View className="w-16 text-center mr-4">
                <Text className="text-fg-1 text-xs">0A0A08</Text>
                <Text className="text-fg-2 text-xs">100%</Text>
              </View>
            )}
          </View>
        </View>

        {/* Text Colors */}
        <View className="mb-8">
          <Text className="text-fg-1 text-lg font-semibold mb-2">{t('colorDemo.text')}</Text>
          <Text className="text-fg-2 text-sm mb-4">
            Used for all written content, including headings, body text, and labels. Includes
            primary, secondary, and muted tones {theme === 'dark' ? 'for disabled text ' : ''}
            to indicate hierarchy and readability.
          </Text>

          <OverlappingCircles colors={['bg-fg-1', 'bg-fg-2', 'bg-fg-3']} />

          <View className="flex-row mt-2">
            <View className="w-16 text-center mr-4">
              <Text className="text-fg-1 text-xs">{theme === 'light' ? '000000' : 'FFFFFF'}</Text>
              <Text className="text-fg-2 text-xs">100%</Text>
            </View>
            <View className="w-16 text-center mr-4">
              <Text className="text-fg-1 text-xs">{theme === 'light' ? '767676' : 'B3B3B3'}</Text>
              <Text className="text-fg-2 text-xs">100%</Text>
            </View>
            <View className="w-16 text-center mr-4">
              <Text className="text-fg-1 text-xs">{theme === 'light' ? '000007' : 'FFFFFF'}</Text>
              <Text className="text-fg-2 text-xs">10%</Text>
            </View>
          </View>
        </View>

        {/* Dark/Light Accents */}
        <View className="mb-8">
          <Text className="text-fg-1 text-lg font-semibold mb-2">
            {theme === 'light' ? 'Dark' : 'Light'}
          </Text>
          <Text className="text-fg-2 text-sm mb-4">
            Used mainly for lines, dividers, and subtle accents in{' '}
            {theme === 'light' ? 'dark' : 'light'} mode to enhance contrast and clarity.
          </Text>

          <View className="flex-row h-16 mb-4">
            {theme === 'light' ? (
              <>
                <View
                  className="w-16 h-16 rounded-full bg-black"
                  style={{ opacity: 0.8, marginLeft: 0, zIndex: 4 }}
                />
                <View
                  className="w-16 h-16 rounded-full bg-black"
                  style={{ opacity: 0.4, marginLeft: -12, zIndex: 3 }}
                />
                <View
                  className="w-16 h-16 rounded-full bg-black"
                  style={{ opacity: 0.25, marginLeft: -12, zIndex: 2 }}
                />
                <View
                  className="w-16 h-16 rounded-full bg-black"
                  style={{ opacity: 0.1, marginLeft: -12, zIndex: 1 }}
                />
              </>
            ) : (
              <>
                <View
                  className="w-16 h-16 rounded-full bg-white"
                  style={{ opacity: 0.8, marginLeft: 0, zIndex: 5 }}
                />
                <View
                  className="w-16 h-16 rounded-full bg-white"
                  style={{ opacity: 0.4, marginLeft: -12, zIndex: 4 }}
                />
                <View
                  className="w-16 h-16 rounded-full bg-white"
                  style={{ opacity: 0.25, marginLeft: -12, zIndex: 3 }}
                />
                <View
                  className="w-16 h-16 rounded-full bg-white"
                  style={{ opacity: 0.1, marginLeft: -12, zIndex: 2 }}
                />
                <View
                  className="w-16 h-16 rounded-full bg-white"
                  style={{ opacity: 0.05, marginLeft: -12, zIndex: 1 }}
                />
              </>
            )}
          </View>

          <View className="flex-row mt-2">
            {theme === 'light' ? (
              <>
                <View className="w-16 text-center mr-4">
                  <Text className="text-fg-1 text-xs">000000</Text>
                  <Text className="text-fg-2 text-xs">80%</Text>
                </View>
                <View className="w-16 text-center mr-4">
                  <Text className="text-fg-1 text-xs">000000</Text>
                  <Text className="text-fg-2 text-xs">40%</Text>
                </View>
                <View className="w-16 text-center mr-4">
                  <Text className="text-fg-1 text-xs">000000</Text>
                  <Text className="text-fg-2 text-xs">25%</Text>
                </View>
                <View className="w-16 text-center mr-4">
                  <Text className="text-fg-1 text-xs">000000</Text>
                  <Text className="text-fg-2 text-xs">10%</Text>
                </View>
              </>
            ) : (
              <>
                <View className="w-16 text-center mr-4">
                  <Text className="text-fg-1 text-xs">FFFFFF</Text>
                  <Text className="text-fg-2 text-xs">80%</Text>
                </View>
                <View className="w-16 text-center mr-4">
                  <Text className="text-fg-1 text-xs">FFFFFF</Text>
                  <Text className="text-fg-2 text-xs">40%</Text>
                </View>
                <View className="w-16 text-center mr-4">
                  <Text className="text-fg-1 text-xs">FFFFFF</Text>
                  <Text className="text-fg-2 text-xs">25%</Text>
                </View>
                <View className="w-16 text-center mr-4">
                  <Text className="text-fg-1 text-xs">FFFFFF</Text>
                  <Text className="text-fg-2 text-xs">10%</Text>
                </View>
                <View className="w-16 text-center mr-4">
                  <Text className="text-fg-1 text-xs">FFFFFF</Text>
                  <Text className="text-fg-2 text-xs">5%</Text>
                </View>
              </>
            )}
          </View>
        </View>

        {/* System Colors */}
        <View className="mb-8">
          <Text className="text-fg-1 text-lg font-semibold mb-2">{t('colorDemo.system')}</Text>
          <Text className="text-fg-2 text-sm mb-4">
            Used for status indicators like success, error, warning, and info messages. They provide
            visual feedback for user actions and system states.
          </Text>

          <OverlappingCircles
            colors={[
              'bg-success',
              'bg-success-15',
              'bg-warning',
              'bg-warning-15',
              'bg-error',
              'bg-error-15',
            ]}
          />

          <View className="flex-row mt-2">
            <View className="w-16 text-center mr-4">
              <Text className="text-fg-1 text-xs">12B76A</Text>
              <Text className="text-fg-2 text-xs">100%</Text>
            </View>
            <View className="w-16 text-center mr-4">
              <Text className="text-fg-1 text-xs">12B76A</Text>
              <Text className="text-fg-2 text-xs">15%</Text>
            </View>
            <View className="w-16 text-center mr-4">
              <Text className="text-fg-1 text-xs">FDB022</Text>
              <Text className="text-fg-2 text-xs">100%</Text>
            </View>
            <View className="w-16 text-center mr-4">
              <Text className="text-fg-1 text-xs">FDB022</Text>
              <Text className="text-fg-2 text-xs">15%</Text>
            </View>
            <View className="w-16 text-center mr-4">
              <Text className="text-fg-1 text-xs">F04438</Text>
              <Text className="text-fg-2 text-xs">100%</Text>
            </View>
            <View className="w-16 text-center mr-4">
              <Text className="text-fg-1 text-xs">F04438</Text>
              <Text className="text-fg-2 text-xs">15%</Text>
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

export default ColorDemoScreen;
