import { ClaimTokensScreen, type ClaimItem } from '@onflow/frw-screens';
import { useNavigate } from 'react-router';

import { saveClaimItem } from '../ClaimTokenDetailScreenView';

const ClaimTokensScreenView = () => {
  const navigate = useNavigate();

  const handleItemPress = (item: ClaimItem) => {
    console.log('item', item);
    saveClaimItem(item);
    navigate('/dashboard/claimDetail');
  };

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
      <ClaimTokensScreen onItemPress={handleItemPress} />
    </div>
  );
};

export default ClaimTokensScreenView;
