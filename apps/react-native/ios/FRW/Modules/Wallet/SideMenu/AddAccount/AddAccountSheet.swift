//
//  AddAccountSheet.swift
//  FRW
//
//  Created by cat on 3/13/26.
//

import SwiftUI
import Factory

struct AddAccountSheet: View {
    @Injected(\.wallet)
    private var wallet: WalletManager

    var body: some View {
        VStack(spacing: 0) {
            VStack(spacing: 0) {
                // Create a new Flow Cadence account
                Button {
                    onCreateCadenceAccount()
                } label: {
                    HStack(spacing: 8) {
                        Image(systemName: "plus.circle")
                            .resizable()
                            .frame(width: 24, height: 24)
                            .foregroundStyle(Color.Brain.Core.icons)

                        Text("create_cadence_account".localized)
                            .font(.inter(size: 14, weight: .semibold))
                            .foregroundStyle(Color.Brain.Text.primary)
                            .lineLimit(1)

                        Spacer()
                    }
                    .padding(.vertical, 16)
                    .contentShape(Rectangle())
                }
                .buttonStyle(ScaleButtonStyle())

                Divider()
                    .background(Color.Brain.Core.dividers)

                // Create a new Flow EVM Account
                Button {
                    onCreateEVMAccount()
                } label: {
                    HStack(spacing: 8) {
                        Image(systemName: "shippingbox")
                            .resizable()
                            .aspectRatio(contentMode: .fit)
                            .frame(width: 24, height: 24)
                            .foregroundStyle(Color.Brain.Core.icons)

                        Text("create_evm_account".localized)
                            .font(.inter(size: 14, weight: .semibold))
                            .foregroundStyle(Color.Brain.Text.primary)
                            .lineLimit(1)

                        Spacer()
                    }
                    .padding(.vertical, 16)
                    .contentShape(Rectangle())
                }
                .buttonStyle(ScaleButtonStyle())
            }
            .padding(.horizontal, 18)
            .background(Color.Brain.Light.lines10)
            .cornerRadius(16)
        }
        .padding(.horizontal, 18)
        .padding(.bottom, 4)
    }

    // MARK: Private

    private func onCreateCadenceAccount() {
        guard WalletManager.shared.allowCreateCadenceAccount() else {
            log.info("[AddAccount] Reach the maximum of Cadence creation quantity")
            HUD.info(title: "Reach the max number")
            return
        }
        dismiss()
        Task {
            do {
                try await wallet.createNewCadenceAccount()
            } catch {
                log.error("[AddAccount] create Cadence account failed: \(error)")
            }
        }
    }

    private func onCreateEVMAccount() {
        guard WalletManager.shared.allowCreateEVMAccount() else {
            log.info("[AddAccount] Reach the maximum of EOA creation quantity")
            HUD.info(title: "Reach the max number")
            return
        }
        dismiss()
        Task {
            do {
                try await wallet.createNewEVMAccount()
            } catch {
                log.error("[AddAccount] create EVM account failed: \(error)")
            }
        }
    }

    private func dismiss() {
        Router.dismiss()
    }
}

#Preview {
    AddAccountSheet()
        .background(Color.black)
}
