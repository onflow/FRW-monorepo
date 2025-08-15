import {
  HomeScreen,
  ColorDemoScreen,
  NFTDetailScreen,
  NFTListScreen,
  SelectTokensScreen,
  SendSingleNFTScreen,
  SendMultipleNFTsScreen,
} from '@onflow/frw-screens';
import { useSendStore } from '@onflow/frw-stores';
import {
  type NFTModel,
  type InitialProps,
  createWalletAccountFromConfig,
  createNFTModelsFromConfig,
  createTokenModelFromConfig,
} from '@onflow/frw-types';
import React, { useEffect } from 'react';
import { Route, Routes, useLocation } from 'react-router';


import PrivateRoute from '@/ui/components/PrivateRoute';
import { useAppNavigation } from '@/ui/hooks/use-navigation';
import { useWallet } from '@/ui/hooks/use-wallet';
import {
  SendToScreenEmbed,
  SendTokensScreenEmbed,
  TransferAmountScreenEmbed,
  TransferConfirmationScreenEmbed,
} from '@/ui/views/SendTo';

// Route parameter types (similar to React Native's RootStackParamList)
export interface RouteParams {
  Home: { address?: string; network?: string };
  ColorDemo: undefined;
  NFTDetail: {
    nft: NFTModel;
    selectedNFTs?: NFTModel[];
    onSelectionChange?: (nftId: string, selected: boolean) => void;
  };
  NFTList: {
    collection?: Record<string, unknown>;
    address?: string;
    selectedNFTIds?: string[];
    isEditing?: boolean;
  };
  SelectTokens: undefined;
  SendTo: undefined;
  SendTokens: undefined;
  SendSingleNFT: undefined;
  SendMultipleNFTs: undefined;
  Confirmation: {
    fromAccount: Record<string, unknown>;
    toAccount: Record<string, unknown>;
    amount?: string;
    token?: Record<string, unknown>;
    selectedNFTs?: Record<string, unknown>[];
  };
}

interface AppRouterProps {
  address?: string;
  network?: string;
  embedded?: boolean;
  initialProps?: InitialProps;
}

// Bridge adapter for extension
const createBridge = (wallet: unknown) => ({
  getSelectedAddress(): string | null {
    // Get current address from wallet
    return wallet?.getCurrentAddress?.() || null;
  },
  getNetwork(): string {
    // Get current network from wallet
    return wallet?.getNetwork?.() || 'mainnet';
  },
});

// Translation function
const t = (key: string, _options?: Record<string, unknown>) => {
  // Use Chrome extension i18n if available, otherwise return key
  if (typeof chrome !== 'undefined' && chrome.i18n) {
    return chrome.i18n.getMessage(key) || key;
  }
  return key;
};

