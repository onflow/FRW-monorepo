import type { WalletAccount } from '@onflow/frw-types';
import React from 'react';
import { View } from 'react-native';

import { SendConfirmationAnimation } from '@/components/ui/animations/SendConfirmationAnimation';

import { AccountCard } from './AccountCard';

interface Token {
  symbol?: string;
  name?: string;
  logoURI?: string;
  identifier?: string;
}

interface NFT {
  id: string | number;
  name?: string;
  thumbnail?: string | object;
  collectionName?: string;
  collection_logo?: string;
  logoURI?: string;
  logo?: string;
  collection?: {
    logo?: string;
    logoURI?: string;
    name?: string;
  };
}

interface AccountTransferDisplayProps {
  fromAccount: WalletAccount;
  toAccount: WalletAccount;
  selectedToken?: Token;
  selectedNFTs?: NFT[];
  transactionType?: string;
}

export const AccountTransferDisplay: React.FC<AccountTransferDisplayProps> = ({
  fromAccount,
  toAccount,
  selectedToken,
  selectedNFTs,
  transactionType,
}) => {
  return (
    <View className="items-center" style={{ width: '100%', gap: 16 }}>
      {/* SendConfirmation Animation */}
      <SendConfirmationAnimation
        width={399}
        height={148}
        autoPlay={true}
        selectedToken={selectedToken}
        selectedNFTs={selectedNFTs}
        transactionType={transactionType}
      />

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

        {/* Spacer (Center) */}
        <View
          style={{
            flex: 1,
          }}
        />

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
