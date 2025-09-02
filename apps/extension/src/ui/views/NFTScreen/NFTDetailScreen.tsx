import { NFTDetailScreen } from '@onflow/frw-screens';
import { useSendStore } from '@onflow/frw-stores';
import { useNavigate, useParams } from 'react-router';

const NFTDetailScreenView = (props) => {
  const navigate = useNavigate();
  const params = useParams();
  console.log(params, 'NFTDetailScreenView===');
  const { id } = params;
  const { selectedNFTs } = useSendStore();
  let nft = selectedNFTs.find((nft) => nft.id === id);

  if (!nft) {
    const nftData = JSON.parse(localStorage.getItem('nftDetailState') || '{}');
    if (nftData.nft && nftData.nft.id === id) {
      nft = nftData.nft;
    }
  }

  return <NFTDetailScreen nft={nft} selectedNFTs={selectedNFTs} />;
};

export default NFTDetailScreenView;
