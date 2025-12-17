import fcl from '@onflow/fcl';

import { accounts } from './accounts';
import { sign, signSecp256k1 } from './crypto';

export async function authz(account, signType = 'secp256k1') {
  return {
    // there is stuff in the account that is passed in
    // you need to make sure its part of what is returned
    ...account,
    // the tempId here is a very special and specific case.
    // what you are usually looking for in a tempId value is a unique string for the address and keyId as a pair
    // if you have no idea what this is doing, or what it does, or are getting an error in your own
    // implementation of an authorization function it is recommended that you use a string with the address and keyId in it.
    // something like... tempId: `${address}-${keyId}`
    tempId: 'SERVICE_ACCOUNT',
    addr: fcl.sansPrefix(accounts.main.address), // eventually it wont matter if this address has a prefix or not, sadly :'( currently it does matter.
    keyId: Number(accounts.main.key.index), // must be a number
    signingFunction: (signable) => ({
      addr: fcl.withPrefix(accounts.main.address), // must match the address that requested the signature, but with a prefix
      keyId: accounts.main.key.index, // must match the keyId in the account that requested the signature
      signature:
        signType === 'p256'
          ? sign(accounts.main.key.privateKey, signable.message)
          : signSecp256k1(accounts.main.key.privateKey, signable.message), // signable.message |> hexToBinArray |> hash |> sign |> binArrayToHex
      // if you arent in control of the transaction that is being signed we recommend constructing the
      // message from signable.voucher using the @onflow/encode module
    }),
  };
}

export function authFunc(opt: any) {
  const { addr, keyId = 0, tempId = 'SERVICE_ACCOUNT', key, signType = 'p256' } = opt;

  return (account) => {
    return {
      ...account,
      tempId,
      addr: fcl.sansPrefix(addr),
      keyId: Number(keyId),
      signingFunction: (signable) => ({
        addr: fcl.withPrefix(addr), // must match the address that requested the signature, but with a prefix
        keyId: Number(keyId), // must match the keyId in the account that requested the signature
        signature:
          signType === 'p256' ? sign(key, signable.message) : signSecp256k1(key, signable.message), // signable.message |> hexToBinArray |> hash |> sign |> binArrayToHex
        // if you arent in control of the transaction that is being signed we recommend constructing the
        // message from signable.voucher using the @onflow/encode module
      }),
    };
  };
}

export const payerAuthorization = async (account: any) => {
  // TODO: get payer address and key id from config
  const ADDRESS = '0x319e67f2ef9d937f'; // Fixed payer address
  const KEY_ID = 0;
  return {
    ...account,
    tempId: `${ADDRESS}-${KEY_ID}`,
    addr: ADDRESS.replace('0x', ''),
    keyId: Number(KEY_ID),
    signingFunction: async (signable: any) => {
      return {
        addr: ADDRESS,
        keyId: Number(KEY_ID),
        signature: await getPayerSignature('http://localhost:3000/api/signAsFeePayer', signable),
      };
    },
  };
};

export const bridgeAuthorization = async (account: any) => {
  // TODO: get payer address and key id from config
  const ADDRESS = '0xc33b4f1884ae1ea4'; // Fixed payer address
  const KEY_ID = 0;
  return {
    ...account,
    tempId: `${ADDRESS}-${KEY_ID}`,
    addr: ADDRESS.replace('0x', ''),
    keyId: Number(KEY_ID),
    signingFunction: async (signable: any) => {
      return {
        addr: ADDRESS,
        keyId: Number(KEY_ID),
        signature: await getAuthSignature(
          'http://localhost:3000/api/signAsBridgeFeePayer',
          signable
        ),
      };
    },
  };
};

export const bridgeAuthorizationOnly = async (account: any) => {
  // TODO: get payer address and key id from config
  const ADDRESS = '0xc33b4f1884ae1ea4'; // Fixed payer address
  const KEY_ID = 0;
  return {
    ...account,
    tempId: `${ADDRESS}-${KEY_ID}`,
    addr: ADDRESS.replace('0x', ''),
    keyId: Number(KEY_ID),
    signingFunction: async (signable: any) => {
      return {
        addr: ADDRESS,
        keyId: Number(KEY_ID),
        signature: await getAuthSignature('http://localhost:3000/api/signAsBridgePayer', signable),
      };
    },
  };
};

const getPayerSignature = async (endPoint: string, signable: any) => {
  const response = await fetch(endPoint, {
    method: 'POST',
    headers: {
      network: 'mainnet',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      transaction: signable.voucher,
      message: {
        envelopeMessage: signable.message,
      },
    }),
  });
  const { data } = (await response.json()) as { data: { sig: string } };
  const signature = data.sig;
  return signature;
};

const getAuthSignature = async (endPoint: string, signable: any) => {
  const response = await fetch(endPoint, {
    method: 'POST',
    headers: {
      network: 'mainnet',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      transaction: signable.voucher,
      message: {
        payload: signable.message,
      },
    }),
  });
  const { data } = (await response.json()) as { data: { sig: string } };
  const signature = data.sig;
  return signature;
};
