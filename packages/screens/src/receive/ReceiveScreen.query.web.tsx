import { bridge, navigation, toast } from '@onflow/frw-context';
import { useAllProfiles, useProfileStore, tokenQueries, tokenQueryKeys } from '@onflow/frw-stores';
import type { WalletAccount } from '@onflow/frw-types';
import {
  BackgroundWrapper,
  ExtensionHeader,
  Text,
  YStack,
  Button,
} from '@onflow/frw-ui';
import { logger, retryConfigs } from '@onflow/frw-utils';
import { useQuery } from '@tanstack/react-query';
import { QRCodeSVG } from 'qrcode.react';
import { useCallback, useEffect, useMemo, useRef, useState, type ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import { View, Text as RNText } from 'react-native';

/**
 * Receive Assets Screen - displays QR code for receiving assets
 * Following MVVM pattern with TanStack Query integration
 * Extension version - uses qrcode.react for web-compatible QR code generation
 * State is managed locally as this is a simple single-page screen
 */
export function ReceiveScreen(): ReactElement {
  const { t } = useTranslation();

  // Local state for selected account - no need for store
  const [selectedAccount, setSelectedAccount] = useState<WalletAccount | null>(null);

  // Profile hooks
  const allProfiles = useAllProfiles();
  const loadProfilesFromBridge = useProfileStore((state) => state.loadProfilesFromBridge);
  const isLoadingProfiles = useProfileStore((state) => state.isLoading);
  const profileError = useProfileStore((state) => state.error);
  const profilesLoadedRef = useRef(false);
  const qrCodeRef = useRef(null);

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

  // Get all accounts from profiles (similar to SelectTokensScreen)
  const allAccounts = useMemo(() => {
    return allProfiles.flatMap((profile) => profile.accounts);
  }, [allProfiles]);

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
    if (currentAccount) {
      logger.debug('Setting selected account:', currentAccount);
      setSelectedAccount(currentAccount);
    } else {
      logger.warn(
        'No current account found. Bridge address:',
        bridgeAddress,
        'Profiles loaded:',
        allProfiles.length
      );
    }
  }, [currentAccount, setSelectedAccount, bridgeAddress, allProfiles.length]);

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

  // Prepare accounts with balance for AccountSelector
  const accountsForSelector = useMemo(() => {
    return allAccounts.map((account) => ({
      ...account,
      balance:
        account.address === selectedAccount?.address ? balanceDisplay : account.balance || '0 FLOW',
    }));
  }, [allAccounts, selectedAccount?.address, balanceDisplay]);

  // Handle account selection
  const handleAccountSelect = useCallback(
    (account: any) => {
      logger.debug('Account selected:', account);
      setSelectedAccount(account);
      // Note: Bridge account selection is managed by the bridge itself
      // The selected account will be updated through the selectedAccount state
    },
    [setSelectedAccount]
  );

  // Handle copy address - using same pattern as SendToScreen
  const handleCopyAddress = useCallback(
    async (address: string) => {
      try {
        // Use web clipboard API for extensions
        if (navigator.clipboard) {
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

  // Handle share QR code - Web/Extension version (no sharing support for now)
  const handleShareQRCode = useCallback(async () => {
    if (!selectedAccount?.address) {
      logger.warn('Cannot share QR code: missing address');
      return;
    }

    // For web/extension, we could implement download or copy to clipboard
    // For now, just show a message
    toast.show({
      title: 'QR code sharing not available on web',
      type: 'info',
    });
    logger.debug('Share QR code not implemented for web/extension');
  }, [selectedAccount]);

  // Note: AccountSelector doesn't have built-in copy button like AccountCard
  // User can still copy from the QR code section

  // Render QR code section with web-compatible QR code
  const renderQRCode = () => {
    if (!selectedAccount?.address) {
      return (
        <YStack items="center" justify="center" width={323} height={323}>
          <Text color="$textSecondary">{t('receive.noQRCode')}</Text>
        </YStack>
      );
    }

    return (
      <View
        ref={qrCodeRef}
        style={{
          width: 323,
          height: 323,
          backgroundColor: '#FFFFFF',
          borderRadius: 16,
          marginBottom: 16,
          overflow: 'hidden',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <QRCodeSVG
          value={selectedAccount.address}
          size={323}
          level="H"
          fgColor={isEVM ? '#627EEA' : '#00EF8B'} // EVM blue or Flow green
          bgColor="#FFFFFF"
          style={{
            width: '100%',
            height: '100%',
          }}
        />
      </View>
    );
  };

  return (
    <BackgroundWrapper backgroundColor="$bgDrawer" px={'$0' as any} pb={'$0' as any}>
      <ExtensionHeader
        title={t('receive.title', 'Receive Assets')}
        help={false}
        onGoBack={() => navigation.goBack()}
        onNavigate={(link: string) => navigation.navigate(link)}
      />

      <YStack flex={1} items="center" gap="$4" pt="$6" px="$4">
        {/* QR Code Section */}
        <YStack bg="$bg1" rounded="$4" pt="$4" pb="$4" px="$2" items="center" gap="$5" width="100%">
          {/* Title */}
          <Text fontSize={16} fontWeight="700" color="$text" lineHeight={19}>
            {t('receive.scanToReceive', 'Scan to receive')}
          </Text>

          {/* QR Code */}
          {renderQRCode()}

          {/* Warning Text - Only for EVM addresses */}
          {isEVM && (
            <YStack width="100%" px="$4" mt={-8}>
              <RNText
                style={{
                  width: '100%',
                  fontSize: 12,
                  fontWeight: '400',
                  lineHeight: 16.8,
                  color: '#8F8F8F',
                  textAlign: 'center',
                }}
              >
                {t('receive.evmWarning')}
              </RNText>
            </YStack>
          )}
        </YStack>

        {/* Share QR Code Button - Could implement download/copy for web */}
        <YStack pt="$2" mb={'$10'} width="100%">
          <Button
            variant="inverse"
            size="large"
            fullWidth
            disabled={!selectedAccount?.address}
            onPress={handleShareQRCode}
          >
            {t('receive.shareQRCode', 'Share QR Code')}
          </Button>
        </YStack>
      </YStack>
    </BackgroundWrapper>
  );
}
