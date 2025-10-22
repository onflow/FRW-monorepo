import { beforeAll, describe, expect, it } from 'vitest';

import { WalletCoreProvider } from '../crypto/wallet-core-provider';
import { PrivateKey } from '../keys/private-key';
import { EthSigner } from '../services/eth-signer';
import { MemoryStorage } from '../storage/memory-storage';
import { SignatureAlgorithm } from '../types/key';

describe('EthSigner', () => {
  let privateKeyLegacy: Uint8Array;
  let privateKeyMessage: Uint8Array;
  let privateKeyTypedData: Uint8Array;

  beforeAll(async () => {
    privateKeyLegacy = await WalletCoreProvider.hexToBytes(
      '0x4646464646464646464646464646464646464646464646464646464646464646'
    );
    privateKeyMessage = await WalletCoreProvider.hexToBytes(
      '0x1fcb84974220eb76e619d7208e1446ae9c0f755e97fb220a8f61c7dc03a0dfce'
    );
    const core = await WalletCoreProvider.getCore();
    privateKeyTypedData = new Uint8Array(core.Hash.keccak256(new TextEncoder().encode('cow')));
  });

  it('signs legacy transactions matching wallet core vector', async () => {
    const signed = await EthSigner.signTransaction(
      {
        chainId: 0x01,
        nonce: 0x09,
        gasPrice: '0x04a817c800',
        gasLimit: '0x5208',
        to: '0x3535353535353535353535353535353535353535',
        value: '0x0de0b6b3a7640000',
      },
      privateKeyLegacy
    );

    expect(signed.rawTransaction).toBe(
      '0xf86c098504a817c800825208943535353535353535353535353535353535353535880de0b6b3a76400008025a028ef61340bd939bc2195fe537567866003e1a15d3c71ff63e1590620aa636276a067cbe9d8997f761aecb703304b3800ccf555c9f3dc64214b297fb1966a3b6d83'
    );
    expect(signed.signature.r).toBe(
      '0x28ef61340bd939bc2195fe537567866003e1a15d3c71ff63e1590620aa636276'
    );
    expect(signed.signature.s).toBe(
      '0x67cbe9d8997f761aecb703304b3800ccf555c9f3dc64214b297fb1966a3b6d83'
    );
    expect(signed.signature.v).toBe('0x25');
  });

  it('signs personal messages (EIP-191)', async () => {
    const { signature, digest } = await EthSigner.signPersonalMessage(
      privateKeyMessage,
      'Some data'
    );

    expect(digest).toBe('0x1da44b586eb0729ff70a73c326926f6ed5a25f5b056e7f47fbc6e58d86871655');
    expect(signature).toBe(
      '0x58156c371347613642e94b66abc4ced8e36011fb3233f5372371aa5ad321671b1a10c0b88f47ce543fd4c455761f5fbf8f61d050f57dcba986640011da794a9000'
    );
  });

  it('signs EIP-712 typed data payloads', async () => {
    const typedData = {
      types: {
        EIP712Domain: [
          { name: 'name', type: 'string' },
          { name: 'version', type: 'string' },
          { name: 'chainId', type: 'uint256' },
          { name: 'verifyingContract', type: 'address' },
        ],
        Person: [
          { name: 'name', type: 'string' },
          { name: 'wallet', type: 'address' },
        ],
        Mail: [
          { name: 'from', type: 'Person' },
          { name: 'to', type: 'Person' },
          { name: 'contents', type: 'string' },
        ],
      },
      primaryType: 'Mail',
      domain: {
        name: 'Ether Mail',
        version: '1',
        chainId: '0x01',
        verifyingContract: '0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC',
      },
      message: {
        from: {
          name: 'Cow',
          wallet: 'CD2a3d9F938E13CD947Ec05AbC7FE734Df8DD826',
        },
        to: {
          name: 'Bob',
          wallet: 'bBbBBBBbbBBBbbbBbbBbbbbBBbBbbbbBbBbbBBbB',
        },
        contents: 'Hello, Bob!',
      },
    };

    const { digest, signature } = await EthSigner.signTypedData(privateKeyTypedData, typedData);

    expect(digest).toBe('0xbe609aee343fb3c4b28e1df9e632fca64fcfaede20f02e86244efddf30957bd2');
    expect(signature).toBe(
      '0x4355c47d63924e8a72e509b65029052eb6c299d53a04e167c5775fd466751c9d07299936d304c153f6443dfa05f40ff007d72911b6f72307f996231605b9156201'
    );
  });

  it('signs via PrivateKey implementing EthereumKeyProtocol', async () => {
    const storage = new MemoryStorage();
    const messageKey = new PrivateKey(
      storage,
      privateKeyMessage.slice(),
      SignatureAlgorithm.ECDSA_secp256k1
    );

    const signedMessage = await messageKey.ethSignPersonalMessage('Some data');
    expect(signedMessage.signature).toBe(
      '0x58156c371347613642e94b66abc4ced8e36011fb3233f5372371aa5ad321671b1a10c0b88f47ce543fd4c455761f5fbf8f61d050f57dcba986640011da794a9000'
    );

    const txKey = new PrivateKey(
      storage,
      privateKeyLegacy.slice(),
      SignatureAlgorithm.ECDSA_secp256k1
    );

    const signedTx = await txKey.ethSignTransaction({
      chainId: 0x01,
      nonce: 0x09,
      gasPrice: '0x04a817c800',
      gasLimit: '0x5208',
      to: '0x3535353535353535353535353535353535353535',
      value: '0x0de0b6b3a7640000',
    });
    expect(signedTx.rawTransaction).toBe(
      '0xf86c098504a817c800825208943535353535353535353535353535353535353535880de0b6b3a76400008025a028ef61340bd939bc2195fe537567866003e1a15d3c71ff63e1590620aa636276a067cbe9d8997f761aecb703304b3800ccf555c9f3dc64214b297fb1966a3b6d83'
    );
  });
});
