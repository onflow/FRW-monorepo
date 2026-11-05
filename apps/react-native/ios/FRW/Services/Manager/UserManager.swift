//
//  UserManager.swift
//  Flow Wallet
//
//  Created by Hao Fu on 30/12/21.
//

import Alamofire
import Combine
import Flow
import FlowWalletKit
import Foundation
import WalletCore

// MARK: - UserManager

class UserManager: ObservableObject {
  // MARK: Lifecycle

  init() {
    // Firebase Auth replacement: when a profile is active but no session is stored (first launch
    // after the upgrade, or the refresh token expired), sign a fresh token with the wallet key.
    AuthSession.sessionRestorer = { await UserManager.shared.restoreSessionSilently() }
    checkIfHasOldAccount()

    self.loginUIDList = LocalUserDefaults.shared.loginUIDList

    if let activatedUID = activatedUID {
      if ProfileManager.shared.keyExist(uid: activatedUID) {
        self.userInfo = MultiAccountStorage.shared.getUserInfo(activatedUID)
        uploadUserNameIfNeeded()
        initRefreshUserInfo()
        verifyUserType()
      } else {
        Task {
          try? await logout()
        }
      }
    }

    loginAnonymousIfNeeded()
  }

  // MARK: Internal

  static let shared = UserManager()

  @Published
  var isMeowDomainEnabled: Bool = false

  var userType: UserManager.UserType = .secure

  @Published
  var activatedUID: String? = LocalUserDefaults.shared.activatedUID {
      willSet {
          if let uid = activatedUID {
              WalletManager.shared.removeUnclaimedNews(userId: uid)
              Task { @MainActor in
                  WalletManager.shared.resetUnclaimedState()
              }
          }
      }
    didSet {
      LocalUserDefaults.shared.activatedUID = activatedUID
      if oldValue != activatedUID {
        clearWhenUserChanged()
      }
    }
  }

  @Published
  var userInfo: UserInfo? {
    didSet {
      do {
        guard let uid = activatedUID else { return }
        try MultiAccountStorage.shared.saveUserInfo(userInfo, uid: uid)
        ProfileManager.shared.updateOrDeleteProfile(userInfo: userInfo, with: uid)
      } catch {
        log.error("save user info failed", context: error)
      }
    }
  }

  @Published
  var loginUIDList: [String] = [] {
    didSet {
      LocalUserDefaults.shared.loginUIDList = loginUIDList
    }
  }

  // It is only used when the bridge is called on page of onboard
  var RNRegisterInfo:[String: String] = [:]

  var isLoggedIn: Bool {
    activatedUID != nil
  }

  @Published
  var isLoggingIn: Bool = false

  func verifyUserType() {
    Task {
      do {
        userType = try await checkUserType()
      } catch {
        log.error("[User] check user type:\(error)")
      }
    }
  }

  // MARK: Private

  private func initRefreshUserInfo() {
    if !isLoggedIn {
      return
    }

    guard let uid = activatedUID else { return }

    Task {
      do {
        var info = try await self.fetchUserInfo()
        info.type = self.userInfo?.type
        let userInfo = info
        if activatedUID != uid { return }

        await MainActor.run {
          self.userInfo = userInfo
        }

      } catch {
        log.error("init refresh user info failed", context: error)
      }
    }
  }

  private func checkIfHasOldAccount() {
    if LocalUserDefaults.shared.tryToRestoreAccountFlag == true {
      return
    }
  }

  private func checkUserType() async throws -> UserManager.UserType {
    guard let keyProvider = WalletManager.shared.keyProvider else {
      throw WalletError.emptyKeyProvider
    }

    return .init(keyProvider.keyType)
  }

  private func clearWhenUserChanged() {
    BrowserViewController.deleteCookie()
  }
}

// MARK: - Reset

extension UserManager {
  func reset() async throws {
    log.debug("reset start")

    guard let willResetUID = activatedUID else {
      log.warning("willResetUID is nil")
      return
    }

    await AuthSession.shared.clearSession()

    await MainActor.run {
      NotificationCenter.default.post(name: .willResetWallet)

      self.activatedUID = nil
      self.userInfo = nil
      self.deleteLoginUID(willResetUID)
      ProfileManager.shared.deleteProfile(userId: willResetUID)

      NotificationCenter.default.post(name: .didResetWallet)

      Router.popToRoot()
    }
  }

  func logout() async throws {
    log.debug("logout")
    await AuthSession.shared.clearSession()

    await MainActor.run {
      NotificationCenter.default.post(name: .willResetWallet)
      self.activatedUID = nil
      self.userInfo = nil
      NotificationCenter.default.post(name: .didResetWallet)
      Router.popToRoot()
    }
  }
}

// MARK: - Register

extension UserManager {
  func register(_ userName: String, evmAddress: String? = nil) async throws -> String? {
    let secureKey = try SecureEnclaveKey.create()
    let key = try secureKey.flowAccountKey(index: 0)
    return try await register(
      name: userName,
      key: key,
      keyProvider: secureKey,
      evmAddress: evmAddress
    )
  }

