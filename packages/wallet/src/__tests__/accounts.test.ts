/**
 * Test suite for Account classes
 */

import { describe, it, expect, beforeEach } from 'vitest';

import { AccountFactory } from '../accounts/account-factory';
import { EVMAccount } from '../accounts/evm-account';
import { FlowAccount } from '../accounts/flow-account';
import { createMockStorageSetup } from '../storage/mock-storage';
import { type FlowAccountData, type EVMAccountData } from '../types/account';
import { Chain } from '../types/chain';
import { AccountError } from '../types/errors';
import { SignatureAlgorithm, HashAlgorithm } from '../types/key';

describe('Account Classes', () => {
  let mockStorage: ReturnType<typeof createMockStorageSetup>;
  let factory: AccountFactory;

  beforeEach(() => {
    mockStorage = createMockStorageSetup();
    factory = new AccountFactory(mockStorage.secureStorage, mockStorage.cacheStorage);
  });

  describe('FlowAccount', () => {
    let flowAccountData: FlowAccountData;
    let flowAccount: FlowAccount;

    beforeEach(() => {
      flowAccountData = {
        address: '0x1234567890abcdef',
        chain: Chain.Flow,
        network: 'mainnet',
        keyIndex: 0,
        name: 'Test Flow Account',
        keyId: 0,
        signAlgo: 'ECDSA_P256',
        hashAlgo: 'SHA3_256',
        balance: '1000.0',
        keys: [
          {
            index: 0,
            publicKey: '0xabcdef...',
            signAlgo: SignatureAlgorithm.ECDSA_P256,
            hashAlgo: HashAlgorithm.SHA3_256,
            weight: 1000,
            revoked: false,
          },
        ],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      flowAccount = new FlowAccount(
        flowAccountData,
        'test_wallet_id',
        mockStorage.secureStorage,
        mockStorage.cacheStorage
      );
    });

    it('should create Flow account with correct properties', () => {
      expect(flowAccount.address).toBe('0x1234567890abcdef');
      expect(flowAccount.chain).toBe(Chain.Flow);
      expect(flowAccount.network).toBe('mainnet');
      expect(flowAccount.keyIndex).toBe(0);
      expect(flowAccount.keyId).toBe(0);
      expect(flowAccount.signAlgo).toBe('ECDSA_P256');
      expect(flowAccount.hashAlgo).toBe('SHA3_256');
      expect(flowAccount.balance).toBe('1000.0');
    });

    it('should generate correct derivation path', () => {
      const path = flowAccount.getDerivationPath();
      expect(path).toBe("m/44'/539'/0'/0/0");
    });

    it('should find signing key', () => {
      const signingKey = flowAccount.findSigningKey();
      expect(signingKey).not.toBeNull();
      expect(signingKey!.index).toBe(0);
      expect(signingKey!.weight).toBe(1000);
      expect(signingKey!.revoked).toBe(false);
    });

    it('should return null for signing key when all keys are revoked', () => {
      flowAccountData.keys = [
        {
          index: 0,
          publicKey: '0xabcdef...',
          signAlgo: SignatureAlgorithm.ECDSA_P256,
          hashAlgo: HashAlgorithm.SHA3_256,
          weight: 1000,
          revoked: true, // Revoked key
        },
      ];

      const accountWithRevokedKey = new FlowAccount(
        flowAccountData,
        'test_wallet_id',
        mockStorage.secureStorage,
        mockStorage.cacheStorage
      );

      const signingKey = accountWithRevokedKey.findSigningKey();
      expect(signingKey).toBeNull();
    });

    it('should indicate can sign for accounts with valid keys', () => {
      expect(flowAccount.canSign()).toBe(true);
    });

    it('should validate Flow address format', () => {
      const validAddress = '0x1234567890abcdef';
      const invalidAddress = '0xinvalid';

      expect(flowAccount['validateAddress'](validAddress)).toBe(true);
      expect(flowAccount['validateAddress'](invalidAddress)).toBe(false);
    });

    it('should provide Flow-specific summary', () => {
      const summary = flowAccount.getFlowSummary();

      expect(summary.chain).toBe(Chain.Flow);
      expect(summary.keyId).toBe(0);
      expect(summary.signAlgo).toBe('ECDSA_P256');
      expect(summary.hashAlgo).toBe('SHA3_256');
      expect(summary.balance).toBe('1000.0');
      expect(summary.keysCount).toBe(1);
    });

    it('should update account metadata', async () => {
      const newName = 'Updated Flow Account';
      const originalUpdatedAt = flowAccount.updatedAt;

      await flowAccount.updateMetadata({ name: newName });

      expect(flowAccount.name).toBe(newName);
      expect(flowAccount.updatedAt).toBeGreaterThan(originalUpdatedAt);
    });

    describe('Watch-only Flow Account', () => {
      let watchOnlyAccount: FlowAccount;

      beforeEach(() => {
        const watchOnlyData: FlowAccountData = {
          ...flowAccountData,
          keyIndex: undefined, // Watch-only
        };

        watchOnlyAccount = new FlowAccount(
          watchOnlyData,
          'test_wallet_id',
          mockStorage.secureStorage,
          mockStorage.cacheStorage
        );
      });

      it('should identify as watch-only', () => {
        expect(watchOnlyAccount.isWatchOnly()).toBe(true);
        expect(watchOnlyAccount.canSign()).toBe(false);
      });

      it('should throw error when trying to sign', async () => {
        await expect(watchOnlyAccount.sign('test message', 'password')).rejects.toThrow(
          AccountError
        );
      });

      it('should throw error when trying to get private key', async () => {
        await expect(watchOnlyAccount.getPrivateKey('password')).rejects.toThrow(AccountError);
      });
    });
  });

  describe('EVMAccount', () => {
    let evmAccountData: EVMAccountData;
    let evmAccount: EVMAccount;

    beforeEach(() => {
      evmAccountData = {
        address: '0x1234567890abcdef1234567890abcdef12345678',
        chain: Chain.EVM,
        network: 'ethereum',
        keyIndex: 0,
        name: 'Test EVM Account',
        balance: '1.5',
        nonce: 42,
        tokens: [
          {
            address: '0xa0b86a33e6776808f5af6b28e3bb4fe8a4e4e0aa',
            symbol: 'USDC',
            name: 'USD Coin',
            decimals: 6,
            balance: '100.0',
          },
        ],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      evmAccount = new EVMAccount(
        evmAccountData,
        'test_wallet_id',
        mockStorage.secureStorage,
        mockStorage.cacheStorage
      );
    });

    it('should create EVM account with correct properties', () => {
      expect(evmAccount.address).toBe('0x1234567890abcdef1234567890abcdef12345678');
      expect(evmAccount.chain).toBe(Chain.EVM);
      expect(evmAccount.network).toBe('ethereum');
      expect(evmAccount.balance).toBe('1.5');
      expect(evmAccount.nonce).toBe(42);
      expect(evmAccount.tokens.length).toBe(1);
    });

    it('should generate correct derivation path', () => {
      const path = evmAccount.getDerivationPath();
      expect(path).toBe("m/44'/60'/0'/0/0");
    });

    it('should indicate can sign for non-watch-only accounts', () => {
      expect(evmAccount.canSign()).toBe(true);
    });

    it('should validate EVM address format', () => {
      const validAddress = '0x1234567890abcdef1234567890abcdef12345678';
      const invalidAddress = '0xinvalid';

      expect(evmAccount['validateAddress'](validAddress)).toBe(true);
      expect(evmAccount['validateAddress'](invalidAddress)).toBe(false);
    });

    it('should provide EVM-specific summary', () => {
      const summary = evmAccount.getEVMSummary();

      expect(summary.chain).toBe(Chain.EVM);
      expect(summary.balance).toBe('1.5');
      expect(summary.nonce).toBe(42);
      expect(summary.tokensCount).toBe(1);
    });

    it('should get supported networks', () => {
      const networks = EVMAccount.getSupportedNetworks();
      expect(networks).toContain('ethereum');
      expect(networks).toContain('polygon');
      expect(networks).toContain('arbitrum');
    });

    it('should get network configuration', () => {
      const config = evmAccount.getNetworkConfig();
      expect(config).not.toBeNull();
      expect(config.chainId).toBe(1);
      expect(config.name).toBe('Ethereum Mainnet');
      expect(config.symbol).toBe('ETH');
    });

    describe('Watch-only EVM Account', () => {
      let watchOnlyAccount: EVMAccount;

      beforeEach(() => {
        const watchOnlyData: EVMAccountData = {
          ...evmAccountData,
          keyIndex: undefined, // Watch-only
        };

        watchOnlyAccount = new EVMAccount(
          watchOnlyData,
          'test_wallet_id',
          mockStorage.secureStorage,
          mockStorage.cacheStorage
        );
      });

      it('should identify as watch-only', () => {
        expect(watchOnlyAccount.isWatchOnly()).toBe(true);
        expect(watchOnlyAccount.canSign()).toBe(false);
      });

      it('should throw error when trying to sign', async () => {
        await expect(watchOnlyAccount.sign('test message', 'password')).rejects.toThrow(
          AccountError
        );
      });
    });
  });

  describe('AccountFactory', () => {
    it('should create Flow account', () => {
      const params = {
        address: '0x1234567890abcdef',
        chain: Chain.Flow,
        network: 'mainnet',
        keyIndex: 0,
        name: 'Test Flow Account',
      };

      const account = factory.createFlowAccount(params, 'test_wallet');

      expect(account).toBeInstanceOf(FlowAccount);
      expect(account.address).toBe(params.address);
      expect(account.chain).toBe(Chain.Flow);
    });

    it('should create EVM account', () => {
      const params = {
        address: '0x1234567890abcdef1234567890abcdef12345678',
        chain: Chain.EVM,
        network: 'ethereum',
        keyIndex: 0,
        name: 'Test EVM Account',
      };

      const account = factory.createEVMAccount(params, 'test_wallet');

      expect(account).toBeInstanceOf(EVMAccount);
      expect(account.address).toBe(params.address);
      expect(account.chain).toBe(Chain.EVM);
    });

    it('should create watch-only Flow account', () => {
      const account = factory.createWatchOnlyFlowAccount(
        '0x1234567890abcdef',
        'mainnet',
        'test_wallet',
        'Watch Only Flow'
      );

      expect(account.isWatchOnly()).toBe(true);
      expect(account.canSign()).toBe(false);
      expect(account.name).toBe('Watch Only Flow');
    });

    it('should create watch-only EVM account', () => {
      const account = factory.createWatchOnlyEVMAccount(
        '0x1234567890abcdef1234567890abcdef12345678',
        'ethereum',
        'test_wallet',
        'Watch Only EVM'
      );

      expect(account.isWatchOnly()).toBe(true);
      expect(account.canSign()).toBe(false);
      expect(account.name).toBe('Watch Only EVM');
    });

    it('should get supported chains', () => {
      const chains = AccountFactory.getSupportedChains();
      expect(chains).toContain(Chain.Flow);
      expect(chains).toContain(Chain.EVM);
    });

    it('should get supported networks for Flow', () => {
      const networks = AccountFactory.getSupportedNetworks(Chain.Flow);
      expect(networks).toContain('flow-mainnet');
      expect(networks).toContain('flow-testnet');
    });

    it('should get supported networks for EVM', () => {
      const networks = AccountFactory.getSupportedNetworks(Chain.EVM);
      expect(networks).toContain('ethereum');
      expect(networks).toContain('flow-evm');
      expect(networks).toContain('flow-evm-testnet');
    });

    it('should check network support', () => {
      expect(AccountFactory.isNetworkSupported(Chain.Flow, 'flow-mainnet')).toBe(true);
      expect(AccountFactory.isNetworkSupported(Chain.EVM, 'ethereum')).toBe(true);
      expect(AccountFactory.isNetworkSupported(Chain.EVM, 'flow-evm')).toBe(true);
      expect(AccountFactory.isNetworkSupported(Chain.EVM, 'flow-evm-testnet')).toBe(true);
      expect(AccountFactory.isNetworkSupported(Chain.Flow, 'unsupported')).toBe(false);
    });
  });

  describe('Account Comparison and Utilities', () => {
    it('should compare accounts for equality', () => {
      const accountData: FlowAccountData = {
        address: '0x1234567890abcdef',
        chain: Chain.Flow,
        network: 'mainnet',
        keyIndex: 0,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      const account1 = new FlowAccount(
        accountData,
        'wallet1',
        mockStorage.secureStorage,
        mockStorage.cacheStorage
      );

      const account2 = new FlowAccount(
        accountData,
        'wallet2', // Different wallet ID
        mockStorage.secureStorage,
        mockStorage.cacheStorage
      );

      const differentAccount = new FlowAccount(
        { ...accountData, address: '0xdifferentaddress' },
        'wallet1',
        mockStorage.secureStorage,
        mockStorage.cacheStorage
      );

      expect(account1.equals(account2)).toBe(true); // Same address, chain, network
      expect(account1.equals(differentAccount)).toBe(false); // Different address
    });

    it('should generate unique account IDs', () => {
      const flowAccount = factory.createFlowAccount(
        {
          address: '0x1234567890abcdef',
          chain: Chain.Flow,
          network: 'mainnet',
          keyIndex: 0,
        },
        'test_wallet'
      );

      const evmAccount = factory.createEVMAccount(
        {
          address: '0x1234567890abcdef1234567890abcdef12345678',
          chain: Chain.EVM,
          network: 'ethereum',
          keyIndex: 0,
        },
        'test_wallet'
      );

      expect(flowAccount.getId()).toBe('flow:mainnet:0x1234567890abcdef');
      expect(evmAccount.getId()).toBe('evm:ethereum:0x1234567890abcdef1234567890abcdef12345678');
    });
  });
});
