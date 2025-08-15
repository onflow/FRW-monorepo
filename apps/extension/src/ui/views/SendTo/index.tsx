import React, { useCallback, useEffect, useReducer } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router';

import { INITIAL_TRANSACTION_STATE, transactionReducer } from '@/reducers';
import { type FlowNetwork, type WalletAddress } from '@/shared/types';
import { isValidAddress, isValidFlowAddress } from '@/shared/utils';
import { useCoins } from '@/ui/hooks/useCoinHook';
import { useProfiles } from '@/ui/hooks/useProfileHook';

import SendToCadenceOrEvm from './SendToCadenceOrEvm';
import SendToScreenEmbed from './SendToScreenEmbed';

// Export the new embedded screens for use in routing
export { default as SendToScreenEmbed } from './SendToScreenEmbed';
export { default as SendTokensScreenEmbed } from './SendTokensScreenEmbed';
export { default as TransferAmountScreenEmbed } from './TransferAmountScreenEmbed';
export { default as TransferConfirmationScreenEmbed } from './TransferConfirmationScreenEmbed';

export const SendTo = () => {
  // Remove or use only in development

  const { network, mainAddress, evmAddress, childAccounts, currentWallet, userInfo } =
    useProfiles();
  const { coins, coinsLoaded } = useCoins();
  const params = useParams();
  const token = params.id;
  const toAddress = params.toAddress;
  const location = useLocation();
  const navigate = useNavigate();

  const [transactionState, dispatch] = useReducer(transactionReducer, INITIAL_TRANSACTION_STATE);

  // Check if we should use the new migrated screen
  const useNewScreen =
    new URLSearchParams(location.search).get('newScreen') === 'true' ||
    process.env.NODE_ENV === 'development';

  const handleTokenChange = useCallback(
    async (symbol: string) => {
      // shouldn't use symbol should use address
      const coinInfo = coins?.find((coin) => coin.unit.toLowerCase() === symbol.toLowerCase());
      if (coinInfo) {
        dispatch({
          type: 'setTokenInfo', // Change action type
          payload: {
            tokenInfo: coinInfo, // Update payload structure
          },
        });
        // Update the URL to the new token
        navigate(`/dashboard/token/${symbol.toLowerCase()}/send/${toAddress}`);
      } else {
        if (coinsLoaded) {
          throw new Error(`Token ${symbol} not found`);
        }
      }
    },
    [coins, coinsLoaded, navigate, toAddress]
  );

  useEffect(() => {
    if (mainAddress && isValidFlowAddress(mainAddress) && isValidAddress(currentWallet?.address)) {
      dispatch({
        type: 'initTransactionState',
        payload: {
          network: network as FlowNetwork,
          parentAddress: mainAddress,
          parentCoaAddress: evmAddress as WalletAddress,
          parentChildAddresses: childAccounts?.map((child) => child.address as WalletAddress) ?? [],
          fromAddress: currentWallet.address as WalletAddress,
          fromContact: {
            id: 0,
            address: currentWallet.address as WalletAddress,
            contact_name: userInfo?.nickname || '',
            username: userInfo?.username || '',
            avatar: userInfo?.avatar || '',
          },
        },
      });
      // Setup the to address
      dispatch({
        type: 'setToAddress',
        payload: {
          address: toAddress as WalletAddress,
          contact: {
            id: 0,
            address: toAddress as WalletAddress,
            contact_name: '',
            username: '',
            avatar: '',
          },
        },
      });

      if (token) {
        handleTokenChange(token);
      } else {
        // Set the token to the default token using tokenInfo
        handleTokenChange(INITIAL_TRANSACTION_STATE.tokenInfo.symbol);
      }
    }
  }, [
    mainAddress,
    currentWallet.address,
    userInfo?.nickname,
    userInfo?.username,
    userInfo?.avatar,
    token,
    toAddress,
    handleTokenChange,
    location.search,
    evmAddress,
    childAccounts,
    network,
  ]);

  const handleAmountChange = (amount: string) => {
    dispatch({
      type: 'setAmount',
      payload: amount,
    });
  };

  const handleSwitchFiatOrCoin = () => {
    dispatch({
      type: 'switchFiatOrCoin',
    });
  };

  const handleMaxClick = () => {
    dispatch({
      type: 'setAmountToMax',
    });
  };

  const handleFinalizeAmount = () => {
    dispatch({
      type: 'finalizeAmount',
    });
  };

  // If using new screen, render the embedded component
  if (useNewScreen) {
    return <SendToScreenEmbed />;
  }

  return (
    <SendToCadenceOrEvm
      transactionState={transactionState}
      handleAmountChange={handleAmountChange}
      handleTokenChange={handleTokenChange}
      handleSwitchFiatOrCoin={handleSwitchFiatOrCoin}
      handleMaxClick={handleMaxClick}
      handleFinalizeAmount={handleFinalizeAmount}
    />
  );
};

export default SendTo;
