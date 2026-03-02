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
          log.info(response)
        }
      } catch {
        log.error(error)
      }

    }
  }
}
