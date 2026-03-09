import LostAndFound from 0xLostAndFound
import MetadataViews from 0xMetadataViews
import ViewResolver from 0xMetadataViews
import NonFungibleToken from 0xNonFungibleToken
import FlowEVMBridgeUtils from 0xFlowEVMBridge


access(all) fun main(addr: Address): [AnyStruct?] {
    let tickets = LostAndFound.borrowAllTickets(addr: addr)
    
    let displayArr: [AnyStruct?]  = []
    for ticket in tickets {
        if ticket.type.isSubtype(of: Type<@{NonFungibleToken.NFT}>()) { 
            let nftIdentifier = ticket.type.identifier
            let nftContractAddress = FlowEVMBridgeUtils.getContractAddress(fromType: ticket.type)
            ?? panic("Could not get contract address from identifier: ".concat(nftIdentifier))
            let nftContractName = FlowEVMBridgeUtils.getContractName(fromType: ticket.type)
            ?? panic("Could not get contract name from identifier: ".concat(nftIdentifier))

            // resolveView
            let viewResolver = getAccount(nftContractAddress).contracts.borrow<&{ViewResolver}>(name: nftContractName)
            ?? panic("Could not borrow ViewResolver from NFT contract")
            let collectionData = viewResolver.resolveContractView(
                resourceType: nil,
                viewType: Type<MetadataViews.NFTCollectionDisplay>()
            ) as! MetadataViews.NFTCollectionDisplay? ?? panic("Could not resolve NFTCollectionDisplay view")
            
            displayArr.append({"display":ticket.display, "identifier": nftIdentifier, "collectionData": collectionData})
        }
    }
    
    return displayArr
}