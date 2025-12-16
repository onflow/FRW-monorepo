import { logger, navigation, bridge } from '@onflow/frw-context';
import {
  YStack,
  XStack,
  Text,
  Button,
  ExtensionHeader,
  BackgroundWrapper,
  MigrationAccountCard,
  MigrationProgressIndicator,
  MigrationProgressBar,
  MigrationAssetDrawer,
  MigrationStatusMessage,
  MigrationInfoBanner,
} from '@onflow/frw-ui';
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

export type MigrationStage = 'in-progress' | 'completed-all' | 'completed-partial';

export interface MigrationScreenProps {
  /** Initial stage */
  initialStage?: MigrationStage;
  /** Source account data */
  sourceAccount?: {
    name: string;
    address: string;
    avatar?: string;
    badges?: string[];
  };
  /** Destination account data */
  destinationAccount?: {
    name: string;
    address: string;
    avatar?: string;
    badges?: string[];
  };
  /** Assets being migrated */
  assets?: Array<{ symbol: string; amount: string; name?: string }>;
  /** Failed assets (for partial completion) */
  failedAssets?: Array<{ symbol: string; amount: string; name?: string }>;
}

/**
 * MigrationScreen - Handles the account migration process with 3 stages:
 * 1. In Progress - Shows migration progress
 * 2. Completed (All) - Shows success when all assets transferred
 * 3. Completed (Partial) - Shows warning when some assets failed
 */
export function MigrationScreen({
  initialStage = 'in-progress',
  sourceAccount,
  destinationAccount,
  assets = [],
  failedAssets = [],
}: MigrationScreenProps): React.ReactElement {
  const { t } = useTranslation();
  const isExtension = bridge.getPlatform() === 'extension';
  const [stage, setStage] = useState<MigrationStage>(initialStage);
  const [progress, setProgress] = useState(0);
  const [isAnimating, setIsAnimating] = useState(true);

  // Default account data if not provided
  const defaultSourceAccount = {
    name: 'Penguin',
    address: '0x0c666c888d8fb259',
    badges: ['EVM', 'FLOW'],
    ...sourceAccount,
  };

  const defaultDestinationAccount = {
    name: 'Fox',
    address: '0x0c666c888d8fb259',
    badges: ['EVM'],
    ...destinationAccount,
  };

  // Simulate migration progress
  useEffect(() => {
    if (stage === 'in-progress') {
      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            setIsAnimating(false);
            // Simulate completion - in real app, this would be based on actual migration status
            // For demo, we'll transition to completed-all after 3 seconds
            setTimeout(() => {
              setStage('completed-all');
            }, 1000);
            return 100;
          }
          return prev + 2;
        });
      }, 100);

      return () => clearInterval(interval);
    }
  }, [stage]);

  const handleDone = () => {
    logger.info('[MigrationScreen] Done pressed');
    // Navigate back or to home
    navigation.goBack();
  };

  const handleReviewAssets = () => {
    logger.info('[MigrationScreen] Review assets pressed');
    // TODO: Navigate to asset review screen
  };

  const getTitle = () => {
    switch (stage) {
      case 'in-progress':
        return t('migration.screen.title.inProgress');
      case 'completed-all':
      case 'completed-partial':
        return t('migration.screen.title.completed');
      default:
        return t('migration.screen.title.inProgress');
    }
  };

  return (
    <BackgroundWrapper backgroundColor="$bgDrawer">
      {isExtension && (
        <ExtensionHeader
          title={getTitle()}
          help={false}
          onGoBack={() => navigation.goBack()}
          onNavigate={(link: string) => navigation.navigate(link)}
        />
      )}

      <YStack flex={1} gap="$6" items="center" pt={isExtension ? '$4' : '$6'} px="$4" pb="$4">
        {/* Title */}
        <YStack items="center" gap="$2" width="100%">
          <Text fontSize={30} fontWeight="700" lineHeight={36} color="$text">
            {getTitle()}
          </Text>
        </YStack>

        {/* Illustration Placeholder */}
        <YStack
          width={162}
          height={175}
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

        {/* Account Cards with Progress */}
        <XStack items="center" justify="center" gap="$4" width="100%" maxWidth={315}>
          {/* Source Account */}
          <MigrationAccountCard
            name={defaultSourceAccount.name}
            address={defaultSourceAccount.address}
            avatar={defaultSourceAccount.avatar}
            badges={defaultSourceAccount.badges}
            isSource={true}
          />

          {/* Progress Indicator (only shown during in-progress) */}
          {stage === 'in-progress' && (
            <YStack items="center" justify="center" height={78}>
              <MigrationProgressIndicator isAnimating={isAnimating} />
            </YStack>
          )}

          {/* Destination Account */}
          <MigrationAccountCard
            name={defaultDestinationAccount.name}
            address={defaultDestinationAccount.address}
            avatar={defaultDestinationAccount.avatar}
            badges={defaultDestinationAccount.badges}
            isSource={false}
          />
        </XStack>

        {/* Progress Bar (only during in-progress) */}
        {stage === 'in-progress' && (
          <YStack width="100%" maxWidth={315} gap="$4">
            <MigrationProgressBar
              progress={progress}
              currentStep={t('migration.screen.progress.currentStep')}
              timeEstimate={t('migration.screen.progress.timeEstimate')}
            />
          </YStack>
        )}

        {/* Status Message (only when completed) */}
        {(stage === 'completed-all' || stage === 'completed-partial') && (
          <YStack width="100%" maxWidth={328} gap="$4">
            <MigrationStatusMessage
              type={stage === 'completed-all' ? 'success' : 'warning'}
              title={
                stage === 'completed-all'
                  ? t('migration.screen.status.allComplete.title')
                  : t('migration.screen.status.partialComplete.title')
              }
              description={
                stage === 'completed-partial'
                  ? t('migration.screen.status.partialComplete.description')
                  : undefined
              }
            />
          </YStack>
        )}

        {/* Asset Drawer */}
        <YStack width="100%" maxWidth={328} gap="$4">
          <MigrationAssetDrawer
            assets={stage === 'completed-partial' ? failedAssets : assets}
            defaultExpanded={stage !== 'in-progress'}
            label={t('migration.screen.assets.label')}
          />
        </YStack>

        {/* Warning Banner (only during in-progress) */}
        {stage === 'in-progress' && (
          <YStack width="100%" maxWidth={328}>
            <MigrationInfoBanner
              title={t('migration.screen.warning.title')}
              description={t('migration.screen.warning.description')}
            />
          </YStack>
        )}

        {/* Action Button (only when completed) */}
        {(stage === 'completed-all' || stage === 'completed-partial') && (
          <YStack width="100%" maxWidth={328} pt="$2">
            <Button
              variant="inverse"
              size="large"
              fullWidth
              onPress={stage === 'completed-all' ? handleDone : handleReviewAssets}
            >
              {stage === 'completed-all'
                ? t('migration.screen.button.done')
                : t('migration.screen.button.review')}
            </Button>
          </YStack>
        )}
      </YStack>
    </BackgroundWrapper>
  );
}
