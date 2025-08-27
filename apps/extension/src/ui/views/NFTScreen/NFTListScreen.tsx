import { NFTListScreen } from '@onflow/frw-screens';
import { useSendStore } from '@onflow/frw-stores';
import React from 'react';
import { useNavigate, useParams } from 'react-router';
const NFTListScreenView = (props) => {
  const navigate = useNavigate();
  const params = useParams();
  console.log(params, 'NFTListScreenView===');
  const { selectedCollection } = useSendStore();

  return (
    <NFTListScreen
      collection={selectedCollection}
      address={params.address}
      selectedNFTIds={[]}
      isEditing={true}
    />
  );
};

export default NFTListScreenView;
