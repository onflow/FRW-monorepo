import * as fcl from "@onflow/fcl";

/** Generated from Cadence files */
/** Flow Signer interface for transaction signing */
export interface FlowSigner {
  address: string;
  keyIndex: number;
  sign(signableData: Uint8Array): Promise<Uint8Array>;
  authzFunc: (account: any) => Promise<any>;
}

export interface CompositeSignature {
  addr: string;
  keyId: number;
  signature: string;
}

export interface AuthorizationAccount extends Record<string, any> {
  tempId: string;
  addr: string;
  keyId: number;
  signingFunction: (signable: { message: string }) => Promise<CompositeSignature>;
}

export type AuthorizationFunction = (account: any) => Promise<AuthorizationAccount>;

/** Network addresses for contract imports */
export const addresses = {"mainnet":{"0xCapabilityDelegator":"0xd8a7e05a7ac670c0","0xCapabilityFactory":"0xd8a7e05a7ac670c0","0xCapabilityFilter":"0xd8a7e05a7ac670c0","0xCrossVMMetadataViews":"0x1d7e57aa55817448","0xDomains":"0x233eb012d34b0070","0xEVM":"0xe467b9dd11fa00df","0xEVMUtils":"0x1e4aa0b87d10b141","0xFLOAT":"0x2d4c3caffbeab845","0xFiatToken":"0xb19436aae4d94622","0xFind":"0x097bafa4e0b48eef","0xFlowEVMBridge":"0x1e4aa0b87d10b141","0xFlowEVMBridgeConfig":"0x1e4aa0b87d10b141","0xFlowEVMBridgeUtils":"0x1e4aa0b87d10b141","0xFlowEpoch":"0x8624b52f9ddcd04a","0xFlowFees":"0xf919ee77447b7497","0xFlowIDTableStaking":"0x8624b52f9ddcd04a","0xFlowStakingCollection":"0x8d0e87b65159ae63","0xFlowTableStaking":"0x8624b52f9ddcd04a","0xFlowToken":"0x1654653399040a61","0xFlowns":"0x233eb012d34b0070","0xFungibleToken":"0xf233dcee88fe0abe","0xFungibleTokenMetadataViews":"0xf233dcee88fe0abe","0xHybridCustody":"0xd8a7e05a7ac670c0","0xLockedTokens":"0x8d0e87b65159ae63","0xLostAndFound":"0x473d6a2c37eab5be","0xMetadataViews":"0x1d7e57aa55817448","0xNonFungibleToken":"0x1d7e57aa55817448","0xScopedFTProviders":"0x1e4aa0b87d10b141","0xStakingCollection":"0x8d0e87b65159ae63","0xStakingProxy":"0x62430cf28c26d095","0xStorageRent":"0x707adbad1428c624","0xSwapError":"0xb78ef7afa52ff906","0xSwapRouter":"0xa6850776a94e6551","0xUSDCFlow":"0xf1ab99c82dee3526","0xViewResolver":"0x1d7e57aa55817448","0xstFlowToken":"0xd6f80565193ad727"},"testnet":{"0xCapabilityDelegator":"0x294e44e1ec6993c6","0xCapabilityFactory":"0x294e44e1ec6993c6","0xCapabilityFilter":"0x294e44e1ec6993c6","0xCrossVMMetadataViews":"0x631e88ae7f1d7c20","0xDomains":"0xb05b2abb42335e88","0xEVM":"0x8c5303eaa26202d6","0xEVMUtils":"0xdfc20aee650fcbdf","0xFLOAT":"0x0afe396ebc8eee65","0xFiatToken":"0xa983fecbed621163","0xFind":"0xa16ab1d0abde3625","0xFlowEVMBridge":"0xdfc20aee650fcbdf","0xFlowEVMBridgeConfig":"0xdfc20aee650fcbdf","0xFlowEVMBridgeUtils":"0xdfc20aee650fcbdf","0xFlowEpoch":"0x9eca2b38b18b5dfe","0xFlowFees":"0x912d5440f7e3769e","0xFlowIDTableStaking":"0x9eca2b38b18b5dfe","0xFlowStakingCollection":"0x95e019a17d0e23d7","0xFlowTableStaking":"0x9eca2b38b18b5dfe","0xFlowToken":"0x7e60df042a9c0868","0xFlowns":"0xb05b2abb42335e88","0xFungibleToken":"0x9a0766d93b6608b7","0xFungibleTokenMetadataViews":"0x9a0766d93b6608b7","0xHybridCustody":"0x294e44e1ec6993c6","0xLockedTokens":"0x95e019a17d0e23d7","0xLostAndFound":"0xbe4635353f55bbd4","0xMetadataViews":"0x631e88ae7f1d7c20","0xNonFungibleToken":"0x631e88ae7f1d7c20","0xScopedFTProviders":"0xdfc20aee650fcbdf","0xStakingCollection":"0x95e019a17d0e23d7","0xStakingProxy":"0x7aad92e5a0715d21","0xStorageRent":"0xd50084a1a43b1507","0xSwapError":"0xddb929038d45d4b3","0xSwapRouter":"0x2f8af5ed05bbde0d","0xUSDCFlow":"0x64adf39cbc354fcb","0xViewResolver":"0x631e88ae7f1d7c20","0xstFlowToken":"0xe45c64ecfe31e465"}};

/** Generated Cadence interface */
export interface CollectionDisplay {
    name: string;
    squareImage: MetadataViewsMedia;
}

/** Generated Cadence interface */
export interface MetadataViewsMedia {
    file: any;
    mediaType: string;
}

/** Generated Cadence interface */
export interface NFTCollection {
    id: string;
    display?: CollectionDisplay | undefined;
    idList: number[];
}

/** Generated Cadence interface */
export interface Result {
    address: string;
    balance: string;
    availableBalance: string;
    storageUsed: number;
    storageCapacity: number;
    storageFlow: string;
}

/** Generated Cadence interface */
export interface StorageInfo {
    capacity: number;
    used: number;
    available: number;
}

/** Generated Cadence interface */
export interface TokenInfo {
    id: string;
    balance: string;
}

type RequestInterceptor = (config: any) => any | Promise<any>;
type ResponseInterceptor = (config: any, response: any) => { config: any; response: any } | Promise<{ config: any; response: any }>;

export class CadenceService {
  private requestInterceptors: RequestInterceptor[] = [];
  private responseInterceptors: ResponseInterceptor[] = [];

  constructor() {
  }

  useRequestInterceptor(interceptor: RequestInterceptor) {
    this.requestInterceptors.push(interceptor);
  }

  useResponseInterceptor(interceptor: ResponseInterceptor) {
    this.responseInterceptors.push(interceptor);
  }

  private async runRequestInterceptors(config: any) {
    let c = config;
    for (const interceptor of this.requestInterceptors) {
      c = await interceptor(c);
    }
    return c;
  }

  private async runResponseInterceptors(config: any, response: any) {
    let c = config;
    let r = response;
    for (const interceptor of this.responseInterceptors) {
      const result = await interceptor(c, r);
      c = result.config;
      r = result.response;
    }
    return { config: c, response: r };
  }



  // Tag: SrcCadenceBase
  public async accountStorage(addr: string): Promise<StorageInfo> {
    const code = `
access(all) 
struct StorageInfo {
    access(all) let capacity: UInt64
    access(all) let used: UInt64
    access(all) let available: UInt64

    init(capacity: UInt64, used: UInt64, available: UInt64) {
        self.capacity = capacity
        self.used = used
        self.available = available
    }
}

access(all) fun main(addr: Address): StorageInfo {
    let acct: &Account = getAccount(addr)
    return StorageInfo(capacity: acct.storage.capacity,
                      used: acct.storage.used,
                      available: acct.storage.capacity - acct.storage.used)
}
`;
    let config = {
      cadence: code.trim(),
      name: "accountStorage",
      type: "script",
      args: (arg: any, t: any) => [
        arg(addr, t.Address),
      ],
      limit: 9999,
    };
    config = await this.runRequestInterceptors(config);
    let response = await fcl.query(config);
    const result = await this.runResponseInterceptors(config, response);
    return result.response;
  }


  public async checkResource(address: string, flowIdentifier: string): Promise<boolean> {
    const code = `
import NonFungibleToken from 0xNonFungibleToken
import MetadataViews from 0xMetadataViews
import ViewResolver from 0xViewResolver
import FungibleToken from 0xFungibleToken
import FlowEVMBridgeUtils from 0xFlowEVMBridgeUtils
import FungibleTokenMetadataViews from 0xFungibleTokenMetadataViews


access(all) fun main(address: Address, flowIdentifier: String) : Bool {

    let account = getAccount(address)
    let isToken = flowIdentifier.contains(".Vault")

    let resourceType = CompositeType(flowIdentifier) 
        ?? panic("Could not construct resource type from identifier: ".concat(flowIdentifier))
    let contractAddress = FlowEVMBridgeUtils.getContractAddress(fromType: resourceType)
        ?? panic("Could not get contract address from identifier: ".concat(flowIdentifier))
    let contractName = FlowEVMBridgeUtils.getContractName(fromType: resourceType)
        ?? panic("Could not get contract name from identifier: ".concat(flowIdentifier))
    if isToken {
      let viewResolver = getAccount(contractAddress).contracts.borrow<&{ViewResolver}>(name: contractName)
            ?? panic("Could not borrow ViewResolver from FungibleToken contract")
      let vaultData = viewResolver.resolveContractView(
              resourceType: resourceType,
              viewType: Type<FungibleTokenMetadataViews.FTVaultData>()
          ) as! FungibleTokenMetadataViews.FTVaultData? ?? panic("Could not resolve FTVaultData view")
      let cap = account.capabilities.borrow<&{FungibleToken.Receiver}>(vaultData.receiverPath)

     if cap != nil {
        return true
      } else {
        return false
      }

    } else {

   
      let viewResolver = getAccount(contractAddress).contracts.borrow<&{ViewResolver}>(name: contractName)
          ?? panic("Could not borrow ViewResolver from NFT contract")
      let collectionData = viewResolver.resolveContractView(
            resourceType: resourceType,
            viewType: Type<MetadataViews.NFTCollectionData>()
        ) as! MetadataViews.NFTCollectionData? ?? panic("Could not resolve NFTCollectionData view")
      let cap = account.capabilities.borrow<&{NonFungibleToken.CollectionPublic}>(collectionData.publicPath)

      if cap != nil {
        return true
      } else {
        return false
      }
    }
}
`;
    let config = {
      cadence: code.trim(),
      name: "checkResource",
      type: "script",
      args: (arg: any, t: any) => [
        arg(address, t.Address),
        arg(flowIdentifier, t.String),
      ],
      limit: 9999,
    };
    config = await this.runRequestInterceptors(config);
    let response = await fcl.query(config);
    const result = await this.runResponseInterceptors(config, response);
    return result.response;
  }


  public async getAccountInfo(address: string): Promise<Result> {
    const code = `
access(all) struct Result {
  access(all) let address: Address
  access(all) let balance: UFix64
  access(all) let availableBalance: UFix64
  access(all) let storageUsed: UInt64
  access(all) let storageCapacity: UInt64
  access(all) let storageFlow: UFix64

  init(
    address: Address,
    balance: UFix64,
    availableBalance: UFix64,
    storageUsed: UInt64,
    storageCapacity: UInt64,
    storageFlow: UFix64,
  ) {
    self.address = address
    self.balance = balance
    self.availableBalance = availableBalance
    self.storageUsed = storageUsed
    self.storageCapacity = storageCapacity
    self.storageFlow = storageFlow
  }
}

access(all) fun main(address: Address): Result {
  let account = getAccount(address)
  return Result(
    address: account.address,
    balance: account.balance,
    availableBalance: account.availableBalance,
    storageUsed: account.storage.used,
    storageCapacity: account.storage.capacity,
    storageFlow: account.balance - account.availableBalance
  )
}
`;
    let config = {
      cadence: code.trim(),
      name: "getAccountInfo",
      type: "script",
      args: (arg: any, t: any) => [
        arg(address, t.Address),
      ],
      limit: 9999,
    };
    config = await this.runRequestInterceptors(config);
    let response = await fcl.query(config);
    const result = await this.runResponseInterceptors(config, response);
    return result.response;
  }


  public async getAccountMinFlow(address: string): Promise<string> {
    const code = `
access(all) fun main(address: Address): UFix64 {
  let account = getAccount(address)
  return account.balance - account.availableBalance
}
`;
    let config = {
      cadence: code.trim(),
      name: "getAccountMinFlow",
      type: "script",
      args: (arg: any, t: any) => [
        arg(address, t.Address),
      ],
      limit: 9999,
    };
    config = await this.runRequestInterceptors(config);
    let response = await fcl.query(config);
    const result = await this.runResponseInterceptors(config, response);
    return result.response;
  }


  public async getFlowBalanceForAnyAccounts(addresses: string[]): Promise<Record<string, string | undefined>> {
    const code = `
import EVM from 0xEVM

// Get the account balance for a COA account
access(all) fun getEVMBalance(_ address: String): UFix64? {
    return EVM.addressFromString(address).balance().inFLOW()
}

// Get the available account balance for a Flow account
access(all) fun getFlowBalance(_ address: String): UFix64? {
    if let account = Address.fromString(address) {
        // Use available balance instead of total balance
        return getAccount(account).availableBalance
    }
    return nil
}

access(all) fun main(addresses: [String]): {String: UFix64?} {
    let res: {String: UFix64?} = {}

    for addr in addresses {
        let hex = addr[1] == "x" ? addr : "0x".concat(addr)
        if let flowBalance = getFlowBalance(hex) {
            res[hex] = flowBalance
        } else {
            if let evmBalance = getEVMBalance(hex) {
                res[hex] = evmBalance
            }
        }
    }
    return res
}
`;
    let config = {
      cadence: code.trim(),
      name: "getFlowBalanceForAnyAccounts",
      type: "script",
      args: (arg: any, t: any) => [
        arg(addresses, t.Array(t.String)),
      ],
      limit: 9999,
    };
    config = await this.runRequestInterceptors(config);
    let response = await fcl.query(config);
    const result = await this.runResponseInterceptors(config, response);
    return result.response;
  }


  public async getSurgeFactor(): Promise<string> {
    const code = `
import FlowFees from 0xFlowFees
access(all) fun main(): UFix64 {
    return FlowFees.getFeeParameters().surgeFactor
}
`;
    let config = {
      cadence: code.trim(),
      name: "getSurgeFactor",
      type: "script",
      args: (arg: any, t: any) => [
      ],
      limit: 9999,
    };
    config = await this.runRequestInterceptors(config);
    let response = await fcl.query(config);
    const result = await this.runResponseInterceptors(config, response);
    return result.response;
  }

  // Tag: SrcCadenceBridgeScripts
  public async getAssociatedEvmAddress(identifier: string): Promise<string| undefined> {
    const code = `
import EVM from 0xEVM

import EVMUtils from 0xFlowEVMBridge
import FlowEVMBridgeConfig from 0xFlowEVMBridge

/// Returns the EVM address associated with the given Cadence type (as its identifier String)
///
/// @param typeIdentifier The Cadence type identifier String
///
/// @return The EVM address as a hex string if the type has an associated EVMAddress, otherwise nil
///
access(all)
fun main(identifier: String): String? {
    if let type = CompositeType(identifier) {
        if let address = FlowEVMBridgeConfig.getEVMAddressAssociated(with: type) {
            return EVMUtils.getEVMAddressAsHexString(address: address)
        }
    }
    return nil
}
`;
    let config = {
      cadence: code.trim(),
      name: "getAssociatedEvmAddress",
      type: "script",
      args: (arg: any, t: any) => [
        arg(identifier, t.String),
      ],
      limit: 9999,
    };
    config = await this.runRequestInterceptors(config);
    let response = await fcl.query(config);
    const result = await this.runResponseInterceptors(config, response);
    return result.response;
  }


  public async getAssociatedFlowIdentifier(address: string): Promise<string| undefined> {
    const code = `
import EVM from 0xEVM
import FlowEVMBridgeConfig from 0xFlowEVMBridge

access(all)
fun main(address: String): String? {
    if let typeInfo = FlowEVMBridgeConfig.getTypeAssociated(with: EVM.addressFromString(address)) {
        return typeInfo.identifier
    }
    return nil
}
`;
    let config = {
      cadence: code.trim(),
      name: "getAssociatedFlowIdentifier",
      type: "script",
      args: (arg: any, t: any) => [
        arg(address, t.String),
      ],
      limit: 9999,
    };
    config = await this.runRequestInterceptors(config);
    let response = await fcl.query(config);
    const result = await this.runResponseInterceptors(config, response);
    return result.response;
  }

  // Tag: SrcCadenceBridgeTransactions
  public async batchBridgeNftFromEvmToFlowWithPayer(nftIdentifier: string, ids: string[], recipient: string) {
    const code = `
import MetadataViews from 0xMetadataViews
import ViewResolver from 0xMetadataViews
import NonFungibleToken from 0xNonFungibleToken
import FungibleToken from 0xFungibleToken
import FlowToken from 0xFlowToken
import FungibleTokenMetadataViews from 0xFungibleToken
import ScopedFTProviders from 0xFlowEVMBridge
import EVM from 0xEVM
import FlowEVMBridgeUtils from 0xFlowEVMBridge
import FlowEVMBridge from 0xFlowEVMBridge
import FlowEVMBridgeConfig from 0xFlowEVMBridge
import StorageRent from 0xStorageRent
import CrossVMMetadataViews from 0xCrossVMMetadataViews

/// This transaction bridges an NFT from EVM to Cadence assuming it has already been onboarded to the FlowEVMBridge.
/// Also know that the recipient Flow account must have a Receiver capable of receiving the this bridged NFT accessible
/// via published Capability at the token's standard path.
/// NOTE: The ERC721 must have first been onboarded to the bridge. This can be checked via the method
///     FlowEVMBridge.evmAddressRequiresOnboarding(address: self.evmContractAddress)
///
/// @param nftIdentifier: The Cadence type identifier of the NFT to bridge - e.g. nft.getType().identifier
/// @param id: The ERC721 id of the NFT to bridge to Cadence from EVM
/// @param recipient: The Flow account address to receive the bridged NFT
///
transaction(nftIdentifier: String, ids: [UInt256], recipient: Address) {
    let nftType: Type
    let receiver: &{NonFungibleToken.Receiver}
    let scopedProvider: @ScopedFTProviders.ScopedFTProvider
    let coa: auth(EVM.Call, EVM.Bridge) &EVM.CadenceOwnedAccount
    let viewResolver: &{ViewResolver}

    prepare(signer: auth(BorrowValue, CopyValue, IssueStorageCapabilityController, PublishCapability, SaveValue, UnpublishCapability) &Account, payer: auth(BorrowValue, CopyValue, IssueStorageCapabilityController, PublishCapability, SaveValue, UnpublishCapability) &Account) {
        /* --- Reference the signer's CadenceOwnedAccount --- */
        //
        // Borrow a reference to the signer's COA
        self.coa = signer.storage.borrow<auth(EVM.Call, EVM.Bridge) &EVM.CadenceOwnedAccount>(from: /storage/evm)
            ?? panic("Could not borrow COA from provided gateway address")

        /* --- Construct the NFT type --- */
        //
        // Construct the NFT type from the provided identifier
        self.nftType = CompositeType(nftIdentifier)
            ?? panic("Could not construct NFT type from identifier: ".concat(nftIdentifier))
        // Parse the NFT identifier into its components
        let nftContractAddress = FlowEVMBridgeUtils.getContractAddress(fromType: self.nftType)
            ?? panic("Could not get contract address from identifier: ".concat(nftIdentifier))
        let nftContractName = FlowEVMBridgeUtils.getContractName(fromType: self.nftType)
            ?? panic("Could not get contract name from identifier: ".concat(nftIdentifier))

        /* --- Reference the recipient's NFT Receiver --- */
        //
        // Borrow a reference to the NFT collection, configuring if necessary
        self.viewResolver = getAccount(nftContractAddress).contracts.borrow<&{ViewResolver}>(name: nftContractName)
            ?? panic("Could not borrow ViewResolver from NFT contract")
        let collectionData = self.viewResolver.resolveContractView(
                resourceType: self.nftType,
                viewType: Type<MetadataViews.NFTCollectionData>()
            ) as! MetadataViews.NFTCollectionData? ?? panic("Could not resolve NFTCollectionData view")
        // Configure the signer's account for this NFT
        if signer.storage.borrow<&{NonFungibleToken.Collection}>(from: collectionData.storagePath) == nil {
            signer.storage.save(<-collectionData.createEmptyCollection(), to: collectionData.storagePath)
            signer.capabilities.unpublish(collectionData.publicPath)
            let collectionCap = signer.capabilities.storage.issue<&{NonFungibleToken.Collection}>(collectionData.storagePath)
            signer.capabilities.publish(collectionCap, at: collectionData.publicPath)
        }
        self.receiver = getAccount(recipient).capabilities.borrow<&{NonFungibleToken.CollectionPublic}>(collectionData.publicPath)
            ?? panic("Could not borrow Receiver from recipient's public capability path")

        /* --- Configure a ScopedFTProvider --- */
        //
        // Calculate the bridge fee - bridging from EVM consumes no storage, so flat fee
        let approxFee = FlowEVMBridgeUtils.calculateBridgeFee(bytes: 400_000) + (FlowEVMBridgeConfig.baseFee * UFix64(ids.length))
        // Issue and store bridge-dedicated Provider Capability in storage if necessary
        if payer.storage.type(at: FlowEVMBridgeConfig.providerCapabilityStoragePath) == nil {
            let providerCap = payer.capabilities.storage.issue<auth(FungibleToken.Withdraw) &{FungibleToken.Provider}>(
                /storage/flowTokenVault
            )
            payer.storage.save(providerCap, to: FlowEVMBridgeConfig.providerCapabilityStoragePath)
        }
        // Copy the stored Provider capability and create a ScopedFTProvider
        let providerCapCopy = payer.storage.copy<Capability<auth(FungibleToken.Withdraw) &{FungibleToken.Provider}>>(
                from: FlowEVMBridgeConfig.providerCapabilityStoragePath
            ) ?? panic("Invalid Provider Capability found in storage.")
        let providerFilter = ScopedFTProviders.AllowanceFilter(approxFee)
        self.scopedProvider <- ScopedFTProviders.createScopedFTProvider(
                provider: providerCapCopy,
                filters: [ providerFilter ],
                expiration: getCurrentBlock().timestamp + 1.0
            )
    }

    execute {
        // Unwrap NFTs from project-defined ERC721 wrapper contract if applicable
        unwrapNFTsIfApplicable(self.coa, nftIDs: ids, nftType: self.nftType, viewResolver: self.viewResolver)

        // Execute the bridge
        var idx = 0
        while idx < ids.length {
            let nftId = ids[idx]!
            // Execute the bridge
            let nft: @{NonFungibleToken.NFT} <- self.coa.withdrawNFT(
                type: self.nftType,
                id: nftId,
                feeProvider: &self.scopedProvider as auth(FungibleToken.Withdraw) &{FungibleToken.Provider}
            )
            // Ensure the bridged nft is the correct type
            assert(
                nft.getType() == self.nftType,
                message: "Bridged nft type mismatch - requested: ".concat(self.nftType.identifier)
                    .concat(", received: ").concat(nft.getType().identifier)
            )
            // Deposit the bridged NFT into the recipient's collection
            self.receiver.deposit(token: <-nft)
            idx = idx + 1
        }
        destroy self.scopedProvider

        StorageRent.tryRefill(recipient)

    }
}

/// Unwraps NFTs from a project's custom ERC721 wrapper contract to bridged NFTs on EVM, if applicable.
/// Enables projects to use their own ERC721 contract while leveraging the bridge's underlying contract,
/// until direct custom contract support is added to the bridge.
///
/// @param coa: The COA of the signer
/// @param nftIDs: The IDs of the NFTs to wrap
/// @param nftType: The type of the NFTs to wrap
/// @param viewResolver: The ViewResolver of the NFT contract
///
access(all) fun unwrapNFTsIfApplicable(
    _ coa: auth(EVM.Call) &EVM.CadenceOwnedAccount,
    nftIDs: [UInt256],
    nftType: Type,
    viewResolver: &{ViewResolver}
) {
    // Get the project-defined ERC721 address if it exists
    if let crossVMPointer = viewResolver.resolveContractView(
            resourceType: nftType,
            viewType: Type<CrossVMMetadataViews.EVMPointer>()
    ) as! CrossVMMetadataViews.EVMPointer? {
        // Get the underlying ERC721 address if it exists
        if let underlyingAddress = getUnderlyingERC721Address(coa, crossVMPointer.evmContractAddress) {
            for id in nftIDs {
                // Unwrap NFT if it is wrapped
                if isNFTWrapped(coa,
                    nftID: id,
                    underlying: underlyingAddress,
                    wrapper: crossVMPointer.evmContractAddress
                ) {
                    let res = mustCall(coa, crossVMPointer.evmContractAddress,
                        functionSig: "withdrawTo(address,uint256[])",
                        args: [coa.address(), [id]]
                    )
                    let decodedRes = EVM.decodeABI(types: [Type<Bool>()], data: res.data)
                    assert(decodedRes.length == 1, message: "Invalid response length")
                    assert(decodedRes[0] as! Bool, message: "Failed to unwrap NFT")
                }
            }
        }
    }
}

/// Gets the underlying ERC721 address if it exists (i.e. if the ERC721 is a wrapper)
///
access(all) fun getUnderlyingERC721Address(
    _ coa: auth(EVM.Call) &EVM.CadenceOwnedAccount,
    _ wrapperAddress: EVM.EVMAddress
): EVM.EVMAddress? {
    let res = coa.call(
        to: wrapperAddress,
        data: EVM.encodeABIWithSignature("underlying()", []),
        gasLimit: 100_000,
        value: EVM.Balance(attoflow: 0)
    )

    // If the call fails, return nil
    if res.status != EVM.Status.successful || res.data.length == 0 {
        return nil
    }

    // Decode and return the underlying ERC721 address
    let decodedResult = EVM.decodeABI(
        types: [Type<EVM.EVMAddress>()],
        data: res.data
    )
    assert(decodedResult.length == 1, message: "Invalid response length")
    return decodedResult[0] as! EVM.EVMAddress
}

/// Checks if the provided NFT is wrapped in the underlying ERC721 contract
///
access(all) fun isNFTWrapped(
    _ coa: auth(EVM.Call) &EVM.CadenceOwnedAccount,
    nftID: UInt256,
    underlying: EVM.EVMAddress,
    wrapper: EVM.EVMAddress
): Bool {
    let res = coa.call(
        to: underlying,
        data: EVM.encodeABIWithSignature("ownerOf(uint256)", [nftID]),
        gasLimit: 100_000,
        value: EVM.Balance(attoflow: 0)
    )

    // If the call fails, return false
    if res.status != EVM.Status.successful || res.data.length == 0{
        return false
    }

    // Decode and compare the addresses
    let decodedResult = EVM.decodeABI(
        types: [Type<EVM.EVMAddress>()],
        data: res.data
    )
    assert(decodedResult.length == 1, message: "Invalid response length")

    let owner = decodedResult[0] as! EVM.EVMAddress
    return owner.toString() == wrapper.toString()
}

/// Calls a function on an EVM contract from provided coa
///
access(all) fun mustCall(
    _ coa: auth(EVM.Call) &EVM.CadenceOwnedAccount,
    _ contractAddr: EVM.EVMAddress,
    functionSig: String,
    args: [AnyStruct]
): EVM.Result {
    let res = coa.call(
        to: contractAddr,
        data: EVM.encodeABIWithSignature(functionSig, args),
        gasLimit: 4_000_000,
        value: EVM.Balance(attoflow: 0)
    )

    assert(res.status == EVM.Status.successful,
        message: "Failed to call '".concat(functionSig)
            .concat("\\n\\t error code: ").concat(res.errorCode.toString())
            .concat("\\n\\t error message: ").concat(res.errorMessage)
            .concat("\\n\\t gas used: ").concat(res.gasUsed.toString())
            .concat("\\n\\t caller address: 0x").concat(coa.address().toString())
            .concat("\\n\\t contract address: 0x").concat(contractAddr.toString())
    )

    return res
}
`;
    let config = {
      cadence: code.trim(),
      name: "batchBridgeNftFromEvmToFlowWithPayer",
      type: "transaction",
      args: (arg: any, t: any) => [
        arg(nftIdentifier, t.String),
        arg(ids, t.Array(t.UInt256)),
        arg(recipient, t.Address),
      ],
      limit: 9999,
    };
    config = await this.runRequestInterceptors(config);
    let txId = await fcl.mutate(config);
    const result = await this.runResponseInterceptors(config, txId);
    return result.response;
  }


