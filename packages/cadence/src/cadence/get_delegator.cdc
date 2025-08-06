import FlowStakingCollection from 0xFlowStakingCollection
import FlowIDTableStaking from 0xFlowIDTableStaking
import LockedTokens from 0xLockedTokens

 access(all) struct DelegatorInfo {
    access(all) let id: UInt32
    access(all) let nodeID: String
    access(all) let tokensCommitted: UFix64
    access(all) let tokensStaked: UFix64
    access(all) let tokensUnstaking: UFix64
    access(all) let tokensRewarded: UFix64
    access(all) let tokensUnstaked: UFix64
    access(all) let tokensRequestedToUnstake: UFix64
}

access(all) fun main(address: Address): [DelegatorInfo]? {
    var res: [DelegatorInfo]? = nil

    let inited = FlowStakingCollection.doesAccountHaveStakingCollection(address: address)

    if inited {
        let result = FlowStakingCollection.getAllDelegatorInfo(address: address)
        for info in result {
            res.append(DelegatorInfo(id: info.id, nodeID: info.nodeID, tokensCommitted: info.tokensCommitted, tokensStaked: info.tokensStaked, tokensUnstaking: info.tokensUnstaking, tokensRewarded: info.tokensRewarded, tokensUnstaked: info.tokensUnstaked, tokensRequestedToUnstake: info.tokensRequestedToUnstake))
        }
    }
    return res
}
