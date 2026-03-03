//
//  AppDelegate+WhatsNew.swift
//  FRW
//
//  Created by cat on 3/2/26.
//

import Foundation

extension AppDelegate {
  func fetchWhatsNew() {
    Task {
      do {
        let response = try await WhatsNewService.fetchWhatsNewForIOS()
        if let response {
          let trimmedContent = response.content.trimmingCharacters(in: .whitespacesAndNewlines)
          guard !trimmedContent.isEmpty || !response.actions.isEmpty else {
            log.info("[WhatsNew] Empty payload, skip popup")
            return
          }

          log.info("[WhatsNew] payload received for version: \(response.version)")

          let popupData = try response.toDictionary()
          Router.route(to: RouteMap.ReactNative.whatsNew(popupData))
        }
      } catch {
        log.error(error)
      }

    }
  }
}
