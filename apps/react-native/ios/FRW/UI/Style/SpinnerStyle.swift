//
//  SpinnerStyle.swift
//  Flow Wallet
//
//  Created by Hao Fu on 2/1/22.
//

import Foundation
import SwiftUI

class SpinnerStyle {
    static let primary: VSpinnerModelContinous = {
        var model: VSpinnerModelContinous = .init()
        model.colors.spinner = Color.LL.orange
        model.layout.dimension = 19
        return model
    }()
}

// MARK: - CircleStrokeSpinView

/// A SwiftUI port of NVActivityIndicatorAnimationCircleStrokeSpin.
///
/// The animation cycle:
///  1. strokeEnd races from 0 → 1 (arc draws in)
///  2. strokeStart chases from 0 → 1 after a short delay (arc erases)
///  3. The whole circle rotates continuously
///
/// Uses `TimelineView` for frame-accurate, Core Animation–equivalent timing.
struct CircleStrokeSpinView: View {

    // MARK: - Configuration

    var color: Color = Color.LL.orange
    var size: CGFloat = 40
    var lineWidth: CGFloat = 3
    /// Optional center image name. When nil the center is left empty.
    var centerImage: String? = nil
    /// Scale of the center image relative to the spinner size (0…1).
    var centerImagePadding: CGFloat = 2

    /// Duration of the full animation cycle (strokeEnd + strokeStart + delay).
    var cycleDuration: TimeInterval = 1.7

    // MARK: - Timing Constants (matching the original CA animation)

    /// Delay before strokeStart begins chasing strokeEnd.
    private let beginTime: CGFloat = 0.5 / 1.7
    /// Fraction of the cycle used by strokeEnd (0.7 / 1.7).
    private let strokeEndFraction: CGFloat = 0.7 / 1.7
    /// Fraction of the cycle used by strokeStart (1.2 / 1.7).
    private let strokeStartFraction: CGFloat = 1.2 / 1.7

    private static let epoch = Date(timeIntervalSince1970: 0)

    // MARK: - Body

    var body: some View {
        TimelineView(.animation(minimumInterval: 1.0 / 60.0)) { context in
            let t = normalizedTime(at: context.date)
            let trimStart = strokeStartValue(t)
            let trimEnd = strokeEndValue(t)
            let rotation = t * 360
            let imgSize = size - centerImagePadding * 2 - lineWidth * 2

            ZStack {
                Circle()
                    .trim(from: trimStart, to: trimEnd)
                    .stroke(
                        color,
                        style: StrokeStyle(lineWidth: lineWidth, lineCap: .round)
                    )
                    .rotationEffect(.degrees(rotation - 90))
                    .zIndex(100)

                if let centerImage {
                    Image(centerImage)
                        .resizable()
                        .scaledToFit()
                        .frame(width: imgSize, height: imgSize)
                }
            }
            .frame(width: size, height: size)
        }
        .frame(width: size, height: size)
    }

    // MARK: - Animation Math

    /// Returns 0…1 representing how far we are through the current cycle.
    private func normalizedTime(at date: Date) -> CGFloat {
        let elapsed = date.timeIntervalSince(Self.epoch)
        let remainder = elapsed.truncatingRemainder(dividingBy: cycleDuration)
        return CGFloat(remainder / cycleDuration)
    }

    /// Easing curve matching `CAMediaTimingFunction(controlPoints: 0.4, 0.0, 0.2, 1.0)`.
    private func customEase(_ t: CGFloat) -> CGFloat {
        // Approximation of the cubic-bezier(0.4, 0.0, 0.2, 1.0) curve.
        // This is Material Design's standard decelerate curve.
        let clamped = min(max(t, 0), 1)
        // Use a simple polynomial approximation that closely matches the curve:
        // Fast start (ease-in portion from 0.4,0.0) then strong deceleration (0.2,1.0).
        return cubicBezierApprox(clamped, x1: 0.4, y1: 0.0, x2: 0.2, y2: 1.0)
    }

    /// Attempt to evaluate a cubic-bezier via Newton's method for accuracy.
    private func cubicBezierApprox(_ t: CGFloat, x1: CGFloat, y1: CGFloat, x2: CGFloat, y2: CGFloat) -> CGFloat {
        // Find the parametric t that corresponds to our time t on the x-axis
        var guess = t
        for _ in 0..<8 {
            let xAtGuess = cubicBezierComponent(guess, p1: x1, p2: x2)
            let slope = cubicBezierSlope(guess, p1: x1, p2: x2)
            guard abs(slope) > 1e-6 else { break }
            guess -= (xAtGuess - t) / slope
            guess = min(max(guess, 0), 1)
        }
        return cubicBezierComponent(guess, p1: y1, p2: y2)
    }

    /// Evaluates one component (x or y) of a cubic bezier at parametric value t.
    private func cubicBezierComponent(_ t: CGFloat, p1: CGFloat, p2: CGFloat) -> CGFloat {
        let mt = 1 - t
        return 3 * mt * mt * t * p1 + 3 * mt * t * t * p2 + t * t * t
    }

    /// Derivative of the cubic-bezier component for Newton's method.
    private func cubicBezierSlope(_ t: CGFloat, p1: CGFloat, p2: CGFloat) -> CGFloat {
        let mt = 1 - t
        return 3 * mt * mt * p1 + 6 * mt * t * (p2 - p1) + 3 * t * t * (1 - p2)
    }

    /// strokeEnd: 0 → 1 over the first 0.7s of the 1.7s cycle.
    private func strokeEndValue(_ t: CGFloat) -> CGFloat {
        guard t < strokeEndFraction else { return 1 }
        let localT = t / strokeEndFraction
        return customEase(localT)
    }

    /// strokeStart: 0 → 1 starting at 0.5s, taking 1.2s to complete.
    private func strokeStartValue(_ t: CGFloat) -> CGFloat {
        guard t > beginTime else { return 0 }
        let localT = (t - beginTime) / strokeStartFraction
        guard localT < 1 else { return 1 }
        return customEase(localT)
    }
}

// MARK: - Previews

#if DEBUG

struct CircleStrokeSpinView_Previews: PreviewProvider {
    static var previews: some View {
        VStack(spacing: 32) {
            // With center Flow logo
            CircleStrokeSpinView(centerImage: "flow")

            // No center image (blank)
            CircleStrokeSpinView(color: .green, size: 60, lineWidth: 5)

            // Small, no image
            CircleStrokeSpinView(color: .blue, size: 24, lineWidth: 2)
        }
        .padding(40)
        .background(.yellow)
    }
}
#endif