  func register(
    name: String,
    key: Flow.AccountKey,
    keyProvider: any KeyProtocol,
    evmAddress: String? = nil
  ) async throws -> String? {
    try await retryingSignedTokenReuse("register") {
      try await self.registerAttempt(name: name, key: key, keyProvider: keyProvider, evmAddress: evmAddress)
    }
  }

  private func registerAttempt(
    name: String,
    key: Flow.AccountKey,
    keyProvider: any KeyProtocol,
    evmAddress: String?
  ) async throws -> String? {
    await MainActor.run {
      isLoggingIn = true
    }

    defer {
      Task {
        await MainActor.run {
          isLoggingIn = false
        }
      }
    }

    if IPManager.shared.info == nil {
      await IPManager.shared.fetch()
    }

    guard let token = try? await AuthSession.shared.freshAnonymousToken(), !token.isEmpty else {
      loginAnonymousIfNeeded()
      throw LLError.restoreLoginFailed
    }

    let signData = token.addUserMessage() ?? Data()
    let signature = try keyProvider.sign(
      data: signData,
      signAlgo: key.signAlgo,
      hashAlgo: key.hashAlgo
    ).hexValue

    let flowAccountInfo = FlowAccountInfo(accountKey: key.toCodableModel(), signature: signature)
    var evmAccountInfo: EVMAccountInfo?
    if let evmAddress = evmAddress,
        let ethProvider = keyProvider as? EthereumKeyProtocol,
        let evmSignature = try? ethProvider.ethSign(digest: signData)
    {
      evmAccountInfo = EVMAccountInfo(eoaAddress: evmAddress, signature: evmSignature.hexValue)
    }

    let request = RegisterParam(
      flowAccountInfo: flowAccountInfo,
      evmAccountInfo: evmAccountInfo,
      username: name,
      deviceInfo: IPManager.shared.toParams()
    )

    let model: RegisterResponse = try await Network.request(FRWAPI.User.register(request), bearerToken: token)

    let pw = KeyProvider.password(with: model.id)
    try keyProvider.store(id: model.id,password: pw)
    let store = UserManager.StoreUser(
      publicKey: key.publicKey.description,
      address: nil,
      userId: model.id,
      keyType: keyProvider.keyType,
      account: key.toStoreKey()
    )
    WalletManager.shared.updateKeyProvider(provider: keyProvider)
    LocalUserDefaults.shared.addUser(user: store)

    try await finishLogin(grant: model.authGrant(), isRegiter: true)
    let txid = await WalletManager.shared.asyncCreateWalletAddressFromServer()
    userType = .secure

    EventTrack.Account
      .create(
        key: key.publicKey.description,
        signAlgo: key.signAlgo.id,
        hashAlgo: key.hashAlgo.id
      )
    if let txid {
      RNRegisterInfo[txid] = activatedUID
    }
    return txid
  }
}

// MARK: - Restore Login

extension UserManager {
  func hasOldAccount() -> Bool {
    // Firebase-era check for a signed-in user; there is no Firebase session any more.
    false
  }

  func tryToRestoreOldAccountOnFirstLaunch() async {
    do {
      var addressList: [String: String] = [:]
      // Secure Enclave Key
      let seKeylist = SecureEnclaveKey.KeychainStorage.allKeys
      for key in seKeylist {
        if let se = try? SecureEnclaveKey.wallet(id: key),
           let publicKey = se.publicKey()?.hexValue {
          let response: AccountResponse = try await Network
            .requestWithRawModel(FRWAPI.Utils.flowAddress(publicKey))
          let account = response.accounts?
            .filter { ($0.weight ?? 0) >= 1000 && $0.address != nil }.first
          if let model = account {
            addressList[key] = model.address ?? "0x"
            let userId = KeyProvider.getId(with: key)
            let storeUser = UserManager.StoreUser(
              publicKey: publicKey,
              address: model.address,
              userId: userId,
              keyType: .secureEnclave,
              account: nil
            )
            LocalUserDefaults.shared.addUser(user: storeUser)
          }
        } else {
          log.error("[Launch] first login check failed:\(key)")
        }
      }
      //
      let spKeyList = SeedPhraseKey.seedPhraseStorage.allKeys
      for key in spKeyList {
        do {
          guard let provider = try? SeedPhraseKey.wallet(id: key) else {
            log.error("[Launch] seed phrase restore failed.\(key): not found")
            continue
          }
          guard let publicKey = provider.publicKey(signAlgo: .ECDSA_SECP256k1)?
            .hexString
          else {
            log.error("[Launch] seed phrase restore failed.\(key): public key")
            continue
          }
          let response: AccountResponse = try await Network
            .requestWithRawModel(FRWAPI.Utils.flowAddress(publicKey))
          let account = response.accounts?
            .filter { ($0.weight ?? 0) >= 1000 && $0.address != nil }.first
          if let model = account {
            addressList[key] = model.address ?? "0x"
            let userId = KeyProvider.getId(with: key)
            let storeUser = UserManager.StoreUser(
              publicKey: publicKey,
              address: model.address,
              userId: userId,
              keyType: .seedPhrase,
              account: nil
            )
            LocalUserDefaults.shared.addUser(user: storeUser)
          } else {
            log.error("[Launch] seed phrase not found account:\(key)")
          }
        } catch {
          log.error("[Launch] seed phrase restore failed.\(key):\(error)")
          continue
        }
      }

      let pkKeyList = FlowWalletKit.PrivateKey.PKStorage.allKeys
      for key in pkKeyList {
        do {
          guard let provider = try? FlowWalletKit.PrivateKey.wallet(id: key) else {
            log.error("[Launch] Private key restore failed.\(key): not found")
            continue
          }
          let secpPublicKey = provider.publicKey(signAlgo: .ECDSA_SECP256k1)?
            .hexString
          let p256PublicKey = provider.publicKey(signAlgo: .ECDSA_P256)?
            .hexString
          let suffix = KeyProvider.getSuffix(with: key)
          var storePublicKey: String?
          if let publicKey = secpPublicKey, publicKey.hasPrefix(suffix) {
            storePublicKey = publicKey
          }
          if let publicKey = p256PublicKey, publicKey.hasPrefix(suffix) {
            storePublicKey = publicKey
          }
          guard let publicKey = storePublicKey else {
            continue
          }
          let response: AccountResponse = try await Network
            .requestWithRawModel(FRWAPI.Utils.flowAddress(publicKey))
          let account = response.accounts?
            .filter { ($0.weight ?? 0) >= 1000 && $0.address != nil }.first
          if let model = account {
            addressList[key] = model.address ?? "0x"
            let userId = KeyProvider.getId(with: key)
            let storeUser = UserManager.StoreUser(
              publicKey: publicKey,
              address: model.address,
              userId: userId,
              keyType: .privateKey,
              account: nil
            )
            LocalUserDefaults.shared.addUser(user: storeUser)
          } else {
            log.error("[Launch] Private key not found account:\(key)")
          }

        } catch {
          log.error("[Launch] Private key restore failed.\(key):\(error)")
          continue
        }
      }

      var result: [String: String] = [:]
      for (key, value) in addressList {
        let userId = KeyProvider.getId(with: key)
        result[userId] = value
      }
      let uidList = result.map { $0.key }
      let userAddress = result
      await MainActor.run {
        LocalUserDefaults.shared.userAddressOfDeletedApp = userAddress
        LocalUserDefaults.shared.tryToRestoreAccountFlag = true
        self.loginUIDList = uidList
      }
    } catch {
      log.info("restore old failed:\(error)")
    }
  }

