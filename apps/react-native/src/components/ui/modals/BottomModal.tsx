import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  Pressable,
  type StyleProp,
  type ViewStyle,
  type TextStyle,
} from 'react-native';

import { useTheme } from '@/contexts/ThemeContext';
import { useAndroidTextFix } from '@/lib/androidTextFix';

import { CloseIcon } from '../icons/CloseIcon';

interface BottomModalProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  showCloseButton?: boolean;
  onBackdropPress?: () => void;
  containerStyle?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
  titleStyle?: StyleProp<TextStyle>;
  showHandle?: boolean;
}

export const BottomModal: React.FC<BottomModalProps> = ({
  visible,
  onClose,
  title,
  children,
  showCloseButton = true,
  onBackdropPress,
  containerStyle,
  contentStyle,
  titleStyle,
  showHandle = true,
}) => {
  const androidTextFix = useAndroidTextFix();
  const { isDark } = useTheme();

  const handleBackdropPress = () => {
    if (onBackdropPress) {
      onBackdropPress();
    } else {
      onClose();
    }
  };

  return (
    <Modal transparent={true} visible={visible} animationType="slide" onRequestClose={onClose}>
      {/* Backdrop */}
      <Pressable
        style={{ flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
        onPress={handleBackdropPress}
      >
        {/* Modal Container */}
        <View
          style={[
            {
              flex: 1,
              justifyContent: 'flex-end',
            },
            containerStyle,
          ]}
        >
          <Pressable onPress={() => {}}>
            {/* Modal Content */}
            <View
              style={[
                {
                  backgroundColor: isDark ? '#2A2A2A' : '#FFFFFF',
                  borderTopLeftRadius: 24,
                  borderTopRightRadius: 24,
                  paddingTop: showHandle ? 12 : 20,
                  paddingBottom: 32,
                  paddingHorizontal: 20,
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: -2 },
                  shadowOpacity: 0.25,
                  shadowRadius: 16,
                  elevation: 16,
                  minHeight: 200,
                },
                contentStyle,
              ]}
            >
              {/* Handle */}
              {showHandle && (
                <View
                  style={{
                    width: 36,
                    height: 4,
                    backgroundColor: isDark ? '#4A4A4A' : '#E5E5E5',
                    borderRadius: 2,
                    alignSelf: 'center',
                    marginBottom: 20,
                  }}
                />
              )}

              {/* Header */}
              {(title || showCloseButton) && (
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: 20,
                  }}
                >
                  {title ? (
                    <Text
                      style={[
                        androidTextFix,
                        {
                          color: isDark ? '#FFFFFF' : '#000000',
                          fontSize: 20,
                          fontWeight: '700',
                          lineHeight: 24,
                          flex: 1,
                          textAlign: showCloseButton ? 'center' : 'left',
                        },
                        titleStyle,
                      ]}
                    >
                      {title}
                    </Text>
                  ) : (
                    <View style={{ flex: 1 }} />
                  )}

                  {showCloseButton && (
                    <TouchableOpacity
                      onPress={onClose}
                      style={{
                        width: 32,
                        height: 32,
                        backgroundColor: isDark
                          ? 'rgba(255, 255, 255, 0.1)'
                          : 'rgba(0, 0, 0, 0.03)',
                        borderRadius: 16,
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <CloseIcon width={16} height={16} />
                    </TouchableOpacity>
                  )}
                </View>
              )}

              {/* Content */}
              {children}
            </View>
          </Pressable>
        </View>
      </Pressable>
    </Modal>
  );
};
