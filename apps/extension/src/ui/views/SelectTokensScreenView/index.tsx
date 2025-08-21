import { SelectTokensScreen } from '@onflow/frw-screens';
import { useSendStore } from '@onflow/frw-stores';
import React from 'react';
import { useNavigate } from 'react-router';

import {
  usePlatformBridge,
  usePlatformNavigation,
  usePlatformTranslation,
} from '@/bridge/PlatformContext';
import { LLHeader } from '@/ui/components/LLHeader';

const SelectTokensScreenView = () => {
  const navigate = useNavigate();
  const { selectedToken } = useSendStore();

  // Use platform services
  const platformBridge = usePlatformBridge();
  const platformNavigation = usePlatformNavigation(navigate);
  const platformTranslation = usePlatformTranslation();

  // Override navigation for SelectTokensScreen specific routing
  const navigation = React.useMemo(
    () => ({
      ...platformNavigation,
      navigate: (screen: string, params?: any) => {
        console.log(`Navigating to ${screen}`, params);

        switch (screen) {
          case 'SendTo': {
            // Get token information from the send store instead of params
            const tokenId = selectedToken?.symbol || selectedToken?.identifier || 'flow';
            navigate(`/dashboard/token/${tokenId}/send`);
            break;
          }
          case 'NFTList':
            if (params?.collection && params?.address) {
              console.log('NFT collection selected:', params.collection);
            }
            break;
          default:
            // Use platform navigation for other screens
            platformNavigation.navigate(screen, params);
        }
      },
    }),
    [navigate, platformNavigation, selectedToken]
  );

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        height: '100%',
        minHeight: '100%',
      }}
    >
      <LLHeader title="Send" help={false} />
      <div style={{ flex: 1, overflow: 'auto', minHeight: 0 }}>
        <SelectTokensScreen bridge={platformBridge} showTitle={false} />
      </div>
    </div>
  );
};

export default SelectTokensScreenView;