  public async batchBridgeNftFromEvmWithPayer(nftIdentifier: string, ids: string[]) {
    const code = `
import MetadataViews from 0xMetadataViews
import ViewResolver from 0xMetadataViews
import NonFungibleToken from 0xNonFungibleToken
import FungibleToken from 0xFungibleToken
import FlowToken from 0xFlowToken
import FungibleTokenMetadataViews from 0xFungibleToken
import ScopedFTProviders from 0xFlowEVMBridge
import EVM from 0xEVM
import FlowEVMBridgeUtils from 0xFlowEVMBridge
import FlowEVMBridge from 0xFlowEVMBridge
import FlowEVMBridgeConfig from 0xFlowEVMBridge
import CrossVMMetadataViews from 0xCrossVMMetadataViews

/// This transaction bridges an NFT from EVM to Cadence assuming it has already been onboarded to the FlowEVMBridge
/// NOTE: The ERC721 must have first been onboarded to the bridge. This can be checked via the method
///     FlowEVMBridge.evmAddressRequiresOnboarding(address: self.evmContractAddress)
///
/// @param nftIdentifier: The Cadence type identifier of the NFT to bridge - e.g. nft.getType().identifier
/// @param id: The ERC721 id of the NFT to bridge to Cadence from EVM
///
transaction(nftIdentifier: String, ids: [UInt256]) {

    let nftType: Type
    let collection: &{NonFungibleToken.Collection}
    let scopedProvider: @ScopedFTProviders.ScopedFTProvider
    let coa: auth(EVM.Call, EVM.Bridge) &EVM.CadenceOwnedAccount
    let viewResolver: &{ViewResolver}

    prepare(signer: auth(BorrowValue, CopyValue, IssueStorageCapabilityController, PublishCapability, SaveValue, UnpublishCapability) &Account, payer: auth(BorrowValue, CopyValue, IssueStorageCapabilityController, PublishCapability, SaveValue, UnpublishCapability) &Account) {
        /* --- Reference the signer's CadenceOwnedAccount --- */
        //
        // Borrow a reference to the signer's COA
        self.coa = signer.storage.borrow<auth(EVM.Call, EVM.Bridge) &EVM.CadenceOwnedAccount>(from: /storage/evm)
            ?? panic("Could not borrow COA from provided gateway address")

        /* --- Construct the NFT type --- */
        //
        // Construct the NFT type from the provided identifier
        self.nftType = CompositeType(nftIdentifier)
            ?? panic("Could not construct NFT type from identifier: ".concat(nftIdentifier))
        // Parse the NFT identifier into its components
        let nftContractAddress = FlowEVMBridgeUtils.getContractAddress(fromType: self.nftType)
            ?? panic("Could not get contract address from identifier: ".concat(nftIdentifier))
        let nftContractName = FlowEVMBridgeUtils.getContractName(fromType: self.nftType)
            ?? panic("Could not get contract name from identifier: ".concat(nftIdentifier))

        /* --- Reference the signer's NFT Collection --- */
        //
        // Borrow a reference to the NFT collection, configuring if necessary
        self.viewResolver = getAccount(nftContractAddress).contracts.borrow<&{ViewResolver}>(name: nftContractName)
            ?? panic("Could not borrow ViewResolver from NFT contract")
        let collectionData = self.viewResolver.resolveContractView(
                resourceType: self.nftType,
                viewType: Type<MetadataViews.NFTCollectionData>()
            ) as! MetadataViews.NFTCollectionData? ?? panic("Could not resolve NFTCollectionData view")
        if signer.storage.borrow<&{NonFungibleToken.Collection}>(from: collectionData.storagePath) == nil {
            signer.storage.save(<-collectionData.createEmptyCollection(), to: collectionData.storagePath)
            signer.capabilities.unpublish(collectionData.publicPath)
            let collectionCap = signer.capabilities.storage.issue<&{NonFungibleToken.Collection}>(collectionData.storagePath)
            signer.capabilities.publish(collectionCap, at: collectionData.publicPath)
        }
        self.collection = signer.storage.borrow<&{NonFungibleToken.Collection}>(from: collectionData.storagePath)
            ?? panic("Could not borrow collection from storage path")

        /* --- Configure a ScopedFTProvider --- */
        //
        // Calculate the bridge fee - bridging from EVM consumes no storage, so flat fee
        let approxFee = FlowEVMBridgeUtils.calculateBridgeFee(bytes: 400_000) + (FlowEVMBridgeConfig.baseFee * UFix64(ids.length))
        // Issue and store bridge-dedicated Provider Capability in storage if necessary
        if payer.storage.type(at: FlowEVMBridgeConfig.providerCapabilityStoragePath) == nil {
            let providerCap = payer.capabilities.storage.issue<auth(FungibleToken.Withdraw) &{FungibleToken.Provider}>(
                /storage/flowTokenVault
            )
            payer.storage.save(providerCap, to: FlowEVMBridgeConfig.providerCapabilityStoragePath)
        }
        // Copy the stored Provider capability and create a ScopedFTProvider
        let providerCapCopy = payer.storage.copy<Capability<auth(FungibleToken.Withdraw) &{FungibleToken.Provider}>>(
                from: FlowEVMBridgeConfig.providerCapabilityStoragePath
            ) ?? panic("Invalid Provider Capability found in storage.")
        let providerFilter = ScopedFTProviders.AllowanceFilter(approxFee)
        self.scopedProvider <- ScopedFTProviders.createScopedFTProvider(
            provider: providerCapCopy,
            filters: [ providerFilter ],
            expiration: getCurrentBlock().timestamp + 1.0
        )
    }

    execute {
        // Unwrap NFTs from project-defined ERC721 wrapper contract if applicable
        unwrapNFTsIfApplicable(self.coa, nftIDs: ids, nftType: self.nftType, viewResolver: self.viewResolver)

        // Execute the bridge
        var idx = 0
        while idx < ids.length {
            let nftId = ids[idx]!
            // Execute the bridge
            let nft: @{NonFungibleToken.NFT} <- self.coa.withdrawNFT(
                type: self.nftType,
                id: nftId,
                feeProvider: &self.scopedProvider as auth(FungibleToken.Withdraw) &{FungibleToken.Provider}
            )
            // Ensure the bridged nft is the correct type
            assert(
                nft.getType() == self.nftType,
                message: "Bridged nft type mismatch - requested: ".concat(self.nftType.identifier)
                    .concat(", received: ").concat(nft.getType().identifier)
            )
            // Deposit the bridged NFT into the signer's collection
            self.collection.deposit(token: <-nft)
            idx = idx + 1
        }

        // Destroy the ScopedFTProvider
        destroy self.scopedProvider
    }
}

/// Unwraps NFTs from a project's custom ERC721 wrapper contract to bridged NFTs on EVM, if applicable.
/// Enables projects to use their own ERC721 contract while leveraging the bridge's underlying contract,
/// until direct custom contract support is added to the bridge.
///
/// @param coa: The COA of the signer
/// @param nftIDs: The IDs of the NFTs to wrap
/// @param nftType: The type of the NFTs to wrap
/// @param viewResolver: The ViewResolver of the NFT contract
///
access(all) fun unwrapNFTsIfApplicable(
    _ coa: auth(EVM.Call) &EVM.CadenceOwnedAccount,
    nftIDs: [UInt256],
    nftType: Type,
    viewResolver: &{ViewResolver}
) {
    // Get the project-defined ERC721 address if it exists
    if let crossVMPointer = viewResolver.resolveContractView(
            resourceType: nftType,
            viewType: Type<CrossVMMetadataViews.EVMPointer>()
    ) as! CrossVMMetadataViews.EVMPointer? {
        // Get the underlying ERC721 address if it exists
        if let underlyingAddress = getUnderlyingERC721Address(coa, crossVMPointer.evmContractAddress) {
            for id in nftIDs {
                // Unwrap NFT if it is wrapped
                if isNFTWrapped(coa,
                    nftID: id,
                    underlying: underlyingAddress,
                    wrapper: crossVMPointer.evmContractAddress
                ) {
                    let res = mustCall(coa, crossVMPointer.evmContractAddress,
                        functionSig: "withdrawTo(address,uint256[])",
                        args: [coa.address(), [id]]
                    )
                    let decodedRes = EVM.decodeABI(types: [Type<Bool>()], data: res.data)
                    assert(decodedRes.length == 1, message: "Invalid response length")
                    assert(decodedRes[0] as! Bool, message: "Failed to unwrap NFT")
                }
            }
        }
    }
}

/// Gets the underlying ERC721 address if it exists (i.e. if the ERC721 is a wrapper)
///
access(all) fun getUnderlyingERC721Address(
    _ coa: auth(EVM.Call) &EVM.CadenceOwnedAccount,
    _ wrapperAddress: EVM.EVMAddress
): EVM.EVMAddress? {
    let res = coa.call(
        to: wrapperAddress,
        data: EVM.encodeABIWithSignature("underlying()", []),
        gasLimit: 100_000,
        value: EVM.Balance(attoflow: 0)
    )

    // If the call fails, return nil
    if res.status != EVM.Status.successful || res.data.length == 0 {
        return nil
    }

    // Decode and return the underlying ERC721 address
    let decodedResult = EVM.decodeABI(
        types: [Type<EVM.EVMAddress>()],
        data: res.data
    )
    assert(decodedResult.length == 1, message: "Invalid response length")
    return decodedResult[0] as! EVM.EVMAddress
}

/// Checks if the provided NFT is wrapped in the underlying ERC721 contract
///
access(all) fun isNFTWrapped(
    _ coa: auth(EVM.Call) &EVM.CadenceOwnedAccount,
    nftID: UInt256,
    underlying: EVM.EVMAddress,
    wrapper: EVM.EVMAddress
): Bool {
    let res = coa.call(
        to: underlying,
        data: EVM.encodeABIWithSignature("ownerOf(uint256)", [nftID]),
        gasLimit: 100_000,
        value: EVM.Balance(attoflow: 0)
    )

    // If the call fails, return false
    if res.status != EVM.Status.successful || res.data.length == 0{
        return false
    }

    // Decode and compare the addresses
    let decodedResult = EVM.decodeABI(
        types: [Type<EVM.EVMAddress>()],
        data: res.data
    )
    assert(decodedResult.length == 1, message: "Invalid response length")
    let owner = decodedResult[0] as! EVM.EVMAddress
    return owner.toString() == wrapper.toString()
}

/// Calls a function on an EVM contract from provided coa
///
access(all) fun mustCall(
    _ coa: auth(EVM.Call) &EVM.CadenceOwnedAccount,
    _ contractAddr: EVM.EVMAddress,
    functionSig: String,
    args: [AnyStruct]
): EVM.Result {
    let res = coa.call(
        to: contractAddr,
        data: EVM.encodeABIWithSignature(functionSig, args),
        gasLimit: 4_000_000,
        value: EVM.Balance(attoflow: 0)
    )

    assert(res.status == EVM.Status.successful,
        message: "Failed to call '".concat(functionSig)
            .concat("\\n\\t error code: ").concat(res.errorCode.toString())
            .concat("\\n\\t error message: ").concat(res.errorMessage)
            .concat("\\n\\t gas used: ").concat(res.gasUsed.toString())
            .concat("\\n\\t caller address: 0x").concat(coa.address().toString())
            .concat("\\n\\t contract address: 0x").concat(contractAddr.toString())
    )

    return res
}
`;
    let config = {
      cadence: code.trim(),
      name: "batchBridgeNftFromEvmWithPayer",
      type: "transaction",
      args: (arg: any, t: any) => [
        arg(nftIdentifier, t.String),
        arg(ids, t.Array(t.UInt256)),
      ],
      limit: 9999,
    };
    config = await this.runRequestInterceptors(config);
    let txId = await fcl.mutate(config);
    const result = await this.runResponseInterceptors(config, txId);
    return result.response;
  }


  public async batchBridgeNftToEvmAddressWithPayer(nftIdentifier: string, ids: number[], recipient: string) {
    const code = `
import MetadataViews from 0xMetadataViews
import ViewResolver from 0xMetadataViews
import NonFungibleToken from 0xNonFungibleToken
import FungibleToken from 0xFungibleToken
import FlowToken from 0xFlowToken
import FungibleTokenMetadataViews from 0xFungibleToken
import ScopedFTProviders from 0xFlowEVMBridge
import EVM from 0xEVM
import FlowEVMBridgeUtils from 0xFlowEVMBridge
import FlowEVMBridge from 0xFlowEVMBridge
import FlowEVMBridgeConfig from 0xFlowEVMBridge
import CrossVMMetadataViews from 0xCrossVMMetadataViews

/// Bridges an NFT from the signer's collection in Cadence to the signer's COA in FlowEVM
///
/// NOTE: This transaction also onboards the NFT to the bridge if necessary which may incur additional fees
///     than bridging an asset that has already been onboarded.
///
/// @param nftIdentifier: The Cadence type identifier of the NFT to bridge - e.g. nft.getType().identifier
/// @param id: The Cadence NFT.id of the NFT to bridge to EVM
///
transaction(nftIdentifier: String, ids: [UInt64], recipient: String) {
    let nft: @{NonFungibleToken.NFT}
    let requiresOnboarding: Bool
    let scopedProvider: @ScopedFTProviders.ScopedFTProvider
    let collection: auth(NonFungibleToken.Withdraw) &{NonFungibleToken.Collection}
    let nftType: Type
    let coa: auth(EVM.Call) &EVM.CadenceOwnedAccount
    let viewResolver: &{ViewResolver}

    prepare(signer: auth(CopyValue, BorrowValue, IssueStorageCapabilityController, PublishCapability, SaveValue) &Account, payer: auth(CopyValue, BorrowValue, IssueStorageCapabilityController, PublishCapability, SaveValue) &Account) {
        // Retrieve or create COA
        if let coa = signer.storage.borrow<auth(EVM.Call) &EVM.CadenceOwnedAccount>(from: /storage/evm) {
            self.coa = coa
        } else {
            signer.storage.save<@EVM.CadenceOwnedAccount>(<- EVM.createCadenceOwnedAccount(), to: /storage/evm)
            signer.capabilities.publish(
                signer.capabilities.storage.issue<&EVM.CadenceOwnedAccount>(/storage/evm),
                at: /public/evm
            )
            self.coa = signer.storage.borrow<auth(EVM.Call) &EVM.CadenceOwnedAccount>(from: /storage/evm)!
        }

        /* --- Construct the NFT type --- */
        //
        // Construct the NFT type from the provided identifier
        self.nftType = CompositeType(nftIdentifier)
            ?? panic("Could not construct NFT type from identifier: ".concat(nftIdentifier))
        // Parse the NFT identifier into its components
        let nftContractAddress = FlowEVMBridgeUtils.getContractAddress(fromType: self.nftType)
            ?? panic("Could not get contract address from identifier: ".concat(nftIdentifier))
        let nftContractName = FlowEVMBridgeUtils.getContractName(fromType: self.nftType)
            ?? panic("Could not get contract name from identifier: ".concat(nftIdentifier))

        /* --- Retrieve the NFT --- */
        //
        // Borrow a reference to the NFT collection, configuring if necessary
        self.viewResolver = getAccount(nftContractAddress).contracts.borrow<&{ViewResolver}>(name: nftContractName)
            ?? panic("Could not borrow ViewResolver from NFT contract")
        let collectionData = self.viewResolver.resolveContractView(
                resourceType: nil,
                viewType: Type<MetadataViews.NFTCollectionData>()
            ) as! MetadataViews.NFTCollectionData? ?? panic("Could not resolve NFTCollectionData view")
        self.collection = signer.storage.borrow<auth(NonFungibleToken.Withdraw) &{NonFungibleToken.Collection}>(
                from: collectionData.storagePath
            ) ?? panic("Could not access signer's NFT Collection")

        // Withdraw the requested NFT & calculate the approximate bridge fee based on NFT storage usage
        let currentStorageUsage = signer.storage.used
        self.nft <- self.collection.withdraw(withdrawID: ids[0])
        let withdrawnStorageUsage = signer.storage.used
        var approxFee = FlowEVMBridgeUtils.calculateBridgeFee(bytes: 400_000) + (FlowEVMBridgeConfig.baseFee * UFix64(ids.length))

        // Determine if the NFT requires onboarding - this impacts the fee required
        self.requiresOnboarding = FlowEVMBridge.typeRequiresOnboarding(self.nft.getType())
            ?? panic("Bridge does not support this asset type")
        if self.requiresOnboarding {
            approxFee = approxFee + FlowEVMBridgeConfig.onboardFee
        }

        /* --- Configure a ScopedFTProvider --- */
        //
        // Issue and store bridge-dedicated Provider Capability in storage if necessary
        if payer.storage.type(at: FlowEVMBridgeConfig.providerCapabilityStoragePath) == nil {
            let providerCap = payer.capabilities.storage.issue<auth(FungibleToken.Withdraw) &{FungibleToken.Provider}>(
                /storage/flowTokenVault
            )
            payer.storage.save(providerCap, to: FlowEVMBridgeConfig.providerCapabilityStoragePath)
        }
        // Copy the stored Provider capability and create a ScopedFTProvider
        let providerCapCopy = payer.storage.copy<Capability<auth(FungibleToken.Withdraw) &{FungibleToken.Provider}>>(
                from: FlowEVMBridgeConfig.providerCapabilityStoragePath
            ) ?? panic("Invalid Provider Capability found in storage.")
        let providerFilter = ScopedFTProviders.AllowanceFilter(approxFee)
        self.scopedProvider <- ScopedFTProviders.createScopedFTProvider(
                provider: providerCapCopy,
                filters: [ providerFilter ],
                expiration: getCurrentBlock().timestamp + 1.0
            )
    }

    pre {
        self.nft.getType().identifier == nftIdentifier:
            "Attempting to send invalid nft type - requested: ".concat(nftIdentifier)
            .concat(", sending: ").concat(self.nft.getType().identifier)
    }

    execute {
        if self.requiresOnboarding {
            // Onboard the NFT to the bridge
            FlowEVMBridge.onboardByType(
                self.nft.getType(),
                feeProvider: &self.scopedProvider as auth(FungibleToken.Withdraw) &{FungibleToken.Provider}
            )
        }
        // Execute the bridge transaction
        self.coa.depositNFT(
            nft: <- self.nft,
            feeProvider: &self.scopedProvider as auth(FungibleToken.Withdraw) &{FungibleToken.Provider}
        )

        var idx = 0
        for id in ids {
            if idx == 0 {
                idx = idx + 1
                continue
            }

            self.coa.depositNFT(
                nft: <- self.collection.withdraw(withdrawID: id),
                feeProvider: &self.scopedProvider as auth(FungibleToken.Withdraw) &{FungibleToken.Provider}
            )
        }

        // Destroy the ScopedFTProvider
        destroy self.scopedProvider

        // Wrap NFTs if applicable
        wrapAndTransferNFTsIfApplicable(self.coa,
            nftIDs: ids,
            nftType: self.nftType,
            viewResolver: self.viewResolver,
            recipientIfNotCoa: EVM.addressFromString(recipient)
        )
    }
}

/// Wraps and transfers bridged NFTs into a project's custom ERC721 wrapper contract on EVM, if applicable.
/// Enables projects to use their own ERC721 contract while leveraging the bridge's underlying contract,
/// until direct custom contract support is added to the bridge.
///
/// @param coa: The COA of the signer
/// @param nftIDs: The IDs of the NFTs to wrap
/// @param nftType: The type of the NFTs to wrap
/// @param viewResolver: The ViewResolver of the NFT contract
/// @param recipientIfNotCoa: The EVM address to transfer the wrapped NFTs to, nil if the NFTs should stay in signer's COA
///
access(all) fun wrapAndTransferNFTsIfApplicable(
    _ coa: auth(EVM.Call) &EVM.CadenceOwnedAccount,
    nftIDs: [UInt64],
    nftType: Type,
    viewResolver: &{ViewResolver},
    recipientIfNotCoa: EVM.EVMAddress?
) {
    // Get the project-defined ERC721 address if it exists
    if let crossVMPointer = viewResolver.resolveContractView(
            resourceType: nftType,
            viewType: Type<CrossVMMetadataViews.EVMPointer>()
    ) as! CrossVMMetadataViews.EVMPointer? {
        // Get the underlying ERC721 address if it exists
        if let underlyingAddress = getUnderlyingERC721Address(coa, crossVMPointer.evmContractAddress) {
            // Wrap NFTs if underlying ERC721 address matches bridge's associated address for NFT type

            if underlyingAddress.equals(FlowEVMBridgeConfig.getEVMAddressAssociated(with: nftType)!) {
                // Approve contract to withdraw underlying NFTs from signer's coa
                mustCall(coa, underlyingAddress,
                    functionSig: "setApprovalForAll(address,bool)",
                    args: [crossVMPointer.evmContractAddress, true]
                )

                // Wrap NFTs with provided IDs, and check if the call was successful
                let res = mustCall(coa, crossVMPointer.evmContractAddress,
                    functionSig: "depositFor(address,uint256[])",
                    args: [coa.address(), nftIDs]
                )
                let decodedRes = EVM.decodeABI(types: [Type<Bool>()], data: res.data)
                assert(decodedRes.length == 1, message: "Invalid response length")
                assert(decodedRes[0] as! Bool, message: "Failed to wrap NFTs")

                // Transfer NFTs to recipient if provided
                if let to = recipientIfNotCoa {
                    mustTransferNFTs(coa, crossVMPointer.evmContractAddress, nftIDs: nftIDs, to: to)
                }

                // Revoke approval for contract to withdraw underlying NFTs from signer's coa
                mustCall(coa, underlyingAddress,
                    functionSig: "setApprovalForAll(address,bool)",
                    args: [crossVMPointer.evmContractAddress, false]
                )
            }
        }
    }
}

/// Gets the underlying ERC721 address if it exists (i.e. if the ERC721 is a wrapper)
///
access(all) fun getUnderlyingERC721Address(
    _ coa: auth(EVM.Call) &EVM.CadenceOwnedAccount,
    _ wrapperAddress: EVM.EVMAddress
): EVM.EVMAddress? {
    let res = coa.call(
        to: wrapperAddress,
        data: EVM.encodeABIWithSignature("underlying()", []),
        gasLimit: 100_000,
        value: EVM.Balance(attoflow: 0)
    )

    // If the call fails, return nil
    if res.status != EVM.Status.successful || res.data.length == 0 {
        return nil
    }

    // Decode and return the underlying ERC721 address
    let decodedResult = EVM.decodeABI(
        types: [Type<EVM.EVMAddress>()],
        data: res.data
    )
    assert(decodedResult.length == 1, message: "Invalid response length")
    return decodedResult[0] as! EVM.EVMAddress
}

/// Checks if the provided NFT is owned by the provided EVM address
///
access(all) fun isOwner(
    _ coa: auth(EVM.Call) &EVM.CadenceOwnedAccount,
    _ erc721Address: EVM.EVMAddress,
    _ nftID: UInt64,
    _ ownerToCheck: EVM.EVMAddress
): Bool {
    let res = coa.call(
        to: erc721Address,
        data: EVM.encodeABIWithSignature("ownerOf(uint256)", [nftID]),
        gasLimit: 100_000,
        value: EVM.Balance(attoflow: 0)
    )
    assert(res.status == EVM.Status.successful, message: "Call to ERC721.ownerOf(uint256) failed")
    let decodedRes = EVM.decodeABI(types: [Type<EVM.EVMAddress>()], data: res.data)
    if decodedRes.length == 1 {
        let actualOwner = decodedRes[0] as! EVM.EVMAddress
        return actualOwner.equals(ownerToCheck)
    }
    return false
}

/// Transfers NFTs from the provided COA to the provided EVM address
///
access(all) fun mustTransferNFTs(
    _ coa: auth(EVM.Call) &EVM.CadenceOwnedAccount,
    _ erc721Address: EVM.EVMAddress,
    nftIDs: [UInt64],
    to: EVM.EVMAddress
) {
    for id in nftIDs {
        assert(isOwner(coa, erc721Address, id, coa.address()), message: "NFT not owned by signer's COA")
        mustCall(coa, erc721Address,
            functionSig: "safeTransferFrom(address,address,uint256)",
            args: [coa.address(), to, id]
        )
        assert(isOwner(coa, erc721Address, id, to), message: "NFT not transferred to recipient")
    }
}

/// Calls a function on an EVM contract from provided coa
///
access(all) fun mustCall(
    _ coa: auth(EVM.Call) &EVM.CadenceOwnedAccount,
    _ contractAddr: EVM.EVMAddress,
    functionSig: String,
    args: [AnyStruct]
): EVM.Result {
    let res = coa.call(
        to: contractAddr,
        data: EVM.encodeABIWithSignature(functionSig, args),
        gasLimit: 4_000_000,
        value: EVM.Balance(attoflow: 0)
    )

    assert(res.status == EVM.Status.successful,
        message: "Failed to call '".concat(functionSig)
            .concat("\\n\\t error code: ").concat(res.errorCode.toString())
            .concat("\\n\\t error message: ").concat(res.errorMessage)
            .concat("\\n\\t gas used: ").concat(res.gasUsed.toString())
            .concat("\\n\\t caller address: 0x").concat(coa.address().toString())
            .concat("\\n\\t contract address: 0x").concat(contractAddr.toString())
    )

    return res
}
`;
    let config = {
      cadence: code.trim(),
      name: "batchBridgeNftToEvmAddressWithPayer",
      type: "transaction",
      args: (arg: any, t: any) => [
        arg(nftIdentifier, t.String),
        arg(ids, t.Array(t.UInt64)),
        arg(recipient, t.String),
      ],
      limit: 9999,
    };
    config = await this.runRequestInterceptors(config);
    let txId = await fcl.mutate(config);
    const result = await this.runResponseInterceptors(config, txId);
    return result.response;
  }


  public async batchBridgeNftToEvmWithPayer(nftIdentifier: string, ids: number[]) {
    const code = `
import CrossVMMetadataViews from 0xCrossVMMetadataViews
import MetadataViews from 0xMetadataViews
import ViewResolver from 0xMetadataViews
import NonFungibleToken from 0xNonFungibleToken
import FungibleToken from 0xFungibleToken
import FlowToken from 0xFlowToken
import FungibleTokenMetadataViews from 0xFungibleToken
import ScopedFTProviders from 0xFlowEVMBridge
import EVM from 0xEVM
import FlowEVMBridgeUtils from 0xFlowEVMBridge
import FlowEVMBridge from 0xFlowEVMBridge
import FlowEVMBridgeConfig from 0xFlowEVMBridge

/// Bridges an NFT from the signer's collection in Cadence to the signer's COA in FlowEVM
///
/// NOTE: This transaction also onboards the NFT to the bridge if necessary which may incur additional fees
///     than bridging an asset that has already been onboarded.
///
/// @param nftIdentifier: The Cadence type identifier of the NFT to bridge - e.g. nft.getType().identifier
/// @param ids: The Cadence ids of the NFTs to bridge to EVM
///
transaction(nftIdentifier: String, ids: [UInt64]) {

    let coa: auth(EVM.Call, EVM.Bridge) &EVM.CadenceOwnedAccount
    let requiresOnboarding: Bool
    let nftType: Type

    prepare(signer: auth(CopyValue, BorrowValue, IssueStorageCapabilityController, PublishCapability, SaveValue) &Account, payer: auth(CopyValue, BorrowValue, IssueStorageCapabilityController, PublishCapability, SaveValue) &Account) {
        /* --- Reference the signer's CadenceOwnedAccount --- */
        //
        // Borrow a reference to the signer's COA
        self.coa = signer.storage.borrow<auth(EVM.Call, EVM.Bridge) &EVM.CadenceOwnedAccount>(from: /storage/evm)
            ?? panic("Could not borrow COA from provided gateway address")

        /* --- Construct the NFT type --- */
        //
        // Construct the NFT type from the provided identifier
        self.nftType = CompositeType(nftIdentifier)
            ?? panic("Could not construct NFT type from identifier: ".concat(nftIdentifier))
        // Parse the NFT identifier into its components
        let nftContractAddress = FlowEVMBridgeUtils.getContractAddress(fromType: self.nftType)
            ?? panic("Could not get contract address from identifier: ".concat(nftIdentifier))
        let nftContractName = FlowEVMBridgeUtils.getContractName(fromType: self.nftType)
            ?? panic("Could not get contract name from identifier: ".concat(nftIdentifier))

        /* --- Retrieve the NFT --- */
        //
        // Borrow a reference to the NFT collection, configuring if necessary
        let viewResolver = getAccount(nftContractAddress).contracts.borrow<&{ViewResolver}>(name: nftContractName)
            ?? panic("Could not borrow ViewResolver from NFT contract")
        let collectionData = viewResolver.resolveContractView(
                resourceType: self.nftType,
                viewType: Type<MetadataViews.NFTCollectionData>()
            ) as! MetadataViews.NFTCollectionData? ?? panic("Could not resolve NFTCollectionData view")
        let collection = signer.storage.borrow<auth(NonFungibleToken.Withdraw) &{NonFungibleToken.Collection}>(
                from: collectionData.storagePath
            ) ?? panic("Could not access signer's NFT Collection")

        // Withdraw the requested NFT & calculate the approximate bridge fee based on NFT storage usage
        let currentStorageUsage = signer.storage.used
        let nft <- collection.withdraw(withdrawID: ids[0])
        let withdrawnStorageUsage = signer.storage.used
        var approxFee = FlowEVMBridgeUtils.calculateBridgeFee(bytes: 400_000) + (FlowEVMBridgeConfig.baseFee * UFix64(ids.length))
        // Determine if the NFT requires onboarding - this impacts the fee required
        self.requiresOnboarding = FlowEVMBridge.typeRequiresOnboarding(self.nftType)
            ?? panic("Bridge does not support this asset type")
        if self.requiresOnboarding {
            approxFee = approxFee + FlowEVMBridgeConfig.onboardFee
        }

        /* --- Configure a ScopedFTProvider --- */
        //
        // Issue and store bridge-dedicated Provider Capability in storage if necessary
        if payer.storage.type(at: FlowEVMBridgeConfig.providerCapabilityStoragePath) == nil {
            let providerCap = payer.capabilities.storage.issue<auth(FungibleToken.Withdraw) &{FungibleToken.Provider}>(
                /storage/flowTokenVault
            )
            payer.storage.save(providerCap, to: FlowEVMBridgeConfig.providerCapabilityStoragePath)
        }
        // Copy the stored Provider capability and create a ScopedFTProvider
        let providerCapCopy = payer.storage.copy<Capability<auth(FungibleToken.Withdraw) &{FungibleToken.Provider}>>(
                from: FlowEVMBridgeConfig.providerCapabilityStoragePath
            ) ?? panic("Invalid Provider Capability found in storage.")
        let providerFilter = ScopedFTProviders.AllowanceFilter(approxFee)
        let scopedProvider <- ScopedFTProviders.createScopedFTProvider(
                provider: providerCapCopy,
                filters: [ providerFilter ],
                expiration: getCurrentBlock().timestamp + 1.0
        )
        self.coa.depositNFT(
            nft: <- nft,
            feeProvider: &scopedProvider as auth(FungibleToken.Withdraw) &{FungibleToken.Provider}
        )

        var idx = 0
        while idx < ids.length {
            if idx == 0 {
                idx = idx + 1
                continue
            }
            let nftId = ids[idx]!
            let nft <- collection.withdraw(withdrawID: nftId)! as @{NonFungibleToken.NFT}
            self.coa.depositNFT(
                nft: <- nft,
                feeProvider: &scopedProvider as auth(FungibleToken.Withdraw) &{FungibleToken.Provider}
            )
            idx = idx + 1
        }

        // Destroy the ScopedFTProvider
        destroy scopedProvider

        // Wrap NFTs if applicable
        wrapAndTransferNFTsIfApplicable(self.coa,
            nftIDs: ids,
            nftType: self.nftType,
            viewResolver: viewResolver,
            recipientIfNotCoa: nil
        )
    }
}

/// Wraps and transfers bridged NFTs into a project's custom ERC721 wrapper contract on EVM, if applicable.
/// Enables projects to use their own ERC721 contract while leveraging the bridge's underlying contract,
/// until direct custom contract support is added to the bridge.
///
/// @param coa: The COA of the signer
/// @param nftIDs: The IDs of the NFTs to wrap
/// @param nftType: The type of the NFTs to wrap
/// @param viewResolver: The ViewResolver of the NFT contract
/// @param recipientIfNotCoa: The EVM address to transfer the wrapped NFTs to, nil if the NFTs should stay in signer's COA
///
access(all) fun wrapAndTransferNFTsIfApplicable(
    _ coa: auth(EVM.Call) &EVM.CadenceOwnedAccount,
    nftIDs: [UInt64],
    nftType: Type,
    viewResolver: &{ViewResolver},
    recipientIfNotCoa: EVM.EVMAddress?
) {
    // Get the project-defined ERC721 address if it exists
    if let crossVMPointer = viewResolver.resolveContractView(
            resourceType: nftType,
            viewType: Type<CrossVMMetadataViews.EVMPointer>()
    ) as! CrossVMMetadataViews.EVMPointer? {
        // Get the underlying ERC721 address if it exists
        if let underlyingAddress = getUnderlyingERC721Address(coa, crossVMPointer.evmContractAddress) {
            // Wrap NFTs if underlying ERC721 address matches bridge's associated address for NFT type
            if underlyingAddress.equals(FlowEVMBridgeConfig.getEVMAddressAssociated(with: nftType)!) {
                // Approve contract to withdraw underlying NFTs from signer's coa
                mustCall(coa, underlyingAddress,
                    functionSig: "setApprovalForAll(address,bool)",
                    args: [crossVMPointer.evmContractAddress, true]
                )

                // Wrap NFTs with provided IDs, and check if the call was successful
                let res = mustCall(coa, crossVMPointer.evmContractAddress,
                    functionSig: "depositFor(address,uint256[])",
                    args: [coa.address(), nftIDs]
                )
                let decodedRes = EVM.decodeABI(types: [Type<Bool>()], data: res.data)
                assert(decodedRes.length == 1, message: "Invalid response length")
                assert(decodedRes[0] as! Bool, message: "Failed to wrap NFTs")

                // Transfer NFTs to recipient if provided
                if let to = recipientIfNotCoa {
                    mustTransferNFTs(coa, crossVMPointer.evmContractAddress, nftIDs: nftIDs, to: to)
                }

                // Revoke approval for contract to withdraw underlying NFTs from signer's coa
                mustCall(coa, underlyingAddress,
                    functionSig: "setApprovalForAll(address,bool)",
                    args: [crossVMPointer.evmContractAddress, false]
                )
            }
        }
    }
}

/// Gets the underlying ERC721 address if it exists (i.e. if the ERC721 is a wrapper)
///
access(all) fun getUnderlyingERC721Address(
    _ coa: auth(EVM.Call) &EVM.CadenceOwnedAccount,
    _ wrapperAddress: EVM.EVMAddress
): EVM.EVMAddress? {
    let res = coa.call(
        to: wrapperAddress,
        data: EVM.encodeABIWithSignature("underlying()", []),
        gasLimit: 100_000,
        value: EVM.Balance(attoflow: 0)
    )

    // If the call fails, return nil
    if res.status != EVM.Status.successful || res.data.length == 0 {
        return nil
    }

    // Decode and return the underlying ERC721 address
    let decodedResult = EVM.decodeABI(
        types: [Type<EVM.EVMAddress>()],
        data: res.data
    )
    assert(decodedResult.length == 1, message: "Invalid response length")
    return decodedResult[0] as! EVM.EVMAddress
}

/// Checks if the provided NFT is owned by the provided EVM address
///
access(all) fun isOwner(
    _ coa: auth(EVM.Call) &EVM.CadenceOwnedAccount,
    _ erc721Address: EVM.EVMAddress,
    _ nftID: UInt64,
    _ ownerToCheck: EVM.EVMAddress
): Bool {
    let res = coa.call(
        to: erc721Address,
        data: EVM.encodeABIWithSignature("ownerOf(uint256)", [nftID]),
        gasLimit: 100_000,
        value: EVM.Balance(attoflow: 0)
    )
    assert(res.status == EVM.Status.successful, message: "Call to ERC721.ownerOf(uint256) failed")
    let decodedRes = EVM.decodeABI(types: [Type<EVM.EVMAddress>()], data: res.data)
    if decodedRes.length == 1 {
        let actualOwner = decodedRes[0] as! EVM.EVMAddress
        return actualOwner.equals(ownerToCheck)
    }
    return false
}

/// Transfers NFTs from the provided COA to the provided EVM address
///
access(all) fun mustTransferNFTs(
    _ coa: auth(EVM.Call) &EVM.CadenceOwnedAccount,
    _ erc721Address: EVM.EVMAddress,
    nftIDs: [UInt64],
    to: EVM.EVMAddress
) {
    for id in nftIDs {
        assert(isOwner(coa, erc721Address, id, coa.address()), message: "NFT not owned by signer's COA")
        mustCall(coa, erc721Address,
            functionSig: "safeTransferFrom(address,address,uint256)",
            args: [coa.address(), to, id]
        )
        assert(isOwner(coa, erc721Address, id, to), message: "NFT not transferred to recipient")
    }
}

/// Calls a function on an EVM contract from provided coa
///
access(all) fun mustCall(
    _ coa: auth(EVM.Call) &EVM.CadenceOwnedAccount,
    _ contractAddr: EVM.EVMAddress,
    functionSig: String,
    args: [AnyStruct]
): EVM.Result {
    let res = coa.call(
        to: contractAddr,
        data: EVM.encodeABIWithSignature(functionSig, args),
        gasLimit: 4_000_000,
        value: EVM.Balance(attoflow: 0)
    )

    assert(res.status == EVM.Status.successful,
        message: "Failed to call '".concat(functionSig)
            .concat("\\n\\t error code: ").concat(res.errorCode.toString())
            .concat("\\n\\t error message: ").concat(res.errorMessage)
            .concat("\\n\\t gas used: ").concat(res.gasUsed.toString())
            .concat("\\n\\t caller address: 0x").concat(coa.address().toString())
            .concat("\\n\\t contract address: 0x").concat(contractAddr.toString())
    )

    return res
}
`;
    let config = {
      cadence: code.trim(),
      name: "batchBridgeNftToEvmWithPayer",
      type: "transaction",
      args: (arg: any, t: any) => [
        arg(nftIdentifier, t.String),
        arg(ids, t.Array(t.UInt64)),
      ],
      limit: 9999,
    };
    config = await this.runRequestInterceptors(config);
    let txId = await fcl.mutate(config);
    const result = await this.runResponseInterceptors(config, txId);
    return result.response;
  }


