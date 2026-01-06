import fcl from '@onflow/fcl';

import { accounts } from './accounts';
import { sign } from './crypto';

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
    keyId: Number(6), // must be a number
    signingFunction: (signable) => ({
      addr: fcl.withPrefix(accounts.main.address), // must match the address that requested the signature, but with a prefix
      keyId: Number(6), // must match the keyId in the account that requested the signature
      signature: sign(accounts.main.key.privateKey, signable.message), // signable.message |> hexToBinArray |> hash |> sign |> binArrayToHex
      // if you arent in control of the transaction that is being signed we recommend constructing the
      // message from signable.voucher using the @onflow/encode module
    }),
  };
}
