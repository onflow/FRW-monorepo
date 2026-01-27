import { logger, navigation, bridge, getCadenceService } from '@onflow/frw-context';
import type { WalletAccount, WalletProfilesResponse, MigrationAssetsData } from '@onflow/frw-types';
import {
  YStack,
  XStack,
  Button,
  ExtensionHeader,
  BackgroundWrapper,
  ConfirmationAnimationSection,
  MigrationProgressBar,
  MigrationProgressIndicator,
  MigrationStatusMessage,
  MigrationInfoBanner,
  Text,
  Avatar,
  AddressText,
  EVMBadge,
} from '@onflow/frw-ui';
import { transformAccountForDisplay } from '@onflow/frw-utils';
import { migrationTransaction } from '@onflow/frw-workflow';
import { useQuery } from '@tanstack/react-query';
import React, { useMemo, useState, useEffect, useCallback } from 'react';
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
  /** Assets being migrated in MigrationAssetsData format */
  assets?: MigrationAssetsData;
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
  assets,
  failedAssets = [],
}: MigrationScreenProps): React.ReactElement {
  const { t } = useTranslation();
  const isExtension = bridge.getPlatform() === 'extension';
  const [stage, setStage] = useState<MigrationStage>(initialStage);
  const [progress, setProgress] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [migrationError, setMigrationError] = useState<Error | null>(null);
  const [startTime, setStartTime] = useState<number | null>(null);

  // Ensure migration never runs automatically - only via button press
  useEffect(() => {
    if (initialStage === 'in-progress' && stage === 'in-progress' && !isProcessing) {
      setStage('ready');
    }
  }, []); // Only run on mount

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

  const {
    resolvedSourceAccount,
    resolvedDestinationAccount,
    resolvedSourceWalletAccount,
    resolvedDestWalletAccount,
  } = useMemo(() => {
    // 1) Prefer explicit props if provided (for testing / stories)
    if (sourceAccount || destinationAccount) {
      // For explicit props, create minimal WalletAccount-like objects
      const sourceWalletAccount: WalletAccount | null = sourceAccount
        ? ({
            id: sourceAccount.address,
            name: sourceAccount.name,
            address: sourceAccount.address,
            avatar: sourceAccount.avatar,
            type: 'evm' as const,
            balance: '0',
            nfts: '0',
            isActive: true,
          } as WalletAccount)
        : null;
      const destWalletAccount: WalletAccount | null = destinationAccount
        ? ({
            id: destinationAccount.address,
            name: destinationAccount.name,
            address: destinationAccount.address,
            avatar: destinationAccount.avatar,
            type: 'eoa' as const,
            balance: '0',
            nfts: '0',
            isActive: true,
          } as WalletAccount)
        : null;

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
        resolvedSourceWalletAccount: sourceWalletAccount,
        resolvedDestWalletAccount: destWalletAccount,
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

    // EOA: prefer explicit eoa account; otherwise empty (we'll still render a card)
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
      resolvedSourceWalletAccount: resolvedSource,
      resolvedDestWalletAccount: resolvedDest,
    };
  }, [destinationAccount, selectedAccount, sourceAccount, walletProfiles?.profiles]);

  // Handle migration progress animation (only visual, real progress comes from callback)
  useEffect(() => {
    if (stage === 'in-progress') {
      setIsAnimating(true);
    } else {
      // Reset progress/animation when not running
      setIsAnimating(false);
      setProgress(0);
    }
  }, [stage, isProcessing]);

  const handleStart = useCallback(async () => {
    logger.info('[MigrationScreen] Start button pressed');

    if (!assets || (!assets.erc20?.length && !assets.erc721?.length && !assets.erc1155?.length)) {
      logger.warn('[MigrationScreen] No assets to migrate');
      return;
    }

    if (!resolvedSourceAccount.address || !resolvedDestinationAccount.address) {
      logger.error('[MigrationScreen] Missing source or destination address');
      setMigrationError(new Error('Missing account addresses'));
      return;
    }

    setStage('in-progress');
    setIsProcessing(true);
    setProgress(0);
    setMigrationError(null);
    setStartTime(Date.now()); // Track start time for time-based progress

    try {
      const cadenceService = getCadenceService();

      // Get EVM addresses for sender and receiver
      // For COA (type='evm'), address is already EVM address
      // For EOA (type='eoa'), address is already EVM address
      // If it's a Flow address, we need to get the associated EVM address
      let senderEvmAddr = resolvedSourceAccount.address;
      let receiverEvmAddr = resolvedDestinationAccount.address;

      // If source account is not already an EVM address, try to get it
      if (!senderEvmAddr.startsWith('0x')) {
        try {
          const coaAddr = await cadenceService.getAddr(senderEvmAddr);
          if (coaAddr) {
            senderEvmAddr = `0x${coaAddr}`;
          }
        } catch (error) {
          logger.warn('[MigrationScreen] Failed to get COA address, using provided address', error);
        }
      }

      // Ensure addresses have 0x prefix
      if (!senderEvmAddr.startsWith('0x')) {
        senderEvmAddr = `0x${senderEvmAddr}`;
      }
      if (!receiverEvmAddr.startsWith('0x')) {
        receiverEvmAddr = `0x${receiverEvmAddr}`;
      }

      logger.info('[MigrationScreen] Starting migration transaction', {
        sender: senderEvmAddr,
        receiver: receiverEvmAddr,
        assets,
      });

      // Execute migration transaction with progress callback
      const result = await migrationTransaction(
        cadenceService,
        assets,
        senderEvmAddr,
        receiverEvmAddr,
        (progress, completedBatches, totalBatches) => {
          setProgress(progress);
          setCompletedBatchCount(completedBatches);
        }
      );

      logger.info('[MigrationScreen] Migration transaction completed', result);

      // Update progress to 100%
      setProgress(100);

      // Check if there were any failures (this would need to be determined from the result)
      // For now, assume success if no error
      setTimeout(() => {
        setStage('completed-all');
        setIsProcessing(false);
      }, 1000);
    } catch (error: any) {
      logger.error('[MigrationScreen] Migration transaction failed', error);
      setMigrationError(error);
      setProgress(0);

      // Determine if it's a partial failure or complete failure
      // For now, treat all errors as partial completion (some assets may have succeeded)
      setTimeout(() => {
        setStage('completed-partial');
        setIsProcessing(false);
      }, 1000);
    }
  }, [assets, resolvedSourceAccount.address, resolvedDestinationAccount.address]);

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

  // Calculate transferred assets count for progress display
  const totalAssetsCount =
    (assets?.erc20?.length ?? 0) + (assets?.erc721?.length ?? 0) + (assets?.erc1155?.length ?? 0);

  // Each batch of 50 assets takes approximately 10 seconds
  const BATCH_SIZE = 100;
  const totalBatches = Math.ceil(totalAssetsCount / BATCH_SIZE);
  const estimatedSecondsPerBatch = 20;
  const estimatedTotalSeconds = totalBatches * estimatedSecondsPerBatch;

  // Track completed batches directly from callback
  const [completedBatchCount, setCompletedBatchCount] = useState(0);

  // Calculate transferred assets based on completed batches (jumps by BATCH_SIZE)
  const transferredAssetsCount =
    stage === 'in-progress'
      ? Math.min(completedBatchCount * BATCH_SIZE, totalAssetsCount)
      : stage === 'completed-all'
        ? totalAssetsCount
        : 0;

  // Track elapsed time for countdown
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  // Update elapsed time every second when processing
  useEffect(() => {
    if (stage === 'in-progress' && isProcessing) {
      const interval = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [stage, isProcessing]);

  // Reset elapsed time and batch count when starting new migration
  useEffect(() => {
    if (stage === 'ready') {
      setElapsedSeconds(0);
      setCompletedBatchCount(0);
    }
  }, [stage]);

  // Calculate remaining time based on actual elapsed time and completed batches
  const remainingSeconds = Math.max(0, estimatedTotalSeconds - elapsedSeconds);
  const minutes = Math.floor(remainingSeconds / 60);
  const secs = remainingSeconds % 60;
  const timeRemaining =
    stage === 'in-progress' && remainingSeconds > 0
      ? minutes > 0
        ? `${minutes} min ${secs} sec remaining`
        : `${secs} sec remaining`
      : undefined;

  return (
    <BackgroundWrapper backgroundColor="$bgDrawer">
      {isExtension && (
        <ExtensionHeader
          title={t('')}
          help={false}
          onGoBack={() => navigation.goBack()}
          onNavigate={(link: string) => navigation.navigate(link)}
        />
      )}

      <YStack
        flex={1}
        items="center"
        pt={isExtension ? '$4' : '$6'}
        px="$4"
        pb="$4"
        style={{ justifyContent: 'space-between', overflow: 'hidden' }}
      >
        {/* Top Section */}
        <YStack width="100%" items="center" gap="$6" style={{ flexShrink: 0 }}>
          {/* Title - "Migrating your account" */}
          {(stage === 'in-progress' || stage === 'ready') && (
            <YStack width="100%" items="center">
              <Text
                fontSize={30}
                fontWeight="700"
                color="$text"
                width="100%"
                style={{ textAlign: 'center' }}
              >
                {t('migration.screen.title.migrating', 'Migrating your account')}
              </Text>
            </YStack>
          )}

          <ConfirmationAnimationSection isPlaying={stage === 'in-progress'} />

          {/* Account Cards with Progress - Same layout as send confirmation */}
          <XStack
            items="center"
            justify="space-between"
            width="100%"
            gap="$2"
            px="$2"
            style={{ overflow: 'hidden' }}
          >
            {/* Source Account */}
            {resolvedSourceWalletAccount && (
              <YStack
                items="center"
                gap="$2"
                maxW={100}
                style={{ minWidth: 0, flexShrink: 1, overflow: 'hidden' }}
              >
                {(() => {
                  const sourceDisplay = transformAccountForDisplay(resolvedSourceWalletAccount);
                  return (
                    <>
                      <Avatar
                        src={sourceDisplay?.avatarSrc}
                        fallback={sourceDisplay?.avatarFallback || 'A'}
                        bgColor={sourceDisplay?.avatarBgColor}
                        size={36}
                      />
                      <YStack items="center" gap="$1" width="100%" style={{ overflow: 'hidden' }}>
                        <Text
                          fontSize="$3"
                          fontWeight="600"
                          color="$text"
                          numberOfLines={1}
                          ellipsizeMode="tail"
                          style={{ overflow: 'hidden' }}
                        >
                          {sourceDisplay?.name || 'COA'}
                        </Text>
                        {resolvedSourceWalletAccount.address && (
                          <AddressText
                            address={resolvedSourceWalletAccount.address}
                            fontSize="$2"
                            color="$textSecondary"
                          />
                        )}
                        {/* Badges */}
                        <EVMBadge variant="coa" />
                      </YStack>
                    </>
                  );
                })()}
              </YStack>
            )}

            {/* Loading Indicator - Always render to reserve space */}
            <YStack width={90} items="center" justify="center" style={{ flexShrink: 0 }}>
              <MigrationProgressIndicator
                isAnimating={stage === 'in-progress' && isAnimating}
                width={90}
              />
            </YStack>

            {/* Destination Account */}
            {resolvedDestWalletAccount && (
              <YStack
                items="center"
                gap="$2"
                maxW={100}
                style={{ minWidth: 0, flexShrink: 1, overflow: 'hidden' }}
              >
                {(() => {
                  const destDisplay = transformAccountForDisplay(resolvedDestWalletAccount);
                  return (
                    <>
                      <Avatar
                        src={destDisplay?.avatarSrc}
                        fallback={destDisplay?.avatarFallback || 'A'}
                        bgColor={destDisplay?.avatarBgColor}
                        size={36}
                      />
                      <YStack items="center" gap="$1" width="100%" style={{ overflow: 'hidden' }}>
                        <Text
                          fontSize="$3"
                          fontWeight="600"
                          color="$text"
                          numberOfLines={1}
                          ellipsizeMode="tail"
                          style={{ overflow: 'hidden' }}
                        >
                          {destDisplay?.name || 'EOA'}
                        </Text>
                        {resolvedDestWalletAccount.address && (
                          <AddressText
                            address={resolvedDestWalletAccount.address}
                            fontSize="$2"
                            color="$textSecondary"
                          />
                        )}
                        {/* Badges */}
                        <EVMBadge variant="eoa" />
                      </YStack>
                    </>
                  );
                })()}
              </YStack>
            )}
          </XStack>
        </YStack>

        {/* Bottom Section - Sticks to bottom with padding */}
        <YStack width="100%" items="center" gap="$4" style={{ maxWidth: 380 }} pb="$4">
          {/* Progress Bar (only during in-progress) */}
          {stage === 'in-progress' && (
            <YStack width="100%" gap="$4">
              <MigrationProgressBar
                progress={progress}
                currentStep={t('migration.screen.progress.currentStep', 'Migrating account')}
                timeEstimate={timeRemaining}
              />
            </YStack>
          )}

          {/* Status Message (only when completed) */}
          {(stage === 'completed-all' || stage === 'completed-partial') && (
            <YStack width="100%" gap="$4">
              <MigrationStatusMessage
                type={stage === 'completed-all' ? 'success' : 'warning'}
                title={
                  stage === 'completed-all'
                    ? t('migration.screen.status.allComplete.title')
                    : t('migration.screen.status.partialComplete.title')
                }
                description={
                  stage === 'completed-partial'
                    ? migrationError
                      ? migrationError.message ||
                        t('migration.screen.status.partialComplete.description')
                      : t('migration.screen.status.partialComplete.description')
                    : undefined
                }
              />
            </YStack>
          )}

          {/* Asset Count Display */}
          <YStack width="100%" gap="$4">
            <YStack
              bg="$bg2"
              rounded="$4"
              borderWidth={1}
              borderColor="$borderGlass"
              p="$4"
              width="100%"
            >
              {stage === 'in-progress' ? (
                <XStack items="center" gap="$1">
                  <Text fontSize="$3" fontWeight="600" color="$text">
                    {transferredAssetsCount}
                  </Text>
                  <Text fontSize="$3" fontWeight="400" color="$textSecondary">
                    /
                  </Text>
                  <Text fontSize="$3" fontWeight="400" color="$textSecondary">
                    {totalAssetsCount} assets transferred
                  </Text>
                </XStack>
              ) : (
                <XStack items="center" gap="$2">
                  <Text fontSize="$3" fontWeight="400" color="$text">
                    {t('migration.screen.assets.label', 'Assets')}
                  </Text>
                  {totalAssetsCount > 0 && (
                    <Text fontSize="$3" fontWeight="400" color="$textSecondary">
                      ({totalAssetsCount})
                    </Text>
                  )}
                </XStack>
              )}
            </YStack>
          </YStack>

          {/* Warning Banner (only during in-progress) */}
          {stage === 'in-progress' && (
            <YStack width="100%">
              <MigrationInfoBanner
                title={t('migration.screen.warning.title')}
                description={t('migration.screen.warning.description')}
              />
            </YStack>
          )}

          {/* Start Button (only before starting) */}
          {stage === 'ready' && (
            <YStack width="100%" pt="$2">
              <Button
                variant="inverse"
                size="large"
                fullWidth
                onPress={handleStart}
                disabled={
                  !assets ||
                  (!assets.erc20?.length && !assets.erc721?.length && !assets.erc1155?.length)
                }
              >
                {t('migration.screen.button.start')}
              </Button>
            </YStack>
          )}

          {/* Action Button (only when completed) */}
          {(stage === 'completed-all' || stage === 'completed-partial') && (
            <YStack width="100%" pt="$2">
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
      </YStack>
    </BackgroundWrapper>
  );
}
