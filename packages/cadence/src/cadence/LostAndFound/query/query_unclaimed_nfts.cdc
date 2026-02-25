import LostAndFound from 0xLostAndFound
import MetadataViews from 0xMetadataViews
import NonFungibleToken from 0xNonFungibleToken

access(all) fun main(addr: Address): [&MetadataViews.Display?] {
    let tickets = LostAndFound.borrowAllTickets(addr: addr)
    
    let displayArr: [&MetadataViews.Display?]  = []
    for ticket in tickets {
        if ticket.type.isSubtype(of: Type<@{NonFungibleToken.NFT}>()) { 
            displayArr.append(ticket.display)
        }
    }
    
    return displayArr
}