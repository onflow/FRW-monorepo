import { SendToScreen } from '@onflow/frw-screens';
import { useSendStore } from '@onflow/frw-stores';
import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router';

const SendToScreenView = () => {
  const navigate = useNavigate();
  const params = useParams();

  const { selectedToken } = useSendStore();

  // Redirect to proper token route if accessed via wrong URL or if we have a selected token but wrong URL
  useEffect(() => {
    const currentPath = window.location.pathname;
    const hasSelectedToken = selectedToken?.symbol;
    const selectedTokenId = hasSelectedToken ? selectedToken.symbol.toLowerCase() : 'flow';

    if (!params.id && currentPath.includes('sendtoscreen')) {
      // If no token ID in URL, redirect to the selected token or flow as fallback
      navigate(`/dashboard/token/${selectedTokenId}/send`, { replace: true });
    } else if (params.id && hasSelectedToken && params.id !== selectedTokenId) {
      // If URL has different token ID than selected token, update URL to match selected token
      navigate(`/dashboard/token/${selectedTokenId}/send`, { replace: true });
    }
  }, [params.id, navigate, selectedToken]);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
      }}
    >
      <SendToScreen />
    </div>
  );
};

export default SendToScreenView;
