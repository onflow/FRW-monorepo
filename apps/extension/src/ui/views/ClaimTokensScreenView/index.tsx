import { ClaimTokensScreen } from '@onflow/frw-screens';

const ClaimTokensScreenView = () => {
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
      <ClaimTokensScreen />
    </div>
  );
};

export default ClaimTokensScreenView;
