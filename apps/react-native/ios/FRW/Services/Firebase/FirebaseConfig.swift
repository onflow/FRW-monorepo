//
//  FirebaseConfig.swift
//  Flow Wallet
//
//  Created by cat on 2022/4/30.
//

import FirebaseRemoteConfig
import Foundation
import Haneke

// MARK: - FirebaseConfigError

enum FirebaseConfigError: Error {
    case fetch
    case decode
}

// MARK: - FirebaseConfig

enum FirebaseConfig: String {
    case all
    case flowCoins = "flow_coins"
    case config = "free_gas_config"
    case dapp
    case contractAddress = "contract_address"
    case appSecret = "app_secret"
    case ENVConfig = "i_config"
    case news
    case coaDomains = "coa_domains"

    // MARK: Internal

    static func start() {
        guard FirebaseRuntime.isEnabled else {
            // No Remote Config backend: run on the bundled remote_config_defaults.plist.
            onConfigLoadFinish()
            return
        }
        Task {
            do {
                _ = try await FirebaseConfig.all.fetchConfig()
                onConfigLoadFinish()
            } catch {
                debugPrint(error)
            }
        }
    }

    static func onConfigLoadFinish() {
        Task {
            await NFTCollectionConfig.share.reload()
            RemoteConfigManager.shared.updateFromRemote()
        }
    }
}

extension FirebaseConfig {
    /// Values from the bundled `remote_config_defaults.plist` (the same file Firebase Remote
    /// Config used as its defaults). Used while Firebase is disabled.
    static let bundledDefaults: [String: String] = {
        guard let url = Bundle.main.url(forResource: "remote_config_defaults", withExtension: "plist"),
              let dict = NSDictionary(contentsOf: url) as? [String: Any]
        else {
            return [:]
        }
        var values: [String: String] = [:]
        for (key, value) in dict {
            values[key] = (value as? String) ?? "\(value)"
        }
        return values
    }()

    private var bundledData: Data {
        Data((FirebaseConfig.bundledDefaults[rawValue] ?? "").utf8)
    }

    func fetch<T: Codable>(decoder: JSONDecoder = FRWAPI.jsonDecoder) throws -> T {
        guard FirebaseRuntime.isEnabled else {
            do {
                return try decoder.decode(T.self, from: bundledData)
            } catch {
                throw FirebaseConfigError.decode
            }
        }
        let remoteConfig = RemoteConfig.remoteConfig()
        let json = remoteConfig.configValue(forKey: rawValue)
        do {
            let collections = try decoder.decode(T.self, from: json.dataValue)
            return collections
        } catch {
            debugPrint(error)
            throw FirebaseConfigError.decode
        }
    }

    func fetch() throws -> String {
        guard FirebaseRuntime.isEnabled else {
            return FirebaseConfig.bundledDefaults[rawValue] ?? ""
        }
        let remoteConfig = RemoteConfig.remoteConfig()
        let json = remoteConfig.configValue(forKey: rawValue)
        return json.stringValue ?? ""
    }

    func fetchLocal<T: Codable>() throws -> T {
        let decoder = JSONDecoder()
        decoder.keyDecodingStrategy = .convertFromSnakeCase
        guard FirebaseRuntime.isEnabled else {
            do {
                return try decoder.decode(T.self, from: bundledData)
            } catch {
                throw FirebaseConfigError.decode
            }
        }
        let remoteConfig = RemoteConfig.remoteConfig()
        guard let json = remoteConfig.defaultValue(forKey: rawValue) else {
            throw FirebaseConfigError.decode
        }
        do {
            let collections = try decoder.decode(T.self, from: json.dataValue)
            return collections
        } catch {
            print(error)
            throw FirebaseConfigError.decode
        }
    }

    private func fetchConfig() async throws -> RemoteConfigValue {
        try await withCheckedThrowingContinuation { continuation in
            let remoteConfig = RemoteConfig.remoteConfig()
            let setting = RemoteConfigSettings()
            setting.minimumFetchInterval = 3600

            #if DEBUG
            setting.minimumFetchInterval = 0
            #endif

            remoteConfig.configSettings = setting
            remoteConfig.setDefaults(fromPlist: "remote_config_defaults")
            remoteConfig.fetchAndActivate(completionHandler: { status, error in
                if status == .error {
                    continuation.resume(throwing: FirebaseConfigError.fetch)
                    log
                        .error(
                            "[Firebase] fetch Error: \(error?.localizedDescription ?? "No error available.")"
                        )
                } else {
                    log.info("[Firebase] Config fetched!")
                    let configValues: RemoteConfigValue = remoteConfig
                        .configValue(forKey: self.rawValue)
                    continuation.resume(returning: configValues)
                }
            })
        }
    }
}
