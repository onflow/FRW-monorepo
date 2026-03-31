import LostAndFound from 0xLostAndFound
import MetadataViews from 0xMetadataViews
import FungibleToken from 0xFungibleToken

import FungibleTokenMetadataViews from 0xFungibleTokenMetadataViews
import ViewResolver from 0xViewResolver
import FlowEVMBridgeUtils from 0xFlowEVMBridgeUtils

access(all) fun main(addr: Address): [AnyStruct?] {
    let tickets = LostAndFound.borrowAllTickets(addr: addr)
    
    let displayArr: [AnyStruct?]  = []
    for ticket in tickets {
    
        if ticket.type.isSubtype(of: Type<@{FungibleToken.Vault}>()) { 
            let vaultIdentifier = ticket.type.identifier
            let vaultType = CompositeType(vaultIdentifier)
            ?? panic("Could not construct Vault type from identifier: ".concat(vaultIdentifier))
            // Parse the Vault identifier into its components
            let tokenContractAddress = FlowEVMBridgeUtils.getContractAddress(fromType: vaultType)
                ?? panic("Could not get contract address from identifier: ".concat(vaultIdentifier))
            let tokenContractName = FlowEVMBridgeUtils.getContractName(fromType: vaultType)
                ?? panic("Could not get contract name from identifier: ".concat(vaultIdentifier))
            let viewResolver = getAccount(tokenContractAddress).contracts.borrow<&{ViewResolver}>(name: tokenContractName)
                ?? panic("Could not borrow ViewResolver from FungibleToken contract")
            let FTDisplay = viewResolver.resolveContractView(
                    resourceType: vaultType,
                    viewType: Type<FungibleTokenMetadataViews.FTDisplay>()
                ) as! FungibleTokenMetadataViews.FTDisplay? ?? panic("Could not resolve FTDisplay view")

            displayArr.append({"display": ticket.display, "balance": ticket.getFungibleTokenBalance(), "identifier": vaultIdentifier, "FTDisplay": FTDisplay})
        }
    }
    return displayArr
}