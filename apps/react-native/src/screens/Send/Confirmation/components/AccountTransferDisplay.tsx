import type { WalletAccount } from '@onflow/frw-types';
import React from 'react';
import { View } from 'react-native';

import { SendConfirmation as SendConfirmationIcon } from 'icons';

import { AccountCard } from './AccountCard';

interface AccountTransferDisplayProps {
  fromAccount: WalletAccount;
  toAccount: WalletAccount;
}

export const AccountTransferDisplay: React.FC<AccountTransferDisplayProps> = ({
  fromAccount,
  toAccount,
}) => {
  return (
    <View className="items-center" style={{ width: '100%', gap: 16 }}>
      {/* SendConfirmation SVG */}
      <SendConfirmationIcon width={399} height={148} />

      {/* Transfer Visual with Account Cards */}
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          width: '100%',
          paddingHorizontal: 20,
        }}
      >
        {/* From Account (Left) */}
        <AccountCard
          emoji={fromAccount.emojiInfo?.emoji}
          avatar={fromAccount.avatar}
          name={fromAccount.name}
          address={fromAccount.address}
          backgroundColor={fromAccount.emojiInfo?.color}
          defaultEmoji="👤"
          parentEmoji={(fromAccount as any).parentEmoji}
          type={(fromAccount as any).type}
        />

        {/* Progress Dots (Center) */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 4,
            justifyContent: 'center',
            flex: 1,
          }}
        >
          <View
            style={{
              width: 8,
              height: 8,
              borderRadius: 4,
              backgroundColor: 'rgba(0, 239, 139, 0.1)',
            }}
          />
          <View
            style={{
              width: 8,
              height: 8,
              borderRadius: 4,
              backgroundColor: 'rgba(0, 239, 139, 0.2)',
            }}
          />
          <View
            style={{
              width: 8,
              height: 8,
              borderRadius: 4,
              backgroundColor: 'rgba(0, 239, 139, 0.3)',
            }}
          />
          <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#009154' }} />
          <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#00EF8B' }} />
          <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#00EF8B' }} />
        </View>

        {/* To Account (Right) */}
        <AccountCard
          emoji={toAccount.emojiInfo?.emoji}
          avatar={toAccount.avatar}
          name={toAccount.name}
          address={toAccount.address}
          backgroundColor={toAccount.emojiInfo?.color}
          defaultEmoji="👤"
          parentEmoji={(toAccount as any).parentEmoji}
          type={(toAccount as any).type}
        />
      </View>
    </View>
  );
};
