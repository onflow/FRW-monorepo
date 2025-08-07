import type { NFT, NFTCollection } from '@onflow/frw-api';

import type { WalletType } from './Wallet';

export interface CollectionPath {
  private_path: string;
  public_path: string;
  storage_path: string;
}

/** Collection model */
export interface CollectionModel extends NFTCollection {
  type: WalletType;
  count?: number;
  path?: CollectionPath;
}

export interface NFTModel extends NFT {
  type: WalletType;
}
// only for native nft model, don't use this on react native
export interface RNNFTModel extends NFTModel {
  placeholder?: string;
}

export default NFTModel;
