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