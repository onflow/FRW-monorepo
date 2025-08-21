import { SendTokensScreen, type TokenModel, type WalletAccount } from '@onflow/frw-screens';
import React, { useCallback, useEffect, useMemo, useReducer, useState } from 'react';
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
  const { network, mainAddress, evmAddress, childAccounts, currentWallet, userInfo, walletList } =
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
        avatar: contact?.avatar || '',
        emoji: contact?.emoji || contact?.emojiInfo?.emoji || '',
        emojiInfo: contact?.emojiInfo || null,
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

  const handleSendPress = useCallback(() => {
    setIsConfirmationVisible(true);
  }, []);

  const handleTransactionConfirm = useCallback(async () => {
    try {
      // Finalize the amount before transaction
      dispatch({ type: 'finalizeAmount' });

      // Execute the transaction
      const txId: string = await wallet.transferTokens(transactionState);

      // Start transaction monitoring with notification
      wallet.listenTransaction(
        txId,
        true,
        `${transactionState.amount} ${transactionState.tokenInfo.coin} Sent`,
        `You have sent ${transactionState.amount} ${transactionState.tokenInfo?.symbol} to ${transactionState.toAddress}. \nClick to view this transaction.`,
        transactionState.tokenInfo.icon
      );

      // Record the recent contact
      await wallet.setRecent(transactionState.toContact);

      // Update the dashboard index to first tab
      await wallet.setDashIndex(0);

      // Navigate to dashboard activity tab with transaction ID
      navigate(`/dashboard?activity=1&txId=${txId}`);
    } catch (error) {
      console.error('Transaction failed:', error);
      // Re-throw error so the screen can handle it (show error state, keep modal open, etc.)
      throw error;
    }
  }, [wallet, transactionState, navigate]);

  // Initialize transaction state on mount - include toAddress from params if available
  useEffect(() => {
    if (mainAddress && isValidFlowAddress(mainAddress) && isValidAddress(currentWallet?.address)) {
      const initPayload = {
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
          emoji: currentWallet?.icon || '',
        },
      };

      dispatch({
        type: 'initTransactionState',
        payload: initPayload,
      });

      // Set recipient from route params immediately after init
      if (params.toAddress) {
        // Check if recipient is from current wallet list
        const walletAccount = walletList?.find((account) => account?.address === params.toAddress);
        console.log('walletAccount', walletAccount);
        const toAddressPayload = {
          address: params.toAddress as WalletAddress,
          contact: {
            id: 0,
            address: params.toAddress as WalletAddress,
            contact_name: walletAccount?.name || 'Recipient',
            username: '',
            avatar: '',
            emoji: walletAccount?.icon || '',
          },
        };
        dispatch({
          type: 'setToAddress',
          payload: toAddressPayload,
        });
      }
    }
  }, [
    mainAddress,
    currentWallet?.address,
    userInfo,
    evmAddress,
    childAccounts,
    network,
    params.toAddress,
    walletList,
  ]);

  // Set token from route params or default token when coins are loaded
  useEffect(() => {
    if (coinsLoaded && coins && coins.length > 0) {
      let selectedToken;

      // Try to find token by ID from route params
      if (params.id) {
        selectedToken = coins.find(
          (token) =>
            token.symbol.toLowerCase() === params.id.toLowerCase() ||
            token.name.toLowerCase() === params.id.toLowerCase() ||
            token.address.toLowerCase() === params.id.toLowerCase()
        );
      }

      // Fall back to FLOW token or first token if not found
      if (!selectedToken) {
        const flowToken = coins.find((token) => token.symbol.toLowerCase() === 'flow');
        selectedToken = flowToken || coins[0];
      }

      // Only update if different from current token
      if (selectedToken && selectedToken.symbol !== transactionState.tokenInfo.symbol) {
        dispatch({
          type: 'setTokenInfo',
          payload: { tokenInfo: selectedToken },
        });
      }
    }
  }, [coinsLoaded, coins, params.id]);

  // Create screen props
  const fromAccount = convertAddressToWalletAccount(
    transactionState.fromAddress,
    transactionState.fromContact
  );
  const toAccount = convertAddressToWalletAccount(
    transactionState.toAddress,
    transactionState.toContact
  );

  // Debug logging
  console.log('transactionState.toContact:', transactionState.toContact);
  console.log('toAccount:', toAccount);
  console.log('toAccount.emoji:', toAccount?.emoji);

  const screenProps = useMemo(
    () => ({
      selectedToken: convertExtendedTokenInfoToTokenModel(transactionState.tokenInfo),
      fromAccount,
      toAccount,
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
      onSendPress: handleSendPress,
      onTokenSelectorOpen: () => setIsTokenSelectorVisible(true),
      onTokenSelectorClose: () => setIsTokenSelectorVisible(false),
      onConfirmationOpen: () => setIsConfirmationVisible(true),
      onConfirmationClose: () => setIsConfirmationVisible(false),
      onTransactionConfirm: handleTransactionConfirm,
      backgroundColor: '$bg',
      contentPadding: 8, // Use smaller extension-specific padding
      transactionFee: '~0.001 FLOW',
    }),
    [
      transactionState,
      fromAccount,
      toAccount,
      availableTokens,
      isTokenSelectorVisible,
      isConfirmationVisible,
      handleTokenSelect,
      handleAmountChange,
      handleToggleInputMode,
      handleSendPress,
      handleTransactionConfirm,
      convertExtendedTokenInfoToTokenModel,
    ]
  );

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        padding: '15px',
        background: 'black',
      }}
    >
      <div style={{ flex: 1, overflow: 'auto' }}>
        <SendTokensScreen {...screenProps} />
      </div>
    </div>
  );
};

export default SendTokensScreenView;