const AppRouter: React.FC<AppRouterProps> = ({ address, network, initialProps }) => {
  const { navigateToRoute } = useAppNavigation();
  const location = useLocation();
  const wallet = useWallet();

  // Send store actions
  const {
    setSelectedToken,
    setCurrentStep,
    setTransactionType,
    setFromAccount,
    setSelectedNFTs,
    setToAccount,
  } = useSendStore();

  // Create navigation object for screens
  const navigation = {
    navigate: (screen: string, params?: Record<string, unknown>) => {
      const routeMap: Record<string, string> = {
        Home: '/dashboard',
        ColorDemo: '/dashboard/colordemo',
        NFTDetail: '/dashboard/nftdetail',
        NFTList: '/dashboard/nftlist',
        SelectTokens: '/dashboard/selecttokens',
        SendTo: '/dashboard/sendto',
        SendTokens: '/dashboard/sendtokens',
        SendSingleNFT: '/dashboard/sendsinglenft',
        SendMultipleNFTs: '/dashboard/sendmultiplenfts',
      };

      const route = routeMap[screen] || `/dashboard/${screen.toLowerCase()}`;
      navigateToRoute(route, params);
    },
    goBack: () => {
      navigateToRoute(-1 as unknown as string);
    },
  };

  // Create bridge for screens
  const bridge = createBridge(wallet);

  // Initialize SendTo flow if requested (similar to React Native)
  useEffect(() => {
    if (initialProps?.screen === 'send-asset') {
      const sendToConfig = initialProps?.sendToConfig;
      if (!sendToConfig) {
        return;
      }
      try {
        if (sendToConfig.fromAccount) {
          // Setting from account
          const walletAccount = createWalletAccountFromConfig(sendToConfig.fromAccount);
          setFromAccount(walletAccount);
        }
        if (sendToConfig.selectedToken) {
          // Setting selected token
          const tokenInfo = createTokenModelFromConfig(sendToConfig.selectedToken);
          setSelectedToken(tokenInfo);
          setCurrentStep('send-to');
        }

        if (sendToConfig.selectedNFTs && Array.isArray(sendToConfig.selectedNFTs)) {
          // Setting selected NFTs
          const nftModels = createNFTModelsFromConfig(sendToConfig.selectedNFTs);
          setSelectedNFTs(nftModels);
        }

        if (sendToConfig.targetAddress) {
          const walletAccount = createWalletAccountFromConfig({
            address: sendToConfig.targetAddress,
            name: sendToConfig.targetAddress,
            emojiInfo: { emoji: '', name: '', color: '' },
          });
          setToAccount(walletAccount);
          setTransactionType('tokens');
          setCurrentStep('send-tokens');
        } else if (sendToConfig.selectedNFTs?.length === 1) {
          setTransactionType('single-nft');
          setCurrentStep('send-to');
        } else if (sendToConfig.selectedNFTs && sendToConfig.selectedNFTs.length > 1) {
          setTransactionType('multiple-nfts');
          setCurrentStep('send-to');
        }
      } catch (error) {
        // Failed to initialize SendTo flow
        if (error instanceof Error) {
          // Handle error appropriately
        }
      }
    }
  }, [
    initialProps?.screen,
    initialProps?.sendToConfig,
    setSelectedToken,
    setCurrentStep,
    setTransactionType,
    setFromAccount,
    setSelectedNFTs,
    setToAccount,
  ]);

  // Common props for all screens
  const commonScreenProps = {
    navigation,
    bridge,
    t,
  };

  return (
    <Routes>
      {/* Home Screen */}
      <Route
        index
        element={
          <PrivateRoute>
            <HomeScreen
              {...commonScreenProps}
              address={address}
              network={network}
              cadenceService={null}
              onNavigateToColorDemo={() => navigation.navigate('ColorDemo')}
              onNavigateToSelectTokens={() => navigation.navigate('SelectTokens')}
              onNavigateToNFTDetail={() => navigation.navigate('NFTDetail')}
            />
          </PrivateRoute>
        }
      />

      {/* Color Demo Screen */}
      <Route
        path="colordemo"
        element={
          <PrivateRoute>
            <ColorDemoScreen
              {...commonScreenProps}
              theme={{ isDark: true }} // TODO: Get from theme context
              onThemeToggle={() => {
                // Implement theme toggle
              }}
            />
          </PrivateRoute>
        }
      />

      {/* NFT Detail Screen */}
      <Route
        path="nftdetail/:id"
        element={
          <PrivateRoute>
            <NFTDetailScreen
              {...commonScreenProps}
              nft={location.state?.nft}
              selectedNFTs={location.state?.selectedNFTs}
              onSelectionChange={location.state?.onSelectionChange || (() => {})}
              onConfirmSelection={() => {
                // Handle confirm selection
              }}
            />
          </PrivateRoute>
        }
      />

      {/* NFT List Screen */}
      <Route
        path="nftlist"
        element={
          <PrivateRoute>
            <NFTListScreen
              {...commonScreenProps}
              collection={location.state?.collection}
              address={address}
              selectedNFTIds={location.state?.selectedNFTIds}
              isEditing={location.state?.isEditing}
              onNFTSelect={() => {
                // Handle NFT selection
              }}
              onConfirmSelection={() => {
                // Handle confirm selection
              }}
              onNavigateToNFTDetail={() => {
                // Handle navigate to NFT detail
              }}
            />
          </PrivateRoute>
        }
      />

      {/* Select Tokens Screen */}
      <Route
        path="selecttokens"
        element={
          <PrivateRoute>
            <SelectTokensScreen
              {...commonScreenProps}
              onTokenSelect={(token: unknown) => {
                navigation.navigate('SendTo', { selectedToken: token });
              }}
              onNFTCollectionSelect={(collection: unknown) => {
                navigation.navigate('NFTList', { collection });
              }}
              onAccountSelect={() => {
                // Handle account selection
              }}
            />
          </PrivateRoute>
        }
      />

      {/* Send To Screen */}
      <Route
        path="sendto"
        element={
          <PrivateRoute>
            <SendToScreenEmbed />
          </PrivateRoute>
        }
      />

      {/* Send Tokens Screen */}
      <Route
        path="sendtokens"
        element={
          <PrivateRoute>
            <SendTokensScreenEmbed />
          </PrivateRoute>
        }
      />

      {/* Transfer Amount Screen */}
      <Route
        path="transferamount"
        element={
          <PrivateRoute>
            <TransferAmountScreenEmbed />
          </PrivateRoute>
        }
      />

      {/* Transfer Confirmation Screen */}
      <Route
        path="transferconfirmation"
        element={
          <PrivateRoute>
            <TransferConfirmationScreenEmbed />
          </PrivateRoute>
        }
      />

      {/* Send Single NFT Screen */}
      <Route
        path="sendsinglenft"
        element={
          <PrivateRoute>
            <SendSingleNFTScreen
              {...commonScreenProps}
              nft={null}
              recipientAddress=""
              recipientName=""
              onConfirm={(transactionData: unknown) => {
                // Execute NFT transaction
                void transactionData;
              }}
            />
          </PrivateRoute>
        }
      />

      {/* Send Multiple NFTs Screen */}
      <Route
        path="sendmultiplenfts"
        element={
          <PrivateRoute>
            <SendMultipleNFTsScreen
              {...commonScreenProps}
              nfts={[]}
              recipientAddress=""
              recipientName=""
              onConfirm={(transactionData: unknown) => {
                // Execute multiple NFT transaction
                void transactionData;
              }}
            />
          </PrivateRoute>
        }
      />
    </Routes>
  );
};

export default AppRouter;