  func restoreLogin(withMnemonic mnemonic: String, userId _: String? = nil) async throws {
    try await retryingSignedTokenReuse("restoreLogin(mnemonic)") {
      try await self.restoreLoginAttempt(withMnemonic: mnemonic)
    }
  }

  private func restoreLoginAttempt(withMnemonic mnemonic: String) async throws {
    await MainActor.run {
      isLoggingIn = true
    }

    defer {
      Task {
        await MainActor.run {
          isLoggingIn = false
        }
      }
    }

    guard let token = try? await AuthSession.shared.freshAnonymousToken(),
          !token.isEmpty,
          let tokenData = token.data(using: .utf8)
    else {
      loginAnonymousIfNeeded()
      throw LLError.restoreLoginFailed
    }

    guard let hdWallet = HDWallet(mnemonic: mnemonic, passphrase: "") else {
      throw WalletError.mnemonicMissing
    }

    let provider = FlowWalletKit.SeedPhraseKey(
      hdWallet: hdWallet,
      storage: FlowWalletKit.SeedPhraseKey.seedPhraseStorage
    )

    let secpPublicKey = provider.publicKey(signAlgo: .ECDSA_SECP256k1)
    guard let publicKey = secpPublicKey?.hexString else {
      throw WalletError.emptyPublicKey
    }

    let signData = token.addUserMessage() ?? Data()

    let hashAlgo = Flow.HashAlgorithm.SHA2_256
    let signAlgo = Flow.SignatureAlgorithm.ECDSA_SECP256k1

    guard let signature = try? provider.sign(
      data: signData,
      signAlgo: signAlgo,
      hashAlgo: hashAlgo
    )
    else {
      throw LLError.signFailed
    }

    userType = .phrase
    await IPManager.shared.fetch()

    let key = AccountKey(
      hashAlgo: hashAlgo.index,
      publicKey: publicKey,
      signAlgo: signAlgo.index
    )

    let flowAccountInfo = FlowAccountInfo(accountKey: key, signature: signature.hexValue)
    var evmAccountInfo: EVMAccountInfo?
      let ethProvider = provider as EthereumKeyProtocol
      let wallet = Wallet(type: .key(provider))
    if let evmAddress = try? wallet.ethAddress(),
       let evmSignature = try? ethProvider.ethSign(digest: signData) {
      evmAccountInfo = EVMAccountInfo(eoaAddress: evmAddress, signature: evmSignature.hexValue)
    }

    let request = LoginRequest(
      flowAccountInfo: flowAccountInfo,
      evmAccountInfo: evmAccountInfo,
      deviceInfo: IPManager.shared.toParams()
    )

    let response: Network.Response<LoginResponse> = try await Network
      .requestWithRawModel(FRWAPI.User.login(request), bearerToken: token)
    if response.httpCode == 404 {
      throw LLError.accountNotFound
    }

    guard let loginData = response.data, let grant = try? loginData.authGrant() else {
      throw LLError.restoreLoginFailed
    }
    let uid = loginData.id
    let storeUser = StoreUser(
      publicKey: publicKey,
      address: nil,
      userId: uid,
      keyType: provider.keyType,
      account: nil
    )
    try provider.store(
      id: provider.createKey(uid: uid),
      password: KeyProvider.password(with: uid)
    )
    LocalUserDefaults.shared.addUser(user: storeUser)
    await WalletManager.shared.updateKeyProvider(provider: provider)
    try await finishLogin(grant: grant)
  }

