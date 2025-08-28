import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';

import { useTheme } from '@/contexts/ThemeContext';
import { useAndroidTextFix } from '@/lib/androidTextFix';

import { BottomModal } from './BottomModal';

export interface ActionSheetItem {
  id: string;
  title: string;
  onPress: () => void;
  icon?: React.ReactNode;
  destructive?: boolean;
  disabled?: boolean;
}

interface ActionSheetProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  message?: string;
  actions: ActionSheetItem[];
  showCancel?: boolean;
  cancelText?: string;
}

export const ActionSheet: React.FC<ActionSheetProps> = ({
  visible,
  onClose,
  title,
  message,
  actions,
  showCancel = true,
  cancelText = 'Cancel',
}) => {
  const androidTextFix = useAndroidTextFix();
  const { isDark } = useTheme();

  const handleActionPress = (action: ActionSheetItem) => {
    if (action.disabled) return;
    action.onPress();
    onClose();
  };

  return (
    <BottomModal
      visible={visible}
      onClose={onClose}
      title={title}
      showCloseButton={false}
      showHandle={true}
    >
      {/* Message */}
      {message && (
        <Text
          style={[
            androidTextFix,
            {
              color: isDark ? '#CCCCCC' : '#666666',
              fontSize: 14,
              fontWeight: '400',
              lineHeight: 20,
              letterSpacing: -0.084,
              textAlign: 'center',
              marginBottom: 24,
              paddingHorizontal: 16,
            },
          ]}
        >
          {message}
        </Text>
      )}

      {/* Actions */}
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={{ gap: 1 }}>
          {actions.map((action, index) => (
            <TouchableOpacity
              key={action.id}
              onPress={() => handleActionPress(action)}
              disabled={action.disabled}
              style={{
                backgroundColor: isDark ? '#3A3A3A' : '#F8F9FA',
                paddingVertical: 16,
                paddingHorizontal: 20,
                borderRadius: index === 0 ? 12 : index === actions.length - 1 ? 12 : 0,
                borderTopLeftRadius: index === 0 ? 12 : 0,
                borderTopRightRadius: index === 0 ? 12 : 0,
                borderBottomLeftRadius: index === actions.length - 1 ? 12 : 0,
                borderBottomRightRadius: index === actions.length - 1 ? 12 : 0,
                opacity: action.disabled ? 0.5 : 1,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 12,
              }}
            >
              {action.icon && (
                <View
                  style={{ width: 20, height: 20, alignItems: 'center', justifyContent: 'center' }}
                >
                  {action.icon}
                </View>
              )}

              <Text
                style={[
                  androidTextFix,
                  {
                    color: action.destructive
                      ? '#EF4444'
                      : action.disabled
                        ? isDark
                          ? '#666666'
                          : '#999999'
                        : isDark
                          ? '#FFFFFF'
                          : '#000000',
                    fontSize: 16,
                    fontWeight: '500',
                    lineHeight: 20,
                    textAlign: 'center',
                    flex: action.icon ? 0 : 1,
                  },
                ]}
              >
                {action.title}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Cancel Button */}
        {showCancel && (
          <TouchableOpacity
            onPress={onClose}
            style={{
              backgroundColor: isDark ? '#2A2A2A' : '#FFFFFF',
              borderRadius: 12,
              paddingVertical: 16,
              paddingHorizontal: 20,
              marginTop: 12,
              borderWidth: 1,
              borderColor: isDark ? '#4A4A4A' : '#E5E5E5',
            }}
          >
            <Text
              style={[
                androidTextFix,
                {
                  color: isDark ? '#FFFFFF' : '#000000',
                  fontSize: 16,
                  fontWeight: '600',
                  lineHeight: 20,
                  textAlign: 'center',
                },
              ]}
            >
              {cancelText}
            </Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </BottomModal>
  );
};
