import { logger, navigation, bridge } from '@onflow/frw-context';
import type { WalletAccount, WalletProfilesResponse } from '@onflow/frw-types';
import {
  YStack,
  XStack,
  Text,
  Button,
  ExtensionHeader,
  BackgroundWrapper,
  ConfirmationAnimationSection,
  MigrationAccountCard,
  MigrationProgressIndicator,
  MigrationProgressBar,
  MigrationAssetDrawer,
  MigrationStatusMessage,
  MigrationInfoBanner,
} from '@onflow/frw-ui';
import { useQuery } from '@tanstack/react-query';
import React, { useMemo, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

export type MigrationStage = 'ready' | 'in-progress' | 'completed-all' | 'completed-partial';

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
  initialStage = 'ready',
  sourceAccount,
  destinationAccount,
  assets = [],
  failedAssets = [],
}: MigrationScreenProps): React.ReactElement {
  const { t } = useTranslation();
  const isExtension = bridge.getPlatform() === 'extension';
  const [stage, setStage] = useState<MigrationStage>(initialStage);
  const [progress, setProgress] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  // Load current selected account and wallet profiles from bridge (same pattern as Send screens)
  const { data: selectedAccount } = useQuery<WalletAccount | null>({
    queryKey: ['migration', 'selectedAccount'],
    queryFn: async () => {
      try {
        return await bridge.getSelectedAccount();
      } catch (error) {
        logger.warn('[MigrationScreen] Failed to load selected account', error);
        return null;
      }
    },
    staleTime: 10_000,
    retry: 1,
  });

  const { data: walletProfiles } = useQuery<WalletProfilesResponse | null>({
    queryKey: ['migration', 'walletProfiles'],
    queryFn: async () => {
      try {
        return await bridge.getWalletProfiles();
      } catch (error) {
        logger.warn('[MigrationScreen] Failed to load wallet profiles', error);
        return null;
      }
    },
    staleTime: 10_000,
    retry: 1,
  });

  const { resolvedSourceAccount, resolvedDestinationAccount } = useMemo(() => {
    // 1) Prefer explicit props if provided (for testing / stories)
    if (sourceAccount || destinationAccount) {
      return {
        resolvedSourceAccount: {
          name: sourceAccount?.name ?? 'COA',
          address: sourceAccount?.address ?? '',
          avatar: sourceAccount?.avatar,
          badges: sourceAccount?.badges ?? ['EVM', 'FLOW'],
        },
        resolvedDestinationAccount: {
          name: destinationAccount?.name ?? 'EOA',
          address: destinationAccount?.address ?? '',
          avatar: destinationAccount?.avatar,
          badges: destinationAccount?.badges ?? ['EVM'],
        },
      };
    }

    // 2) Derive from bridge: find the profile that owns the selected account's parentAddress
    const parentAddress = selectedAccount?.parentAddress || selectedAccount?.address || '';
    const profile =
      walletProfiles?.profiles?.find((p) => p.accounts?.some((a) => a.address === parentAddress)) ??
      walletProfiles?.profiles?.[0];

    const accounts = profile?.accounts ?? [];
    const evmAccount = accounts.find((a) => a.type === 'evm');
    const eoaAccount = accounts.find((a) => a.type === 'eoa');
    const mainAccount = accounts.find((a) => a.type === 'main');

    // COA: prefer explicit evm account; otherwise fall back to selected if it's evm, then main
    const resolvedSource =
      evmAccount ?? (selectedAccount?.type === 'evm' ? selectedAccount : null) ?? mainAccount;

    // EOA: prefer explicit eoa account; otherwise empty (we’ll still render a card)
    const resolvedDest = eoaAccount ?? null;

    return {
      resolvedSourceAccount: {
        name: resolvedSource?.name ?? 'COA',
        address: resolvedSource?.address ?? '',
        avatar: resolvedSource?.avatar,
        badges: ['EVM', 'FLOW'],
      },
      resolvedDestinationAccount: {
        name: resolvedDest?.name ?? 'EOA',
        address: resolvedDest?.address ?? '',
        avatar: resolvedDest?.avatar,
        badges: ['EVM'],
      },
    };
  }, [destinationAccount, selectedAccount, sourceAccount, walletProfiles?.profiles]);

  // Simulate migration progress
  useEffect(() => {
    if (stage === 'in-progress') {
      setIsAnimating(true);
      // Use a slower tick (matching SendConfirmation cadence) to reduce JS thread contention with Lottie.
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
          return prev + 4;
        });
      }, 200);

      return () => clearInterval(interval);
    }
    // Reset progress/animation when not running
    setIsAnimating(false);
    setProgress(0);
  }, [stage]);

  const handleStart = () => {
    logger.info('[MigrationScreen] Start pressed');
    setStage('in-progress');
  };

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
      case 'ready':
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

        <ConfirmationAnimationSection isPlaying={stage === 'in-progress'} />

        {/* Account Cards with Progress */}
        <XStack items="center" justify="center" gap="$4" width="100%" style={{ maxWidth: 315 }}>
          {/* Source Account */}
          <MigrationAccountCard
            name={resolvedSourceAccount.name}
            address={resolvedSourceAccount.address}
            avatar={resolvedSourceAccount.avatar}
            badges={resolvedSourceAccount.badges}
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
            name={resolvedDestinationAccount.name}
            address={resolvedDestinationAccount.address}
            avatar={resolvedDestinationAccount.avatar}
            badges={resolvedDestinationAccount.badges}
            isSource={false}
          />
        </XStack>

        {/* Progress Bar (only during in-progress) */}
        {stage === 'in-progress' && (
          <YStack width="100%" gap="$4" style={{ maxWidth: 315 }}>
            <MigrationProgressBar
              progress={progress}
              currentStep={t('migration.screen.progress.currentStep')}
              timeEstimate={t('migration.screen.progress.timeEstimate')}
            />
          </YStack>
        )}

        {/* Status Message (only when completed) */}
        {(stage === 'completed-all' || stage === 'completed-partial') && (
          <YStack width="100%" gap="$4" style={{ maxWidth: 328 }}>
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
        <YStack width="100%" gap="$4" style={{ maxWidth: 328 }}>
          <MigrationAssetDrawer
            assets={stage === 'completed-partial' ? failedAssets : assets}
            defaultExpanded={stage !== 'in-progress'}
            label={t('migration.screen.assets.label')}
          />
        </YStack>

        {/* Warning Banner (only during in-progress) */}
        {stage === 'in-progress' && (
          <YStack width="100%" style={{ maxWidth: 328 }}>
            <MigrationInfoBanner
              title={t('migration.screen.warning.title')}
              description={t('migration.screen.warning.description')}
            />
          </YStack>
        )}

        {/* Start Button (only before starting) */}
        {stage === 'ready' && (
          <YStack width="100%" pt="$2" style={{ maxWidth: 328 }}>
            <Button variant="inverse" size="large" fullWidth onPress={handleStart}>
              {t('migration.screen.button.start')}
            </Button>
          </YStack>
        )}

        {/* Action Button (only when completed) */}
        {(stage === 'completed-all' || stage === 'completed-partial') && (
          <YStack width="100%" pt="$2" style={{ maxWidth: 328 }}>
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
