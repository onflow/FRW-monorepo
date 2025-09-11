import { type CollectionModel, type NFTModel } from '@onflow/frw-types';

import { stripHexPrefix } from './utils';
/**
 * Gets the cover image URL from an NFT
 */
export function getNFTCover(nft: NFTModel): string {
  if (nft.thumbnail) {
    return nft.thumbnail;
  }
  if (nft.postMedia?.image) {
    return nft.postMedia.image;
  }
  return '';
}

/**
 * Gets a unique identifier for an NFT
 */
export function getNFTId(nft: NFTModel): string {
  return nft.id ?? nft.address ?? '';
}

/**
 * Gets searchable text content from an NFT
 */
export function getNFTSearchText(nft: NFTModel): string {
  return (
    (nft.name ?? '') + ' ' + (nft.description ?? '') + ' ' + (nft.postMedia?.description ?? '')
  );
}

/**
 * Checks if an NFT has valid media content
 */
export function hasNFTMedia(nft: NFTModel): boolean {
  return !!(nft.thumbnail || nft.postMedia?.image);
}

/**
 * Gets the display name for an NFT, falling back to ID if name is not available
 */
export function getNFTDisplayName(nft: NFTModel): string {
  return nft.name || nft.id || 'Unnamed NFT';
}

/**
 * Checks if an NFT is an ERC1155 token
 */
export function isERC1155(nft: NFTModel): boolean {
  return nft.contractType === 'ERC1155';
}

/**
 * Gets the resource identifier for an NFT
 * A.{address}.{contractName}.NFT
 */
export function getNFTResourceIdentifier(nft: NFTModel | null): string | null {
  if (nft?.flowIdentifier) {
    if (nft.flowIdentifier.includes('NFT')) {
      return nft.flowIdentifier;
    } else {
      return `${nft.flowIdentifier}.NFT`;
    }
  }
  if (!nft || !nft.address || !nft.contractName) {
    return null;
  }
  const cleanAddress = stripHexPrefix(nft.address);
  return `A.${cleanAddress}.${nft.contractName}.NFT`;
}

/**
 * A.{address}.{contractName}.Collection
 */
export function getCollectionResourceIdentifier(collection: CollectionModel | null): string | null {
  if (!collection || !collection.address || !collection.contractName) {
    return null;
  }
  const cleanAddress = stripHexPrefix(collection.address);
  return `A.${cleanAddress}.${collection.contractName}.Collection`;
}
