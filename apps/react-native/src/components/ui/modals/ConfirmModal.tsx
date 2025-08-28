import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

import { useTheme } from '@/contexts/ThemeContext';
import { useAndroidTextFix } from '@/lib/androidTextFix';

import { BaseModal } from './BaseModal';

interface ConfirmModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  onCancel?: () => void;
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  confirmButtonStyle?: 'primary' | 'danger';
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  visible,
  onClose,
  onConfirm,
  onCancel,
  title = 'Confirm',
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  confirmButtonStyle = 'primary',
}) => {
  const androidTextFix = useAndroidTextFix();
  const { isDark } = useTheme();

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      onClose();
    }
  };

  const getConfirmButtonColors = () => {
    if (confirmButtonStyle === 'danger') {
      return {
        backgroundColor: '#EF4444',
        textColor: '#FFFFFF',
      };
    }
    return {
      backgroundColor: '#FFFFFF',
      textColor: '#252B34',
    };
  };

  const confirmColors = getConfirmButtonColors();

  return (
    <BaseModal
      visible={visible}
      onClose={onClose}
      title={title}
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

      {/* Buttons */}
      <View style={{ gap: 12 }}>
        {/* Confirm Button */}
        <TouchableOpacity
          onPress={onConfirm}
          style={{
            backgroundColor: confirmColors.backgroundColor,
            borderRadius: 16,
            borderWidth: 1,
            borderColor: confirmColors.backgroundColor,
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
                color: confirmColors.textColor,
                fontSize: 16,
                fontWeight: '600',
                lineHeight: 19.2,
                textAlign: 'center',
              },
            ]}
          >
            {confirmText}
          </Text>
        </TouchableOpacity>

        {/* Cancel Button */}
        <TouchableOpacity
          onPress={handleCancel}
          style={{
            backgroundColor: 'transparent',
            borderRadius: 16,
            borderWidth: 1,
            borderColor: isDark ? '#4A4A4A' : '#E5E5E5',
            paddingVertical: 16,
            paddingHorizontal: 20,
            alignItems: 'center',
          }}
        >
          <Text
            style={[
              androidTextFix,
              {
                color: isDark ? '#FFFFFF' : '#252B34',
                fontSize: 16,
                fontWeight: '600',
                lineHeight: 19.2,
                textAlign: 'center',
              },
            ]}
          >
            {cancelText}
          </Text>
        </TouchableOpacity>
      </View>
    </BaseModal>
  );
};