  public async bridgeNftFromEvmToFlowWithPayer(nftIdentifier: string, id: string, recipient: string) {
    const code = `
import MetadataViews from 0xMetadataViews
import ViewResolver from 0xMetadataViews
import NonFungibleToken from 0xNonFungibleToken
import FungibleToken from 0xFungibleToken
import FlowToken from 0xFlowToken
import FungibleTokenMetadataViews from 0xFungibleToken
import ScopedFTProviders from 0xFlowEVMBridge
import EVM from 0xEVM
import FlowEVMBridgeUtils from 0xFlowEVMBridge
import FlowEVMBridge from 0xFlowEVMBridge
import FlowEVMBridgeConfig from 0xFlowEVMBridge
import StorageRent from 0xStorageRent
import CrossVMMetadataViews from 0xCrossVMMetadataViews

/// This transaction bridges an NFT from EVM to Cadence assuming it has already been onboarded to the FlowEVMBridge.
/// Also know that the recipient Flow account must have a Receiver capable of receiving the this bridged NFT accessible
/// via published Capability at the token's standard path.
/// NOTE: The ERC721 must have first been onboarded to the bridge. This can be checked via the method
///     FlowEVMBridge.evmAddressRequiresOnboarding(address: self.evmContractAddress)
///
/// @param nftIdentifier: The Cadence type identifier of the NFT to bridge - e.g. nft.getType().identifier
/// @param id: The ERC721 id of the NFT to bridge to Cadence from EVM
/// @param recipient: The Flow account address to receive the bridged NFT
///
transaction(nftIdentifier: String, id: UInt256, recipient: Address) {
    let nftType: Type
    let receiver: &{NonFungibleToken.Receiver}
    let scopedProvider: @ScopedFTProviders.ScopedFTProvider
    let coa: auth(EVM.Call, EVM.Bridge) &EVM.CadenceOwnedAccount
    let viewResolver: &{ViewResolver}

    prepare(signer: auth(BorrowValue, CopyValue, IssueStorageCapabilityController, PublishCapability, SaveValue, UnpublishCapability) &Account, payer: auth(BorrowValue, CopyValue, IssueStorageCapabilityController, PublishCapability, SaveValue, UnpublishCapability) &Account) {
        /* --- Reference the signer's CadenceOwnedAccount --- */
        //
        // Borrow a reference to the signer's COA
        self.coa = signer.storage.borrow<auth(EVM.Call, EVM.Bridge) &EVM.CadenceOwnedAccount>(from: /storage/evm)
            ?? panic("Could not borrow COA from provided gateway address")

        /* --- Construct the NFT type --- */
        //
        // Construct the NFT type from the provided identifier
        self.nftType = CompositeType(nftIdentifier)
            ?? panic("Could not construct NFT type from identifier: ".concat(nftIdentifier))
        // Parse the NFT identifier into its components
        let nftContractAddress = FlowEVMBridgeUtils.getContractAddress(fromType: self.nftType)
            ?? panic("Could not get contract address from identifier: ".concat(nftIdentifier))
        let nftContractName = FlowEVMBridgeUtils.getContractName(fromType: self.nftType)
            ?? panic("Could not get contract name from identifier: ".concat(nftIdentifier))

        /* --- Reference the recipient's NFT Receiver --- */
        //
        // Borrow a reference to the NFT collection, configuring if necessary
        self.viewResolver = getAccount(nftContractAddress).contracts.borrow<&{ViewResolver}>(name: nftContractName)
            ?? panic("Could not borrow ViewResolver from NFT contract")
        let collectionData = self.viewResolver.resolveContractView(
                resourceType: self.nftType,
                viewType: Type<MetadataViews.NFTCollectionData>()
            ) as! MetadataViews.NFTCollectionData? ?? panic("Could not resolve NFTCollectionData view")
        // Configure the signer's account for this NFT
        if signer.storage.borrow<&{NonFungibleToken.Collection}>(from: collectionData.storagePath) == nil {
            signer.storage.save(<-collectionData.createEmptyCollection(), to: collectionData.storagePath)
            signer.capabilities.unpublish(collectionData.publicPath)
            let collectionCap = signer.capabilities.storage.issue<&{NonFungibleToken.Collection}>(collectionData.storagePath)
            signer.capabilities.publish(collectionCap, at: collectionData.publicPath)
        }
        self.receiver = getAccount(recipient).capabilities.borrow<&{NonFungibleToken.Receiver}>(collectionData.publicPath)
            ?? panic("Could not borrow Receiver from recipient's public capability path")

        /* --- Configure a ScopedFTProvider --- */
        //
        // Calculate the bridge fee - bridging from EVM consumes no storage, so flat fee
        let approxFee = FlowEVMBridgeUtils.calculateBridgeFee(bytes: 400_000)
        // Issue and store bridge-dedicated Provider Capability in storage if necessary
        if payer.storage.type(at: FlowEVMBridgeConfig.providerCapabilityStoragePath) == nil {
            let providerCap = payer.capabilities.storage.issue<auth(FungibleToken.Withdraw) &{FungibleToken.Provider}>(
                /storage/flowTokenVault
            )
            payer.storage.save(providerCap, to: FlowEVMBridgeConfig.providerCapabilityStoragePath)
        }
        // Copy the stored Provider capability and create a ScopedFTProvider
        let providerCapCopy = payer.storage.copy<Capability<auth(FungibleToken.Withdraw) &{FungibleToken.Provider}>>(
                from: FlowEVMBridgeConfig.providerCapabilityStoragePath
            ) ?? panic("Invalid Provider Capability found in storage.")
        let providerFilter = ScopedFTProviders.AllowanceFilter(approxFee)
        self.scopedProvider <- ScopedFTProviders.createScopedFTProvider(
                provider: providerCapCopy,
                filters: [ providerFilter ],
                expiration: getCurrentBlock().timestamp + 1.0
            )
    }

    execute {
        // Unwrap NFTs from project-defined ERC721 wrapper contract if applicable
        unwrapNFTsIfApplicable(self.coa, nftIDs: [id], nftType: self.nftType, viewResolver: self.viewResolver)

        // Execute the bridge
        let nft: @{NonFungibleToken.NFT} <- self.coa.withdrawNFT(
            type: self.nftType,
            id: id,
            feeProvider: &self.scopedProvider as auth(FungibleToken.Withdraw) &{FungibleToken.Provider}
        )
        // Ensure the bridged nft is the correct type
        assert(
            nft.getType() == self.nftType,
            message: "Bridged nft type mismatch - requested: ".concat(self.nftType.identifier)
                .concat(", received: ").concat(nft.getType().identifier)
        )
        // Deposit the bridged NFT into the signer's collection
        self.receiver.deposit(token: <-nft)
        // Destroy the ScopedFTProvider
        destroy self.scopedProvider
        StorageRent.tryRefill(recipient)

    }
}

/// Unwraps NFTs from a project's custom ERC721 wrapper contract to bridged NFTs on EVM, if applicable.
/// Enables projects to use their own ERC721 contract while leveraging the bridge's underlying contract,
/// until direct custom contract support is added to the bridge.
///
/// @param coa: The COA of the signer
/// @param nftIDs: The IDs of the NFTs to wrap
/// @param nftType: The type of the NFTs to wrap
/// @param viewResolver: The ViewResolver of the NFT contract
///
access(all) fun unwrapNFTsIfApplicable(
    _ coa: auth(EVM.Call) &EVM.CadenceOwnedAccount,
    nftIDs: [UInt256],
    nftType: Type,
    viewResolver: &{ViewResolver}
) {
    // Get the project-defined ERC721 address if it exists
    if let crossVMPointer = viewResolver.resolveContractView(
            resourceType: nftType,
            viewType: Type<CrossVMMetadataViews.EVMPointer>()
    ) as! CrossVMMetadataViews.EVMPointer? {
        // Get the underlying ERC721 address if it exists
        if let underlyingAddress = getUnderlyingERC721Address(coa, crossVMPointer.evmContractAddress) {
            for id in nftIDs {
                // Unwrap NFT if it is wrapped
                if isNFTWrapped(coa,
                    nftID: id,
                    underlying: underlyingAddress,
                    wrapper: crossVMPointer.evmContractAddress
                ) {
                    let res = mustCall(coa, crossVMPointer.evmContractAddress,
                        functionSig: "withdrawTo(address,uint256[])",
                        args: [coa.address(), [id]]
                    )
                    let decodedRes = EVM.decodeABI(types: [Type<Bool>()], data: res.data)
                    assert(decodedRes.length == 1, message: "Invalid response length")
                    assert(decodedRes[0] as! Bool, message: "Failed to unwrap NFT")
                }
            }
        }
    }
}

/// Gets the underlying ERC721 address if it exists (i.e. if the ERC721 is a wrapper)
///
access(all) fun getUnderlyingERC721Address(
    _ coa: auth(EVM.Call) &EVM.CadenceOwnedAccount,
    _ wrapperAddress: EVM.EVMAddress
): EVM.EVMAddress? {
    let res = coa.call(
        to: wrapperAddress,
        data: EVM.encodeABIWithSignature("underlying()", []),
        gasLimit: 100_000,
        value: EVM.Balance(attoflow: 0)
    )

    // If the call fails, return nil
    if res.status != EVM.Status.successful || res.data.length == 0 {
        return nil
    }

    // Decode and return the underlying ERC721 address
    let decodedResult = EVM.decodeABI(
        types: [Type<EVM.EVMAddress>()],
        data: res.data
    )
    assert(decodedResult.length == 1, message: "Invalid response length")
    return decodedResult[0] as! EVM.EVMAddress
}

/// Checks if the provided NFT is wrapped in the underlying ERC721 contract
///
access(all) fun isNFTWrapped(
    _ coa: auth(EVM.Call) &EVM.CadenceOwnedAccount,
    nftID: UInt256,
    underlying: EVM.EVMAddress,
    wrapper: EVM.EVMAddress
): Bool {
    let res = coa.call(
        to: underlying,
        data: EVM.encodeABIWithSignature("ownerOf(uint256)", [nftID]),
        gasLimit: 100_000,
        value: EVM.Balance(attoflow: 0)
    )

    // If the call fails, return false
    if res.status != EVM.Status.successful || res.data.length == 0{
        return false
    }

    // Decode and compare the addresses
    let decodedResult = EVM.decodeABI(
        types: [Type<EVM.EVMAddress>()],
        data: res.data
    )
    assert(decodedResult.length == 1, message: "Invalid response length")

    let owner = decodedResult[0] as! EVM.EVMAddress
    return owner.toString() == wrapper.toString()
}

/// Calls a function on an EVM contract from provided coa
///
access(all) fun mustCall(
    _ coa: auth(EVM.Call) &EVM.CadenceOwnedAccount,
    _ contractAddr: EVM.EVMAddress,
    functionSig: String,
    args: [AnyStruct]
): EVM.Result {
    let res = coa.call(
        to: contractAddr,
        data: EVM.encodeABIWithSignature(functionSig, args),
        gasLimit: 4_000_000,
        value: EVM.Balance(attoflow: 0)
    )

    assert(res.status == EVM.Status.successful,
        message: "Failed to call '".concat(functionSig)
            .concat("\\n\\t error code: ").concat(res.errorCode.toString())
            .concat("\\n\\t error message: ").concat(res.errorMessage)
            .concat("\\n\\t gas used: ").concat(res.gasUsed.toString())
            .concat("\\n\\t caller address: 0x").concat(coa.address().toString())
            .concat("\\n\\t contract address: 0x").concat(contractAddr.toString())
    )

    return res
}
`;
    let config = {
      cadence: code.trim(),
      name: "bridgeNftFromEvmToFlowWithPayer",
      type: "transaction",
      args: (arg: any, t: any) => [
        arg(nftIdentifier, t.String),
        arg(id, t.UInt256),
        arg(recipient, t.Address),
      ],
      limit: 9999,
    };
    config = await this.runRequestInterceptors(config);
    let txId = await fcl.mutate(config);
    const result = await this.runResponseInterceptors(config, txId);
    return result.response;
  }


  public async bridgeNftFromEvmWithPayer(nftIdentifier: string, id: string) {
    const code = `
import MetadataViews from 0xMetadataViews
import ViewResolver from 0xMetadataViews
import NonFungibleToken from 0xNonFungibleToken
import FungibleToken from 0xFungibleToken
import FlowToken from 0xFlowToken
import FungibleTokenMetadataViews from 0xFungibleToken
import ScopedFTProviders from 0xFlowEVMBridge
import EVM from 0xEVM
import FlowEVMBridgeUtils from 0xFlowEVMBridge
import FlowEVMBridge from 0xFlowEVMBridge
import FlowEVMBridgeConfig from 0xFlowEVMBridge
import CrossVMMetadataViews from 0xCrossVMMetadataViews

/// This transaction bridges an NFT from EVM to Cadence assuming it has already been onboarded to the FlowEVMBridge
/// NOTE: The ERC721 must have first been onboarded to the bridge. This can be checked via the method
///     FlowEVMBridge.evmAddressRequiresOnboarding(address: self.evmContractAddress)
///
/// @param nftIdentifier: The Cadence type identifier of the NFT to bridge - e.g. nft.getType().identifier
/// @param id: The ERC721 id of the NFT to bridge to Cadence from EVM
///
transaction(nftIdentifier: String, id: UInt256) {

    let nftType: Type
    let collection: &{NonFungibleToken.Collection}
    let scopedProvider: @ScopedFTProviders.ScopedFTProvider
    let coa: auth(EVM.Call, EVM.Bridge) &EVM.CadenceOwnedAccount
    let viewResolver: &{ViewResolver}

    prepare(signer: auth(BorrowValue, CopyValue, IssueStorageCapabilityController, PublishCapability, SaveValue, UnpublishCapability) &Account, payer: auth(BorrowValue, CopyValue, IssueStorageCapabilityController, PublishCapability, SaveValue, UnpublishCapability) &Account) {
        /* --- Reference the signer's CadenceOwnedAccount --- */
        //
        // Borrow a reference to the signer's COA
        self.coa = signer.storage.borrow<auth(EVM.Call, EVM.Bridge) &EVM.CadenceOwnedAccount>(from: /storage/evm)
            ?? panic("Could not borrow COA from provided gateway address")

        /* --- Construct the NFT type --- */
        //
        // Construct the NFT type from the provided identifier
        self.nftType = CompositeType(nftIdentifier)
            ?? panic("Could not construct NFT type from identifier: ".concat(nftIdentifier))
        // Parse the NFT identifier into its components
        let nftContractAddress = FlowEVMBridgeUtils.getContractAddress(fromType: self.nftType)
            ?? panic("Could not get contract address from identifier: ".concat(nftIdentifier))
        let nftContractName = FlowEVMBridgeUtils.getContractName(fromType: self.nftType)
            ?? panic("Could not get contract name from identifier: ".concat(nftIdentifier))

        /* --- Reference the signer's NFT Collection --- */
        //
        // Borrow a reference to the NFT collection, configuring if necessary
        self.viewResolver = getAccount(nftContractAddress).contracts.borrow<&{ViewResolver}>(name: nftContractName)
            ?? panic("Could not borrow ViewResolver from NFT contract")
        let collectionData = self.viewResolver.resolveContractView(
                resourceType: self.nftType,
                viewType: Type<MetadataViews.NFTCollectionData>()
            ) as! MetadataViews.NFTCollectionData? ?? panic("Could not resolve NFTCollectionData view")
        if signer.storage.borrow<&{NonFungibleToken.Collection}>(from: collectionData.storagePath) == nil {
            signer.storage.save(<-collectionData.createEmptyCollection(), to: collectionData.storagePath)
            signer.capabilities.unpublish(collectionData.publicPath)
            let collectionCap = signer.capabilities.storage.issue<&{NonFungibleToken.Collection}>(collectionData.storagePath)
            signer.capabilities.publish(collectionCap, at: collectionData.publicPath)
        }
        self.collection = signer.storage.borrow<&{NonFungibleToken.Collection}>(from: collectionData.storagePath)
            ?? panic("Could not borrow collection from storage path")

        /* --- Configure a ScopedFTProvider --- */
        //
        // Calculate the bridge fee - bridging from EVM consumes no storage, so flat fee
        let approxFee = FlowEVMBridgeUtils.calculateBridgeFee(bytes: 400_000)
        // Issue and store bridge-dedicated Provider Capability in storage if necessary
        if payer.storage.type(at: FlowEVMBridgeConfig.providerCapabilityStoragePath) == nil {
            let providerCap = payer.capabilities.storage.issue<auth(FungibleToken.Withdraw) &{FungibleToken.Provider}>(
                /storage/flowTokenVault
            )
            payer.storage.save(providerCap, to: FlowEVMBridgeConfig.providerCapabilityStoragePath)
        }
        // Copy the stored Provider capability and create a ScopedFTProvider
        let providerCapCopy = payer.storage.copy<Capability<auth(FungibleToken.Withdraw) &{FungibleToken.Provider}>>(
                from: FlowEVMBridgeConfig.providerCapabilityStoragePath
            ) ?? panic("Invalid Provider Capability found in storage.")
        let providerFilter = ScopedFTProviders.AllowanceFilter(approxFee)
        self.scopedProvider <- ScopedFTProviders.createScopedFTProvider(
                provider: providerCapCopy,
                filters: [ providerFilter ],
                expiration: getCurrentBlock().timestamp + 1.0
            )
    }

    execute {
        // Unwrap NFTs from project-defined ERC721 wrapper contract if applicable
        unwrapNFTsIfApplicable(self.coa, nftIDs: [id], nftType: self.nftType, viewResolver: self.viewResolver)

        // Execute the bridge
        let nft: @{NonFungibleToken.NFT} <- self.coa.withdrawNFT(
            type: self.nftType,
            id: id,
            feeProvider: &self.scopedProvider as auth(FungibleToken.Withdraw) &{FungibleToken.Provider}
        )
        // Ensure the bridged nft is the correct type
        assert(
            nft.getType() == self.nftType,
            message: "Bridged nft type mismatch - requested: ".concat(self.nftType.identifier)
                .concat(", received: ").concat(nft.getType().identifier)
        )
        // Deposit the bridged NFT into the signer's collection
        self.collection.deposit(token: <-nft)
        // Destroy the ScopedFTProvider
        destroy self.scopedProvider
    }
}

/// Unwraps NFTs from a project's custom ERC721 wrapper contract to bridged NFTs on EVM, if applicable.
/// Enables projects to use their own ERC721 contract while leveraging the bridge's underlying contract,
/// until direct custom contract support is added to the bridge.
///
/// @param coa: The COA of the signer
/// @param nftIDs: The IDs of the NFTs to wrap
/// @param nftType: The type of the NFTs to wrap
/// @param viewResolver: The ViewResolver of the NFT contract
///
access(all) fun unwrapNFTsIfApplicable(
    _ coa: auth(EVM.Call) &EVM.CadenceOwnedAccount,
    nftIDs: [UInt256],
    nftType: Type,
    viewResolver: &{ViewResolver}
) {
    // Get the project-defined ERC721 address if it exists
    if let crossVMPointer = viewResolver.resolveContractView(
            resourceType: nftType,
            viewType: Type<CrossVMMetadataViews.EVMPointer>()
    ) as! CrossVMMetadataViews.EVMPointer? {
        // Get the underlying ERC721 address if it exists
        if let underlyingAddress = getUnderlyingERC721Address(coa, crossVMPointer.evmContractAddress) {
            for id in nftIDs {
                // Unwrap NFT if it is wrapped
                if isNFTWrapped(coa,
                    nftID: id,
                    underlying: underlyingAddress,
                    wrapper: crossVMPointer.evmContractAddress
                ) {
                    let res = mustCall(coa, crossVMPointer.evmContractAddress,
                        functionSig: "withdrawTo(address,uint256[])",
                        args: [coa.address(), [id]]
                    )
                    let decodedRes = EVM.decodeABI(types: [Type<Bool>()], data: res.data)
                    assert(decodedRes.length == 1, message: "Invalid response length")
                    assert(decodedRes[0] as! Bool, message: "Failed to unwrap NFT")
                }
            }
        }
    }
}

/// Gets the underlying ERC721 address if it exists (i.e. if the ERC721 is a wrapper)
///
access(all) fun getUnderlyingERC721Address(
    _ coa: auth(EVM.Call) &EVM.CadenceOwnedAccount,
    _ wrapperAddress: EVM.EVMAddress
): EVM.EVMAddress? {
    let res = coa.call(
        to: wrapperAddress,
        data: EVM.encodeABIWithSignature("underlying()", []),
        gasLimit: 100_000,
        value: EVM.Balance(attoflow: 0)
    )

    // If the call fails, return nil
    if res.status != EVM.Status.successful || res.data.length == 0 {
        return nil
    }

    // Decode and return the underlying ERC721 address
    let decodedResult = EVM.decodeABI(
        types: [Type<EVM.EVMAddress>()],
        data: res.data
    )
    assert(decodedResult.length == 1, message: "Invalid response length")
    return decodedResult[0] as! EVM.EVMAddress
}

/// Checks if the provided NFT is wrapped in the underlying ERC721 contract
///
access(all) fun isNFTWrapped(
    _ coa: auth(EVM.Call) &EVM.CadenceOwnedAccount,
    nftID: UInt256,
    underlying: EVM.EVMAddress,
    wrapper: EVM.EVMAddress
): Bool {
    let res = coa.call(
        to: underlying,
        data: EVM.encodeABIWithSignature("ownerOf(uint256)", [nftID]),
        gasLimit: 100_000,
        value: EVM.Balance(attoflow: 0)
    )

    // If the call fails, return false
    if res.status != EVM.Status.successful || res.data.length == 0{
        return false
    }

    // Decode and compare the addresses
    let decodedResult = EVM.decodeABI(
        types: [Type<EVM.EVMAddress>()],
        data: res.data
    )
    assert(decodedResult.length == 1, message: "Invalid response length")
    let owner = decodedResult[0] as! EVM.EVMAddress
    return owner.toString() == wrapper.toString()
}

/// Calls a function on an EVM contract from provided coa
///
access(all) fun mustCall(
    _ coa: auth(EVM.Call) &EVM.CadenceOwnedAccount,
    _ contractAddr: EVM.EVMAddress,
    functionSig: String,
    args: [AnyStruct]
): EVM.Result {
    let res = coa.call(
        to: contractAddr,
        data: EVM.encodeABIWithSignature(functionSig, args),
        gasLimit: 4_000_000,
        value: EVM.Balance(attoflow: 0)
    )

    assert(res.status == EVM.Status.successful,
        message: "Failed to call '".concat(functionSig)
            .concat("\\n\\t error code: ").concat(res.errorCode.toString())
            .concat("\\n\\t error message: ").concat(res.errorMessage)
            .concat("\\n\\t gas used: ").concat(res.gasUsed.toString())
            .concat("\\n\\t caller address: 0x").concat(coa.address().toString())
            .concat("\\n\\t contract address: 0x").concat(contractAddr.toString())
    )

    return res
}
`;
    let config = {
      cadence: code.trim(),
      name: "bridgeNftFromEvmWithPayer",
      type: "transaction",
      args: (arg: any, t: any) => [
        arg(nftIdentifier, t.String),
        arg(id, t.UInt256),
      ],
      limit: 9999,
    };
    config = await this.runRequestInterceptors(config);
    let txId = await fcl.mutate(config);
    const result = await this.runResponseInterceptors(config, txId);
    return result.response;
  }


  public async bridgeNftToEvmAddressWithPayer(nftIdentifier: string, id: number, recipient: string) {
    const code = `
import MetadataViews from 0xMetadataViews
import ViewResolver from 0xMetadataViews
import NonFungibleToken from 0xNonFungibleToken
import FungibleToken from 0xFungibleToken
import FlowToken from 0xFlowToken
import FungibleTokenMetadataViews from 0xFungibleToken
import ScopedFTProviders from 0xFlowEVMBridge
import EVM from 0xEVM
import FlowEVMBridgeUtils from 0xFlowEVMBridge
import FlowEVMBridge from 0xFlowEVMBridge
import FlowEVMBridgeConfig from 0xFlowEVMBridge
import CrossVMMetadataViews from 0xCrossVMMetadataViews

/// Bridges an NFT from the signer's collection in Cadence to the named recipient in EVM.
///
/// NOTE: This transaction also onboards the NFT to the bridge if necessary which may incur additional fees
///     than bridging an asset that has already been onboarded.
///
/// @param nftIdentifier: The Cadence type identifier of the NFT to bridge - e.g. nft.getType().identifier
/// @param id: The Cadence NFT.id of the NFT to bridge to EVM
/// @param recipient: The hex-encoded EVM address to receive the NFT
///
transaction(nftIdentifier: String, id: UInt64, recipient: String) {
    let nft: @{NonFungibleToken.NFT}
    let requiresOnboarding: Bool
    let scopedProvider: @ScopedFTProviders.ScopedFTProvider
    let coa: auth(EVM.Call) &EVM.CadenceOwnedAccount
    let nftType: Type
    let viewResolver: &{ViewResolver}

    prepare(signer: auth(CopyValue, BorrowValue, IssueStorageCapabilityController, PublishCapability, SaveValue) &Account, payer: auth(CopyValue, BorrowValue, IssueStorageCapabilityController, PublishCapability, SaveValue) &Account) {
        // Retrieve or create COA
        if let coa = signer.storage.borrow<auth(EVM.Call) &EVM.CadenceOwnedAccount>(from: /storage/evm) {
            self.coa = coa
        } else {
            signer.storage.save<@EVM.CadenceOwnedAccount>(<- EVM.createCadenceOwnedAccount(), to: /storage/evm)
            signer.capabilities.publish(
                signer.capabilities.storage.issue<&EVM.CadenceOwnedAccount>(/storage/evm),
                at: /public/evm
            )
            self.coa = signer.storage.borrow<auth(EVM.Call) &EVM.CadenceOwnedAccount>(from: /storage/evm)!
        }

        /* --- Construct the NFT type --- */
        //
        // Construct the NFT type from the provided identifier
        self.nftType = CompositeType(nftIdentifier)
            ?? panic("Could not construct NFT type from identifier: ".concat(nftIdentifier))
        // Parse the NFT identifier into its components
        let nftContractAddress = FlowEVMBridgeUtils.getContractAddress(fromType: self.nftType)
            ?? panic("Could not get contract address from identifier: ".concat(nftIdentifier))
        let nftContractName = FlowEVMBridgeUtils.getContractName(fromType: self.nftType)
            ?? panic("Could not get contract name from identifier: ".concat(nftIdentifier))

        /* --- Retrieve the NFT --- */
        //
        // Borrow a reference to the NFT collection, configuring if necessary
        self.viewResolver = getAccount(nftContractAddress).contracts.borrow<&{ViewResolver}>(name: nftContractName)
            ?? panic("Could not borrow ViewResolver from NFT contract")
        let collectionData = self.viewResolver.resolveContractView(
                resourceType: nil,
                viewType: Type<MetadataViews.NFTCollectionData>()
            ) as! MetadataViews.NFTCollectionData? ?? panic("Could not resolve NFTCollectionData view")
        let collection = signer.storage.borrow<auth(NonFungibleToken.Withdraw) &{NonFungibleToken.Collection}>(
                from: collectionData.storagePath
            ) ?? panic("Could not access signer's NFT Collection")

        // Withdraw the requested NFT & calculate the approximate bridge fee based on NFT storage usage
        let currentStorageUsage = signer.storage.used
        self.nft <- collection.withdraw(withdrawID: id)
        let withdrawnStorageUsage = signer.storage.used
        var approxFee = FlowEVMBridgeUtils.calculateBridgeFee(bytes: 400_000) + FlowEVMBridgeConfig.baseFee
        // Determine if the NFT requires onboarding - this impacts the fee required
        self.requiresOnboarding = FlowEVMBridge.typeRequiresOnboarding(self.nft.getType())
            ?? panic("Bridge does not support this asset type")
        if self.requiresOnboarding {
            approxFee = approxFee + FlowEVMBridgeConfig.onboardFee
        }

        /* --- Configure a ScopedFTProvider --- */
        //
        // Issue and store bridge-dedicated Provider Capability in storage if necessary
        if payer.storage.type(at: FlowEVMBridgeConfig.providerCapabilityStoragePath) == nil {
            let providerCap = payer.capabilities.storage.issue<auth(FungibleToken.Withdraw) &{FungibleToken.Provider}>(
                /storage/flowTokenVault
            )
            payer.storage.save(providerCap, to: FlowEVMBridgeConfig.providerCapabilityStoragePath)
        }
        // Copy the stored Provider capability and create a ScopedFTProvider
        let providerCapCopy = payer.storage.copy<Capability<auth(FungibleToken.Withdraw) &{FungibleToken.Provider}>>(
                from: FlowEVMBridgeConfig.providerCapabilityStoragePath
            ) ?? panic("Invalid Provider Capability found in storage.")
        let providerFilter = ScopedFTProviders.AllowanceFilter(approxFee)
        self.scopedProvider <- ScopedFTProviders.createScopedFTProvider(
                provider: providerCapCopy,
                filters: [ providerFilter ],
                expiration: getCurrentBlock().timestamp + 1.0
            )
    }

    pre {
        self.nft.getType().identifier == nftIdentifier:
            "Attempting to send invalid nft type - requested: ".concat(nftIdentifier)
            .concat(", sending: ").concat(self.nft.getType().identifier)
    }

    execute {
        if self.requiresOnboarding {
            // Onboard the NFT to the bridge
            FlowEVMBridge.onboardByType(
                self.nft.getType(),
                feeProvider: &self.scopedProvider as auth(FungibleToken.Withdraw) &{FungibleToken.Provider}
            )
        }

        // Execute the bridge transaction
        self.coa.depositNFT(
            nft: <-self.nft,
            feeProvider: &self.scopedProvider as auth(FungibleToken.Withdraw) &{FungibleToken.Provider}
        )

        // Destroy the ScopedFTProvider
        destroy self.scopedProvider

        // Wrap NFTs if applicable
        wrapAndTransferNFTsIfApplicable(self.coa,
            nftIDs: [id],
            nftType: self.nftType,
            viewResolver: self.viewResolver,
            recipientIfNotCoa: EVM.addressFromString(recipient)
        )
    }
}

/// Wraps and transfers bridged NFTs into a project's custom ERC721 wrapper contract on EVM, if applicable.
/// Enables projects to use their own ERC721 contract while leveraging the bridge's underlying contract,
/// until direct custom contract support is added to the bridge.
///
/// @param coa: The COA of the signer
/// @param nftIDs: The IDs of the NFTs to wrap
/// @param nftType: The type of the NFTs to wrap
/// @param viewResolver: The ViewResolver of the NFT contract
/// @param recipientIfNotCoa: The EVM address to transfer the wrapped NFTs to, nil if the NFTs should stay in signer's COA
///
access(all) fun wrapAndTransferNFTsIfApplicable(
    _ coa: auth(EVM.Call) &EVM.CadenceOwnedAccount,
    nftIDs: [UInt64],
    nftType: Type,
    viewResolver: &{ViewResolver},
    recipientIfNotCoa: EVM.EVMAddress?
) {
    // Get the project-defined ERC721 address if it exists
    if let crossVMPointer = viewResolver.resolveContractView(
            resourceType: nftType,
            viewType: Type<CrossVMMetadataViews.EVMPointer>()
    ) as! CrossVMMetadataViews.EVMPointer? {
        // Get the underlying ERC721 address if it exists
        if let underlyingAddress = getUnderlyingERC721Address(coa, crossVMPointer.evmContractAddress) {
            // Wrap NFTs if underlying ERC721 address matches bridge's associated address for NFT type
            if underlyingAddress.equals(FlowEVMBridgeConfig.getEVMAddressAssociated(with: nftType)!) {
                // Approve contract to withdraw underlying NFTs from signer's coa
                mustCall(coa, underlyingAddress,
                    functionSig: "setApprovalForAll(address,bool)",
                    args: [crossVMPointer.evmContractAddress, true]
                )

                // Wrap NFTs with provided IDs, and check if the call was successful
                let res = mustCall(coa, crossVMPointer.evmContractAddress,
                    functionSig: "depositFor(address,uint256[])",
                    args: [coa.address(), nftIDs]
                )
                let decodedRes = EVM.decodeABI(types: [Type<Bool>()], data: res.data)
                assert(decodedRes.length == 1, message: "Invalid response length")
                assert(decodedRes[0] as! Bool, message: "Failed to wrap NFTs")

                // Transfer NFTs to recipient if provided
                if let to = recipientIfNotCoa {
                    mustTransferNFTs(coa, crossVMPointer.evmContractAddress, nftIDs: nftIDs, to: to)
                }

                // Revoke approval for contract to withdraw underlying NFTs from signer's coa
                mustCall(coa, underlyingAddress,
                    functionSig: "setApprovalForAll(address,bool)",
                    args: [crossVMPointer.evmContractAddress, false]
                )
            }
        }
    }
}

/// Gets the underlying ERC721 address if it exists (i.e. if the ERC721 is a wrapper)
///
access(all) fun getUnderlyingERC721Address(
    _ coa: auth(EVM.Call) &EVM.CadenceOwnedAccount,
    _ wrapperAddress: EVM.EVMAddress
): EVM.EVMAddress? {
    let res = coa.call(
        to: wrapperAddress,
        data: EVM.encodeABIWithSignature("underlying()", []),
        gasLimit: 100_000,
        value: EVM.Balance(attoflow: 0)
    )

    // If the call fails, return nil
    if res.status != EVM.Status.successful || res.data.length == 0 {
        return nil
    }

    // Decode and return the underlying ERC721 address
    let decodedResult = EVM.decodeABI(
        types: [Type<EVM.EVMAddress>()],
        data: res.data
    )
    assert(decodedResult.length == 1, message: "Invalid response length")
    return decodedResult[0] as! EVM.EVMAddress
}

/// Checks if the provided NFT is owned by the provided EVM address
///
access(all) fun isOwner(
    _ coa: auth(EVM.Call) &EVM.CadenceOwnedAccount,
    _ erc721Address: EVM.EVMAddress,
    _ nftID: UInt64,
    _ ownerToCheck: EVM.EVMAddress
): Bool {
    let res = coa.call(
        to: erc721Address,
        data: EVM.encodeABIWithSignature("ownerOf(uint256)", [nftID]),
        gasLimit: 100_000,
        value: EVM.Balance(attoflow: 0)
    )
    assert(res.status == EVM.Status.successful, message: "Call to ERC721.ownerOf(uint256) failed")
    let decodedRes = EVM.decodeABI(types: [Type<EVM.EVMAddress>()], data: res.data)
    if decodedRes.length == 1 {
        let actualOwner = decodedRes[0] as! EVM.EVMAddress
        return actualOwner.equals(ownerToCheck)
    }
    return false
}

/// Transfers NFTs from the provided COA to the provided EVM address
///
access(all) fun mustTransferNFTs(
    _ coa: auth(EVM.Call) &EVM.CadenceOwnedAccount,
    _ erc721Address: EVM.EVMAddress,
    nftIDs: [UInt64],
    to: EVM.EVMAddress
) {
    for id in nftIDs {
        assert(isOwner(coa, erc721Address, id, coa.address()), message: "NFT not owned by signer's COA")
        mustCall(coa, erc721Address,
            functionSig: "safeTransferFrom(address,address,uint256)",
            args: [coa.address(), to, id]
        )
        assert(isOwner(coa, erc721Address, id, to), message: "NFT not transferred to recipient")
    }
}

/// Calls a function on an EVM contract from provided coa
///
access(all) fun mustCall(
    _ coa: auth(EVM.Call) &EVM.CadenceOwnedAccount,
    _ contractAddr: EVM.EVMAddress,
    functionSig: String,
    args: [AnyStruct]
): EVM.Result {
    let res = coa.call(
        to: contractAddr,
        data: EVM.encodeABIWithSignature(functionSig, args),
        gasLimit: 4_000_000,
        value: EVM.Balance(attoflow: 0)
    )

    assert(res.status == EVM.Status.successful,
        message: "Failed to call '".concat(functionSig)
            .concat("\\n\\t error code: ").concat(res.errorCode.toString())
            .concat("\\n\\t error message: ").concat(res.errorMessage)
            .concat("\\n\\t gas used: ").concat(res.gasUsed.toString())
            .concat("\\n\\t caller address: 0x").concat(coa.address().toString())
            .concat("\\n\\t contract address: 0x").concat(contractAddr.toString())
    )

    return res
}
`;
    let config = {
      cadence: code.trim(),
      name: "bridgeNftToEvmAddressWithPayer",
      type: "transaction",
      args: (arg: any, t: any) => [
        arg(nftIdentifier, t.String),
        arg(id, t.UInt64),
        arg(recipient, t.String),
      ],
      limit: 9999,
    };
    config = await this.runRequestInterceptors(config);
    let txId = await fcl.mutate(config);
    const result = await this.runResponseInterceptors(config, txId);
    return result.response;
  }


