import React from 'react';
import { View, Text, TouchableOpacity, Modal, Pressable } from 'react-native';
import { useAndroidTextFix } from '@/lib/androidTextFix';
import { useTheme } from '@/contexts/ThemeContext';
import Svg, { Path } from 'react-native-svg';

interface FirstTimeSendModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  recipientAddress: string;
  recipientName?: string;
}

export const FirstTimeSendModal: React.FC<FirstTimeSendModalProps> = ({
  visible,
  onClose,
  onConfirm,
  recipientAddress,
  _recipientName,
}) => {
  const androidTextFix = useAndroidTextFix();
  const { isDark } = useTheme();

  return (
    <Modal transparent={true} visible={visible} animationType="fade" onRequestClose={onClose}>
      {/* Backdrop */}
      <Pressable style={{ flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.5)' }} onPress={onClose}>
        {/* Modal Container */}
        <View
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            paddingHorizontal: 16,
          }}
        >
          <Pressable onPress={() => {}} style={{ width: '100%', maxWidth: 343 }}>
            {/* Modal Content */}
            <View
              style={{
                backgroundColor: isDark ? '#2A2A2A' : '#FFFFFF',
                borderRadius: 16,
                padding: 16,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 5 },
                shadowOpacity: 0.25,
                shadowRadius: 12,
                elevation: 8,
                position: 'relative',
              }}
            >
              {/* Close Button */}
              <TouchableOpacity
                onPress={onClose}
                style={{
                  position: 'absolute',
                  top: 16,
                  right: 16,
                  width: 24,
                  height: 24,
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  borderRadius: 12,
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: 1,
                }}
              >
                <Svg width={8} height={8} viewBox="0 0 8 8" fill="none">
                  <Path
                    d="M7 1L1 7M1 1L7 7"
                    stroke="rgba(255, 255, 255, 0.3)"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </Svg>
              </TouchableOpacity>

              {/* Content Container */}
              <View style={{ alignItems: 'center', gap: 16, width: 311, alignSelf: 'center' }}>
                {/* Header */}
                <View style={{ alignItems: 'center', gap: 16, width: '100%' }}>
                  {/* Title */}
                  <Text
                    style={[
                      androidTextFix,
                      {
                        color: '#FFFFFF',
                        fontSize: 18,
                        fontWeight: '700',
                        lineHeight: 32,
                        letterSpacing: -0.306,
                        textAlign: 'center',
                        width: '100%',
                      },
                    ]}
                  >
                    Confirm address
                  </Text>

                  {/* Body Text */}
                  <Text
                    style={[
                      androidTextFix,
                      {
                        color: '#FFFFFF',
                        fontSize: 14,
                        fontWeight: '300',
                        lineHeight: 20,
                        letterSpacing: -0.084,
                        textAlign: 'center',
                        width: 270.9,
                      },
                    ]}
                  >
                    We noticed this may be your first time sending to this address. Please confirm
                    the destination address.
                  </Text>

                  {/* Address Container */}
                  <View
                    style={{
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      borderRadius: 8,
                      paddingVertical: 16,
                      paddingHorizontal: 16,
                      width: 290,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Text
                      style={[
                        androidTextFix,
                        {
                          color: '#FFFFFF',
                          fontSize: 14,
                          fontWeight: '600',
                          lineHeight: 16.8,
                          letterSpacing: -0.084,
                          textAlign: 'left',
                          width: 248.49,
                        },
                      ]}
                    >
                      {recipientAddress}
                    </Text>
                  </View>
                </View>

                {/* Confirm Button */}
                <TouchableOpacity
                  onPress={onConfirm}
                  style={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: 12,
                    paddingVertical: 12,
                    paddingHorizontal: 16,
                    width: 297,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Text
                    style={[
                      androidTextFix,
                      {
                        color: 'rgba(0, 0, 0, 0.9)',
                        fontSize: 14,
                        fontWeight: '700',
                        lineHeight: 20,
                        letterSpacing: -0.14,
                        textAlign: 'center',
                      },
                    ]}
                  >
                    Confirm address
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </Pressable>
        </View>
      </Pressable>
    </Modal>
  );
};
