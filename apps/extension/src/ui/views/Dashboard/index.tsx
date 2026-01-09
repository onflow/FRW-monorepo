import { Drawer } from '@mui/material';
import Box from '@mui/material/Box';
// import { UpdateDialog } from '@onflow/frw-ui';
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

const getVersionForPopup = (): string => {
  const version = chrome.runtime.getManifest().version || '3.1.0';
  const versionParts = version.split('.');
  if (versionParts.length >= 3) {
    versionParts[2] = '0';
  }
  return versionParts.join('.');
};

const getDashboardPopupDismissedKey = (): string => {
  const version = getVersionForPopup();
  return `dashboard-popup-dismissed-v${version}`;
};

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
  const [showPopup, setShowPopup] = useState(false);

  // Get version for popup title (patch version set to 0)
  const version = getVersionForPopup();
  const popupTitle = `Extension Update V${version}`;

  // Check localStorage on mount to determine if popup should show
  useEffect(() => {
    const key = getDashboardPopupDismissedKey();
    const dismissed = localStorage.getItem(key);
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
    const key = getDashboardPopupDismissedKey();
    localStorage.setItem(key, 'true');
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
      {/* Dialog demo */}
      {/* <UpdateDialog
        visible={true}
        title={popupTitle}
        htmlContent={`
<h2>whats new</h2>\n<blockquote>\n<p>1345 quote</p>\n</blockquote>\n<p><strong>this is a blob text</strong></p>\n<ul>\n<li>one\n<ul>\n<li>tow\n<ul>\n<li>three</li>\n</ul>\n</li>\n</ul>\n</li>\n</ul>\n<table>\n    <tr>\n        <td>Foo</td>\n    </tr>\n</table>\n<div >\n123\n</div>\n<hr>\n<div>\n\t<style>\n\t\t.main-title { font-size: 24px; font-weight: bold; } .info-section { display:\n\t\tflex; align-items: flex-start; margin-bottom: 20px; } .icon { width: 40px;\n\t\theight: 40px; background-color: #333; border-radius: 8px; display: flex;\n\t\tjustify-content: center; align-items: center; margin-right: 12px; flex-shrink:\n\t\t0; } .icon-content { font-size: 20px; color: #FFFFFF; } .info-text { flex:\n\t\t1; } .info-title { font-size: 16px; font-weight: bold; margin-bottom: 4px;\n\t\t} .info-desc { font-size: 14px; line-height: 1.4; }\n\t</style>\n\t<div class=\"info-section\">\n\t\t<div class=\"icon\">\n\t\t\t<span class=\"icon-content\">\n\t\t\t\t��\n\t\t\t</span>\n\t\t</div>\n\t\t<div class=\"info-text\">\n\t\t\t<div class=\"info-title\">\n\t\t\t\tWhat's new\n\t\t\t</div>\n\t\t\t<div class=\"info-desc\">\n\t\t\t\tIf you already use an Ethereum wallet like MetaMask or Rainbow, you can\n\t\t\t\timport those same accounts to access everything on Flow.\n\t\t\t</div>\n\t\t</div>\n\t</div>\n\t<div class=\"info-section\">\n\t\t<div class=\"icon\">\n\t\t\t<span class=\"icon-content\">\n\t\t\t\t😈\n\t\t\t</span>\n\t\t</div>\n\t\t<div class=\"info-text\">\n\t\t\t<div class=\"info-title\">\n\t\t\t\tFlow-native apps for your accounts\n\t\t\t</div>\n\t\t\t<div class=\"info-desc\">\n\t\t\t\tGet instant access to DeFi, marketplaces, and experiences on Flow.\n\t\t\t</div>\n\t\t</div>\n\t</div>\n\t<div class=\"info-section\">\n\t\t<img class=\"icon\" src=\"https://raw.githubusercontent.com/onflow/assets/refs/heads/main/tokens/registry/0x717dae2baf7656be9a9b01dee31d571a9d4c9579/logo.png\">\n\t\t</img>\n\t\t<div class=\"info-text\">\n\t\t\t<div class=\"info-title\">\n\t\t\t\tAlready using Flow Wallet?\n\t\t\t</div>\n\t\t\t<div class=\"info-desc\">\n\t\t\t\tYou’ll see a new &quot;EVM&quot; account alongside your Cadence accounts\n\t\t\t\tand your now legacy &quot;EVM Flow&quot; account.\n\t\t\t</div>\n\t\t</div>\n\t</div>\n\t<div class=\"info-section\">\n\t\t<div class=\"icon\">\n\t\t\t<span class=\"icon-content\">\n\t\t\t\t��\n\t\t\t</span>\n\t\t</div>\n\t\t<div class=\"info-text\">\n\t\t\t<div class=\"info-title\">\n\t\t\t\tWhy this matters\n\t\t\t</div>\n\t\t\t<div class=\"info-desc\">\n\t\t\t\tYour new EVM account is super-powered by Flow, unlocking gasless transactions,\n\t\t\t\tMEV-resilience and more.\n\t\t\t</div>\n\t\t</div>\n\t</div>\n</div>\n<hr>\n<ul>\n<li>ui</li>\n<li>ux</li>\n<li>dev</li>\n</ul>\n
`}
        actions={[
          {
            text: 'Read More',
            url: 'https://raw.githubusercontent.com/caosbad/logs/refs/heads/main/template.md',
            type: 'external',
            style: {
              bgColor: '#007AFF',
              textColor: '#FFFFFF',
            },
          },
        ]}
        buttonText={chrome.i18n.getMessage('OK')}
        onButtonClick={handleClosePopup}
        onClose={handleClosePopup}
      /> */}
    </Box>
  );
};

export default Dashboard;
