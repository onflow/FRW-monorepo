/*
 * Keys and types to access data in the UI from the background storage cache
 * This is the primary way to get cached data from network calls to the frontend
 */
import { type UserInfoResponse } from '../types/network-types';
import {
  type MainAccount,
  type ChildAccountMap,
  type EvmAddress,
  type FlowAddress,
  type WalletAccount,
} from '../types/wallet-types';

import { getCachedData } from './cache-data-access';
import { type NetworkScripts } from './script-types';

// Utiltiy function to create the refresh key for a given key function
const refreshKey = (keyFunction: (...args: string[]) => string) =>
  ((args: string[] = ['(.*)', '(.*)', '(.*)']) => new RegExp(`${keyFunction(...args)}-refresh`))();

/*
 * --------------------------------------------------------------------
 * User level keys
 * --------------------------------------------------------------------
 */
export const userInfoCachekey = (userId: string) => `user-info-${userId}`;
export const userInfoRefreshRegex = refreshKey(userInfoCachekey);
export type UserInfoStore = UserInfoResponse;

// Note we could do this per user but it's not worth the complexity
export const cadenceScriptsKey = () => `cadence-scripts`;
export const cadenceScriptsRefreshRegex = refreshKey(cadenceScriptsKey);
export type CadenceScriptsStore = NetworkScripts;

export const getCachedScripts = async () => {
  return getCachedData<CadenceScriptsStore>(cadenceScriptsKey());
};

/*
 * --------------------------------------------------------------------
 * Network level keys (keyed by network & public key)
 * --------------------------------------------------------------------
 */
// Profile Accounts - the Main (Flow) accounts of a given public key on a given network
export const mainAccountsKey = (network: string, publicKey: string) =>
  `main-accounts-${network}-${publicKey}`;

export const mainAccountsRefreshRegex = refreshKey(mainAccountsKey);

export type MainAccountStore = MainAccount[];

export const getCachedMainAccounts = async (network: string, publicKey: string) => {
  return getCachedData<MainAccountStore>(mainAccountsKey(network, publicKey));
};
/*
 * --------------------------------------------------------------------
 * Account level keys (keyed by network & MAIN FLOW account address)
 * --------------------------------------------------------------------
 */

// Child Accounts - the child accounts of a given main account on a given network
export const childAccountsKey = (network: string, mainAccountAddress: string) =>
  `child-accounts-${network}-${mainAccountAddress}`;
export const childAccountsRefreshRegex = refreshKey(childAccountsKey);

export type ChildAccountStore = WalletAccount[];

export const getCachedChildAccounts = async (network: string, mainAccountAddress: string) => {
  return getCachedData<ChildAccountStore>(childAccountsKey(network, mainAccountAddress));
};

// EVM Account - the EVM account of a given main account on a given network
export const evmAccountKey = (network: string, mainAccountAddress: string) =>
  `evm-account-${network}-${mainAccountAddress}`;

export const evmAccountRefreshRegex = refreshKey(evmAccountKey);

export type EvmAccountStore = WalletAccount;

export const getCachedEvmAccount = async (network: string, mainAccountAddress: string) => {
  return getCachedData<EvmAccountStore>(evmAccountKey(network, mainAccountAddress));
};

export const coinListKey = (network: string, publicKey: string, currency = 'usd') =>
  `coin-list-${network}-${publicKey}-${currency}`;

export const coinListRefreshRegex = refreshKey(coinListKey);
