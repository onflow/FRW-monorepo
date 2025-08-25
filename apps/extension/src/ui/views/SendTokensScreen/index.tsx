import { SendTokensScreen } from '@onflow/frw-screens';
import { useParams } from 'react-router';

const SendTokensScreenView = () => {
  const params = useParams();

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
      }}
    >
      <div style={{ flex: 1, overflow: 'auto' }}>
        <SendTokensScreen
          backgroundColor="$bg"
          contentPadding={8} // Use smaller extension-specific padding
          initialToAddress={params.toAddress}
          initialTokenSymbol={params.id}
        />
      </div>
    </div>
  );
};

export default SendTokensScreenView;
