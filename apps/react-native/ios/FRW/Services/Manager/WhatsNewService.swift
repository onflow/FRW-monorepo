//
//  WhatsNewService.swift
//  FRW
//
//  Created by cat on 3/2/26.
//

import Foundation

enum WhatsNewService {
    static func fetchWhatsNewForIOS() async throws -> FRWAPI.App.WhatsNewData? {
        let versions = InstallInfoManager.installVersions
        guard let currentVersion = Bundle.main.infoDictionary?["CFBundleShortVersionString"] as? String else {
          log.error("don't get current version")
          throw LLError.unknown
        }
        let lang = Locale.preferredLanguages.first?.prefix(2).description ?? "en"
        guard !versions.contains(currentVersion) else {
          return nil
        }
        let fromVersion = versions.last
        let req = FRWAPI.App.WhatsNewRequest(
            toVersion: currentVersion,
            fromVersion: fromVersion,
            platform: "ios",
            language: lang
        )
        log.debug("fetch WhatsNew from:\(String(describing: fromVersion)) to:\(currentVersion)")
        let response: FRWAPI.App.WhatsNewData = try await Network.request(FRWAPI.App.whatsnew(req))
        return response
    }
}
