import { SelectTokensScreen } from '@onflow/frw-screens';
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
          case 'SendTo':
            navigate('/dashboard/sendtoscreen');
            break;
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
    [navigate, platformNavigation]
  );

  return (
    <>
      <LLHeader title="Send" help={false} />
      <SelectTokensScreen
        navigation={navigation}
        bridge={platformBridge}
        t={platformTranslation}
        showTitle={false}
      />
    </>
  );
};

export default SelectTokensScreenView;
