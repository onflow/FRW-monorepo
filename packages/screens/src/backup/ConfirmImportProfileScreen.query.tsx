import { navigation, logger } from '@onflow/frw-context';
import { CheckCircleFill } from '@onflow/frw-icons';
import { YStack, XStack, Text, GradientBackground, ScrollView } from '@onflow/frw-ui';
import { useMutation, useQuery } from '@tanstack/react-query';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

// Types for profile and account data
interface Account {
  id: string;
  name: string;
  address: string;
  balance: string;
  emoji?: string;
  type?: 'evm' | 'cadence';
  isLinked?: boolean;
}

interface Profile {
  id: string;
  name: string;
  icon: string;
  iconColor: string;
  accounts: Account[];
}

// Future API functions (placeholder for now)
const fetchAvailableProfiles = async (): Promise<Profile[]> => {
  // TODO: Replace with actual API call to fetch profiles from cloud backup
  return [
    {
      id: '1',
      name: 'Nick Name',
      icon: '🌱',
      iconColor: '#16FF99',
      accounts: [
        {
          id: '1',
          name: 'Panda',
          address: '0x0c666c888d8fb259',
          balance: '550.66 FLOW',
          emoji: '🐼',
        },
        {
          id: '2',
          name: 'Penguin',
          address: '0x0c142582d828n212',
          balance: '324.54 FLOW',
          emoji: '🐧',
          type: 'evm',
          isLinked: true,
        },
        {
          id: '3',
          name: 'NBATopShot',
          address: '0x0c142582d828n212',
          balance: '324.54 FLOW',
          type: 'evm',
          isLinked: true,
        },
        {
          id: '4',
          name: 'Flowty',
          address: '0x0c142582d828n212',
          balance: '324.54 FLOW',
          type: 'evm',
          isLinked: true,
        },
        {
          id: '5',
          name: 'Fox',
          address: '0x0c666c888d8fb259',
          balance: '550.66 FLOW',
          emoji: '🦊',
        },
        {
          id: '6',
          name: 'Piggy',
          address: '0x0c666c888d8fb259',
          balance: '550.66 FLOW',
          emoji: '🐷',
        },
      ],
    },
    {
      id: '2',
      name: 'Fred Flow',
      icon: '🌟',
      iconColor: '#FFB116',
      accounts: [
        {
          id: '7',
          name: 'Panda',
          address: '0x0c666c888d8fb259',
          balance: '550.66 FLOW',
          emoji: '🐼',
        },
        {
          id: '8',
          name: 'Penguin',
          address: '0x0c142582d828n212',
          balance: '324.54 FLOW',
          emoji: '🐧',
          type: 'evm',
          isLinked: true,
        },
      ],
    },
  ];
};

const importProfile = async (profileId: string) => {
  // TODO: Replace with actual API call to import selected profile
  return { success: true };
};

/**
 * ConfirmImportProfileScreen - Screen for selecting which profile to import
 * Shows a list of available profiles with their accounts
 * User can select one profile to import
 * Uses TanStack Query for data fetching
 */
export function ConfirmImportProfileScreen(): React.ReactElement {
  const { t } = useTranslation();
  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(null);

  // Query for available profiles
  const { data: profiles, isLoading } = useQuery({
    queryKey: ['backup', 'profiles'],
    queryFn: fetchAvailableProfiles,
  });

  // Mutation for importing profile
  const importMutation = useMutation({
    mutationFn: importProfile,
    onSuccess: () => {
      // Navigate to verify password screen
      navigation.navigate('VerifyPassword');
    },
    onError: (error) => {
      logger.error('Failed to import profile:', error);
    },
  });

  const handleProfileSelect = (profileId: string) => {
    setSelectedProfileId(profileId);
  };

  const handleImport = () => {
    if (selectedProfileId) {
      importMutation.mutate(selectedProfileId);
    }
  };

  const isImportDisabled = !selectedProfileId || importMutation.isPending;

  if (isLoading) {
    return (
      <GradientBackground>
        <YStack flex={1} items="center" justify="center">
          <Text color="$textSecondary">{t('common.loading')}</Text>
        </YStack>
      </GradientBackground>
    );
  }

  return (
    <GradientBackground>
      <YStack flex={1} px="$4.5" pt="$4.5">
        {/* Header */}
        <YStack items="center" mb="$6">
          <Text fontSize="$9" fontWeight="700" color="$text" lineHeight={28.8}>
            {t('backup.confirmImport.title')}
          </Text>
        </YStack>

        {/* Scrollable Profile List */}
        <ScrollView flex={1} showsVerticalScrollIndicator={false}>
          <YStack gap="$7.5" pb="$6">
            {profiles?.map((profile) => (
              <ProfileCard
                key={profile.id}
                profile={profile}
                isSelected={selectedProfileId === profile.id}
                onSelect={() => handleProfileSelect(profile.id)}
              />
            ))}
          </YStack>
        </ScrollView>

        {/* Import Button */}
        <YStack pb="$6" pt="$5">
          <YStack
            alignSelf="stretch"
            justifyContent="center"
            alignItems="center"
            gap="$2"
            p="$4"
            rounded={16}
            bg={isImportDisabled ? 'rgba(255, 255, 255, 0.15)' : '$text'}
            onPress={handleImport}
            pressStyle={{ opacity: 0.8 }}
            disabled={isImportDisabled}
            cursor={isImportDisabled ? 'not-allowed' : 'pointer'}
            style={{
              boxShadow: '0px 1px 2px 0px rgba(16, 24, 40, 0.05)',
            }}
          >
            <Text
              fontSize="$6"
              fontWeight="600"
              color={isImportDisabled ? 'rgba(179, 179, 179, 0.5)' : '$bg'}
              text="center"
            >
              {importMutation.isPending
                ? t('common.loading')
                : t('backup.confirmImport.importProfile')}
            </Text>
          </YStack>
        </YStack>
      </YStack>
    </GradientBackground>
  );
}

