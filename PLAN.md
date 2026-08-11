# Key Rotation: Expand & Collapse Architecture

## Problem

The current `addAndRevokeKeys` Cadence transaction is atomic: it adds the new
key **and** revokes the old key in a single transaction. This means if anything
goes wrong with the new key after the transaction succeeds, the user has no
fallback.

The fundamental risk of an atomic rotation remains: **the old key is destroyed
before the new key is proven to work.**

## Proposed Architecture: 3-Phase Rotation

Split the atomic rotation into three distinct phases:

```
Phase 1: EXPAND        Phase 2: VERIFY        Phase 3: COLLAPSE
┌──────────────┐       ┌──────────────┐       ┌──────────────┐
│ Add new key  │──────>│ Sign test    │──────>│ Revoke old   │
│ (keep old)   │       │ payload with │       │ key(s)       │
│              │       │ new key      │       │              │
└──────────────┘       └──────────────┘       └──────────────┘
  Account has            Proves new key          Old key removed
  2 active keys          actually works          only after proof
```

### Phase 1: Expand (On-chain)

A new Cadence transaction (`addKey`) that **only adds** the new public key to
the account. The old Blocto key remains active. The account temporarily has two
valid signing keys.

**Why this is safe:** If the app crashes here, the user still has the old key.
Nothing has been destroyed.

### Phase 2: Verify (Off-chain)

The app constructs a test payload and signs it using the **new** private key.
This proves:

1. The key material was correctly stored
2. The signing algorithms are compatible
3. The key can produce valid signatures

**Why this is critical:** An atomic architecture skips verification entirely.
The new key is assumed to work because it was generated correctly. But storage
corruption, algorithm mismatches, or platform bridge bugs could silently produce
an unusable key.

### Phase 3: Collapse (On-chain)

Only after successful verification, a second Cadence transaction (`revokeKeys`)
removes the old Blocto key(s).

**Why this is safe:** By this point, we have mathematical proof that the new key
works. The old key can be safely retired.

## Required Changes

### New Cadence Transactions

The existing `addAndRevokeKeys` transaction must be decomposed into two separate
transactions:

```cadence
// addKey.cdc - Phase 1
transaction(publicKeys: [String]) {
    prepare(signer: auth(Keys) &Account) {
      for publicKey in publicKeys {
        let key = PublicKey(
            publicKey: publicKey.decodeHex(),
            signatureAlgorithm: SignatureAlgorithm.ECDSA_secp256k1
        )
        signer.keys.add(
            publicKey: key,
            hashAlgorithm: HashAlgorithm.SHA2_256,
            weight: 1000.0
        )
      }
    }
}
```

```cadence
// revokeKeys.cdc - Phase 3
transaction(revokeKeyIndexs: [Int]) {
    prepare(signer: auth(Keys) &Account) {
      for revokeKeyIndex in revokeKeyIndexs {
        signer.keys.revoke(keyIndex: revokeKeyIndex)
      }
    }
}
```

### Service Layer Changes

`KeyRotationService.rotateKey` would be refactored to orchestrate the 3 phases:

```typescript
async rotateKey(address: string, newKeyInfo: NewKeyInfo) {
  // Phase 1: Add key (old key still works)
  const addTxId = await this.workflow.addKeyOnChain(newKeyInfo.flowKey.publicKey);
  await waitForExecuted(addTxId);

  // Phase 2: Verify new key works
  const testPayload = crypto.randomBytes(32).toString('hex');
  const signature = await signWithNewKey(newKeyInfo, testPayload);
  const verified = await verifySignature(newKeyInfo.flowKey.publicKey, testPayload, signature);

  if (!verified) {
    throw new Error('New key verification failed. Old key is still active. No assets at risk.');
  }

  // Phase 3: Revoke old keys (new key is proven)
  const revokeTxId = await this.workflow.revokeKeysOnChain(bloctoKeyIndexes);
  await waitForExecuted(revokeTxId);
}
```

## Failure Safety Comparison

| Failure Point                  | Current (Atomic)        | Expand & Collapse              |
| ------------------------------ | ----------------------- | ------------------------------ |
| Crash after add, before revoke | N/A (atomic)            | ✅ Both keys work, retry later |
| New key is corrupted           | 🔴 **Locked out**       | ✅ Verification catches it     |
| Storage write fails silently   | 🔴 **Locked out**       | ✅ Verification catches it     |
| Network dies mid-rotation      | 🔴 **Possible lockout** | ✅ Old key still active        |

## Status

This document is an architectural proposal. The Expand & Collapse pattern is the
recommended long-term architecture for key rotation safety.
