//
//  Network.swift
//  Flow Wallet
//
//  Created by Hao Fu on 2/1/22.
//

import Combine
import CombineMoya
import Foundation
import Haneke
import Moya

// MARK: - NetworkError

public enum NetworkError: Error {
    case unAuth
    case emptyIDToken
    case decodeFailed
    case emptyData
}

// MARK: - Network

enum Network {
    struct Response<T: Decodable>: Decodable {
        enum CodingKeys: String, CodingKey {
            case httpCode = "status"
            case message
            case data
        }

        let httpCode: Int
        let message: String?
        let data: T?
    }

    struct EmptyResponse: Decodable {
        enum CodingKeys: String, CodingKey {
            case httpCode = "status"
            case message
        }

        let httpCode: Int
        let message: String
    }

    /// Bearer token for first-party APIs. Replaces the Firebase ID token
    /// (see AuthSession.swift and auth-contract.md).
    static func fetchIDToken() async throws -> String {
        try await AuthSession.shared.token()
    }

    static func request<T: Decodable, U: TargetType>(
        _ target: U,
        decoder: JSONDecoder = FRWAPI.jsonDecoder,
        needToken: Bool = true,
        bearerToken: String? = nil
    ) async throws -> T {
        let response = try await perform(
            target,
            needToken: needToken,
            bearerToken: bearerToken,
            logging: false
        )
        let filterdResponse = try response.filterSuccessfulStatusCodes()
        let model = try decoder.decode(Response<T>.self, from: filterdResponse.data)
        guard let data = model.data else {
            throw NetworkError.emptyData
        }
        return data
    }

    static func requestWithRawModel<T: Decodable, U: TargetType>(
        _ target: U,
        decoder: JSONDecoder = FRWAPI.jsonDecoder,
        needAuthToken: Bool = true,
        bearerToken: String? = nil
    ) async throws -> T {
        let response = try await perform(
            target,
            needToken: needAuthToken,
            bearerToken: bearerToken,
            logging: true
        )
        let filterdResponse = try response.filterSuccessfulStatusCodes()
        return try decoder.decode(T.self, from: filterdResponse.data)
    }

    static func requestWithRawResponse<U: TargetType>(
        _ target: U,
        needToken: Bool = true
    ) async throws -> Moya.Response {
        try await perform(target, needToken: needToken, bearerToken: nil, logging: true)
    }

    /// Sends the request. A token is fetched only when the target needs one and points at a
    /// first-party host, so unauthenticated calls never wait on the auth server.
    /// On 401 `token_expired` / `invalid_token` the token is dropped and the call is retried once.
    private static func perform<U: TargetType>(
        _ target: U,
        needToken: Bool,
        bearerToken: String?,
        logging: Bool
    ) async throws -> Moya.Response {
        var retried = false
        while true {
            var token: String? = bearerToken
            if token == nil, needToken,
               (target as? AccessTokenAuthorizable)?.authorizationType != nil,
               AuthSession.needsToken(target.baseURL) {
                token = try await fetchIDToken()
            }

            var plugins: [PluginType] = logging ? [NetworkLoggerPlugin()] : []
            if let token {
                plugins.append(AccessTokenPlugin { _ in token })
            }
            let provider = MoyaProvider<U>(plugins: plugins)

            switch await provider.asyncRequest(target) {
            case let .success(response):
                if response.statusCode == 401, let token {
                    let code = AuthSession.errorCode(in: response.data)
                    if code == "signed_token_reused" {
                        throw AuthError.signedTokenReused
                    }
                    if bearerToken == nil, !retried,
                       code == "token_expired" || code == "invalid_token" {
                        await AuthSession.shared.invalidate(token)
                        retried = true
                        continue
                    }
                }
                return response
            case let .failure(error):
                throw error
            }
        }
    }
}
