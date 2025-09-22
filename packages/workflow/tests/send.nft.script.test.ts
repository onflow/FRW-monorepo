import { CadenceService, configureFCL } from '@onflow/frw-cadence';
import { isValidSendTransactionPayload } from '@onflow/frw-workflow';
import * as t from '@onflow/types';
import dotenv from 'dotenv';
import { beforeEach, describe, expect, it } from 'vitest';

import { SendTransaction } from '../src';
import { makeArgument, getIX } from './utils';
import { accounts } from './utils/accounts';
import { authz } from './utils/authz';

dotenv.config();

const mainAccount = accounts.main;
const child1Account = accounts.child1;
const child2Account = accounts.child2;

const cadenceService = new CadenceService();
let configCache: any;

describe('Test NFT send strategies', () => {
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

  it('Test FlowToFlowNftStrategy - Flow NFT transfer to Flow address', async () => {
    const payload = {
      type: 'nft',
      assetType: 'flow',
      proposer: mainAccount.address,
      receiver: mainAccount.address,
      flowIdentifier: 'A.921ea449dffec68a.FlovatarComponent.NFT',
      sender: mainAccount.address,
      amount: '0.0',
      childAddrs: [],
      ids: [127190],
      decimal: 0,
      coaAddr: mainAccount.evmAddr,
      tokenContractAddr: '',
    };

    await SendTransaction(payload, cadenceService);
    expect(configCache.name).toBe('batchSendNftV3');
  });

  it('Test TopShotNftStrategy - TopShot NFT transfer', async () => {
    const payload = {
      type: 'nft',
      assetType: 'flow',
      proposer: mainAccount.address,
      receiver: mainAccount.address,
      flowIdentifier: 'A.0b2a3299cc857e29.TopShot.NFT',
      sender: mainAccount.address,
      amount: '0',
      childAddrs: [],
      ids: [17884712],
      decimal: 0,
      coaAddr: mainAccount.evmAddr,
      tokenContractAddr: '',
    };

    await SendTransaction(payload, cadenceService);
    expect(configCache.name).toBe('batchSendNbaNftV3');
  });

  it('Test FlowToEvmNftBridgeStrategy - Bridge NFT to EVM address', async () => {
    const payload = {
      type: 'nft',
      assetType: 'flow',
      proposer: mainAccount.address,
      receiver: '0x3b44f144B97A0402C0e206522c28052C1025A8AA',
      flowIdentifier: 'A.0b2a3299cc857e29.TopShot.NFT',
      sender: mainAccount.address,
      amount: '0',
      childAddrs: [],
      ids: [17884712],
      decimal: 0,
      coaAddr: mainAccount.evmAddr,
      tokenContractAddr: '',
    };

    await SendTransaction(payload, cadenceService);
    expect(configCache.name).toBe('batchBridgeNftToEvmAddressWithPayer');
  });

  it('Test EvmToFlowNftBridgeStrategy - Bridge NFT from EVM to Flow', async () => {
    const payload = {
      type: 'nft',
      assetType: 'evm',
      proposer: mainAccount.address,
      receiver: mainAccount.address,
      flowIdentifier: 'A.0b2a3299cc857e29.TopShot.NFT',
      sender: mainAccount.evmAddr,
      amount: '0',
      childAddrs: [],
      ids: [67890],
      decimal: 0,
      coaAddr: mainAccount.evmAddr,
      tokenContractAddr: '0x50ab3a827ad268e9d5a24d340108fad5c25dad5f',
    };

    await SendTransaction(payload, cadenceService);
    expect(configCache.name).toBe('batchBridgeNftFromEvmToFlowWithPayer');
  });

  it('Test EvmToEvmNftStrategy - EVM to EVM NFT transfer', async () => {
    const payload = {
      type: 'nft',
      assetType: 'evm',
      proposer: mainAccount.address,
      receiver: '0x3b44f144B97A0402C0e206522c28052C1025A8AA',
      flowIdentifier: 'A.0b2a3299cc857e29.TopShot.NFT',
      sender: mainAccount.evmAddr,
      amount: '',
      childAddrs: [],
      ids: [36786962],
      decimal: 0,
      coaAddr: mainAccount.evmAddr,
      tokenContractAddr: '0x50ab3a827ad268e9d5a24d340108fad5c25dad5f',
    };

    await SendTransaction(payload, cadenceService);
    expect(configCache.name).toBe('callContract');
  });

  it('Test ChildToChildNftStrategy - Child1 to child2 NFT transfer', async () => {
    const payload = {
      type: 'nft',
      assetType: 'flow',
      proposer: mainAccount.address,
      receiver: child2Account.address,
      flowIdentifier: 'A.2d4c3caffbeab845.FLOAT.NFT',
      sender: child1Account.address,
      amount: '0',
      childAddrs: [child1Account.address, child2Account.address],
      ids: [75866303338937],
      decimal: 0,
      coaAddr: mainAccount.evmAddr,
      tokenContractAddr: '',
    };

    await SendTransaction(payload, cadenceService);
    expect(configCache.name).toBe('batchSendChildNftToChild');
  });

  it('Test ChildToChildNftStrategy - Child2 to child1 NFT transfer', async () => {
    const payload = {
      type: 'nft',
      assetType: 'flow',
      proposer: mainAccount.address,
      receiver: child1Account.address,
      flowIdentifier: 'A.2d4c3caffbeab845.FLOAT.NFT',
      sender: child2Account.address,
      amount: '',
      childAddrs: [child1Account.address, child2Account.address],
      ids: [75866303338937],
      decimal: 0,
      coaAddr: mainAccount.evmAddr,
      tokenContractAddr: '',
    };

    await SendTransaction(payload, cadenceService);
    expect(configCache.name).toBe('batchSendChildNftToChild');
  });

  it('Test ChildToOthersNftStrategy - Child to parent NFT transfer', async () => {
    const payload = {
      type: 'nft',
      assetType: 'flow',
      proposer: mainAccount.address,
      receiver: mainAccount.address,
      flowIdentifier: 'A.2d4c3caffbeab845.FLOAT.NFT',
      sender: child2Account.address,
      amount: '',
      childAddrs: [child1Account.address, child2Account.address],
      ids: [217703303195673],
      decimal: 0,
      coaAddr: mainAccount.evmAddr,
      tokenContractAddr: '',
    };

    await SendTransaction(payload, cadenceService);
    expect(configCache.name).toBe('batchTransferChildNft');
  });

  it('Test ChildToOthersNftStrategy - Bridge child NFT to COA', async () => {
    const payload = {
      type: 'nft',
      assetType: 'flow',
      proposer: mainAccount.address,
      receiver: mainAccount.evmAddr,
      flowIdentifier: 'A.2d4c3caffbeab845.FLOAT.NFT',
      sender: child2Account.address,
      amount: '0',
      childAddrs: [child1Account.address, child2Account.address],
      ids: [239693535195987],
      decimal: 0,
      coaAddr: mainAccount.evmAddr,
      tokenContractAddr: '',
    };

    await SendTransaction(payload, cadenceService);
    expect(configCache.name).toBe('batchBridgeChildNftToEvmWithPayer');
  });

  it('Test ChildToOthersNftStrategy - Bridge child NFT to EVM address', async () => {
    const payload = {
      type: 'nft',
      assetType: 'flow',
      proposer: mainAccount.address,
      receiver: '0x3b44f144B97A0402C0e206522c28052C1025A8AA',
      flowIdentifier: 'A.2d4c3caffbeab845.FLOAT.NFT',
      sender: child2Account.address,
      amount: '0',
      childAddrs: [child1Account.address, child2Account.address],
      ids: [102254581997205],
      decimal: 0,
      coaAddr: mainAccount.evmAddr,
      tokenContractAddr: '',
    };

    await SendTransaction(payload, cadenceService);
    expect(configCache.name).toBe('batchBridgeChildNftToEvmAddressWithPayer');
  });

  it('Test ChildToOthersNftStrategy - Child NFT to Flow address', async () => {
    const payload = {
      type: 'nft',
      assetType: 'flow',
      proposer: mainAccount.address,
      receiver: child1Account.address,
      flowIdentifier: 'A.2d4c3caffbeab845.FLOAT.NFT',
      sender: child2Account.address,
      amount: '0',
      childAddrs: [child2Account.address],
      ids: [217703303195673],
      decimal: 0,
      coaAddr: mainAccount.evmAddr,
      tokenContractAddr: '',
    };
    await SendTransaction(payload, cadenceService);
    expect(configCache.name).toBe('batchSendChildNft');
  });

  it('Test ParentToChildNftStrategy - Bridge NFT from EVM to child', async () => {
    const payload = {
      type: 'nft',
      assetType: 'evm',
      proposer: mainAccount.address,
      receiver: child1Account.address,
      flowIdentifier: 'A.f1ab99c82dee3526.FlowtyDrops.NFT',
      sender: mainAccount.evmAddr,
      amount: '0',
      childAddrs: [child1Account.address, child2Account.address],
      ids: [11111, 22222],
      decimal: 0,
      coaAddr: mainAccount.evmAddr,
      tokenContractAddr: '0x1234567890123456789012345678901234567890',
    };

    await SendTransaction(payload, cadenceService);
    expect(configCache.name).toBe('batchBridgeChildNftFromEvmWithPayer');
  });

  describe('Validation failure tests', () => {
    it('Should throw error for invalid proposer address format', () => {
      const payload = {
        type: 'nft',
        assetType: 'flow',
        proposer: '0x123', // Invalid format - too short
        receiver: mainAccount.address,
        flowIdentifier: 'A.2d4c3caffbeab845.FLOAT.NFT',
        sender: mainAccount.address,
        amount: '1',
        childAddrs: [],
        ids: [12345],
        decimal: 0,
        coaAddr: mainAccount.evmAddr,
        tokenContractAddr: '',
      };

      expect(() => isValidSendTransactionPayload(payload)).toThrow('invalid proposer address');
    });

    it('Should throw error for missing receiver field', () => {
      const payload = {
        type: 'nft',
        assetType: 'flow',
        proposer: mainAccount.address,
        receiver: '', // Empty receiver
        flowIdentifier: 'A.2d4c3caffbeab845.FLOAT.NFT',
        sender: mainAccount.address,
        amount: '1',
        childAddrs: [],
        ids: [12345],
        decimal: 0,
        coaAddr: mainAccount.evmAddr,
        tokenContractAddr: '',
      };

      expect(() => isValidSendTransactionPayload(payload)).toThrow(
        'invalid send transaction payload'
      );
    });

    it('Should throw error for missing flowIdentifier field', () => {
      const payload = {
        type: 'nft',
        assetType: 'flow',
        proposer: mainAccount.address,
        receiver: mainAccount.address,
        flowIdentifier: '', // Empty flowIdentifier
        sender: mainAccount.address,
        amount: '1',
        childAddrs: [],
        ids: [12345],
        decimal: 0,
        coaAddr: mainAccount.evmAddr,
        tokenContractAddr: '',
      };

      expect(() => isValidSendTransactionPayload(payload)).toThrow(
        'flowIdentifier of transaction payload is missing'
      );
    });

    it('Should throw error for missing sender field', () => {
      const payload = {
        type: 'nft',
        assetType: 'flow',
        proposer: mainAccount.address,
        receiver: mainAccount.address,
        flowIdentifier: 'A.2d4c3caffbeab845.FLOAT.NFT',
        sender: '', // Empty sender
        amount: '1',
        childAddrs: [],
        ids: [12345],
        decimal: 0,
        coaAddr: mainAccount.evmAddr,
        tokenContractAddr: '',
      };

      expect(() => isValidSendTransactionPayload(payload)).toThrow(
        'invalid send transaction payload'
      );
    });

    it('Should throw error for empty NFT IDs in NFT transaction', () => {
      const payload = {
        type: 'nft',
        assetType: 'flow',
        proposer: mainAccount.address,
        receiver: mainAccount.address,
        flowIdentifier: 'A.2d4c3caffbeab845.FLOAT.NFT',
        sender: mainAccount.address,
        amount: '1',
        childAddrs: [],
        ids: [], // Empty IDs array
        decimal: 0,
        coaAddr: mainAccount.evmAddr,
        tokenContractAddr: '',
      };

      expect(() => isValidSendTransactionPayload(payload)).toThrow(
        'invalid send nft transaction payload'
      );
    });
  });

  it('Test ParentToChildNftStrategy args', async () => {
    const payload = {
      type: 'nft',
      assetType: 'evm',
      proposer: mainAccount.address,
      receiver: child1Account.address,
      flowIdentifier: 'A.f1ab99c82dee3526.FlowtyDrops.NFT',
      sender: mainAccount.evmAddr,
      amount: '0',
      childAddrs: [child1Account.address, child2Account.address],
      ids: [11111, 22222],
      decimal: 0,
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
        expect(value).toBe(payload.receiver);
      }
      if (idx === 2) {
        expect(value).toStrictEqual(payload.ids.map((id) => id.toString()));
      }
    }
  });

  it('Test ChildToChildNftStrategy args', async () => {
    const payload = {
      type: 'nft',
      assetType: 'flow',
      proposer: mainAccount.address,
      receiver: child2Account.address,
      flowIdentifier: 'A.2d4c3caffbeab845.FLOAT.NFT',
      sender: child1Account.address,
      amount: '0',
      childAddrs: [child1Account.address, child2Account.address],
      ids: [75866303338937],
      decimal: 0,
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
        expect(value).toStrictEqual(payload.ids);
      }
    }
  });

  it('Test ChildToOthersNftStrategy - Parent receiver args', async () => {
    const payload = {
      type: 'nft',
      assetType: 'flow',
      proposer: mainAccount.address,
      receiver: mainAccount.address,
      flowIdentifier: 'A.2d4c3caffbeab845.FLOAT.NFT',
      sender: child2Account.address,
      amount: '',
      childAddrs: [child1Account.address, child2Account.address],
      ids: [217703303195673],
      decimal: 0,
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
        expect(value).toStrictEqual(payload.ids);
      }
    }
  });

  it('Test ChildToOthersNftStrategy - COA receiver args', async () => {
    const payload = {
      type: 'nft',
      assetType: 'flow',
      proposer: mainAccount.address,
      receiver: mainAccount.evmAddr,
      flowIdentifier: 'A.2d4c3caffbeab845.FLOAT.NFT',
      sender: child2Account.address,
      amount: '0',
      childAddrs: [child1Account.address, child2Account.address],
      ids: [239693535195987],
      decimal: 0,
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
        expect(value).toStrictEqual(payload.ids);
      }
    }
  });

  it('Test ChildToOthersNftStrategy - EVM address receiver args', async () => {
    const payload = {
      type: 'nft',
      assetType: 'flow',
      proposer: mainAccount.address,
      receiver: '0x3b44f144B97A0402C0e206522c28052C1025A8AA',
      flowIdentifier: 'A.2d4c3caffbeab845.FLOAT.NFT',
      sender: child2Account.address,
      amount: '0',
      childAddrs: [child1Account.address, child2Account.address],
      ids: [102254581997205],
      decimal: 0,
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
        expect(value).toStrictEqual(payload.ids);
      }
      if (idx === 3) {
        expect(value).toBe(payload.receiver);
      }
    }
  });

  it('Test ChildToOthersNftStrategy - Flow address receiver args', async () => {
    const payload = {
      type: 'nft',
      assetType: 'flow',
      proposer: mainAccount.address,
      receiver: child1Account.address,
      flowIdentifier: 'A.2d4c3caffbeab845.FLOAT.NFT',
      sender: child2Account.address,
      amount: '0',
      childAddrs: [child2Account.address],
      ids: [217703303195673],
      decimal: 0,
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
        expect(value).toStrictEqual(payload.ids);
      }
    }
  });

  it('Test TopShotNftStrategy args', async () => {
    const payload = {
      type: 'nft',
      assetType: 'flow',
      proposer: mainAccount.address,
      receiver: mainAccount.address,
      flowIdentifier: 'A.0b2a3299cc857e29.TopShot.NFT',
      sender: mainAccount.address,
      amount: '0',
      childAddrs: [],
      ids: [17884712],
      decimal: 0,
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
        expect(value).toStrictEqual(payload.ids);
      }
    }
  });

  it('Test FlowToFlowNftStrategy args', async () => {
    const payload = {
      type: 'nft',
      assetType: 'flow',
      proposer: mainAccount.address,
      receiver: mainAccount.address,
      flowIdentifier: 'A.921ea449dffec68a.FlovatarComponent.NFT',
      sender: mainAccount.address,
      amount: '0.0',
      childAddrs: [],
      ids: [127190],
      decimal: 0,
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
        expect(value).toStrictEqual(payload.ids);
      }
    }
  });

  it('Test FlowToEvmNftBridgeStrategy args', async () => {
    const payload = {
      type: 'nft',
      assetType: 'flow',
      proposer: mainAccount.address,
      receiver: '0x3b44f144B97A0402C0e206522c28052C1025A8AA',
      flowIdentifier: 'A.0b2a3299cc857e29.TopShot.NFT',
      sender: mainAccount.address,
      amount: '0',
      childAddrs: [],
      ids: [17884712],
      decimal: 0,
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
        expect(value).toStrictEqual(payload.ids);
      }
      if (idx === 2) {
        expect(value).toBe(payload.receiver);
      }
    }
  });

  it('Test EvmToFlowNftBridgeStrategy args', async () => {
    const payload = {
      type: 'nft',
      assetType: 'evm',
      proposer: mainAccount.address,
      receiver: mainAccount.address,
      flowIdentifier: 'A.0b2a3299cc857e29.TopShot.NFT',
      sender: mainAccount.evmAddr,
      amount: '0',
      childAddrs: [],
      ids: [67890],
      decimal: 0,
      coaAddr: mainAccount.evmAddr,
      tokenContractAddr: '0x50ab3a827ad268e9d5a24d340108fad5c25dad5f',
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
        expect(value).toStrictEqual(payload.ids.map((id) => id.toString()));
      }
      if (idx === 2) {
        expect(value).toBe(payload.receiver);
      }
    }
  });

  it('Test EvmToEvmNftStrategy - Single NFT args', async () => {
    const payload = {
      type: 'nft',
      assetType: 'evm',
      proposer: mainAccount.address,
      receiver: '0x3b44f144B97A0402C0e206522c28052C1025A8AA',
      flowIdentifier: 'A.0b2a3299cc857e29.TopShot.NFT',
      sender: mainAccount.evmAddr,
      amount: '',
      childAddrs: [],
      ids: [36786962],
      decimal: 0,
      coaAddr: mainAccount.evmAddr,
      tokenContractAddr: '0x50ab3a827ad268e9d5a24d340108fad5c25dad5f',
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
        // This is the encoded data, we just check it's a string
        expect(typeof value).toBe('object');
      }
      if (idx === 3) {
        // This is the gas limit
        expect(typeof value).toBe('number');
      }
    }
  });
});
