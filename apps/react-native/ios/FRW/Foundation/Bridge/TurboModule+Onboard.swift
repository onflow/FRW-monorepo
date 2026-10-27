//
//  TurboModule+Onboard.swift
//  FRW
//
//  Created by cat on 12/11/25.
//

import Foundation
import FlowWalletKit
import WalletCore
import Flow
import UserNotifications

extension TurboModuleSwift {
  @objc
  static func generateSeedPhrase(strength: NSNumber?) async throws -> [String: Any] {

    let mnemonicStrength = strength?.int32Value ?? 128
    guard let hdWallet = HDWallet(strength: mnemonicStrength, passphrase: "") else {
        HUD.error(title: "invalid_data".localized)
      throw RNBridgeError.mnemonicGenerationFailed
    }

    let key = FlowWalletKit.SeedPhraseKey(hdWallet: hdWallet, storage: FlowWalletKit.SeedPhraseKey.seedPhraseStorage)

    guard let publicKey = key.publicKey(signAlgo: .ECDSA_SECP256k1) else {
      throw RNBridgeError.accountCreationFailed
    }
    let publicKeyHex = publicKey.hexString
    let accountKey = RNBridge.AccountKey(
      publicKey: publicKeyHex,
      hashAlgoStr: Flow.HashAlgorithm.SHA2_256.id,
      signAlgoStr: Flow.SignatureAlgorithm.ECDSA_SECP256k1.id,
      weight: 1000,
      hashAlgo: Flow.HashAlgorithm.SHA2_256.index,
      signAlgo: Flow.SignatureAlgorithm.ECDSA_SECP256k1.index
    )
    let evmAddress = try? key.ethAddress()
    let response = RNBridge.SeedPhraseGenerationResponse(
      mnemonic: hdWallet.mnemonic,
      accountKey: accountKey,
      drivepath: FlowWalletKit.SeedPhraseKey.derivationPath,
      evmAddress: evmAddress
    )

    return try response.toDictionary()
  }

  @objc
  static func registerSecureTypeAccount(username: String) async throws -> [String: Any] {
    do {
      let result = try await UserManager.shared.register(username)
      guard let txid = result else {
        throw RNBridgeError.accountCreationFailed
      }
      let response = RNBridge.CreateAccountResponse(
        success: true,
        address: "",
        username: username,
        accountType: .hardware,
        txId: txid,
        error: ""
      )

      return try response.toDictionary()
    } catch {
      let response = RNBridge.CreateAccountResponse(
        success: false,
        address: "",
        username: username,
        accountType: .hardware,
        txId: "",
        error: error.localizedDescription
      )
      return try response.toDictionary()
    }
  }

  @objc
  static func initSecureEnclaveWallet(txId: String) async throws -> [String: Any] {
    guard let uid = UserManager.shared.RNRegisterInfo[txId] else {
      return [
        "success": false,
        "address": "",
        "error": "Secure Enclave wallet initialization not yet implemented in WalletManager"
      ]
    }
    let keyResult = await WalletManager.shared.findKeyProvider(uid: uid)
    let isSecureEnclave: Bool

    switch keyResult {
    case .success(let data):
      isSecureEnclave = data.provider.keyType == .secureEnclave
    case .providerWithoutAccount(let provider):
      isSecureEnclave = provider.keyType == .secureEnclave
    case .noValidProvider:
      isSecureEnclave = false
    }

    let address = await WalletManager.shared.getPrimaryWalletAddress() ?? ""
    return [
      "success": isSecureEnclave,
      "address": isSecureEnclave ? address : "",
      "error": ""
    ]
  }

  /// RN onboarding (ConfirmRecoveryPhraseScreen) hands over the /v4/register session here, as
  /// JSON `{"id","access_token","refresh_token","expires_in","refresh_expires_in"}` through the
  /// old `customToken` parameter (same contract as Android's `SessionTokens.fromJson`).
  /// Anything that is not JSON is a legacy Firebase custom token (server without a signing key).
  /// Firebase Auth is off, so such a token cannot start a session: fail clearly instead of
  /// continuing with an anonymous token.
  @objc
  static func signInWithCustomToken(customToken: String) async throws {
    guard let grant = RNSessionGrant.parse(customToken) else {
      log.error("[Auth] RN passed a legacy Firebase custom token; no session tokens in the register response")
      throw AuthError.missingAccessToken
    }
    await AuthSession.shared.establish(grant)
  }

