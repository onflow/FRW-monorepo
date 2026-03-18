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
            log.debug("[inbox] don't login")
            resetUnclaimedState()
            return
        }
        guard RemoteConfigManager.shared.config?.features.cadenceInbox ?? false else {
            log.debug("[inbox] the flag of cadence inbox don't open or nil")
            self.resetUnclaimedState()
            self.removeUnclaimedNews(userId: uid)
            return
        }

        let addresses = unclaimedQueryAddresses()
        guard !addresses.isEmpty else {
            await MainActor.run {
                self.resetUnclaimedState()
                self.removeUnclaimedNews(userId: uid)
            }
            return
        }

        let countMap = await queryUnclaimedCountByAddress(addresses)
        await MainActor.run {
            self.unclaimedCountByAddress = countMap
            self.syncSelectedUnclaimedCount()
            self.syncUnclaimedNewsForCurrentAccount(userId: uid)
        }
    }

    func addUnclaimedNews(userId: String) -> RemoteConfigManager.News {
        let newsId = WalletManager.UnclaimedTag + userId
        return RemoteConfigManager.News(
            id: newsId,
            priority: .high,
            type: .message,
            title: "unclaimed_assets_title".localized,
            body: "unclaimed_assets_message".localized,
            icon: nil,
            image: nil,
            url: nil,
            expiryTime: .distantFuture,
            displayType: .click,
            flag: .unclaimed,
            conditions: nil,
            localIcon: "icon-inbox"
        )
    }

    func removeUnclaimedNews(userId: String) {
        let newsId = WalletManager.UnclaimedTag + userId
        WalletNewsHandler.shared.onRemoveItem(newsId)
    }

    @MainActor
    func resetUnclaimedState() {
        unclaimedCount = 0
        unclaimedCountByAddress = [:]
    }

    @MainActor
    func syncSelectedUnclaimedCount() {
        guard let selectedAddress = selectedCadenceAddressForUnclaimed else {
            unclaimedCount = 0
            return
        }

        unclaimedCount = max(0, unclaimedCountByAddress[selectedAddress] ?? 0)
    }

    @MainActor
    func syncUnclaimedNewsForCurrentAccount(userId: String? = UserManager.shared.activatedUID) {
        guard let userId else { return }

        if unclaimedCount > 0 {
            WalletNewsHandler.shared.addRemoteNews([addUnclaimedNews(userId: userId)])
        } else {
            removeUnclaimedNews(userId: userId)
        }
    }

    private var selectedCadenceAddressForUnclaimed: String? {
        guard let selectedAccount, selectedAccount.vmType == .cadence else {
            return nil
        }
        return normalizeAddress(selectedAccount.hexAddr)
    }

    private func normalizeAddress(_ address: String) -> String {
        address.lowercased()
    }

    private func unclaimedQueryAddresses() -> [String] {
        var uniqueAddresses = Set<String>()

        for account in currentNetworkAccounts {
            uniqueAddresses.insert(normalizeAddress(account.hexAddr))
        }

        if let selectedCadenceAddressForUnclaimed {
            uniqueAddresses.insert(selectedCadenceAddressForUnclaimed)
        }

        return Array(uniqueAddresses)
    }

    private func queryUnclaimedCountByAddress(_ addresses: [String]) async -> [String: Int] {
        await withTaskGroup(of: (String, Int).self) { group in
            for address in addresses {
                group.addTask {
                    do {
                        let count = try await FlowNetwork.batchQueryUnclaimedNumber(addresses: [address])
                        return (address, max(0, count))
                    } catch {
                        log.error("[Unclaimed] query failed for \(address): \(error)")
                        return (address, 0)
                    }
                }
            }

            var result: [String: Int] = [:]
            for await (address, count) in group {
                result[address] = count
            }
            return result
        }
    }
}