  func getAccount(by address: String, for publicKey: String) async throws -> Flow.AccountKey? {
    let account = try await FlowNetwork.getAccountAtLatestBlock(address: address)
    let result = account.keys
      .last { $0.publicKey.hex == publicKey && !$0.revoked && $0.weight >= 1000 }
    return result
  }

  func restoreLogin(
    with userId: String,
    with address: String? = nil,
    publicKey: String? = nil
  ) async throws {
    try await retryingSignedTokenReuse("restoreLogin(uid)") {
      try await self.restoreLoginAttempt(with: userId)
    }
  }

  private func restoreLoginAttempt(with userId: String) async throws {
    await MainActor.run {
      isLoggingIn = true
    }

    defer {
      Task {
        await MainActor.run {
          isLoggingIn = false
        }
      }
    }

    guard let token = try? await AuthSession.shared.freshAnonymousToken(), !token.isEmpty else {
      loginAnonymousIfNeeded()
      throw LLError.restoreLoginFailed
    }

    // Find valid key provider (validates on-chain)
    // Returns the key provider along with on-chain account info and already-fetched wallet/accounts
    let keyResult = await WalletManager.shared.findKeyProvider(uid: userId)

    let keyProvider: any KeyProtocol
    let accountKey: Flow.AccountKey?
    let address: String?

    switch keyResult {
    case .success(let data):
      // Found valid key with on-chain account
      keyProvider = data.provider
      accountKey = data.accountKey
      address = data.address
    case .providerWithoutAccount(let provider):
      // Provider exists but account is still being created
      // For login, we need on-chain account, so this should fail
      log.error("[Login] Provider exists but no on-chain account for uid: \(userId)")
      throw WalletError.emptyMainAccount
    case .noValidProvider(let error):
      log.error("[Login] No valid key found for uid: \(userId), error: \(error.errorMessage)")
      throw error
    }

    let wallet = Wallet(type: .key(keyProvider))

    // Use the signAlgo and hashAlgo from the on-chain account key
    guard let accountKey = accountKey else {
      log.error("[Login] No account key found")
      throw WalletError.emptyKeyProvider
    }
    let signAlgo = accountKey.signAlgo
    let hashAlgo = accountKey.hashAlgo

    guard let signData = token.addUserMessage(),
          let publicKey = keyProvider.publicKey(signAlgo: signAlgo)?.hexValue,
          !publicKey.isEmpty
    else {
      throw LLError.signFailed
    }

    log.info("[Login] Using on-chain key config - signAlgo: \(signAlgo), hashAlgo: \(hashAlgo), address: \(address))")

    let signature = try keyProvider.sign(data: signData, signAlgo: signAlgo, hashAlgo: hashAlgo)

    await IPManager.shared.fetch()
    let key = AccountKey(
      hashAlgo: hashAlgo.index,
      publicKey: publicKey,
      signAlgo: signAlgo.index
    )

    let flowAccountInfo = FlowAccountInfo(accountKey: key, signature: signature.hexValue)
    var evmAccountInfo: EVMAccountInfo?
    if let ethProvider = keyProvider as? EthereumKeyProtocol,
       let evmAddress = try? wallet.ethAddress(),
       let evmSignature = try? ethProvider.ethSign(digest: signData) {
      evmAccountInfo = EVMAccountInfo(eoaAddress: evmAddress, signature: evmSignature.hexValue)
    }

    let request = LoginRequest(
      flowAccountInfo: flowAccountInfo,
      evmAccountInfo: evmAccountInfo,
      deviceInfo: IPManager.shared.toParams()
    )
    let response: Network.Response<LoginResponse> = try await Network
      .requestWithRawModel(FRWAPI.User.login(request), bearerToken: token)
    if response.httpCode == 404 {
      throw LLError.accountNotFound
    }
    guard let grant = try? response.data?.authGrant() else {
      throw LLError.restoreLoginFailed
    }
    // Rebuild userStore with complete info from on-chain validation
    let storeUser = StoreUser(
      publicKey: publicKey,
      address: address,  // From on-chain validation
      userId: userId,
      keyType: keyProvider.keyType,
      account: accountKey.toStoreKey()  // From on-chain validation
    )
    await WalletManager.shared.updateKeyProvider(provider: keyProvider)
    LocalUserDefaults.shared.addUser(user: storeUser)
    try await finishLogin(grant: grant)
  }

  func restoreLogin(userId: String) async throws {
    try await retryingSignedTokenReuse("restoreLogin(secureEnclave)") {
      try await self.restoreLoginAttempt(secureEnclaveUserId: userId)
    }
  }

