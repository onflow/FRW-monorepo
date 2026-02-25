import NonFungibleToken from 0xNonFungibleToken
import ViewResolver from 0xMetadataViews
import MetadataViews from 0xMetadataViews
import LostAndFound from 0xLostAndFound
import FungibleToken from 0xFungibleToken
import FlowToken from 0xFlowToken


// This transaction is for transferring and NFT from
// one account to another

transaction(identifier: String, recipient: Address, ids: [UInt64]) {

    prepare(acct: auth(Storage, BorrowValue, Capabilities) &Account) {

        let type = CompositeType(identifier)
        let identifierSplit = identifier.split(separator: ".")
        let address = Address.fromString("0x".concat(identifierSplit[1]))!
        let name = identifierSplit[2]!
        let viewResolver = getAccount(address).contracts.borrow<&{ViewResolver}>(name: name)
        ?? panic("Could not borrow ViewResolver from NFT contract")


        let collectionData = viewResolver.resolveContractView(
            resourceType: type,
            viewType: Type<MetadataViews.NFTCollectionData>()
        ) as! MetadataViews.NFTCollectionData? ?? panic("Could not resolve NFTCollectionData view")
        // borrow a reference to the signer's NFT collection
        let collectionRef = acct.storage.borrow<auth(NonFungibleToken.Withdraw) &{NonFungibleToken.Provider}>(from: collectionData.storagePath)
            ?? panic("Could not borrow a reference to the owner's collection")
  var provider: Capability<auth(FungibleToken.Withdraw) &FlowToken.Vault>? = nil
        acct.capabilities.storage.forEachController(forPath: /storage/flowTokenVault, fun(c: &StorageCapabilityController): Bool {
            if c.borrowType == Type<auth(FungibleToken.Withdraw) &FlowToken.Vault>() {
                provider = c.capability as! Capability<auth(FungibleToken.Withdraw) &FlowToken.Vault>
            }
            return true
        })

        if provider == nil {
            provider = acct.capabilities.storage.issue<auth(FungibleToken.Withdraw) &FlowToken.Vault>(/storage/flowTokenVault)
        }

        let flowReceiver = acct.capabilities.get<&FlowToken.Vault>(/public/flowTokenReceiver)!
        let receiverCap = getAccount(recipient).capabilities.get<&{NonFungibleToken.CollectionPublic}>(collectionData.publicPath)!
        let flowProvider = provider!
        
        for withdrawID in ids {
            let nft <- collectionRef.withdraw(withdrawID: withdrawID)
            let display = nft.resolveView(Type<MetadataViews.Display>()) as! MetadataViews.Display?

            let depositEstimate <- LostAndFound.estimateDeposit(redeemer: recipient, item: <- nft, memo: "Send NFTs backup", display: display)
            let storageFee <- flowProvider.borrow()!.withdraw(amount: depositEstimate.storageFee)
            let item <- depositEstimate.withdraw()
            // withdraw the NFT from the owner''s collection
            // let nft <- collectionRef.withdraw(withdrawID: withdrawID)
            // Deposit the NFT in the recipient''s collection
            // recipientRef!.deposit(token: <-nft)
            LostAndFound.trySendResource(
                item: <-item,
                cap: receiverCap,
                memo: "Send NFTs Backup",
                display: display,
                storagePayment: &storageFee as auth(FungibleToken.Withdraw) &{FungibleToken.Vault},
                flowTokenRepayment: flowReceiver
            )
            flowReceiver.borrow()!.deposit(from: <-storageFee)
            destroy depositEstimate

        }

    }
}