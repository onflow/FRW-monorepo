import { beforeAll, describe, expect, it } from 'vitest';

import { WalletCoreProvider } from '../crypto/wallet-core-provider';
import { EthSigner } from '../services/eth-signer';
import {
  buildLegacySigningOutput,
  computeEthTransactionHash,
  computeLegacyEthTransactionHash,
  encodeLegacyEthTransaction,
} from '../services/eth-transaction-hash';

describe('computeEthTransactionHash', () => {
  beforeAll(async () => {
    await WalletCoreProvider.getCore();
  });

  it('wraps wallet core TransactionUtil for legacy transactions', async () => {
    const encoded =
      '0xf8aa808509c7652400830130b9946b175474e89094c44da98b954eedeac495271d0f80b844a9059cbb0000000000000000000000005322b34c88ed0691971bf52a7047448f0f4efc840000000000000000000000000000000000000000000000001bc16d674ec8000025a0724c62ad4fbf47346b02de06e603e013f26f26b56fdc0be7ba3d6273401d98cea0032131cae15da7ddcda66963e8bef51ca0d9962bfef0547d3f02597a4a58c931';
    const hash = await computeEthTransactionHash(encoded);
    expect(hash).toBe('0x199a7829fc5149e49b452c2cab76d8fa5a9682fee6e4891b8acb697ac142513e');
  });

  it('matches wallet-core output for EIP-1559 signed transaction', async () => {
    const privateKey = await WalletCoreProvider.hexToBytes(
      '0x4646464646464646464646464646464646464646464646464646464646464646'
    );

    const params = {
      chainId: 0x01,
      nonce: '0x09',
      maxFeePerGas: '0x59682f00',
      maxPriorityFeePerGas: '0x59682f00',
      gasLimit: '0x5208',
      to: '0x3535353535353535353535353535353535353535',
      value: '0x0de0b6b3a7640000',
      data: '0x',
    } as const;

    const signed = await EthSigner.signTransaction(
      {
        ...params,
        accessList: [],
      },
      privateKey
    );

    const rawHash = await computeEthTransactionHash(signed.rawTransaction);
    expect(rawHash).toBe(signed.transactionHash);

    const rawBytes = await WalletCoreProvider.hexToBytes(signed.rawTransaction);
    const bytesHash = await computeEthTransactionHash(rawBytes);
    expect(bytesHash).toBe(signed.transactionHash);
  });

  it('reconstructs legacy RPC payloads using Wallet Core RLP encoder', async () => {
    const legacyTx = {
      nonce: 21786698,
      gasPrice: '1',
      gas: '23300',
      to: '0xF376A6849184571fEEdD246a1Ba2D331cfe56c8c',
      value: '92827600000000',
      input: '0x',
      v: '255',
      r: '0x30000000000000000',
      s: '0x3',
      type: 'legacy',
      typeHex: '0x0',
    } as const;

    const core = await WalletCoreProvider.getCore();
    const { SigningOutput } = TW.Ethereum.Proto;
    const signingOutput = SigningOutput.create({
      encoded: encodeLegacyTransaction(core, legacyTx),
      v: new Uint8Array(),
      r: new Uint8Array(),
      s: new Uint8Array(),
    });

    const transactionHash = core.HexCoding.encode(core.Hash.keccak256(raw));
    expect(transactionHash).toBe(
      '0xa2de5542ac69b5c2dbb5aba58d96ad95b3a58b118900471da26af3894fe428c3'
    );

    const raw = await encodeLegacyEthTransaction(legacyTx);
    expect(raw).toBe(
      '0xf384014c704a01825b0494f376a6849184571feedd246a1ba2d331cfe56c8c86546d1c1f94008081ff8903000000000000000003'
    );

    const { transactionHash } = await computeLegacyEthTransactionHash(legacyTx);
    expect(transactionHash).toBe(
      '0xa2de5542ac69b5c2dbb5aba58d96ad95b3a58b118900471da26af3894fe428c3'
    );

    const signingOutput = await buildLegacySigningOutput(legacyTx);
    expect(signingOutput.encoded).toBeInstanceOf(Uint8Array);
    await expect(computeEthTransactionHash(signingOutput.encoded)).resolves.toBe(transactionHash);
  });

  it('matches known legacy transaction hash when RLP is provided directly', async () => {
    const encoded =
      '0xf384014c704a01825b0494f376a6849184571feedd246a1ba2d331cfe56c8c86546d1c1f94008081ff8903000000000000000003';
    const hash = await computeEthTransactionHash(encoded);
    expect(hash).toBe('0xa2de5542ac69b5c2dbb5aba58d96ad95b3a58b118900471da26af3894fe428c3');
  });
});
