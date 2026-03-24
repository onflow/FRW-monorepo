//
//  SideMenuViewModel.swift
//  FRW
//
//  Created by Hao Fu on 1/4/2025.
//

import Combine
import Factory
import Foundation
import SwiftUI

// MARK: - SideMenuViewModel

struct SideMenuItem {
    let account: WalletAccount
    var isHidden: Bool = false

    static func mock() -> SideMenuItem {
        SideMenuItem(account: .mockMain())
    }
}

class SideMenuViewModel: ObservableObject {
    // MARK: Internal

    @Injected(\.wallet)
    private var wallet: WalletManager

    @Published var hasCoa: Bool = true
    @Published var currentAccount: SideMenuItem? = nil {
        didSet {
            updateCoaStatus()
        }
    }
    @Published var allAccounts: [[SideMenuItem]] = [
        [.mock()], [.mock()], [.mock()],
    ]
    {
        didSet {
            log.debug("[Side] reresh allAccount")
            shouldShowAddingAccount = wallet.canAddNewAccount()
        }
    }
    @Published var shouldShowMigrationCard: Bool = false
    @Published var shouldShowAddingAccount = false
    @Published var isAddingAccount = false
    private var cancellableSet = Set<AnyCancellable>()

    init() {
        ProfileManager.shared.$currentProfile
            .receive(on: DispatchQueue.main)
            .sink { [weak self] profile in
                self?.refreshProfile(profile: profile)
            }
            .store(in: &cancellableSet)

        wallet.$selectedAccount
            .receive(on: DispatchQueue.main)
            .sink { [weak self] account in
                self?.refreshAccount(address: account?.hexAddr)
            }.store(in: &cancellableSet)

        wallet.$isAddingAccount
            .receive(on: DispatchQueue.main)
            .sink { [weak self] isAdding in
                if self?.currentAccount != nil && isAdding {
                    self?.isAddingAccount = isAdding
                } else {
                    self?.isAddingAccount = false
                }
            }
            .store(in: &cancellableSet)

        // Listen for hidden addresses changes
        NotificationCenter.default.publisher(for: .hiddenAddressesDidChanged)
            .receive(on: DispatchQueue.main)
            .sink { [weak self] _ in
                self?.onHiddenAddressesChanged()
            }
            .store(in: &cancellableSet)
    }

    private func refreshProfile(profile: ProfileModel?) {
        guard let profile = profile, profile.accounts.count > 0 else {
            log.debug("[Profile] profile:\(profile?.uid ?? "")")
            refreshAccount(address: nil)
            allAccounts = [[.mock()], [.mock()], [.mock()]]
            return
        }
        let rawEoaIndices = LocalUserDefaults.shared.getEOAIndices(for: profile.uid)
        let eoaIndices = Dictionary(
            rawEoaIndices.map { ($0.key.lowercased(), $0.value) },
            uniquingKeysWith: { first, _ in first }
        )

        let allItems = profile.accounts.map({ list in
            list.map { account in
                let isManuallyHidden = LocalUserDefaults.shared.isAddressHidden(
                    account.address,
                    for: profile.uid
                )
                let isHidden = account.isHidden || isManuallyHidden
                log.debug("[Side] hide \(account.address):\(account.isHidden) or \(isManuallyHidden)")
                return SideMenuItem(account: account, isHidden: isHidden)
            }
        })
        log.debug("[Side] hidden address \(LocalUserDefaults.shared.getHiddenAddresses(for:profile.uid))")
        // Separate eoa and main groups, sort independently, then merge (eoa first)
        let eoaGroups = allItems.filter { $0.first?.account.type == .eoa }
            .sorted { lhs, rhs in
                let lhsIndex =
                    eoaIndices[lhs.first?.account.address.lowercased() ?? ""] ?? 0
                let rhsIndex =
                    eoaIndices[rhs.first?.account.address.lowercased() ?? ""] ?? 0
                return lhsIndex < rhsIndex
            }
        let mainGroups = allItems.filter { $0.first?.account.type == .main }
            .sorted { lhs, rhs in
                let lhsAddr = lhs.first?.account.address.lowercased() ?? ""
                let rhsAddr = rhs.first?.account.address.lowercased() ?? ""
                return lhsAddr < rhsAddr
            }
        let otherGroups = allItems.filter {
            guard let type = $0.first?.account.type else { return true }
            return type != .eoa && type != .main
        }
        log.debug("[Side] eoa index:\(eoaIndices)")
        log.debug("[Side] eoa: \(eoaGroups.map({ $0.first?.account.address }))")
        if eoaGroups.count == 2 {
            log.debug("[Side] ")
        }
        allAccounts = eoaGroups + mainGroups + otherGroups
        if let address = wallet.selectedAccount?.hexAddr {
            refreshAccount(address: address)
            updateMigrationCardVisibility(for: currentAccount)
        }
    }

