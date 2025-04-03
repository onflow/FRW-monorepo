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
} from '../types/wallet-types';

// Utiltiy function to create the refresh key for a given key function
const refreshKey =
  (keyFunction: (...args: string[]) => string) =>
  (args: string[] = ['(.*)', '(.*)', '(.*)']) =>
    new RegExp(`${keyFunction(...args)}-refresh`);

/*
 * --------------------------------------------------------------------
 * User level keys
 * --------------------------------------------------------------------
 */
export const userInfoCachekey = (userId: string) => `user-info-${userId}`;
export const userInfoRefreshKey = refreshKey(userInfoCachekey);
export type UserInfoStore = UserInfoResponse;

/*
 * --------------------------------------------------------------------
 * Network level keys (keyed by network & public key)
 * --------------------------------------------------------------------
 */
// Profile Accounts - the Main (Flow) accounts of a given public key on a given network
export const profileAccountsKey = (network: string, publicKey: string) =>
  `profile-accounts-${network}-${publicKey}`;

export const profileAccountsRefreshKey = refreshKey(profileAccountsKey);

export type ProfileAccountStore = {
  accounts: MainAccount[];
  publicKey: string;
};

/*
 * --------------------------------------------------------------------
 * Account level keys (keyed by network & MAIN FLOW account address)
 * --------------------------------------------------------------------
 */

// Child Accounts - the child accounts of a given main account on a given network
export const childAccountsKey = (network: string, mainAccountAddress: string) =>
  `child-accounts-${network}-${mainAccountAddress}`;
export const childAccountsRefreshKey = refreshKey(childAccountsKey);
export type ChildAccountStore = {
  parentAddress: FlowAddress;
  accounts: ChildAccountMap;
};
// EVM Account - the EVM account of a given main account on a given network
export const evmAccountKey = (network: string, mainAccountAddress: string) =>
  `evm-account-${network}-${mainAccountAddress}`;

export const evmAccountRefreshKey = refreshKey(evmAccountKey);

export type EvmAccountStore = {
  parentAddress: FlowAddress;
  evmAddress: EvmAddress | null;
};
