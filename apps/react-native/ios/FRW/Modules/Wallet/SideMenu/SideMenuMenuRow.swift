//
//  SideMenuMenuRow.swift
//  FRW
//
//  Created by cat on 3/31/26.
//

import SwiftUI

// MARK: - IconCircle

extension SideMenuView {
    struct IconCircle: View {
        let imageName: String
        var isSystemImage: Bool = false
        var body: some View {
            Group {
                if isSystemImage {
                    Image(systemName: imageName)
                        .foregroundStyle(Color.Theme.Text.black8)
                        .font(.system(size: 14).bold())
                } else {
                    Image(imageName)
                        .resizable()
                        .renderingMode(.template)
                        .foregroundStyle(Color.Theme.Text.black8)
                        .aspectRatio(contentMode: .fit)
                }
            }
            .frame(width: 14, height: 14)
            .padding(13)
            .background(Color.Brain.Light.lines10)
            .clipShape(Circle())
        }
    }
}

// MARK: - MenuRow

extension SideMenuView {
    struct MenuRow<Icon: View>: View {
        let title: String
        let action: () -> Void
        @ViewBuilder let icon: () -> Icon

        var body: some View {
            Button(action: action) {
                HStack {
                    icon()

                    Text(title)
                        .font(.inter(size: 14, weight: .semibold))
                        .foregroundStyle(Color.Theme.Text.black8)

                    Spacer()
                }
                .contentShape(Rectangle())
                .frame(height: 40)
            }
            .buttonStyle(ScaleButtonStyle())
        }
    }
}

// MARK: - SectionHeader

extension SideMenuView {
    struct SectionHeader: View {
        let title: String

        var body: some View {
            HStack {
                Text(title)
                    .font(.inter(size: 14))
                    .foregroundStyle(Color.Theme.Text.black8)
                    .padding(.vertical, 16)
                Spacer()
            }
        }
    }
}

#Preview("MenuRow") {
    VStack {
        SideMenuView.MenuRow(title: "Refresh Accounts") {
        } icon: {
            SideMenuView.IconCircle(imageName: "arrow.trianglehead.2.clockwise", isSystemImage: true)
        }

        SideMenuView.MenuRow(title: "Import Wallet") {
        } icon: {
            SideMenuView.IconCircle(imageName: "icon-nft-add")
        }

        SideMenuView.MenuRow(title: "Active Account") {
        } icon: {
            SideMenuView.IconCircle(imageName: "icon_side_link")
        }
    }
    .padding(.horizontal, 18)
}
