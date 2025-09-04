import React, { useState } from 'react';
import { View, TouchableOpacity, ActivityIndicator } from 'react-native';

import { useStorageWarning } from '@/hooks/useStorageWarning';
import { Text } from 'ui';

import { InfoIcon } from '../icons/InfoIcon';
import { StorageInfoModal } from '../modals/StorageInfoModal';

export const StorageWarning: React.FC = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const { shouldShowWarning, isLoading } = useStorageWarning();

  // Don't render if not needed
  if (!shouldShowWarning && !isLoading) {
    return null;
  }

  // Theme-aware colors
  const warningTextColor = 'rgb(253, 176, 34)'; // Uses --warning from global.css

  return (
    <View
      style={{
        flexDirection: 'column',
        gap: 4,
        width: '100%',
        marginTop: 16,
      }}
    >
      {/* Loading state */}
      {isLoading && (
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <ActivityIndicator size="small" color={warningTextColor} />
          <Text className="text-fg-2 text-sm font-normal" style={{ lineHeight: 20 }}>
            Checking storage conditions...
          </Text>
        </View>
      )}

      {/* Warning content - only show if shouldShowWarning is true */}
      {shouldShowWarning && !isLoading && (
        <>
          {/* Header */}
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 3,
                flex: 1,
              }}
            >
              <Text
                className="text-fg-1 text-sm font-normal"
                style={{
                  lineHeight: 20,
                  flex: 1,
                  flexShrink: 1,
                }}
              >
                Storage Warning
              </Text>
              <TouchableOpacity
                onPress={() => setIsModalVisible(true)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <InfoIcon width={15} height={14} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Warning Message */}
          <Text
            style={{
              color: warningTextColor,
              fontSize: 14,
              fontWeight: '400',
              lineHeight: 20,
              letterSpacing: -0.084,
            }}
          >
            Account balance will fall below the minimum FLOW required for storage after this
            transaction, causing this transaction to fail.
          </Text>
        </>
      )}

      {/* Storage Info Modal */}
      <StorageInfoModal visible={isModalVisible} onClose={() => setIsModalVisible(false)} />
    </View>
  );
};
