import { logger, navigation } from '@onflow/frw-context';
import {
  GreenCircleBlur,
  LockMigrate,
  Link,
  MigrateIllustrate,
  Settings,
  TealCircleBlur,
  Zap,
} from '@onflow/frw-icons';
import {
  YStack,
  XStack,
  Text,
  Button,
  BackgroundWrapper,
  MigrationFeatureItem,
  MigrationInfoBanner,
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

  const ChainPill = ({
    label,
    bg,
    color,
    width,
    mr,
  }: {
    label: string;
    bg: string;
    color: string;
    width?: number;
    mr?: number;
  }) => {
    return (
      <XStack
        bg={bg as any}
        rounded={16}
        px={4}
        height={16}
        items="center"
        justify="center"
        style={{
          width,
          marginRight: mr,
        }}
      >
        <Text
          fontSize={8}
          fontWeight="500"
          color={color as any}
          style={{ lineHeight: 'normal', whiteSpace: 'nowrap' }}
        >
          {label}
        </Text>
      </XStack>
    );
  };

  const EvmFlowBadgePair = () => {
    const overlap = -8;
    return (
      <XStack items="center" style={{ paddingRight: 10 }}>
        <ChainPill label="EVM" bg="#627EEA" color="#FFFFFF" width={34} mr={overlap} />
        <ChainPill label="FLOW" bg="#00EF8B" color="#000000" width={31} mr={overlap} />
      </XStack>
    );
  };

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
  const lockIcon = (<LockMigrate size={20} color="#00EF8B" />) as any as React.ReactNode;
  // @ts-expect-error - Icon components return Element which is compatible with ReactNode at runtime
  const linkIcon = (<Link size={20} color="#00EF8B" />) as any as React.ReactNode;
  // @ts-expect-error - Icon components return Element which is compatible with ReactNode at runtime
  const settingsIcon = (<Settings size={20} color="#00EF8B" />) as any as React.ReactNode;
  // @ts-expect-error - Icon components return Element which is compatible with ReactNode at runtime
  const zapIcon = (<Zap size={20} color="#00EF8B" />) as any as React.ReactNode;
  const migrateIllustration = React.createElement(MigrateIllustrate as any, {
    width: 132.3,
    height: 169.233,
    theme: 'multicolor',
  }) as React.ReactNode;

  const illustrationGreenGlow = React.createElement(GreenCircleBlur as any, {
    width: 340,
    height: 340,
    theme: 'multicolor',
  }) as React.ReactNode;

  const illustrationTealGlow = React.createElement(TealCircleBlur as any, {
    width: 300,
    height: 300,
    theme: 'multicolor',
  }) as React.ReactNode;

  return (
    <BackgroundWrapper backgroundColor="$bgDrawer">
      <YStack flex={1} gap="$8" items="center" pt="$6">
        {/* Title Section */}
        <YStack gap="$10" items="center" width="100%">
          <YStack items="center" width={315}>
            <Text
              fontSize={30}
              fontWeight="700"
              lineHeight={36}
              color="$text"
              style={{ textAlign: 'center' }}
            >
              {t('migration.info.title')}
            </Text>
          </YStack>

          {/* Illustration */}
          <YStack
            width={132.3}
            height={169.233}
            items="center"
            justify="center"
            position="relative"
          >
            {/* Background glow behind illustration (matches Figma) */}
            <YStack position="absolute" t={-150} l={-210} opacity={0.9} pointerEvents="none" z={0}>
              {illustrationGreenGlow}
            </YStack>
            <YStack position="absolute" t={-110} r={-190} opacity={0.7} pointerEvents="none" z={0}>
              {illustrationTealGlow}
            </YStack>
            <YStack z={1}>{migrateIllustration}</YStack>
          </YStack>

          {/* Description */}
          <YStack items="center" width="100%" gap="$1">
            <XStack
              items="center"
              justify="center"
              gap="$2"
              width="100%"
              style={{ flexWrap: 'wrap', maxWidth: 315 }}
            >
              <Text
                fontSize="$3"
                fontWeight="400"
                lineHeight={16.8}
                color="$text"
                style={{ textAlign: 'center' }}
              >
                {t('migration.info.descriptionLine1Prefix')}
              </Text>

              <EvmFlowBadgePair />

              <Text
                fontSize="$3"
                fontWeight="400"
                lineHeight={16.8}
                color="$text"
                style={{ textAlign: 'center' }}
              >
                {t('migration.info.descriptionLine1To')}
              </Text>

              <ChainPill label="EVM" bg="#627EEA" color="#FFFFFF" width={34} />
            </XStack>

            <YStack items="center" width="100%" style={{ maxWidth: 315 }}>
              <Text
                fontSize="$3"
                fontWeight="400"
                lineHeight={16.8}
                color="$text"
                style={{ textAlign: 'center' }}
              >
                {t('migration.info.descriptionLine2')}
              </Text>
            </YStack>
          </YStack>

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
