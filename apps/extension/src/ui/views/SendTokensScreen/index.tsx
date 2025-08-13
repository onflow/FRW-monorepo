import { SendTokensScreen } from '@onflow/frw-screens';
import type { TokenModel, WalletAccount } from '@onflow/frw-ui';
import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router';

import {
  usePlatformNavigation,
  usePlatformBridge,
  usePlatformTranslation,
} from '@/bridge/PlatformContext';
import { useActiveAccounts, useUserWallets } from '@/ui/hooks/use-account-hooks';
import { useWallet } from '@/ui/hooks/use-wallet';
import { useNetwork } from '@/ui/hooks/useNetworkHook';

const SendTokensScreenView = () => {
  const navigate = useNavigate();
  const params = useParams();
  const wallet = useWallet();
  const { network } = useNetwork();
  const userWallets = useUserWallets();
  const activeAccounts = useActiveAccounts(network, userWallets?.currentPubkey);

  // Get platform services
  const navigation = usePlatformNavigation(navigate);
  const bridge = usePlatformBridge();
  const t = usePlatformTranslation();

  // State management for the screen
  const [selectedToken, setSelectedToken] = useState<TokenModel | null>(null);
  const [fromAccount, setFromAccount] = useState<WalletAccount | null>(null);
  const [toAccount, setToAccount] = useState<WalletAccount | null>(null);
  const [amount, setAmount] = useState('');
  const [tokens, setTokens] = useState<TokenModel[]>([]);
  const [isTokenMode, setIsTokenMode] = useState(true);
  const [isTokenSelectorVisible, setIsTokenSelectorVisible] = useState(false);
  const [isConfirmationVisible, setIsConfirmationVisible] = useState(false);

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      try {
        // Set from account from current address
        if (activeAccounts?.currentAddress) {
          setFromAccount({
            address: activeAccounts.currentAddress,
            name: 'Current Account', // You might want to get the actual name
            balance: '0', // You might want to get the actual balance
          });
        }

        // Load tokens - you'll need to implement this based on your token loading logic
        // const tokenList = await wallet.getTokenList();
        // setTokens(tokenList);

        // Set default token (e.g., FLOW)
        const defaultToken: TokenModel = {
          address: '0x1654653399040a61.FlowToken',
          name: 'Flow',
          symbol: 'FLOW',
          decimals: 8,
          logoURI:
            'https://cdn.jsdelivr.net/gh/FlowFans/flow-token-list@main/token-registry/A.1654653399040a61.FlowToken/logo.svg',
          balance: '0',
          priceInUSD: '0',
        };
        setSelectedToken(defaultToken);
      } catch (error) {
        console.error('Error loading send tokens data:', error);
      }
    };

    loadData();
  }, [activeAccounts?.currentAddress, wallet]);

  // Get recipient from route params or previous screen
  useEffect(() => {
    // If there's a recipient address in route params, set it
    if (params.toAddress) {
      setToAccount({
        address: params.toAddress as string,
        name: 'Recipient',
        balance: '0',
      });
    }
  }, [params.toAddress]);

  // Event handlers
  const handleTokenSelect = useCallback((token: TokenModel) => {
    setSelectedToken(token);
    setIsTokenSelectorVisible(false);
  }, []);

  const handleAmountChange = useCallback((newAmount: string) => {
    setAmount(newAmount);
  }, []);

  const handleToggleInputMode = useCallback(() => {
    setIsTokenMode(!isTokenMode);
  }, [isTokenMode]);

  const handleMaxPress = useCallback(() => {
    if (selectedToken?.balance) {
      setAmount(selectedToken.balance);
    }
  }, [selectedToken?.balance]);

  const handleSendPress = useCallback(() => {
    setIsConfirmationVisible(true);
  }, []);

  const handleTokenSelectorOpen = useCallback(() => {
    setIsTokenSelectorVisible(true);
  }, []);

  const handleTokenSelectorClose = useCallback(() => {
    setIsTokenSelectorVisible(false);
  }, []);

  const handleConfirmationOpen = useCallback(() => {
    setIsConfirmationVisible(true);
  }, []);

  const handleConfirmationClose = useCallback(() => {
    setIsConfirmationVisible(false);
  }, []);

  const handleTransactionConfirm = useCallback(async () => {
    try {
      if (!selectedToken || !fromAccount || !toAccount || !amount) {
        throw new Error('Missing required transaction data');
      }

      // Perform the transaction using wallet
      // const result = await wallet.sendTransaction({
      //   token: selectedToken,
      //   from: fromAccount.address,
      //   to: toAccount.address,
      //   amount: amount,
      // });

      console.log('Transaction confirmed:', {
        token: selectedToken,
        from: fromAccount.address,
        to: toAccount.address,
        amount: amount,
      });

      // Close confirmation modal
      setIsConfirmationVisible(false);

      // Navigate to success screen or back to dashboard
      navigate('/dashboard');
    } catch (error) {
      console.error('Transaction failed:', error);
      // Handle error (show error message, etc.)
    }
  }, [selectedToken, fromAccount, toAccount, amount, wallet, navigate]);

  return (
    <SendTokensScreen
      selectedToken={selectedToken}
      fromAccount={fromAccount}
      toAccount={toAccount}
      amount={amount}
      isTokenMode={isTokenMode}
      tokens={tokens}
      isTokenSelectorVisible={isTokenSelectorVisible}
      isConfirmationVisible={isConfirmationVisible}
      onTokenSelect={handleTokenSelect}
      onAmountChange={handleAmountChange}
      onToggleInputMode={handleToggleInputMode}
      onMaxPress={handleMaxPress}
      onSendPress={handleSendPress}
      onTokenSelectorOpen={handleTokenSelectorOpen}
      onTokenSelectorClose={handleTokenSelectorClose}
      onConfirmationOpen={handleConfirmationOpen}
      onConfirmationClose={handleConfirmationClose}
      onTransactionConfirm={handleTransactionConfirm}
      transactionFee="~0.001 FLOW"
    />
  );
};

export default SendTokensScreenView;
