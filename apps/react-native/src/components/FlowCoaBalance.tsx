import { sendSelectors, useSendStore } from '@onflow/frw-stores';
import { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';

import { Text } from '@/components/ui/typography';

interface FlowCoaBalanceProps {
  flowAddress: string;
  showLabel?: boolean;
  autoRefresh?: boolean;
  refreshInterval?: number;
  className?: string;
}

/**
 * Component to display COA balance for EVM accounts
 * Usage: <FlowCoaBalance flowAddress="0x1234..." />
 */
export default function FlowCoaBalance({
  flowAddress,
  showLabel = true,
  autoRefresh = false,
  refreshInterval = 30000,
  className = '',
}: FlowCoaBalanceProps) {
  const balanceData = useSendStore(sendSelectors.getCoaBalance)(flowAddress);

  const { balance, loading, error } = balanceData || {
    balance: null,
    loading: false,
    error: null,
  };

  // Fetch balance on mount and when flowAddress changes
  useEffect(() => {
    if (flowAddress) {
      useSendStore.getState().fetchCoaBalance(flowAddress);
    }
  }, [flowAddress]);

  // Auto-refresh logic
  useEffect(() => {
    if (!autoRefresh || !flowAddress) return;

    const interval = setInterval(() => {
      useSendStore.getState().fetchCoaBalance(flowAddress);
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, flowAddress, refreshInterval]);

  if (loading && balance === null) {
    return (
      <View className={`flex-row items-center gap-2 ${className}`}>
        <ActivityIndicator size="small" />
        <Text className="text-sm text-forend-secondary">Loading balance...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View className={className}>
        <Text className="text-sm text-red-500">
          {showLabel && 'Balance: '}Error loading balance
        </Text>
      </View>
    );
  }

  if (balance === null) {
    return (
      <View className={className}>
        <Text className="text-sm text-forend-secondary">
          {showLabel && 'Balance: '}No COA found
        </Text>
      </View>
    );
  }

  return (
    <View className={className}>
      <Text className="text-sm font-medium text-forend-primary">
        {showLabel && 'Balance: '}
        {balance.toFixed(4)} FLOW
      </Text>
    </View>
  );
}
