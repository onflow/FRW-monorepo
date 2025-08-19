import { Send, Download, ArrowUpDown, CreditCard, ArrowRightLeft } from '@onflow/frw-icons';
import { XStack, YStack, Text, Spinner } from '@onflow/frw-ui';
import React from 'react';

interface ButtonRowProps {
  onSendClick?: () => void;
  onReceiveClick?: () => void;
  onSwapClick?: () => void;
  onBuyClick?: () => void;
  onMoveClick?: () => void;
  canMoveChild?: boolean;
}

const IconButton: React.FC<{
  icon: React.ReactNode;
  label: string;
  onPress?: () => void;
  loading?: boolean;
  disabled?: boolean;
}> = ({ icon, label, onPress, loading = false, disabled = false }) => (
  <YStack
    style={{
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      opacity: disabled ? 0.5 : 1,
    }}
    onPress={disabled ? undefined : onPress}
  >
    <YStack
      style={{
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      {loading ? <Spinner size="small" color="white" /> : icon}
    </YStack>
    <Text fontSize="$3" fontWeight="500" color="white" style={{ textAlign: 'center' }}>
      {label}
    </Text>
  </YStack>
);

export const ButtonRow: React.FC<ButtonRowProps> = ({
  onSendClick,
  onReceiveClick,
  onSwapClick,
  onBuyClick,
  onMoveClick,
  canMoveChild,
}) => {
  return (
    <XStack
      style={{
        justifyContent: 'space-between',
        paddingHorizontal: 24,
        paddingVertical: 16,
        width: '100%',
        maxWidth: 500,
        alignSelf: 'center',
      }}
    >
      <IconButton icon={<Send size="$5" color="white" />} label="Send" onPress={onSendClick} />

      <IconButton
        icon={<Download size="$5" color="white" />}
        label="Receive"
        onPress={onReceiveClick}
      />

      <IconButton
        icon={<ArrowUpDown size="$5" color="white" />}
        label="Swap"
        onPress={onSwapClick}
      />

      <IconButton icon={<CreditCard size="$5" color="white" />} label="Buy" onPress={onBuyClick} />

      {canMoveChild === undefined ? (
        <IconButton
          icon={<ArrowRightLeft size="$5" color="white" />}
          label="Move"
          loading={true}
          disabled={true}
        />
      ) : canMoveChild ? (
        <IconButton
          icon={<ArrowRightLeft size="$5" color="white" />}
          label="Move"
          onPress={onMoveClick}
        />
      ) : null}
    </XStack>
  );
};