  public async bridgeNftToEvmWithPayer(nftIdentifier: string, id: number) {
    const code = `
import MetadataViews from 0xMetadataViews
import ViewResolver from 0xMetadataViews
import NonFungibleToken from 0xNonFungibleToken
import FungibleToken from 0xFungibleToken
import FlowToken from 0xFlowToken
import FungibleTokenMetadataViews from 0xFungibleToken
import ScopedFTProviders from 0xFlowEVMBridge
import EVM from 0xEVM
import FlowEVMBridgeUtils from 0xFlowEVMBridge
import FlowEVMBridge from 0xFlowEVMBridge
import FlowEVMBridgeConfig from 0xFlowEVMBridge
import CrossVMMetadataViews from 0xCrossVMMetadataViews

/// Bridges an NFT from the signer's collection in Cadence to the signer's COA in FlowEVM
///
/// NOTE: This transaction also onboards the NFT to the bridge if necessary which may incur additional fees
///     than bridging an asset that has already been onboarded.
///
/// @param nftIdentifier: The Cadence type identifier of the NFT to bridge - e.g. nft.getType().identifier
/// @param id: The Cadence NFT.id of the NFT to bridge to EVM
///
transaction(nftIdentifier: String, id: UInt64) {

    let nft: @{NonFungibleToken.NFT}
    let coa: auth(EVM.Call, EVM.Bridge) &EVM.CadenceOwnedAccount
    let requiresOnboarding: Bool
    let scopedProvider: @ScopedFTProviders.ScopedFTProvider
    let nftType: Type
    let viewResolver: &{ViewResolver}

    prepare(signer: auth(CopyValue, BorrowValue, IssueStorageCapabilityController, PublishCapability, SaveValue) &Account, payer: auth(CopyValue, BorrowValue, IssueStorageCapabilityController, PublishCapability, SaveValue) &Account) {
        /* --- Reference the signer's CadenceOwnedAccount --- */
        //
        // Borrow a reference to the signer's COA
        self.coa = signer.storage.borrow<auth(EVM.Call, EVM.Bridge) &EVM.CadenceOwnedAccount>(from: /storage/evm)
            ?? panic("Could not borrow COA from provided gateway address")

        /* --- Construct the NFT type --- */
        //
        // Construct the NFT type from the provided identifier
        self.nftType = CompositeType(nftIdentifier)
            ?? panic("Could not construct NFT type from identifier: ".concat(nftIdentifier))
        // Parse the NFT identifier into its components
        let nftContractAddress = FlowEVMBridgeUtils.getContractAddress(fromType: self.nftType)
            ?? panic("Could not get contract address from identifier: ".concat(nftIdentifier))
        let nftContractName = FlowEVMBridgeUtils.getContractName(fromType: self.nftType)
            ?? panic("Could not get contract name from identifier: ".concat(nftIdentifier))

        /* --- Retrieve the NFT --- */
        //
        // Borrow a reference to the NFT collection, configuring if necessary
        self.viewResolver = getAccount(nftContractAddress).contracts.borrow<&{ViewResolver}>(name: nftContractName)
            ?? panic("Could not borrow ViewResolver from NFT contract")
        let collectionData = self.viewResolver.resolveContractView(
                resourceType: self.nftType,
                viewType: Type<MetadataViews.NFTCollectionData>()
            ) as! MetadataViews.NFTCollectionData? ?? panic("Could not resolve NFTCollectionData view")
        let collection = signer.storage.borrow<auth(NonFungibleToken.Withdraw) &{NonFungibleToken.Collection}>(
                from: collectionData.storagePath
            ) ?? panic("Could not access signer's NFT Collection")

        // Withdraw the requested NFT & calculate the approximate bridge fee based on NFT storage usage
        let currentStorageUsage = signer.storage.used
        self.nft <- collection.withdraw(withdrawID: id)
        let withdrawnStorageUsage = signer.storage.used
        var approxFee = FlowEVMBridgeUtils.calculateBridgeFee(bytes: 400_000) + FlowEVMBridgeConfig.baseFee
        // Determine if the NFT requires onboarding - this impacts the fee required
        self.requiresOnboarding = FlowEVMBridge.typeRequiresOnboarding(self.nft.getType())
            ?? panic("Bridge does not support this asset type")
        if self.requiresOnboarding {
            approxFee = approxFee + FlowEVMBridgeConfig.onboardFee
        }

        /* --- Configure a ScopedFTProvider --- */
        //
        // Issue and store bridge-dedicated Provider Capability in storage if necessary
        if payer.storage.type(at: FlowEVMBridgeConfig.providerCapabilityStoragePath) == nil {
            let providerCap = payer.capabilities.storage.issue<auth(FungibleToken.Withdraw) &{FungibleToken.Provider}>(
                /storage/flowTokenVault
            )
            payer.storage.save(providerCap, to: FlowEVMBridgeConfig.providerCapabilityStoragePath)
        }
        // Copy the stored Provider capability and create a ScopedFTProvider
        let providerCapCopy = payer.storage.copy<Capability<auth(FungibleToken.Withdraw) &{FungibleToken.Provider}>>(
                from: FlowEVMBridgeConfig.providerCapabilityStoragePath
            ) ?? panic("Invalid Provider Capability found in storage.")
        let providerFilter = ScopedFTProviders.AllowanceFilter(approxFee)
        self.scopedProvider <- ScopedFTProviders.createScopedFTProvider(
                provider: providerCapCopy,
                filters: [ providerFilter ],
                expiration: getCurrentBlock().timestamp + 1.0
            )
    }

    pre {
        self.nft.getType().identifier == nftIdentifier:
            "Attempting to send invalid nft type - requested: ".concat(nftIdentifier)
            .concat(", sending: ").concat(self.nft.getType().identifier)
    }

    execute {
        if self.requiresOnboarding {
            // Onboard the NFT to the bridge
            FlowEVMBridge.onboardByType(
                self.nft.getType(),
                feeProvider: &self.scopedProvider as auth(FungibleToken.Withdraw) &{FungibleToken.Provider}
            )
        }

        // Execute the bridge
        self.coa.depositNFT(
            nft: <-self.nft,
            feeProvider: &self.scopedProvider as auth(FungibleToken.Withdraw) &{FungibleToken.Provider}
        )
        // Destroy the ScopedFTProvider
        destroy self.scopedProvider

        // Wrap NFTs if applicable
        wrapAndTransferNFTsIfApplicable(self.coa,
            nftIDs: [id],
            nftType: self.nftType,
            viewResolver: self.viewResolver,
            recipientIfNotCoa: nil
        )
    }
}

/// Wraps and transfers bridged NFTs into a project's custom ERC721 wrapper contract on EVM, if applicable.
/// Enables projects to use their own ERC721 contract while leveraging the bridge's underlying contract,
/// until direct custom contract support is added to the bridge.
///
/// @param coa: The COA of the signer
/// @param nftIDs: The IDs of the NFTs to wrap
/// @param nftType: The type of the NFTs to wrap
/// @param viewResolver: The ViewResolver of the NFT contract
/// @param recipientIfNotCoa: The EVM address to transfer the wrapped NFTs to, nil if the NFTs should stay in signer's COA
///
access(all) fun wrapAndTransferNFTsIfApplicable(
    _ coa: auth(EVM.Call) &EVM.CadenceOwnedAccount,
    nftIDs: [UInt64],
    nftType: Type,
    viewResolver: &{ViewResolver},
    recipientIfNotCoa: EVM.EVMAddress?
) {
    // Get the project-defined ERC721 address if it exists
    if let crossVMPointer = viewResolver.resolveContractView(
            resourceType: nftType,
            viewType: Type<CrossVMMetadataViews.EVMPointer>()
    ) as! CrossVMMetadataViews.EVMPointer? {
        // Get the underlying ERC721 address if it exists
        if let underlyingAddress = getUnderlyingERC721Address(coa, crossVMPointer.evmContractAddress) {
            // Wrap NFTs if underlying ERC721 address matches bridge's associated address for NFT type
            if underlyingAddress.equals(FlowEVMBridgeConfig.getEVMAddressAssociated(with: nftType)!) {
                // Approve contract to withdraw underlying NFTs from signer's coa
                mustCall(coa, underlyingAddress,
                    functionSig: "setApprovalForAll(address,bool)",
                    args: [crossVMPointer.evmContractAddress, true]
                )

                // Wrap NFTs with provided IDs, and check if the call was successful
                let res = mustCall(coa, crossVMPointer.evmContractAddress,
                    functionSig: "depositFor(address,uint256[])",
                    args: [coa.address(), nftIDs]
                )
                let decodedRes = EVM.decodeABI(types: [Type<Bool>()], data: res.data)
                assert(decodedRes.length == 1, message: "Invalid response length")
                assert(decodedRes[0] as! Bool, message: "Failed to wrap NFTs")

                // Transfer NFTs to recipient if provided
                if let to = recipientIfNotCoa {
                    mustTransferNFTs(coa, crossVMPointer.evmContractAddress, nftIDs: nftIDs, to: to)
                }

                // Revoke approval for contract to withdraw underlying NFTs from signer's coa
                mustCall(coa, underlyingAddress,
                    functionSig: "setApprovalForAll(address,bool)",
                    args: [crossVMPointer.evmContractAddress, false]
                )
            }
        }
    }
}

/// Gets the underlying ERC721 address if it exists (i.e. if the ERC721 is a wrapper)
///
access(all) fun getUnderlyingERC721Address(
    _ coa: auth(EVM.Call) &EVM.CadenceOwnedAccount,
    _ wrapperAddress: EVM.EVMAddress
): EVM.EVMAddress? {
    let res = coa.call(
        to: wrapperAddress,
        data: EVM.encodeABIWithSignature("underlying()", []),
        gasLimit: 100_000,
        value: EVM.Balance(attoflow: 0)
    )

    // If the call fails, return nil
    if res.status != EVM.Status.successful || res.data.length == 0 {
        return nil
    }

    // Decode and return the underlying ERC721 address
    let decodedResult = EVM.decodeABI(
        types: [Type<EVM.EVMAddress>()],
        data: res.data
    )
    assert(decodedResult.length == 1, message: "Invalid response length")
    return decodedResult[0] as! EVM.EVMAddress
}

/// Checks if the provided NFT is owned by the provided EVM address
///
access(all) fun isOwner(
    _ coa: auth(EVM.Call) &EVM.CadenceOwnedAccount,
    _ erc721Address: EVM.EVMAddress,
    _ nftID: UInt64,
    _ ownerToCheck: EVM.EVMAddress
): Bool {
    let res = coa.call(
        to: erc721Address,
        data: EVM.encodeABIWithSignature("ownerOf(uint256)", [nftID]),
        gasLimit: 100_000,
        value: EVM.Balance(attoflow: 0)
    )
    assert(res.status == EVM.Status.successful, message: "Call to ERC721.ownerOf(uint256) failed")
    let decodedRes = EVM.decodeABI(types: [Type<EVM.EVMAddress>()], data: res.data)
    if decodedRes.length == 1 {
        let actualOwner = decodedRes[0] as! EVM.EVMAddress
        return actualOwner.equals(ownerToCheck)
    }
    return false
}

/// Transfers NFTs from the provided COA to the provided EVM address
///
access(all) fun mustTransferNFTs(
    _ coa: auth(EVM.Call) &EVM.CadenceOwnedAccount,
    _ erc721Address: EVM.EVMAddress,
    nftIDs: [UInt64],
    to: EVM.EVMAddress
) {
    for id in nftIDs {
        assert(isOwner(coa, erc721Address, id, coa.address()), message: "NFT not owned by signer's COA")
        mustCall(coa, erc721Address,
            functionSig: "safeTransferFrom(address,address,uint256)",
            args: [coa.address(), to, id]
        )
        assert(isOwner(coa, erc721Address, id, to), message: "NFT not transferred to recipient")
    }
}

/// Calls a function on an EVM contract from provided coa
///
access(all) fun mustCall(
    _ coa: auth(EVM.Call) &EVM.CadenceOwnedAccount,
    _ contractAddr: EVM.EVMAddress,
    functionSig: String,
    args: [AnyStruct]
): EVM.Result {
    let res = coa.call(
        to: contractAddr,
        data: EVM.encodeABIWithSignature(functionSig, args),
        gasLimit: 4_000_000,
        value: EVM.Balance(attoflow: 0)
    )

    assert(res.status == EVM.Status.successful,
        message: "Failed to call '".concat(functionSig)
            .concat("\\n\\t error code: ").concat(res.errorCode.toString())
            .concat("\\n\\t error message: ").concat(res.errorMessage)
            .concat("\\n\\t gas used: ").concat(res.gasUsed.toString())
            .concat("\\n\\t caller address: 0x").concat(coa.address().toString())
            .concat("\\n\\t contract address: 0x").concat(contractAddr.toString())
    )

    return res
}
`;
    let config = {
      cadence: code.trim(),
      name: "bridgeNftToEvmWithPayer",
      type: "transaction",
      args: (arg: any, t: any) => [
        arg(nftIdentifier, t.String),
        arg(id, t.UInt64),
      ],
      limit: 9999,
    };
    config = await this.runRequestInterceptors(config);
    let txId = await fcl.mutate(config);
    const result = await this.runResponseInterceptors(config, txId);
    return result.response;
  }


  public async bridgeTokensFromEvmToFlowV3(vaultIdentifier: string, amount: string, recipient: string) {
    const code = `
import MetadataViews from 0xMetadataViews
import ViewResolver from 0xMetadataViews
import NonFungibleToken from 0xNonFungibleToken

import FungibleToken from 0xFungibleToken
import FlowToken from 0xFlowToken
import FungibleTokenMetadataViews from 0xFungibleToken

import ScopedFTProviders from 0xFlowEVMBridge

import EVM from 0xEVM

import FlowEVMBridgeUtils from 0xFlowEVMBridge
import FlowEVMBridge from 0xFlowEVMBridge
import FlowEVMBridgeConfig from 0xFlowEVMBridge
import StorageRent from 0xStorageRent

/// This transaction bridges fungible tokens from EVM to Cadence assuming it has already been onboarded to the
/// FlowEVMBridge. The full amount to be transferred is sourced from EVM, so it's assumed the signer has sufficient
/// balance of the ERC20 to bridging into Cadence. Also know that the recipient Flow account must have a Receiver
/// capable of receiving the bridged tokens accessible via published Capability at the token's standard path.
///
/// NOTE: The ERC20 must have first been onboarded to the bridge. This can be checked via the method
///     FlowEVMBridge.evmAddressRequiresOnboarding(address: self.evmContractAddress)
///
/// @param vaultIdentifier: The Cadence type identifier of the FungibleToken Vault to bridge
///     - e.g. vault.getType().identifier
/// @param amount: The amount of tokens to bridge from EVM and transfer to the recipient
/// @param recipient: The Flow account address to receive the bridged tokens
///
transaction(vaultIdentifier: String, amount: UInt256, recipient: Address) {

    let vaultType: Type
    let receiver: &{FungibleToken.Receiver}
    let scopedProvider: @ScopedFTProviders.ScopedFTProvider
    let coa: auth(EVM.Bridge) &EVM.CadenceOwnedAccount

    prepare(signer: auth(BorrowValue, CopyValue, IssueStorageCapabilityController, PublishCapability, SaveValue, UnpublishCapability) &Account) {
        /* --- Reference the signer's CadenceOwnedAccount --- */
        //
        // Borrow a reference to the signer's COA
        self.coa = signer.storage.borrow<auth(EVM.Bridge) &EVM.CadenceOwnedAccount>(from: /storage/evm)
            ?? panic("Could not borrow COA from provided gateway address")

        /* --- Construct the Vault type --- */
        //
        // Construct the Vault type from the provided identifier
        self.vaultType = CompositeType(vaultIdentifier)
            ?? panic("Could not construct Vault type from identifier: ".concat(vaultIdentifier))
        // Parse the Vault identifier into its components
        let tokenContractAddress = FlowEVMBridgeUtils.getContractAddress(fromType: self.vaultType)
            ?? panic("Could not get contract address from identifier: ".concat(vaultIdentifier))
        let tokenContractName = FlowEVMBridgeUtils.getContractName(fromType: self.vaultType)
            ?? panic("Could not get contract name from identifier: ".concat(vaultIdentifier))

        /* --- Reference the signer's Vault --- */
        //
        // Borrow a reference to the FungibleToken Vault, configuring if necessary
        let viewResolver = getAccount(tokenContractAddress).contracts.borrow<&{ViewResolver}>(name: tokenContractName)
            ?? panic("Could not borrow ViewResolver from FungibleToken contract")
        let vaultData = viewResolver.resolveContractView(
                resourceType: self.vaultType,
                viewType: Type<FungibleTokenMetadataViews.FTVaultData>()
            ) as! FungibleTokenMetadataViews.FTVaultData? ?? panic("Could not resolve FTVaultData view")
        // If the vault does not exist, create it and publish according to the contract's defined configuration
        if signer.storage.borrow<&{FungibleToken.Vault}>(from: vaultData.storagePath) == nil {
            signer.storage.save(<-vaultData.createEmptyVault(), to: vaultData.storagePath)

            signer.capabilities.unpublish(vaultData.receiverPath)
            signer.capabilities.unpublish(vaultData.metadataPath)

            let receiverCap = signer.capabilities.storage.issue<&{FungibleToken.Vault}>(vaultData.storagePath)
            let metadataCap = signer.capabilities.storage.issue<&{FungibleToken.Vault}>(vaultData.storagePath)

            signer.capabilities.publish(receiverCap, at: vaultData.receiverPath)
            signer.capabilities.publish(metadataCap, at: vaultData.metadataPath)
        }
        self.receiver = getAccount(recipient).capabilities.borrow<&{FungibleToken.Receiver}>(vaultData.receiverPath)
            ?? panic("Could not borrow Vault from recipient's account")

        /* --- Configure a ScopedFTProvider --- */
        //
        // Calculate the bridge fee - bridging from EVM consumes no storage, so flat fee
        let approxFee = FlowEVMBridgeUtils.calculateBridgeFee(bytes: 400_000)
        // Issue and store bridge-dedicated Provider Capability in storage if necessary
        if signer.storage.type(at: FlowEVMBridgeConfig.providerCapabilityStoragePath) == nil {
            let providerCap = signer.capabilities.storage.issue<auth(FungibleToken.Withdraw) &{FungibleToken.Provider}>(
                /storage/flowTokenVault
            )
            signer.storage.save(providerCap, to: FlowEVMBridgeConfig.providerCapabilityStoragePath)
        }
        // Copy the stored Provider capability and create a ScopedFTProvider
        let providerCapCopy = signer.storage.copy<Capability<auth(FungibleToken.Withdraw) &{FungibleToken.Provider}>>(
                from: FlowEVMBridgeConfig.providerCapabilityStoragePath
            ) ?? panic("Invalid Provider Capability found in storage.")
        let providerFilter = ScopedFTProviders.AllowanceFilter(approxFee)
        self.scopedProvider <- ScopedFTProviders.createScopedFTProvider(
                provider: providerCapCopy,
                filters: [ providerFilter ],
                expiration: getCurrentBlock().timestamp + 1.0
            )
    }

    execute {
        // Execute the bridge request
        let vault: @{FungibleToken.Vault} <- self.coa.withdrawTokens(
            type: self.vaultType,
            amount: amount,
            feeProvider: &self.scopedProvider as auth(FungibleToken.Withdraw) &{FungibleToken.Provider}
        )
        // Ensure the bridged vault is the correct type
        assert(vault.getType() == self.vaultType, message: "Bridged vault type mismatch")
        // Deposit the bridged token into the signer's vault
        self.receiver.deposit(from: <-vault)
        // Destroy the ScopedFTProvider
        destroy self.scopedProvider
        StorageRent.tryRefill(recipient)
    }
}
`;
    let config = {
      cadence: code.trim(),
      name: "bridgeTokensFromEvmToFlowV3",
      type: "transaction",
      args: (arg: any, t: any) => [
        arg(vaultIdentifier, t.String),
        arg(amount, t.UInt256),
        arg(recipient, t.Address),
      ],
      limit: 9999,
    };
    config = await this.runRequestInterceptors(config);
    let txId = await fcl.mutate(config);
    const result = await this.runResponseInterceptors(config, txId);
    return result.response;
  }


  public async bridgeTokensToEvmAddressV2(vaultIdentifier: string, amount: string, recipient: string) {
    const code = `
import MetadataViews from 0xMetadataViews
import ViewResolver from 0xMetadataViews
import NonFungibleToken from 0xNonFungibleToken

import FungibleToken from 0xFungibleToken
import FlowToken from 0xFlowToken
import FungibleTokenMetadataViews from 0xFungibleToken

import ScopedFTProviders from 0xFlowEVMBridge

import EVM from 0xEVM

import FlowEVMBridgeUtils from 0xFlowEVMBridge
import FlowEVMBridge from 0xFlowEVMBridge
import FlowEVMBridgeConfig from 0xFlowEVMBridge


transaction(vaultIdentifier: String, amount: UFix64, recipient: String) {
    let sentVault: @{FungibleToken.Vault}
    let requiresOnboarding: Bool
    let scopedProvider: @ScopedFTProviders.ScopedFTProvider

    prepare(signer: auth(CopyValue, BorrowValue, IssueStorageCapabilityController, PublishCapability, SaveValue) &Account) {
        /* --- Construct the Vault type --- */
        //
        // Construct the Vault type from the provided identifier
        let vaultType = CompositeType(vaultIdentifier)
            ?? panic("Could not construct Vault type from identifier: ".concat(vaultIdentifier))
        // Parse the Vault identifier into its components
        let tokenContractAddress = FlowEVMBridgeUtils.getContractAddress(fromType: vaultType)
            ?? panic("Could not get contract address from identifier: ".concat(vaultIdentifier))
        let tokenContractName = FlowEVMBridgeUtils.getContractName(fromType: vaultType)
            ?? panic("Could not get contract name from identifier: ".concat(vaultIdentifier))
        
        /* --- Retrieve the funds --- */
        //
        // Borrow a reference to the FungibleToken Vault
        let viewResolver = getAccount(tokenContractAddress).contracts.borrow<&{ViewResolver}>(name: tokenContractName)
            ?? panic("Could not borrow ViewResolver from FungibleToken contract")
        let vaultData = viewResolver.resolveContractView(
                resourceType: nil,
                viewType: Type<FungibleTokenMetadataViews.FTVaultData>()
            ) as! FungibleTokenMetadataViews.FTVaultData? ?? panic("Could not resolve FTVaultData view")
        let vault = signer.storage.borrow<auth(FungibleToken.Withdraw) &{FungibleToken.Vault}>(
                from: vaultData.storagePath
            ) ?? panic("Could not access signer's FungibleToken Vault")

        // Withdraw the requested balance & calculate the approximate bridge fee based on storage usage
        let currentStorageUsage = signer.storage.used
        self.sentVault <- vault.withdraw(amount: amount)
        let withdrawnStorageUsage = signer.storage.used
        // Approximate the bridge fee based on the difference in storage usage with some buffer
        var approxFee = FlowEVMBridgeUtils.calculateBridgeFee(
                bytes: currentStorageUsage - withdrawnStorageUsage
            ) * 1.10
        // Determine if the Vault requires onboarding - this impacts the fee required
        self.requiresOnboarding = FlowEVMBridge.typeRequiresOnboarding(self.sentVault.getType())
            ?? panic("Bridge does not support this asset type")
        if self.requiresOnboarding {
            approxFee = approxFee + FlowEVMBridgeConfig.onboardFee
        }

        /* --- Configure a ScopedFTProvider --- */
        //
        // Issue and store bridge-dedicated Provider Capability in storage if necessary
        if signer.storage.type(at: FlowEVMBridgeConfig.providerCapabilityStoragePath) == nil {
            let providerCap = signer.capabilities.storage.issue<auth(FungibleToken.Withdraw) &{FungibleToken.Provider}>(
                /storage/flowTokenVault
            )
            signer.storage.save(providerCap, to: FlowEVMBridgeConfig.providerCapabilityStoragePath)
        }
        // Copy the stored Provider capability and create a ScopedFTProvider
        let providerCapCopy = signer.storage.copy<Capability<auth(FungibleToken.Withdraw) &{FungibleToken.Provider}>>(
                from: FlowEVMBridgeConfig.providerCapabilityStoragePath
            ) ?? panic("Invalid Provider Capability found in storage.")
        let providerFilter = ScopedFTProviders.AllowanceFilter(approxFee)
        self.scopedProvider <- ScopedFTProviders.createScopedFTProvider(
                provider: providerCapCopy,
                filters: [ providerFilter ],
                expiration: getCurrentBlock().timestamp + 1.0
            )
    }

    pre {
        self.sentVault.getType().identifier == vaultIdentifier:
            "Attempting to send invalid vault type - requested: ".concat(vaultIdentifier)
            .concat(", sending: ").concat(self.sentVault.getType().identifier)
        self.sentVault.balance == amount: "Amount to be transferred does not match the requested amount"
    }

    execute {
        if self.requiresOnboarding {
            // Onboard the Vault to the bridge
            FlowEVMBridge.onboardByType(
                self.sentVault.getType(),
                feeProvider: &self.scopedProvider as auth(FungibleToken.Withdraw) &{FungibleToken.Provider}
            )
        }
        // Execute the bridge transaction
        let recipientEVMAddress = EVM.addressFromString(recipient)
        FlowEVMBridge.bridgeTokensToEVM(
            vault: <-self.sentVault,
            to: recipientEVMAddress,
            feeProvider: &self.scopedProvider as auth(FungibleToken.Withdraw) &{FungibleToken.Provider}
        )
        // Destroy the ScopedFTProvider
        destroy self.scopedProvider
    }
}
`;
    let config = {
      cadence: code.trim(),
      name: "bridgeTokensToEvmAddressV2",
      type: "transaction",
      args: (arg: any, t: any) => [
        arg(vaultIdentifier, t.String),
        arg(amount, t.UFix64),
        arg(recipient, t.String),
      ],
      limit: 9999,
    };
    config = await this.runRequestInterceptors(config);
    let txId = await fcl.mutate(config);
    const result = await this.runResponseInterceptors(config, txId);
    return result.response;
  }

  // Tag: SrcCadenceCollectionTransactions
  public async batchSendNbaNftV3(identifier: string, recipientAddr: string, ids: number[]) {
    const code = `
import NonFungibleToken from 0xNonFungibleToken
import StorageRent from 0xStorageRent
import ViewResolver from 0xMetadataViews
import MetadataViews from 0xMetadataViews



transaction(identifier: String, recipientAddr: Address, ids: [UInt64]) {
    prepare(signer: auth(Storage, BorrowValue) &Account) {
        let type = CompositeType(identifier)
        let identifierSplit = identifier.split(separator: ".")
        let address = Address.fromString("0x".concat(identifierSplit[1]))!
        let name = identifierSplit[2]!
        let viewResolver = getAccount(address).contracts.borrow<&{ViewResolver}>(name: name)
        ?? panic("Could not borrow ViewResolver from NFT contract")

        let collectionData = viewResolver.resolveContractView(
        resourceType: nil,
        viewType: Type<MetadataViews.NFTCollectionData>()
        ) as! MetadataViews.NFTCollectionData? ?? panic("Could not resolve NFTCollectionData view")
        // get the recipients public account object
        let recipient = getAccount(recipientAddr)
        // borrow a reference to the signer''s NFT collection
        let collectionRef = signer.storage
        .borrow<auth(NonFungibleToken.Withdraw) &{NonFungibleToken.Collection}>(from: /storage/MomentCollection)
        ?? panic("Could not borrow a reference to the owner''s collection")
        let senderRef = signer
        .capabilities
        .borrow<&{NonFungibleToken.CollectionPublic}>(/public/MomentCollection)
        // borrow a public reference to the receivers collection
        let recipientRef = recipient
        .capabilities
        .borrow<&{NonFungibleToken.CollectionPublic}>(/public/MomentCollection) ?? panic("Unable to borrow receiver reference")
        
        for withdrawID in ids {
            // withdraw the NFT from the owner''s collection
            let nft <- collectionRef.withdraw(withdrawID: withdrawID)
            // Deposit the NFT in the recipient''s collection
            recipientRef!.deposit(token: <-nft)
        }
        StorageRent.tryRefill(recipientAddr)
    }
}
`;
    let config = {
      cadence: code.trim(),
      name: "batchSendNbaNftV3",
      type: "transaction",
      args: (arg: any, t: any) => [
        arg(identifier, t.String),
        arg(recipientAddr, t.Address),
        arg(ids, t.Array(t.UInt64)),
      ],
      limit: 9999,
    };
    config = await this.runRequestInterceptors(config);
    let txId = await fcl.mutate(config);
    const result = await this.runResponseInterceptors(config, txId);
    return result.response;
  }


