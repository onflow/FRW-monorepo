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
 