  private func restoreLoginAttempt(secureEnclaveUserId userId: String) async throws {
    await MainActor.run {
      isLoggingIn = true
    }

    defer {
      Task {
        await MainActor.run {
          isLoggingIn = false
        }
      }
    }

    EventTrack.Dev.restoreLogin(userId: userId)
    if activatedUID != nil {
      await AuthSession.shared.clearSession()
      await MainActor.run {
        self.activatedUID = nil
        self.userInfo = nil
      }
    }

    guard let token = try? await AuthSession.shared.freshAnonymousToken(), !token.isEmpty else {
      loginAnonymousIfNeeded()
      throw LLError.restoreLoginFailed
    }
    let secureKey = try SecureEnclaveKey.wallet(id: userId)

    guard let signData = token.addUserMessage(),
          let publicKey = secureKey.publicKey()?.hexValue,
          !publicKey.isEmpty
    else {
      throw LLError.signFailed
    }

    let signature = try secureKey.sign(data: signData, hashAlgo: .SHA2_256)

    await IPManager.shared.fetch()
    let key = AccountKey(
      hashAlgo: Flow.HashAlgorithm.SHA2_256.index,
      publicKey: publicKey,
      signAlgo: Flow.SignatureAlgorithm.ECDSA_P256.index
    )

    let flowAccountInfo = FlowAccountInfo(accountKey: key, signature: signature.hexValue)

    let request = LoginRequest(
      flowAccountInfo: flowAccountInfo,
      evmAccountInfo: nil,
      deviceInfo: IPManager.shared.toParams()
    )

    let response: Network.Response<LoginResponse> = try await Network
      .requestWithRawModel(FRWAPI.User.login(request), bearerToken: token)
    if response.httpCode == 404 {
      throw LLError.accountNotFound
    }
    userType = .secure
    guard let grant = try? response.data?.authGrant() else {
      throw LLError.restoreLoginFailed
    }
    try await finishLogin(grant: grant)
  }

  func importLogin(
    by address: String,
    userName: String,
    flowKey: Flow.AccountKey,
    privateKey: any KeyProtocol,
    isImport: Bool = false,
    flowAccounts: [FlowWalletKit.Account]? = nil
  ) async throws {
    try await retryingSignedTokenReuse("importLogin") {
      try await self.importLoginAttempt(
        by: address,
        userName: userName,
        flowKey: flowKey,
        privateKey: privateKey,
        isImport: isImport
      )
    }
  }

  private func importLoginAttempt(
    by address: String,
    userName: String,
    flowKey: Flow.AccountKey,
    privateKey: any KeyProtocol,
    isImport: Bool
  ) async throws {
    await MainActor.run {
      isLoggingIn = true
    }

    defer {
      Task {
        await MainActor.run {
          isLoggingIn = false
        }
      }
    }

    if let mechanism = privateKey.keyType.toEventMechanism() {
      EventTrack.Account.recovered(address: address, mechanism: mechanism, methods: [])
    }

    if activatedUID != nil {
      await AuthSession.shared.clearSession()
      await MainActor.run {
        self.activatedUID = nil
        self.userInfo = nil
      }
    }

    guard let token = try? await AuthSession.shared.freshAnonymousToken(), !token.isEmpty else {
      loginAnonymousIfNeeded()
      throw LLError.restoreLoginFailed
    }

    guard let signData = token.addUserMessage()
    else {
      throw LLError.signFailed
    }
    let publicKey = flowKey.publicKey.description
    let signature = try privateKey.sign(
      data: signData,
      signAlgo: flowKey.signAlgo,
      hashAlgo: flowKey.hashAlgo
    ).hexValue

    await IPManager.shared.fetch()

    let key = AccountKey(
      hashAlgo: flowKey.hashAlgo.index,
      publicKey: publicKey,
      signAlgo: flowKey.signAlgo.index
    )

    var loginResponse: LoginResponse?
    if isImport {
      let request = RestoreImportRequest(
        username: userName,
        accountKey: key,
        deviceInfo: IPManager.shared.toParams(),
        address: address
      )
      let response: Network.Response<LoginResponse> = try await Network
        .requestWithRawModel(FRWAPI.User.loginWithImport(request), bearerToken: token)
      if response.httpCode == 404 {
        throw LLError.accountNotFound
      }
      loginResponse = response.data
    } else {
      let flowAccountInfo = FlowAccountInfo(accountKey: key, signature: signature)
      var evmAccountInfo: EVMAccountInfo?
      if let ethProvider = privateKey as? EthereumKeyProtocol,
         let wallet = try? Wallet(type: .key(privateKey)),
         let evmAddress = try? wallet.ethAddress(),
         let evmSignature = try? ethProvider.ethSign(digest: signData) {
        evmAccountInfo = EVMAccountInfo(eoaAddress: evmAddress, signature: evmSignature.hexValue)
      }

      let request = LoginRequest(
        flowAccountInfo: flowAccountInfo,
        evmAccountInfo: evmAccountInfo,
        deviceInfo: IPManager.shared.toParams(),
        address: address
      )
      let response: Network.Response<LoginResponse> = try await Network
        .requestWithRawModel(FRWAPI.User.login(request), bearerToken: token)
      if response.httpCode == 404 {
        throw LLError.accountNotFound
      }
      loginResponse = response.data
    }

    userType = .fromImport
    guard let uid = loginResponse?.id, let grant = try? loginResponse?.authGrant() else {
      throw LLError.restoreLoginFailed
    }
    try privateKey.store(
      id: privateKey.createKey(uid: uid),
      password: KeyProvider.password(with: uid)
    )
    log.debug("[user] \(flowKey)")
    let store = StoreUser(
      publicKey: publicKey,
      address: address,
      userId: uid,
      keyType: privateKey.keyType,
      account: flowKey.toStoreKey()
    )
    LocalUserDefaults.shared.addUser(user: store)
    await WalletManager.shared.updateKeyProvider(provider: privateKey)
    log.debug("[user] \(store)")
    try await finishLogin(grant: grant)
  }
}

