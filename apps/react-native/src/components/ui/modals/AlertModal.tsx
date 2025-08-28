import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

import { useTheme } from '@/contexts/ThemeContext';
import { useAndroidTextFix } from '@/lib/androidTextFix';

import { BaseModal } from './BaseModal';

interface AlertModalProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  message: string;
  buttonText?: string;
  alertType?: 'info' | 'warning' | 'error' | 'success';
}

export const AlertModal: React.FC<AlertModalProps> = ({
  visible,
  onClose,
  title,
  message,
  buttonText = 'OK',
  alertType = 'info',
}) => {
  const androidTextFix = useAndroidTextFix();
  const { isDark } = useTheme();

  const getAlertColors = () => {
    switch (alertType) {
      case 'warning':
        return {
          accentColor: '#FDB022',
          buttonColor: '#FDB022',
          buttonTextColor: '#000000',
        };
      case 'error':
        return {
          accentColor: '#EF4444',
          buttonColor: '#EF4444',
          buttonTextColor: '#FFFFFF',
        };
      case 'success':
        return {
          accentColor: '#10B981',
          buttonColor: '#10B981',
          buttonTextColor: '#FFFFFF',
        };
      default:
        return {
          accentColor: '#3B82F6',
          buttonColor: '#FFFFFF',
          buttonTextColor: '#252B34',
        };
    }
  };

  const colors = getAlertColors();

  const defaultTitle = () => {
    switch (alertType) {
      case 'warning':
        return 'Warning';
      case 'error':
        return 'Error';
      case 'success':
        return 'Success';
      default:
        return 'Information';
    }
  };

  return (
    <BaseModal
      visible={visible}
      onClose={onClose}
      title={title || defaultTitle()}
      maxWidth={343}
      showCloseButton={true}
      closeButtonPosition="header"
    >
      {/* Message */}
      <Text
        style={[
          androidTextFix,
          {
            color: isDark ? '#FFFFFF' : '#000000',
            fontSize: 14,
            fontWeight: '400',
            lineHeight: 20,
            letterSpacing: -0.084,
            textAlign: 'center',
            marginBottom: 24,
          },
        ]}
      >
        {message}
      </Text>

      {/* Optional accent element for warning/error types */}
      {(alertType === 'warning' || alertType === 'error') && (
        <View
          style={{
            backgroundColor: `${colors.accentColor}20`,
            borderRadius: 8,
            paddingVertical: 12,
            paddingHorizontal: 16,
            marginBottom: 24,
            borderLeftWidth: 4,
            borderLeftColor: colors.accentColor,
          }}
        >
          <Text
            style={[
              androidTextFix,
              {
                color: colors.accentColor,
                fontSize: 14,
                fontWeight: '500',
                lineHeight: 20,
                letterSpacing: -0.084,
                textAlign: 'center',
              },
            ]}
          >
            {alertType === 'warning' ? 'Please review the information above.' : 'Action required'}
          </Text>
        </View>
      )}

      {/* OK Button */}
      <TouchableOpacity
        onPress={onClose}
        style={{
          backgroundColor: colors.buttonColor,
          borderRadius: 16,
          borderWidth: 1,
          borderColor: colors.buttonColor,
          paddingVertical: 16,
          paddingHorizontal: 20,
          alignItems: 'center',
          shadowColor: 'rgba(16, 24, 40, 0.05)',
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 1,
          shadowRadius: 2,
          elevation: 2,
        }}
      >
        <Text
          style={[
            androidTextFix,
            {
              color: colors.buttonTextColor,
              fontSize: 16,
              fontWeight: '600',
              lineHeight: 19.2,
              textAlign: 'center',
            },
          ]}
        >
          {buttonText}
        </Text>
      </TouchableOpacity>
    </BaseModal>
  );
};