  public async batchSendNftV3(identifier: string, recipientAddr: string, ids: number[]) {
    const code = `
import NonFungibleToken from 0xNonFungibleToken
import StorageRent from 0xStorageRent
import ViewResolver from 0xMetadataViews
import MetadataViews from 0xMetadataViews


// This transaction is for transferring and NFT from
// one account to another

transaction(identifier: String, recipientAddr: Address, ids: [UInt64]) {

    prepare(signer: auth(Storage, BorrowValue) &Account) {

        let type = CompositeType(identifier)
        let identifierSplit = identifier.split(separator: ".")
        let address = Address.fromString("0x".concat(identifierSplit[1]))!
        let name = identifierSplit[2]!
        let viewResolver = getAccount(address).contracts.borrow<&{ViewResolver}>(name: name)
        ?? panic("Could not borrow ViewResolver from NFT contract")
        // get the recipients public account object
        let recipient = getAccount(recipientAddr)

        let collectionData = viewResolver.resolveContractView(
            resourceType: type,
            viewType: Type<MetadataViews.NFTCollectionData>()
        ) as! MetadataViews.NFTCollectionData? ?? panic("Could not resolve NFTCollectionData view")
        // borrow a reference to the signer's NFT collection
        let collectionRef = signer.storage.borrow<auth(NonFungibleToken.Withdraw) &{NonFungibleToken.Provider}>(from: collectionData.storagePath)
            ?? panic("Could not borrow a reference to the owner's collection")

        // borrow a public reference to the receivers collection
        let depositRef = recipient
            .capabilities
            .borrow<&{NonFungibleToken.Collection}>(collectionData.publicPath)
            ?? panic("Could not borrow a reference to the receiver's collection")

        for withdrawID in ids {
            // withdraw the NFT from the owner's collection
            let nft <- collectionRef.withdraw(withdrawID: withdrawID)

            // Deposit the NFT in the recipient's collection
            depositRef.deposit(token: <-nft)
        }
       
        StorageRent.tryRefill(recipientAddr)

    }
}
`;
    let config = {
      cadence: code.trim(),
      name: "batchSendNftV3",
      type: "transaction",
      args: (arg: any, t: any) => [
        arg(identifier, t.String),
        arg(recipientAddr, t.Address),
        arg(ids, t.Array(t.UInt64)),
      ],
      limit: 9999,
    };
    config = await this.runRequestInterceptors(config);
    let txId = await fcl.mutate(config);
    const result = await this.runResponseInterceptors(config, txId);
    return result.response;
  }


  public async sendNbaNftV3(identifier: string, recipientAddr: string, withdrawID: number) {
    const code = `
import NonFungibleToken from 0xNonFungibleToken
import StorageRent from 0xStorageRent
import ViewResolver from 0xMetadataViews
import MetadataViews from 0xMetadataViews



transaction(identifier: String, recipientAddr: Address, withdrawID: UInt64) {
    prepare(signer: auth(Storage, BorrowValue) &Account) {
        let type = CompositeType(identifier)
        let identifierSplit = identifier.split(separator: ".")
        let address = Address.fromString("0x".concat(identifierSplit[1]))!
        let name = identifierSplit[2]!
        let viewResolver = getAccount(address).contracts.borrow<&{ViewResolver}>(name: name)
        ?? panic("Could not borrow ViewResolver from NFT contract")

        let collectionData = viewResolver.resolveContractView(
        resourceType: nil,
        viewType: Type<MetadataViews.NFTCollectionData>()
        ) as! MetadataViews.NFTCollectionData? ?? panic("Could not resolve NFTCollectionData view")
        // get the recipients public account object
        let recipient = getAccount(recipientAddr)
        // borrow a reference to the signer''s NFT collection
        let collectionRef = signer.storage
        .borrow<auth(NonFungibleToken.Withdraw) &{NonFungibleToken.Collection}>(from: /storage/MomentCollection)
        ?? panic("Could not borrow a reference to the owner''s collection")
        let senderRef = signer
        .capabilities
        .borrow<&{NonFungibleToken.CollectionPublic}>(/public/MomentCollection)
        // borrow a public reference to the receivers collection
        let recipientRef = recipient
        .capabilities
        .borrow<&{NonFungibleToken.CollectionPublic}>(/public/MomentCollection) ?? panic("Unable to borrow receiver reference")
        
        // withdraw the NFT from the owner''s collection
        let nft <- collectionRef.withdraw(withdrawID: withdrawID)
        // Deposit the NFT in the recipient''s collection
        recipientRef!.deposit(token: <-nft)
        StorageRent.tryRefill(recipientAddr)
    }
}
`;
    let config = {
      cadence: code.trim(),
      name: "sendNbaNftV3",
      type: "transaction",
      args: (arg: any, t: any) => [
        arg(identifier, t.String),
        arg(recipientAddr, t.Address),
        arg(withdrawID, t.UInt64),
      ],
      limit: 9999,
    };
    config = await this.runRequestInterceptors(config);
    let txId = await fcl.mutate(config);
    const result = await this.runResponseInterceptors(config, txId);
    return result.response;
  }


  public async sendNft(identifier: string, recipientAddr: string, withdrawID: number) {
    const code = `
import NonFungibleToken from 0xNonFungibleToken
import MetadataViews from 0xMetadataViews
import ViewResolver from 0xMetadataViews
// This transaction is for transferring and NFT from
// one account to another

transaction(identifier: String, recipientAddr: Address, withdrawID: UInt64) {

    prepare(signer: auth(Storage, BorrowValue) &Account) {
        let type = CompositeType(identifier)
        let identifierSplit = identifier.split(separator: ".")
        let address = Address.fromString("0x".concat(identifierSplit[1]))!
        let name = identifierSplit[2]!

        let viewResolver = getAccount(address).contracts.borrow<&{ViewResolver}>(name: name)
        ?? panic("Could not borrow ViewResolver from NFT contract")
        let collectionData = viewResolver.resolveContractView(
        resourceType: nil,
        viewType: Type<MetadataViews.NFTCollectionData>()
        ) as! MetadataViews.NFTCollectionData? ?? panic("Could not resolve NFTCollectionData view")
        // get the recipients public account object
        let recipient = getAccount(recipientAddr)

        // borrow a reference to the signer's NFT collection
        let collectionRef = signer.storage.borrow<auth(NonFungibleToken.Withdraw) &{NonFungibleToken.Provider}>(from: collectionData.storagePath)
            ?? panic("Could not borrow a reference to the owner's collection")

        // borrow a public reference to the receivers collection
        let depositRef = recipient
            .capabilities
            .borrow<&{NonFungibleToken.Collection}>(collectionData.publicPath)
            ?? panic("Could not borrow a reference to the receiver's collection")

        // withdraw the NFT from the owner's collection
        let nft <- collectionRef.withdraw(withdrawID: withdrawID)

        // Deposit the NFT in the recipient's collection
        depositRef.deposit(token: <-nft)

    }
}
`;
    let config = {
      cadence: code.trim(),
      name: "sendNft",
      type: "transaction",
      args: (arg: any, t: any) => [
        arg(identifier, t.String),
        arg(recipientAddr, t.Address),
        arg(withdrawID, t.UInt64),
      ],
      limit: 9999,
    };
    config = await this.runRequestInterceptors(config);
    let txId = await fcl.mutate(config);
    const result = await this.runResponseInterceptors(config, txId);
    return result.response;
  }

  // Tag: SrcCadenceEvmScripts
  public async getAddr(flowAddress: string): Promise<string| undefined> {
    const code = `
import EVM from 0xEVM

access(all) fun main(flowAddress: Address): String? {
    if let address: EVM.EVMAddress = getAuthAccount<auth(BorrowValue) &Account>(flowAddress)
        .storage.borrow<&EVM.CadenceOwnedAccount>(from: /storage/evm)?.address() {
        let bytes: [UInt8] = []
        for byte in address.bytes {
            bytes.append(byte)
        }
        return String.encodeHex(bytes)
    }
    return nil
}
`;
    let config = {
      cadence: code.trim(),
      name: "getAddr",
      type: "script",
      args: (arg: any, t: any) => [
        arg(flowAddress, t.Address),
      ],
      limit: 9999,
    };
    config = await this.runRequestInterceptors(config);
    let response = await fcl.query(config);
    const result = await this.runResponseInterceptors(config, response);
    return result.response;
  }

  // Tag: SrcCadenceEvmTransaction
  public async batchCallContract(evmContractAddressHexes: string[], amounts: string[], datas: number[][], gasLimit: number) {
    const code = `
import FungibleToken from 0xFungibleToken
import FlowToken from 0xFlowToken
import EVM from 0xEVM

/// Transfers \$FLOW from the signer's account Cadence Flow balance to the recipient's hex-encoded EVM address.
/// Note that a COA must have a \$FLOW balance in EVM before transferring value to another EVM address.
///
transaction(evmContractAddressHexes: [String], amounts: [UFix64], datas: [[UInt8]], gasLimit: UInt64) {

    let coa: auth(EVM.Withdraw, EVM.Call) &EVM.CadenceOwnedAccount

    prepare(signer: auth(BorrowValue, SaveValue) &Account) {
        if signer.storage.type(at: /storage/evm) == nil {
            signer.storage.save(<-EVM.createCadenceOwnedAccount(), to: /storage/evm)
        }
        self.coa = signer.storage.borrow<auth(EVM.Withdraw, EVM.Call) &EVM.CadenceOwnedAccount>(from: /storage/evm)
            ?? panic("Could not borrow reference to the signer's bridged account")
    }

    execute {
        
        // Perform all the calls
        for index, evmAddressHex in evmContractAddressHexes { 
            let evmAddress = EVM.addressFromString(evmAddressHex)
            if evmAddress.bytes == self.coa.address().bytes {
                continue
            }

            let valueBalance = EVM.Balance(attoflow: 0)
            valueBalance.setFLOW(flow: amounts[index])
            let txResult = self.coa.call(
                to: evmAddress,
                data: datas[index],
                gasLimit: gasLimit,
                value: valueBalance
            )
            assert(
                txResult.status == EVM.Status.failed || txResult.status == EVM.Status.successful,
                message: "evm_error=".concat(txResult.errorMessage)
            )
        }
    }
}
`;
    let config = {
      cadence: code.trim(),
      name: "batchCallContract",
      type: "transaction",
      args: (arg: any, t: any) => [
        arg(evmContractAddressHexes, t.Array(t.String)),
        arg(amounts, t.Array(t.UFix64)),
        arg(datas, t.Array(t.Array(t.UInt8))),
        arg(gasLimit, t.UInt64),
      ],
      limit: 9999,
    };
    config = await this.runRequestInterceptors(config);
    let txId = await fcl.mutate(config);
    const result = await this.runResponseInterceptors(config, txId);
    return result.response;
  }


  public async callContract(toEVMAddressHex: string, amount: string, data: number[], gasLimit: number) {
    const code = `
import FungibleToken from 0xFungibleToken
import FlowToken from 0xFlowToken
import EVM from 0xEVM

/// Transfers \$FLOW from the signer's account Cadence Flow balance to the recipient's hex-encoded EVM address.
/// Note that a COA must have a \$FLOW balance in EVM before transferring value to another EVM address.
///
transaction(toEVMAddressHex: String, amount: UFix64, data: [UInt8], gasLimit: UInt64) {

    let coa: auth(EVM.Withdraw, EVM.Call) &EVM.CadenceOwnedAccount
    let recipientEVMAddress: EVM.EVMAddress

    prepare(signer: auth(BorrowValue, SaveValue) &Account) {
        if signer.storage.type(at: /storage/evm) == nil {
            signer.storage.save(<-EVM.createCadenceOwnedAccount(), to: /storage/evm)
        }
        self.coa = signer.storage.borrow<auth(EVM.Withdraw, EVM.Call) &EVM.CadenceOwnedAccount>(from: /storage/evm)
            ?? panic("Could not borrow reference to the signer's bridged account")

        self.recipientEVMAddress = EVM.addressFromString(toEVMAddressHex)
    }

    execute {
        if self.recipientEVMAddress.bytes == self.coa.address().bytes {
            return
        }
        let valueBalance = EVM.Balance(attoflow: 0)
        valueBalance.setFLOW(flow: amount)
        let txResult = self.coa.call(
            to: self.recipientEVMAddress,
            data: data,
            gasLimit: gasLimit,
            value: valueBalance
        )
        assert(
            txResult.status == EVM.Status.failed || txResult.status == EVM.Status.successful,
            message: "evm_error=".concat(txResult.errorMessage)
        )
    }
}
`;
    let config = {
      cadence: code.trim(),
      name: "callContract",
      type: "transaction",
      args: (arg: any, t: any) => [
        arg(toEVMAddressHex, t.String),
        arg(amount, t.UFix64),
        arg(data, t.Array(t.UInt8)),
        arg(gasLimit, t.UInt64),
      ],
      limit: 9999,
    };
    config = await this.runRequestInterceptors(config);
    let txId = await fcl.mutate(config);
    const result = await this.runResponseInterceptors(config, txId);
    return result.response;
  }


  public async createCoa(amount: string) {
    const code = `
import FungibleToken from 0xFungibleToken
import FlowToken from 0xFlowToken
import EVM from 0xEVM


/// Creates a COA and saves it in the signer's Flow account & passing the given value of Flow into FlowEVM
transaction(amount: UFix64) {
    let sentVault: @FlowToken.Vault
    let auth: auth(IssueStorageCapabilityController, IssueStorageCapabilityController, PublishCapability, SaveValue, UnpublishCapability) &Account

    prepare(signer: auth(BorrowValue, IssueStorageCapabilityController, PublishCapability, SaveValue, UnpublishCapability) &Account) {
        let vaultRef = signer.storage.borrow<auth(FungibleToken.Withdraw) &FlowToken.Vault>(
                from: /storage/flowTokenVault
            ) ?? panic("Could not borrow reference to the owner's Vault!")

        self.sentVault <- vaultRef.withdraw(amount: amount) as! @FlowToken.Vault
        self.auth = signer
    }

    execute {
        let coa <- EVM.createCadenceOwnedAccount()
        coa.deposit(from: <-self.sentVault)

        log(coa.balance().inFLOW())
        let storagePath = StoragePath(identifier: "evm")!
        let publicPath = PublicPath(identifier: "evm")!
        self.auth.storage.save<@EVM.CadenceOwnedAccount>(<-coa, to: storagePath)
        let addressableCap = self.auth.capabilities.storage.issue<&EVM.CadenceOwnedAccount>(storagePath)
        self.auth.capabilities.unpublish(publicPath)
        self.auth.capabilities.publish(addressableCap, at: publicPath)
    }
}
`;
    let config = {
      cadence: code.trim(),
      name: "createCoa",
      type: "transaction",
      args: (arg: any, t: any) => [
        arg(amount, t.UFix64),
      ],
      limit: 9999,
    };
    config = await this.runRequestInterceptors(config);
    let txId = await fcl.mutate(config);
    const result = await this.runResponseInterceptors(config, txId);
    return result.response;
  }


  public async transferFlowToEvmAddress(recipientEVMAddressHex: string, amount: string, gasLimit: number) {
    const code = `
import FungibleToken from 0xFungibleToken
import FlowToken from 0xFlowToken
import EVM from 0xEVM

/// Transfers \$FLOW from the signer's account Cadence Flow balance to the recipient's hex-encoded EVM address.
/// Note that a COA must have a \$FLOW balance in EVM before transferring value to another EVM address.
///
transaction(recipientEVMAddressHex: String, amount: UFix64, gasLimit: UInt64) {

    let coa: auth(EVM.Withdraw, EVM.Call) &EVM.CadenceOwnedAccount
    let recipientEVMAddress: EVM.EVMAddress
    var sentVault: @FlowToken.Vault

    prepare(signer: auth(BorrowValue, SaveValue) &Account) {
        if signer.storage.type(at: /storage/evm) == nil {
            signer.storage.save(<-EVM.createCadenceOwnedAccount(), to: /storage/evm)
        }
        self.coa = signer.storage.borrow<auth(EVM.Withdraw, EVM.Call) &EVM.CadenceOwnedAccount>(from: /storage/evm)
            ?? panic("Could not borrow reference to the signer's bridged account")

        let vaultRef = signer.storage.borrow<auth(FungibleToken.Withdraw) &FlowToken.Vault>(
                from: /storage/flowTokenVault
            ) ?? panic("Could not borrow reference to the owner's Vault!")
        self.sentVault <- vaultRef.withdraw(amount: amount) as! @FlowToken.Vault

        self.recipientEVMAddress = EVM.addressFromString(recipientEVMAddressHex)
    }

    execute {
        self.coa.deposit(from: <-self.sentVault)
        
        let valueBalance = EVM.Balance(attoflow: 0)
        valueBalance.setFLOW(flow: amount)
        let txResult = self.coa.call(
            to: self.recipientEVMAddress,
            data: [],
            gasLimit: gasLimit,
            value: valueBalance
        )
        assert(
            txResult.status == EVM.Status.failed || txResult.status == EVM.Status.successful,
            message: "evm_error=".concat(txResult.errorMessage)
        )

    }
}
`;
    let config = {
      cadence: code.trim(),
      name: "transferFlowToEvmAddress",
      type: "transaction",
      args: (arg: any, t: any) => [
        arg(recipientEVMAddressHex, t.String),
        arg(amount, t.UFix64),
        arg(gasLimit, t.UInt64),
      ],
      limit: 9999,
    };
    config = await this.runRequestInterceptors(config);
    let txId = await fcl.mutate(config);
    const result = await this.runResponseInterceptors(config, txId);
    return result.response;
  }


  public async withdrawCoa(amount: string, address: string) {
    const code = `
import FungibleToken from 0xFungibleToken
import FlowToken from 0xFlowToken
import EVM from 0xEVM

transaction(amount: UFix64, address: Address) {
    let sentVault: @FlowToken.Vault

    prepare(signer: auth(Storage, EVM.Withdraw) &Account) {
        let coa = signer.storage.borrow<auth(EVM.Withdraw) &EVM.CadenceOwnedAccount>(
            from: /storage/evm
        ) ?? panic("Could not borrow reference to the COA!")
        let withdrawBalance = EVM.Balance(attoflow: 0)
        withdrawBalance.setFLOW(flow: amount)
        self.sentVault <- coa.withdraw(balance: withdrawBalance) as! @FlowToken.Vault
    }

    execute {
        let account = getAccount(address)
        let receiver = account.capabilities.borrow<&{FungibleToken.Receiver}>(/public/flowTokenReceiver)!
        receiver.deposit(from: <-self.sentVault)
    }
}
`;
    let config = {
      cadence: code.trim(),
      name: "withdrawCoa",
      type: "transaction",
      args: (arg: any, t: any) => [
        arg(amount, t.UFix64),
        arg(address, t.Address),
      ],
      limit: 9999,
    };
    config = await this.runRequestInterceptors(config);
    let txId = await fcl.mutate(config);
    const result = await this.runResponseInterceptors(config, txId);
    return result.response;
  }

  // Tag: SrcCadenceHybridcustodyScripts
  public async checkChildRecieveVaults(parent: string, child: string, path: string): Promise<boolean> {
    const code = `
import HybridCustody from 0xHybridCustody
import CapabilityFilter from 0xHybridCustody
import FungibleToken from 0xFungibleToken

access(all) fun main(parent: Address, child: Address, path: String): Bool {
  let account = getAuthAccount<auth(Storage) &Account>(parent)
  let manager = getAuthAccount<auth(Storage) &Account>(parent).storage.borrow<auth(HybridCustody.Manage) &HybridCustody.Manager>(from: HybridCustody.ManagerStoragePath) ?? panic ("manager does not exist")
  
  let receiverType = Type<&{FungibleToken.Receiver}>()

  let addr = getAuthAccount<auth(Storage, Capabilities) &Account>(child)
  
  let childAcct = manager.borrowAccount(addr: child) ?? panic("child account not found")

  let controllers = addr.capabilities.storage.getControllers(forPath: StoragePath(identifier: path)!)
  var flag = false

  for c in controllers {
    if !c.borrowType.isSubtype(of: receiverType) {
      continue
    }

    if let cap = childAcct.getCapability(controllerID: c.capabilityID, type: receiverType) {
      let providerCap = cap as! Capability<&{FungibleToken.Receiver}> 

      if !providerCap.check(){
        continue
      }

      flag = true
      break
    }
  }

  return flag
}
`;
    let config = {
      cadence: code.trim(),
      name: "checkChildRecieveVaults",
      type: "script",
      args: (arg: any, t: any) => [
        arg(parent, t.Address),
        arg(child, t.Address),
        arg(path, t.String),
      ],
      limit: 9999,
    };
    config = await this.runRequestInterceptors(config);
    let response = await fcl.query(config);
    const result = await this.runResponseInterceptors(config, response);
    return result.response;
  }


  public async getAccessibleChildAccountNfts(addr: string): Promise<any> {
    const code = `
import HybridCustody from 0xHybridCustody
import NonFungibleToken from 0xNonFungibleToken
import MetadataViews from 0xMetadataViews
import ViewResolver from 0xMetadataViews


access(all) fun main(addr: Address): AnyStruct {
  let manager = getAuthAccount<auth(Storage) &Account>(addr).storage.borrow<auth(HybridCustody.Manage) &HybridCustody.Manager>(from: HybridCustody.ManagerStoragePath) ?? panic ("manager does not exist")

  var typeIdsWithProvider = {} as {Address: [String]}

  // Address -> nft UUID -> Display
  var nftViews = {} as {Address: {String: [UInt64]}} 

  
  let providerType = Type<auth(NonFungibleToken.Withdraw) &{NonFungibleToken.Provider}>()
  let collectionType: Type = Type<@{NonFungibleToken.CollectionPublic}>()

  // Iterate through child accounts
  for address in manager.getChildAddresses() {
    let acct = getAuthAccount<auth(Storage, Capabilities) &Account>(address)
    let foundTypes: [String] = []
    let views: {String: [UInt64]} = {}
    let childAcct = manager.borrowAccount(addr: address) ?? panic("child account not found")
     
    // typeIdsWithProvider[address] = foundTypes

    acct.storage.forEachStored(fun (path: StoragePath, type: Type): Bool {

      let controllers = acct.capabilities.storage.getControllers(forPath: path!)
      for c in controllers {
        if !c.borrowType.isSubtype(of: providerType) {
          continue
        }

        if let cap = childAcct.getCapability(controllerID: c.capabilityID, type: providerType) {
          let providerCap = cap as! Capability<&{NonFungibleToken.Provider}> 

          if !providerCap.check(){
            continue
          }
          foundTypes.append(cap.borrow<&AnyResource>()!.getType().identifier)
        }
      }
      return true
    })

    typeIdsWithProvider[address] = foundTypes
    

    // iterate storage, check if typeIdsWithProvider contains the typeId, if so, add to views
    acct.storage.forEachStored(fun (path: StoragePath, type: Type): Bool {
      
      if typeIdsWithProvider[address] == nil {
        return true
      }

      for key in typeIdsWithProvider.keys {
        for idx, value in typeIdsWithProvider[key]! {
          let value = typeIdsWithProvider[key]!

          if value[idx] != type.identifier {
            continue
          } else {
            if type.isInstance(collectionType) {
              continue
            }
            if let collection = acct.storage.borrow<&{NonFungibleToken.CollectionPublic, ViewResolver.ResolverCollection}>(from: path) { 
              // Iterate over IDs & resolve the view
             
              for id in collection.getIDs() {
                let nft = collection.borrowNFT(id)!

                views[nft.getType().identifier] = collection.getIDs()
                break;
              }
            }
            continue
          }
        }
      }
      return true
    })
    nftViews[address] = views
  }
  return nftViews
}
`;
    let config = {
      cadence: code.trim(),
      name: "getAccessibleChildAccountNfts",
      type: "script",
      args: (arg: any, t: any) => [
        arg(addr, t.Address),
      ],
      limit: 9999,
    };
    config = await this.runRequestInterceptors(config);
    let response = await fcl.query(config);
    const result = await this.runResponseInterceptors(config, response);
    return result.response;
  }


  public async getAccessibleCoinInfo(parent: string, childAddress: string): Promise<TokenInfo[]> {
    const code = `
import HybridCustody from 0xHybridCustody
import MetadataViews from 0xMetadataViews
import FungibleToken from 0xFungibleToken
import NonFungibleToken from 0xNonFungibleToken

access(all) struct TokenInfo {
  access(all) let id: String
  access(all) let balance: UFix64

  init(id: String, balance: UFix64) {
    self.id = id
    self.balance = balance
  }
}

access(all) fun main(parent: Address, childAddress: Address): [TokenInfo] {
  let manager = getAuthAccount<auth(Storage) &Account>(parent).storage.borrow<auth(HybridCustody.Manage) &HybridCustody.Manager>(from: HybridCustody.ManagerStoragePath) ?? panic ("manager does not exist")

  var typeIdsWithProvider: {Address: [String]} = {}

  var coinInfoList: [TokenInfo] = []
  let providerType = Type<Capability<&{FungibleToken.Provider}>>() 
  let vaultType: Type = Type<@{FungibleToken.Vault}>()

  // Iterate through child accounts
  let acct = getAuthAccount<auth(Storage, Capabilities) &Account> (childAddress)
  let foundTypes: [String] = []
  let vaultBalances: {String: UFix64} = {}
  let childAcct = manager.borrowAccount(addr: childAddress) ?? panic("child account not found")
  
  // get all private paths
  acct.storage.forEachStored(fun (path: StoragePath, type: Type): Bool {
    // Check which private paths have NFT Provider AND can be borrowed
    if !type.isSubtype(of: providerType){
      return true
    }

    let controllers = acct.capabilities.storage.getControllers(forPath: path)

    for c in controllers {
      if !c.borrowType.isSubtype(of: providerType) {
        continue
      }

      if let cap = childAcct.getCapability(controllerID: c.capabilityID, type: providerType) {
        let providerCap = cap as! Capability<&{NonFungibleToken.Provider}> 

        if !providerCap.check(){
          continue
        }
        foundTypes.append(cap.borrow<&AnyResource>()!.getType().identifier)
      }
    }
    return true
  })
  typeIdsWithProvider[childAddress] = foundTypes

  acct.storage.forEachStored(fun (path: StoragePath, type: Type): Bool {
    if typeIdsWithProvider[childAddress] == nil {
      return true
    }

    for key in typeIdsWithProvider.keys {
      for idx, value in typeIdsWithProvider[key]! {
        let value = typeIdsWithProvider[key]!

        if value[idx] != type.identifier {
          continue
        } else {
          if type.isInstance(vaultType) {
            continue
          }
          if let vault = acct.storage.borrow<&{FungibleToken.Balance}>(from: path) { 
            // Iterate over IDs & resolve the view
            coinInfoList.append(
              TokenInfo(id: type.identifier, balance: vault.balance)
            )
          }
          continue
        }
      }
    }
    return true
  })

  return coinInfoList
}
`;
    let config = {
      cadence: code.trim(),
      name: "getAccessibleCoinInfo",
      type: "script",
      args: (arg: any, t: any) => [
        arg(parent, t.Address),
        arg(childAddress, t.Address),
      ],
      limit: 9999,
    };
    config = await this.runRequestInterceptors(config);
    let response = await fcl.query(config);
    const result = await this.runResponseInterceptors(config, response);
    return result.response;
  }


  public async getAccessibleCollectionAndIdsDisplay(parent: string, childAccount: string): Promise<NFTCollection[]> {
    const code = `
import HybridCustody from 0xHybridCustody
import MetadataViews from 0xMetadataViews
import ViewResolver from 0xMetadataViews
import FungibleToken from 0xFungibleToken
import NonFungibleToken from 0xNonFungibleToken


access(all) struct CollectionDisplay {
  access(all) let name: String
  access(all) let squareImage: MetadataViews.Media

  init(name: String, squareImage: MetadataViews.Media) {
    self.name = name
    self.squareImage = squareImage
  }
}

access(all) struct NFTCollection {
  access(all) let id: String
  access(all) let display: CollectionDisplay?
  access(all) let idList: [UInt64]

  init(id:String, display: CollectionDisplay?, idList: [UInt64]) {
    self.id = id
    self.display = display
    self.idList = idList
  }
}

access(all) fun getDisplay(address: Address, path: StoragePath): CollectionDisplay? {
  let account = getAuthAccount<auth(Storage, Capabilities) &Account>(address)

  let resourceType = Type<@AnyResource>()
  // let vaultType = Type<@{FungibleToken.Vault}>()
  let collectionType = Type<@{NonFungibleToken.Collection}>()
  let metadataViewType = Type<&{ViewResolver.ResolverCollection}>()
  var item: CollectionDisplay? =  nil

    if let type = account.storage.type(at: path) {
      let isResource = type.isSubtype(of: resourceType)
      let isNFTCollection = type.isSubtype(of: collectionType)
      let conformedMetadataViews = type.isSubtype(of: metadataViewType)

      var tokenIDs: [UInt64] = []
      if isNFTCollection && conformedMetadataViews {
        if let collectionRef = account.storage.borrow<&{ViewResolver.ResolverCollection, NonFungibleToken.CollectionPublic}>(from: path) {
          tokenIDs = collectionRef.getIDs()

          // TODO: move to a list
          if tokenIDs.length > 0 
          && path != /storage/RaribleNFTCollection 
          && path != /storage/ARTIFACTPackV3Collection
          && path != /storage/ArleeScene {
            let resolver = collectionRef.borrowViewResolver(id: tokenIDs[0])!
            if let display = MetadataViews.getNFTCollectionDisplay(resolver) {
              item = CollectionDisplay(
                name: display.name,
                squareImage: display.squareImage
              )
            }
          }
        }
      }
    }

  return item
}

access(all) fun main(parent: Address, childAccount: Address): [NFTCollection] {
    let manager =  getAuthAccount<auth(Storage) &Account>(parent).storage.borrow<auth(HybridCustody.Manage) &HybridCustody.Manager>(from: HybridCustody.ManagerStoragePath) ?? panic ("manager does not exist")

    // Address -> Collection Type -> ownedNFTs

    let providerType = Type<Capability<&{NonFungibleToken.Provider}>>()
    let collectionType: Type = Type<@{NonFungibleToken.CollectionPublic}>()

    // Iterate through child accounts

    let acct = getAuthAccount<auth(Storage, Capabilities) &Account>(childAccount)
    let foundTypes: [Type] = []
    let nfts: {String: [UInt64]} = {}
    let collectionList: [NFTCollection] = []
    let childAcct = manager.borrowAccount(addr: childAccount) ?? panic("child account not found")
    
    // get all private paths
    acct.storage.forEachStored(fun (path: StoragePath, type: Type): Bool {
        // Check which private paths have NFT Provider AND can be borrowed
        // if !type.isSubtype(of: providerType){
        //     return true
        // }
        // if let cap = childAcct.getCapability(path: path, type: Type<&{NonFungibleToken.Provider}>()) {
        //     let providerCap = cap as! Capability<&{NonFungibleToken.Provider}> 

        //     if !providerCap.check(){
        //         // if this isn't a provider capability, exit the account iteration function for this path
        //         return true
        //     }
        //     foundTypes.append(cap.borrow<&AnyResource>()!.getType())
        // }

        let controllers = acct.capabilities.storage.getControllers(forPath: path!)
        for c in controllers {
          if !c.borrowType.isSubtype(of: providerType) {
            continue
          }

          if let cap = childAcct.getCapability(controllerID: c.capabilityID, type: providerType) {
            let providerCap = cap as! Capability<&{NonFungibleToken.Provider}> 

            if !providerCap.check(){
              continue
            }
            foundTypes.append(cap.borrow<&AnyResource>()!.getType())
          }
        }
        return true
    })

    // iterate storage, check if typeIdsWithProvider contains the typeId, if so, add to nfts
    acct.storage.forEachStored(fun (path: StoragePath, type: Type): Bool {

        if foundTypes == nil {
            return true
        }

        for idx, value in foundTypes {
            let value = foundTypes!

            if value[idx] != type {
                continue
            } else {
                if type.isInstance(collectionType) {
                    continue
                }
                if let collection = acct.storage.borrow<&{NonFungibleToken.CollectionPublic}>(from: path) { 
                    nfts.insert(key: type.identifier, collection.getIDs())
                    collectionList.append(
                      NFTCollection(
                        id: type.identifier,
                        display: getDisplay(address: childAccount, path: path),
                        idList: collection.getIDs()
                      )
                    )
                }
                continue
            }
        }
        return true
    })

    return collectionList
}
`;
    let config = {
      cadence: code.trim(),
      name: "getAccessibleCollectionAndIdsDisplay",
      type: "script",
      args: (arg: any, t: any) => [
        arg(parent, t.Address),
        arg(childAccount, t.Address),
      ],
      limit: 9999,
    };
    config = await this.runRequestInterceptors(config);
    let response = await fcl.query(config);
    const result = await this.runResponseInterceptors(config, response);
    return result.response;
  }


