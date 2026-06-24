import { describe, expect, it, vi, beforeEach } from 'vitest';

import { KeyRotationService } from '../src/KeyRotationService';

// ── Mock factories ──────────────────────────────────────────────────────────

const MOCK_ADDRESS = '0xabc123';
const MOCK_PUBLIC_KEY =
  'abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890';
const MOCK_SEEDPHRASE =
  'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about';
const MOCK_TX_ID = '0xtx123';
const MOCK_REVOKE_TX_ID = '0xtx456';

function createMockNewKeyInfo(): {
  seedphrase: string;
  flowKey: {
    publicKey: string;
    signAlgo: number;
    hashAlgo: number;
    signAlgoString: string;
    hashAlgoString: string;
    weight: number;
  };
} {
  return {
    seedphrase: MOCK_SEEDPHRASE,
    flowKey: {
      publicKey: MOCK_PUBLIC_KEY,
      signAlgo: 2,
      hashAlgo: 1,
      signAlgoString: 'ECDSA_secp256k1',
      hashAlgoString: 'SHA2_256',
      weight: 1000,
    },
  };
}

function createMockBridge(overrides: Record<string, any> = {}): any {
  return {
    getSelectedAddress: vi.fn().mockReturnValue(MOCK_ADDRESS),
    getDebugAddress: vi.fn().mockReturnValue(null),
    getNetwork: vi.fn().mockReturnValue('mainnet'),
    getJWT: vi.fn().mockResolvedValue('mock-jwt'),
    getVersion: vi.fn().mockReturnValue('1.0.0'),
    getBuildNumber: vi.fn().mockReturnValue('1'),
    getLanguage: vi.fn().mockReturnValue('en'),
    getMixpanelToken: vi.fn().mockReturnValue(''),
    getSignType: vi.fn().mockReturnValue(''),
    getCurrency: vi.fn().mockReturnValue('USD'),
    getPlatform: vi.fn().mockReturnValue('android'),
    getDeviceInfo: vi.fn().mockReturnValue({}),
    getApiEndpoint: vi.fn().mockReturnValue(''),
    getGoApiEndpoint: vi.fn().mockReturnValue(''),
    getInstabugToken: vi.fn().mockReturnValue(''),
    storage: vi.fn().mockReturnValue({ get: vi.fn(), set: vi.fn() }),
    cache: vi.fn().mockReturnValue({
      get: vi.fn().mockResolvedValue(undefined),
      set: vi.fn().mockResolvedValue(undefined),
    }),
    navigation: vi.fn().mockReturnValue({}),
    sign: vi.fn().mockResolvedValue(''),
    getSignKeyIndex: vi.fn().mockReturnValue(0),
    ethSign: vi.fn().mockResolvedValue(new Uint8Array()),
    getRecentContacts: vi.fn().mockResolvedValue({ contacts: [] }),
    getWalletAccounts: vi.fn().mockResolvedValue({ accounts: [] }),
    getWalletProfiles: vi.fn().mockResolvedValue({ profiles: [] }),
    getSelectedAccount: vi.fn().mockResolvedValue({}),
    configureCadenceService: vi.fn(),
    log: vi.fn(),
    isDebug: vi.fn().mockReturnValue(false),
    scanQRCode: vi.fn().mockResolvedValue(''),
    closeRN: vi.fn(),
    checkKeyRotationNeeded: vi.fn().mockResolvedValue({
      isBloctoKey: false,
      needRevoke: false,
      fullAccountKeys: [],
      bloctoKeyIndexes: [],
    }),

    // Key rotation methods
    createSeedKey: vi.fn().mockResolvedValue(createMockNewKeyInfo()),
    saveNewKey: vi.fn().mockResolvedValue(undefined),
    removeOldKey: vi.fn().mockResolvedValue(undefined),
    signRotationRequest: vi.fn().mockResolvedValue({
      public_key: MOCK_PUBLIC_KEY,
      signature: 'mock-sig-hex',
      hash_algo: 1,
      sign_algo: 2,
      sign_message: 'test',
      weight: 1000,
    }),
    savePendingRotation: vi.fn().mockResolvedValue(undefined),
    getPendingRotation: vi.fn().mockResolvedValue(null),
    clearPendingRotation: vi.fn().mockResolvedValue(undefined),
    ...overrides,
  } as any;
}

function createMockCache(): any {
  const store = new Map<string, any>();
  return {
    get: vi.fn(async (key: string) => store.get(key)),
    set: vi.fn(async (key: string, value: any) => {
      store.set(key, value);
    }),
  } as any;
}

// ── Mock workflow ───────────────────────────────────────────────────────────

