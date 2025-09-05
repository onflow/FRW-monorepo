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