import LostAndFound from 0xLostAndFound

access(all) fun main(addr: Address): Int {
    let shelfManager = LostAndFound.borrowShelfManager()
    let shelf = shelfManager.borrowShelf(redeemer: addr)
    if shelf == nil {
        return 0
    }
    
    return shelf!.getRedeemableTypes().length
}