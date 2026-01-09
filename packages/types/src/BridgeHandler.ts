import type { WalletAccount } from './Bridge';
import type { NFTModel } from './NFTModel';
import type { TokenModel } from './TokenModel';
import { WalletType } from './Wallet';

// This is used to create a WalletAccount from the config data received from the bridge

export function createWalletAccountFromConfig(fromAccount: any): WalletAccount {
  return {
    id: fromAccount.id || fromAccount.address,
    address: fromAccount.address,
    name: fromAccount.name,
    type: fromAccount.type,
    isActive: fromAccount.isActive ?? true,
    avatar: fromAccount.avatar,
    emojiInfo: fromAccount.emojiInfo,
    parentEmoji: fromAccount.parentEmoji,
  };
}

// This is used to create an NFTModel from iOS NFTModel config data received from the bridge
export function createNFTModelFromConfig(iosNFT: any): NFTModel {
  return {
    // Core NFT properties
    id: iosNFT.id,
    name: iosNFT.name,
    description: iosNFT.description,
    thumbnail: iosNFT.thumbnail,
    externalURL: iosNFT.externalURL,

    // Collection properties
    collectionName: iosNFT.collectionName,
    collectionContractName: iosNFT.collectionContractName,
    collectionDescription: iosNFT.collectionDescription,
    collectionSquareImage: iosNFT.collectionSquareImage,
    collectionBannerImage: iosNFT.collectionBannerImage,
    collectionExternalURL: iosNFT.collectionExternalURL,

    // Contract properties
    contractAddress: iosNFT.contractAddress,
    evmAddress: iosNFT.evmAddress,
    address: iosNFT.address,
    contractName: iosNFT.contractName,
    contractType: iosNFT.contractType,

    // Flow properties
    flowIdentifier: iosNFT.flowIdentifier,

    // Media properties
    postMedia: iosNFT.postMedia
      ? {
          image: iosNFT.postMedia.image,
          isSvg: iosNFT.postMedia.isSvg,
          description: iosNFT.postMedia.description,
          title: iosNFT.postMedia.title,
        }
      : undefined,

    // Amount for ERC1155 NFTs
    amount: iosNFT.amount,

    // Determine wallet type based on available addresses
    type: iosNFT.evmAddress ? WalletType.EVM : WalletType.Flow,
  };
}

// Helper function to convert array of iOS NFTModels to RN NFTModels
export function createNFTModelsFromConfig(iosNFTs: any[]): NFTModel[] {
  if (!Array.isArray(iosNFTs)) {
    return [];
  }

  return iosNFTs.map(createNFTModelFromConfig);
}

// This is used to create a TokenModel from the config data received from the bridge
// when click send from token detail from native
// the model from native must be like TokenModel
export function createTokenModelFromConfig(tokenConfig: any): TokenModel {
  return {
    type: tokenConfig.type === 'flow' ? WalletType.Flow : WalletType.EVM,
    name: tokenConfig.name,
    symbol: tokenConfig.symbol,
    description: tokenConfig.description,
    balance: tokenConfig.balance,
    contractAddress: tokenConfig.contractAddress,
    contractName: tokenConfig.contractName,
    storagePath: tokenConfig.storagePath,
    receiverPath: tokenConfig.receiverPath,
    balancePath: tokenConfig.balancePath,
    identifier: tokenConfig.identifier,
    isVerified: tokenConfig.isVerified,
    logoURI: tokenConfig.logoURI,
    priceInUSD: tokenConfig.priceInUSD,
    balanceInUSD: tokenConfig.balanceInUSD,
    priceInFLOW: tokenConfig.priceInFLOW,
    balanceInFLOW: tokenConfig.balanceInFLOW,
    currency: tokenConfig.currency,
    priceInCurrency: tokenConfig.priceInCurrency,
    balanceInCurrency: tokenConfig.balanceInCurrency,
    displayBalance: tokenConfig.displayBalance,
    availableBalanceToUse: tokenConfig.availableBalanceToUse,
    change: tokenConfig.change,
    decimal: tokenConfig.decimal,
    evmAddress: tokenConfig.evmAddress,
    website: tokenConfig.website,
  };
}

export function shouldHideAccount(account: WalletAccount): boolean {
  if (account.type !== 'evm') {
    // only hide COA accounts
    return false;
  }

  const isBalanceZero =
    !account.balance ||
    account.balance === '0' ||
    (!isNaN(parseFloat(account.balance)) && parseFloat(account.balance) === 0);

  const isNftsZero =
    !account.nfts ||
    account.nfts === '0' ||
    (!isNaN(parseFloat(account.nfts)) && parseFloat(account.nfts) === 0);

  return isBalanceZero && isNftsZero;
}
