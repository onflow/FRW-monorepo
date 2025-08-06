/**
 * Cadence Nft Traits and Royalties
 * Returned by - fetchCadenceCollectionNfts - /api/v2/nft/collectionList
 * These are the traits and royalties of an nft
 */

type NftTrait = {
  name: string;
  value: string;
  displayType: string | null;
  rarity: string | null;
};

type NftRoyaltyCutInfo = {
  receiver: {
    address: string;
    borrowType: string;
  };
  cut: string;
  description: string;
};

type NftRoyalties = {
  cutInfos: NftRoyaltyCutInfo[];
};
/**
 * PostMedia is a type that represents the media associated with an NFT.
 */

export type NftPostMedia = {
  image?: string;
  video?: string;
  music?: string;
  isSvg: boolean;
  description: string;
  title: string;
};
/**
 * Nft Data from Cadence
 * Returned by - fetchCadenceCollectionNfts - /api/v2/nft/collectionList
 * These are the nfts owned by an account from a specific collection
 *
 */
export type Nft = {
  id: string;
  name: string;
  description: string;
  thumbnail: string;
  externalURL: string;
  collectionName: string;
  collectionContractName: string;
  contractAddress: string;
  collectionDescription: string;
  collectionSquareImage: string;
  collectionBannerImage: string;
  collectionExternalURL: string;
  traits: NftTrait[];
  royalties: NftRoyalties;
  postMedia: NftPostMedia;
  flowIdentifier: string;
};

/**
 * An Nft Collection on Cadence
 * Returned by - get all nft collections, get nft collection list
 */

export type NftCollection = {
  id: string;
  address: string;
  contractName: string; // alternative name
  evmAddress: string;
  name: string;
  logo: string;
  banner: string;
  description: string;
  flowIdentifier: string;
  officialWebsite?: string;
  socials?: Record<string, string>;
  path?: {
    storagePath: string;
    publicPath: string;
    publicType?: string;
  };
  externalURL?: string;
};
/**
 * Cadence Collection Nfts
 * Returned by - fetchCadenceCollectionNfts - /api/v2/nft/collectionList
 * These are the nfts owned by an account from a specific collection
 */
export type CollectionNfts = {
  nfts: Nft[];
  collection: NftCollection;
  nftCount: number;
  offset?: string | null;
};

/**
 * Cadence Nft Collections and Ids
 * This is the list of collections with the ids of the nfts owned in each collection
 * Useful to render the list of colletions and the nft count in each collection
 * Returned by - fetchCadenceNftCollectionsAndIds - /api/v2/nft/id
 * These are the collections and ids of the nfts owned by an account
 */
export type NftCollectionAndIds = {
  collection: NftCollection;
  ids: string[];
  count: number;
};

/**
 * Child Account NFTs
 * This is the list of nfts owned by a child account
 * Returned by - getChildAccountNfts - /api/v2/nft/childAccountNfts
 * These are the nfts owned by a child account
 */
export type ChildAccountNfts = {
  [nftCollectionId: string]: string[];
};
export type ChildAccountNftMap = {
  [address: string]: ChildAccountNfts;
};

/**
 * @deprecated use NftCollectionAndIds instead
 */
export interface NFTModelV2 {
  chainId: number;
  address: string;
  contractName: string;
  path: NFTPathV2;
  evmAddress?: string;
  flowAddress: string;
  name: string;
  description: string | null;
  logoURI: string | null;
  bannerURI: string | null;
  tags: string[];
  extensions: {
    discord?: string;
    instagram?: string;
    twitter?: string;
    website?: string;
  };
}
/**
 * @deprecated use NFTPathV2 instead
 */
export interface NFTPathV2 {
  storage: string;
  public: string;
}
