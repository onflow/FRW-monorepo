import { SelectTokensScreen } from '@onflow/frw-screens';
import { tamaguiConfig as uiConfig } from '@onflow/frw-ui';
import React, { useCallback } from 'react';
import { useNavigate } from 'react-router';
import { TamaguiProvider } from 'tamagui';

import { type FlowNetwork, type WalletAddress } from '@/shared/types';
import { useWallet } from '@/ui/hooks/use-wallet';
import { useProfiles } from '@/ui/hooks/useProfileHook';

// Bridge implementation for extension
const createExtensionBridge = (network: FlowNetwork, selectedAddress: WalletAddress) => ({
  getNetwork: () => network,
  getSelectedAddress: () => selectedAddress,
});

// Translation function for extension
const createTranslationFunction = () => (key: string, options?: any) => {
  // Simple translation mapping - in a real app this would use i18next
  const translations: Record<string, string> = {
    'tabs.tokens': 'Tokens',
    'tabs.nfts': 'NFTs',
    'send.title': 'Send',
    'labels.fromAccount': 'From Account',
    'messages.loadingAccount': 'Loading account...',
    'messages.loading': 'Loading...',
    'messages.noTokensWithBalance': 'No tokens with balance found',
    'messages.noNFTCollectionsForAccount': 'No NFT collections found for this account',
    'buttons.retry': 'Retry',
    'buttons.refresh': 'Refresh',
    'errors.failedToLoadTokens': 'Failed to load tokens',
  };

  let result = translations[key] || key;

  // Handle interpolation if options provided
  if (options && typeof options === 'object') {
    Object.keys(options).forEach((optionKey) => {
      result = result.replace(`{{${optionKey}}}`, options[optionKey]);
    });
  }

  return result;
};

const SelectTokensScreenView = () => {
  const navigate = useNavigate();
  const wallet = useWallet();
  const { network, mainAddress, currentWallet } = useProfiles();

  // Create bridge and translation function
  const bridge = createExtensionBridge(
    network as FlowNetwork,
    (currentWallet?.address || mainAddress) as WalletAddress
  );
  const t = createTranslationFunction();

  // Navigation object that mimics React Navigation
  const navigation = {
    navigate: useCallback(
      (screenName: string, params?: any) => {
        switch (screenName) {
          case 'SendTo':
            navigate('/send/to');
            break;
          case 'NFTList':
            if (params?.collection && params?.address) {
              navigate(`/send/nft-list/${params.collection.id}?address=${params.address}`);
            }
            break;
          default:
            console.warn(`Unknown navigation target: ${screenName}`);
        }
      },
      [navigate]
    ),
  };

  // Screen props
  const screenProps = {
    navigation,
    bridge,
    t,
    theme: { isDark: true }, // Extension uses dark theme
  };

  return (
    <TamaguiProvider config={uiConfig} defaultTheme="dark">
      <SelectTokensScreen {...screenProps} />
    </TamaguiProvider>
  );
};

export default SelectTokensScreenView;
