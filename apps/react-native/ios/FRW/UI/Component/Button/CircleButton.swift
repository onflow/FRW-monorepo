//
//  CircleButton.swift
//  FRW
//
//  Created by cat on 5/6/25.
//

import SwiftUI
import UIKit

// MARK: - Style

extension CircleButton {
    enum Style {
        case menu, add,inbox
        case custom(String)

        var imageName: String {
            switch self {
            case .menu:
                "icon-wallet-manager"
            case .add:
                "icon-wallet-coin-add"
            case .inbox:
                "icon-inbox"
            case let .custom(name):
                name
            }
        }

        var size: CGFloat {
            switch self {
            case .menu:
                28
            default:
                24
            }
        }
    }
}

// MARK: - CircleButton

struct CircleButton: View {
    let image: CircleButton.Style
    let size: CGFloat
    let badgeCount: Int?
    let onClick: EmptyClosure

    init(image: CircleButton.Style, size:CGFloat = 40, badgeCount: Int? = nil, onClick: @escaping EmptyClosure) {
        self.image = image
        self.size = size
        self.badgeCount = badgeCount
        self.onClick = onClick
    }

    private var badgeText: String {
        guard let badgeCount else { return "" }
        return badgeCount > 99 ? "99+" : "\(badgeCount)"
    }

    private var shouldShowBadge: Bool {
        guard let badgeCount else { return false }
        return badgeCount > 0
    }

    var body: some View {
        Button {
            onClick()
        } label: {
            HStack {
                Image(image.imageName)
                    .resizable()
                    .renderingMode(.template)
                    .foregroundStyle(Color.Theme.Text.black8)
                    .frame(width: image.size, height: image.size)
            }
            .frame(width: size, height: size)
            .background(Color.Theme.Special.white1)
            .clipShape(Circle())
            .overlay(alignment: .topTrailing) {
                if shouldShowBadge {
                    Text(badgeText)
                        .font(.inter(size: 12, weight: .semibold))
                        .foregroundStyle(Color.Brain.Core.background)
                        .lineLimit(1)
                        .minimumScaleFactor(0.8)
                        .frame(minWidth: 16, minHeight: 16)
                        .background(Color.Theme.Accent.green)
                        .clipShape(Capsule())
                }
            }
        }
        .buttonStyle(ScaleButtonStyle())
    }
}

// MARK: - CircleUIKitButton

final class CircleUIKitButton: UIButton {
    var image: CircleButton.Style {
        didSet {
            updateImage()
            setNeedsLayout()
        }
    }

    var size: CGFloat {
        didSet {
            invalidateIntrinsicContentSize()
            setNeedsLayout()
        }
    }

    var badgeCount: Int? {
        didSet {
            updateBadge()
        }
    }

    override var intrinsicContentSize: CGSize {
        CGSize(width: buttonSize, height: buttonSize)
    }

    override var isHighlighted: Bool {
        didSet {
            UIView.animate(withDuration: 0.2) {
                self.transform = self.isHighlighted ? CGAffineTransform(scaleX: 0.95, y: 0.95) : .identity
                self.alpha = self.isHighlighted ? 0.95 : 1
            }
        }
    }

    private let iconImageView = UIImageView()
    private let badgeView = UIView()
    private let badgeLabel = UILabel()

    private let defaultButtonSize: CGFloat = 40
    private let badgeHeight: CGFloat = 16

    init(image: CircleButton.Style, size: CGFloat = 40, badgeCount: Int? = nil) {
        self.image = image
        self.size = size
        self.badgeCount = badgeCount
        super.init(frame: .zero)
        commonInit()
    }

    override init(frame: CGRect) {
        image = .menu
        size = 40
        badgeCount = nil
        super.init(frame: frame)
        commonInit()
    }

    @available(*, unavailable)
    required init?(coder: NSCoder) {
        fatalError("init(coder:) has not been implemented")
    }

    override func layoutSubviews() {
        super.layoutSubviews()

        layer.cornerRadius = min(bounds.width, bounds.height) * 0.5

        let iconSize = image.size
        iconImageView.frame = CGRect(
            x: (bounds.width - iconSize) * 0.5,
            y: (bounds.height - iconSize) * 0.5,
            width: iconSize,
            height: iconSize
        )

        guard !badgeView.isHidden else { return }

        let textSize = badgeLabel.sizeThatFits(
            CGSize(width: CGFloat.greatestFiniteMagnitude, height: badgeHeight)
        )
        let badgeWidth = max(badgeHeight, ceil(textSize.width) + badgeHorizontalPadding * 2)
        badgeView.frame = CGRect(
            x: bounds.width - badgeWidth,
            y: 0,
            width: badgeWidth,
            height: badgeHeight
        )
        badgeView.layer.cornerRadius = badgeHeight * 0.5
        badgeLabel.frame = badgeView.bounds
    }

    private func commonInit() {
        backgroundColor = UIColor.Theme.Special.white1
        clipsToBounds = false

        iconImageView.contentMode = .scaleAspectFit
        addSubview(iconImageView)

        badgeView.backgroundColor = UIColor.Theme.Accent.green
        badgeView.isHidden = true
        addSubview(badgeView)

        badgeLabel.font = .inter(size: 12, weight: .semibold)
        badgeLabel.textAlignment = .center
        badgeLabel.textColor = UIColor.Brand.Core.background
        badgeLabel.adjustsFontSizeToFitWidth = true
        badgeLabel.minimumScaleFactor = 0.8
        badgeView.addSubview(badgeLabel)

        updateImage()
        updateBadge()
    }

    private func updateImage() {
        iconImageView.image = UIImage(named: image.imageName)?.withRenderingMode(.alwaysTemplate)
        iconImageView.tintColor = UIColor.Theme.Text.black8
    }

    private func updateBadge() {
        guard let badgeCount, badgeCount > 0 else {
            badgeView.isHidden = true
            return
        }

        badgeView.isHidden = false
        badgeLabel.text = badgeCount > 99 ? "99+" : "\(badgeCount)"
        setNeedsLayout()
    }

    private var buttonSize: CGFloat {
        size > 0 ? size : defaultButtonSize
    }

    private var badgeHorizontalPadding: CGFloat {
        0
    }
}

#Preview {
    HStack {
        CircleButton(image: .menu) {}
        CircleButton(image: .add, badgeCount: 3) {}
    }
}
