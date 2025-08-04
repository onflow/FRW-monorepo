import { NFT, NFTCollection } from '../network/api/service';
import { WalletType } from './Wallet';

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

export function getNFTCover(nft: NFTModel): string {
  if (nft.thumbnail) {
    return nft.thumbnail;
  }
  if (nft.postMedia?.image) {
    return nft.postMedia.image;
  }
  return '';
}

export function getNFTId(nft: NFTModel): string {
  return nft.id ?? nft.address ?? '';
}

export function getNFTSearchText(nft: NFTModel): string {
  return (
    (nft.name ?? '') + ' ' + (nft.description ?? '') + ' ' + (nft.postMedia?.description ?? '')
  );
}

export default NFTModel;