vi.mock('@onflow/frw-workflow', () => ({
  KeyRotation: vi.fn().mockImplementation(() => ({
    detectBloctoKey: vi.fn().mockResolvedValue({
      isBloctoKey: true,
      needRevoke: true,
      fullAccountKeys: [
        { index: 0, publicKey: 'old-key-1', weight: 999, revoked: false },
        { index: 1, publicKey: 'old-key-2', weight: 1, revoked: false },
      ],
      bloctoKeyIndexes: [0, 1],
    }),
    rotateKeysOnChain: vi.fn().mockResolvedValue(MOCK_TX_ID),
    addKeysOnChain: vi.fn().mockResolvedValue(MOCK_TX_ID),
    revokeKeysOnChain: vi.fn().mockResolvedValue(MOCK_REVOKE_TX_ID),
  })),
}));

vi.mock('@onflow/frw-api', () => ({
  Userv3GoService: {
    signed: vi.fn().mockResolvedValue({ success: true }),
  },
}));

vi.mock('@onflow/frw-utils', () => ({
  logger: {
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
  normalizePublicKey: vi.fn((key: string) => key.toLowerCase().replace(/^0x/, '')),
  resolveSignAlgo: vi.fn(() => 2),
  resolveHashAlgo: vi.fn(() => 1),
}));

vi.mock('@onflow/frw-context', () => ({
  getServiceContext: vi.fn().mockReturnValue({ cache: undefined }),
}));

// ── Tests ───────────────────────────────────────────────────────────────────

describe('KeyRotationService — 3-phase Expand → Verify → Collapse', () => {
  let bridge: ReturnType<typeof createMockBridge>;
  let cache: ReturnType<typeof createMockCache>;

  beforeEach(() => {
    vi.clearAllMocks();
    // Reset the singleton
    (KeyRotationService as any).instance = undefined;
    bridge = createMockBridge();
    cache = createMockCache();
  });

  it('happy path: Expand → Verify → Collapse completes successfully', async () => {
    const service = KeyRotationService.createWithDependencies(bridge, undefined, cache);
    const newKeyInfo = createMockNewKeyInfo();

    const result = await service.rotateKey(MOCK_ADDRESS, newKeyInfo);

    expect(result.verificationPassed).toBe(true);
    expect(result.txId).toBe(MOCK_REVOKE_TX_ID);
    expect(result.revokedKeyIndexes).toEqual([0, 1]);

    // Phase 1: addKeysOnChain should have been called (not rotateKeysOnChain)
    // Verify saveNewKey was called before on-chain tx
    expect(bridge.saveNewKey).toHaveBeenCalledWith(newKeyInfo);
    // Verify signRotationRequest was called for verification
    expect(bridge.signRotationRequest).toHaveBeenCalled();
    // Local key persistence happens before API submit signature.
    expect(bridge.saveNewKey.mock.invocationCallOrder[0]).toBeLessThan(
      bridge.signRotationRequest.mock.invocationCallOrder[0]
    );
    // Verify removeOldKey was called for cleanup
    expect(bridge.removeOldKey).toHaveBeenCalled();
    // Verify WAL was cleared
    expect(bridge.clearPendingRotation).toHaveBeenCalledWith(MOCK_ADDRESS);
  });

  it('Phase 2 failure: verification fails → old keys remain active', async () => {
    // Make signRotationRequest return wrong public key
    bridge.signRotationRequest.mockResolvedValue({
      public_key: 'wrong_public_key_that_does_not_match',
      signature: 'mock-sig',
      hash_algo: 1,
      sign_algo: 2,
      sign_message: 'test',
      weight: 1000,
    });

    const service = KeyRotationService.createWithDependencies(bridge, undefined, cache);
    const newKeyInfo = createMockNewKeyInfo();

    await expect(service.rotateKey(MOCK_ADDRESS, newKeyInfo)).rejects.toThrow(
      /Key verification failed/
    );

    // removeOldKey should NOT have been called — old keys are safe
    expect(bridge.removeOldKey).not.toHaveBeenCalled();
  });

  it('Phase 2 failure: no signature → old keys remain active', async () => {
    bridge.signRotationRequest.mockResolvedValue({
      public_key: MOCK_PUBLIC_KEY,
      signature: '', // empty signature
      hash_algo: 1,
      sign_algo: 2,
      sign_message: 'test',
      weight: 1000,
    });

    const service = KeyRotationService.createWithDependencies(bridge, undefined, cache);
    const newKeyInfo = createMockNewKeyInfo();

    await expect(service.rotateKey(MOCK_ADDRESS, newKeyInfo)).rejects.toThrow(
      /Key verification failed/
    );

    expect(bridge.removeOldKey).not.toHaveBeenCalled();
  });

  it('Phase 1 failure: addKeysOnChain rejects → no key revocation', async () => {
    // Make addKeysOnChain fail
    const { KeyRotation } = await import('@onflow/frw-workflow');
    vi.mocked(KeyRotation).mockImplementationOnce(
      () =>
        ({
          detectBloctoKey: vi.fn().mockResolvedValue({
            isBloctoKey: true,
            needRevoke: true,
            fullAccountKeys: [{ index: 0, publicKey: 'old-key', weight: 999, revoked: false }],
            bloctoKeyIndexes: [0],
          }),
          rotateKeysOnChain: vi.fn(),
          addKeysOnChain: vi.fn().mockRejectedValue(new Error('Network timeout')),
          revokeKeysOnChain: vi.fn(),
        }) as any
    );

    const service = KeyRotationService.createWithDependencies(bridge, undefined, cache);
    const newKeyInfo = createMockNewKeyInfo();

    await expect(service.rotateKey(MOCK_ADDRESS, newKeyInfo)).rejects.toThrow('Network timeout');

    // No key revocation should have happened
    expect(bridge.removeOldKey).not.toHaveBeenCalled();
  });

  it('Phase 3 failure: revokeKeysOnChain rejects → both keys active (safe)', async () => {
    const { KeyRotation } = await import('@onflow/frw-workflow');
    vi.mocked(KeyRotation).mockImplementationOnce(
      () =>
        ({
          detectBloctoKey: vi.fn().mockResolvedValue({
            isBloctoKey: true,
            needRevoke: true,
            fullAccountKeys: [{ index: 0, publicKey: 'old-key', weight: 999, revoked: false }],
            bloctoKeyIndexes: [0],
          }),
          rotateKeysOnChain: vi.fn(),
          addKeysOnChain: vi.fn().mockResolvedValue(MOCK_TX_ID),
          revokeKeysOnChain: vi.fn().mockRejectedValue(new Error('Revoke tx failed')),
        }) as any
    );

    const service = KeyRotationService.createWithDependencies(bridge, undefined, cache);
    const newKeyInfo = createMockNewKeyInfo();

    await expect(service.rotateKey(MOCK_ADDRESS, newKeyInfo)).rejects.toThrow('Revoke tx failed');

    // removeOldKey should NOT have been called — revoke tx didn't succeed
    expect(bridge.removeOldKey).not.toHaveBeenCalled();
  });

  it('WAL phases progress correctly through all 3 phases', async () => {
    const service = KeyRotationService.createWithDependencies(bridge, undefined, cache);
    const newKeyInfo = createMockNewKeyInfo();

    await service.rotateKey(MOCK_ADDRESS, newKeyInfo);

    // Extract all WAL phase writes
    const walCalls = bridge.savePendingRotation.mock.calls.map((call: any[]) => call[0].phase);

    expect(walCalls).toEqual([
      'pre-tx',
      'api-registered',
      'key-added',
      'key-verified',
      'tx-confirmed',
    ]);
  });

  it('post-revoke local cleanup failure does not fail completed rotation', async () => {
    bridge.removeOldKey.mockRejectedValue(new Error('Local cleanup failed'));

    const service = KeyRotationService.createWithDependencies(bridge, undefined, cache);
    const newKeyInfo = createMockNewKeyInfo();

    const result = await service.rotateKey(MOCK_ADDRESS, newKeyInfo);

    expect(result.verificationPassed).toBe(true);
    expect(result.txId).toBe(MOCK_REVOKE_TX_ID);
  });

  it('reconciliation keeps pending state when new key exists but revoke is still required', async () => {
    const pendingState = {
      address: MOCK_ADDRESS,
      publicKey: MOCK_PUBLIC_KEY,
      timestamp: Date.now() - 10_000,
      phase: 'key-added',
    };
    bridge.getPendingRotation.mockResolvedValue(pendingState);

    const { KeyRotation } = await import('@onflow/frw-workflow');
    vi.mocked(KeyRotation).mockImplementationOnce(
      () =>
        ({
          detectBloctoKey: vi.fn().mockResolvedValue({
            isBloctoKey: true,
            needRevoke: true,
            fullAccountKeys: [
              { index: 0, publicKey: 'old-key-1', weight: 999, revoked: false },
              { index: 5, publicKey: MOCK_PUBLIC_KEY, weight: 1000, revoked: false },
            ],
            bloctoKeyIndexes: [0],
          }),
          rotateKeysOnChain: vi.fn(),
          addKeysOnChain: vi.fn(),
          revokeKeysOnChain: vi.fn(),
        }) as any
    );

    const service = KeyRotationService.createWithDependencies(bridge, undefined, cache);
    const status = await service.reconcilePendingRotation(MOCK_ADDRESS);

    expect(status).toBe('pending');
    expect(bridge.clearPendingRotation).not.toHaveBeenCalled();
  });
});