  public async getChildAccountAllowTypes(addr: string, child: string): Promise<string[]| undefined> {
    const code = `
import HybridCustody from 0xHybridCustody
import NonFungibleToken from 0xNonFungibleToken
import FungibleToken from 0xFungibleToken

// This script iterates through a parent's child accounts, 
// identifies private paths with an accessible NonFungibleToken.Provider, and returns the corresponding typeIds
access(all) fun main(addr: Address, child: Address): [String]? {
  let account = getAuthAccount<auth(Storage) &Account>(addr)
  let manager = getAuthAccount<auth(Storage) &Account>(addr).storage.borrow<auth(HybridCustody.Manage) &HybridCustody.Manager>(from: HybridCustody.ManagerStoragePath) ?? panic ("manager does not exist")


  
  let nftProviderType = Type<auth(NonFungibleToken.Withdraw) &{NonFungibleToken.Provider}>()
  let ftProviderType = Type<auth(FungibleToken.Withdraw) &{FungibleToken.Provider}>()

  // Iterate through child accounts
  let addr = getAuthAccount<auth(Storage, Capabilities) &Account>(child)
  let foundTypes: [String] = []
  let childAcct = manager.borrowAccount(addr: child) ?? panic("child account not found")
  // get all private paths

  for s in addr.storage.storagePaths {
    let controllers = addr.capabilities.storage.getControllers(forPath: s)
    for c in controllers {
      // if !c.borrowType.isSubtype(of: providerType) {
      //   continue
      // }

      if let nftCap = childAcct.getCapability(controllerID: c.capabilityID, type: nftProviderType) {
        let providerCap = nftCap as! Capability<auth(NonFungibleToken.Withdraw) &{NonFungibleToken.Provider}> 

        if !providerCap.check(){
          continue
        }

        foundTypes.append(nftCap.borrow<&AnyResource>()!.getType().identifier)
        break
      }
      if let ftCap = childAcct.getCapability(controllerID: c.capabilityID, type: ftProviderType) {
        let providerCap = ftCap as! Capability<&{FungibleToken.Provider}> 

        if !providerCap.check(){
          continue
        }

        foundTypes.append(ftCap.borrow<&AnyResource>()!.getType().identifier)
        break
      }
    }
  }

  return foundTypes
}
`;
    let config = {
      cadence: code.trim(),
      name: "getChildAccountAllowTypes",
      type: "script",
      args: (arg: any, t: any) => [
        arg(addr, t.Address),
        arg(child, t.Address),
      ],
      limit: 9999,
    };
    config = await this.runRequestInterceptors(config);
    let response = await fcl.query(config);
    const result = await this.runResponseInterceptors(config, response);
    return result.response;
  }


  public async getChildAccountFtCapabilities(addr: string): Promise<any> {
    const code = `
import HybridCustody from 0xHybridCustody
import FungibleToken from 0xFungibleToken


access(all) fun main(addr: Address):AnyStruct {
  let account = getAuthAccount<auth(Storage) &Account>(addr)
  let manager = getAuthAccount<auth(Storage) &Account>(addr).storage.borrow<auth(HybridCustody.Manage) &HybridCustody.Manager>(from: HybridCustody.ManagerStoragePath)
    ?? panic ("manager does not exist")

  var typeIdsWithProvider: {Address: [String]} = {}
  
  let providerType = Type<auth(FungibleToken.Withdraw) &{FungibleToken.Provider}>()

  // Iterate through child accounts
  for address in manager.getChildAddresses() {
    let addr = getAuthAccount<auth(Storage, Capabilities) &Account>(address)
    let foundTypes: [String] = []
    let childAcct = manager.borrowAccount(addr: address) ?? panic("child account not found")
    // get all private paths

    for s in addr.storage.storagePaths {
      for c in addr.capabilities.storage.getControllers(forPath: s) {
        if !c.borrowType.isSubtype(of: providerType){
          continue
        }

        if let cap = childAcct.getCapability(controllerID: c.capabilityID, type: providerType) {
          let providerCap = cap as! Capability<&{FungibleToken.Provider}> 

          if !providerCap.check(){
            continue
          }

          foundTypes.append(cap.borrow<&AnyResource>()!.getType().identifier)
          typeIdsWithProvider[address] = foundTypes
          break
        }
      }
    }      
  }

  return typeIdsWithProvider
}
`;
    let config = {
      cadence: code.trim(),
      name: "getChildAccountFtCapabilities",
      type: "script",
      args: (arg: any, t: any) => [
        arg(addr, t.Address),
      ],
      limit: 9999,
    };
    config = await this.runRequestInterceptors(config);
    let response = await fcl.query(config);
    const result = await this.runResponseInterceptors(config, response);
    return result.response;
  }


  public async getChildAccountMeta(parent: string): Promise<Record<string, any>> {
    const code = `
import HybridCustody from 0xHybridCustody
import MetadataViews from 0xMetadataViews

access(all) fun main(parent: Address): {Address: AnyStruct} {
  let acct = getAuthAccount<auth(Storage) &Account>(parent)
  let m = acct.storage.borrow<&HybridCustody.Manager>(from: HybridCustody.ManagerStoragePath)

  if m == nil {
    return {}
  } else {
    var data: {Address: AnyStruct} = {}
    for address in m?.getChildAddresses()! {
      let c = m?.getChildAccountDisplay(address: address) 
      data.insert(key: address, c)
    }
    return data
  }
}
`;
    let config = {
      cadence: code.trim(),
      name: "getChildAccountMeta",
      type: "script",
      args: (arg: any, t: any) => [
        arg(parent, t.Address),
      ],
      limit: 9999,
    };
    config = await this.runRequestInterceptors(config);
    let response = await fcl.query(config);
    const result = await this.runResponseInterceptors(config, response);
    return result.response;
  }


  public async getChildAddresses(parent: string): Promise<string[]> {
    const code = `
import HybridCustody from 0xHybridCustody

access(all) fun main(parent: Address): [Address] {
  let acct = getAuthAccount<auth(Storage) &Account>(parent)
  let manager = acct.storage.borrow<&HybridCustody.Manager>(from: HybridCustody.ManagerStoragePath)
    ?? panic("manager not found")
  return  manager.getChildAddresses()
}
`;
    let config = {
      cadence: code.trim(),
      name: "getChildAddresses",
      type: "script",
      args: (arg: any, t: any) => [
        arg(parent, t.Address),
      ],
      limit: 9999,
    };
    config = await this.runRequestInterceptors(config);
    let response = await fcl.query(config);
    const result = await this.runResponseInterceptors(config, response);
    return result.response;
  }

  // Tag: SrcCadenceHybridcustodyTransactions
  public async batchBridgeChildNftFromEvmWithPayer(nftIdentifier: string, child: string, ids: string[]) {
    const code = `
import MetadataViews from 0xMetadataViews
import ViewResolver from 0xMetadataViews
import NonFungibleToken from 0xNonFungibleToken
import FungibleToken from 0xFungibleToken
import FlowToken from 0xFlowToken
import FungibleTokenMetadataViews from 0xFungibleToken
import ScopedFTProviders from 0xFlowEVMBridge
import EVM from 0xEVM
import FlowEVMBridgeUtils from 0xFlowEVMBridge
import FlowEVMBridge from 0xFlowEVMBridge
import FlowEVMBridgeConfig from 0xFlowEVMBridge
import HybridCustody from 0xHybridCustody
import CapabilityFilter from 0xCapabilityFilter
import CrossVMMetadataViews from 0xCrossVMMetadataViews

transaction(nftIdentifier: String, child: Address, ids: [UInt256]) {

    prepare(signer: auth(BorrowValue, CopyValue, IssueStorageCapabilityController, PublishCapability, SaveValue, UnpublishCapability) &Account, payer: auth(BorrowValue, CopyValue, IssueStorageCapabilityController, PublishCapability, SaveValue, UnpublishCapability) &Account) {
        /* --- Reference the signer's CadenceOwnedAccount --- */
        //
        // Borrow a reference to the signer's COA
        let coa = signer.storage.borrow<auth(EVM.Call, EVM.Bridge) &EVM.CadenceOwnedAccount>(from: /storage/evm)
            ?? panic("Could not borrow COA from provided gateway address")

        // Construct the NFT type from the provided identifier
        let nftType = CompositeType(nftIdentifier)
            ?? panic("Could not construct NFT type from identifier: ".concat(nftIdentifier))
        let nftContractAddress = FlowEVMBridgeUtils.getContractAddress(fromType: nftType)
            ?? panic("Could not get contract address from identifier: ".concat(nftIdentifier))
        let nftContractName = FlowEVMBridgeUtils.getContractName(fromType: nftType)
            ?? panic("Could not get contract name from identifier: ".concat(nftIdentifier))

        let m = signer.storage.borrow<auth(HybridCustody.Manage) &HybridCustody.Manager>(from: HybridCustody.ManagerStoragePath)
            ?? panic("manager does not exist")
        let childAcct = m.borrowAccount(addr: child) ?? panic("child account not found")

        /* --- Retrieve the NFT --- */
        //
        // Borrow a reference to the NFT collection, configuring if necessary
        let viewResolver = getAccount(nftContractAddress).contracts.borrow<&{ViewResolver}>(name: nftContractName)
            ?? panic("Could not borrow ViewResolver from NFT contract")
        let collectionData = viewResolver.resolveContractView(
                resourceType: nil,
                viewType: Type<MetadataViews.NFTCollectionData>()
            ) as! MetadataViews.NFTCollectionData? ?? panic("Could not resolve NFTCollectionData view")

        let capType = Type<&{NonFungibleToken.CollectionPublic}>()
        let controllerID = childAcct.getControllerIDForType(type: capType, forPath: collectionData.storagePath)
            ?? panic("no controller found for capType")

        let cap = childAcct.getCapability(controllerID: controllerID, type: capType) ?? panic("no cap found")
        let publicCap = cap as! Capability<&{NonFungibleToken.CollectionPublic}>
        assert(publicCap.check(), message: "invalid public capability")

        // Get a reference to the child's stored vault
        let collectionRef = publicCap.borrow()!

        // Calculate the approximate fee for the bridge
        let approxFee = FlowEVMBridgeUtils.calculateBridgeFee(bytes: 400_000) + (FlowEVMBridgeConfig.baseFee * UFix64(ids.length))

        /* --- Configure a ScopedFTProvider --- */
        //
        // Issue and store bridge-dedicated Provider Capability in storage if necessary
        if payer.storage.type(at: FlowEVMBridgeConfig.providerCapabilityStoragePath) == nil {
            let providerCap = payer.capabilities.storage.issue<auth(FungibleToken.Withdraw) &{FungibleToken.Provider}>(
                /storage/flowTokenVault
            )
            payer.storage.save(providerCap, to: FlowEVMBridgeConfig.providerCapabilityStoragePath)
        }
        // Copy the stored Provider capability and create a ScopedFTProvider
        let providerCapCopy = payer.storage.copy<Capability<auth(FungibleToken.Withdraw) &{FungibleToken.Provider}>>(
                from: FlowEVMBridgeConfig.providerCapabilityStoragePath
            ) ?? panic("Invalid Provider Capability found in storage.")
        let providerFilter = ScopedFTProviders.AllowanceFilter(approxFee)
        let scopedProvider <- ScopedFTProviders.createScopedFTProvider(
                provider: providerCapCopy,
                filters: [ providerFilter ],
                expiration: getCurrentBlock().timestamp + 1.0
            )

        // Unwrap NFTs if applicable
        unwrapNFTsIfApplicable(coa, nftIDs: ids, nftType: nftType, viewResolver: viewResolver)

        // Bridge NFTs from EVM to child flow account
        for id in ids {
            let nft: @{NonFungibleToken.NFT} <- coa.withdrawNFT(
                type: nftType,
                id: id,
                feeProvider: &scopedProvider as auth(FungibleToken.Withdraw) &{FungibleToken.Provider}
            )

            assert(
                nft.getType() == nftType,
                message: "Bridged nft type mismatch - requested: ".concat(nftType.identifier)
                    .concat(", received: ").concat(nft.getType().identifier)
            )

            collectionRef.deposit(token: <- nft)
        }

        // Destroy the ScopedFTProvider
        destroy scopedProvider
    }
}

/// Unwraps NFTs from a project's custom ERC721 wrapper contract to bridged NFTs on EVM, if applicable.
/// Enables projects to use their own ERC721 contract while leveraging the bridge's underlying contract,
/// until direct custom contract support is added to the bridge.
///
/// @param coa: The COA of the signer
/// @param nftIDs: The IDs of the NFTs to wrap
/// @param nftType: The type of the NFTs to wrap
/// @param viewResolver: The ViewResolver of the NFT contract
///
access(all) fun unwrapNFTsIfApplicable(
    _ coa: auth(EVM.Call) &EVM.CadenceOwnedAccount,
    nftIDs: [UInt256],
    nftType: Type,
    viewResolver: &{ViewResolver}
) {
    // Get the project-defined ERC721 address if it exists
    if let crossVMPointer = viewResolver.resolveContractView(
            resourceType: nftType,
            viewType: Type<CrossVMMetadataViews.EVMPointer>()
    ) as! CrossVMMetadataViews.EVMPointer? {
        // Get the underlying ERC721 address if it exists
        if let underlyingAddress = getUnderlyingERC721Address(coa, crossVMPointer.evmContractAddress) {
            for id in nftIDs {
                // Unwrap NFT if it is wrapped
                if isNFTWrapped(coa,
                    nftID: id,
                    underlying: underlyingAddress,
                    wrapper: crossVMPointer.evmContractAddress
                ) {
                    let res = mustCall(coa, crossVMPointer.evmContractAddress,
                        functionSig: "withdrawTo(address,uint256[])",
                        args: [coa.address(), [id]]
                    )
                    let decodedRes = EVM.decodeABI(types: [Type<Bool>()], data: res.data)
                    assert(decodedRes.length == 1, message: "Invalid response length")
                    assert(decodedRes[0] as! Bool, message: "Failed to unwrap NFT")
                }
            }
        }
    }
}

/// Gets the underlying ERC721 address if it exists (i.e. if the ERC721 is a wrapper)
///
access(all) fun getUnderlyingERC721Address(
    _ coa: auth(EVM.Call) &EVM.CadenceOwnedAccount,
    _ wrapperAddress: EVM.EVMAddress
): EVM.EVMAddress? {
    let res = coa.call(
        to: wrapperAddress,
        data: EVM.encodeABIWithSignature("underlying()", []),
        gasLimit: 100_000,
        value: EVM.Balance(attoflow: 0)
    )

    // If the call fails, return nil
    if res.status != EVM.Status.successful || res.data.length == 0 {
        return nil
    }

    // Decode and return the underlying ERC721 address
    let decodedResult = EVM.decodeABI(
        types: [Type<EVM.EVMAddress>()],
        data: res.data
    )
    assert(decodedResult.length == 1, message: "Invalid response length")
    return decodedResult[0] as! EVM.EVMAddress
}

/// Checks if the provided NFT is wrapped in the underlying ERC721 contract
///
access(all) fun isNFTWrapped(
    _ coa: auth(EVM.Call) &EVM.CadenceOwnedAccount,
    nftID: UInt256,
    underlying: EVM.EVMAddress,
    wrapper: EVM.EVMAddress
): Bool {
    let res = coa.call(
        to: underlying,
        data: EVM.encodeABIWithSignature("ownerOf(uint256)", [nftID]),
        gasLimit: 100_000,
        value: EVM.Balance(attoflow: 0)
    )

    // If the call fails, return false
    if res.status != EVM.Status.successful || res.data.length == 0{
        return false
    }

    // Decode and compare the addresses
    let decodedResult = EVM.decodeABI(
        types: [Type<EVM.EVMAddress>()],
        data: res.data
    )
    assert(decodedResult.length == 1, message: "Invalid response length")
    let owner = decodedResult[0] as! EVM.EVMAddress
    return owner.toString() == wrapper.toString()
}

/// Calls a function on an EVM contract from provided coa
///
access(all) fun mustCall(
    _ coa: auth(EVM.Call) &EVM.CadenceOwnedAccount,
    _ contractAddr: EVM.EVMAddress,
    functionSig: String,
    args: [AnyStruct]
): EVM.Result {
    let res = coa.call(
        to: contractAddr,
        data: EVM.encodeABIWithSignature(functionSig, args),
        gasLimit: 4_000_000,
        value: EVM.Balance(attoflow: 0)
    )

    assert(res.status == EVM.Status.successful,
        message: "Failed to call '".concat(functionSig)
            .concat("\\n\\t error code: ").concat(res.errorCode.toString())
            .concat("\\n\\t error message: ").concat(res.errorMessage)
            .concat("\\n\\t gas used: ").concat(res.gasUsed.toString())
            .concat("\\n\\t caller address: 0x").concat(coa.address().toString())
            .concat("\\n\\t contract address: 0x").concat(contractAddr.toString())
    )

    return res
}
`;
    let config = {
      cadence: code.trim(),
      name: "batchBridgeChildNftFromEvmWithPayer",
      type: "transaction",
      args: (arg: any, t: any) => [
        arg(nftIdentifier, t.String),
        arg(child, t.Address),
        arg(ids, t.Array(t.UInt256)),
      ],
      limit: 9999,
    };
    config = await this.runRequestInterceptors(config);
    let txId = await fcl.mutate(config);
    const result = await this.runResponseInterceptors(config, txId);
    return result.response;
  }


  public async batchBridgeChildNftToEvmAddressWithPayer(nftIdentifier: string, child: string, ids: number[], recipient: string) {
    const code = `
import MetadataViews from 0xMetadataViews
import ViewResolver from 0xMetadataViews
import NonFungibleToken from 0xNonFungibleToken
import FungibleToken from 0xFungibleToken
import FlowToken from 0xFlowToken
import FungibleTokenMetadataViews from 0xFungibleToken
import ScopedFTProviders from 0xFlowEVMBridge
import EVM from 0xEVM
import FlowEVMBridgeUtils from 0xFlowEVMBridge
import FlowEVMBridge from 0xFlowEVMBridge
import FlowEVMBridgeConfig from 0xFlowEVMBridge
import HybridCustody from 0xHybridCustody
import CapabilityFilter from 0xCapabilityFilter
import CrossVMMetadataViews from 0xCrossVMMetadataViews

transaction(nftIdentifier: String, child: Address, ids: [UInt64], recipient:String) {
    let coa: auth(EVM.Call) &EVM.CadenceOwnedAccount

    prepare(signer: auth(CopyValue, BorrowValue, IssueStorageCapabilityController, Capabilities, SaveValue) &Account, payer: auth(BorrowValue, CopyValue, IssueStorageCapabilityController, PublishCapability, SaveValue, UnpublishCapability) &Account) {
        // Retrieve or create COA
        if let coa = signer.storage.borrow<auth(EVM.Call) &EVM.CadenceOwnedAccount>(from: /storage/evm) {
            self.coa = coa
        } else {
            signer.storage.save<@EVM.CadenceOwnedAccount>(<- EVM.createCadenceOwnedAccount(), to: /storage/evm)
            signer.capabilities.publish(
                signer.capabilities.storage.issue<&EVM.CadenceOwnedAccount>(/storage/evm),
                at: /public/evm
            )
            self.coa = signer.storage.borrow<auth(EVM.Call) &EVM.CadenceOwnedAccount>(from: /storage/evm)!
        }

        // Retrieve or create child account
        let m = signer.storage.borrow<auth(HybridCustody.Manage) &HybridCustody.Manager>(from: HybridCustody.ManagerStoragePath)
            ?? panic("manager does not exist")
        let childAcct = m.borrowAccount(addr: child) ?? panic("child account not found")

         // Construct the NFT type from the provided identifier
        let nftType = CompositeType(nftIdentifier)
            ?? panic("Could not construct NFT type from identifier: ".concat(nftIdentifier))
        let nftContractAddress = FlowEVMBridgeUtils.getContractAddress(fromType: nftType)
            ?? panic("Could not get contract address from identifier: ".concat(nftIdentifier))
        let nftContractName = FlowEVMBridgeUtils.getContractName(fromType: nftType)
            ?? panic("Could not get contract name from identifier: ".concat(nftIdentifier))

        /* --- Retrieve the NFT --- */
        //
        // Borrow a reference to the NFT collection, configuring if necessary
        let viewResolver = getAccount(nftContractAddress).contracts.borrow<&{ViewResolver}>(name: nftContractName)
            ?? panic("Could not borrow ViewResolver from NFT contract")
        let collectionData = viewResolver.resolveContractView(
                resourceType: nil,
                viewType: Type<MetadataViews.NFTCollectionData>()
            ) as! MetadataViews.NFTCollectionData? ?? panic("Could not resolve NFTCollectionData view")
        var collection = signer.storage.borrow<auth(NonFungibleToken.Withdraw) &{NonFungibleToken.Collection}>(
                from: collectionData.storagePath
            )

        // Create collection if it doesn't exist
        if collection == nil {
            signer.storage.save(<- collectionData.createEmptyCollection(), to: collectionData.storagePath)
            signer.capabilities.unpublish(collectionData.publicPath)
            signer.capabilities.publish(
                signer.capabilities.storage.issue<&{NonFungibleToken.Collection}>(collectionData.storagePath),
                at: collectionData.publicPath
            )

            // Borrow authorized withdraw reference to the signer's collection
            collection = signer.storage.borrow<auth(NonFungibleToken.Withdraw) &{NonFungibleToken.Collection}>(
                from: collectionData.storagePath
            )!
        }

        let capType = Type<auth(NonFungibleToken.Withdraw) &{NonFungibleToken.Provider}>()
        let controllerID = childAcct.getControllerIDForType(type: capType, forPath: collectionData.storagePath)
            ?? panic("no controller found for capType")

        let cap = childAcct.getCapability(controllerID: controllerID, type: capType) ?? panic("no cap found")
        let providerCap = cap as! Capability<auth(NonFungibleToken.Withdraw) &{NonFungibleToken.Provider}>
        assert(providerCap.check(), message: "invalid provider capability")

        let id = ids[0]
        // Get a reference to the child's stored vault
        let collectionRef = providerCap.borrow()!
        let childNft <- collectionRef.withdraw(withdrawID: id)
        collection!.deposit(token: <-childNft)
        // // Withdraw tokens from the signer's stored vault
        let currentStorageUsage = signer.storage.used
        let nft <- collection!.withdraw(withdrawID: id)
        let withdrawnStorageUsage = signer.storage.used
        let approxFee =FlowEVMBridgeUtils.calculateBridgeFee(
                bytes: 400_000
            ) + (FlowEVMBridgeConfig.baseFee * UFix64(ids.length))

        /* --- Configure a ScopedFTProvider --- */
        //
        // Issue and store bridge-dedicated Provider Capability in storage if necessary
        if payer.storage.type(at: FlowEVMBridgeConfig.providerCapabilityStoragePath) == nil {
            let providerCap = payer.capabilities.storage.issue<auth(FungibleToken.Withdraw) &{FungibleToken.Provider}>(
                /storage/flowTokenVault
            )
            payer.storage.save(providerCap, to: FlowEVMBridgeConfig.providerCapabilityStoragePath)
        }
        // Copy the stored Provider capability and create a ScopedFTProvider
        let providerCapCopy = payer.storage.copy<Capability<auth(FungibleToken.Withdraw) &{FungibleToken.Provider}>>(
                from: FlowEVMBridgeConfig.providerCapabilityStoragePath
            ) ?? panic("Invalid Provider Capability found in storage.")
        let providerFilter = ScopedFTProviders.AllowanceFilter(approxFee)
        let scopedProvider <- ScopedFTProviders.createScopedFTProvider(
                provider: providerCapCopy,
                filters: [ providerFilter ],
                expiration: getCurrentBlock().timestamp + 1.0
            )

        self.coa.depositNFT(
            nft: <- nft,
            feeProvider: &scopedProvider as auth(FungibleToken.Withdraw) &{FungibleToken.Provider}
        )

        var idx = 0
        for nftId in ids {
            if idx == 0 {
                idx = idx + 1
                continue
            }

            self.coa.depositNFT(
                nft: <- collectionRef.withdraw(withdrawID: nftId),
                feeProvider: &scopedProvider as auth(FungibleToken.Withdraw) &{FungibleToken.Provider}
            )
            idx = idx + 1
        }
        // Destroy the ScopedFTProvider
        destroy scopedProvider

        // Wrap and transfer NFTs if applicable
        wrapAndTransferNFTsIfApplicable(self.coa,
            nftIDs: ids,
            nftType: nftType,
            viewResolver: viewResolver,
            recipientIfNotCoa: EVM.addressFromString(recipient)
        )
    }

}

/// Wraps and transfers bridged NFTs into a project's custom ERC721 wrapper contract on EVM, if applicable.
/// Enables projects to use their own ERC721 contract while leveraging the bridge's underlying contract,
/// until direct custom contract support is added to the bridge.
///
/// @param coa: The COA of the signer
/// @param nftIDs: The IDs of the NFTs to wrap
/// @param nftType: The type of the NFTs to wrap
/// @param viewResolver: The ViewResolver of the NFT contract
/// @param recipientIfNotCoa: The EVM address to transfer the wrapped NFTs to, nil if the NFTs should stay in signer's COA
///
access(all) fun wrapAndTransferNFTsIfApplicable(
    _ coa: auth(EVM.Call) &EVM.CadenceOwnedAccount,
    nftIDs: [UInt64],
    nftType: Type,
    viewResolver: &{ViewResolver},
    recipientIfNotCoa: EVM.EVMAddress?
) {
    // Get the project-defined ERC721 address if it exists
    if let crossVMPointer = viewResolver.resolveContractView(
            resourceType: nftType,
            viewType: Type<CrossVMMetadataViews.EVMPointer>()
    ) as! CrossVMMetadataViews.EVMPointer? {
        // Get the underlying ERC721 address if it exists
        if let underlyingAddress = getUnderlyingERC721Address(coa, crossVMPointer.evmContractAddress) {
            // Wrap NFTs if underlying ERC721 address matches bridge's associated address for NFT type
            if underlyingAddress.equals(FlowEVMBridgeConfig.getEVMAddressAssociated(with: nftType)!) {
                // Approve contract to withdraw underlying NFTs from signer's coa
                mustCall(coa, underlyingAddress,
                    functionSig: "setApprovalForAll(address,bool)",
                    args: [crossVMPointer.evmContractAddress, true]
                )

                // Wrap NFTs with provided IDs, and check if the call was successful
                let res = mustCall(coa, crossVMPointer.evmContractAddress,
                    functionSig: "depositFor(address,uint256[])",
                    args: [coa.address(), nftIDs]
                )
                let decodedRes = EVM.decodeABI(types: [Type<Bool>()], data: res.data)
                assert(decodedRes.length == 1, message: "Invalid response length")
                assert(decodedRes[0] as! Bool, message: "Failed to wrap NFTs")

                // Transfer NFTs to recipient if provided
                if let to = recipientIfNotCoa {
                    mustTransferNFTs(coa, crossVMPointer.evmContractAddress, nftIDs: nftIDs, to: to)
                }

                // Revoke approval for contract to withdraw underlying NFTs from signer's coa
                mustCall(coa, underlyingAddress,
                    functionSig: "setApprovalForAll(address,bool)",
                    args: [crossVMPointer.evmContractAddress, false]
                )
            }
        }
    }
}

/// Gets the underlying ERC721 address if it exists (i.e. if the ERC721 is a wrapper)
///
access(all) fun getUnderlyingERC721Address(
    _ coa: auth(EVM.Call) &EVM.CadenceOwnedAccount,
    _ wrapperAddress: EVM.EVMAddress
): EVM.EVMAddress? {
    let res = coa.call(
        to: wrapperAddress,
        data: EVM.encodeABIWithSignature("underlying()", []),
        gasLimit: 100_000,
        value: EVM.Balance(attoflow: 0)
    )

    // If the call fails, return nil
    if res.status != EVM.Status.successful || res.data.length == 0 {
        return nil
    }

    // Decode and return the underlying ERC721 address
    let decodedResult = EVM.decodeABI(
        types: [Type<EVM.EVMAddress>()],
        data: res.data
    )
    assert(decodedResult.length == 1, message: "Invalid response length")
    return decodedResult[0] as! EVM.EVMAddress
}

/// Checks if the provided NFT is owned by the provided EVM address
///
access(all) fun isOwner(
    _ coa: auth(EVM.Call) &EVM.CadenceOwnedAccount,
    _ erc721Address: EVM.EVMAddress,
    _ nftID: UInt64,
    _ ownerToCheck: EVM.EVMAddress
): Bool {
    let res = coa.call(
        to: erc721Address,
        data: EVM.encodeABIWithSignature("ownerOf(uint256)", [nftID]),
        gasLimit: 100_000,
        value: EVM.Balance(attoflow: 0)
    )
    assert(res.status == EVM.Status.successful, message: "Call to ERC721.ownerOf(uint256) failed")
    let decodedRes = EVM.decodeABI(types: [Type<EVM.EVMAddress>()], data: res.data)
    if decodedRes.length == 1 {
        let actualOwner = decodedRes[0] as! EVM.EVMAddress
        return actualOwner.equals(ownerToCheck)
    }
    return false
}

/// Transfers NFTs from the provided COA to the provided EVM address
///
access(all) fun mustTransferNFTs(
    _ coa: auth(EVM.Call) &EVM.CadenceOwnedAccount,
    _ erc721Address: EVM.EVMAddress,
    nftIDs: [UInt64],
    to: EVM.EVMAddress
) {
    for id in nftIDs {
        assert(isOwner(coa, erc721Address, id, coa.address()), message: "NFT not owned by signer's COA")
        mustCall(coa, erc721Address,
            functionSig: "safeTransferFrom(address,address,uint256)",
            args: [coa.address(), to, id]
        )
        assert(isOwner(coa, erc721Address, id, to), message: "NFT not transferred to recipient")
    }
}

/// Calls a function on an EVM contract from provided coa
///
access(all) fun mustCall(
    _ coa: auth(EVM.Call) &EVM.CadenceOwnedAccount,
    _ contractAddr: EVM.EVMAddress,
    functionSig: String,
    args: [AnyStruct]
): EVM.Result {
    let res = coa.call(
        to: contractAddr,
        data: EVM.encodeABIWithSignature(functionSig, args),
        gasLimit: 4_000_000,
        value: EVM.Balance(attoflow: 0)
    )

    assert(res.status == EVM.Status.successful,
        message: "Failed to call '".concat(functionSig)
            .concat("\\n\\t error code: ").concat(res.errorCode.toString())
            .concat("\\n\\t error message: ").concat(res.errorMessage)
            .concat("\\n\\t gas used: ").concat(res.gasUsed.toString())
            .concat("\\n\\t caller address: 0x").concat(coa.address().toString())
            .concat("\\n\\t contract address: 0x").concat(contractAddr.toString())
    )

    return res
}
`;
    let config = {
      cadence: code.trim(),
      name: "batchBridgeChildNftToEvmAddressWithPayer",
      type: "transaction",
      args: (arg: any, t: any) => [
        arg(nftIdentifier, t.String),
        arg(child, t.Address),
        arg(ids, t.Array(t.UInt64)),
        arg(recipient, t.String),
      ],
      limit: 9999,
    };
    config = await this.runRequestInterceptors(config);
    let txId = await fcl.mutate(config);
    const result = await this.runResponseInterceptors(config, txId);
    return result.response;
  }


