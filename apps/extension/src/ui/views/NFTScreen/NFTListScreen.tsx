import { NFTListScreen } from '@onflow/frw-screens';
import { useSendStore } from '@onflow/frw-stores';
import React from 'react';
import { useNavigate, useParams } from 'react-router';
const NFTListScreenView = (props) => {
  const navigate = useNavigate();
  const params = useParams();
  console.log(params, 'NFTListScreenView===');
  const { selectedCollection, selectedNFTs } = useSendStore();

  return (
    <NFTListScreen
      collection={selectedCollection}
      address={params.address}
      selectedNFTIds={selectedNFTs.map((nft) => nft.id)}
      isEditing={true}
    />
  );
};

export default NFTListScreenView;