interface ProfileCardProps {
  profile: Profile;
  isSelected: boolean;
  onSelect: () => void;
}

function ProfileCard({ profile, isSelected, onSelect }: ProfileCardProps): React.ReactElement {
  const { t } = useTranslation();

  return (
    <YStack
      gap="$4.5"
      p="$4.5"
      bg="$card"
      rounded={16}
      onPress={onSelect}
      pressStyle={{ opacity: 0.95 }}
      cursor="pointer"
    >
      {/* Profile Header */}
      <XStack justify="space-between" items="center">
        <XStack items="center" gap="$2.25">
          {/* Profile Icon */}
          <YStack
            width={40}
            height={40}
            p="$2"
            rounded={8}
            items="flex-end"
            style={{ backgroundColor: profile.iconColor }}
          >
            <Text fontSize={18}>{profile.icon}</Text>
          </YStack>

          {/* Profile Name */}
          <Text fontSize="$4" fontWeight="600" color="$text">
            {profile.name}
          </Text>
        </XStack>

        {/* Checkmark */}
        <YStack width={24} height={24}>
          {isSelected ? (
            <CheckCircleFill size={24} color="$primary" />
          ) : (
            <YStack
              width={24}
              height={24}
              rounded="$12"
              borderWidth={2}
              borderColor="rgba(255, 255, 255, 0.3)"
            />
          )}
        </YStack>
      </XStack>

      {/* Separator */}
      <YStack height={1} bg="rgba(255, 255, 255, 0.15)" alignSelf="stretch" />

      {/* Accounts List */}
      <YStack gap="$2.5">
        {profile.accounts.map((account, index) => (
          <AccountRow key={account.id} account={account} />
        ))}
      </YStack>
    </YStack>
  );
}

interface AccountRowProps {
  account: Account;
}

function AccountRow({ account }: AccountRowProps): React.ReactElement {
  return (
    <XStack
      items="center"
      px={account.isLinked ? '$1.25' : 0}
      py="$2.5"
      gap="$3"
      alignSelf="stretch"
    >
      {/* Link icon for nested accounts */}
      {account.isLinked && (
        <YStack width={20} height={20}>
          {/* TODO: Add link icon */}
        </YStack>
      )}

      {/* Account content */}
      <XStack items="center" gap="$3" flex={1}>
        {/* Account icon/emoji */}
        <YStack
          width={account.isLinked ? 36 : 36}
          height={account.isLinked ? 36 : 36}
          rounded="$12"
          items="center"
          justify="center"
          bg={account.emoji ? '$cardSecondary' : '#FFCB6C'}
          style={!account.emoji && account.isLinked ? { marginLeft: 10 } : {}}
        >
          {account.emoji && (
            <Text fontSize={18} lineHeight={24}>
              {account.emoji}
            </Text>
          )}
        </YStack>

        {/* Account info */}
        <YStack gap="$0.5" flex={1}>
          <XStack items="center" gap="$1">
            <Text fontSize="$4" fontWeight="600" color="$text">
              {account.name}
            </Text>
            {account.type === 'evm' && (
              <YStack px="$1" bg="#627EEA" rounded={16}>
                <Text fontSize={8} fontWeight="400" color="$text">
                  EVM
                </Text>
              </YStack>
            )}
          </XStack>
          <Text fontSize={12} fontWeight="400" color="$textSecondary" lineHeight={16.8}>
            {account.address}
          </Text>
          <Text fontSize={12} fontWeight="400" color="$textSecondary" lineHeight={16.8}>
            {account.balance}
          </Text>
        </YStack>
      </XStack>
    </XStack>
  );
}
