import type { WalletProfile } from '@onflow/frw-types';
import React from 'react';
import { YStack, XStack, Text, View } from 'tamagui';

import { RecipientList, type RecipientData } from './RecipientList';

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
    return (
      <YStack items="center" justifyContent="center" py="$4">
        <Text color="$color" fontSize="$3" fontWeight="600" mb="$2">
          {emptyTitle}
        </Text>
        <Text color="$color" fontSize="$2" textAlign="center">
          {emptyMessage}
        </Text>
      </YStack>
    );
  }

  return (
    <YStack gap="$4">
      {profiles.map((profile, index) => {
        return (
          <React.Fragment key={profile.uid}>
            <View height={0} width="100%" borderBottomWidth={1} borderBottomColor="$borderColor" />
            <ProfileItem
              profile={profile}
              onAccountPress={onAccountPress}
              isLast={index === profiles.length - 1}
            />
          </React.Fragment>
        );
      })}
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
    <YStack gap="$3" items="flex-start" justifyContent="flex-start" width="100%">
      {/* Profile Header */}
      <XStack items="center" justifyContent="space-between" width="100%">
        <XStack gap="$4" items="center" justifyContent="flex-start">
          {/* Profile Icon */}
          <View borderRadius="$2" width={26} height={26} items="center" justifyContent="center">
            {profile.avatar && profile.avatar.startsWith('http') ? (
              <View
                width="100%"
                height="100%"
                borderRadius="$1"
                bg="$background"
                style={{
                  backgroundImage: `url(${profile.avatar})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }}
              />
            ) : profile.avatar && profile.avatar.length <= 4 ? (
              <View
                width="100%"
                height="100%"
                borderRadius="$1"
                bg="$gray8"
                items="center"
                justifyContent="center"
              >
                <Text fontSize="$4">{profile.avatar}</Text>
              </View>
            ) : (
              <View
                width="100%"
                height="100%"
                borderRadius="$1"
                bg="$gray8"
                items="center"
                justifyContent="center"
              >
                <Text color="$color" fontSize="$1" fontWeight="600">
                  {profile.name.charAt(0).toUpperCase()}
                </Text>
              </View>
            )}
          </View>

          {/* Profile Name */}
          <XStack gap="$2" items="center" justifyContent="flex-start">
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
        </XStack>
      </XStack>

      {/* Accounts List using RecipientList */}
      <RecipientList
        data={accountsData}
        isLoading={false}
        onItemPress={handleAccountPress}
        contentPadding={0}
        showSeparators={false}
        itemSpacing={13}
      />
    </YStack>
  );
}
