import type { WalletAccount, WalletProfile } from '@onflow/frw-types';
import React from 'react';
import { FlatList } from 'react-native';
import { YStack, XStack } from 'tamagui';

import { RecipientItem } from './RecipientItem';
import { type RecipientData } from './RecipientList';
import { RefreshView } from './RefreshView';
import { Avatar } from '../foundation/Avatar';
import { Skeleton } from '../foundation/Skeleton';
import { Text } from '../foundation/Text';
import { space } from '../theme';

export interface ProfileListProps {
  profiles: WalletProfile[];
  onAccountPress?: (recipient: any) => void;
  isLoading?: boolean;
  emptyTitle?: string;
  emptyMessage?: string;
  loadingText?: string;
  isMobile?: boolean;
  contentPaddingHorizontal?: number;
  currentAccount?: WalletAccount;
}

export function ProfileList({
  profiles,
  onAccountPress,
  isLoading = false,
  emptyTitle = 'No Profiles',
  emptyMessage = 'No profiles found',
  loadingText = 'Loading profiles...',
  isMobile = false,
  contentPaddingHorizontal,
  currentAccount,
}: ProfileListProps): React.ReactElement {
  const listHorizontalPadding = contentPaddingHorizontal ?? space.$4;

  // Sort profiles to show the one containing currentAccount first
  const sortedProfiles = React.useMemo(() => {
    if (!currentAccount || !profiles) return profiles;

    return [...profiles].sort((a, b) => {
      const aContainsCurrent = a.accounts.some(
        (account) => account.address === currentAccount.address
      );
      const bContainsCurrent = b.accounts.some(
        (account) => account.address === currentAccount.address
      );

      if (aContainsCurrent && !bContainsCurrent) return -1;
      if (!aContainsCurrent && bContainsCurrent) return 1;
      return 0;
    });
  }, [profiles, currentAccount]);

  if (isLoading) {
    // Skeleton loading for profiles list
    return (
      <YStack gap="$3" p="$4">
        {Array.from({ length: 2 }).map((_, idx) => (
          <YStack key={`profile-skel-${idx}`} gap="$3">
            {/* Profile header skeleton */}
            <YStack gap="$3">
              <XStack items="center" gap="$3">
                <Skeleton width="$7" height="$7" borderRadius="$1" animationType="pulse" />
                <YStack flex={1} gap="$2">
                  <Skeleton height="$4.5" width="40%" borderRadius="$1" animationType="pulse" />
                </YStack>
              </XStack>
            </YStack>
            {/* Account rows skeleton */}
            <YStack gap="$3">
              {Array.from({ length: 2 }).map((__, j) => (
                <XStack key={`acct-skel-${idx}-${j}`} items="center" gap="$3">
                  <Skeleton width="$10" height="$10" borderRadius="$10" animationType="pulse" />
                  <YStack flex={1} gap="$2">
                    <Skeleton height="$3.5" width="60%" borderRadius="$1" animationType="pulse" />
                    <Skeleton height="$3" width="30%" borderRadius="$1" animationType="pulse" />
                  </YStack>
                  <Skeleton width="$5" height="$5" borderRadius="$1" animationType="pulse" />
                </XStack>
              ))}
            </YStack>
          </YStack>
        ))}
      </YStack>
    );
  }

  if (!profiles || profiles.length === 0) {
    return <RefreshView type="empty" title={emptyTitle} message={emptyMessage} />;
  }

  return (
    <FlatList
      data={sortedProfiles}
      keyExtractor={(profile) => profile.uid}
      contentContainerStyle={{ paddingHorizontal: listHorizontalPadding }}
      renderItem={({ item }) => (
        <ProfileItem profile={item} onAccountPress={onAccountPress} isMobile={isMobile} />
      )}
      ItemSeparatorComponent={() => <YStack height="$3" />}
    />
  );
}

interface ProfileItemProps {
  profile: WalletProfile;
  onAccountPress?: (recipient: any) => void;
  isMobile?: boolean;
}

function ProfileItem({
  profile,
  onAccountPress,
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
