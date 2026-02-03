import { bridge, navigation } from '@onflow/frw-context';
import { groupActivityByDate } from '@onflow/frw-stores';
import type { ActivityItem, ActivityGroup } from '@onflow/frw-types';
import {
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
import { useCallback, useMemo, type ReactElement } from 'react';
import { useTranslation } from 'react-i18next';

// TEMP: Import mock data for previewing
import { allMockActivityItems } from './ActivityDetailScreen.mock';

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

  // TEMP: Use mock data for previewing detail screens
  const mockItems = useMemo(() => allMockActivityItems.map((mock) => mock.item), []);

  // Group activity items by date
  const groupedActivity = useMemo((): ActivityGroup[] => {
    return groupActivityByDate(mockItems);
  }, [mockItems]);

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

  // Render activity list with mock data
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

          {/* Activity groups */}
          {groupedActivity.map((group) => (
            <YStack key={group.date}>
              {/* Date header */}
              <ActivityGroupHeader title={group.date} />

              {/* Activity cards container with shared background */}
              <YStack mx="$4" bg="$bg1" rounded="$4" px="$3">
                {group.items.map((item, index) => (
                  <YStack key={`${item.id}-${index}`}>
                    <ActivityCard item={item} onPress={() => handleActivityPress(item)} />
                    {/* Separator between cards, not after last card */}
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
