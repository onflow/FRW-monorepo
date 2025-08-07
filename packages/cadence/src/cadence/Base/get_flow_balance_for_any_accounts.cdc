import EVM from 0xEVM

// Get the account balance for a COA account
access(all) fun getEVMBalance(_ address: String): UFix64? {
    return EVM.addressFromString(address).balance().inFLOW()
}

// Get the available account balance for a Flow account
access(all) fun getFlowBalance(_ address: String): UFix64? {
    if let account = Address.fromString(address) {
        // Use available balance instead of total balance
        return getAccount(account).availableBalance
    }
    return nil
}

access(all) fun main(addresses: [String]): {String: UFix64?} {
    let res: {String: UFix64?} = {}

    for addr in addresses {
        let hex = addr[1] == "x" ? addr : "0x".concat(addr)
        if let flowBalance = getFlowBalance(hex) {
            res[hex] = flowBalance
        } else {
            if let evmBalance = getEVMBalance(hex) {
                res[hex] = evmBalance
            }
        }
    }
    return res
}