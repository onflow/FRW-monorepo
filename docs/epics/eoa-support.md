# EPIC: EOA (EVM) Support for Extension and Mobile

## Overview

Enable both Extension and Mobile applications to support EOA (Externally Owned
Accounts) for EVM compatibility, transitioning from the current COA (Cadence
Owned Account) model to a hybrid approach that supports both account types.

## Background

Currently, FRW uses:

- **Extension**: Mnemonic-based key generation with publickey cache keys
- **Mobile**: Secure Enclave-based private key generation

The goal is to implement EOA support while maintaining backward compatibility
and providing migration paths for existing users.

## Key Challenges

1. **Account Model Mismatch**: Current publickey-based cache system doesn't
   align with multi-key derivation from single mnemonic
2. **EVM vs Cadence Differences**: EOA vs COA have fundamentally different
   signing and interaction patterns
3. **Backward Compatibility**: Must support existing Secure Enclave users on
   mobile
4. **Security**: Upgrade cloud backup from AES to proper keystore.json format
5. **Cross-Platform Sync**: Secure E2E WalletConnect encrypted channel for
   mnemonic transfer

## Success Criteria

- [ ] Extension supports EOA alongside existing Flow accounts
- [ ] Mobile migrates to mnemonic-based approach with EOA support
- [ ] Full EVM dApp compatibility with all required RPC calls
- [ ] Secure cloud backup using keystore.json format
- [ ] E2E encrypted mnemonic sync between Extension and Mobile
- [ ] Backward compatibility for existing Secure Enclave users
- [ ] Migration path from Secure Enclave to seed phrase

## Architecture Changes

### Account Structure

```typescript
interface Account {
  address: string;
  type: 'EOA' | 'Flow' | 'ChildAccount' | 'COA';
  derivationPath?: string; // For EOA accounts
  publicKey: string;
  // ... existing fields
}
```

### Wallet Package

New `@onflow/frw-wallet` package implementing Flow Wallet Kit integration:

- EOA discovery and management
- Flow account detection
- Child account and COA support
- Extension background service integration

### Keyring Adaptation

Bridge between existing keyring and Flow Wallet Kit:

- Private key derivation from mnemonic
- Account cache updates
- Multi-account support

## Milestones

### Milestone 1: Core EOA Implementation

**Target**: Basic EOA support with account discovery

**Extension Tasks**: Wallet package, keyring adapter, account structure, EVM
dApp integration **Mobile Tasks**: Native wallet kit, UI onboarding, account
structure, EVM dApp integration

### Milestone 2: Security & Sync

**Target**: Production-ready security and cross-platform sync

**Extension Tasks**: Cloud backup upgrade, E2E WC encrypted channel **Mobile
Tasks**: Cloud backup upgrade, backup/restore UI, E2E WC encrypted channel

### Milestone 3: Migration & Compatibility

**Target**: Seamless migration for existing users

**Mobile Tasks**: Secure Enclave compatibility, migration options

## Technical Dependencies

- Flow Wallet Kit (Extension background only)
- EVM RPC implementation updates
- WalletConnect E2E encryption
- Keystore.json format implementation
- Native Flow Wallet Kit integration (Mobile)

## Risks & Mitigations

1. **Key Management Complexity**: Implement thorough testing and fallback
   mechanisms
2. **Migration Issues**: Comprehensive backup/restore testing with existing data
3. **dApp Compatibility**: Extensive testing with major EVM dApps
4. **Security Vulnerabilities**: Security audit of new keystore format and E2E
   encryption

## Timeline

- **Milestone 1**: 6-8 weeks
- **Milestone 2**: 4-6 weeks
- **Milestone 3**: 3-4 weeks

**Total Estimated Time**: 13-18 weeks
