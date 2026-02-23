import { bridge, navigation } from '@onflow/frw-context';
import {
  activityQueries,
  activityQueryKeys,
  groupActivityByDate,
  useWalletStore,
  walletSelectors,
} from '@onflow/frw-stores';
import type { ActivityItem, ActivityGroup } from '@onflow/frw-types';
import {
  ActivitySkeleton,
  BackgroundWrapper,
  ExtensionHeader,
  Text,
  YStack,
  XStack,
  ActivityCard,
  ActivityGroupHeader,
  ScrollView,
  Separator,
} from '@onflow/frw-ui';
import { logger } from '@onflow/frw-utils';
import { useQuery } from '@tanstack/react-query';
import { useCallback, useMemo, type ReactElement } from 'react';
import { useTranslation } from 'react-i18next';

export interface ActivityScreenProps {
  /** Optional callback when an activity item is pressed (used when embedded as tab) */
  onActivityPress?: (item: ActivityItem) => void;
}

/**
 * Activity Screen - displays transaction history grouped by date
 * Following MVVM pattern with TanStack Query integration
 *
 * Supports both Flow (Cadence) and Flow-EVM transactions
 */
export function ActivityScreen({ onActivityPress }: ActivityScreenProps = {}): ReactElement {
  const { t } = useTranslation();
  const isExtension = bridge.getPlatform() === 'extension';
  const network = bridge.getNetwork() || 'mainnet';

  const activeAccount = useWalletStore(walletSelectors.getActiveAccount);
  const address = activeAccount?.address ?? '';

  const { data: activityResponse, isLoading } = useQuery({
    queryKey: activityQueryKeys.list(address, network),
    queryFn: () => activityQueries.fetchActivity(address, network),
    enabled: !!address,
  });

  // Group activity items by date
  const groupedActivity = useMemo((): ActivityGroup[] => {
    return groupActivityByDate(activityResponse?.items ?? []);
  }, [activityResponse]);

  // Handle activity item press - navigate to detail screen
  const handleActivityPress = useCallback(
    (item: ActivityItem) => {
      logger.debug('[ActivityScreen] Activity item pressed:', item.id);
      if (onActivityPress) {
        onActivityPress(item);
      } else {
        navigation.navigate('ActivityDetail', { item });
      }
    },
    [onActivityPress]
  );

  return (
    <BackgroundWrapper backgroundColor="$bg">
      {isExtension && (
        <ExtensionHeader
          title={t('activity.title', 'Activity')}
          help={false}
          onGoBack={() => navigation.goBack()}
          onNavigate={(link: string) => navigation.navigate(link)}
        />
      )}

      <ScrollView flex={1}>
        <YStack flex={1} pb="$4">
          {/* Screen title for non-extension - centered */}
          {!isExtension && (
            <XStack px="$4" pt="$4" pb="$2" justify="center">
              <Text fontSize="$4" fontWeight="700" color="$text1">
                {t('activity.title', 'Activity')}
              </Text>
            </XStack>
          )}

          {/* Activity skeleton while loading */}
          {isLoading && <ActivitySkeleton count={6} />}

          {/* Activity groups */}
          {!isLoading &&
            groupedActivity.map((group) => (
              <YStack key={group.date}>
                <ActivityGroupHeader title={group.date} />
                <YStack mx="$4" bg="$bg1" rounded="$4" px="$3">
                  {group.items.map((item, index) => (
                    <YStack key={`${item.id}-${index}`}>
                      <ActivityCard item={item} onPress={() => handleActivityPress(item)} />
                      {index < group.items.length - 1 && (
                        <Separator borderColor="$light25" borderWidth={0.5} />
                      )}
                    </YStack>
                  ))}
                </YStack>
              </YStack>
            ))}
        </YStack>
      </ScrollView>
    </BackgroundWrapper>
  );
}
