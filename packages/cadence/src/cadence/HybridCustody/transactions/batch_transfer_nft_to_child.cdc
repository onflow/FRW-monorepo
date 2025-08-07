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