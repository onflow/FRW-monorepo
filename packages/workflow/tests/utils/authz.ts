import fcl from '@onflow/fcl';

import { accounts } from './accounts';
import { sign } from './crypto';

export const child1Addr = accounts.child1.address;
export const child2Addr = accounts.child2.address;

export async function authz(account) {
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
      signature: sign(accounts.main.key.privateKey, signable.message), // signable.message |> hexToBinArray |> hash |> sign |> binArrayToHex
      // if you arent in control of the transaction that is being signed we recommend constructing the
      // message from signable.voucher using the @onflow/encode module
    }),
  };
}

export function authFunc(opt: any) {
  const { addr, keyId = 0, tempId = 'SERVICE_ACCOUNT', key } = opt;

  return (account) => {
    return {
      ...account,
      tempId,
      addr: fcl.sansPrefix(addr),
      keyId: Number(keyId),
      signingFunction: (signable) => ({
        addr: fcl.withPrefix(addr), // must match the address that requested the signature, but with a prefix
        keyId: Number(keyId), // must match the keyId in the account that requested the signature
        signature: sign(key, signable.message), // signable.message |> hexToBinArray |> hash |> sign |> binArrayToHex
        // if you arent in control of the transaction that is being signed we recommend constructing the
        // message from signable.voucher using the @onflow/encode module
      }),
    };
  };
}

export function test1Authz() {
  const authz = authFunc({
    addr: accounts.child1.address,
    key: accounts.child1.key,
    keyId: 0,
  });
  return authz;
}

export function test2Authz() {
  const authz = authFunc({
    addr: accounts.child2.address,
    key: accounts.child2.key.privateKey,
    keyId: 0,
  });
  return authz;
}
