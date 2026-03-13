//
//  WalletManger+Account.swift
//  FRW
//
//  Created by cat on 5/7/25.
//

import FlowWalletKit
import Foundation
import Flow

// MARK: - Account

extension WalletManager {
    var selectedChildAccount: FlowWalletKit.ChildAccount? {
        guard isSelectedChildAccount else {
            return nil
        }
        guard let selectedAccountAddress else {
            return nil
        }
        return childs?.first { $0.address.hexAddr == selectedAccountAddress }
    }

    var selectedEVMAccount: COA? {
        guard isSelectedEVMAccount else {
            return nil
        }
        return coa
    }
  
    var selectedEOAAccount: EOA? {
      guard isSelectedEOAAccount else {
        return nil
      }
      return EOAs?.first
  }

    var selectedAccountContact: Contact? {
        guard WalletManager.shared.getPrimaryWalletAddressOrCustomWatchAddress() != nil else {
            return nil
        }
        if let account = selectedChildAccount {
            return account.toContact()
        } else if let account = selectedEVMAccount {
            return account.toContact()
        } else {
            return toContact()
        }
    }
}

// MARK: - add account
extension WalletManager {
    func createNewCadenceAccount() async throws {
        guard !isAddingAccount else {
            log.debug("is adding account")
            return
        }
        defer {
            isAddingAccount = false
        }
        guard let fullKey = mainAccount?.fullWeightKey else {
            throw WalletError.invalidPublicKey
        }
        let request = AddAccountRequest(
            hashAlgorithm: fullKey.hashAlgo.index,
            publicKey: fullKey.publicKey.description,
            signatureAlgorithm: fullKey.signAlgo.index,
            weight: fullKey.weight
        )

        isAddingAccount = true
        let response: AddAccountResponse = try await Network.request(FRWAPI.User.addAccount(request))
        guard let txid = response.txid else {
            HUD.error(title: "add failed", message: "add account failed. please try after")
            log.error("add account failed. empty txid")
            return
        }
        let txId = Flow.ID(hex: txid)
        _ = try await txId.onceExecuted()
        if let profile = ProfileManager.shared.currentProfile {
            await ProfileManager.shared.addAccount(byTxId: txid, to: profile)
        }
    }

    func createNewEVMAccount() async throws {
        guard let uid = UserManager.shared.activatedUID else {
            throw LLError.accountNotFound
        }
        guard !isAddingAccount else {
            log.debug("is adding account")
            return
        }
        defer {
            isAddingAccount = false
        }
        let nextIndex = max(LocalUserDefaults.shared.nextEOAIndex(for: uid), 1)
        let index = UInt32(nextIndex)
        guard let address = try walletEntity?.ethAddress(index: index) else {
            throw WalletError.invaildAddress
        }
        LocalUserDefaults.shared.setEOAIndex(nextIndex, for: address, uid: uid)
        let eoa = EOA(address, network: currentNetwork)
        await MainActor.run {
            self.EOAs = allEOAAccounts(with: walletEntity, for: uid)
            if let walletAccount = eoa?.toWalletAccount(
                parentAddress: getPrimaryWalletAddress(),
                userId: uid
            ) {
                ProfileManager.shared.appendEOAAccount(walletAccount)
            }
        }
        log.info("[EOA] created new EOA account: \(address), index: \(nextIndex)")
    }

    /// Derive all EOA addresses from stored index map + default index 0
    func allEOAAccounts(with wallet: FlowWalletKit.Wallet?,for uid: String) -> [EOA] {
        // index 0 from walletEntity
        var result: [EOA] = wallet?.eoaAddress?
            .compactMap { EOA($0, network: currentNetwork) } ?? []

        // Additional EOAs from stored indices (index >= 1)
        let storedIndices = LocalUserDefaults.shared.getEOAIndices(for: uid)
        for (address, _) in storedIndices {
            if !result.contains(where: { $0.address.lowercased() == address.lowercased() }) {
                if let eoa = EOA(address, network: currentNetwork) {
                    result.append(eoa)
                }
            }
        }
        return result
    }

    func eoaIndex() -> UInt32? {
        guard selectedAccount?.type == .eoa else {
            return nil
        }
        guard let currentAddress = selectedAccount?.hexAddr else {
            return nil
        }
        
        for index in 0..<10 {
            if let addr = try? walletEntity?.ethAddress(index: UInt32(index)),
                addr.lowercased() == currentAddress.lowercased() {
                return UInt32(index)
            }
        }
        return nil
    }

    func canAddNewAccount() -> Bool {
        var isFlag = RemoteConfigManager.shared.config?.features.createNewAccount ?? false
#if DEBUG
        isFlag = true
#endif
        guard isFlag else {
            return false
        }
        guard keyProvider?.keyType == .seedPhrase else {
            return false
        }
        return allowCreateCadenceAccount() || allowCreateEVMAccount()
    }

    func allowCreateCadenceAccount() -> Bool {
        return currentNetworkAccounts.count < 5
    }

    func allowCreateEVMAccount() -> Bool {
        guard let count = EOAs?.count else {
            return true
        }
        return count < 5
    }
}

extension WalletManager {
    func toContact() -> Contact? {
        guard let primaryAddr = WalletManager.shared.getPrimaryWalletAddress() else {
            return nil
        }
        let user = WalletUser.get(address:  primaryAddr)
        return Contact(
            address: primaryAddr,
            avatar: nil,
            contactName: nil,
            contactType: .user,
            domain: nil,
            id: UUID().hashValue,
            username: user.name,
            user: user,
            walletType: .flow
        )
    }
}

extension FlowWalletKit.ChildAccount {
    func toContact() -> Contact {
        Contact(address: address.hexAddr, avatar: icon?.absoluteString, contactName: nil, contactType: .user, domain: nil, id: UUID().hashValue, username: name, walletType: .link)
    }
}

extension COA {
    func toContact() -> Contact {
        let showAddress = address.addHexPrefix()
        let user = WalletUser.get(address:  showAddress)
        return Contact(address: showAddress, avatar: nil, contactName: nil, contactType: .user, domain: nil, id: UUID().hashValue, username: user.name, user: user, walletType: .evm)
    }
}
