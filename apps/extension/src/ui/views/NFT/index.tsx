import { NFTListScreen } from '@onflow/frw-screens';
import React from 'react';


const NFTTab = () => {
  // The NFTListScreen from packages handles all the logic internally
  // No props are passed - the screen manages its own state
  return <NFTListScreen />;
};

export default NFTTab;
