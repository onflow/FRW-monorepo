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

interface BaseModalProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  maxWidth?: number;
  showCloseButton?: boolean;
  closeButtonPosition?: 'header' | 'absolute';
  animationType?: 'none' | 'slide' | 'fade';
  onBackdropPress?: () => void;
  containerStyle?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
  titleStyle?: StyleProp<TextStyle>;
}

export const BaseModal: React.FC<BaseModalProps> = ({
  visible,
  onClose,
  title,
  children,
  maxWidth = 343,
  showCloseButton = true,
  closeButtonPosition = 'header',
  animationType = 'fade',
  onBackdropPress,
  containerStyle,
  contentStyle,
  titleStyle,
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

  const renderCloseButton = () => {
    if (!showCloseButton) return null;

    if (closeButtonPosition === 'absolute') {
      return (
        <TouchableOpacity
          onPress={onClose}
          style={{
            position: 'absolute',
            top: 16,
            right: 16,
            width: 24,
            height: 24,
            backgroundColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.03)',
            borderRadius: 12,
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1,
          }}
        >
          <CloseIcon width={13} height={13} />
        </TouchableOpacity>
      );
    }

    return (
      <TouchableOpacity
        onPress={onClose}
        style={{
          width: 24,
          height: 24,
          backgroundColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.03)',
          borderRadius: 12,
          alignItems: 'center',
          justifyContent: 'center',
          marginTop: -2,
        }}
      >
        <CloseIcon width={13} height={13} />
      </TouchableOpacity>
    );
  };

  const renderHeader = () => {
    if (!title && closeButtonPosition !== 'header') return null;

    return (
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: title ? 17 : 0,
        }}
      >
        {title ? (
          <Text
            style={[
              androidTextFix,
              {
                color: isDark ? '#FFFFFF' : '#000000',
                fontSize: 18,
                fontWeight: '700',
                lineHeight: 21.8,
                flex: 1,
                textAlign: showCloseButton && closeButtonPosition === 'header' ? 'center' : 'left',
              },
              titleStyle,
            ]}
          >
            {title}
          </Text>
        ) : (
          <View style={{ flex: 1 }} />
        )}

        {closeButtonPosition === 'header' && renderCloseButton()}
      </View>
    );
  };

  return (
    <Modal
      transparent={true}
      visible={visible}
      animationType={animationType}
      onRequestClose={onClose}
    >
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
              justifyContent: 'center',
              alignItems: 'center',
              paddingHorizontal: 16,
            },
            containerStyle,
          ]}
        >
          <Pressable onPress={() => {}} style={{ width: '100%', maxWidth }}>
            {/* Modal Content */}
            <View
              style={[
                {
                  backgroundColor: isDark ? '#2A2A2A' : '#FFFFFF',
                  borderRadius: 16,
                  paddingTop: closeButtonPosition === 'absolute' ? 16 : 21,
                  paddingBottom: 20,
                  paddingHorizontal: 20,
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 5 },
                  shadowOpacity: 0.25,
                  shadowRadius: 12,
                  elevation: 8,
                  position: 'relative',
                },
                contentStyle,
              ]}
            >
              {closeButtonPosition === 'absolute' && renderCloseButton()}
              {renderHeader()}
              {children}
            </View>
          </Pressable>
        </View>
      </Pressable>
    </Modal>
  );
};
