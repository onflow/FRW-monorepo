import { bridge, navigation, toast } from '@onflow/frw-context';
import {
  useReceiveStore,
  useAllProfiles,
  useProfileStore,
  tokenQueries,
  tokenQueryKeys,
} from '@onflow/frw-stores';
import {
  BackgroundWrapper,
  ExtensionHeader,
  Text,
  YStack,
  Button,
  AccountCard,
} from '@onflow/frw-ui';
import { logger, retryConfigs } from '@onflow/frw-utils';
import { useQuery } from '@tanstack/react-query';
import { useCallback, useEffect, useMemo, useRef, type ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import QRCodeStyled from 'react-native-qrcode-styled';

/**
 * Receive Assets Screen - displays QR code for receiving assets
 * Following MVVM pattern with TanStack Query integration
 */
export function ReceiveScreen(): ReactElement {
  const { t } = useTranslation();
  const isExtension = bridge.getPlatform() === 'extension';

  // Store hooks - QR code now generated client-side with QRCodeStyled
  const { selectedAccount, setSelectedAccount } = useReceiveStore();

  // Profile hooks
  const allProfiles = useAllProfiles();
  const loadProfilesFromBridge = useProfileStore((state) => state.loadProfilesFromBridge);
  const isLoadingProfiles = useProfileStore((state) => state.isLoading);
  const profileError = useProfileStore((state) => state.error);
  const profilesLoadedRef = useRef(false);

  // Initialize profiles on mount
  useEffect(() => {
    if (!profilesLoadedRef.current && !isLoadingProfiles && !profileError) {
      profilesLoadedRef.current = true;
      loadProfilesFromBridge();
    }
  }, [isLoadingProfiles, loadProfilesFromBridge, profileError]);

  // Get current account from bridge
  const bridgeAddress = bridge.getSelectedAddress() || '';
  const network = bridge.getNetwork() || 'mainnet';

  // Find the currently selected account from profiles
  const currentAccount = useMemo(() => {
    for (const profile of allProfiles) {
      const account = profile.accounts.find(
        (acc) => acc.address.toLowerCase() === bridgeAddress.toLowerCase()
      );
      if (account) {
        return account;
      }
    }
    return null;
  }, [allProfiles, bridgeAddress]);

  // Set the current account when it changes
  useEffect(() => {
    if (currentAccount && !selectedAccount) {
      setSelectedAccount(currentAccount);
    }
  }, [currentAccount, selectedAccount, setSelectedAccount]);

  // Fetch balance for selected account
  const { data: balanceData } = useQuery({
    queryKey: tokenQueryKeys.balance(selectedAccount?.address || '', network),
    queryFn: () => tokenQueries.fetchBalance(selectedAccount?.address || '', undefined, network),
    enabled: !!selectedAccount?.address,
    staleTime: 30 * 1000, // Use cached balance for 30 seconds
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    refetchInterval: 60 * 1000, // Refresh balance every minute
    ...retryConfigs.critical,
  });

  // Format balance display
  const balanceDisplay = useMemo(() => {
    if (!balanceData?.displayBalance) {
      return '0 FLOW';
    }
    return balanceData.displayBalance;
  }, [balanceData]);

  // Check if account is EVM
  const isEVM = useMemo(() => {
    return selectedAccount?.type === 'evm';
  }, [selectedAccount]);

  // Navigate to account selector (same as Send flow)
  const handleEditAccount = useCallback(() => {
    // TODO: Navigate to account selector or show account picker modal
    // This should open the same UI as the "From Account" selector in send workflow
    logger.debug('Edit account clicked - should open account selector');
  }, []);

  // Handle copy address - using same pattern as SendToScreen
  const handleCopyAddress = useCallback(
    async (address: string) => {
      try {
        // Check platform and use appropriate clipboard method (same as SendToScreen)
        const platform = bridge.getPlatform();

        // Use RN clipboard via global injected helper when not web/extension
        if (platform !== 'extension' && typeof window === 'undefined') {
          const rnClipboard = (globalThis as any).clipboard;
          if (rnClipboard?.setString) {
            rnClipboard.setString(address);
          }
        } else if (navigator.clipboard) {
          await navigator.clipboard.writeText(address);
        }

        // Show success toast
        toast.show({
          title: t('messages.addressCopied'),
          type: 'success',
        });
        logger.debug('Address copied to clipboard:', address);
      } catch (error) {
        logger.error('Failed to copy address:', error);
        toast.show({
          title: t('messages.failedToCopy'),
          type: 'error',
        });
      }
    },
    [t]
  );

  // Handle share QR code
  // TODO: Re-implement sharing with styled QR code
  // Option 1: Use react-native-view-shot to capture QR component
  // Option 2: Generate base64 QR via bridge as fallback
  const handleShareQRCode = useCallback(async () => {
    if (!selectedAccount?.address) {
      logger.warn('Cannot share QR code: missing address');
      return;
    }

    try {
      // For now, generate simple QR code via bridge for sharing
      const qrDataUrl = await bridge.generateQRCode(selectedAccount.address);
      await bridge.shareQRCode(selectedAccount.address, qrDataUrl);
      logger.debug('QR code shared successfully');
    } catch (error) {
      logger.error('Failed to share QR code:', error);
      toast.show({
        title: t('messages.failedToShare'),
        type: 'error',
      });
    }
  }, [selectedAccount, t]);

  // Render account card
  const renderAccountCard = () => {
    if (!selectedAccount) {
      return null;
    }

    // Transform to Account type expected by AccountCard
    const accountForCard = {
      ...selectedAccount,
      balance: balanceDisplay,
    };

    return (
      <AccountCard
        account={accountForCard}
        title={t('receive.yourAccount', 'Your Account')}
        showCopyButton={true}
        onCopyAddress={handleCopyAddress}
        showEditButton={false}
        enableModalSelection={false}
      />
    );
  };

  // Render QR code section with styled QR code
  const renderQRCode = () => {
    if (!selectedAccount?.address) {
      return (
        <YStack items="center" justify="center" width={283} height={283}>
          <Text color="$textSecondary">{t('receive.noQRCode')}</Text>
        </YStack>
      );
    }

    return (
      <YStack items="center" justify="center" width={283} height={283}>
        <QRCodeStyled
          data={selectedAccount.address}
          style={{
            backgroundColor: 'transparent',
            borderRadius: 16,
          }}
          padding={20}
          pieceSize={8}
          pieceBorderRadius={4}
          isPiecesGlued
          color={isEVM ? '#627EEA' : '#00EF8B'} // EVM blue or Flow green
          logo={{
            href: require('../assets/flow-logo.webp'),
            padding: 4,
            scale: 0.22,
          }}
          outerEyesOptions={{
            borderRadius: [20, 20, 0, 20],
            color: '#000000',
          }}
          innerEyesOptions={{
            borderRadius: 10,
            color: isEVM ? '#627EEA' : '#00EF8B',
          }}
          errorCorrectionLevel="H"
        />
      </YStack>
    );
  };

  return (
    <BackgroundWrapper backgroundColor="$bgDrawer" px={'$0' as any} pb={'$0' as any}>
      {isExtension && (
        <ExtensionHeader
          title={t('receive.title', 'Receive Assets')}
          help={false}
          onGoBack={() => navigation.goBack()}
          onNavigate={(link: string) => navigation.navigate(link)}
        />
      )}

      <YStack flex={1} items="center" gap="$4" pt="$6" px="$4">
        {/* Account Card */}
        {renderAccountCard()}

        {/* QR Code Section */}
        <YStack bg="$bg2" rounded="$4" p="$4" items="center" gap="$5" width="100%">
          {/* Title */}
          <Text fontSize="$4" fontWeight="600" color="$text">
            {t('receive.scanToReceive', 'Scan to receive')}
          </Text>

          {/* QR Code */}
          {renderQRCode()}

          {/* Warning Text - Only for EVM addresses */}
          {isEVM && (
            <YStack width={269} items="center">
              <Text fontSize="$3" fontWeight="400" lineHeight={16.8} color="$textSecondary">
                {t('receive.evmWarning')}
              </Text>
            </YStack>
          )}
        </YStack>

        {/* Share Button */}
        <Button
          size="$5"
          width="100%"
          bg="transparent"
          borderColor="$borderColor"
          borderWidth={1}
          rounded="$4"
          onPress={handleShareQRCode}
          disabled={!selectedAccount?.address}
        >
          <Text fontSize="$4" fontWeight="600" color="$text">
            {t('receive.shareQRCode', 'Share QR Code')}
          </Text>
        </Button>
      </YStack>
    </BackgroundWrapper>
  );
}
