//
//  UrlProvider.swift
//  FRW
//
//  Created by Antonio Bello on 11/20/24.
//

import Flow
import Foundation

enum AccountType {
    case flow, evm

    init(isEvm: Bool) {
        self = isEvm ? .evm : .flow
    }

    var accountPath: String {
        switch self {
        case .flow:
            return "account"
        case .evm:
            return "address"
        }
    }

    static var current: Self {
        return WalletManager.shared.isSelectedEVMAccount ? .evm : .flow
    }
}

extension Flow.ChainID {
    func getTransactionHistoryUrl(accountType: AccountType, transactionId: String) -> URL? {
        let url = explorerUrl(id: transactionId, type: "tx", accountType: accountType)
#if DEBUG
        log.info("[Explorer] tx: \(accountType == .evm ? "evm" : "flow") id=\(transactionId) → \(url?.absoluteString ?? "nil")")
#endif
        return url
    }

    func getAccountUrl(accountType: AccountType, address: String) -> URL? {
        let type = accountType == .evm ? "address" : "account"
        let url = explorerUrl(id: address, type: type, accountType: accountType)
#if DEBUG
        log.info("[Explorer] account: \(accountType == .evm ? "evm" : "flow") addr=\(address) → \(url?.absoluteString ?? "nil")")
#endif
        return url
    }

    /// Build explorer redirect URL via backend /api/v4/explorer endpoint.
    /// The returned URL triggers a 302 redirect to the appropriate block explorer.
    func explorerUrl(id: String, type: String, accountType: AccountType) -> URL? {
        let base: String = Config.get(.lilicoWeb)
        let chain = accountType == .evm ? "evm" : "flow"
        let network = self == .testnet ? "testnet" : "mainnet"

        var components = URLComponents(string: "\(base)v4/explorer")
        components?.queryItems = [
            URLQueryItem(name: "id", value: id),
            URLQueryItem(name: "type", value: type),
            URLQueryItem(name: "chain", value: chain),
            URLQueryItem(name: "network", value: network),
        ]

        if components?.url == nil {
            log.error("[Explorer] failed to build URL: base=\(base) id=\(id) type=\(type) chain=\(chain) network=\(network)")
        }
#if DEBUG
        log.debug("[Explorer] \(components?.url?.absoluteString ?? "")")
#endif
        return components?.url
    }

}
