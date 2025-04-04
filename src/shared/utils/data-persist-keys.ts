/*
 * Keys and types to access persistant data in the UI from the background storage cache
 * Persistant data is data that is stored between sessions
 */
import { type ActiveChildType } from '../types/wallet-types';

// Persistent storage keys
export const userWalletsKey = 'userWalletsV2';

// Stored in local storage
// key: `userWallets`
export type UserWalletStore = {
  monitor: string;
  activeChild: ActiveChildType;
  evmEnabled: boolean;
  emulatorMode: boolean;
  // The currently selected network
  network: string;
  // The public key of the currently active profile
  currentPubkey: string;
  // The address of the active main account
  parentAddress: string;
  // Either null - meaning main account is active, the evm account address, or the child account address
  currentAddress: string;
};