  @objc
  static func saveMnemonic(mnemonic: String, customToken: String, txId: String, username: String, evmAddress: String?) async throws {
    try await UserManager.shared.restoreLogin(withMnemonic: mnemonic)

  }

  // MARK: - Screen Security
  @objc
  static func setScreenSecurityLevel(level: String) {
    log.info("Screen Security level:\(level)")
    switch level {
    case "secure":
      break
    default:
      break
    }

  }

  // MARK: - Notification Permissions
  @objc
  static func requestNotificationPermission() async throws -> Bool {
    return await withCheckedContinuation { continuation in
      UNUserNotificationCenter.current().requestAuthorization(options: [.alert, .sound, .badge]) { granted, error in
        continuation.resume(returning: granted)
      }
    }
  }

  @objc
  static func checkNotificationPermission() async throws -> Bool {
    return await withCheckedContinuation { continuation in
      UNUserNotificationCenter.current().getNotificationSettings { settings in
        let granted = settings.authorizationStatus == .authorized
        print("TurboModuleSwift: result: \(granted)")
        continuation.resume(returning: granted)
      }
    }
  }

  // MARK: - Device Info
  @objc
  static func getDeviceId() -> String {
    return UUIDManager.appUUID()
  }

  @objc
  static func getV4RegisteredSignature(mnemonic: String) async throws -> [String: Any] {
    // The JS sends /v4/register with Bearer getJWT() right after this. tokenForSigning() mints a
    // fresh anonymous token and opens a short window in which getJWT() returns that same token.
    let jwt = try await AuthSession.shared.tokenForSigning()
    guard let signatureData = jwt.addUserMessage() else {
      log.error("invalid data to sign")
      throw LLError.signFailed
    }
    guard let hdWallet = HDWallet(mnemonic: mnemonic, passphrase: "") else {
      HUD.error(WalletError.invalidMnemonic)
      throw WalletError.invalidMnemonic
    }
    
    let key = FlowWalletKit.SeedPhraseKey(hdWallet: hdWallet, storage: FlowWalletKit.SeedPhraseKey.seedPhraseStorage)
    
    let flowSignature = try key.sign(data: signatureData, signAlgo: .ECDSA_SECP256k1, hashAlgo: .SHA2_256)

    let eoaAddress = try key.ethAddress()

    guard let jwtData = jwt.data(using: .utf8) else {
      HUD.error(WalletError.invalidSignData)
      throw WalletError.invalidSignData
    }
    let digest = Hash.keccak256(data: jwtData)
    
    
    let ethKey = hdWallet.getKeyForCoin(coin: .ethereum)
    guard let evmSignatureData = ethKey.sign(digest: digest, curve: .secp256k1) else {
      HUD.error(LLError.signFailed)
      throw LLError.signFailed
    }
    
    let evmSignature = evmSignatureData.hexValue.addHexPrefix()
    let response = [
      "flowSignature": flowSignature.hexString,
      "evmSignature": evmSignature,
      "eoaAddress": eoaAddress
    ]
    return try response.toDictionary()
    
  }
}

/// Parses the session JSON RN passes through the `customToken` bridge parameters.
enum RNSessionGrant {
  static func parse(_ value: String) -> AuthGrant? {
    let trimmed = value.trimmingCharacters(in: .whitespacesAndNewlines)
    guard trimmed.hasPrefix("{"),
          let data = trimmed.data(using: .utf8),
          let json = (try? JSONSerialization.jsonObject(with: data)) as? [String: Any]
    else {
      return nil
    }
    func string(_ key: String) -> String? {
      guard let value = json[key] as? String, !value.isEmpty else { return nil }
      return value
    }
    func number(_ key: String) -> Double? {
      if let value = json[key] as? NSNumber { return value.doubleValue }
      if let value = json[key] as? String { return Double(value) }
      return nil
    }
    guard let accessToken = string("access_token"),
          let uid = string("id") ?? string("uid")
    else {
      return nil
    }
    return AuthGrant(
      accessToken: accessToken,
      refreshToken: string("refresh_token"),
      expiresIn: number("expires_in"),
      refreshExpiresIn: number("refresh_expires_in"),
      uid: uid
    )
  }
}
