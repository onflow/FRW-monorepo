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