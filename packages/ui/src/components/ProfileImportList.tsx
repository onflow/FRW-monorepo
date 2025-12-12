import { CheckCircle, Link } from '@onflow/frw-icons';
import type { WalletAccount, WalletProfile } from '@onflow/frw-types';
import React from 'react';
import { FlatList } from 'react-native';
import { YStack, XStack, useTheme } from 'tamagui';

import { RecipientItem } from './RecipientItem';
import { type RecipientData } from './RecipientList';
import { RefreshView } from './RefreshView';
import { Avatar } from '../foundation/Avatar';
import { Skeleton } from '../foundation/Skeleton';
import { Text } from '../foundation/Text';
import { space } from '../theme';

export interface ProfileImportListProps {
  profiles: WalletProfile[];
  onAccountPress?: (recipient: any) => void;
  onProfilePress?: (profile: WalletProfile) => void;
  selectedProfileUid?: string;
  isLoading?: boolean;
  emptyTitle?: string;
  emptyMessage?: string;
  loadingText?: string;
  isMobile?: boolean;
  contentPaddingHorizontal?: number;
  currentAccount?: WalletAccount;
}

export function ProfileImportList({
  profiles,
  onAccountPress,
  onProfilePress,
  selectedProfileUid,
  isLoading = false,
  emptyTitle = 'No Profiles',
  emptyMessage = 'No profiles found',
  loadingText = 'Loading profiles...',
  isMobile = false,
  contentPaddingHorizontal,
  currentAccount,
}: ProfileImportListProps): React.ReactElement {
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
          <YStack key={`profile-skel-${idx}`} gap="$3" bg="$bg2" rounded="$4" p="$4">
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
        <ProfileImportItem
          profile={item}
          onAccountPress={onAccountPress}
          onProfilePress={onProfilePress}
          isSelected={selectedProfileUid === item.uid}
          isMobile={isMobile}
        />
      )}
      ItemSeparatorComponent={() => <YStack height="$3" />}
    />
  );
}

interface ProfileImportItemProps {
  profile: WalletProfile;
  onAccountPress?: (recipient: any) => void;
  onProfilePress?: (profile: WalletProfile) => void;
  isSelected?: boolean;
  isMobile?: boolean;
}

function ProfileImportItem({
  profile,
  onAccountPress,
  onProfilePress,
  isSelected = false,
  isMobile = false,
}: ProfileImportItemProps): React.ReactElement {
  const theme = useTheme();

  const handleAccountPress = (account: any) => {
    onAccountPress?.(account);
  };

  const handleProfilePress = () => {
    onProfilePress?.(profile);
  };

  // Convert profile accounts to RecipientData format
  const accountsData: RecipientData[] = profile.accounts.map((account) => {
    const data = {
      id: account.address,
      name: account.name,
      address: account.address,
      avatar: account.avatar,
      emojiInfo: account.emojiInfo,
      parentEmojiInfo: null, // Don't show parent emoji overlay for linked accounts
      type: 'account' as const,
      isSelected: false,
      isLinked: !!(account.parentAddress || account.type === 'child' || account.type === 'evm'),
      isEVM: account.type === 'evm',
      balance: (account as any).balance || '0 FLOW', // Balance is added in SendToScreen
      showBalance: true,
    };
    return data;
  });

  return (
    <YStack
      bg="$bg2"
      rounded="$4"
      p="$4"
      gap="$3"
      pressStyle={{ opacity: 0.8 }}
      onPress={handleProfilePress}
    >
      {/* Profile Header with Checkbox */}
      <XStack items="center" justify="space-between">
        <XStack items="center" gap="$3" flex={1}>
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

        {/* Checkbox - always visible, changes based on selection */}
        <YStack width={24} height={24} items="center" justify="center">
          <CheckCircle
            size={24}
            color={isSelected ? theme.primary.val : theme.textSecondary.val}
            theme={isSelected ? 'filled' : 'outline'}
          />
        </YStack>
      </XStack>

      {/* Divider */}
      <YStack height={1} bg="$border1" width="100%" />

      {/* Accounts List */}
      <YStack gap="$3">
        {accountsData.map((account, index) => (
          <React.Fragment key={account.id}>
            {account.isLinked ? (
              <XStack items="center" gap="$3" pl={5}>
                {/* Link icon on the left for linked accounts - aligned with main account avatar */}
                <YStack width={24} height={24} items="center" justify="center">
                  <Link size={20} color={theme.textSecondary.val} theme="outline" />
                </YStack>
                {/* Account item without inline link icon - not clickable */}
                <YStack flex={1}>
                  <RecipientItem {...{ ...account, isLinked: false, isEVM: false }} />
                </YStack>
              </XStack>
            ) : (
              /* Main account - flush left, no wrapper, not clickable */
              <RecipientItem {...account} />
            )}
          </React.Fragment>
        ))}
      </YStack>
    </YStack>
  );
}
