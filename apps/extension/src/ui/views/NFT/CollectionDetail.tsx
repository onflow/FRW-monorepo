import { NFTListScreen } from '@onflow/frw-screens';
import { type CollectionModel } from '@onflow/frw-types';
import React, { useEffect, useState } from 'react';
import { useLocation, useParams } from 'react-router';


const NFTCollectionDetail = () => {
  const location = useParams();
  const uselocation = useLocation();
  const [collection, setCollection] = useState<CollectionModel | undefined>(undefined);
  const [address, setAddress] = useState<string | undefined>(undefined);

  // Extract collection data from URL params or location state
  useEffect(() => {
    // First try to get from location state
    if (uselocation.state?.collection) {
      setCollection(uselocation.state.collection);
      setAddress(uselocation.state.ownerAddress);
      return;
    }

    // Fallback to URL params
    const collection_info = location['collection_address_name']?.split('.') || [];
    if (collection_info.length >= 3) {
      const ownerAddress = collection_info[0];
      const collection_name = collection_info[1];
      const nftCount = parseInt(collection_info[2], 10);

      // Create a basic collection model from URL params
      const collectionModel: CollectionModel = {
        id: collection_name,
        name: collection_name,
        contractName: collection_name,
        count: nftCount,
        type: 'cadence', // Default to cadence
        logo: '', // Will be loaded by the screen
        banner: '',
        description: '',
        path: {
          storage_path: '',
          public_path: '',
        },
        evmAddress: '',
        official_website: '',
        socials: {},
      };

      setCollection(collectionModel);
      setAddress(ownerAddress);
    }
  }, [location, uselocation.state]);

  // The NFTListScreen from packages handles all the logic internally
  // No props are passed except the collection and address - the screen manages its own state
  return <NFTListScreen collection={collection} address={address} />;
};

export default NFTCollectionDetail;