// MARK: - Login with Profile

extension UserManager {
  func login(with profile: ProfileModel) async throws {
    try await retryingSignedTokenReuse("login(profile)") {
      try await self.loginAttempt(with: profile)
    }
  }

  private func loginAttempt(with profile: ProfileModel) async throws {
    await MainActor.run {
      isLoggingIn = true
    }

    defer {
      Task {
        await MainActor.run {
          isLoggingIn = false
        }
      }
    }

    guard let token = try? await AuthSession.shared.freshAnonymousToken(), !token.isEmpty else {
      loginAnonymousIfNeeded()
      throw LLError.restoreLoginFailed
    }

    // Find valid key provider (validates on-chain)
    // Returns the key provider along with on-chain account info and already-fetched wallet/accounts
    let keyResult = await WalletManager.shared.findKeyProvider(uid: profile.uid)

    let keyProvider: any KeyProtocol
    let accountKey: Flow.AccountKey
    let address: String
    let wallet: FlowWalletKit.Wallet
    let accounts: [FlowWalletKit.Account]

    switch keyResult {
    case .success(let data):
      // Found valid key with on-chain account
      keyProvider = data.provider
      accountKey = data.accountKey
      address = data.address
      wallet = data.wallet
      accounts = data.accounts
    case .providerWithoutAccount(let provider):
      // Provider exists but account is still being created
      // For login, we need on-chain account, so this should fail
      log.error("[Login] Provider exists but no on-chain account for profile: \(profile.uid)")
      throw WalletError.emptyMainAccount
    case .noValidProvider(let error):
      log.error("[Login] No valid key found for profile: \(profile.uid), error: \(error.errorMessage)")
      throw error
    }

    // Use the signAlgo and hashAlgo from the on-chain account key
    let signAlgo = accountKey.signAlgo
    let hashAlgo = accountKey.hashAlgo

    guard let signData = token.addUserMessage(),
          let publicKey = keyProvider.publicKey(signAlgo: signAlgo)?.hexValue,
          !publicKey.isEmpty
    else {
      throw LLError.signFailed
    }

    log.info("[Login] Using on-chain key config - signAlgo: \(signAlgo), hashAlgo: \(hashAlgo), address: \(address)")

    let signature = try keyProvider.sign(data: signData, signAlgo: signAlgo, hashAlgo: hashAlgo)

    await IPManager.shared.fetch()
    let key = AccountKey(
      hashAlgo: hashAlgo.index,
      publicKey: publicKey,
      signAlgo: signAlgo.index
    )

    let flowAccountInfo = FlowAccountInfo(accountKey: key, signature: signature.hexValue)
    var evmAccountInfo: EVMAccountInfo?
    if let ethProvider = keyProvider as? EthereumKeyProtocol,
       let evmAddress = try? wallet.ethAddress(),
       let evmSignature = try? ethProvider.ethSign(digest: signData) {
      evmAccountInfo = EVMAccountInfo(eoaAddress: evmAddress, signature: evmSignature.hexValue)
    }

    let request = LoginRequest(
      flowAccountInfo: flowAccountInfo,
      evmAccountInfo: evmAccountInfo,
      deviceInfo: IPManager.shared.toParams()
    )
    let response: Network.Response<LoginResponse> = try await Network
      .requestWithRawModel(FRWAPI.User.login(request), bearerToken: token)
    if response.httpCode == 404 {
      throw LLError.accountNotFound
    }
    guard let grant = try? response.data?.authGrant() else {
      throw LLError.restoreLoginFailed
    }
    await WalletManager.shared.updateKeyProvider(provider: keyProvider)

    // Use already-fetched accounts (no duplicate network request!)
    let validAccounts = accounts.filter { $0.hasFullWeightKey }

    if !validAccounts.isEmpty {
      var userStoreList: [StoreUser] = []
      for account in validAccounts {
        // IMPORTANT: Find the key that matches our publicKey from fullWeightKeys
        // fullWeightKeys already filters: !revoked && weight >= 1000
        // But we need to find the one matching our current publicKey
        let matchingKey = account.fullWeightKeys.first { key in
          key.publicKey.hex == publicKey
        }

        // Use the matching key if found, otherwise fall back to accountKey from findKeyProvider
        let keyToStore = matchingKey ?? accountKey

        let storeUser = StoreUser(
          publicKey: publicKey,
          address: account.hexAddr,
          userId: profile.uid,
          keyType: keyProvider.keyType,
          account: keyToStore.toStoreKey()
        )
        userStoreList.append(storeUser)
        LocalUserDefaults.shared.addUser(user: storeUser)
      }
      ProfileManager.shared.replace(profile: profile, with: userStoreList)
    } else {
      // Fallback: use the account from findKeyProvider if no accounts found
      // This shouldn't happen since findKeyProvider already validated
      let storeUser = StoreUser(
        publicKey: publicKey,
        address: address,
        userId: profile.uid,
        keyType: keyProvider.keyType,
        account: accountKey.toStoreKey()
      )
      LocalUserDefaults.shared.addUser(user: storeUser)
      ProfileManager.shared.replace(profile: profile, with: [storeUser])
    }

    try await finishLogin(grant: grant)
  }
}

