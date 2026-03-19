//
//  LuciqConfig.swift
//  FRW-dev
//
//  Created by cat on 2024/1/12.
//

import Foundation
import LuciqSDK

class LuciqConfig {
    static func start(token: String) {
        Luciq.start(withToken: token, invocationEvents: [.shake, .screenshot])
        Luciq.trackUserSteps = true
        Luciq.setReproStepsFor(.all, with: .enable)
        Luciq.welcomeMessageMode = .disabled
    }
}