  public async batchBridgeChildNftToEvmWithPayer(nftIdentifier: string, child: string, ids: number[]) {
    const code = `
import MetadataViews from 0xMetadataViews
import ViewResolver from 0xMetadataViews
import NonFungibleToken from 0xNonFungibleToken
import FungibleToken from 0xFungibleToken
import FlowToken from 0xFlowToken
import FungibleTokenMetadataViews from 0xFungibleToken
import ScopedFTProviders from 0xFlowEVMBridge
import EVM from 0xEVM
import FlowEVMBridgeUtils from 0xFlowEVMBridge
import FlowEVMBridge from 0xFlowEVMBridge
import FlowEVMBridgeConfig from 0xFlowEVMBridge
import HybridCustody from 0xHybridCustody
import CapabilityFilter from 0xCapabilityFilter
import CrossVMMetadataViews from 0xCrossVMMetadataViews

transaction(nftIdentifier: String, child: Address, ids: [UInt64]) {
    prepare(signer: auth(CopyValue, BorrowValue, IssueStorageCapabilityController, Capabilities, SaveValue) &Account, payer: auth(BorrowValue, CopyValue, IssueStorageCapabilityController, PublishCapability, SaveValue, UnpublishCapability) &Account) {
        /* --- Reference the signer's CadenceOwnedAccount --- */
        //
        // Borrow a reference to the signer's COA
        let coa = signer.storage.borrow<auth(EVM.Call, EVM.Bridge) &EVM.CadenceOwnedAccount>(from: /storage/evm)
            ?? panic("Could not borrow COA from provided gateway address")

        let m = signer.storage.borrow<auth(HybridCustody.Manage) &HybridCustody.Manager>(from: HybridCustody.ManagerStoragePath)
            ?? panic("manager does not exist")
        let childAcct = m.borrowAccount(addr: child) ?? panic("child account not found")

         // Construct the NFT type from the provided identifier
        let nftType = CompositeType(nftIdentifier)
            ?? panic("Could not construct NFT type from identifier: ".concat(nftIdentifier))
        let nftContractAddress = FlowEVMBridgeUtils.getContractAddress(fromType: nftType)
            ?? panic("Could not get contract address from identifier: ".concat(nftIdentifier))
        let nftContractName = FlowEVMBridgeUtils.getContractName(fromType: nftType)
            ?? panic("Could not get contract name from identifier: ".concat(nftIdentifier))

        /* --- Retrieve the NFT --- */
        //
        // Borrow a reference to the NFT collection, configuring if necessary
        let viewResolver = getAccount(nftContractAddress).contracts.borrow<&{ViewResolver}>(name: nftContractName)
            ?? panic("Could not borrow ViewResolver from NFT contract")
        let collectionData = viewResolver.resolveContractView(
                resourceType: nil,
                viewType: Type<MetadataViews.NFTCollectionData>()
            ) as! MetadataViews.NFTCollectionData? ?? panic("Could not resolve NFTCollectionData view")
        var collection = signer.storage.borrow<auth(NonFungibleToken.Withdraw) &{NonFungibleToken.Collection}>(
                from: collectionData.storagePath
            )

        // Create collection if it doesn't exist
        if collection == nil {
            signer.storage.save(<- collectionData.createEmptyCollection(), to: collectionData.storagePath)
            signer.capabilities.unpublish(collectionData.publicPath)
            signer.capabilities.publish(
                signer.capabilities.storage.issue<&{NonFungibleToken.Collection}>(collectionData.storagePath),
                at: collectionData.publicPath
            )

            // Borrow authorized withdraw reference to the signer's collection
            collection = signer.storage.borrow<auth(NonFungibleToken.Withdraw) &{NonFungibleToken.Collection}>(
                from: collectionData.storagePath
            )!
        }

        let capType = Type<auth(NonFungibleToken.Withdraw) &{NonFungibleToken.Provider}>()
        let controllerID = childAcct.getControllerIDForType(type: capType, forPath: collectionData.storagePath)
            ?? panic("no controller found for capType")

        let cap = childAcct.getCapability(controllerID: controllerID, type: capType) ?? panic("no cap found")
        let providerCap = cap as! Capability<auth(NonFungibleToken.Withdraw) &{NonFungibleToken.Provider}>
        assert(providerCap.check(), message: "invalid provider capability")

        let id = ids[0]
        // Get a reference to the child's stored vault
        let collectionRef = providerCap.borrow()!
        let childNft <- collectionRef.withdraw(withdrawID: id)
        collection!.deposit(token: <-childNft)
        // // Withdraw tokens from the signer's stored vault
        let currentStorageUsage = signer.storage.used
        let nft <- collection!.withdraw(withdrawID: id)
        let withdrawnStorageUsage = signer.storage.used
        let approxFee = FlowEVMBridgeUtils.calculateBridgeFee(
                bytes: 400_000
            ) + (FlowEVMBridgeConfig.baseFee * UFix64(ids.length))

        /* --- Configure a ScopedFTProvider --- */
        //
        // Issue and store bridge-dedicated Provider Capability in storage if necessary
        if payer.storage.type(at: FlowEVMBridgeConfig.providerCapabilityStoragePath) == nil {
            let providerCap = payer.capabilities.storage.issue<auth(FungibleToken.Withdraw) &{FungibleToken.Provider}>(
                /storage/flowTokenVault
            )
            payer.storage.save(providerCap, to: FlowEVMBridgeConfig.providerCapabilityStoragePath)
        }
        // Copy the stored Provider capability and create a ScopedFTProvider
        let providerCapCopy = payer.storage.copy<Capability<auth(FungibleToken.Withdraw) &{FungibleToken.Provider}>>(
                from: FlowEVMBridgeConfig.providerCapabilityStoragePath
            ) ?? panic("Invalid Provider Capability found in storage.")
        let providerFilter = ScopedFTProviders.AllowanceFilter(approxFee)
        let scopedProvider <- ScopedFTProviders.createScopedFTProvider(
                provider: providerCapCopy,
                filters: [ providerFilter ],
                expiration: getCurrentBlock().timestamp + 1.0
            )

        // Execute the bridge
        coa.depositNFT(
            nft: <- nft,
            feeProvider: &scopedProvider as auth(FungibleToken.Withdraw) &{FungibleToken.Provider}
        )
        var idx = 0
        for nftId in ids {
            if idx == 0 {
                idx = idx + 1
                continue
            }

            let nft <- collectionRef.withdraw(withdrawID: nftId)
            coa.depositNFT(
                nft: <- nft,
                feeProvider: &scopedProvider as auth(FungibleToken.Withdraw) &{FungibleToken.Provider}
            )
            idx = idx + 1
        }
        // Destroy the ScopedFTProvider
        destroy scopedProvider

        // Wrap NFTs if applicable
        wrapAndTransferNFTsIfApplicable(coa,
            nftIDs: ids,
            nftType: nftType,
            viewResolver: viewResolver,
            recipientIfNotCoa: nil
        )
    }
}

/// Wraps and transfers bridged NFTs into a project's custom ERC721 wrapper contract on EVM, if applicable.
/// Enables projects to use their own ERC721 contract while leveraging the bridge's underlying contract,
/// until direct custom contract support is added to the bridge.
///
/// @param coa: The COA of the signer
/// @param nftIDs: The IDs of the NFTs to wrap
/// @param nftType: The type of the NFTs to wrap
/// @param viewResolver: The ViewResolver of the NFT contract
/// @param recipientIfNotCoa: The EVM address to transfer the wrapped NFTs to, nil if the NFTs should stay in signer's COA
///
access(all) fun wrapAndTransferNFTsIfApplicable(
    _ coa: auth(EVM.Call) &EVM.CadenceOwnedAccount,
    nftIDs: [UInt64],
    nftType: Type,
    viewResolver: &{ViewResolver},
    recipientIfNotCoa: EVM.EVMAddress?
) {
    // Get the project-defined ERC721 address if it exists
    if let crossVMPointer = viewResolver.resolveContractView(
            resourceType: nftType,
            viewType: Type<CrossVMMetadataViews.EVMPointer>()
    ) as! CrossVMMetadataViews.EVMPointer? {
        // Get the underlying ERC721 address if it exists
        if let underlyingAddress = getUnderlyingERC721Address(coa, crossVMPointer.evmContractAddress) {
            // Wrap NFTs if underlying ERC721 address matches bridge's associated address for NFT type
            if underlyingAddress.equals(FlowEVMBridgeConfig.getEVMAddressAssociated(with: nftType)!) {
                // Approve contract to withdraw underlying NFTs from signer's coa
                mustCall(coa, underlyingAddress,
                    functionSig: "setApprovalForAll(address,bool)",
                    args: [crossVMPointer.evmContractAddress, true]
                )

                // Wrap NFTs with provided IDs, and check if the call was successful
                let res = mustCall(coa, crossVMPointer.evmContractAddress,
                    functionSig: "depositFor(address,uint256[])",
                    args: [coa.address(), nftIDs]
                )
                let decodedRes = EVM.decodeABI(types: [Type<Bool>()], data: res.data)
                assert(decodedRes.length == 1, message: "Invalid response length")
                assert(decodedRes[0] as! Bool, message: "Failed to wrap NFTs")

                // Transfer NFTs to recipient if provided
                if let to = recipientIfNotCoa {
                    mustTransferNFTs(coa, crossVMPointer.evmContractAddress, nftIDs: nftIDs, to: to)
                }

                // Revoke approval for contract to withdraw underlying NFTs from signer's coa
                mustCall(coa, underlyingAddress,
                    functionSig: "setApprovalForAll(address,bool)",
                    args: [crossVMPointer.evmContractAddress, false]
                )
            }
        }
    }
}

/// Gets the underlying ERC721 address if it exists (i.e. if the ERC721 is a wrapper)
///
access(all) fun getUnderlyingERC721Address(
    _ coa: auth(EVM.Call) &EVM.CadenceOwnedAccount,
    _ wrapperAddress: EVM.EVMAddress
): EVM.EVMAddress? {
    let res = coa.call(
        to: wrapperAddress,
        data: EVM.encodeABIWithSignature("underlying()", []),
        gasLimit: 100_000,
        value: EVM.Balance(attoflow: 0)
    )

    // If the call fails, return nil
    if res.status != EVM.Status.successful || res.data.length == 0 {
        return nil
    }

    // Decode and return the underlying ERC721 address
    let decodedResult = EVM.decodeABI(
        types: [Type<EVM.EVMAddress>()],
        data: res.data
    )
    assert(decodedResult.length == 1, message: "Invalid response length")
    return decodedResult[0] as! EVM.EVMAddress
}

/// Checks if the provided NFT is owned by the provided EVM address
///
access(all) fun isOwner(
    _ coa: auth(EVM.Call) &EVM.CadenceOwnedAccount,
    _ erc721Address: EVM.EVMAddress,
    _ nftID: UInt64,
    _ ownerToCheck: EVM.EVMAddress
): Bool {
    let res = coa.call(
        to: erc721Address,
        data: EVM.encodeABIWithSignature("ownerOf(uint256)", [nftID]),
        gasLimit: 100_000,
        value: EVM.Balance(attoflow: 0)
    )
    assert(res.status == EVM.Status.successful, message: "Call to ERC721.ownerOf(uint256) failed")
    let decodedRes = EVM.decodeABI(types: [Type<EVM.EVMAddress>()], data: res.data)
    if decodedRes.length == 1 {
        let actualOwner = decodedRes[0] as! EVM.EVMAddress
        return actualOwner.equals(ownerToCheck)
    }
    return false
}

/// Transfers NFTs from the provided COA to the provided EVM address
///
access(all) fun mustTransferNFTs(
    _ coa: auth(EVM.Call) &EVM.CadenceOwnedAccount,
    _ erc721Address: EVM.EVMAddress,
    nftIDs: [UInt64],
    to: EVM.EVMAddress
) {
    for id in nftIDs {
        assert(isOwner(coa, erc721Address, id, coa.address()), message: "NFT not owned by signer's COA")
        mustCall(coa, erc721Address,
            functionSig: "safeTransferFrom(address,address,uint256)",
            args: [coa.address(), to, id]
        )
        assert(isOwner(coa, erc721Address, id, to), message: "NFT not transferred to recipient")
    }
}

/// Calls a function on an EVM contract from provided coa
///
access(all) fun mustCall(
    _ coa: auth(EVM.Call) &EVM.CadenceOwnedAccount,
    _ contractAddr: EVM.EVMAddress,
    functionSig: String,
    args: [AnyStruct]
): EVM.Result {
    let res = coa.call(
        to: contractAddr,
        data: EVM.encodeABIWithSignature(functionSig, args),
        gasLimit: 4_000_000,
        value: EVM.Balance(attoflow: 0)
    )

    assert(res.status == EVM.Status.successful,
        message: "Failed to call '".concat(functionSig)
            .concat("\\n\\t error code: ").concat(res.errorCode.toString())
            .concat("\\n\\t error message: ").concat(res.errorMessage)
            .concat("\\n\\t gas used: ").concat(res.gasUsed.toString())
            .concat("\\n\\t caller address: 0x").concat(coa.address().toString())
            .concat("\\n\\t contract address: 0x").concat(contractAddr.toString())
    )

    return res
}
`;
    let config = {
      cadence: code.trim(),
      name: "batchBridgeChildNftToEvmWithPayer",
      type: "transaction",
      args: (arg: any, t: any) => [
        arg(nftIdentifier, t.String),
        arg(child, t.Address),
        arg(ids, t.Array(t.UInt64)),
      ],
      limit: 9999,
    };
    config = await this.runRequestInterceptors(config);
    let txId = await fcl.mutate(config);
    const result = await this.runResponseInterceptors(config, txId);
    return result.response;
  }


  public async batchSendChildNft(identifier: string, childAddr: string, receiver: string, ids: number[]) {
    const code = `
import HybridCustody from 0xHybridCustody
import CapabilityFilter from 0xHybridCustody
import NonFungibleToken from 0xNonFungibleToken
import MetadataViews from 0xMetadataViews
import ViewResolver from 0xMetadataViews



transaction(identifier: String, childAddr: Address, receiver: Address, ids: [UInt64]) {
  prepare(signer: auth(Storage) &Account) {
    let type = CompositeType(identifier)
    let identifierSplit = identifier.split(separator: ".")
    let address = Address.fromString("0x".concat(identifierSplit[1]))!
    let name = identifierSplit[2]!

    let viewResolver = getAccount(address).contracts.borrow<&{ViewResolver}>(name: name)
    ?? panic("Could not borrow ViewResolver from NFT contract")
    // signer is the parent account
    // get the manager resource and borrow childAccount
    let m = signer.storage.borrow<auth(HybridCustody.Manage) &HybridCustody.Manager>(from: HybridCustody.ManagerStoragePath)
        ?? panic("manager does not exist")
    let childAcct = m.borrowAccount(addr: childAddr) ?? panic("child account not found")
    
    let collectionData = viewResolver.resolveContractView(resourceType: nil, viewType: Type<MetadataViews.NFTCollectionData>()) as! MetadataViews.NFTCollectionData?
        ?? panic("Could not get the vault data view for <NFT> ")

    //get Ft cap from child account
    let capType = Type<auth(NonFungibleToken.Withdraw) &{NonFungibleToken.Provider}>()
    let controllerID = childAcct.getControllerIDForType(type: capType, forPath: collectionData.storagePath)
        ?? panic("no controller found for capType")
    
    let cap = childAcct.getCapability(controllerID: controllerID, type: capType) ?? panic("no cap found")
    let providerCap = cap as! Capability<auth(NonFungibleToken.Withdraw) &{NonFungibleToken.Provider}>
    assert(providerCap.check(), message: "invalid provider capability")
    
    // Get a reference to the child's stored vault
    let collectionRef = providerCap.borrow()!

   
    let receiverAcc = getAccount(receiver)
    let receiverRef =  receiverAcc.capabilities.get<&{NonFungibleToken.Receiver}>(collectionData.publicPath)!.borrow()
    ?? panic("Could not borrow receiver reference to the recipient's Vault")
    
    for id in ids {
        // Withdraw tokens from the signer's stored vault
        let nft <- collectionRef.withdraw(withdrawID: id)
        receiverRef.deposit(token: <- nft)
    }
  }
}
`;
    let config = {
      cadence: code.trim(),
      name: "batchSendChildNft",
      type: "transaction",
      args: (arg: any, t: any) => [
        arg(identifier, t.String),
        arg(childAddr, t.Address),
        arg(receiver, t.Address),
        arg(ids, t.Array(t.UInt64)),
      ],
      limit: 9999,
    };
    config = await this.runRequestInterceptors(config);
    let txId = await fcl.mutate(config);
    const result = await this.runResponseInterceptors(config, txId);
    return result.response;
  }


  public async batchSendChildNftToChild(identifier: string, childAddr: string, receiver: string, ids: number[]) {
    const code = `
import HybridCustody from 0xHybridCustody
import CapabilityFilter from 0xHybridCustody
import NonFungibleToken from 0xNonFungibleToken
import MetadataViews from 0xMetadataViews
import ViewResolver from 0xMetadataViews


transaction(identifier: String, childAddr: Address, receiver: Address, ids: [UInt64]) {
  prepare(signer: auth(Storage) &Account) {
    let type = CompositeType(identifier)
    let identifierSplit = identifier.split(separator: ".")
    let address = Address.fromString("0x".concat(identifierSplit[1]))!
    let name = identifierSplit[2]!
    let viewResolver = getAccount(address).contracts.borrow<&{ViewResolver}>(name: name)
        ?? panic("Could not borrow ViewResolver from NFT contract")
    // signer is the parent account
    // get the manager resource and borrow childAccount
    let m = signer.storage.borrow<auth(HybridCustody.Manage) &HybridCustody.Manager>(from: HybridCustody.ManagerStoragePath)
        ?? panic("manager does not exist")
    let childAcct = m.borrowAccount(addr: childAddr) ?? panic("child account not found")
    
    let collectionData = viewResolver.resolveContractView(resourceType: nil, viewType: Type<MetadataViews.NFTCollectionData>()) as! MetadataViews.NFTCollectionData?
        ?? panic("Could not get the vault data view for <NFT> ")

    //get Ft cap from child account
    let capType = Type<auth(NonFungibleToken.Withdraw) &{NonFungibleToken.Provider}>()
    let controllerID = childAcct.getControllerIDForType(type: capType, forPath: collectionData.storagePath)
        ?? panic("no controller found for capType")
    
    let cap = childAcct.getCapability(controllerID: controllerID, type: capType) ?? panic("no cap found")
    let providerCap = cap as! Capability<auth(NonFungibleToken.Withdraw) &{NonFungibleToken.Provider}>
    assert(providerCap.check(), message: "invalid provider capability")
    let collectionRef = providerCap.borrow()!


    let receiverChildAcct = m.borrowAccount(addr: receiver) ?? panic("child account not found")
    let receiverControllerId = receiverChildAcct.getControllerIDForType(type: capType, forPath: collectionData.storagePath)
        ?? panic("no controller found for capType")
    let receiverCap = receiverChildAcct.getCapability(controllerID: receiverControllerId, type: capType) ?? panic("no cap found") 
    let publicCap = receiverCap as! Capability<&{NonFungibleToken.CollectionPublic}>
    let receiverRef =  publicCap.borrow()!

    for id in ids {
      let nft <- collectionRef.withdraw(withdrawID: id)
      receiverRef.deposit(token: <- nft)
    }
  }
}
`;
    let config = {
      cadence: code.trim(),
      name: "batchSendChildNftToChild",
      type: "transaction",
      args: (arg: any, t: any) => [
        arg(identifier, t.String),
        arg(childAddr, t.Address),
        arg(receiver, t.Address),
        arg(ids, t.Array(t.UInt64)),
      ],
      limit: 9999,
    };
    config = await this.runRequestInterceptors(config);
    let txId = await fcl.mutate(config);
    const result = await this.runResponseInterceptors(config, txId);
    return result.response;
  }


  public async batchTransferChildNft(identifier: string, childAddr: string, ids: number[]) {
    const code = `
import HybridCustody from 0xHybridCustody
import CapabilityFilter from 0xHybridCustody
import NonFungibleToken from 0xNonFungibleToken
import MetadataViews from 0xMetadataViews
import ViewResolver from 0xMetadataViews


transaction(identifier: String, childAddr: Address, ids: [UInt64] ) {

  prepare(signer: auth(Storage) &Account) {
    let type = CompositeType(identifier)
    let identifierSplit = identifier.split(separator: ".")
    let address = Address.fromString("0x".concat(identifierSplit[1]))!
    let name = identifierSplit[2]!

    let viewResolver = getAccount(address).contracts.borrow<&{ViewResolver}>(name: name)
    ?? panic("Could not borrow ViewResolver from NFT contract")
    // signer is the parent account
    // get the manager resource and borrow childAccount
    let m = signer.storage.borrow<auth(HybridCustody.Manage) &HybridCustody.Manager>(from: HybridCustody.ManagerStoragePath)
        ?? panic("manager does not exist")
    let childAcct = m.borrowAccount(addr: childAddr) ?? panic("child account not found")
    
    let collectionData = viewResolver.resolveContractView(resourceType: nil, viewType: Type<MetadataViews.NFTCollectionData>()) as! MetadataViews.NFTCollectionData?
        ?? panic("Could not get the vault data view for <NFT> ")

    //get Ft cap from child account
    let capType = Type<auth(NonFungibleToken.Withdraw) &{NonFungibleToken.Provider}>()
    let controllerID = childAcct.getControllerIDForType(type: capType, forPath: collectionData.storagePath)
        ?? panic("no controller found for capType")
    
    let cap = childAcct.getCapability(controllerID: controllerID, type: capType) ?? panic("no cap found")
    let providerCap = cap as! Capability<auth(NonFungibleToken.Withdraw) &{NonFungibleToken.Provider}>
    assert(providerCap.check(), message: "invalid provider capability")
    
    // Get a reference to the child's stored vault
    let collectionRef = providerCap.borrow()!
    let receiverRef =  signer.capabilities.get<&{NonFungibleToken.Receiver}>(collectionData.publicPath)!.borrow()
    ?? panic("Could not borrow receiver reference to the recipient's Vault")

    for id in ids {     
      // Withdraw tokens from the signer's stored vault
      let nft <- collectionRef.withdraw(withdrawID: id)
      receiverRef.deposit(token: <- nft)
    }
  }
}
`;
    let config = {
      cadence: code.trim(),
      name: "batchTransferChildNft",
      type: "transaction",
      args: (arg: any, t: any) => [
        arg(identifier, t.String),
        arg(childAddr, t.Address),
        arg(ids, t.Array(t.UInt64)),
      ],
      limit: 9999,
    };
    config = await this.runRequestInterceptors(config);
    let txId = await fcl.mutate(config);
    const result = await this.runResponseInterceptors(config, txId);
    return result.response;
  }


  public async batchTransferNftToChild(identifier: string, childAddr: string, ids: number[]) {
    const code = `
import HybridCustody from 0xHybridCustody
import CapabilityFilter from 0xHybridCustody
import NonFungibleToken from 0xNonFungibleToken
import MetadataViews from 0xMetadataViews
import ViewResolver from 0xMetadataViews


transaction(identifier: String, childAddr: Address, ids: [UInt64]) {
  prepare(signer: auth(Storage) &Account) {
    let type = CompositeType(identifier)
    let identifierSplit = identifier.split(separator: ".")
    let address = Address.fromString("0x".concat(identifierSplit[1]))!
    let name = identifierSplit[2]!

    let viewResolver = getAccount(address).contracts.borrow<&{ViewResolver}>(name: name)
        ?? panic("Could not borrow ViewResolver from NFT contract")
    // signer is the parent account
    // get the manager resource and borrow childAccount
    let m = signer.storage.borrow<auth(HybridCustody.Manage) &HybridCustody.Manager>(from: HybridCustody.ManagerStoragePath)
        ?? panic("manager does not exist")
    let childAcct = m.borrowAccount(addr: childAddr) ?? panic("child account not found")
    
    let collectionData = viewResolver.resolveContractView(resourceType: nil, viewType: Type<MetadataViews.NFTCollectionData>()) as! MetadataViews.NFTCollectionData?
        ?? panic("Could not get the vault data view for <NFT> ")

    //get Ft cap from child account
    let capType = Type<auth(NonFungibleToken.Withdraw) &{NonFungibleToken.Provider}>()
    let controllerID = childAcct.getControllerIDForType(type: capType, forPath: collectionData.storagePath)
        ?? panic("no controller found for capType")
    
    let cap = childAcct.getCapability(controllerID: controllerID, type: capType) ?? panic("no cap found")
    let childCap = cap as! Capability<&{NonFungibleToken.CollectionPublic}>
    assert(childCap.check(), message: "invalid provider capability")
    
    let parentRef =  signer.storage.borrow<auth(NonFungibleToken.Withdraw) &{NonFungibleToken.Provider}>(from : collectionData.storagePath)!
    let childRef = childCap.borrow()!

    for id in ids {     
        // Withdraw tokens from the signer's stored vault
        let nft <- parentRef!.withdraw(withdrawID: id)!
        childRef.deposit(token: <- nft)
    }
  }
}
`;
    let config = {
      cadence: code.trim(),
      name: "batchTransferNftToChild",
      type: "transaction",
      args: (arg: any, t: any) => [
        arg(identifier, t.String),
        arg(childAddr, t.Address),
        arg(ids, t.Array(t.UInt64)),
      ],
      limit: 9999,
    };
    config = await this.runRequestInterceptors(config);
    let txId = await fcl.mutate(config);
    const result = await this.runResponseInterceptors(config, txId);
    return result.response;
  }


  public async bridgeChildFtFromEvm(vaultIdentifier: string, child: string, amount: string) {
    const code = `
import MetadataViews from 0xMetadataViews
import ViewResolver from 0xMetadataViews
import NonFungibleToken from 0xNonFungibleToken

import FungibleToken from 0xFungibleToken
import FlowToken from 0xFlowToken
import FungibleTokenMetadataViews from 0xFungibleToken

import ScopedFTProviders from 0xFlowEVMBridge

import EVM from 0xEVM

import FlowEVMBridgeUtils from 0xFlowEVMBridge
import FlowEVMBridge from 0xFlowEVMBridge
import FlowEVMBridgeConfig from 0xFlowEVMBridge


import HybridCustody from 0xHybridCustody
import CapabilityFilter from 0xHybridCustody

transaction(vaultIdentifier: String, child: Address, amount: UInt256) {
  prepare(signer: auth(BorrowValue, CopyValue, IssueStorageCapabilityController, PublishCapability, SaveValue, UnpublishCapability) &Account) {
    // Borrow a reference to the signer's COA
    let coa = signer.storage.borrow<auth(EVM.Bridge) &EVM.CadenceOwnedAccount>(from: /storage/evm)
      ?? panic("Could not borrow COA from provided gateway address")
    let vaultType = CompositeType(vaultIdentifier)
      ?? panic("Could not construct Vault type from identifier: ".concat(vaultIdentifier))
    // Parse the Vault identifier into its components
    let tokenContractAddress = FlowEVMBridgeUtils.getContractAddress(fromType: vaultType)
      ?? panic("Could not get contract address from identifier: ".concat(vaultIdentifier))
    let tokenContractName = FlowEVMBridgeUtils.getContractName(fromType: vaultType)
      ?? panic("Could not get contract name from identifier: ".concat(vaultIdentifier))

    /* --- Retrieve the funds --- */
    //
    // Borrow a reference to the FungibleToken Vault
    let viewResolver = getAccount(tokenContractAddress).contracts.borrow<&{ViewResolver}>(name: tokenContractName)
      ?? panic("Could not borrow ViewResolver from FungibleToken contract")
    let vaultData = viewResolver.resolveContractView(
      resourceType: nil,
      viewType: Type<FungibleTokenMetadataViews.FTVaultData>()
    ) as! FungibleTokenMetadataViews.FTVaultData? ?? panic("Could not resolve FTVaultData view")

    // signer is the parent account
    // get the manager resource and borrow childAccount
    let m = signer.storage.borrow<auth(HybridCustody.Manage) &HybridCustody.Manager>(from: HybridCustody.ManagerStoragePath)
      ?? panic("manager does not exist")
    let childAcct = m.borrowAccount(addr: child) ?? panic("child account not found")
    
    //get Ft cap from child account
    let capType = Type<&{FungibleToken.Receiver}>()
    let controllerID = childAcct.getControllerIDForType(type: capType, forPath: vaultData.storagePath)
      ?? panic("no controller found for capType")
    
    let cap = childAcct.getCapability(controllerID: controllerID, type: capType) ?? panic("no cap found")
    let providerCap = cap as! Capability<&{FungibleToken.Receiver}>
    assert(providerCap.check(), message: "invalid provider capability")
    
    // Get a reference to the child's stored vault
    let vaultRef = providerCap.borrow()!

    let approxFee = FlowEVMBridgeUtils.calculateBridgeFee(bytes: 400_000)
    /* --- Configure a ScopedFTProvider --- */
    //
    // Issue and store bridge-dedicated Provider Capability in storage if necessary
    if signer.storage.type(at: FlowEVMBridgeConfig.providerCapabilityStoragePath) == nil {
      let providerCap = signer.capabilities.storage.issue<auth(FungibleToken.Withdraw) &{FungibleToken.Provider}>(
        /storage/flowTokenVault
      )
      signer.storage.save(providerCap, to: FlowEVMBridgeConfig.providerCapabilityStoragePath)
    }
    // Copy the stored Provider capability and create a ScopedFTProvider
    let providerCapCopy = signer.storage.copy<Capability<auth(FungibleToken.Withdraw) &{FungibleToken.Provider}>>(
      from: FlowEVMBridgeConfig.providerCapabilityStoragePath
    ) ?? panic("Invalid Provider Capability found in storage.")
    let providerFilter = ScopedFTProviders.AllowanceFilter(approxFee)
    let scopedProvider <- ScopedFTProviders.createScopedFTProvider(
      provider: providerCapCopy,
      filters: [ providerFilter ],
      expiration: getCurrentBlock().timestamp + 1.0
    )

    let vault: @{FungibleToken.Vault} <- coa.withdrawTokens(
      type: vaultType,
      amount: amount,
      feeProvider: &scopedProvider as auth(FungibleToken.Withdraw) &{FungibleToken.Provider}
    )

    vaultRef.deposit(from: <- vault)
    destroy scopedProvider
  }
}
`;
    let config = {
      cadence: code.trim(),
      name: "bridgeChildFtFromEvm",
      type: "transaction",
      args: (arg: any, t: any) => [
        arg(vaultIdentifier, t.String),
        arg(child, t.Address),
        arg(amount, t.UInt256),
      ],
      limit: 9999,
    };
    config = await this.runRequestInterceptors(config);
    let txId = await fcl.mutate(config);
    const result = await this.runResponseInterceptors(config, txId);
    return result.response;
  }


  public async bridgeChildFtToEvm(vaultIdentifier: string, child: string, amount: string) {
    const code = `
import MetadataViews from 0xMetadataViews
import ViewResolver from 0xMetadataViews
import NonFungibleToken from 0xNonFungibleToken

import FungibleToken from 0xFungibleToken
import FlowToken from 0xFlowToken
import FungibleTokenMetadataViews from 0xFungibleToken

import ScopedFTProviders from 0xFlowEVMBridge

import EVM from 0xEVM

import FlowEVMBridgeUtils from 0xFlowEVMBridge
import FlowEVMBridge from 0xFlowEVMBridge
import FlowEVMBridgeConfig from 0xFlowEVMBridge

import HybridCustody from 0xHybridCustody
import CapabilityFilter from 0xCapabilityFilter


transaction(vaultIdentifier: String, child: Address, amount: UFix64) {

  // The Vault resource that holds the tokens that are being transferred
  let paymentVault: @{FungibleToken.Vault}
  let coa: auth(EVM.Bridge) &EVM.CadenceOwnedAccount
  let scopedProvider: @ScopedFTProviders.ScopedFTProvider

  prepare(signer: auth(Storage, CopyValue, BorrowValue, IssueStorageCapabilityController, PublishCapability, SaveValue) &Account) {
    /* --- Reference the signer's CadenceOwnedAccount --- */
    //
    // Borrow a reference to the signer's COA
    self.coa = signer.storage.borrow<auth(EVM.Bridge) &EVM.CadenceOwnedAccount>(from: /storage/evm)
      ?? panic("Could not borrow COA from provided gateway address")

    /* --- Retrieve the funds --- */
    //
    // Borrow a reference to the FungibleToken Vault
    let vaultType = CompositeType(vaultIdentifier)
      ?? panic("Could not construct Vault type from identifier: ".concat(vaultIdentifier))
    // Parse the Vault identifier into its components
    let tokenContractAddress = FlowEVMBridgeUtils.getContractAddress(fromType: vaultType)
      ?? panic("Could not get contract address from identifier: ".concat(vaultIdentifier))
    let tokenContractName = FlowEVMBridgeUtils.getContractName(fromType: vaultType)
      ?? panic("Could not get contract name from identifier: ".concat(vaultIdentifier))

    let viewResolver = getAccount(tokenContractAddress).contracts.borrow<&{ViewResolver}>(name: tokenContractName)
      ?? panic("Could not borrow ViewResolver from FungibleToken contract")
    let vaultData = viewResolver.resolveContractView(
      resourceType: nil,
      viewType: Type<FungibleTokenMetadataViews.FTVaultData>()
    ) as! FungibleTokenMetadataViews.FTVaultData? ?? panic("Could not resolve FTVaultData view")
    let vault = signer.storage.borrow<auth(FungibleToken.Withdraw) &{FungibleToken.Vault}>(
      from: vaultData.storagePath
    ) ?? panic("Could not access signer's FungibleToken Vault")

    // signer is the parent account
    // get the manager resource and borrow childAccount
    let m = signer.storage.borrow<auth(HybridCustody.Manage) &HybridCustody.Manager>(from: HybridCustody.ManagerStoragePath)
      ?? panic("manager does not exist")
    let childAcct = m.borrowAccount(addr: child) ?? panic("child account not found")
    
    //get Ft cap from child account
    let capType = Type<auth(FungibleToken.Withdraw) &{FungibleToken.Provider}>()
    let controllerID = childAcct.getControllerIDForType(type: capType, forPath: vaultData.storagePath)
      ?? panic("no controller found for capType")
    
    let cap = childAcct.getCapability(controllerID: controllerID, type: capType) ?? panic("no cap found")
    let providerCap = cap as! Capability<auth(FungibleToken.Withdraw) &{FungibleToken.Provider}>
    assert(providerCap.check(), message: "invalid provider capability")
    
    // Get a reference to the child's stored vault
    let vaultRef = providerCap.borrow()!

    // Withdraw tokens from the signer's stored vault
    vault.deposit(from: <- vaultRef.withdraw(amount: amount))
    // Withdraw the requested balance & calculate the approximate bridge fee based on storage usage
    let currentStorageUsage = signer.storage.used
    self.paymentVault <- vault.withdraw(amount: amount)
    let withdrawnStorageUsage = signer.storage.used
    // Approximate the bridge fee based on the difference in storage usage with some buffer
    let approxFee = FlowEVMBridgeUtils.calculateBridgeFee(
      bytes: 400_000
    )

    /* --- Configure a ScopedFTProvider --- */
    //
    // Issue and store bridge-dedicated Provider Capability in storage if necessary
    if signer.storage.type(at: FlowEVMBridgeConfig.providerCapabilityStoragePath) == nil {
      let providerCap = signer.capabilities.storage.issue<auth(FungibleToken.Withdraw) &{FungibleToken.Provider}>(
        /storage/flowTokenVault
      )
      signer.storage.save(providerCap, to: FlowEVMBridgeConfig.providerCapabilityStoragePath)
    }
    // Copy the stored Provider capability and create a ScopedFTProvider
    let providerCapCopy = signer.storage.copy<Capability<auth(FungibleToken.Withdraw) &{FungibleToken.Provider}>>(from: FlowEVMBridgeConfig.providerCapabilityStoragePath)
      ?? panic("Invalid Provider Capability found in storage.")
    let providerFilter = ScopedFTProviders.AllowanceFilter(approxFee)
    self.scopedProvider <- ScopedFTProviders.createScopedFTProvider(
      provider: providerCapCopy,
      filters: [ providerFilter ],
      expiration: getCurrentBlock().timestamp + 1.0
    )
  }

  execute {
    self.coa.depositTokens(
      vault: <-self.paymentVault,
      feeProvider: &self.scopedProvider as auth(FungibleToken.Withdraw) &{FungibleToken.Provider}
    )
    // Destroy the ScopedFTProvider
    destroy self.scopedProvider
  }
}
`;
    let config = {
      cadence: code.trim(),
      name: "bridgeChildFtToEvm",
      type: "transaction",
      args: (arg: any, t: any) => [
        arg(vaultIdentifier, t.String),
        arg(child, t.Address),
        arg(amount, t.UFix64),
      ],
      limit: 9999,
    };
    config = await this.runRequestInterceptors(config);
    let txId = await fcl.mutate(config);
    const result = await this.runResponseInterceptors(config, txId);
    return result.response;
  }


