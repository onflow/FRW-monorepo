import FungibleToken from 0xFungibleToken
import StorageRent from 0xStorageRent
import ViewResolver from 0xMetadataViews
import FungibleTokenMetadataViews from 0xFungibleTokenMetadataViews
import LostAndFound from 0xLostAndFound
import MetadataViews from 0xMetadataViews
import FlowToken from 0xFlowToken



transaction(vaultIdentifier:String, recipient: Address, amount: UFix64) {

    prepare(acct: auth(Storage, BorrowValue, Capabilities) &Account) {

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

        let vaultDisplay = viewResolver.resolveContractView(
                resourceType: nil,
                viewType: Type<FungibleTokenMetadataViews.FTDisplay>()
            ) as! FungibleTokenMetadataViews.FTDisplay? ?? panic("Could not resolve FTVaultData view")

        let display = MetadataViews.Display(
            name: vaultDisplay.name,
            description: vaultDisplay.description,
            thumbnail: vaultDisplay.logos.items[0].file
        )
         // Get a reference to the signer's stored vault
        let vaultRef = acct.storage.borrow<auth(FungibleToken.Withdraw) &{FungibleToken.Vault}>(from: vaultData.storagePath)
            ?? panic("Could not borrow reference to the owner's Vault!")

        // let sentVault <- vault.withdraw(amount: amount)
           // Get the recipient's public account object
        // let recipientAccount = getAccount(recipient)

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
        
        let flowProvider = provider!

        let flowReceiver = acct.capabilities.get<&FlowToken.Vault>(/public/flowTokenReceiver)!
        // Get a reference to the recipient's Receiver
        // let receiverRef = recipientAccount.capabilities.borrow<&{FungibleToken.Vault}>(vaultData.receiverPath)!
        let receiverCap = getAccount(recipient).capabilities.get<&{FungibleToken.Receiver}>(vaultData.receiverPath)!
        
        let sentVault <- vaultRef.withdraw(amount: amount)

        // Deposit the withdrawn tokens in the recipient's receiver
        // lostandfound.deposit(from: <- sentVault)
        let depositEstimate <- LostAndFound.estimateDeposit(redeemer: recipient, item: <-sentVault, memo: "Send Tokens Backup", display: display)
        let storageFee <- flowProvider.borrow()!.withdraw(amount: depositEstimate.storageFee)
        let item <- depositEstimate.withdraw()

         LostAndFound.trySendResource(
            item: <-item,
            cap: receiverCap,
            memo: "Send Tokens Backup",
            display: display,
            storagePayment: &storageFee as auth(FungibleToken.Withdraw) &{FungibleToken.Vault},
            flowTokenRepayment: flowReceiver
        )

        flowReceiver.borrow()!.deposit(from: <-storageFee)
        destroy depositEstimate
    }

}