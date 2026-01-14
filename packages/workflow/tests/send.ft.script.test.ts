import { parseUnits } from '@ethersproject/units';
import { configureFCL, CadenceService } from '@onflow/frw-cadence';
import { isValidSendTransactionPayload } from '@onflow/frw-workflow';
import * as t from '@onflow/types';
import dotenv from 'dotenv';
import { describe, it, expect, beforeEach } from 'vitest';

import { SendTransaction } from '../src';
import { makeArgument, getIX } from './utils';
import { accounts } from './utils/accounts';
import { authz } from './utils/authz';
import { convertToUFix64 } from '../src/send/utils';

dotenv.config();

const mainAccount = accounts.main;
const child1Account = accounts.child1;
const child2Account = accounts.child2;

const cadenceService = new CadenceService();
let configCache: any;

describe('Test send strategies', () => {
  beforeEach(() => {
    configureFCL('mainnet');
    cadenceService.useRequestInterceptor(async (config: any) => {
      configCache = config;
      if (config.type === 'transaction') {
        config.payer = authz;
        config.proposer = authz;
        config.authorizations = [authz];
      }
      return config;
    });
  });

  it('Test query coa', async () => {
    const coaAddr = await cadenceService.getAddr(mainAccount.address);
    expect(`0x${coaAddr}`).toBe(mainAccount.evmAddr);
  });

  it('Test send FLow from main account to main account', async () => {
    const payload = {
      type: 'token', // Asset type: token or NFT
      assetType: 'flow', // Network type: Flow blockchain or EVM chain
      proposer: mainAccount.address, // Flow address of the transaction proposer/signer
      receiver: mainAccount.address, // Recipient address (Flow or EVM format)
      flowIdentifier: 'A.1654653399040a61.FlowToken.Vault', // Flow resource identifier (e.g., vault
      sender: mainAccount.address,
      amount: '0.001',
      childAddrs: [],
      ids: [],
      decimal: 8,
      coaAddr: mainAccount.evmAddr,
      tokenContractAddr: '',
    };

    await SendTransaction(payload, cadenceService);
    expect(configCache.name).toBe('transferTokensV3');
  });

  it('Test send USDC from main account to main account', async () => {
    const payload = {
      type: 'token', // Asset type: token or NFT
      assetType: 'flow', // Network type: Flow blockchain or EVM chain
      proposer: mainAccount.address, // Flow address of the transaction proposer/signer
      receiver: mainAccount.address, // Recipient address (Flow or EVM format)
      flowIdentifier: 'A.f1ab99c82dee3526.USDCFlow.Vault', // Flow resource identifier (e.g., vault
      sender: mainAccount.address,
      amount: '0.001',
      childAddrs: [],
      ids: [],
      decimal: 8,
      coaAddr: mainAccount.evmAddr,
      tokenContractAddr: '',
    };

    await SendTransaction(payload, cadenceService);

    expect(configCache.name).toBe('transferTokensV3');
  });

  it('Test FlowToEvmTokenStrategy - Bridge USDC token to EVM address', async () => {
    const payload = {
      type: 'token',
      assetType: 'flow',
      proposer: mainAccount.address,
      receiver: mainAccount.evmAddr,
      flowIdentifier: 'A.f1ab99c82dee3526.USDCFlow.Vault',
      sender: mainAccount.address,
      amount: '0.001',
      childAddrs: [],
      ids: [],
      decimal: 8,
      coaAddr: mainAccount.evmAddr,
      tokenContractAddr: '',
    };

    await SendTransaction(payload, cadenceService);
    expect(configCache.name).toBe('bridgeTokensToEvmAddressV2');
  });

  it('Test FlowTokenBridgeToEvmStrategy - FLOW tokens to CoA address', async () => {
    const payload = {
      type: 'token',
      assetType: 'flow',
      proposer: mainAccount.address,
      receiver: mainAccount.evmAddr,
      flowIdentifier: 'A.1654653399040a61.FlowToken.Vault',
      sender: mainAccount.address,
      amount: '0.001',
      childAddrs: [],
      ids: [],
      decimal: 8,
      coaAddr: mainAccount.evmAddr,
      tokenContractAddr: '',
    };

    await SendTransaction(payload, cadenceService);
    expect(configCache.name).toBe('transferFlowToEvmAddress');
  });

  it('Test FlowTokenBridgeToEvmStrategy - FLOW tokens to EVM address', async () => {
    const payload = {
      type: 'token',
      assetType: 'flow',
      proposer: mainAccount.address,
      receiver: '0x3b44f144B97A0402C0e206522c28052C1025A8AA',
      flowIdentifier: 'A.1654653399040a61.FlowToken.Vault',
      sender: mainAccount.address,
      amount: '0.001',
      childAddrs: [],
      ids: [],
      decimal: 8,
      coaAddr: mainAccount.evmAddr,
      tokenContractAddr: '',
    };

    await SendTransaction(payload, cadenceService);
    expect(configCache.name).toBe('transferFlowToEvmAddress');
  });

  it('Test EvmToFlowCoaWithdrawalStrategy - COA withdrawal to Flow address', async () => {
    const payload = {
      type: 'token',
      assetType: 'evm',
      proposer: mainAccount.address,
      receiver: mainAccount.address,
      flowIdentifier: 'A.1654653399040a61.FlowToken.Vault',
      sender: mainAccount.evmAddr,
      amount: '0.001',
      childAddrs: [],
      ids: [],
      decimal: 8,
      coaAddr: mainAccount.evmAddr,
      tokenContractAddr: '',
    };

    await SendTransaction(payload, cadenceService);
    expect(configCache.name).toBe('withdrawCoa');
  });

  it('Test EvmToFlowTokenBridgeStrategy - Bridge USDC from EVM to Flow', async () => {
    const payload = {
      type: 'token',
      assetType: 'evm',
      proposer: mainAccount.address,
      receiver: mainAccount.address,
      flowIdentifier: 'A.f1ab99c82dee3526.USDCFlow.Vault',
      sender: mainAccount.evmAddr,
      amount: '0.001',
      childAddrs: [],
      ids: [],
      decimal: 8,
      coaAddr: mainAccount.evmAddr,
      tokenContractAddr: '0x1234567890123456789012345678901234567890',
    };

    await SendTransaction(payload, cadenceService);
    expect(configCache.name).toBe('bridgeTokensFromEvmToFlowV3');
  });

  it('Test EvmToEvmTokenStrategy - EVM to EVM token transfer', async () => {
    const payload = {
      type: 'token',
      assetType: 'evm',
      proposer: mainAccount.address,
      receiver: '0x3b44f144b97a0402c0e206522c28052c1025a8aa',
      flowIdentifier: 'A.1654653399040a61.FlowToken.Vault',
      sender: mainAccount.evmAddr,
      amount: '0.00001',
      childAddrs: [],
      ids: [],
      decimal: 6,
      coaAddr: mainAccount.evmAddr,
      tokenContractAddr: '0x7f27352D5F83Db87a5A3E00f4B07Cc2138D8ee52',
    };

    await SendTransaction(payload, cadenceService);
    expect(configCache.name).toBe('callContract');
  });

  it('Should throw when EVM token contract address is missing', async () => {
    const payload = {
      type: 'token',
      assetType: 'evm',
      proposer: mainAccount.address,
      receiver: '0x3b44f144b97a0402c0e206522c28052c1025a8aa',
      flowIdentifier: '',
      sender: mainAccount.evmAddr,
      amount: '0.00001',
      childAddrs: [],
      ids: [],
      decimal: 6,
      coaAddr: mainAccount.evmAddr,
      tokenContractAddr: '',
    };

    await expect(SendTransaction(payload, cadenceService)).rejects.toThrow(
      'invalid send evm transaction payload - invalid contract address'
    );
  });

  it('Test ChildToChildTokenStrategy - Child to child token transfer', async () => {
    const payload = {
      type: 'token',
      assetType: 'flow',
      proposer: mainAccount.address,
      receiver: child2Account.address,
      flowIdentifier: 'A.f1ab99c82dee3526.USDCFlow.Vault',
      sender: child1Account.address,
      amount: '0.001',
      childAddrs: [child1Account.address, child2Account.address],
      ids: [],
      decimal: 8,
      coaAddr: mainAccount.evmAddr,
      tokenContractAddr: '',
    };

    await SendTransaction(payload, cadenceService);
    expect(configCache.name).toBe('sendChildFtToChild');
  });

  it('Test ChildToOthersTokenStrategy - Child to parent transfer', async () => {
    const payload = {
      type: 'token',
      assetType: 'flow',
      proposer: mainAccount.address,
      receiver: mainAccount.address,
      flowIdentifier: 'A.f1ab99c82dee3526.USDCFlow.Vault',
      sender: child1Account.address,
      amount: '0.001',
      childAddrs: [child1Account.address, child2Account.address],
      ids: [],
      decimal: 8,
      coaAddr: mainAccount.evmAddr,
      tokenContractAddr: '',
    };

    await SendTransaction(payload, cadenceService);
    expect(configCache.name).toBe('transferChildFt');
  });

  it('Test ChildToOthersTokenStrategy - Bridge child to COA', async () => {
    const payload = {
      type: 'token',
      assetType: 'flow',
      proposer: mainAccount.address,
      receiver: mainAccount.evmAddr,
      flowIdentifier: 'A.f1ab99c82dee3526.USDCFlow.Vault',
      sender: child1Account.address,
      amount: '0.001',
      childAddrs: [child1Account.address, child2Account.address],
      ids: [],
      decimal: 8,
      coaAddr: mainAccount.evmAddr,
      tokenContractAddr: '',
    };

    await SendTransaction(payload, cadenceService);
    expect(configCache.name).toBe('bridgeChildFtToEvm');
  });

  it('Test ChildToOthersTokenStrategy - Bridge child to EVM address', async () => {
    const payload = {
      type: 'token',
      assetType: 'flow',
      proposer: mainAccount.address,
      receiver: '0x3b44f144B97A0402C0e206522c28052C1025A8AA',
      flowIdentifier: 'A.f1ab99c82dee3526.USDCFlow.Vault',
      sender: child1Account.address,
      amount: '0.001',
      childAddrs: [child1Account.address, child2Account.address],
      ids: [],
      decimal: 6,
      coaAddr: mainAccount.evmAddr,
      tokenContractAddr: '',
    };

    await SendTransaction(payload, cadenceService);
    expect(configCache.name).toBe('bridgeChildFtToEvmAddress');
  });

  it('Test ChildToOthersTokenStrategy - Child to Flow address', async () => {
    const payload = {
      type: 'token',
      assetType: 'flow',
      proposer: mainAccount.address,
      receiver: '0x32a6af84f2f54476',
      flowIdentifier: 'A.f1ab99c82dee3526.USDCFlow.Vault',
      sender: child1Account.address,
      amount: '0.001',
      childAddrs: [child1Account.address, child2Account.address],
      ids: [],
      decimal: 6,
      coaAddr: mainAccount.evmAddr,
      tokenContractAddr: '',
    };

    await SendTransaction(payload, cadenceService);
    expect(configCache.name).toBe('sendChildFt');
  });

  it('Test ParentToChildTokenStrategy - Bridge from EVM to child', async () => {
    const payload = {
      type: 'token',
      assetType: 'evm',
      proposer: mainAccount.address,
      receiver: child1Account.address,
      flowIdentifier: 'A.f1ab99c82dee3526.USDCFlow.Vault',
      sender: mainAccount.evmAddr,
      amount: '0.001',
      childAddrs: [child1Account.address, child2Account.address],
      ids: [],
      decimal: 6,
      coaAddr: mainAccount.evmAddr,
      tokenContractAddr: '0x7f27352d5f83db87a5a3e00f4b07cc2138d8ee52',
    };

    await SendTransaction(payload, cadenceService);
    expect(configCache.name).toBe('bridgeChildFtFromEvm');
  });

  it('Test ParentToChildTokenStrategy args', async () => {
    const payload = {
      type: 'token',
      assetType: 'evm',
      proposer: mainAccount.address,
      receiver: child1Account.address,
      flowIdentifier: 'A.f1ab99c82dee3526.USDCFlow.Vault',
      sender: mainAccount.evmAddr,
      amount: '0.001',
      childAddrs: [child1Account.address, child2Account.address],
      ids: [],
      decimal: 6,
      coaAddr: mainAccount.evmAddr,
      tokenContractAddr: '0x7f27352d5f83db87a5a3e00f4b07cc2138d8ee52',
    };

    await SendTransaction(payload, cadenceService);
    // check args funcs
    let idx = 0;
    const checkArgs = (arg) => {
      if (idx === 0) {
        expect(arg).toBe(payload.flowIdentifier);
      }
      if (idx === 1) {
        expect(arg).toBe(payload.receiver);
      }
      if (idx === 2) {
        // This should be
        expect(arg).toBe(parseUnits(payload.amount, payload.decimal).toString());
      }
      idx++;
    };
    // check args
    configCache.args(checkArgs, t);
  });

  describe('Validation failure tests', () => {
    it('Should throw error for invalid proposer address format', async () => {
      const payload = {
        type: 'token',
        assetType: 'flow',
        proposer: '0x123', // Invalid format - too short
        receiver: mainAccount.address,
        flowIdentifier: 'A.1654653399040a61.FlowToken.Vault',
        sender: mainAccount.address,
        amount: '0.001',
        childAddrs: [],
        ids: [],
        decimal: 8,
        coaAddr: mainAccount.evmAddr,
        tokenContractAddr: '',
      };

      expect(() => isValidSendTransactionPayload(payload)).toThrow('invalid proposer address');
    });

    it('Should throw error for missing proposer field', async () => {
      const payload = {
        type: 'token',
        assetType: 'flow',
        proposer: mainAccount.address,
        receiver: mainAccount.address,
        flowIdentifier: '',
        sender: mainAccount.address,
        amount: '0.001',
        childAddrs: [],
        ids: [],
        decimal: 8,
        coaAddr: mainAccount.evmAddr,
        tokenContractAddr: '',
      };

      expect(() => isValidSendTransactionPayload(payload)).toThrow(
        'flowIdentifier of transaction payload is missing'
      );
    });

    it('Should throw error for missing receiver field', async () => {
      const payload = {
        type: 'token',
        assetType: 'flow',
        proposer: mainAccount.address,
        receiver: '', // Empty receiver
        flowIdentifier: 'A.1654653399040a61.FlowToken.Vault',
        sender: mainAccount.address,
        amount: '0.001',
        childAddrs: [],
        ids: [],
        decimal: 8,
        coaAddr: mainAccount.evmAddr,
        tokenContractAddr: '',
      };

      expect(() => isValidSendTransactionPayload(payload)).toThrow(
        'invalid send transaction payload'
      );
    });

    it('Should throw error for invalid token amount (zero)', async () => {
      const payload = {
        type: 'token',
        assetType: 'flow',
        proposer: mainAccount.address,
        receiver: mainAccount.address,
        flowIdentifier: 'A.1654653399040a61.FlowToken.Vault',
        sender: mainAccount.address,
        amount: '0', // Invalid amount
        childAddrs: [],
        ids: [],
        decimal: 8,
        coaAddr: mainAccount.evmAddr,
        tokenContractAddr: '',
      };

      expect(() => isValidSendTransactionPayload(payload)).toThrow(
        'invalid send token transaction payload'
      );
    });

    it('Should throw error for invalid token amount (negative)', async () => {
      const payload = {
        type: 'token',
        assetType: 'flow',
        proposer: mainAccount.address,
        receiver: mainAccount.address,
        flowIdentifier: 'A.1654653399040a61.FlowToken.Vault',
        sender: mainAccount.address,
        amount: '-0.001', // Negative amount
        childAddrs: [],
        ids: [],
        decimal: 8,
        coaAddr: mainAccount.evmAddr,
        tokenContractAddr: '',
      };

      expect(() => isValidSendTransactionPayload(payload)).toThrow(
        'invalid send token transaction payload'
      );
    });

    it('Should throw error for missing decimal field in token transaction', async () => {
      const payload = {
        type: 'token',
        assetType: 'flow',
        proposer: mainAccount.address,
        receiver: mainAccount.address,
        flowIdentifier: 'A.1654653399040a61.FlowToken.Vault',
        sender: mainAccount.address,
        amount: '0.001',
        childAddrs: [],
        ids: [],
        decimal: null, // Missing decimal
        coaAddr: mainAccount.evmAddr,
        tokenContractAddr: '',
      };

      expect(() => isValidSendTransactionPayload(payload)).toThrow(
        'invalid send token transaction payload'
      );
    });

    it('Should throw error for empty NFT IDs in NFT transaction', async () => {
      const payload = {
        type: 'nft',
        assetType: 'flow',
        proposer: mainAccount.address,
        receiver: mainAccount.address,
        flowIdentifier: 'A.some_nft_contract.NFT.Collection',
        sender: mainAccount.address,
        amount: '1',
        childAddrs: [],
        ids: [], // Empty IDs array
        decimal: 0,
        coaAddr: mainAccount.evmAddr,
        tokenContractAddr: '',
      };

      expect(() => isValidSendTransactionPayload(payload)).toThrow('invalid send nft identifier');
    });
  });

  it('Test ChildToChildTokenStrategy args', async () => {
    const payload = {
      type: 'token',
      assetType: 'flow',
      proposer: mainAccount.address,
      receiver: child2Account.address,
      flowIdentifier: 'A.f1ab99c82dee3526.USDCFlow.Vault',
      sender: child1Account.address,
      amount: '0.001',
      childAddrs: [child1Account.address, child2Account.address],
      ids: [],
      decimal: 8,
      coaAddr: mainAccount.evmAddr,
      tokenContractAddr: '',
    };

    await SendTransaction(payload, cadenceService);

    const interaction = getIX();
    let id = 0;

    // check args
    configCache.args((arg, argType) => {
      const argResolver = {
        value: arg,
        xfrom: argType,
        resolve: (value, xform) => ({ value, xform }),
      };
      makeArgument(argResolver, id)(interaction);
      id++;
    }, t);

    for (const idx of interaction.message.arguments) {
      const { value } = interaction.arguments[idx];
      if (idx === 0) {
        expect(value).toBe(payload.flowIdentifier);
      }
      if (idx === 1) {
        expect(value).toBe(payload.sender);
      }
      if (idx === 2) {
        expect(value).toBe(payload.receiver);
      }
      if (idx === 3) {
        expect(value).toBe(convertToUFix64(payload.amount));
      }
    }
  });

  it('Test ChildToOthersTokenStrategy - Parent receiver args', async () => {
    const payload = {
      type: 'token',
      assetType: 'flow',
      proposer: mainAccount.address,
      receiver: mainAccount.address,
      flowIdentifier: 'A.f1ab99c82dee3526.USDCFlow.Vault',
      sender: child1Account.address,
      amount: '0.001',
      childAddrs: [child1Account.address, child2Account.address],
      ids: [],
      decimal: 8,
      coaAddr: mainAccount.evmAddr,
      tokenContractAddr: '',
    };

    await SendTransaction(payload, cadenceService);

    const interaction = getIX();
    let id = 0;

    // check args
    configCache.args((arg, argType) => {
      const argResolver = {
        value: arg,
        xfrom: argType,
        resolve: (value, xform) => ({ value, xform }),
      };
      makeArgument(argResolver, id)(interaction);
      id++;
    }, t);

    for (const idx of interaction.message.arguments) {
      const { value } = interaction.arguments[idx];
      if (idx === 0) {
        expect(value).toBe(payload.flowIdentifier);
      }
      if (idx === 1) {
        expect(value).toBe(payload.sender);
      }
      if (idx === 2) {
        expect(value).toBe(convertToUFix64(payload.amount));
      }
    }
  });

  it('Test ChildToOthersTokenStrategy - COA receiver args', async () => {
    const payload = {
      type: 'token',
      assetType: 'flow',
      proposer: mainAccount.address,
      receiver: mainAccount.evmAddr,
      flowIdentifier: 'A.f1ab99c82dee3526.USDCFlow.Vault',
      sender: child1Account.address,
      amount: '0.001',
      childAddrs: [child1Account.address, child2Account.address],
      ids: [],
      decimal: 8,
      coaAddr: mainAccount.evmAddr,
      tokenContractAddr: '',
    };

    await SendTransaction(payload, cadenceService);

    const interaction = getIX();
    let id = 0;

    // check args
    configCache.args((arg, argType) => {
      const argResolver = {
        value: arg,
        xfrom: argType,
        resolve: (value, xform) => ({ value, xform }),
      };
      makeArgument(argResolver, id)(interaction);
      id++;
    }, t);

    for (const idx of interaction.message.arguments) {
      const { value } = interaction.arguments[idx];
      if (idx === 0) {
        expect(value).toBe(payload.flowIdentifier);
      }
      if (idx === 1) {
        expect(value).toBe(payload.sender);
      }
      if (idx === 2) {
        expect(value).toBe(convertToUFix64(payload.amount));
      }
    }
  });

  it('Test ChildToOthersTokenStrategy - EVM address receiver args', async () => {
    const payload = {
      type: 'token',
      assetType: 'flow',
      proposer: mainAccount.address,
      receiver: '0x3b44f144B97A0402C0e206522c28052C1025A8AA',
      flowIdentifier: 'A.f1ab99c82dee3526.USDCFlow.Vault',
      sender: child1Account.address,
      amount: '0.001',
      childAddrs: [child1Account.address, child2Account.address],
      ids: [],
      decimal: 6,
      coaAddr: mainAccount.evmAddr,
      tokenContractAddr: '',
    };

    await SendTransaction(payload, cadenceService);

    const interaction = getIX();
    let id = 0;

    // check args
    configCache.args((arg, argType) => {
      const argResolver = {
        value: arg,
        xfrom: argType,
        resolve: (value, xform) => ({ value, xform }),
      };
      makeArgument(argResolver, id)(interaction);
      id++;
    }, t);

    for (const idx of interaction.message.arguments) {
      const { value } = interaction.arguments[idx];
      if (idx === 0) {
        expect(value).toBe(payload.flowIdentifier);
      }
      if (idx === 1) {
        expect(value).toBe(payload.sender);
      }
      if (idx === 2) {
        expect(value).toBe(convertToUFix64(payload.amount));
      }
      if (idx === 3) {
        expect(value).toBe(payload.receiver);
      }
    }
  });

  it('Test ChildToOthersTokenStrategy - Flow address receiver args', async () => {
    const payload = {
      type: 'token',
      assetType: 'flow',
      proposer: mainAccount.address,
      receiver: '0x32a6af84f2f54476',
      flowIdentifier: 'A.f1ab99c82dee3526.USDCFlow.Vault',
      sender: child1Account.address,
      amount: '0.001',
      childAddrs: [child1Account.address, child2Account.address],
      ids: [],
      decimal: 6,
      coaAddr: mainAccount.evmAddr,
      tokenContractAddr: '',
    };

    await SendTransaction(payload, cadenceService);

    const interaction = getIX();
    let id = 0;

    // check args
    configCache.args((arg, argType) => {
      const argResolver = {
        value: arg,
        xfrom: argType,
        resolve: (value, xform) => ({ value, xform }),
      };
      makeArgument(argResolver, id)(interaction);
      id++;
    }, t);

    for (const idx of interaction.message.arguments) {
      const { value } = interaction.arguments[idx];
      if (idx === 0) {
        expect(value).toBe(payload.flowIdentifier);
      }
      if (idx === 1) {
        expect(value).toBe(payload.sender);
      }
      if (idx === 2) {
        expect(value).toBe(payload.receiver);
      }
      if (idx === 3) {
        expect(value).toBe(convertToUFix64(payload.amount));
      }
    }
  });

  it('Test ParentToChildTokenStrategy args', async () => {
    const payload = {
      type: 'token',
      assetType: 'evm',
      proposer: mainAccount.address,
      receiver: child1Account.address,
      flowIdentifier: 'A.f1ab99c82dee3526.USDCFlow.Vault',
      sender: mainAccount.evmAddr,
      amount: '0.001',
      childAddrs: [child1Account.address, child2Account.address],
      ids: [],
      decimal: 6,
      coaAddr: mainAccount.evmAddr,
      tokenContractAddr: '0x7f27352d5f83db87a5a3e00f4b07cc2138d8ee52',
    };

    await SendTransaction(payload, cadenceService);

    const interaction = getIX();
    let id = 0;

    // check args
    configCache.args((arg, argType) => {
      const argResolver = {
        value: arg,
        xfrom: argType,
        resolve: (value, xform) => ({ value, xform }),
      };
      makeArgument(argResolver, id)(interaction);
      id++;
    }, t);

    for (const idx of interaction.message.arguments) {
      const { value } = interaction.arguments[idx];
      if (idx === 0) {
        expect(value).toBe(payload.flowIdentifier);
      }
      if (idx === 1) {
        expect(value).toBe(payload.receiver);
      }
      if (idx === 2) {
        expect(value).toBe(parseUnits(payload.amount, payload.decimal).toString());
        expect(value).toMatch(/^\d+$/); // Should be a numeric string
      }
    }
  });

  it('Test FlowToFlowTokenStrategy args', async () => {
    const payload = {
      type: 'token',
      assetType: 'flow',
      proposer: mainAccount.address,
      receiver: mainAccount.address,
      flowIdentifier: 'A.1654653399040a61.FlowToken.Vault',
      sender: mainAccount.address,
      amount: '0.001',
      childAddrs: [],
      ids: [],
      decimal: 8,
      coaAddr: mainAccount.evmAddr,
      tokenContractAddr: '',
    };

    await SendTransaction(payload, cadenceService);

    const interaction = getIX();
    let id = 0;

    // check args
    configCache.args((arg, argType) => {
      const argResolver = {
        value: arg,
        xfrom: argType,
        resolve: (value, xform) => ({ value, xform }),
      };
      makeArgument(argResolver, id)(interaction);
      id++;
    }, t);

    for (const idx of interaction.message.arguments) {
      const { value } = interaction.arguments[idx];
      if (idx === 0) {
        expect(value).toBe(payload.flowIdentifier);
      }
      if (idx === 1) {
        expect(value).toBe(payload.receiver);
      }
      if (idx === 2) {
        expect(value).toBe(convertToUFix64(payload.amount));
      }
    }
  });

  it('Test FlowToEvmTokenStrategy args', async () => {
    const payload = {
      type: 'token',
      assetType: 'flow',
      proposer: mainAccount.address,
      receiver: mainAccount.evmAddr,
      flowIdentifier: 'A.1654653399040a61.FlowToken.Vault',
      sender: mainAccount.address,
      amount: '0.001',
      childAddrs: [],
      ids: [],
      decimal: 8,
      coaAddr: mainAccount.evmAddr,
      tokenContractAddr: '',
    };

    await SendTransaction(payload, cadenceService);

    const interaction = getIX();
    let id = 0;

    // check args
    configCache.args((arg, argType) => {
      const argResolver = {
        value: arg,
        xfrom: argType,
        resolve: (value, xform) => ({ value, xform }),
      };
      makeArgument(argResolver, id)(interaction);
      id++;
    }, t);

    for (const idx of interaction.message.arguments) {
      const { value } = interaction.arguments[idx];
      if (idx === 0) {
        expect(value).toBe(payload.receiver);
      }
      if (idx === 1) {
        expect(value).toBe(convertToUFix64(payload.amount));
      }
      if (idx === 2) {
        expect(value).toBe(16_777_216); // Gas limit
      }
    }
  });

  it('Test FlowTokenBridgeToEvmStrategy args', async () => {
    const payload = {
      type: 'token',
      assetType: 'flow',
      proposer: mainAccount.address,
      receiver: mainAccount.evmAddr,
      flowIdentifier: 'A.f1ab99c82dee3526.USDCFlow.Vault',
      sender: mainAccount.address,
      amount: '0.001',
      childAddrs: [],
      ids: [],
      decimal: 8,
      coaAddr: mainAccount.evmAddr,
      tokenContractAddr: '',
    };

    await SendTransaction(payload, cadenceService);

    const interaction = getIX();
    let id = 0;

    // check args
    configCache.args((arg, argType) => {
      const argResolver = {
        value: arg,
        xfrom: argType,
        resolve: (value, xform) => ({ value, xform }),
      };
      makeArgument(argResolver, id)(interaction);
      id++;
    }, t);

    for (const idx of interaction.message.arguments) {
      const { value } = interaction.arguments[idx];
      if (idx === 0) {
        expect(value).toBe(payload.flowIdentifier);
      }
      if (idx === 1) {
        expect(value).toBe(convertToUFix64(payload.amount));
      }
      if (idx === 2) {
        expect(value).toBe(payload.receiver);
      }
    }
  });

  it('Test EvmToFlowCoaWithdrawalStrategy args', async () => {
    const payload = {
      type: 'token',
      assetType: 'evm',
      proposer: mainAccount.address,
      receiver: mainAccount.address,
      flowIdentifier: 'A.1654653399040a61.FlowToken.Vault',
      sender: mainAccount.evmAddr,
      amount: '0.001',
      childAddrs: [],
      ids: [],
      decimal: 8,
      coaAddr: mainAccount.evmAddr,
      tokenContractAddr: '',
    };

    await SendTransaction(payload, cadenceService);

    const interaction = getIX();
    let id = 0;

    // check args
    configCache.args((arg, argType) => {
      const argResolver = {
        value: arg,
        xfrom: argType,
        resolve: (value, xform) => ({ value, xform }),
      };
      makeArgument(argResolver, id)(interaction);
      id++;
    }, t);

    for (const idx of interaction.message.arguments) {
      const { value } = interaction.arguments[idx];
      if (idx === 0) {
        expect(value).toBe(convertToUFix64(payload.amount));
      }
      if (idx === 1) {
        expect(value).toBe(payload.receiver);
      }
    }
  });

  it('Test EvmToFlowTokenBridgeStrategy args', async () => {
    const payload = {
      type: 'token',
      assetType: 'evm',
      proposer: mainAccount.address,
      receiver: mainAccount.address,
      flowIdentifier: 'A.f1ab99c82dee3526.USDCFlow.Vault',
      sender: mainAccount.evmAddr,
      amount: '0.001',
      childAddrs: [],
      ids: [],
      decimal: 8,
      coaAddr: mainAccount.evmAddr,
      tokenContractAddr: '0x1234567890123456789012345678901234567890',
    };

    await SendTransaction(payload, cadenceService);

    const interaction = getIX();
    let id = 0;

    // check args
    configCache.args((arg, argType) => {
      const argResolver = {
        value: arg,
        xfrom: argType,
        resolve: (value, xform) => ({ value, xform }),
      };
      makeArgument(argResolver, id)(interaction);
      id++;
    }, t);

    for (const idx of interaction.message.arguments) {
      const { value } = interaction.arguments[idx];
      if (idx === 0) {
        expect(value).toBe(payload.flowIdentifier);
      }
      if (idx === 1) {
        expect(value).toBe(parseUnits(payload.amount, payload.decimal).toString());
      }
      if (idx === 2) {
        expect(value).toBe(payload.receiver);
      }
    }
  });

  it('Test EvmToEvmTokenStrategy - Non-Flow token args', async () => {
    const payload = {
      type: 'token',
      assetType: 'evm',
      proposer: mainAccount.address,
      receiver: '0x3b44f144b97a0402c0e206522c28052c1025a8aa',
      flowIdentifier: 'A.f1ab99c82dee3526.USDCFlow.Vault',
      sender: mainAccount.evmAddr,
      amount: '0.00001',
      childAddrs: [],
      ids: [],
      decimal: 6,
      coaAddr: mainAccount.evmAddr,
      tokenContractAddr: '0x7f27352D5F83Db87a5A3E00f4B07Cc2138D8ee52',
    };

    await SendTransaction(payload, cadenceService);

    const interaction = getIX();
    let id = 0;

    // check args
    configCache.args((arg, argType) => {
      const argResolver = {
        value: arg,
        xfrom: argType,
        resolve: (value, xform) => ({ value, xform }),
      };
      makeArgument(argResolver, id)(interaction);
      id++;
    }, t);

    for (const idx of interaction.message.arguments) {
      const { value } = interaction.arguments[idx];
      if (idx === 0) {
        expect(value).toBe(payload.tokenContractAddr);
      }
      if (idx === 1) {
        expect(value).toBe('0.0');
      }
      if (idx === 2) {
        // This is the encoded data
        expect(typeof value).toBe('object');
      }
      if (idx === 3) {
        expect(value).toBe(16_777_216); // Gas limit
      }
    }
  });

  it('Test EvmToEvmTokenStrategy - Flow token args', async () => {
    const payload = {
      type: 'token',
      assetType: 'evm',
      proposer: mainAccount.address,
      receiver: '0x3b44f144b97a0402c0e206522c28052c1025a8aa',
      flowIdentifier: 'A.1654653399040a61.FlowToken.Vault',
      sender: mainAccount.evmAddr,
      amount: '0.00001',
      childAddrs: [],
      ids: [],
      decimal: 6,
      coaAddr: mainAccount.evmAddr,
      tokenContractAddr: '0x0000000000000000000000000000000000000000',
    };

    await SendTransaction(payload, cadenceService);

    const interaction = getIX();
    let id = 0;

    // check args
    configCache.args((arg, argType) => {
      const argResolver = {
        value: arg,
        xfrom: argType,
        resolve: (value, xform) => ({ value, xform }),
      };
      makeArgument(argResolver, id)(interaction);
      id++;
    }, t);

    for (const idx of interaction.message.arguments) {
      const { value } = interaction.arguments[idx];
      if (idx === 0) {
        expect(value).toBe(payload.receiver);
      }
      if (idx === 1) {
        expect(value).toBe(convertToUFix64(payload.amount));
      }
      if (idx === 2) {
        expect(value).toStrictEqual([]);
      }
      if (idx === 3) {
        expect(value).toBe(16_777_216); // Gas limit
      }
    }
  });
});
