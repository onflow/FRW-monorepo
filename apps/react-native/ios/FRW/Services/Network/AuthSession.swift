//
//  AuthSession.swift
//  FRW
//
//  Replaces Firebase Auth as the source of API Bearer tokens.
//  Contract: flow-wallet-aws-migration/auth-contract.md (v1, 2026-10-27).
//
//  - Anonymous token:  POST {api}/v1/auth/anonymous            (15 min)
//  - Access token:     returned by /v4/login, /v4/register, ... (1 h)
//  - Refresh token:    POST {api}/v1/auth/refresh, rotates      (90 days, never sent as Bearer)
//

import Foundation
import KeychainAccess

// MARK: - FirebaseRuntime

/// Firebase project `lilico-334404` is being shut down. While this is false the app never calls
/// `FirebaseApp.configure()` and every Firebase SDK call (Auth, Messaging, Remote Config,
/// Analytics, Crashlytics, Installations, Storage) is skipped. The SDKs stay linked so the
/// package graph is unchanged; flip to true only if a Firebase project is restored.
enum FirebaseRuntime {
    static let isEnabled = false
}

// MARK: - AuthError

enum AuthError: Error, LocalizedError {
    case unavailable(String)
    case missingAccessToken
    case sessionExpired
    case signedTokenReused
    case badResponse

    var errorDescription: String? {
        switch self {
        case let .unavailable(reason): return "Auth service unavailable: \(reason)"
        case .missingAccessToken: return "Login response did not include an access token"
        case .sessionExpired: return "Session expired"
        case .signedTokenReused: return "Signed token already used"
        case .badResponse: return "Unexpected auth response"
        }
    }
}

// MARK: - AuthGrant

/// Session tokens returned by login / register / import / refresh.
struct AuthGrant: Codable {
    let accessToken: String
    let refreshToken: String?
    let expiresIn: Double?
    let refreshExpiresIn: Double?
    let uid: String?
}

/// Implemented by the login/register/import response models.
protocol AuthGrantCarrier {
    var id: String { get }
    var accessToken: String? { get }
    var refreshToken: String? { get }
    var expiresIn: Double? { get }
    var refreshExpiresIn: Double? { get }
}

extension AuthGrantCarrier {
    func authGrant() throws -> AuthGrant {
        guard let accessToken, !accessToken.isEmpty else {
            throw AuthError.missingAccessToken
        }
        return AuthGrant(
            accessToken: accessToken,
            refreshToken: refreshToken,
            expiresIn: expiresIn,
            refreshExpiresIn: refreshExpiresIn,
            uid: id
        )
    }
}

// MARK: - AuthSession

