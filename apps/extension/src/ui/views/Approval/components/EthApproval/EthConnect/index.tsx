import { Box, Card, CardMedia, Stack, Typography } from '@mui/material';
import React, { useCallback, useEffect, useState } from 'react';

import { MAINNET_CHAIN_ID, TESTNET_CHAIN_ID } from '@/shared/constant';
import { isValidEthereumAddress, consoleError } from '@/shared/utils';
import { FlowIcon } from '@/ui/assets/icons/FlowIcon';
import linkGlobe from '@/ui/assets/svg/linkGlobe.svg';
import { LLConnectLoading, LLPrimaryButton, LLSecondaryButton } from '@/ui/components';
import { AccountCard } from '@/ui/components/account/account-card';
import { EnableEvm } from '@/ui/components/EnableEvm';
import CheckCircleIcon from '@/ui/components/iconfont/IconCheckmark';
import IconChevronRight from '@/ui/components/iconfont/IconChevronRight';
import { useApproval } from '@/ui/hooks/use-approval';
import { useWallet } from '@/ui/hooks/use-wallet';
import { useNetwork } from '@/ui/hooks/useNetworkHook';
import { useProfiles } from '@/ui/hooks/useProfileHook';
import {
  COLOR_DARKMODE_TEXT_PRIMARY_80_FFFFFF80,
  COLOR_GREEN_FLOW_DARKMODE_00EF8B,
} from '@/ui/style/color';

import { AccountSelectDrawer } from './AccountSelectDrawer';
import IconWithPlaceholder from '../EthApprovalComponents/IconWithPlaceholder';
// import EthMove from '../EthMove';

interface ConnectProps {
  params: any;
}

// The EthConnect component is used to connect to the dApp
// The EthConnect component will show the user the request and allow or reject it

// It is triggered by the eth_requestAccounts method
// If the dApp has never connected to the wallet before, it will ask the user for permission to connect
// If the dApp has connected to the wallet before, it will simply connect to the wallet
// This ensures the wallet is logged in and ready to use with the dApp

// Note that SortHat is the first page that is loaded when the approval notification is opened by the background
// SortHat ensures the wallet is logged in and ready to use with the dApp

// The Approval page is loaded if SortHat detects that the wallet is already logged in and the background has a pending approval
// The Approval page looks at the approvalComponent in the background approval object
// The Approval page then renders the corresponding component based on the approvalComponent

// In this case, the approvalComponent is 'EthConnect'

