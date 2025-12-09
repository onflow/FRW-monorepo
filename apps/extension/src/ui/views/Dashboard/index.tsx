import { Drawer } from '@mui/material';
import Box from '@mui/material/Box';
import { UpdateDialog } from '@onflow/frw-ui';
import { setUser, setExtras } from '@sentry/react';
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router';

import { ButtonRow } from '@/ui/components';
import { BuildIndicator } from '@/ui/components/build-indicator';
import { NetworkIndicator } from '@/ui/components/NetworkIndicator';
import { OnRampList } from '@/ui/components/TokenLists/OnRampList';
import { useCurrency } from '@/ui/hooks/preference-hooks';
import { useCoins } from '@/ui/hooks/useCoinHook';
import { useNetwork } from '@/ui/hooks/useNetworkHook';
import { useProfiles } from '@/ui/hooks/useProfileHook';
import { getSwapLink } from '@/ui/utils/url-constants';

import { DashboardTotal } from './dashboard-total';
import WalletTab from './wallet-tab';
import MoveBoard from '../MoveBoard';

const DASHBOARD_POPUP_DISMISSED_KEY = 'dashboard-popup-dismissed';

const Dashboard = () => {
  const { network, emulatorModeOn } = useNetwork();
  const { balance, coinsLoaded } = useCoins();
  const currency = useCurrency();
  const {
    noAddress,
    registerStatus,
    canMoveToOtherAccount,
    activeAccountType,
    userInfo,
    mainAddress,
    currentWallet,
    currentWalletList,
  } = useProfiles();
  const navigate = useNavigate();
  const location = useLocation();
  // Use this to show the onramp drawer. Navigate to dashboard?onramp=true
  const [showOnRamp, setShowOnRamp] = useState(location.search.includes('onramp'));
  const [showMoveBoard, setShowMoveBoard] = useState(false);
  const [showPopup, setShowPopup] = useState(true);

  // Check localStorage on mount to determine if popup should show
  useEffect(() => {
    const dismissed = localStorage.getItem(DASHBOARD_POPUP_DISMISSED_KEY);
    if (dismissed !== 'true') {
      setShowPopup(true);
    }
  }, []);

  const swapLink = getSwapLink(network, activeAccountType);

  useEffect(() => {
    console.log(currentWallet, 'userInfo====', mainAddress, currentWalletList);
    if (userInfo && userInfo.id && currentWallet) {
      setUser({
        id: userInfo.id,
        username: userInfo.username,
      });
      const { eoaAccount = null, childAccounts = [], evmAccount = null } = currentWallet;
      setExtras({
        EOA: eoaAccount ? eoaAccount.address : '',
        COA: evmAccount ? evmAccount.address : '',
        selectedAccount: currentWallet.address,
        flowAccount: currentWallet?.address,
        childs: childAccounts.map((item) => item.address).join(','),
      });
    }
  }, [userInfo, mainAddress, currentWallet?.evmAccount, currentWallet?.eoaAccount]);

  const handleClosePopup = () => {
    localStorage.setItem(DASHBOARD_POPUP_DISMISSED_KEY, 'true');
    setShowPopup(false);
  };

  return (
    <Box
      sx={{
        width: '100%',
        display: 'flex',
        height: '100%',
        flexDirection: 'column',
      }}
    >
      <BuildIndicator />
      <NetworkIndicator network={network} emulatorMode={emulatorModeOn} />
      <div test-id="x-overflow" style={{ overflowX: 'hidden', height: '100%', width: '100%' }}>
        <DashboardTotal
          network={network}
          balance={coinsLoaded ? balance : undefined}
          currencyCode={coinsLoaded ? currency?.code : undefined}
          currencySymbol={coinsLoaded ? currency?.symbol : undefined}
          noAddress={noAddress}
          addressCreationInProgress={registerStatus}
        />
        {/* Button Row */}
        <ButtonRow
          onSendClick={() => navigate('/dashboard/select-tokens')}
          onReceiveClick={() => navigate('/dashboard/wallet/deposit')}
          onSwapClick={() => window.open(swapLink, '_blank', 'noopener,noreferrer')}
          onBuyClick={() => setShowOnRamp(true)}
          onMoveClick={() => setShowMoveBoard(true)}
          canMoveChild={canMoveToOtherAccount}
        />
        {/* Wallet Tab */}
        <WalletTab network={network} />
        {/* OnRamp Drawer */}
        <Drawer
          anchor="bottom"
          open={showOnRamp}
          transitionDuration={300}
          slotProps={{
            paper: {
              sx: {
                width: '100%',
                height: '65%',
                bgcolor: 'background.default',
                borderRadius: '18px 18px 0px 0px',
              },
            },
          }}
        >
          <OnRampList close={() => setShowOnRamp(false)} />
        </Drawer>
        {/* Move Board */}
        {showMoveBoard && (
          <MoveBoard
            showMoveBoard={showMoveBoard}
            handleCloseIconClicked={() => setShowMoveBoard(false)}
            handleCancelBtnClicked={() => setShowMoveBoard(false)}
            handleAddBtnClicked={() => {
              setShowMoveBoard(false);
            }}
          />
        )}
      </div>
      {/* One-time Popup Modal */}
      <UpdateDialog
        visible={showPopup}
        title="Extension Update V3.1.0"
        htmlContent={`
          <div style="display: flex; flex-direction: column; gap: 10px;">
            <div style="color: #FFFFFF; font-size: 14px; line-height: 1.5; font-weight: 600;">
              📣 What's new
            </div>
            <div style="color: #BABABA; font-size: 12px; line-height: 1.5;">
              If you already use an Ethereum wallet like MetaMask or Rainbow, you can import those same accounts to access everything on Flow.
            </div>
            <div style="color: #FFFFFF; font-size: 14px; line-height: 1.5; font-weight: 600;">
              🎮 Unlock Flow-native apps for your accounts
            </div>
            <div style="color: #BABABA; font-size: 12px; line-height: 1.5;">
              Get instant access to DeFi, marketplaces, and unique experiences on Flow.
            </div>
            <div style="color: #FFFFFF; font-size: 14px; line-height: 1.5; font-weight: 600;">
              ✨ Already using Flow Wallet?
            </div>
            <div style="color: #BABABA; font-size: 12px; line-height: 1.5;">
              You'll see a new "EVM" account alongside your Cadence accounts and your now-legacy "EVM Flow" account.
            </div>
            <div style="color: #FFFFFF; font-size: 14px; line-height: 1.5; font-weight: 600;">
              💡 Why this matters
            </div>
            <div style="color: #BABABA; font-size: 12px; line-height: 1.5;">
              Your EVM account is super-powered by Flow, unlocking gasless transactions, MEV-resilience and more.
            </div>
          </div>
        `}
        readMoreText="Read more"
        readMoreUrl="https://wallet.flow.com/post/eoa-support-comes-to-flow-wallet-extension"
        buttonText={chrome.i18n.getMessage('OK')}
        onButtonClick={handleClosePopup}
        onClose={handleClosePopup}
      />
    </Box>
  );
};

export default Dashboard;
