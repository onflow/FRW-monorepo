import type { Account as FclAccount } from '@onflow/typedefs';
import * as ethUtil from 'ethereumjs-util';

import { type NftCollection, type FlowNetwork, type NFTModelV2 } from '@onflow/frw-shared/types';
import { consoleError } from '@onflow/frw-shared/utils';

import { EMULATOR_HOST_MAINNET, EMULATOR_HOST_TESTNET } from './fclConfig';

// Re-export utility modules
export * from './account-key';
export * from './key-indexer';
export * from './modules/publicPrivateKey';
export * from './random-id';
export * from './modules/findAddressWithPubKey';
export * from './modules/findAddressWithPK';
export * from './fclConfig';
export * from './retryOperation';
// {a:{b: string}} => {1: 'a.b'}
// later same [source] value will override [result] key generated before
const retrieveValuePath = (obj) => {
  const arr = [...Object.entries(obj)];
  const result = {};
  const parentKey: string[] = [];
  let lastParent;

  while (arr.length) {
    const curNode = arr.shift();
    const [key, value] = curNode!;
    if (lastParent && lastParent[key] !== value) {
      parentKey.pop();
    }

    if (typeof value === 'object') {
      arr.unshift(...Object.entries(value!));
      parentKey.push(key);
      lastParent = value;
    } else if (typeof value === 'string') {
      result[value] = `${[...parentKey, key].join('.')}`;
    }
  }

  return result;
};

export const underline2Camelcase = (str: string) => {
  return str.replace(/_(.)/g, (m, p1) => p1.toUpperCase());
};

export { retrieveValuePath };

export function normalizeAddress(input: number | string): string {
  if (!input) {
    return '';
  }

  if (typeof input === 'number') {
    const buffer = ethUtil.toBuffer(input);
    input = ethUtil.bufferToHex(buffer);
  }

  if (typeof input !== 'string') {
    let msg = 'eth-sig-util.normalize() requires hex string or integer input.';
    msg += ` received ${typeof input}: ${input}`;
    throw new Error(msg);
  }

  return ethUtil.addHexPrefix(input);
}

export const wait = (fn: () => void, ms = 1000) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      fn();
      resolve(true);
    }, ms);
  });
};

export const isSameAddress = (a: string, b: string) => {
  return a.toLowerCase() === b.toLowerCase();
};
export const getEmulatorBaseURL = (network: FlowNetwork) => {
  return network === 'testnet' ? EMULATOR_HOST_TESTNET : EMULATOR_HOST_MAINNET;
};

export const checkEmulatorStatus = async (network: FlowNetwork): Promise<boolean> => {
  try {
    const baseURL = getEmulatorBaseURL(network);
    const response = await fetch(`${baseURL}/v1/blocks?height=sealed`);
    const data = await response.json();
    return !!(data as any)[0].block_status;
  } catch (error) {
    consoleError('checkEmulatorAccount - error ', error);

    return false;
  }
};

export const checkEmulatorAccount = async (
  network: FlowNetwork,
  address: string
): Promise<boolean> => {
  try {
    const baseURL = getEmulatorBaseURL(network);
    const response = await fetch(`${baseURL}/v1/accounts/${address}`);
    const data = (await response.json()) as { address?: string };
    return !!data.address;
  } catch (error) {
    consoleError('checkEmulatorAccount - error ', error);
    return false;
  }
};

export const findKeyAndInfo = (account: FclAccount, publicKey: string) => {
  const index = findPublicKeyIndex(account, publicKey);
  if (index >= 0) {
    const key = account.keys[index];
    return {
      index: index,
      signAlgoString: key.signAlgoString,
      hashAlgoString: key.hashAlgoString,
      publicKey: key.publicKey,
    };
  }
  return null;
};

export const findPublicKeyIndex = (account: FclAccount, publicKey: string) => {
  return account.keys.findIndex((key) => key.publicKey === publicKey);
};

export const replaceNftCollectionKeywords = (script: string, token: NftCollection) => {
  const contractName = token.contractName;
  const storagePath = token.path?.storagePath || '';
  const publicPath = token.path?.publicPath || '';
  const publicType = token.path?.publicType || '';
  if (!contractName) {
    throw new Error('Contract name not found');
  }

  return script
    .replaceAll('<NFT>', contractName)
    .replaceAll('<NFTAddress>', token.address)
    .replaceAll('<CollectionStoragePath>', storagePath)
    .replaceAll('<CollectionPublicType>', publicType)
    .replaceAll('<CollectionPublicPath>', publicPath);
};

/**
 * @deprecated use replaceNftCollectionKeywords
 */
export const replaceNftKeywords = (script: string, token: NFTModelV2) => {
  const contractName = token.contractName;
  const storagePath = token.path.storage || '';
  const publicPath = token.path.public || '';
  if (!contractName) {
    throw new Error('Contract name not found');
  }

  return script
    .replaceAll('<NFT>', contractName)
    .replaceAll('<NFTAddress>', token.address)
    .replaceAll('<CollectionStoragePath>', storagePath)
    .replaceAll('<CollectionPublicPath>', publicPath);
};
