import React from 'react';
import { View, Text, TouchableOpacity, Modal, Pressable } from 'react-native';

import { useAndroidTextFix } from '@/lib/androidTextFix';

import { CloseIcon } from '../index';

interface AccountCompatibilityModalProps {
  visible: boolean;
  onClose: () => void;
}

export const AccountCompatibilityModal: React.FC<AccountCompatibilityModalProps> = ({
  visible,
  onClose,
}) => {
  const androidTextFix = useAndroidTextFix();

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
                backgroundColor: '#2A2A2A',
                borderRadius: 16,
                paddingTop: 8,
                paddingBottom: 16,
                paddingHorizontal: 16,
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
                  marginBottom: 6,
                }}
              >
                <Text
                  style={[
                    androidTextFix,
                    {
                      color: '#FFFFFF',
                      fontSize: 18,
                      fontWeight: '700',
                      lineHeight: 32,
                      letterSpacing: -0.31,
                      flex: 1,
                      textAlign: 'center',
                    },
                  ]}
                >
                  Account Compatibility
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
                    color: '#FFFFFF',
                    fontSize: 14,
                    fontWeight: '300',
                    lineHeight: 20,
                    letterSpacing: -0.084,
                    textAlign: 'center',
                    marginBottom: 40,
                  },
                ]}
              >
                Flow Wallet manages your EVM and your Cadence accounts on Flow. EVM accounts are
                compatible with EVM apps, and Cadence accounts are compatible with Cadence apps.{' '}
                {'\n\n'}If an application is on EVM or Cadence, only compatible accounts will be
                available to connect.
              </Text>

              {/* Okay Button */}
              <TouchableOpacity
                onPress={onClose}
                style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: 16,
                  borderWidth: 1,
                  borderColor: '#FFFFFF',
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
                      color: '#252B34',
                      fontSize: 16,
                      fontWeight: '600',
                      includeFontPadding: true,
                      textAlignVertical: 'top',
                      lineHeight: 22,
                    },
                  ]}
                >
                  Okay
                </Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </View>
      </Pressable>
    </Modal>
  );
};
