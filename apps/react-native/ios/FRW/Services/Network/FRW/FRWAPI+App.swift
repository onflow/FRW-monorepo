//
//  FRWAPI+App.swift
//  FRW
//
//  Created by cat on 3/2/26.
//

import Foundation
import Moya

extension FRWAPI {
  enum App {
    case whatsnew(WhatsNewRequest)
  }
}

extension FRWAPI.App: TargetType, AccessTokenAuthorizable {
    var authorizationType: AuthorizationType? {
        .bearer
    }

    var baseURL: URL {
      Config.get(.lilicoWeb)
    }

    var path: String {
        switch self {
        case .whatsnew:
            return "/whatsnew"
        }
    }

    var method: Moya.Method {
        switch self {
        case .whatsnew:
            return .get
        }
    }

    var task: Task {
        let network = currentNetwork.rawValue

        switch self {
        case .whatsnew(let request):
          return .requestParameters(
              parameters: request.dictionary ?? [:],
              encoding: URLEncoding.queryString
          )
        }
    }

    var headers: [String: String]? {
        let headers = FRWAPI.commonHeaders
        return headers
    }
}

//MARK: - Model
extension FRWAPI.App {
  struct WhatsNewRequest: Codable {
      let toVersion: String
      let fromVersion: String?
      let platform: String
      let language: String
  }

  struct WhatsNewAction: Codable {
      let text: String
      let url: String?
      let type: String
  }

  struct WhatsNewData: Codable {
      let content: String
      let language: String
      let version: String
      let platform: String
      let actions: [WhatsNewAction]
  }
}
