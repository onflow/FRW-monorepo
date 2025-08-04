import React from 'react';
import { View, Text, TouchableOpacity, Modal, Pressable } from 'react-native';
import { useAndroidTextFix } from '@/lib/androidTextFix';
import { useTheme } from '@/contexts/ThemeContext';
import { CloseIcon } from '../index';

interface StorageInfoModalProps {
  visible: boolean;
  onClose: () => void;
}

export const StorageInfoModal: React.FC<StorageInfoModalProps> = ({ visible, onClose }) => {
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
          <Pressable onPress={() => {}} style={{ width: '100%', maxWidth: 339 }}>
            {/* Modal Content */}
            <View
              style={{
                backgroundColor: isDark ? '#2A2A2A' : '#FFFFFF',
                borderRadius: 16,
                paddingTop: 21, // Adjusted to match Figma positioning
                paddingBottom: 20,
                paddingHorizontal: 20, // Adjusted for button alignment
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 5 },
                shadowOpacity: 0.25,
                shadowRadius: 12,
                elevation: 8,
              }}
            >
              {/* Header */}
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: 17, // Match Figma 17px gap
                }}
              >
                <Text
                  style={[
                    androidTextFix,
                    {
                      color: isDark ? '#FFFFFF' : '#000000',
                      fontSize: 18,
                      fontWeight: '700',
                      lineHeight: 21.8, // 1.21 * 18 from Figma
                      flex: 1,
                      textAlign: 'center',
                    },
                  ]}
                >
                  Storage Limit Warning
                </Text>

                <TouchableOpacity
                  onPress={onClose}
                  style={{
                    width: 24,
                    height: 24,
                    backgroundColor: 'rgba(0, 0, 0, 0.03)',
                    borderRadius: 12,
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginTop: -2, // Fine-tune vertical alignment
                  }}
                >
                  <CloseIcon width={13} height={13} />
                </TouchableOpacity>
              </View>

              {/* Body Text */}
              <Text
                style={[
                  androidTextFix,
                  {
                    color: isDark ? '#FFFFFF' : '#000000',
                    fontSize: 14,
                    fontWeight: '400',
                    lineHeight: 20, // 1.43 * 14 from Figma
                    letterSpacing: -0.084, // -0.6% of 14px
                    textAlign: 'center',
                    marginBottom: 17,
                  },
                ]}
              >
                Your account is below the minimum FLOW balance required for its storage usage, which
                may cause subsequent transactions to fail.
              </Text>

              {/* Storage Amount Requirement */}
              <Text
                style={[
                  androidTextFix,
                  {
                    color: '#FDB022', // Warning color from Figma
                    fontSize: 14,
                    fontWeight: '400',
                    lineHeight: 20,
                    letterSpacing: -0.084,
                    textAlign: 'center',
                    marginBottom: 17,
                  },
                ]}
              >
                You must have at least 0.001 FLOW in your account to cover your storage usage.
              </Text>

              {/* Add FLOW Button */}
              <TouchableOpacity
                onPress={() => {
                  onClose();
                  // TODO: Handle add FLOW action - navigate to fund/add FLOW screen
                  console.log('Add FLOW pressed');
                }}
                style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: 16,
                  borderWidth: 1,
                  borderColor: '#FFFFFF',
                  paddingVertical: 16,
                  paddingHorizontal: 20,
                  alignItems: 'center',
                  width: '100%', // Ensure full width within padding
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
                      color: '#252B34',
                      fontSize: 16,
                      fontWeight: '600',
                      lineHeight: 19.2, // 1.2 * 16 from Figma
                      textAlign: 'center',
                      minWidth: 200,
                    },
                  ]}
                >
                  Add FLOW
                </Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </View>
      </Pressable>
    </Modal>
  );
};
