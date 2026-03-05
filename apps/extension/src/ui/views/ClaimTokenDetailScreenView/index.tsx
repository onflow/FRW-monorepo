import { ClaimTokenDetailScreen, type ClaimItem } from '@onflow/frw-screens';
import { useNavigate } from 'react-router';

const CLAIM_ITEM_STORAGE_KEY = 'claim-detail-item';

/** Save a ClaimItem to sessionStorage before navigating */
export function saveClaimItem(item: ClaimItem): void {
  sessionStorage.setItem(CLAIM_ITEM_STORAGE_KEY, JSON.stringify(item));
}

const ClaimTokenDetailScreenView = () => {
  const navigate = useNavigate();

  const raw = sessionStorage.getItem(CLAIM_ITEM_STORAGE_KEY);
  const item: ClaimItem | null = raw ? JSON.parse(raw) : null;

  if (!item) {
    navigate(-1);
    return null;
  }

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
      <ClaimTokenDetailScreen
        item={item}
        onClaim={() => navigate(-1)}
        onReject={() => navigate(-1)}
      />
    </div>
  );
};

export default ClaimTokenDetailScreenView;