const EthConnect = ({ params: { icon, name, origin } }: ConnectProps) => {
  // This is used to resolve or reject the approval in the background
  const [, resolveApproval, rejectApproval] = useApproval();
  const { eoaAccount, parentWallet, currentWallet } = useProfiles();
  const { network: currentNetwork } = useNetwork();
  // This is used to interact with the wallet
  const usewallet = useWallet();

  // This is used to show a loading spinner
  const [isLoading, setIsLoading] = useState(false);
  const [showAccountDrawer, setShowAccountDrawer] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState(currentWallet);

  const [defaultChain, setDefaultChain] = useState(MAINNET_CHAIN_ID);

  // TODO: replace default logo
  const [logo, setLogo] = useState('');

  // This is used to initialize the component when the page is loaded

  const init = useCallback(async () => {
    setLogo(icon);
    if (!eoaAccount) return;
    if (isValidEthereumAddress(eoaAccount.address)) {
      const walletInfo = {
        name: 'evm',
        address: eoaAccount.address,
        chain_id: currentNetwork,
        coins: ['flow'],
        id: 1,
        icon: icon,
        color: '#282828',
        chain: currentNetwork === 'testnet' ? TESTNET_CHAIN_ID : MAINNET_CHAIN_ID,
      };
      await usewallet.setActiveWallet(walletInfo, 'evm');
    }
    const defaultChain = currentNetwork === 'testnet' ? TESTNET_CHAIN_ID : MAINNET_CHAIN_ID;

    setDefaultChain(defaultChain);

    setIsLoading(false);
  }, [usewallet, icon, currentNetwork, eoaAccount]);

  const createCoa = async () => {
    setIsLoading(true);

    usewallet
      .createCoaEmpty()
      .then(async (createRes) => {
        await usewallet.listenTransaction(
          createRes,
          true,
          'Create EVM complete',
          `Your EVM on Flow address has been created. \nClick to view this transaction.`
        );

        setIsLoading(false);
      })
      .catch((err) => {
        consoleError(err);
        setIsLoading(false);
      });
  };

  const handleCancel = () => {
    // This is called when the user clicks the cancel button
    // This cancels the connection to the dApp
    rejectApproval('User rejected the request.');
  };

  const handleAllow = async () => {
    // This is called when the user clicks the allow button
    // This allows the connection to the dApp
    const selectedAddress = selectedAccount?.address || eoaAccount?.address;
    const approvalData = {
      defaultChain,
      signPermission: 'MAINNET_AND_TESTNET',
      evmAddress: selectedAddress,
    };
    resolveApproval(approvalData);
  };

  const handleAccountSelect = useCallback(
    async (account: any, parentAccount?: any) => {
      // Set the selected account
      setSelectedAccount(account);

      // Update the active wallet in the wallet service
      if (account.address) {
        const walletInfo = {
          name: account.name || 'evm',
          address: account.address,
          chain_id: currentNetwork,
          coins: ['flow'],
          id: account.id || 1,
          icon: account.icon || icon,
          color: account.color || '#282828',
          chain: currentNetwork === 'testnet' ? TESTNET_CHAIN_ID : MAINNET_CHAIN_ID,
        };

        // Determine if it's an EVM account
        const isEvmAccount = isValidEthereumAddress(account.address);
        await usewallet.setActiveWallet(walletInfo, isEvmAccount ? 'evm' : null);
      }
    },
    [usewallet, currentNetwork, icon]
  );

  useEffect(() => {
    init();
  }, [init]);

  useEffect(() => {
    // Sync selected account with current wallet when it changes
    if (currentWallet) {
      setSelectedAccount(currentWallet);
    }
  }, [currentWallet]);

  const networkDisplayName = currentNetwork === 'testnet' ? 'Flow Testnet' : 'Flow Mainnet';
  const hasValidEoaAccount = eoaAccount && isValidEthereumAddress(eoaAccount.address);

  return (
    <Box>
      {isLoading ? (
        <LLConnectLoading logo={logo} />
      ) : (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            height: '100vh',
            background: '#121212',
            padding: '18px',
            gap: '13px',
          }}
        >
          {/* Header with app icon and name */}
          {hasValidEoaAccount && (
            <Box sx={{ display: 'flex', gap: '13px', alignItems: 'flex-start' }}>
              <IconWithPlaceholder imageUrl={icon} />
              <Stack direction="column" sx={{ justifyContent: 'space-between' }}>
                <Typography
                  sx={{
                    fontSize: '14px',
                    color: COLOR_DARKMODE_TEXT_PRIMARY_80_FFFFFF80,
                    fontFamily: 'Inter, sans-serif',
                    fontWeight: '400',
                    lineHeight: '20px',
                  }}
                >
                  Connecting to
                </Typography>
                <Typography
                  sx={{
                    fontSize: '16px',
                    fontWeight: '700',
                    fontFamily: 'Inter, sans-serif',
                    lineHeight: '24px',
                    color: '#FFFFFF',
                  }}
                >
                  {name}
                </Typography>
              </Stack>
            </Box>
          )}

          {/* Network Badge Section */}
          {hasValidEoaAccount && (
            <Card
              sx={{
                backgroundColor: '#2a2a2a',
                borderRadius: '16px',
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
              }}
            >
              <Box sx={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <Box
                  sx={{
                    width: '20px',
                    height: '20px',
                    borderRadius: '100px',
                    backgroundColor: COLOR_GREEN_FLOW_DARKMODE_00EF8B,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden',
                  }}
                >
                  <FlowIcon width={12} height={12} color="#FFFFFF" />
                </Box>
                <Typography
                  sx={{
                    fontSize: '14px',
                    color: '#FFFFFF',
                    fontFamily: 'Inter, sans-serif',
                    fontWeight: '400',
                    lineHeight: '20px',
                  }}
                >
                  Connecting on {networkDisplayName}
                </Typography>
              </Box>
            </Card>
          )}

          {/* Request Text Section */}
          {hasValidEoaAccount && (
            <Card
              sx={{
                backgroundColor: '#2a2a2a',
                borderRadius: '16px',
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                height: '52px',
              }}
            >
              <Box sx={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <CardMedia
                  component="img"
                  sx={{ width: '20px', height: '20px' }}
                  image={linkGlobe}
                />
                <Typography
                  sx={{
                    fontSize: '14px',
                    color: '#FFFFFF',
                    fontFamily: 'Inter, sans-serif',
                    fontWeight: '400',
                    lineHeight: '20px',
                  }}
                >
                  {origin} is requesting access to:
                </Typography>
              </Box>
            </Card>
          )}

          {/* Permissions Section */}
          {hasValidEoaAccount && (
            <Card
              sx={{
                backgroundColor: '#2a2a2a',
                borderRadius: '16px',
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
                height: '80px',
                gap: '8px',
              }}
            >
              <Box sx={{ display: 'flex', lignItems: 'center' }}>
                <CheckCircleIcon
                  size={20}
                  color={COLOR_GREEN_FLOW_DARKMODE_00EF8B}
                  style={{ flexShrink: '0' }}
                />
                <Typography
                  sx={{
                    fontSize: '13px',
                    color: '#FFFFFF',
                    fontFamily: 'Inter, sans-serif',
                    fontWeight: '500',
                    lineHeight: '20px',
                  }}
                >
                  {chrome.i18n.getMessage('Connect__Body1')}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <CheckCircleIcon
                  size={20}
                  color={COLOR_GREEN_FLOW_DARKMODE_00EF8B}
                  style={{ flexShrink: '0' }}
                />
                <Typography
                  sx={{
                    fontSize: '13px',
                    color: '#FFFFFF',
                    fontFamily: 'Inter, sans-serif',
                    fontWeight: '500',
                    lineHeight: '20px',
                  }}
                >
                  {chrome.i18n.getMessage('Connect__Body2')}
                </Typography>
              </Box>
            </Card>
          )}

          {/* Connecting Account Section */}
          {hasValidEoaAccount ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <Typography
                sx={{
                  fontSize: '14px',
                  color: COLOR_DARKMODE_TEXT_PRIMARY_80_FFFFFF80,
                  fontFamily: 'Inter, sans-serif',
                  fontWeight: '400',
                  lineHeight: '20px',
                }}
              >
                Connecting Account
              </Typography>
              <Box
                sx={{
                  backgroundColor: '#242424',
                  borderRadius: '16px',
                  padding: '2px 16px 2px 16px',
                  overflow: 'hidden',
                }}
              >
                <AccountCard
                  network={currentNetwork}
                  account={selectedAccount || eoaAccount}
                  parentAccount={parentWallet}
                  showCard={false}
                  showLink={true}
                  onClick={() => setShowAccountDrawer(true)}
                  onClickSecondary={() => setShowAccountDrawer(true)}
                  secondaryIcon={
                    <IconChevronRight size={24} color={COLOR_DARKMODE_TEXT_PRIMARY_80_FFFFFF80} />
                  }
                />
              </Box>
            </Box>
          ) : (
            <EnableEvm />
          )}

          <Box sx={{ flexGrow: 1 }} />
          {/* Action Buttons */}
          <Stack
            direction="row"
            spacing={1}
            sx={{
              paddingBottom: '36px',
              paddingTop: '0px',
              gap: '17px',
              justifyContent: 'space-between',
            }}
          >
            <LLSecondaryButton
              label={chrome.i18n.getMessage('Cancel')}
              onClick={handleCancel}
              sx={{
                flex: 1,
                height: '52px',
                borderRadius: '16px',
              }}
            />
            {hasValidEoaAccount ? (
              <LLPrimaryButton
                label={chrome.i18n.getMessage('Connect')}
                type="submit"
                onClick={handleAllow}
                sx={{
                  flex: 1,
                  height: '52px',
                  borderRadius: '16px',
                }}
              />
            ) : (
              <LLPrimaryButton
                label={chrome.i18n.getMessage('Enable')}
                type="submit"
                onClick={createCoa}
                sx={{
                  flex: 1,
                  height: '52px',
                  borderRadius: '16px',
                }}
              />
            )}
          </Stack>
        </Box>
      )}
      <AccountSelectDrawer
        open={showAccountDrawer}
        onClose={() => setShowAccountDrawer(false)}
        network={currentNetwork}
        eoaAccount={eoaAccount}
        parentWallet={parentWallet}
        activeAccount={selectedAccount || currentWallet}
        onAccountSelect={handleAccountSelect}
      />
    </Box>
  );
};

export default EthConnect;