    private func refreshAccount(address: String?) {
        guard let address = address else {
            currentAccount = nil
            log.debug("[Profile] find current account:\(address ?? "")")
            return
        }
        var result: SideMenuItem? = nil
        for list in allAccounts {
            for account in list {
                if account.account.address.lowercased() == address.lowercased() {
                    result = account
                    break
                }
            }
            if result != nil {
                break
            }
        }
        log.debug("[Profile] find current account:\(result?.account)")
        currentAccount = result
    }

    func updateCurrentAccount(_ selectedAccount: SideMenuItem) {
        WalletManager.shared.switchSelectedAccount(selectedAccount.account)
        NotificationCenter.default.post(name: .toggleSideMenu)
        updateMigrationCardVisibility(for: selectedAccount)
    }

    func switchAccountMoreAction() {
        Router.route(to: RouteMap.Profile.switchProfile)
    }

    func onClickEnableEVM() {
        NotificationCenter.default.post(name: .toggleSideMenu)
        Router.route(to: RouteMap.Wallet.enableEVM)
    }

    func onClickMigrationCard() {
        NotificationCenter.default.post(name: .toggleSideMenu)
        Router.route(to: RouteMap.ReactNative.migration)
    }

    private func onHiddenAddressesChanged() {
        // Refresh hidden states for all accounts
        guard let profile = ProfileManager.shared.currentProfile else { return }
        refreshProfile(profile: profile)
    }

    private func updateMigrationCardVisibility(for item: SideMenuItem?) {
        shouldShowMigrationCard = false
        guard
            let coaMigration = RemoteConfigManager.shared.config?.features
                .coaMigration, coaMigration
        else {
            return
        }
        guard let item else {
            return
        }
        guard item.account.type == .coa else {
            return
        }

        guard let list = wallet.EOAs, list.count > 0 else {
            return
        }

        let address = item.account.address.lowercased()
        guard
            let group = allAccounts.first(where: { accounts in
                accounts.contains { $0.account.address.lowercased() == address }
            })
        else {
            return
        }

        guard
            let coaAccount = group.first(where: { account in
                account.account.type == .coa
            })
        else {
            return
        }
        let balance = coaAccount.account.assets.balance ?? 0
        let nftCount = coaAccount.account.assets.nftCount ?? 0
        let erc20Count = coaAccount.account.assets.erc20Balance ?? 0
        self.shouldShowMigrationCard = balance > 0 || nftCount > 0 || erc20Count > 0
    }

}

extension SideMenuViewModel {
    private func updateCoaStatus() {
        self.hasCoa = true
        guard let account = self.currentAccount?.account else { return }
        guard account.type == .main else { return }
        guard let mainAccount = wallet.mainAccount else { return }
        guard wallet.keyProvider?.keyType != .secureEnclave else { return }
        if mainAccount.hasCOA {
            self.hasCoa = true
        } else {
            Task {
                do {
                    log.debug("[SideMenu] refresh coa info")
                    try? await mainAccount.fetchAccount()
                    await MainActor.run {
                        self.hasCoa = mainAccount.hasCOA
                    }
                }
            }
        }
        log.debug(" [Sidemenu] updateCoaStatus: \(account.address) : \(self.hasCoa ? "true" : "false") ")
    }
}
