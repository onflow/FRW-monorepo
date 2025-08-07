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