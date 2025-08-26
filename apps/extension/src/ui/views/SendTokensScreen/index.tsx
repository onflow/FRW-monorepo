import { SendTokensScreen } from '@onflow/frw-screens';
import React from 'react';
import { useParams } from 'react-router';

// Extend Window interface for router values
declare global {
  interface Window {
    __flowWalletRouterParams?: { [key: string]: any };
  }
}

const SendTokensScreenView = () => {
  const params = useParams();

  React.useEffect(() => {
    window.__flowWalletRouterParams = {
      toAddress: params.toAddress,
      tokenSymbol: params.id,
      ...params,
    };
  }, [params]);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
      }}
    >
      <div style={{ flex: 1, overflow: 'auto' }}>
        <SendTokensScreen />
      </div>
    </div>
  );
};

export default SendTokensScreenView;
