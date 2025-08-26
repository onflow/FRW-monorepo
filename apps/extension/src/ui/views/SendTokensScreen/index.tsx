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
        <SendTokensScreen initialToAddress={params.toAddress} initialTokenSymbol={params.id} />
      </div>
    </div>
  );
};

export default SendTokensScreenView;
