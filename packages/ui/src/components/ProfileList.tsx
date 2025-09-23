import type { WalletProfile } from '@onflow/frw-types';
import React from 'react';
import { YStack, XStack, Text, Separator } from 'tamagui';

import { RecipientItem } from './RecipientItem';
import { type RecipientData } from './RecipientList';
import { RefreshView } from './RefreshView';
import { Avatar } from '../foundation/Avatar';

export interface ProfileListProps {
  profiles: WalletProfile[];
  onAccountPress?: (recipient: any) => void;
  isLoading?: boolean;
  emptyTitle?: string;
  emptyMessage?: string;
}

export function ProfileList({
  profiles,
  onAccountPress,
  isLoading = false,
  emptyTitle = 'No Profiles',
  emptyMessage = 'No profiles found',
}: ProfileListProps): React.ReactElement {
  if (isLoading) {
    return (
      <YStack items="center" justifyContent="center" py="$4">
        <Text color="$color" fontSize="$3">
          Loading profiles...
        </Text>
      </YStack>
    );
  }

  if (!profiles || profiles.length === 0) {
    return <RefreshView type="empty" title={emptyTitle} message={emptyMessage} />;
  }

  return (
    <YStack>
      {profiles.map((profile, index) => (
        <React.Fragment key={profile.uid}>
          <ProfileItem
            profile={profile}
            onAccountPress={onAccountPress}
            isLast={index === profiles.length - 1}
          />
          {index < profiles.length - 1 && <Separator />}
        </React.Fragment>
      ))}
    </YStack>
  );
}

interface ProfileItemProps {
  profile: WalletProfile;
  onAccountPress?: (recipient: any) => void;
  isLast?: boolean;
}

function ProfileItem({
  profile,
  onAccountPress,
  isLast = false,
}: ProfileItemProps): React.ReactElement {
  const handleAccountPress = (account: any) => {
    onAccountPress?.(account);
  };

  // Convert profile accounts to RecipientData format
  const accountsData: RecipientData[] = profile.accounts.map((account) => {
    const data = {
      id: account.address,
      name: account.name,
      address: account.address,
      avatar: account.avatar,
      emojiInfo: account.emojiInfo,
      parentEmojiInfo: account.parentEmoji || null,
      type: 'account' as const,
      isSelected: false,
      isLinked: !!(account.parentAddress || account.type === 'child'),
      isEVM: account.type === 'evm',
      balance: (account as any).balance || '0 FLOW', // Balance is added in SendToScreen
      showBalance: true,
    };
    return data;
  });

  return (
    <YStack>
      {/* Profile Header */}
      <YStack p="$3" bg="$bgDrawer">
        <XStack items="center" gap="$3">
          <Avatar
            src={profile.avatar?.startsWith('http') ? profile.avatar : undefined}
            fallback={
              profile.avatar && profile.avatar.length <= 4
                ? profile.avatar
                : profile.name.charAt(0).toUpperCase()
            }
            size={26}
            bgColor="$gray8"
          />
          <Text
            color="$color"
            fontSize="$3"
            fontWeight="600"
            whiteSpace="nowrap"
            letterSpacing={-0.084}
          >
            {profile.name}
          </Text>
        </XStack>
      </YStack>

      <Separator mt="$2" mb="$2" />

      {/* Accounts List */}
      <YStack px="$3">
        {accountsData.map((account, index) => (
          <React.Fragment key={account.id}>
            <RecipientItem {...account} onPress={() => handleAccountPress(account)} />
            {index < accountsData.length - 1 && <Separator mt="$2" mb="$2" />}
          </React.Fragment>
        ))}
      </YStack>
    </YStack>
  );
}
