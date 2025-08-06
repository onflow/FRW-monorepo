import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import NativeFRWBridge from '@/bridge/NativeFRWBridge';
import { Text } from 'ui';

import { FlowLogo } from '../index';


interface TransactionFeeSectionProps {
  transactionFee: string;
}

export const TransactionFeeSection: React.FC<TransactionFeeSectionProps> = ({ transactionFee }) => {
  const { t } = useTranslation();
  const [isFreeGasEnabled, setIsFreeGasEnabled] = useState(true); // Default to true for initial display

  useEffect(() => {
    const checkFreeGasStatus = async () => {
      try {
        const isEnabled = await NativeFRWBridge.isFreeGasEnabled();
        setIsFreeGasEnabled(isEnabled);
      } catch (error) {
        console.error('Failed to check free gas status:', error);
        // Default to enabled if we can't determine the status
        setIsFreeGasEnabled(true);
      }
    };

    checkFreeGasStatus();
  }, []);
  return (
    <View className="gap-2 mt-6">
      <View className="flex-row items-center justify-between w-full">
        <View className="flex-1">
          <Text
            className="text-fg-1 text-sm font-normal"
            style={{
              lineHeight: 20,
            }}
          >
            {t('transaction.fee')}
          </Text>
        </View>
        <View className="flex-row items-center" style={{ gap: 4 }}>
          {isFreeGasEnabled ? (
            <>
              <Text
                className="text-fg-2/60 text-sm font-normal"
                style={{
                  lineHeight: 20,
                  textDecorationLine: 'line-through',
                }}
                numberOfLines={1}
              >
                {transactionFee}
              </Text>
              <Text
                className="text-fg-1 text-sm font-medium"
                style={{
                  lineHeight: 20,
                }}
                numberOfLines={1}
              >
                0.00
              </Text>
            </>
          ) : (
            <Text
              className="text-fg-1 text-sm font-medium"
              style={{
                lineHeight: 20,
              }}
              numberOfLines={1}
            >
              {transactionFee}
            </Text>
          )}
          <FlowLogo width={16} height={16} />
        </View>
      </View>
      {isFreeGasEnabled && (
        <View className="w-full">
          <Text
            className="text-fg-2/60 text-sm font-normal"
            style={{
              lineHeight: 20,
              textAlign: 'right',
            }}
          >
            {t('transaction.coveredByFlowWallet')}
          </Text>
        </View>
      )}
    </View>
  );
};
