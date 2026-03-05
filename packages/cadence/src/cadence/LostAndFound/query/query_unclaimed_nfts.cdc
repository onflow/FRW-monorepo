import LostAndFound from 0xLostAndFound
import MetadataViews from 0xMetadataViews
import NonFungibleToken from 0xNonFungibleToken

access(all) fun main(addr: Address): [AnyStruct?] {
    let tickets = LostAndFound.borrowAllTickets(addr: addr)
    
    let displayArr: [AnyStruct?]  = []
    for ticket in tickets {
        if ticket.type.isSubtype(of: Type<@{NonFungibleToken.NFT}>()) { 
            displayArr.append({"display":ticket.display, "identifier": ticket.type.identifier})
        }
    }
    
    return displayArr
}