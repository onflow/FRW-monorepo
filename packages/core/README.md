# 🎯 @onflow/frw-core

> Core business logic and services for Flow Reference Wallet

[![npm version](https://img.shields.io/npm/v/@onflow/frw-core.svg)](https://www.npmjs.com/package/@onflow/frw-core)
[![License: LGPL v3](https://img.shields.io/badge/License-LGPL%20v3-blue.svg)](https://www.gnu.org/licenses/lgpl-3.0)

## 📦 Overview

`@onflow/frw-core` provides the core business logic and services for building Flow Reference Wallet applications. It's a collection of singleton services that manage wallet operations, blockchain interactions, and user data.

### Key Features

- 🔐 **Keyring Management**: Secure HD wallet and key management
- 💸 **Transaction Services**: Flow & EVM transaction building and submission
- 🎨 **NFT Services**: Comprehensive NFT management for Flow and EVM
- 👤 **Account Management**: Multi-profile and multi-account support
- 🌐 **Network Services**: Flow blockchain and API interactions
- 📊 **Data Services**: Token lists, prices, and user preferences
- 🔄 **Authentication**: Firebase auth and Google Drive backup

## 📥 Installation

```bash
npm install @onflow/frw-core
```

```bash
yarn add @onflow/frw-core
```

```bash
pnpm add @onflow/frw-core
```

### Peer Dependencies

Some features require additional peer dependencies:

```bash
# For wallet operations
npm install @trustwallet/wallet-core ethers

# For Firebase features
npm install firebase
```

## 🚀 Quick Start

### Service Initialization

All services are singletons that need to be initialized in a specific order:

```typescript
import {
  authenticationService,
  versionService,
  keyringService,
  openapiService,
  permissionService,
  preferenceService,
  coinListService,
  userInfoService,
  addressBookService,
  userWalletService,
  transactionActivityService,
  nftService,
  evmNftService,
  googleDriveService,
  googleSafeHostService,
  tokenListService,
  remoteConfigService,
  newsService,
} from '@onflow/frw-core';
import { initializeStorage } from '@onflow/frw-data-model';

// Initialize services following the required order
async function initializeWallet() {
  // 1. Initialize storage implementation (required first)
  initializeStorage({ implementation: chromeStorage });

  // 2. Version service (tracks extension version)
  await versionService.init('1.0.0'); // Your app version

  // 3. Authentication service (Firebase)
  await authenticationService.init(firebaseConfig);

  // 4. OpenAPI service (required for FCL and API calls)
  await openapiService.init(
    API_GO_SERVER_URL, // Registration server URL
    API_BASE_URL, // Web API base URL
    FB_FUNCTIONS_URL, // Firebase functions URL
    SCRIPTS_PUBLIC_KEY, // Public key for script verification
    isDev // Development mode flag
  );

  // 5. Analytics and logging (optional)
  if (process.env.MIXPANEL_TOKEN) {
    await mixpanelService.init(process.env.MIXPANEL_TOKEN);
    // Initialize logging after analytics
    initializeChromeLogging();
  }

  // 6. Keyring service (loads encrypted vaults)
  await keyringService.loadKeyringStore();

  // 7. Core services (can be initialized in parallel)
  await Promise.all([
    permissionService.init(),
    preferenceService.init(),
    coinListService.init(),
    userInfoService.init(),
    addressBookService.init(),
  ]);

  // 8. Wallet and transaction services
  await userWalletService.init();
  await transactionActivityService.init();

  // 9. NFT services
  await nftService.init();
  await evmNftService.init();

  // 10. Google services (optional)
  await googleDriveService.init({
    baseURL: 'https://www.googleapis.com/',
    backupName: process.env.GD_BACKUP_NAME!,
    appDataFolder: process.env.GD_FOLDER!,
    scope: 'https://www.googleapis.com/auth/drive.appdata',
    AES_KEY: process.env.GD_AES_KEY!,
    IV: process.env.GD_IV!,
    getAuthTokenWrapper: authTokenFunction,
  });

  await googleSafeHostService.init({
    baseURL: 'https://safebrowsing.googleapis.com/',
    key: process.env.GOOGLE_API!,
  });

  // 11. Additional services
  await tokenListService.init();
  await remoteConfigService.init();
  await newsService.init();

  // 12. Mark initialization complete
  // This is typically handled by your app controller
  // await walletController.setLoaded(true);
}
```

#### Initialization Order Requirements

1. **Storage** must be initialized first as many services depend on it
2. **Version Service** tracks the app version for compatibility
3. **Authentication** must come before OpenAPI as API calls require auth
4. **OpenAPI** initializes FCL and API clients needed by other services
5. **Keyring** must be loaded before wallet services that access keys
6. **Core services** (permissions, preferences, etc.) can initialize in parallel
7. **Wallet services** depend on core services being ready
8. **Optional services** (Google Drive, analytics) can be conditionally initialized

## 📚 Core Services

### 👤 Account Management Service

Complete wallet and profile management including creation, import, and account discovery.

```typescript
import { accountManagementService } from '@onflow/frw-core';
import { FLOW_BIP44_PATH } from '@onflow/frw-shared/constant';

// Generate mnemonic for new wallet
const mnemonic = await accountManagementService.generateMnemonic();
// Returns: "word1 word2 word3..." (12 words)

// Register completely new profile (first time user)
await accountManagementService.registerNewProfile(
  'alice', // username
  'securePassword123', // password
  mnemonic // generated mnemonic
);
// This will:
// 1. Create encrypted keyring with the mnemonic
// 2. Register account with backend API
// 3. Create Flow blockchain account
// 4. Set as current profile

// Import existing wallet with mnemonic
await accountManagementService.importProfileUsingMnemonic(
  'bob', // username
  'password456', // password
  'existing twelve word mnemonic phrase here...', // mnemonic
  FLOW_BIP44_PATH, // optional: "m/44'/539'/0'/0/0"
  '' // optional: BIP39 passphrase
);

// Import with private key (hex format)
await accountManagementService.importProfileUsingPrivateKey(
  'charlie', // username
  'password789', // password
  'a1b2c3d4e5f6...', // private key hex
  '0x1234567890abcdef' // optional: known Flow address
);
// If address not provided, it will be discovered

// Verify password without changing state
const isValid = await accountManagementService.verifyPasswordIfBooted('password123');

// Switch between profiles
const profiles = await accountManagementService.getProfiles();
await accountManagementService.switchProfile(profiles[1].id);

// Create additional Flow account on different network
const newTestnetAccount = await accountManagementService.createNewAccount('testnet');
// Returns: { address: '0x...', txId: '...' }

// Check if account creation transaction completed
const account = await accountManagementService.checkForNewAddress(
  'mainnet',
  'publicKeyHex',
  'transactionId'
);
// Returns: FclAccount object when found, null if still pending

// Remove a profile (careful - this is permanent!)
const removed = await accountManagementService.removeProfile('password123', 'profileId');
```

### 💸 Transaction Service

Handles all transaction operations including token transfers, NFT transfers, and EVM interactions.

```typescript
import { transactionService } from '@onflow/frw-core';
import { type TransactionState } from '@onflow/frw-shared/types';

// Transfer tokens using transaction state from reducer
const transactionState: TransactionState = {
  currentTxState: 'FlowFromCadenceToCadence',
  parentAddress: '0x123...',
  fromAddress: '0x123...',
  toAddress: '0xabc...',
  amount: '10.5',
  tokenInfo: {
    symbol: 'FLOW',
    decimals: 8,
    address: '0x1654653399040a61',
    contractName: 'FlowToken',
    balance: '100.0',
    // ... other token info
  },
  tokenType: 'Flow',
  fromAddressType: 'Cadence',
  toAddressType: 'Cadence',
  // ... other fields from transaction reducer
};

const txId = await transactionService.transferTokens(transactionState);

// Create COA (Cadence Owned Account) for EVM
const coaTxId = await transactionService.createCOA('1.0'); // with 1 FLOW funding
const emptyCoaTxId = await transactionService.createCoaEmpty(); // without funding

// Track COA creation
await transactionService.trackCoaCreation(coaTxId);

// Transfer FLOW to EVM address
const evmTxId = await transactionService.transferFlowEvm(
  '0x742d35Cc6634C0532925a3b844Bc9e7595f7E123', // EVM address
  '10.0', // amount
  30000000 // gas limit
);

// Transfer custom fungible token to EVM
const ftEvmTxId = await transactionService.transferFTToEvm(
  '0xd2abb5dbf47e4901', // token contract address
  'ExampleToken', // token contract name
  'exampleTokenVault', // storage path
  '0x742d35Cc...', // recipient EVM address
  '100.0', // amount
  30000000 // gas limit
);

// Bridge tokens from EVM
const bridgeTxId = await transactionService.bridgeTokensFromEvm(
  'USDC', // token symbol
  '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', // token address
  '100.0' // amount
);

// Send custom Cadence transaction
const customTxId = await transactionService.sendTransaction(
  `
    transaction(amount: UFix64) {
      prepare(signer: AuthAccount) {
        // Custom logic
      }
    }
  `,
  [{ type: 'UFix64', value: '10.0' }],
  '0x123...' // signer address
);

// Transfer NFT
const nftTxId = await transactionService.transferNFT(
  'TopShot', // collection name
  '12345', // NFT ID
  '0xabc...' // recipient
);
```

### 🎨 NFT Services

Comprehensive NFT management for both Flow and EVM chains.

```typescript
import { nftService, evmNftService } from '@onflow/frw-core';

// Flow NFTs
const collections = await nftService.loadNftCatalogCollections(network, address);

const singleCollection = await nftService.loadSingleNftCollection(
  network,
  address,
  collectionId,
  offset
);

// Child account NFTs
const childNfts = await nftService.loadChildAccountNFTs(network, parentAddress);

// Get allowed NFT types for child account
const allowedTypes = await nftService.loadChildAccountAllowTypes(
  network,
  parentAddress,
  childAddress
);

// EVM NFTs
const evmNftIds = await evmNftService.loadEvmNftIds(network, evmAddress);

const evmCollection = await evmNftService.loadEvmCollectionList(
  network,
  evmAddress,
  collectionId,
  offset
);

await evmNftService.clearEvmNfts(); // Clear cache
```

### 🪙 Coin List Service

Manages token lists, balances, and price data.

```typescript
import { coinListService } from '@onflow/frw-core';

// Initialize service
await coinListService.init();

// Coin list is automatically loaded and cached
// Access through data-model cache keys
```

### ⚙️ Preference Service

User preferences and wallet settings.

```typescript
import { preferenceService } from '@onflow/frw-core';

// Get/set current account
const currentAccount = preferenceService.getCurrentAccount();
preferenceService.setCurrentAccount(account);

// Network management
const network = await preferenceService.getNetwork();
await preferenceService.setNetwork('testnet');

// Currency preference
const currency = await preferenceService.getCurrency();
await preferenceService.setCurrency('EUR');
```

### 🔐 Authentication Service

Firebase authentication integration.

```typescript
import { authenticationService } from '@onflow/frw-core';

// Initialize with Firebase config
await authenticationService.init({
  apiKey: '...',
  authDomain: '...',
  projectId: '...',
  // ... other Firebase config
});

// Service handles authentication state internally
// Used by other services for API authentication
```

### 💾 Google Drive Service

Backup and restore wallet data.

```typescript
import { googleDriveService } from '@onflow/frw-core';

// Initialize with config
await googleDriveService.init({
  baseURL: 'https://www.googleapis.com/',
  backupName: 'flow-wallet-backup',
  appDataFolder: 'appDataFolder',
  scope: 'https://www.googleapis.com/auth/drive.appdata',
  AES_KEY: process.env.GD_AES_KEY,
  IV: process.env.GD_IV,
  getAuthTokenWrapper: authTokenFunction,
});

// List backup files
const files = await googleDriveService.listFiles();

// Backup wallet
await googleDriveService.backup(walletData);

// Restore wallet
const restoredData = await googleDriveService.restore(fileId);
```

### 📊 User Wallet Service

Manages account state, balances, and relationships (parent/child/EVM accounts).

```typescript
import { userWalletService } from '@onflow/frw-core';

// Get main Flow accounts for current user
const mainAccounts = await userWalletService.getMainAccounts();
// Returns: MainAccount[] with structure:
// [{
//   address: '0x1234567890abcdef',
//   pubKey: 'publicKeyHex',
//   signAlgo: 'ECDSA_P256',
//   hashAlgo: 'SHA3_256',
//   weight: 1000,
//   keyIndex: 0,
//   name: 'alice',
//   icon: '🎨',
//   color: 'blue',
//   evmAccount: { address: '0x742d35...', type: 'evm' },
//   childAccounts: [...]
// }]

// Get current active account state
const activeAccounts = await userWalletService.getActiveAccounts();
// Returns: {
//   parentAddress: '0x1234567890abcdef',  // Main Flow account
//   currentAddress: '0x742d35...'          // Could be parent, child, or EVM
// }

// Get specific account types
const parentAccount = await userWalletService.getParentAccount();
const evmAccount = await userWalletService.getEvmAccount();
const childAccounts = await userWalletService.getChildAccounts();

// Get current addresses
const currentAddress = await userWalletService.getCurrentAddress();
const parentAddress = await userWalletService.getParentAddress();
const evmAddress = await userWalletService.getEvmAddress();

// Switch accounts
await userWalletService.setParentAccount('0x1234567890abcdef');
await userWalletService.setCurrentAccount('0x742d35...'); // Can be EVM or child

// Set active accounts directly
await userWalletService.setActiveAccounts({
  parentAddress: '0x1234567890abcdef',
  currentAddress: '0x9876543210fedcba',
});

// Create child account
const childAccount = await userWalletService.createChildAccount(
  'Gaming Account', // name
  '🎮', // icon
  'purple' // color
);

// Link existing child account
await userWalletService.linkChildAccount(
  '0xchildaddress...', // child address
  'DApp Account', // name
  '🌐' // icon
);

// Send custom Cadence transaction
const txId = await userWalletService.sendTransaction(
  `
    import FungibleToken from 0xFungibleToken

    transaction(amount: UFix64, recipient: Address) {
      prepare(signer: AuthAccount) {
        // Transaction logic
      }
    }
  `,
  [
    { type: 'UFix64', value: '10.0' },
    { type: 'Address', value: '0xrecipient...' },
  ]
);

// Get network and public key info
const network = userWalletService.getNetwork(); // 'mainnet' | 'testnet'
const pubKey = userWalletService.getCurrentPubkey();

// Load account data (triggers cache refresh)
await userWalletService.loadAccountsForPubKey('mainnet', 'publicKeyHex');
```

## 🏗️ Architecture

### Account Management Architecture

Accounts are managed through three main services:

1. **AccountManagementService** - Profile creation, import, and blockchain account creation
2. **UserWalletService** - Account state, relationships, and data access
3. **TransactionService** - All blockchain transactions and token transfers

```typescript
// Account flow:
// 1. Create/import profile with AccountManagementService
// 2. Access account data with UserWalletService
// 3. Send transactions with TransactionService

// Example: Complete wallet setup
await accountManagementService.registerNewProfile(username, password, mnemonic);
const mainAccounts = await userWalletService.getMainAccounts();
await transactionService.transferTokens(transactionState);
```

### Service Initialization Order

Services must be initialized in a specific order due to dependencies:

1. **Storage (data-model)** - Required by all services for persistence
2. **versionService** - Tracks app version for compatibility checks
3. **authenticationService** - Required for API authentication
4. **openapiService** - Initializes FCL and API clients
5. **Analytics/Logging** - Optional telemetry and debugging (if configured)
6. **keyringService** - Loads encrypted vault data
7. **Core services** - Permission, preference, user info, address book (can be parallel)
8. **userWalletService** - Depends on core services being ready
9. **Transaction/NFT services** - Depend on wallet service
10. **External services** - Google Drive, remote config, news (optional)

### Service Patterns

All services follow these patterns:

```typescript
class SomeService {
  // Singleton instance
  private static instance: SomeService;

  // Initialize method
  async init(config?: Config): Promise<void> {
    // One-time setup
  }

  // Service methods
  async doSomething(): Promise<Result> {
    // Business logic
  }
}

// Export singleton
export const someService = SomeService.getInstance();
```

## 💡 Real-World Usage

### Browser Extension Background Script

```typescript
// background/index.ts
import {
  authenticationService,
  versionService,
  keyringService,
  openapiService,
  // ... all other services
} from '@onflow/frw-core';
import { initializeStorage } from '@onflow/frw-data-model';
import { chromeStorage } from '@onflow/frw-extension-shared/chrome-storage';

async function restoreAppState() {
  // 1. Initialize storage first
  initializeStorage({ implementation: chromeStorage });

  // 2. Initialize version service
  await versionService.init(packageJson.version);

  // 3. Init authentication service
  await authenticationService.init(getFirbaseConfig());

  // 4. Init OpenAPI service
  await openapiService.init(
    process.env.API_GO_SERVER_URL!,
    process.env.API_BASE_URL!,
    process.env.FB_FUNCTIONS_URL!,
    process.env.SCRIPTS_PUBLIC_KEY!,
    process.env.NODE_ENV === 'development'
  );

  // 5. Load keyring store
  await keyringService.loadKeyringStore();

  // 6. Initialize other services
  await Promise.all([
    permissionService.init(),
    preferenceService.init(),
    coinListService.init(),
    userInfoService.init(),
    addressBookService.init(),
  ]);

  await userWalletService.init();
  await transactionActivityService.init();
  await nftService.init();
  await evmNftService.init();

  // 7. Optional services
  await googleDriveService.init(googleDriveConfig);
  await tokenListService.init();
  await remoteConfigService.init();
  await newsService.init();

  // 8. Mark app as loaded
  await walletController.setLoaded(true);
}

// Initialize on startup
restoreAppState();

// Handle messages from UI
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.method === 'transferTokens') {
    transactionService
      .transferTokens(request.params)
      .then(sendResponse)
      .catch((error) => sendResponse({ error: error.message }));
    return true; // async response
  }
});
```

### Wallet Controller Pattern

```typescript
// controller/wallet.ts
import { accountManagementService, transactionService, userWalletService } from '@onflow/frw-core';

export class WalletController {
  // Profile management
  async createNewProfile(username: string, password: string) {
    // Generate mnemonic
    const mnemonic = await accountManagementService.generateMnemonic();

    // Register profile (creates keys, registers with backend, creates Flow account)
    await accountManagementService.registerNewProfile(username, password, mnemonic);

    // Wait for account creation
    const accounts = await userWalletService.getMainAccounts();
    return { mnemonic, accounts };
  }

  async importWallet(username: string, password: string, mnemonic: string) {
    // Import with mnemonic
    await accountManagementService.importProfileUsingMnemonic(username, password, mnemonic);

    // Get imported accounts
    return userWalletService.getMainAccounts();
  }

  // Account operations
  async switchAccount(address: string) {
    await userWalletService.setCurrentAccount(address);
  }

  async getAccountInfo() {
    const activeAccounts = await userWalletService.getActiveAccounts();
    const parentAccount = await userWalletService.getParentAccount();
    const evmAccount = await userWalletService.getEvmAccount();

    return {
      current: activeAccounts.currentAddress,
      parent: parentAccount,
      evm: evmAccount,
    };
  }

  // Transaction operations
  async sendTokens(to: string, amount: string, tokenInfo: ExtendedTokenInfo) {
    const from = await userWalletService.getCurrentAddress();

    const transactionState: TransactionState = {
      fromAddress: from,
      toAddress: to,
      amount,
      tokenInfo,
      // ... other required fields
    };

    return transactionService.transferTokens(transactionState);
  }

  async createEVMAccount() {
    // Create COA (Cadence Owned Account)
    const txId = await transactionService.createCOA('1.0');

    // Monitor transaction
    await transactionService.trackCoaCreation(txId);

    // Refresh accounts
    const accounts = await userWalletService.getMainAccounts();
    return accounts[0].evmAccount;
  }
}
```

## 🧪 Testing

```typescript
import {
  accountManagementService,
  userWalletService,
  transactionService
} from '@onflow/frw-core';

describe('Wallet Operations', () => {
  beforeEach(async () => {
    // Initialize services
    await authenticationService.init(testConfig);
    await openapiService.init(...);
    await accountManagementService.init();
    await userWalletService.init();
  });

  it('should create new profile and account', async () => {
    const username = 'testuser';
    const password = 'testpass123';
    const mnemonic = await accountManagementService.generateMnemonic();

    // Register new profile
    await accountManagementService.registerNewProfile(username, password, mnemonic);

    // Verify account creation
    const accounts = await userWalletService.getMainAccounts();
    expect(accounts).toHaveLength(1);
    expect(accounts[0].address).toMatch(/^0x[a-f0-9]{16}$/);
  });

  it('should transfer tokens', async () => {
    const transactionState = {
      fromAddress: '0x123...',
      toAddress: '0xabc...',
      amount: '10.0',
      tokenInfo: mockFlowTokenInfo,
      // ... other fields
    };

    const txId = await transactionService.transferTokens(transactionState);
    expect(txId).toMatch(/^[a-f0-9]{64}$/);
  });
});
```

## 🔒 Security Considerations

- Never expose private keys or mnemonics
- Always validate inputs before transactions
- Use secure password requirements
- Implement proper session management
- Follow Flow blockchain security best practices
- Services handle encryption internally

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the LGPL-3.0-or-later License - see the LICENSE file for details.

## 🔗 Related Packages

- [@onflow/frw-shared](../shared) - Shared types and utilities
- [@onflow/frw-data-model](../data-model) - Cache data model
- [@onflow/frw-reducers](../reducers) - State management reducers
- [@onflow/frw-extension-shared](../extension-shared) - Extension utilities
