import LostAndFound from 0xLostAndFound

access(all) fun main(addrs: [Address]): Int {
    let shelfManager = LostAndFound.borrowShelfManager()
    var unclaimedNumber = 0
    for addr in addrs {
        let shelf = shelfManager.borrowShelf(redeemer: addr)
        if shelf == nil {
            continue
        } else {
            unclaimedNumber = unclaimedNumber + shelf!.getRedeemableTypes().length
        }
        
    }
    return unclaimedNumber
}