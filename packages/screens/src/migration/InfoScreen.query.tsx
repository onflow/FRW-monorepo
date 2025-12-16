import { logger, navigation, bridge } from '@onflow/frw-context';
import { Lock, Link, Settings, Zap } from '@onflow/frw-icons';
import {
  YStack,
  XStack,
  Text,
  Button,
  ExtensionHeader,
  BackgroundWrapper,
  MigrationFeatureItem,
  MigrationInfoBanner,
  Badge,
} from '@onflow/frw-ui';
import React from 'react';
import { useTranslation } from 'react-i18next';

export interface InfoScreenProps {
  /** Callback when "Start migration" is clicked */
  onStartMigration?: () => void;
}

/**
 * InfoScreen - Migration information screen
 * Displays information about migrating from COA to EOA accounts
 */
export function InfoScreen({ onStartMigration }: InfoScreenProps = {}): React.ReactElement {
  const { t } = useTranslation();
  const isExtension = bridge.getPlatform() === 'extension';

  const handleStartMigration = () => {
    logger.info('[InfoScreen] Start migration pressed');
    if (onStartMigration) {
      onStartMigration();
    } else {
      // Fallback: use navigation if no callback provided
      // navigation.navigate(ScreenName.MIGRATION_START);
    }
  };

  const handleCancel = () => {
    logger.info('[InfoScreen] Cancel pressed');
    navigation.goBack();
  };

  // Create icon elements with type assertion to work around icon type issues
  // @ts-expect-error - Icon components return Element which is compatible with ReactNode at runtime
  const lockIcon = (<Lock size={20} color="#00EF8B" />) as any as React.ReactNode;
  // @ts-expect-error - Icon components return Element which is compatible with ReactNode at runtime
  const linkIcon = (<Link size={20} color="#00EF8B" />) as any as React.ReactNode;
  // @ts-expect-error - Icon components return Element which is compatible with ReactNode at runtime
  const settingsIcon = (<Settings size={20} color="#00EF8B" />) as any as React.ReactNode;
  // @ts-expect-error - Icon components return Element which is compatible with ReactNode at runtime
  const zapIcon = (<Zap size={20} color="#00EF8B" />) as any as React.ReactNode;

  return (
    <BackgroundWrapper backgroundColor="$bgDrawer">
      {isExtension && (
        <ExtensionHeader
          title={t('migration.info.title')}
          help={true}
          onGoBack={() => navigation.goBack()}
          onNavigate={(link: string) => navigation.navigate(link)}
        />
      )}

      <YStack flex={1} gap="$8" items="center" pt={isExtension ? '$4' : '$6'}>
        {/* Title Section */}
        <YStack gap="$10" items="center" width="100%">
          <YStack items="center" width={315}>
            <Text fontSize={30} fontWeight="700" lineHeight={36} color="$text">
              {t('migration.info.title')}
            </Text>
          </YStack>

          {/* Illustration Placeholder */}
          <YStack
            width={132}
            height={169}
            bg="$bg2"
            rounded="$4"
            items="center"
            justify="center"
            opacity={0.3}
          >
            <Text fontSize="$2" color="$textSecondary">
              Illustration
            </Text>
          </YStack>

          {/* Description */}
          <YStack items="center" width="100%">
            <Text fontSize="$3" fontWeight="400" lineHeight={16.8} color="$text">
              {t('migration.info.description')}
            </Text>
          </YStack>

          {/* Account Type Badges */}
          <XStack gap="$2" items="center" position="relative">
            <XStack gap="$2" items="center">
              <Badge variant="evm" size="small" {...({ bg: '#627EEA' } as any)}>
                EVM
              </Badge>
              <Badge variant="primary" size="small" {...({ bg: '#00EF8B' } as any)}>
                FLOW
              </Badge>
            </XStack>
          </XStack>

          {/* What does this mean? Section */}
          <YStack gap="$4" items="center" p="$4" rounded="$4" bg="$bg2" width="100%">
            <YStack items="center" width="100%">
              <Text fontSize="$4" fontWeight="600" color="$text" width="100%">
                {t('migration.info.whatDoesThisMean')}
              </Text>
            </YStack>

            <YStack width="100%" items="flex-start">
              <MigrationFeatureItem
                icon={lockIcon}
                description={t('migration.info.features.control')}
              />
              <MigrationFeatureItem
                icon={linkIcon}
                description={t('migration.info.features.security')}
              />
              <MigrationFeatureItem
                icon={settingsIcon}
                description={t('migration.info.features.compatibility')}
              />
              <MigrationFeatureItem
                icon={zapIcon}
                description={t('migration.info.features.performance')}
                isLast
              />
            </YStack>
          </YStack>

          {/* Info Banner */}
          <MigrationInfoBanner
            title={t('migration.info.note.title')}
            description={t('migration.info.note.description')}
          />
        </YStack>

        {/* Action Buttons */}
        <YStack gap="$3" items="center" width="100%" style={{ maxWidth: 338 }}>
          <Button variant="inverse" size="large" fullWidth onPress={handleStartMigration}>
            {t('migration.info.startMigration')}
          </Button>

          <YStack items="center" width="100%">
            <Text
              fontSize="$3"
              fontWeight="400"
              color="$textSecondary"
              onPress={handleCancel}
              cursor="pointer"
              pressStyle={{ opacity: 0.7 }}
            >
              {t('common.cancel')}
            </Text>
          </YStack>
        </YStack>
      </YStack>
    </BackgroundWrapper>
  );
}
