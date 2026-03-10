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
    func addNewAccount() async throws {
        guard !isAddingAccount else {
            log.debug("is adding account")
            return
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
            isAddingAccount = false
            return
        }
        let txId = Flow.ID(hex: txid)
        _ = try await txId.onceExecuted()
        if let profile = ProfileManager.shared.currentProfile {
            await ProfileManager.shared.addAccount(byTxId: txid, to: profile)
        }
        isAddingAccount = false
    }

    func canAddNewAccount() -> Bool {
        var isFlag = RemoteConfigManager.shared.config?.features.createNewAccount ?? false
#if DEBUG
        isFlag = RemoteConfigManager.shared.config?.features.createNewAccount ?? true
#endif
        guard isFlag else {
            return false
        }
        guard keyProvider?.keyType != .secureEnclave else {
            return false
        }
        return currentNetworkAccounts.count < 5
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