// MARK: - Switch Account

extension UserManager {
  func switchAccount(with profile: ProfileModel) async throws {
    if currentNetwork != .mainnet {
      await WalletManager.shared.changeNetwork(.mainnet)
    }

    if profile.uid == activatedUID {
      log.warning("switching the same account")
      return
    }

    // No need to manually call clear() - activatedUID observer will handle it
    // Observer triggers when login() sets activatedUID, calling clear() + initWallet()
    do {
      try await login(with: profile)
    } catch {
      let uid = profile.uid
      log.warning("[Login] login with profile failed. \(uid)")
      try await switchAccount(withUID: uid)
    }
  }

  func switchAccount(withUID uid: String) async throws {
    if currentNetwork != .mainnet {
      await WalletManager.shared.changeNetwork(.mainnet)
    }

    if uid == activatedUID {
      log.warning("switching the same account")
      return
    }

    // No need to manually call clear() - activatedUID observer will handle it
    // Use restoreLogin(with:) which internally uses findKeyProvider for validation
    try await restoreLogin(with: uid)

    // FIXME: data migrate from device to other device,the private key is destructive
//        let allModel = try WallectSecureEnclave.Store.fetchAllModel(by: uid)
//        let model = try WallectSecureEnclave.Store.fetchModel(by: uid)
//
//        if model != nil {
//            try await restoreLogin(userId: uid)
//            return
//        }
//        if model == nil && allModel.count > 0 {
//            WalletManager.shared.warningIfKeyIsInvalid(userId: uid, markHide: true)
//            return
//        }
//
//        throw WalletError.mnemonicMissing
  }
}

// MARK: - Internal Login Logic

extension UserManager {
  private func finishLogin(
    grant: AuthGrant,
    isRegiter: Bool = false
  ) async throws {
    await AuthSession.shared.establish(grant)
    var info = try await fetchUserInfo()
    info.type = userType
    let userInfo = info

    guard let uid = grant.uid, !uid.isEmpty else {
      throw LLError.fetchUserInfoFailed
    }

    if !loginUIDList.contains(uid), !isRegiter {
      ConfettiManager.show()
    }

    await MainActor.run {
      self.activatedUID = uid
      self.userInfo = userInfo
      self.insertLoginUID(uid)
      NotificationCenter.default.post(name: .didFinishAccountLogin, object: nil)
      self.uploadUserNameIfNeeded()
    }
  }

  private func insertLoginUID(_ uid: String) {
    if currentNetwork != .mainnet {
      return
    }
    var oldList = loginUIDList
    oldList.removeAll { $0 == uid }
    oldList.insert(uid, at: 0)
    loginUIDList = oldList
  }

  func deleteLoginUID(_ uid: String) {
    var oldList = loginUIDList
    oldList.removeAll { $0 == uid }
    loginUIDList = oldList
  }

  private func fetchUserInfo() async throws -> UserInfo {
    let response: UserInfoResponse = try await Network.request(FRWAPI.User.userInfo)
    let info = UserInfo(
      avatar: response.avatar,
      nickname: response.nickname,
      username: response.username,
      private: response.private,
      address: nil
    )

    if info.username.isEmpty {
      throw LLError.fetchUserInfoFailed
    }

    return info
  }
}

// MARK: - Internal

extension UserManager {
  /// Anonymous tokens are minted on demand by AuthSession; nothing to do up front.
  private func loginAnonymousIfNeeded() {}

  func getIDToken() async throws -> String? {
    try await AuthSession.shared.token()
  }

  /// Re-establishes the API session for the active profile without UI: signs a fresh anonymous
  /// token with the profile's wallet key and calls /v4/login. Used by AuthSession when a profile
  /// is active but no session is stored (for example the first launch after the Firebase removal).
  func restoreSessionSilently() async -> Bool {
    guard let uid = activatedUID else { return false }
    guard case let .success(data) = await WalletManager.shared.findKeyProvider(uid: uid) else {
      log.warning("[Auth] silent session restore: no valid key for \(uid)")
      return false
    }
    do {
      if IPManager.shared.info == nil {
        await IPManager.shared.fetch()
      }
      return try await retryingSignedTokenReuse("silent session restore") {
        try await self.silentLoginAttempt(uid: uid, data: data)
      }
    } catch {
      log.error("[Auth] silent session restore failed", context: error)
      return false
    }
  }

