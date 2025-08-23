import { NFTDetailScreen } from '@onflow/frw-screens';
import { type NFTModel } from '@onflow/frw-types';
import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router';


const Detail = () => {
  const location = useLocation();
  const [nft, setNft] = useState<NFTModel | undefined>(undefined);

  // Extract NFT data from location state or localStorage
  useEffect(() => {
    // First try to get from location state
    if (location.state?.nft) {
      setNft(location.state.nft);
      return;
    }

    // Fallback to localStorage for backward compatibility
    const savedState = localStorage.getItem('nftDetailState');
    if (savedState) {
      try {
        const parsedState = JSON.parse(savedState);
        if (parsedState.nft) {
          setNft(parsedState.nft);
        }
      } catch (error) {
        console.error('Error parsing saved NFT state:', error);
      }
    }
  }, [location.state]);
  // The NFTDetailScreen from packages handles all the logic internally
  // No props are passed except the NFT data - the screen manages its own state
  return <NFTDetailScreen nft={nft} />;
};

export default Detail;
