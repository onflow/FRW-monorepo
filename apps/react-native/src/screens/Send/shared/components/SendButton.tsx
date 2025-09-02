import { useTranslation } from 'react-i18next';
import { View, TouchableOpacity } from 'react-native';

import { useTheme } from '@/contexts/ThemeContext';
import { Text } from 'ui';

interface SendButtonProps {
  isAccountIncompatible: boolean;
  onPress: () => void;
  buttonText?: string;
}

export const SendButton = ({ isAccountIncompatible, onPress, buttonText }: SendButtonProps) => {
  const { t } = useTranslation();
  const { isDark } = useTheme();

  // Use translation as default if no buttonText provided
  const displayText = buttonText || t('buttons.next');

  return (
    <View className="px-5 pb-8 pt-4">
      <TouchableOpacity
        className={`rounded-2xl py-2 min-h-[50px] items-center justify-center ${
          isAccountIncompatible
            ? 'bg-overlay/20 border-overlay/20'
            : isDark
              ? 'bg-white border-white'
              : 'bg-black border-black'
        }`}
        style={{
          width: '100%',
          borderWidth: 1,
        }}
        disabled={isAccountIncompatible}
        onPress={onPress}
      >
        <View style={{ paddingHorizontal: 24, minWidth: 100 }}>
          <Text
            style={{
              lineHeight: 32,
              textAlign: 'center',
              fontSize: 16,
              fontWeight: '600',
              letterSpacing: 0.5,
              color: isAccountIncompatible 
                ? (isDark ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.3)')
                : isDark 
                  ? '#000000'  // Dark mode: black text on white button
                  : '#FFFFFF'  // Light mode: white text on black button
            }}
          >
            {displayText}
          </Text>
        </View>
      </TouchableOpacity>
    </View>
  );
};
