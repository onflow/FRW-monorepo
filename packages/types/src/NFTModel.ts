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

export function getNFTCover(nft: NFTModel): string {
  if (nft.thumbnail) {
    return nft.thumbnail;
  }
  if (nft.postMedia?.image) {
    return nft.postMedia.image;
  }
  return '';
}

export function isERC1155(nft: NFTModel): boolean {
  return nft.contractType === 'ERC1155';
}

export default NFTModel;
