import React from 'react';
import { useTranslation } from 'react-i18next';
import { View, TextInput, TouchableOpacity, Alert } from 'react-native';

import NativeFRWBridge from '@/bridge/NativeFRWBridge';
import { useTheme } from '@/contexts/ThemeContext';
import { useAndroidTextFix } from '@/lib/androidTextFix';
import { cn } from '@/lib/utils';
import { SearchIcon, ScanIcon, CloseIcon } from 'ui';

interface AddressSearchBoxProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  className?: string;
  showScanButton?: boolean; // New prop to control scan button visibility
}

export const AddressSearchBox: React.FC<AddressSearchBoxProps> = ({
  value,
  onChangeText,
  placeholder,
  className,
  showScanButton = true, // Default to true to maintain existing behavior
}) => {
  const { t } = useTranslation();
  const { isDark } = useTheme();
  const androidTextFix = useAndroidTextFix();

  const defaultPlaceholder = placeholder || t('send.searchAddress');

  const handleClear = () => {
    onChangeText('');
  };

  const handleScanQR = async () => {
    try {
      const scannedText = await NativeFRWBridge.scanQRCode();
      if (scannedText) {
        onChangeText(scannedText);
      }
    } catch (error: any) {
      // Don't show alert for cancelled scans
      if (error.code !== 'SCAN_CANCELLED') {
        Alert.alert(t('common.error'), t('validation.networkError'));
      }
    }
  };

  return (
    <View className={cn('flex-row items-center gap-2', className)}>
      {/* Search box container - following Figma design */}
      <View
        className={cn(
          'rounded-2xl px-4 flex-row items-center gap-2 bg-input-bg dark:bg-input-bg-dark',
          showScanButton ? 'flex-1' : 'w-full' // Full width when no scan button
        )}
        style={{
          height: 44,
        }}
      >
        {/* Search icon container */}
        <View className="w-6 h-6 items-center justify-center">
          <SearchIcon width={24} height={24} />
        </View>

        {/* Input field */}
        <TextInput
          className="flex-1 text-fg-1 text-base-custom"
          style={[
            androidTextFix,
            {
              fontWeight: '400',
              includeFontPadding: false,
              textAlignVertical: 'center',
              paddingVertical: 0,
              paddingTop: 0,
              paddingBottom: 0,
              lineHeight: 20,
              height: 44,
              marginTop: -2,
            },
          ]}
          value={value}
          onChangeText={onChangeText}
          placeholder={defaultPlaceholder}
          placeholderTextColor={isDark ? 'rgba(179, 179, 179, 0.8)' : 'rgba(118, 118, 118, 0.8)'}
          autoCapitalize="none"
          autoCorrect={false}
        />

        {/* Clear button */}
        {value.length > 0 && (
          <TouchableOpacity onPress={handleClear} className="w-6 h-6 items-center justify-center">
            <CloseIcon width={16} height={16} />
          </TouchableOpacity>
        )}
      </View>

      {/* Scan button - only show if showScanButton is true */}
      {showScanButton && (
        <TouchableOpacity onPress={handleScanQR} className="w-10 h-10 items-center justify-center">
          <ScanIcon width={24} height={24} />
        </TouchableOpacity>
      )}
    </View>
  );
};