actor AuthSession {
    // MARK: Internal

    static let shared = AuthSession()

    /// Set while the app is silently re-establishing a session with the wallet key.
    /// Requests made inside that flow get an anonymous token instead of waiting on it.
    @TaskLocal static var isRestoringSession = false

    /// Installed by `UserManager`. Signs a fresh anonymous token with the active profile's key
    /// and calls `/v4/login`. Returns true when a user session was stored.
    nonisolated(unsafe) static var sessionRestorer: (() async -> Bool)?

    /// The uid of the stored user session, if any.
    var sessionUID: String? {
        loadSession()?.uid
    }

    /// `getToken()` from the contract. Never blocks on Firebase.
    func token() async throws -> String {
        // A signed login/register is in flight (RN onboarding): the request that carries the
        // signature must send the same anonymous token that was signed, not the stored session.
        if signedLoginInProgress, let anonymous,
           anonymous.expiry.timeIntervalSinceNow > Self.anonymousReuseMargin {
            return anonymous.token
        }

        if let session = loadSession() {
            if session.accessExpiry.timeIntervalSinceNow > Self.accessRefreshMargin {
                return session.accessToken
            }
            if let refreshToken = session.refreshToken, session.refreshUsable {
                do {
                    return try await refreshShared(refreshToken)
                } catch AuthError.sessionExpired {
                    clearSession()
                }
            } else {
                clearSession()
            }
        }

        // A profile is active on this device but there is no usable session
        // (first launch after upgrading from Firebase, or the refresh token expired).
        if !Self.isRestoringSession, await restoreSessionIfPossible(),
           let session = loadSession() {
            return session.accessToken
        }

        return try await anonymousToken()
    }

    /// Token for a payload the wallet key will sign when the request is sent by JS (RN
    /// onboarding: `getV4RegistrationSignatures`, then `/v4/register` with Bearer `getJWT()`).
    /// Always a freshly minted anonymous token (each signed token mints a session once). For the
    /// next `signedLoginWindow`, `token()` returns this same token so the register call carries
    /// what was signed; the stored session is kept and the window closes on `establish`.
    func tokenForSigning() async throws -> String {
        let token = try await freshAnonymousToken()
        signedLoginStartedAt = Date()
        return token
    }

    /// Always mints a new anonymous token (login, register, import must sign a fresh one).
    func freshAnonymousToken() async throws -> String {
        let grant = try await Self.post(path: "/v1/auth/anonymous", body: [:])
        let expiry = Date().addingTimeInterval(grant.expiresIn ?? 900)
        anonymous = (grant.accessToken, expiry)
        return grant.accessToken
    }

    /// Store the tokens from a login / register / import / refresh response.
    func establish(_ grant: AuthGrant) {
        let now = Date()
        let stored = StoredSession(
            accessToken: grant.accessToken,
            refreshToken: grant.refreshToken,
            uid: grant.uid ?? "",
            accessExpiry: now.addingTimeInterval(grant.expiresIn ?? 3600),
            refreshExpiry: grant.refreshExpiresIn.map { now.addingTimeInterval($0) }
        )
        save(stored)
        lastRestoreFailure = nil
        signedLoginStartedAt = nil
    }

    /// Logout, reset and account switch. Replaces `signOut()` + `signInAnonymously()`.
    func clearSession() {
        cached = nil
        anonymous = nil
        refreshTask = nil
        signedLoginStartedAt = nil
        try? keychain.remove(Self.storageKey)
    }

    /// Called after a 401 `token_expired` / `invalid_token` so the next `token()` call
    /// refreshes or re-mints.
    func invalidate(_ token: String) {
        if anonymous?.token == token {
            anonymous = nil
        }
        if var session = loadSession(), session.accessToken == token {
            session.accessExpiry = .distantPast
            save(session)
        }
    }

    // MARK: Request helpers

    /// Only first-party hosts receive a Bearer token. Everything else (key indexer, Alchemy,
    /// GitHub, blocklist, DuckDuckGo) is sent without one and never waits on auth.
    nonisolated static func needsToken(_ url: URL) -> Bool {
        guard let host = url.host?.lowercased() else { return false }
        return firstPartyHosts.contains(host)
    }

    nonisolated static func errorCode(in data: Data) -> String? {
        guard let json = try? JSONSerialization.jsonObject(with: data) as? [String: Any] else {
            return nil
        }
        return json["code"] as? String
    }

    // MARK: Private

    private struct StoredSession: Codable {
        var accessToken: String
        var refreshToken: String?
        var uid: String
        var accessExpiry: Date
        var refreshExpiry: Date?

        var refreshUsable: Bool {
            guard let refreshExpiry else { return true }
            return refreshExpiry.timeIntervalSinceNow > 60
        }
    }

    private struct Envelope: Decodable {
        let data: AuthGrantPayload?
    }

    private struct AuthGrantPayload: Decodable {
        let accessToken: String?
        let refreshToken: String?
        let expiresIn: Double?
        let refreshExpiresIn: Double?
        let uid: String?
    }

    private static let storageKey = "auth.session.v1"
    private static let accessRefreshMargin: TimeInterval = 5 * 60
    private static let anonymousReuseMargin: TimeInterval = 2 * 60
    private static let restoreBackoff: TimeInterval = 60
    /// Same as Android's LOGIN_WINDOW_MS.
    private static let signedLoginWindow: TimeInterval = 2 * 60

    private static var apiBaseURL: URL {
        Config.get(.lilico)
    }

    private static let firstPartyHosts: Set<String> = {
        var hosts: Set<String> = [
            "api.wallet.flow.com",
            "scanner.wallet.flow.com",
            "functions.wallet.flow.com",
        ]
        for key in [ConfigKey.lilico, .lilicoWeb, .firebaseFunction] {
            let url: URL = Config.get(key)
            if let host = url.host?.lowercased() {
                hosts.insert(host)
            }
        }
        return hosts
    }()

    private let keychain = Keychain(service: "com.flowfoundation.wallet.auth")
        .accessibility(.afterFirstUnlockThisDeviceOnly)

    private var cached: StoredSession?
    private var anonymous: (token: String, expiry: Date)?
    private var anonymousTask: _Concurrency.Task<String, Error>?
    private var refreshTask: _Concurrency.Task<String, Error>?
    private var restoreTask: _Concurrency.Task<Bool, Never>?
    private var lastRestoreFailure: Date?
    private var signedLoginStartedAt: Date?

    private var signedLoginInProgress: Bool {
        guard let signedLoginStartedAt else { return false }
        return Date().timeIntervalSince(signedLoginStartedAt) < Self.signedLoginWindow
    }

    private func loadSession() -> StoredSession? {
        if let cached {
            return cached
        }
        guard let data = try? keychain.getData(Self.storageKey),
              let session = try? JSONDecoder().decode(StoredSession.self, from: data)
        else {
            return nil
        }
        cached = session
        return session
    }

    private func save(_ session: StoredSession) {
        cached = session
        if let data = try? JSONEncoder().encode(session) {
            try? keychain.set(data, key: Self.storageKey)
        }
    }

    private func anonymousToken() async throws -> String {
        if let anonymous, anonymous.expiry.timeIntervalSinceNow > Self.anonymousReuseMargin {
            return anonymous.token
        }
        if let anonymousTask {
            return try await anonymousTask.value
        }
        let task = _Concurrency.Task { try await self.freshAnonymousToken() }
        anonymousTask = task
        defer { anonymousTask = nil }
        return try await task.value
    }

    /// One in-flight refresh shared by every caller (contract step 2).
    private func refreshShared(_ refreshToken: String) async throws -> String {
        if let refreshTask {
            return try await refreshTask.value
        }
        let task = _Concurrency.Task { () throws -> String in
            let grant = try await Self.post(
                path: "/v1/auth/refresh",
                body: ["refresh_token": refreshToken]
            )
            let uid = grant.uid ?? self.cached?.uid
            self.establish(AuthGrant(
                accessToken: grant.accessToken,
                refreshToken: grant.refreshToken ?? refreshToken,
                expiresIn: grant.expiresIn,
                refreshExpiresIn: grant.refreshExpiresIn,
                uid: uid
            ))
            return grant.accessToken
        }
        refreshTask = task
        defer { refreshTask = nil }
        return try await task.value
    }

    private func restoreSessionIfPossible() async -> Bool {
        guard let restorer = Self.sessionRestorer else { return false }
        if let lastRestoreFailure, Date().timeIntervalSince(lastRestoreFailure) < Self.restoreBackoff {
            return false
        }
        if let restoreTask {
            return await restoreTask.value
        }
        let task = _Concurrency.Task { () -> Bool in
            await AuthSession.$isRestoringSession.withValue(true) {
                await restorer()
            }
        }
        restoreTask = task
        let ok = await task.value
        restoreTask = nil
        if !ok {
            lastRestoreFailure = Date()
        }
        return ok
    }

    /// POST to the token issuer. No Authorization header.
    private static func post(path: String, body: [String: String]) async throws -> AuthGrant {
        var request = URLRequest(url: apiBaseURL.appendingPathComponent(path))
        request.httpMethod = "POST"
        request.timeoutInterval = 15
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.httpBody = try JSONSerialization.data(withJSONObject: body)

        let (data, response) = try await URLSession.shared.data(for: request)
        let status = (response as? HTTPURLResponse)?.statusCode ?? 0

        switch status {
        case 200 ..< 300:
            break
        case 401:
            throw AuthError.sessionExpired
        default:
            throw AuthError.unavailable("HTTP \(status) \(errorCode(in: data) ?? "")")
        }

        let decoder = JSONDecoder()
        decoder.keyDecodingStrategy = .convertFromSnakeCase
        guard let payload = try decoder.decode(Envelope.self, from: data).data,
              let accessToken = payload.accessToken, !accessToken.isEmpty
        else {
            throw AuthError.badResponse
        }
        return AuthGrant(
            accessToken: accessToken,
            refreshToken: payload.refreshToken,
            expiresIn: payload.expiresIn,
            refreshExpiresIn: payload.refreshExpiresIn,
            uid: payload.uid
        )
    }
}