  private func silentLoginAttempt(uid: String, data: KeyProviderData) async throws -> Bool {
      let token = try await AuthSession.shared.freshAnonymousToken()
      guard let signData = token.addUserMessage(),
            let publicKey = data.provider.publicKey(signAlgo: data.accountKey.signAlgo)?.hexValue
      else {
        return false
      }
      let signature = try data.provider.sign(
        data: signData,
        signAlgo: data.accountKey.signAlgo,
        hashAlgo: data.accountKey.hashAlgo
      )
      let key = AccountKey(
        hashAlgo: data.accountKey.hashAlgo.index,
        publicKey: publicKey,
        signAlgo: data.accountKey.signAlgo.index
      )
      var evmAccountInfo: EVMAccountInfo?
      if let ethProvider = data.provider as? EthereumKeyProtocol,
         let evmAddress = try? data.wallet.ethAddress(),
         let evmSignature = try? ethProvider.ethSign(digest: signData) {
        evmAccountInfo = EVMAccountInfo(eoaAddress: evmAddress, signature: evmSignature.hexValue)
      }
      let request = LoginRequest(
        flowAccountInfo: FlowAccountInfo(accountKey: key, signature: signature.hexValue),
        evmAccountInfo: evmAccountInfo,
        deviceInfo: IPManager.shared.toParams()
      )
      let response: Network.Response<LoginResponse> = try await Network
        .requestWithRawModel(FRWAPI.User.login(request), bearerToken: token)
      guard let loginData = response.data, loginData.id == uid else {
        log.warning("[Auth] silent session restore: uid mismatch or empty response")
        return false
      }
      await AuthSession.shared.establish(try loginData.authGrant())
      log.info("[Auth] session restored for \(uid)")
      return true
  }

  /// auth-contract.md "Replay protection": a signed token mints a session only once, and the
  /// server answers a second use with 401 `signed_token_reused` (for example a retry after a lost
  /// response). Each attempt mints a fresh anonymous token and signs it, so run it once more.
  private func retryingSignedTokenReuse<T>(
    _ label: String,
    _ attempt: () async throws -> T
  ) async throws -> T {
    do {
      return try await attempt()
    } catch AuthError.signedTokenReused {
      log.warning("[Auth] \(label): signed token already used, retrying with a fresh token")
      return try await attempt()
    }
  }
}

// MARK: - Modify

extension UserManager {
  private func uploadUserNameIfNeeded() {
    if !isLoggedIn {
      return
    }

    // Used to mirror the username into the Firebase Auth displayName. Firebase Auth is gone.
  }

  func updateNickname(_ name: String) {
    guard let current = userInfo else {
      return
    }

    let newUserInfo = UserInfo(
      avatar: current.avatar,
      nickname: name,
      username: current.username,
      private: current.private,
      address: nil
    )
    userInfo = newUserInfo
  }

  func updatePrivate(_ isPrivate: Bool) {
    guard let current = userInfo else {
      return
    }

    let newUserInfo = UserInfo(
      avatar: current.avatar,
      nickname: current.nickname,
      username: current.username,
      private: isPrivate ? 2 : 1,
      address: nil
    )
    userInfo = newUserInfo
  }

  func updateAvatar(_ avatar: String) {
    guard let current = userInfo else {
      return
    }

    let newUserInfo = UserInfo(
      avatar: avatar,
      nickname: current.nickname,
      username: current.username,
      private: current.private,
      address: nil
    )
    userInfo = newUserInfo
  }
}

// used by API FRWAPI.Utils.flowAddress
extension UserManager {
  struct AccountResponse: Codable {
    let publicKey: String?
    var accounts: [AccountInfo]?
  }

  struct AccountInfo: Codable {
    let address: String?
    let weight: Int?
    let keyId: Int?
  }
}

// MARK: UserManager.StoreUser

extension UserManager {
  struct Accountkey: Codable {
    public var index: Int
    public let signAlgo: Flow.SignatureAlgorithm
    public let hashAlgo: Flow.HashAlgorithm
    public let weight: Int
  }

  struct StoreUser: Codable {
    let publicKey: String
    let address: String?
    let userId: String
    let keyType: FlowWalletKit.KeyType
    let account: UserManager.Accountkey?
    var updateAt: TimeInterval = ceil(Date().timeIntervalSince1970)

    func copy(address: String? = nil, account: UserManager.Accountkey? = nil) -> StoreUser {
      StoreUser(
        publicKey: publicKey,
        address: address ?? self.address,
        userId: userId,
        keyType: keyType,
        account: account ?? self.account
      )
    }
  }
}

extension UserManager.Accountkey {
  func toFlowKey() -> Flow.AccountKey {
    .init(
      index: index,
      publicKey: .init(hex: ""),
      signAlgo: signAlgo,
      hashAlgo: hashAlgo,
      weight: weight
    )
  }
}

extension Flow.AccountKey {
  func toStoreKey() -> UserManager.Accountkey {
    UserManager.Accountkey(index: index, signAlgo: signAlgo, hashAlgo: hashAlgo, weight: weight)
  }
}

// MARK: - UserManager.UserType

extension UserManager {
  enum UserType: Codable {
    case phrase
    case secure
    case fromImport

    // MARK: Lifecycle

    init(_ keyType: KeyType) {
      switch keyType {
      case .secureEnclave:
        self = .secure
      case .seedPhrase:
        self = .phrase
      default:
        self = .fromImport
      }
    }
  }
}
