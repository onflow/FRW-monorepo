import { logger, navigation, bridge, getCadenceService } from '@onflow/frw-context';
import { migrationTransaction } from '@onflow/frw-migration';
import type { WalletAccount, WalletProfilesResponse, MigrationAssetsData } from '@onflow/frw-types';
import {
  YStack,
  XStack,
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
  console.log('[MigrationScreen] Component rendered', {
    initialStage,
    hasAssets: !!assets,
    assetsProvided: !!assets,
    assetsDetails: assets
      ? {
          erc20: assets.erc20?.length ?? 0,
          erc721: assets.erc721?.length ?? 0,
          erc1155: assets.erc1155?.length ?? 0,
        }
      : null,
  });
  const { t } = useTranslation();
  const isExtension = bridge.getPlatform() === 'extension';
  const [stage, setStage] = useState<MigrationStage>(initialStage);
  const [progress, setProgress] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [migrationError, setMigrationError] = useState<Error | null>(null);

  // Ensure migration never runs automatically - only via button press
  useEffect(() => {
    console.log('[MigrationScreen] Mount effect - ensuring stage is ready', {
      initialStage,
      stage,
    });
    if (initialStage === 'in-progress' && stage === 'in-progress' && !isProcessing) {
      console.warn('[MigrationScreen] Detected auto-start, resetting to ready');
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

  // Log resolved accounts for debugging
  useEffect(() => {
    console.log('[MigrationScreen] Resolved accounts', {
      source: {
        name: resolvedSourceAccount.name,
        address: resolvedSourceAccount.address,
        hasAddress: !!resolvedSourceAccount.address,
      },
      destination: {
        name: resolvedDestinationAccount.name,
        address: resolvedDestinationAccount.address,
        hasAddress: !!resolvedDestinationAccount.address,
      },
    });
  }, [resolvedSourceAccount, resolvedDestinationAccount]);

  // Log assets status
  useEffect(() => {
    if (!assets) {
      console.warn(
        '[MigrationScreen] ⚠️ NO ASSETS PROVIDED - MigrationScreen requires assets prop to be passed',
        {
          sourceAddress: resolvedSourceAccount.address,
          note: 'Assets need to be fetched from the source account and passed as props',
        }
      );
    } else {
      const totalAssets =
        (assets.erc20?.length ?? 0) + (assets.erc721?.length ?? 0) + (assets.erc1155?.length ?? 0);
      console.log('[MigrationScreen] Assets provided', {
        totalAssets,
        erc20: assets.erc20?.length ?? 0,
        erc721: assets.erc721?.length ?? 0,
        erc1155: assets.erc1155?.length ?? 0,
      });
    }
  }, [assets, resolvedSourceAccount.address]);

  // Handle migration progress animation (does NOT trigger migration - only visual)
  useEffect(() => {
    console.log('[MigrationScreen] Progress effect triggered', { stage, isProcessing });
    if (stage === 'in-progress' && !isProcessing) {
      setIsAnimating(true);
      // Simulate progress while transaction is being processed
      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) {
            // Don't go to 100% until transaction completes
            return 90;
          }
          return prev + 2;
        });
      }, 200);

      return () => clearInterval(interval);
    }
    // Reset progress/animation when not running
    if (stage !== 'in-progress') {
      setIsAnimating(false);
      setProgress(0);
    }
  }, [stage, isProcessing]);

  const handleStart = useCallback(async () => {
    console.log('[MigrationScreen] ===== START BUTTON PRESSED =====');
    logger.info('[MigrationScreen] Start button pressed');

    if (!assets || (!assets.erc20?.length && !assets.erc721?.length && !assets.erc1155?.length)) {
      console.warn('[MigrationScreen] No assets to migrate', assets);
      logger.warn('[MigrationScreen] No assets to migrate');
      return;
    }

    if (!resolvedSourceAccount.address || !resolvedDestinationAccount.address) {
      console.error('[MigrationScreen] Missing account addresses', {
        source: resolvedSourceAccount.address,
        destination: resolvedDestinationAccount.address,
      });
      logger.error('[MigrationScreen] Missing source or destination address');
      setMigrationError(new Error('Missing account addresses'));
      return;
    }

    console.log('[MigrationScreen] Starting migration process', {
      sourceAddress: resolvedSourceAccount.address,
      destinationAddress: resolvedDestinationAccount.address,
      assetsCount: {
        erc20: assets.erc20?.length ?? 0,
        erc721: assets.erc721?.length ?? 0,
        erc1155: assets.erc1155?.length ?? 0,
      },
    });

    setStage('in-progress');
    setIsProcessing(true);
    setProgress(0);
    setMigrationError(null);

    try {
      console.log('[MigrationScreen] Getting CadenceService...');
      const cadenceService = getCadenceService();
      console.log('[MigrationScreen] CadenceService obtained');

      // Get EVM addresses for sender and receiver
      // For COA (type='evm'), address is already EVM address
      // For EOA (type='eoa'), address is already EVM address
      // If it's a Flow address, we need to get the associated EVM address
      let senderEvmAddr = resolvedSourceAccount.address;
      let receiverEvmAddr = resolvedDestinationAccount.address;

      // If source account is not already an EVM address, try to get it
      console.log('[MigrationScreen] Checking sender address format', { senderEvmAddr });
      if (!senderEvmAddr.startsWith('0x')) {
        console.log('[MigrationScreen] Sender address is not EVM format, fetching COA address...');
        try {
          const coaAddr = await cadenceService.getAddr(senderEvmAddr);
          console.log('[MigrationScreen] COA address fetched', { coaAddr });
          if (coaAddr) {
            senderEvmAddr = `0x${coaAddr}`;
            console.log('[MigrationScreen] Updated sender address', { senderEvmAddr });
          }
        } catch (error) {
          console.warn(
            '[MigrationScreen] Failed to get COA address, using provided address',
            error
          );
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

      console.log('[MigrationScreen] Final addresses prepared', {
        sender: senderEvmAddr,
        receiver: receiverEvmAddr,
      });
      logger.info('[MigrationScreen] Starting migration transaction', {
        sender: senderEvmAddr,
        receiver: receiverEvmAddr,
        assets,
      });

      // Log all assets and amounts before transaction
      console.log('[MigrationScreen] ===== MIGRATION ASSETS AND AMOUNTS =====');
      console.log('[MigrationScreen] Sender:', senderEvmAddr);
      console.log('[MigrationScreen] Receiver:', receiverEvmAddr);

      if (assets.erc20 && assets.erc20.length > 0) {
        console.log('[MigrationScreen] ERC20 Tokens:');
        assets.erc20.forEach((token, index) => {
          const symbol =
            token.address === '0x0000000000000000000000000000000000000000' ? 'FLOW' : token.address;
          console.log(`  [${index + 1}] ${symbol}: ${token.amount}`);
        });
      } else {
        console.log('[MigrationScreen] ERC20 Tokens: None');
      }

      if (assets.erc721 && assets.erc721.length > 0) {
        console.log('[MigrationScreen] ERC721 NFTs:');
        assets.erc721.forEach((nft, index) => {
          console.log(`  [${index + 1}] Contract: ${nft.address}, Token ID: ${nft.id}`);
        });
      } else {
        console.log('[MigrationScreen] ERC721 NFTs: None');
      }

      if (assets.erc1155 && assets.erc1155.length > 0) {
        console.log('[MigrationScreen] ERC1155 Tokens:');
        assets.erc1155.forEach((token, index) => {
          console.log(
            `  [${index + 1}] Contract: ${token.address}, Token ID: ${token.id}, Amount: ${token.amount}`
          );
        });
      } else {
        console.log('[MigrationScreen] ERC1155 Tokens: None');
      }

      const totalAssets =
        (assets.erc20?.length ?? 0) + (assets.erc721?.length ?? 0) + (assets.erc1155?.length ?? 0);
      console.log(`[MigrationScreen] Total assets to migrate: ${totalAssets}`);
      console.log('[MigrationScreen] ===== END MIGRATION ASSETS =====');

      // Execute migration transaction
      console.log('[MigrationScreen] ===== CALLING migrationTransaction =====');
      const result = await migrationTransaction(
        cadenceService,
        assets,
        senderEvmAddr,
        receiverEvmAddr
      );

      console.log('[MigrationScreen] ===== migrationTransaction COMPLETED =====', result);
      logger.info('[MigrationScreen] Migration transaction completed', result);

      // Update progress to 100%
      console.log('[MigrationScreen] Setting progress to 100%');
      setProgress(100);

      // Check if there were any failures (this would need to be determined from the result)
      // For now, assume success if no error
      console.log('[MigrationScreen] Migration successful, transitioning to completed-all');
      setTimeout(() => {
        setStage('completed-all');
        setIsProcessing(false);
        console.log('[MigrationScreen] Stage set to completed-all');
      }, 1000);
    } catch (error: any) {
      console.error('[MigrationScreen] ===== migrationTransaction FAILED =====', error);
      logger.error('[MigrationScreen] Migration transaction failed', error);
      setMigrationError(error);
      setProgress(0);

      // Determine if it's a partial failure or complete failure
      // For now, treat all errors as partial completion (some assets may have succeeded)
      console.log('[MigrationScreen] Migration failed, transitioning to completed-partial');
      setTimeout(() => {
        setStage('completed-partial');
        setIsProcessing(false);
        console.log('[MigrationScreen] Stage set to completed-partial');
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

  return (
    <BackgroundWrapper backgroundColor="$bgDrawer">
      {isExtension && (
        <ExtensionHeader
          title={t('receive.title', 'Receive Assets')}
          help={false}
          onGoBack={() => navigation.goBack()}
          onNavigate={(link: string) => navigation.navigate(link)}
        />
      )}

      <YStack flex={1} gap="$6" items="center" pt={isExtension ? '$4' : '$6'} px="$4" pb="$4">
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
                  ? migrationError
                    ? migrationError.message ||
                      t('migration.screen.status.partialComplete.description')
                    : t('migration.screen.status.partialComplete.description')
                  : undefined
              }
            />
          </YStack>
        )}

        {/* Asset Drawer */}
        <YStack width="100%" gap="$4" style={{ maxWidth: 328 }}>
          <MigrationAssetDrawer
            assets={
              stage === 'completed-partial'
                ? failedAssets
                : assets
                  ? [
                      ...(assets.erc20?.map((a) => ({
                        symbol:
                          a.address === '0x0000000000000000000000000000000000000000'
                            ? 'FLOW'
                            : a.address,
                        amount: a.amount,
                      })) ?? []),
                      ...(assets.erc721?.map((a) => ({
                        symbol: a.address,
                        amount: a.id,
                      })) ?? []),
                      ...(assets.erc1155?.map((a) => ({
                        symbol: a.address,
                        amount: `${a.id}:${a.amount}`,
                      })) ?? []),
                    ]
                  : []
            }
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
