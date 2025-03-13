import { useEffect, useCallback, useRef } from 'react';

import { useNftHook } from '@/ui/hooks/useNftHook';
import { useWallet } from 'ui/utils';

interface NFTLoaderProps {
  selectedCollection: string;
  onNFTsLoaded: (nfts: any[]) => void;
  onLoadingChange: (loading: boolean) => void;
}

const NFTLoader: React.FC<NFTLoaderProps> = ({
  selectedCollection,
  onNFTsLoaded,
  onLoadingChange,
}) => {
  const usewallet = useWallet();
  const initialCollectionRef = useRef(selectedCollection);

  // Only use the initial collection value
  const collectionToUse = initialCollectionRef.current;

  const getCollection = useCallback(
    async (ownerAddress, collection, offset = 0) => {
      // Only fetch if the collection matches the initial one
      if (collection !== collectionToUse) {
        console.log(`Skipping fetch for ${collection} (not ${collectionToUse})`);
        return { nfts: [], nftCount: 0 };
      }

      console.log(`Hook fetching collection: ${ownerAddress}, ${collection}, ${offset}`);
      return await usewallet.getSingleCollection(ownerAddress, collection, offset);
    },
    [usewallet, collectionToUse]
  );

  const { allNfts, loading: hookLoading } = useNftHook({
    getCollection,
    ownerAddress: '0x37a7e864611c7a85',
    collectionName: collectionToUse,
  });

  useEffect(() => {
    onLoadingChange(hookLoading);

    if (!hookLoading && allNfts) {
      console.log(`Loaded ${allNfts.length} NFTs for collection ${collectionToUse}`);
      onNFTsLoaded(allNfts);
    }
  }, [allNfts, hookLoading, onNFTsLoaded, onLoadingChange, collectionToUse]);

  return null; // This is a logic-only component
};

export default NFTLoader;
