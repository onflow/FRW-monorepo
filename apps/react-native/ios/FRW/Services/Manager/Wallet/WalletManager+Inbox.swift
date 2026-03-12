//
//  WalletManager+Inbox.swift
//  FRW
//
//  Created by cat on 3/12/26.
//

import Foundation

extension WalletManager {
    static let UnclaimedTag = "Unclaimed:"
    func fetchUnclaimedCount() async throws {
        guard let uid = UserManager.shared.activatedUID else {
            return
        }
        let addresses = currentNetworkAccounts.map { $0.hexAddr }
        unclaimedCount = try await FlowNetwork.batchQueryUnclaimedNumber(addresses: addresses)
        if unclaimedCount > 0 {
            let news = addUnclaimedNews(userId: uid)
            WalletNewsHandler.shared.addRemoteNews([news])
        } else {
            removeUnclaimedNews(userId: uid)
        }
    }

    func addUnclaimedNews(userId: String) -> RemoteConfigManager.News {
        let newsId = WalletManager.UnclaimedTag + userId
        return RemoteConfigManager.News(
            id: newsId,
            priority: .high,
            type: .message,
            title: "Claim received assets",
            body: "",
            icon: nil,
            image: "flow",
            url: nil,
            expiryTime: .distantFuture,
            displayType: .click,
            flag: .unclaimed,
            conditions: nil
        )
    }

    func removeUnclaimedNews(userId: String) {
        let newsId = WalletManager.UnclaimedTag + userId
        WalletNewsHandler.shared.onRemoveItem(newsId)
    }
}
