import type { WalletProfile } from '@onflow/frw-types';
import React from 'react';
import { YStack, XStack } from 'tamagui';


import { RecipientItem } from './RecipientItem';
import { type RecipientData } from './RecipientList';
import { RefreshView } from './RefreshView';
import { Avatar } from '../foundation/Avatar';
import { Text } from '../foundation/Text';

export interface ProfileListProps {
  profiles: WalletProfile[];
  onAccountPress?: (recipient: any) => void;
  isLoading?: boolean;
  emptyTitle?: string;
  emptyMessage?: string;
  loadingText?: string;
  isMobile?: boolean;
}

export function ProfileList({
  profiles,
  onAccountPress,
  isLoading = false,
  emptyTitle = 'No Profiles',
  emptyMessage = 'No profiles found',
  loadingText = 'Loading profiles...',
  isMobile = false,
}: ProfileListProps): React.ReactElement {
  if (isLoading) {
    return (
      <YStack items="center" justifyContent="center" py="$4">
        <Text color="$text" fontSize="$3">
          {loadingText}
        </Text>
      </YStack>
    );
  }

  if (!profiles || profiles.length === 0) {
    return <RefreshView type="empty" title={emptyTitle} message={emptyMessage} />;
  }

  return (
    <YStack gap="$3">
      {profiles.map((profile, index) => (
        <React.Fragment key={profile.uid}>
          <ProfileItem
            profile={profile}
            onAccountPress={onAccountPress}
            isLast={index === profiles.length - 1}
            isMobile={isMobile}
          />
        </React.Fragment>
      ))}
    </YStack>
  );
}

interface ProfileItemProps {
  profile: WalletProfile;
  onAccountPress?: (recipient: any) => void;
  isLast?: boolean;
  isMobile?: boolean;
}

function ProfileItem({
  profile,
  onAccountPress,
  isLast = false,
  isMobile = false,
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
    <YStack gap="$3">
      {/* Profile Header */}
      <YStack gap="$3" bg="$bgDrawer">
        <YStack py="$2" items="center">
          <YStack height={1} bg="$border1" width="100%" />
        </YStack>
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
            borderRadius="$1"
          />
          <Text
            color="$text"
            fontSize="$4"
            fontWeight="600"
            whiteSpace="nowrap"
            letterSpacing={-0.084}
          >
            {profile.name}
          </Text>
        </XStack>
      </YStack>

      {/* Accounts List */}
      <YStack gap="$3">
        {accountsData.map((account, index) => (
          <React.Fragment key={account.id}>
            <RecipientItem {...account} onPress={() => handleAccountPress(account)} />
          </React.Fragment>
        ))}
      </YStack>
    </YStack>
  );
}
