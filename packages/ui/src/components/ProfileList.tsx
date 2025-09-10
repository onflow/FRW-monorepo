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
  console.log('ProfileList render:', { profiles, profilesLength: profiles?.length, isLoading });
  
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
    console.log('ProfileList: No profiles to display');
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

  console.log('ProfileList: Rendering profiles:', profiles);
  return (
    <YStack gap="$4">
      {profiles.map((profile, index) => {
        console.log(`Rendering profile ${index}:`, profile);
        return (
          <React.Fragment key={profile.uid}>
            <ProfileItem
              profile={profile}
              onAccountPress={onAccountPress}
              isLast={index === profiles.length - 1}
            />
            {index < profiles.length - 1 && (
              <View height={0} width="100%" borderBottomWidth={1} borderBottomColor="$borderColor" />
            )}
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
  console.log('ProfileItem render:', { profile, accountsCount: profile.accounts?.length });
  
  const handleAccountPress = (account: any) => {
    console.log('ProfileItem: Account pressed:', account);
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
    console.log('ProfileItem: Converted account:', data);
    return data;
  });
  
  console.log('ProfileItem: accountsData:', accountsData);

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
                <Text fontSize="$4">
                  {profile.avatar}
                </Text>
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

      {/* Separator Line */}
      <View height={0} width="100%" borderBottomWidth={1} borderBottomColor="$borderColor" />

      {/* Accounts List using RecipientList */}
      <RecipientList
        data={accountsData}
        isLoading={false}
        onItemPress={handleAccountPress}
        contentPadding={0}
      />
    </YStack>
  );
}
