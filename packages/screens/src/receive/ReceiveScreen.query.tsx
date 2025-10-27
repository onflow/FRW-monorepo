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
  Image,
  AccountCard,
} from '@onflow/frw-ui';
import { logger, retryConfigs } from '@onflow/frw-utils';
import { useQuery } from '@tanstack/react-query';
import { useCallback, useEffect, useMemo, useRef, type ReactElement } from 'react';
import { useTranslation } from 'react-i18next';

/**
 * Receive Assets Screen - displays QR code for receiving assets
 * Following MVVM pattern with TanStack Query integration
 */
export function ReceiveScreen(): ReactElement {
  const { t } = useTranslation();
  const isExtension = bridge.getPlatform() === 'extension';

  // Store hooks
  const { selectedAccount, setSelectedAccount, qrCodeDataUrl, isGeneratingQR, error } =
    useReceiveStore();

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

  // Handle share QR code
  const handleShareQRCode = useCallback(async () => {
    if (!selectedAccount?.address || !qrCodeDataUrl) {
      logger.warn('Cannot share QR code: missing address or QR data');
      return;
    }

    try {
      await bridge.shareQRCode(selectedAccount.address, qrCodeDataUrl);
      logger.debug('QR code shared successfully');
    } catch (error) {
      logger.error('Failed to share QR code:', error);
      toast.show({
        title: t('messages.failedToShare'),
        type: 'error',
      });
    }
  }, [selectedAccount, qrCodeDataUrl, t]);

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
        showEditButton={true}
        enableModalSelection={false}
      />
    );
  };

  // Render QR code section
  const renderQRCode = () => {
    if (isGeneratingQR) {
      return (
        <YStack items="center" justify="center" width={283} height={283}>
          <Text color="$textSecondary">{t('receive.generatingQR')}</Text>
        </YStack>
      );
    }

    if (error) {
      return (
        <YStack items="center" justify="center" width={283} height={283} gap="$3">
          <Text color="$error">{error}</Text>
          <Button
            size="$3"
            onPress={() => {
              if (selectedAccount?.address) {
                useReceiveStore.getState().generateQRCode(selectedAccount.address);
              }
            }}
          >
            {t('common.retry')}
          </Button>
        </YStack>
      );
    }

    if (!qrCodeDataUrl) {
      return (
        <YStack items="center" justify="center" width={283} height={283}>
          <Text color="$textSecondary">{t('receive.noQRCode')}</Text>
        </YStack>
      );
    }

    return (
      <YStack items="center" justify="center" width={283} height={283}>
        <Image
          source={{ uri: qrCodeDataUrl }}
          width={283}
          height={283}
          borderRadius={16}
          resizeMode="contain"
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

          {/* Warning Text */}
          <YStack width={269} items="center">
            <Text fontSize="$3" fontWeight="400" lineHeight={16.8} color="$textSecondary">
              {isEVM
                ? t(
                    'receive.evmWarning',
                    'Please ensure you only send assets to this address on the Flow EVM network. Assets sent to this address on other networks will be lost.'
                  )
                : t(
                    'receive.flowWarning',
                    'Please ensure you only send assets to this address on the Flow network. Assets sent to this address on other networks will be lost.'
                  )}
            </Text>
          </YStack>
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
          disabled={!qrCodeDataUrl || isGeneratingQR}
        >
          <Text fontSize="$4" fontWeight="600" color="$text">
            {t('receive.shareQRCode', 'Share QR Code')}
          </Text>
        </Button>
      </YStack>
    </BackgroundWrapper>
  );
}