  public async bridgeChildFtToEvmAddress(vaultIdentifier: string, child: string, amount: string, recipient: string) {
    const code = `
import MetadataViews from 0xMetadataViews
import ViewResolver from 0xMetadataViews
import NonFungibleToken from 0xNonFungibleToken

import FungibleToken from 0xFungibleToken
import FlowToken from 0xFlowToken
import FungibleTokenMetadataViews from 0xFungibleToken

import ScopedFTProviders from 0xFlowEVMBridge

import EVM from 0xEVM

import FlowEVMBridgeUtils from 0xFlowEVMBridge
import FlowEVMBridge from 0xFlowEVMBridge
import FlowEVMBridgeConfig from 0xFlowEVMBridge

import HybridCustody from 0xHybridCustody
import CapabilityFilter from 0xCapabilityFilter


transaction(vaultIdentifier: String, child: Address, amount: UFix64, recipient:String) {
  // The Vault resource that holds the tokens that are being transferred
  let paymentVault: @{FungibleToken.Vault}
  // let coa: auth(EVM.Bridge) &EVM.CadenceOwnedAccount
  let scopedProvider: @ScopedFTProviders.ScopedFTProvider

  prepare(signer: auth(Storage, CopyValue, BorrowValue, IssueStorageCapabilityController, PublishCapability, SaveValue) &Account) {
    /* --- Reference the signer's CadenceOwnedAccount --- */
    //
    // Borrow a reference to the signer's COA
    // self.coa = signer.storage.borrow<auth(EVM.Bridge) &EVM.CadenceOwnedAccount>(from: /storage/evm)
    //     ?? panic("Could not borrow COA from provided gateway address")

    /* --- Retrieve the funds --- */
    //
    // Borrow a reference to the FungibleToken Vault
    let vaultType = CompositeType(vaultIdentifier)
      ?? panic("Could not construct Vault type from identifier: ".concat(vaultIdentifier))
    // Parse the Vault identifier into its components
    let tokenContractAddress = FlowEVMBridgeUtils.getContractAddress(fromType: vaultType)
      ?? panic("Could not get contract address from identifier: ".concat(vaultIdentifier))
    let tokenContractName = FlowEVMBridgeUtils.getContractName(fromType: vaultType)
      ?? panic("Could not get contract name from identifier: ".concat(vaultIdentifier))

    let viewResolver = getAccount(tokenContractAddress).contracts.borrow<&{ViewResolver}>(name: tokenContractName)
      ?? panic("Could not borrow ViewResolver from FungibleToken contract")
    let vaultData = viewResolver.resolveContractView(
      resourceType: nil,
      viewType: Type<FungibleTokenMetadataViews.FTVaultData>()
    ) as! FungibleTokenMetadataViews.FTVaultData? ?? panic("Could not resolve FTVaultData view")
    let vault = signer.storage.borrow<auth(FungibleToken.Withdraw) &{FungibleToken.Vault}>(
      from: vaultData.storagePath
    ) ?? panic("Could not access signer's FungibleToken Vault")

    // signer is the parent account
    // get the manager resource and borrow childAccount
    let m = signer.storage.borrow<auth(HybridCustody.Manage) &HybridCustody.Manager>(from: HybridCustody.ManagerStoragePath)
      ?? panic("manager does not exist")
    let childAcct = m.borrowAccount(addr: child) ?? panic("child account not found")
    
    //get Ft cap from child account
    let capType = Type<auth(FungibleToken.Withdraw) &{FungibleToken.Provider}>()
    let controllerID = childAcct.getControllerIDForType(type: capType, forPath: vaultData.storagePath)
      ?? panic("no controller found for capType")
    
    let cap = childAcct.getCapability(controllerID: controllerID, type: capType) ?? panic("no cap found")
    let providerCap = cap as! Capability<auth(FungibleToken.Withdraw) &{FungibleToken.Provider}>
    assert(providerCap.check(), message: "invalid provider capability")
    
    // Get a reference to the child's stored vault
    let vaultRef = providerCap.borrow()!

    // Withdraw tokens from the signer's stored vault
    vault.deposit(from: <- vaultRef.withdraw(amount: amount))
    // Withdraw the requested balance & calculate the approximate bridge fee based on storage usage
    let currentStorageUsage = signer.storage.used
    self.paymentVault <- vault.withdraw(amount: amount)
    let withdrawnStorageUsage = signer.storage.used
    // Approximate the bridge fee based on the difference in storage usage with some buffer
    let approxFee = FlowEVMBridgeUtils.calculateBridgeFee(
      bytes: 400_000
    )

    /* --- Configure a ScopedFTProvider --- */
    //
    // Issue and store bridge-dedicated Provider Capability in storage if necessary
    if signer.storage.type(at: FlowEVMBridgeConfig.providerCapabilityStoragePath) == nil {
      let providerCap = signer.capabilities.storage.issue<auth(FungibleToken.Withdraw) &{FungibleToken.Provider}>(
        /storage/flowTokenVault
      )
      signer.storage.save(providerCap, to: FlowEVMBridgeConfig.providerCapabilityStoragePath)
    }
    // Copy the stored Provider capability and create a ScopedFTProvider
    let providerCapCopy = signer.storage.copy<Capability<auth(FungibleToken.Withdraw) &{FungibleToken.Provider}>>(from: FlowEVMBridgeConfig.providerCapabilityStoragePath)
      ?? panic("Invalid Provider Capability found in storage.")
    let providerFilter = ScopedFTProviders.AllowanceFilter(approxFee)
    self.scopedProvider <- ScopedFTProviders.createScopedFTProvider(
      provider: providerCapCopy,
      filters: [ providerFilter ],
      expiration: getCurrentBlock().timestamp + 1.0
    )
  }

  execute {
    let recipientEVMAddress = EVM.addressFromString(recipient)
    FlowEVMBridge.bridgeTokensToEVM(
      vault: <-self.paymentVault,
      to: recipientEVMAddress,
      feeProvider: &self.scopedProvider as auth(FungibleToken.Withdraw) &{FungibleToken.Provider}
    )
    // Destroy the ScopedFTProvider
    destroy self.scopedProvider
  }
}
`;
    let config = {
      cadence: code.trim(),
      name: "bridgeChildFtToEvmAddress",
      type: "transaction",
      args: (arg: any, t: any) => [
        arg(vaultIdentifier, t.String),
        arg(child, t.Address),
        arg(amount, t.UFix64),
        arg(recipient, t.String),
      ],
      limit: 9999,
    };
    config = await this.runRequestInterceptors(config);
    let txId = await fcl.mutate(config);
    const result = await this.runResponseInterceptors(config, txId);
    return result.response;
  }


  public async bridgeChildNftFromEvm(nftIdentifier: string, child: string, id: string) {
    const code = `
import MetadataViews from 0xMetadataViews
import ViewResolver from 0xMetadataViews
import NonFungibleToken from 0xNonFungibleToken

import FungibleToken from 0xFungibleToken
import FlowToken from 0xFlowToken
import FungibleTokenMetadataViews from 0xFungibleToken

import ScopedFTProviders from 0xFlowEVMBridge

import EVM from 0xEVM

import FlowEVMBridgeUtils from 0xFlowEVMBridge
import FlowEVMBridge from 0xFlowEVMBridge
import FlowEVMBridgeConfig from 0xFlowEVMBridge

import HybridCustody from 0xHybridCustody
import CapabilityFilter from 0xHybridCustody

transaction(nftIdentifier: String, child: Address, id: UInt256) {
  
  prepare(signer: auth(BorrowValue, CopyValue, IssueStorageCapabilityController, PublishCapability, SaveValue, UnpublishCapability) &Account) {
    /* --- Reference the signer's CadenceOwnedAccount --- */
    //
    // Borrow a reference to the signer's COA
    let coa = signer.storage.borrow<auth(EVM.Bridge) &EVM.CadenceOwnedAccount>(from: /storage/evm)
      ?? panic("Could not borrow COA from provided gateway address")
    
    // Construct the NFT type from the provided identifier
    let nftType = CompositeType(nftIdentifier)
      ?? panic("Could not construct NFT type from identifier: ".concat(nftIdentifier))
    let nftContractAddress = FlowEVMBridgeUtils.getContractAddress(fromType: nftType)
      ?? panic("Could not get contract address from identifier: ".concat(nftIdentifier))
    let nftContractName = FlowEVMBridgeUtils.getContractName(fromType: nftType)
      ?? panic("Could not get contract name from identifier: ".concat(nftIdentifier))

    let m = signer.storage.borrow<auth(HybridCustody.Manage) &HybridCustody.Manager>(from: HybridCustody.ManagerStoragePath)
      ?? panic("manager does not exist")
    let childAcct = m.borrowAccount(addr: child) ?? panic("child account not found")
        
       
    /* --- Retrieve the NFT --- */
    //
    // Borrow a reference to the NFT collection, configuring if necessary
    let viewResolver = getAccount(nftContractAddress).contracts.borrow<&{ViewResolver}>(name: nftContractName)
      ?? panic("Could not borrow ViewResolver from NFT contract")
    let collectionData = viewResolver.resolveContractView(
      resourceType: nil,
      viewType: Type<MetadataViews.NFTCollectionData>()
    ) as! MetadataViews.NFTCollectionData? ?? panic("Could not resolve NFTCollectionData view")
        
        // let receiver = getAccount(child).capabilities.borrow<&{NonFungibleToken.Receiver}>(collectionData.publicPath)
        //     ?? panic("Could not borrow Receiver from recipient's public capability path")



    let capType = Type<&{NonFungibleToken.CollectionPublic}>()
    let controllerID = childAcct.getControllerIDForType(type: capType, forPath: collectionData.storagePath)
      ?? panic("no controller found for capType")
    
    let cap = childAcct.getCapability(controllerID: controllerID, type: capType) ?? panic("no cap found")
    let publicCap = cap as! Capability<&{NonFungibleToken.CollectionPublic}>
    assert(publicCap.check(), message: "invalid public capability")
    
    // Get a reference to the child's stored vault
    let collectionRef = publicCap.borrow()!

      
    // // Withdraw tokens from the signer's stored vault
    let approxFee = FlowEVMBridgeUtils.calculateBridgeFee(bytes: 400_000)

    /* --- Configure a ScopedFTProvider --- */
    //
    // Issue and store bridge-dedicated Provider Capability in storage if necessary
    if signer.storage.type(at: FlowEVMBridgeConfig.providerCapabilityStoragePath) == nil {
      let providerCap = signer.capabilities.storage.issue<auth(FungibleToken.Withdraw) &{FungibleToken.Provider}>(
        /storage/flowTokenVault
      )
      signer.storage.save(providerCap, to: FlowEVMBridgeConfig.providerCapabilityStoragePath)
    }
    // Copy the stored Provider capability and create a ScopedFTProvider
    let providerCapCopy = signer.storage.copy<Capability<auth(FungibleToken.Withdraw) &{FungibleToken.Provider}>>(
      from: FlowEVMBridgeConfig.providerCapabilityStoragePath
    ) ?? panic("Invalid Provider Capability found in storage.")
    let providerFilter = ScopedFTProviders.AllowanceFilter(approxFee)
    let scopedProvider <- ScopedFTProviders.createScopedFTProvider(
      provider: providerCapCopy,
      filters: [ providerFilter ],
      expiration: getCurrentBlock().timestamp + 1.0
    )

    let nft: @{NonFungibleToken.NFT} <- coa.withdrawNFT(
      type: nftType,
      id: id,
      feeProvider: &scopedProvider as auth(FungibleToken.Withdraw) &{FungibleToken.Provider}
    )

    assert(
      nft.getType() == nftType,
      message: "Bridged nft type mismatch - requested: ".concat(nftType.identifier)
        .concat(", received: ").concat(nft.getType().identifier)
    )

    collectionRef.deposit(token: <- nft)
    // Destroy the ScopedFTProvider
    destroy scopedProvider
    }
}
`;
    let config = {
      cadence: code.trim(),
      name: "bridgeChildNftFromEvm",
      type: "transaction",
      args: (arg: any, t: any) => [
        arg(nftIdentifier, t.String),
        arg(child, t.Address),
        arg(id, t.UInt256),
      ],
      limit: 9999,
    };
    config = await this.runRequestInterceptors(config);
    let txId = await fcl.mutate(config);
    const result = await this.runResponseInterceptors(config, txId);
    return result.response;
  }


  public async sendChildFt(vaultIdentifier: string, sender: string, receiver: string, amount: string) {
    const code = `
import HybridCustody from 0xHybridCustody

// HC-owned imports
import CapabilityFactory from 0xHybridCustody
import CapabilityFilter from 0xHybridCustody
import ViewResolver from 0xMetadataViews
import FungibleToken from 0xFungibleToken
import FungibleTokenMetadataViews from 0xFungibleTokenMetadataViews



transaction(vaultIdentifier:String, sender: Address, receiver: Address, amount: UFix64 ) {

  let paymentVault: @{FungibleToken.Vault}
  let vaultData: FungibleTokenMetadataViews.FTVaultData

  prepare(signer: auth(Storage) &Account) {
    let type = CompositeType(vaultIdentifier)
    let identifierSplit = vaultIdentifier.split(separator: ".")
    let address = Address.fromString("0x".concat(identifierSplit[1]))!
    let name = identifierSplit[2]!

    let viewResolver = getAccount(address).contracts.borrow<&{ViewResolver}>(name: name)
        ?? panic("Could not borrow ViewResolver from FungibleToken contract")
    let m = signer.storage.borrow<auth(HybridCustody.Manage) &HybridCustody.Manager>(from: HybridCustody.ManagerStoragePath)
      ?? panic("manager does not exist")
    let childAcct = m.borrowAccount(addr: sender) ?? panic("child account not found")
    
    self.vaultData = viewResolver.resolveContractView(resourceType: nil, viewType: Type<FungibleTokenMetadataViews.FTVaultData>()) as! FungibleTokenMetadataViews.FTVaultData?
      ?? panic("Could not get the vault data view for <Token> ")

    //get Ft cap from child account
    let capType = Type<auth(FungibleToken.Withdraw) &{FungibleToken.Provider}>()
    let controllerID = childAcct.getControllerIDForType(type: capType, forPath: self.vaultData.storagePath)
      ?? panic("no controller found for capType")
    
    let cap = childAcct.getCapability(controllerID: controllerID, type: capType) ?? panic("no cap found")
    let providerCap = cap as! Capability<auth(FungibleToken.Withdraw) &{FungibleToken.Provider}>
    assert(providerCap.check(), message: "invalid provider capability")
    
    // Get a reference to the child's stored vault
    let vaultRef = providerCap.borrow()!

    // Withdraw tokens from the signer's stored vault
    self.paymentVault <- vaultRef.withdraw(amount: amount)
  }

  execute {

      // Get the recipient's public account object
      let recipient = getAccount(receiver)

      // Get a reference to the recipient's Receiver
      let receiverRef = recipient.capabilities.get<&{FungibleToken.Receiver}>(self.vaultData.receiverPath)!.borrow()
    ?? panic("Could not borrow receiver reference to the recipient's Vault")

      // Deposit the withdrawn tokens in the recipient's receiver
      receiverRef.deposit(from: <-self.paymentVault)
  }
}
`;
    let config = {
      cadence: code.trim(),
      name: "sendChildFt",
      type: "transaction",
      args: (arg: any, t: any) => [
        arg(vaultIdentifier, t.String),
        arg(sender, t.Address),
        arg(receiver, t.Address),
        arg(amount, t.UFix64),
      ],
      limit: 9999,
    };
    config = await this.runRequestInterceptors(config);
    let txId = await fcl.mutate(config);
    const result = await this.runResponseInterceptors(config, txId);
    return result.response;
  }


  public async sendChildFtToChild(vaultIdentifier: string, sender: string, receiver: string, amount: string) {
    const code = `
import HybridCustody from 0xHybridCustody

// HC-owned imports
import CapabilityFactory from 0xHybridCustody
import CapabilityFilter from 0xHybridCustody

import FungibleToken from 0xFungibleToken
import ViewResolver from 0xMetadataViews
import FungibleTokenMetadataViews from 0xFungibleTokenMetadataViews



transaction(vaultIdentifier:String, sender: Address, receiver: Address, amount: UFix64 ) {
  // The Vault resource that holds the tokens that are being transferred
  let paymentVault: @{FungibleToken.Vault}
  let vaultData: FungibleTokenMetadataViews.FTVaultData

  prepare(signer: auth(Storage) &Account) {
    let type = CompositeType(vaultIdentifier)
    let identifierSplit = vaultIdentifier.split(separator: ".")
    let address = Address.fromString("0x".concat(identifierSplit[1]))!
    let name = identifierSplit[2]!

    let viewResolver = getAccount(address).contracts.borrow<&{ViewResolver}>(name: name)
        ?? panic("Could not borrow ViewResolver from FungibleToken contract")
    // signer is the parent account
    // get the manager resource and borrow childAccount
    let m = signer.storage.borrow<auth(HybridCustody.Manage) &HybridCustody.Manager>(from: HybridCustody.ManagerStoragePath)
      ?? panic("manager does not exist")
    let childAcct = m.borrowAccount(addr: sender) ?? panic("child account not found")
     
    self.vaultData = viewResolver.resolveContractView(
                resourceType: type,
                viewType: Type<FungibleTokenMetadataViews.FTVaultData>()
            ) as! FungibleTokenMetadataViews.FTVaultData? ?? panic("Could not resolve FTVaultData view")

    //get Ft cap from child account
    let capType = Type<auth(FungibleToken.Withdraw) &{FungibleToken.Provider}>()
    let controllerID = childAcct.getControllerIDForType(type: capType, forPath: self.vaultData.storagePath)
      ?? panic("no controller found for capType")
    
    let cap = childAcct.getCapability(controllerID: controllerID, type: capType) ?? panic("no cap found")
    let providerCap = cap as! Capability<auth(FungibleToken.Withdraw) &{FungibleToken.Provider}>
    assert(providerCap.check(), message: "invalid provider capability")
    
    // Get a reference to the child's stored vault
    let vaultRef = providerCap.borrow()!

    // Withdraw tokens from the signer's stored vault
    self.paymentVault <- vaultRef.withdraw(amount: amount)
  }

  execute {
    // Get the recipient's public account object
    let recipient = getAccount(receiver)

    // Get a reference to the recipient's Receiver
    let receiverRef = recipient.capabilities.get<&{FungibleToken.Receiver}>(self.vaultData.receiverPath)!.borrow()
      ?? panic("Could not borrow receiver reference to the recipient's Vault")

    // Deposit the withdrawn tokens in the recipient's receiver
    receiverRef.deposit(from: <-self.paymentVault)
  }
}
`;
    let config = {
      cadence: code.trim(),
      name: "sendChildFtToChild",
      type: "transaction",
      args: (arg: any, t: any) => [
        arg(vaultIdentifier, t.String),
        arg(sender, t.Address),
        arg(receiver, t.Address),
        arg(amount, t.UFix64),
      ],
      limit: 9999,
    };
    config = await this.runRequestInterceptors(config);
    let txId = await fcl.mutate(config);
    const result = await this.runResponseInterceptors(config, txId);
    return result.response;
  }


  public async sendChildFtWithParent(vaultIdentifier: string, amount: string, to: string, child: string) {
    const code = `
import FungibleToken from 0xFungibleToken
import HybridCustody from 0xHybridCustody
import FungibleTokenMetadataViews from 0xFungibleToken
import ViewResolver from 0xMetadataViews

transaction(vaultIdentifier:String, amount: UFix64, to: Address, child: Address) {
  // The Vault resource that holds the tokens that are being transferred
  let paymentVault: @{FungibleToken.Vault}
  let vaultData: FungibleTokenMetadataViews.FTVaultData

  prepare(signer: auth(Storage) &Account) {

    let type = CompositeType(vaultIdentifier)
    let identifierSplit = vaultIdentifier.split(separator: ".")
    let address = Address.fromString("0x".concat(identifierSplit[1]))!
    let name = identifierSplit[2]!

    let viewResolver = getAccount(address).contracts.borrow<&{ViewResolver}>(name: name)
        ?? panic("Could not borrow ViewResolver from FungibleToken contract")
    // signer is the parent account
    // get the manager resource and borrow childAccount
    let m = signer.storage.borrow<auth(HybridCustody.Manage) &HybridCustody.Manager>(from: HybridCustody.ManagerStoragePath)
      ?? panic("manager does not exist")
    let childAcct = m.borrowAccount(addr: child) ?? panic("child account not found")
    
    self.vaultData = viewResolver.resolveContractView(resourceType: nil, viewType: Type<FungibleTokenMetadataViews.FTVaultData>()) as! FungibleTokenMetadataViews.FTVaultData?
      ?? panic("Could not get the vault data view for ExampleToken")

    //get Ft cap from child account
    let capType = Type<auth(FungibleToken.Withdraw) &{FungibleToken.Provider}>()
    let controllerID = childAcct.getControllerIDForType(type: capType, forPath: self.vaultData.storagePath)
      ?? panic("no controller found for capType")
    
    let cap = childAcct.getCapability(controllerID: controllerID, type: capType) ?? panic("no cap found")
    let providerCap = cap as! Capability<auth(FungibleToken.Withdraw) &{FungibleToken.Provider}>
    assert(providerCap.check(), message: "invalid provider capability")
    
    // Get a reference to the child's stored vault
    let vaultRef = providerCap.borrow()!

    // Withdraw tokens from the signer's stored vault
    self.paymentVault <- vaultRef.withdraw(amount: amount)
  }

  execute {
    // Get the recipient's public account object
    let recipient = getAccount(to)

    // Get a reference to the recipient's Receiver
    let receiverRef = recipient.capabilities.get<&{FungibleToken.Receiver}>(self.vaultData.receiverPath)!.borrow()
      ?? panic("Could not borrow receiver reference to the recipient's Vault")

    // Deposit the withdrawn tokens in the recipient's receiver
    receiverRef.deposit(from: <-self.paymentVault)
  }
}
`;
    let config = {
      cadence: code.trim(),
      name: "sendChildFtWithParent",
      type: "transaction",
      args: (arg: any, t: any) => [
        arg(vaultIdentifier, t.String),
        arg(amount, t.UFix64),
        arg(to, t.Address),
        arg(child, t.Address),
      ],
      limit: 9999,
    };
    config = await this.runRequestInterceptors(config);
    let txId = await fcl.mutate(config);
    const result = await this.runResponseInterceptors(config, txId);
    return result.response;
  }


  public async transferChildFt(vaultIdentifier: string, sender: string, amount: string) {
    const code = `
import HybridCustody from 0xHybridCustody

// HC-owned imports
import CapabilityFactory from 0xHybridCustody
import CapabilityFilter from 0xHybridCustody

import FungibleToken from 0xFungibleToken
import ViewResolver from 0xMetadataViews
import FungibleTokenMetadataViews from 0xFungibleTokenMetadataViews



transaction(vaultIdentifier:String, sender: Address, amount: UFix64 ) {

  prepare(signer: auth(Storage) &Account) {
    let type = CompositeType(vaultIdentifier)
    let identifierSplit = vaultIdentifier.split(separator: ".")
    let address = Address.fromString("0x".concat(identifierSplit[1]))!
    let name = identifierSplit[2]!

    let viewResolver = getAccount(address).contracts.borrow<&{ViewResolver}>(name: name)
        ?? panic("Could not borrow ViewResolver from FungibleToken contract")
    // signer is the parent account
    // get the manager resource and borrow childAccount
    let m = signer.storage.borrow<auth(HybridCustody.Manage) &HybridCustody.Manager>(from: HybridCustody.ManagerStoragePath)
        ?? panic("manager does not exist")
    let childAcct = m.borrowAccount(addr: sender) ?? panic("child account not found")
    
    let vaultData = viewResolver.resolveContractView(resourceType: nil, viewType: Type<FungibleTokenMetadataViews.FTVaultData>()) as! FungibleTokenMetadataViews.FTVaultData?
        ?? panic("Could not get the vault data view for <Token> ")

    //get Ft cap from child account
    let capType = Type<auth(FungibleToken.Withdraw) &{FungibleToken.Provider}>()
    let controllerID = childAcct.getControllerIDForType(type: capType, forPath: vaultData.storagePath)
        ?? panic("no controller found for capType")
    
    let cap = childAcct.getCapability(controllerID: controllerID, type: capType) ?? panic("no cap found")
    let providerCap = cap as! Capability<auth(FungibleToken.Withdraw) &{FungibleToken.Provider}>
    assert(providerCap.check(), message: "invalid provider capability")
    
    // Get a reference to the child's stored vault
    let vaultRef = providerCap.borrow()!

    // Withdraw tokens from the signer's stored vault
    let paymentVault <- vaultRef.withdraw(amount: amount)
    let receiverRef =  signer.capabilities.get<&{FungibleToken.Receiver}>(vaultData.receiverPath)!.borrow()
    ?? panic("Could not borrow receiver reference to the recipient's Vault")
    receiverRef.deposit(from: <-paymentVault)
  }
}
`;
    let config = {
      cadence: code.trim(),
      name: "transferChildFt",
      type: "transaction",
      args: (arg: any, t: any) => [
        arg(vaultIdentifier, t.String),
        arg(sender, t.Address),
        arg(amount, t.UFix64),
      ],
      limit: 9999,
    };
    config = await this.runRequestInterceptors(config);
    let txId = await fcl.mutate(config);
    const result = await this.runResponseInterceptors(config, txId);
    return result.response;
  }

  // Tag: SrcCadenceTokenScripts
  public async getTokenBalanceStorage(address: string): Promise<Record<string, string>> {
    const code = `
import FungibleToken from 0xFungibleToken

/// Queries for FT.Vault balance of all FT.Vaults in the specified account.
///
access(all) fun main(address: Address): {String: UFix64} {
    // Get the account
    let account = getAuthAccount<auth(BorrowValue) &Account>(address)
    // Init for return value
    let balances: {String: UFix64} = {}
    // Track seen Types in array
    let seen: [String] = []
    // Assign the type we'll need
    let vaultType: Type = Type<@{FungibleToken.Vault}>()
    // Iterate over all stored items & get the path if the type is what we're looking for
    account.storage.forEachStored(fun (path: StoragePath, type: Type): Bool {
        if !type.isRecovered && (type.isInstance(vaultType) || type.isSubtype(of: vaultType)) {
            // Get a reference to the resource & its balance
            let vaultRef = account.storage.borrow<&{FungibleToken.Balance}>(from: path)!
            // Insert a new values if it's the first time we've seen the type
            if !seen.contains(type.identifier) {
                balances.insert(key: type.identifier, vaultRef.balance)
            } else {
                // Otherwise just update the balance of the vault (unlikely we'll see the same type twice in
                // the same account, but we want to cover the case)
                balances[type.identifier] = balances[type.identifier]! + vaultRef.balance
            }
        }
        return true
    })

    // Add available Flow Token Balance
    balances.insert(key: "availableFlowToken", account.availableBalance)

    return balances
}
`;
    let config = {
      cadence: code.trim(),
      name: "getTokenBalanceStorage",
      type: "script",
      args: (arg: any, t: any) => [
        arg(address, t.Address),
      ],
      limit: 9999,
    };
    config = await this.runRequestInterceptors(config);
    let response = await fcl.query(config);
    const result = await this.runResponseInterceptors(config, response);
    return result.response;
  }

  // Tag: SrcCadenceTokenTransactions
  public async enableTokenStorageV2(vaultIdentifier: string) {
    const code = `
import FungibleToken from 0xFungibleToken
import FungibleTokenMetadataViews from 0xFungibleToken
import ViewResolver from 0xMetadataViews


transaction(vaultIdentifier: String) {

    prepare(signer: auth(Storage, Capabilities) &Account) {

       
        let type = CompositeType(vaultIdentifier)
        let identifierSplit = vaultIdentifier.split(separator: ".")
        let address = Address.fromString("0x".concat(identifierSplit[1]))!
        let name = identifierSplit[2]!

        let viewResolver = getAccount(address).contracts.borrow<&{ViewResolver}>(name: name)
            ?? panic("Could not borrow ViewResolver from FungibleToken contract")
        let vaultData = viewResolver.resolveContractView(
                resourceType: type,
                viewType: Type<FungibleTokenMetadataViews.FTVaultData>()
            ) as! FungibleTokenMetadataViews.FTVaultData? ?? panic("Could not resolve FTVaultData view")

        if signer.storage.borrow<&{FungibleToken.Vault}>(from: vaultData.storagePath ) == nil {
            signer.storage.save(<- vaultData.createEmptyVault(), to:vaultData.storagePath)
        }

        if signer.capabilities.exists(vaultData.receiverPath) == false {
            let receiverCapability = signer.capabilities.storage.issue<&{FungibleToken.Vault}>(vaultData.storagePath)
            signer.capabilities.publish(receiverCapability, at: vaultData.receiverPath)
        }
       
        if signer.capabilities.exists(vaultData.metadataPath) == false {
            let balanceCapability = signer.capabilities.storage.issue<&{FungibleToken.Vault}>(vaultData.storagePath)
            signer.capabilities.publish(balanceCapability, at: vaultData.metadataPath)
        }
    
    }
}
`;
    let config = {
      cadence: code.trim(),
      name: "enableTokenStorageV2",
      type: "transaction",
      args: (arg: any, t: any) => [
        arg(vaultIdentifier, t.String),
      ],
      limit: 9999,
    };
    config = await this.runRequestInterceptors(config);
    let txId = await fcl.mutate(config);
    const result = await this.runResponseInterceptors(config, txId);
    return result.response;
  }


  public async transferTokensV3(vaultIdentifier: string, recipient: string, amount: string) {
    const code = `
import FungibleToken from 0xFungibleToken
import StorageRent from 0xStorageRent
import ViewResolver from 0xMetadataViews
import FungibleTokenMetadataViews from 0xFungibleTokenMetadataViews


transaction(vaultIdentifier:String, recipient: Address, amount: UFix64) {

    prepare(signer: auth(Storage, BorrowValue) &Account) {

        let type = CompositeType(vaultIdentifier)
        let identifierSplit = vaultIdentifier.split(separator: ".")
        let address = Address.fromString("0x".concat(identifierSplit[1]))!
        let name = identifierSplit[2]!

        let viewResolver = getAccount(address).contracts.borrow<&{ViewResolver}>(name: name)
            ?? panic("Could not borrow ViewResolver from FungibleToken contract")
        let vaultData = viewResolver.resolveContractView(
                resourceType: type,
                viewType: Type<FungibleTokenMetadataViews.FTVaultData>()
            ) as! FungibleTokenMetadataViews.FTVaultData? ?? panic("Could not resolve FTVaultData view")

         // Get a reference to the signer's stored vault
        let vaultRef = signer.storage.borrow<auth(FungibleToken.Withdraw) &{FungibleToken.Vault}>(from: vaultData.storagePath)
            ?? panic("Could not borrow reference to the owner's Vault!")


           // Get the recipient's public account object
        let recipientAccount = getAccount(recipient)

        // Get a reference to the recipient's Receiver
        let receiverRef = recipientAccount.capabilities.borrow<&{FungibleToken.Vault}>(vaultData.receiverPath)!
            
        // Deposit the withdrawn tokens in the recipient's receiver
        receiverRef.deposit(from: <- vaultRef.withdraw(amount: amount))
        StorageRent.tryRefill(recipient)
    }

}
`;
    let config = {
      cadence: code.trim(),
      name: "transferTokensV3",
      type: "transaction",
      args: (arg: any, t: any) => [
        arg(vaultIdentifier, t.String),
        arg(recipient, t.Address),
        arg(amount, t.UFix64),
      ],
      limit: 9999,
    };
    config = await this.runRequestInterceptors(config);
    let txId = await fcl.mutate(config);
    const result = await this.runResponseInterceptors(config, txId);
    return result.response;
  }}
