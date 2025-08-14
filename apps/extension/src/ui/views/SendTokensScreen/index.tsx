import { SendTokensScreen, type TokenModel, type WalletAccount } from '@onflow/frw-screens';
import React, { useCallback, useEffect, useReducer, useState } from 'react';
import { useNavigate, useParams } from 'react-router';

import { INITIAL_TRANSACTION_STATE, transactionReducer } from '@/reducers';
import { type FlowNetwork, type WalletAddress } from '@/shared/types';
import { isValidAddress, isValidFlowAddress } from '@/shared/utils';
import { useWallet } from '@/ui/hooks/use-wallet';
import { useCoins } from '@/ui/hooks/useCoinHook';
import { useProfiles } from '@/ui/hooks/useProfileHook';

const SendTokensScreenView = () => {
  const navigate = useNavigate();
  const params = useParams();
  const wallet = useWallet();
  const { network, mainAddress, evmAddress, childAccounts, currentWallet, userInfo } =
    useProfiles();
  const { coins, coinsLoaded } = useCoins();

  // Use transaction reducer directly like SendTo screen
  const [transactionState, dispatch] = useReducer(transactionReducer, INITIAL_TRANSACTION_STATE);

  // UI state for modals
  const [isTokenSelectorVisible, setIsTokenSelectorVisible] = useState(false);
  const [isConfirmationVisible, setIsConfirmationVisible] = useState(false);

  // Convert transaction state to screen props
  const convertExtendedTokenInfoToTokenModel = useCallback(
    (tokenInfo: any): TokenModel => ({
      name: tokenInfo.name || 'Unknown Token',
      symbol: tokenInfo.symbol || '',
      balance: tokenInfo.balance || '0',
      priceInUSD: tokenInfo.price || '0',
      decimals: tokenInfo.decimals || 8,
      logoURI: tokenInfo.logoURI || '',
      address: tokenInfo.address || '',
    }),
    []
  );

  const convertAddressToWalletAccount = useCallback(
    (address: WalletAddress | '', contact?: any): WalletAccount | null => {
      if (!address) return null;
      return {
        address: address as WalletAddress,
        name: contact?.contact_name || 'Account',
        balance: '0',
      };
    },
    []
  );

  // Get available tokens
  const availableTokens: TokenModel[] = React.useMemo(() => {
    return coins ? coins.map(convertExtendedTokenInfoToTokenModel) : [];
  }, [coins, convertExtendedTokenInfoToTokenModel]);

  // Handler functions
  const handleTokenSelect = useCallback((token: TokenModel) => {
    const tokenInfo = {
      name: token.name,
      symbol: token.symbol || '',
      balance: token.balance || '0',
      price: token.priceInUSD || '0',
      decimals: token.decimals || 8,
      logoURI: token.logoURI || '',
      address: token.address || '',
      contractName: '',
      path: { balance: '', receiver: '', vault: '' },
      id: '',
      coin: '',
      unit: '',
      change24h: 0,
      total: '0',
      icon: token.logoURI || '',
      priceInUSD: token.priceInUSD || '0',
      priceInFLOW: '0',
      balanceInFLOW: '0',
      balanceInUSD: '0',
    };
    dispatch({
      type: 'setTokenInfo',
      payload: { tokenInfo },
    });
    setIsTokenSelectorVisible(false);
  }, []);

  const handleAmountChange = useCallback((amount: string) => {
    dispatch({ type: 'setAmount', payload: amount });
  }, []);

  const handleToggleInputMode = useCallback(() => {
    dispatch({ type: 'switchFiatOrCoin' });
  }, []);

  const handleMaxPress = useCallback(() => {
    dispatch({ type: 'setAmountToMax' });
  }, []);

  const handleSendPress = useCallback(() => {
    console.log('Send transaction triggered');
  }, []);

  const handleTransactionConfirm = useCallback(async () => {
    try {
      dispatch({ type: 'finalizeAmount' });
      const txId = await wallet.transferTokens(transactionState);
      console.log('Transaction submitted successfully:', txId);
    } catch (error) {
      console.error('Transaction failed:', error);
      throw error;
    }
  }, [wallet, transactionState]);

  // Initialize transaction state on mount
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
    }
  }, [mainAddress, currentWallet?.address, userInfo, evmAddress, childAccounts, network]);

  // Set recipient from route params
  useEffect(() => {
    if (params.toAddress) {
      dispatch({
        type: 'setToAddress',
        payload: {
          address: params.toAddress as WalletAddress,
          contact: {
            id: 0,
            address: params.toAddress as WalletAddress,
            contact_name: '',
            username: '',
            avatar: '',
          },
        },
      });
    }
  }, [params.toAddress]);

  // Set default token when coins are loaded
  useEffect(() => {
    if (coins && coins.length > 0 && !transactionState.tokenInfo.name) {
      const flowToken = coins.find((token) => token.symbol.toLowerCase() === 'flow');
      const defaultToken = flowToken || coins[0];
      dispatch({
        type: 'setTokenInfo',
        payload: { tokenInfo: defaultToken },
      });
    }
  }, [coins, transactionState.tokenInfo.name]);

  // Create screen props
  const screenProps = {
    selectedToken: convertExtendedTokenInfoToTokenModel(transactionState.tokenInfo),
    fromAccount: convertAddressToWalletAccount(
      transactionState.fromAddress,
      transactionState.fromContact
    ),
    toAccount: convertAddressToWalletAccount(
      transactionState.toAddress,
      transactionState.toContact
    ),
    amount:
      transactionState.fiatOrCoin === 'coin'
        ? transactionState.amount
        : transactionState.fiatAmount,
    isTokenMode: transactionState.fiatOrCoin === 'coin',
    tokens: availableTokens,
    isTokenSelectorVisible,
    isConfirmationVisible,
    onTokenSelect: handleTokenSelect,
    onAmountChange: handleAmountChange,
    onToggleInputMode: handleToggleInputMode,
    onMaxPress: handleMaxPress,
    onSendPress: handleSendPress,
    onTokenSelectorOpen: () => setIsTokenSelectorVisible(true),
    onTokenSelectorClose: () => setIsTokenSelectorVisible(false),
    onConfirmationOpen: () => setIsConfirmationVisible(true),
    onConfirmationClose: () => setIsConfirmationVisible(false),
    onTransactionConfirm: handleTransactionConfirm,
    backgroundColor: '$bg',
    contentPadding: '$1',
    transactionFee: '~0.001 FLOW',
  };

  return <SendTokensScreen {...screenProps} />;
};

export default SendTokensScreenView;
