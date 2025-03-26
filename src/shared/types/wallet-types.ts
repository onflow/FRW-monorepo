import { type HashAlgoString, type SignAlgoString } from './algo-types';
import { type PublicKeyTuple } from './key-types';
import { type Account, type AccountKey } from './network-types';

// Matches exactly 16 hex characters, with optional 0x prefix
export type FlowAddress = `0x${string & { length: 16 }}` | `${string & { length: 16 }}`;

// Matches exactly 40 hex characters, with optional 0x prefix
export type EvmAddress = `0x${string & { length: 40 }}` | `${string & { length: 40 }}`;

// WalletAddress is the type of the address of the wallet. It can be an EvmAddress or a FlowAddress.
export type WalletAddress = EvmAddress | FlowAddress;

// ActiveChildType is the type of the active child in the wallet. It can be 'evm', a FlowAddress, or null.
export type ActiveChildType = 'evm' | FlowAddress | null;

export type LoggedInAccount = {
  // The globally unique id of the account
  id: string;
  // The root address of the account is always a FlowAddress
  address: FlowAddress;
  // The nickname of the account
  nickname: string;
  // The globally unique username of the account. This is usually the nickname with a numeric suffix
  username: string;
  // The avatar of the account
  avatar: string;
  // The creation date of the account
  created: string;
  // The hash algorithm of the account
  hashAlgo: HashAlgoString;
  // Anonymous mode of the account.
  // If 1, the account is NOT anonymous. If 2, the account is anonymous.
  private: number;
  // The public key of the account
  pubKey: string;
  // The signature algorithm of the account
  signAlgo: SignAlgoString;
  // The weight of the account. Usually 1000
  weight: number;
};

export type LoggedInAccountWithIndex = LoggedInAccount & {
  indexInLoggedInAccounts: number;
};

export type PublicKeyAccount = {
  // The address of the account
  address: string;
  // The public key of the account
  publicKey: string;
  // The index of the key in the account
  keyIndex: number;
  // The weight of the key
  weight: number;
  // The signature algorithm of the key
  signAlgo: number;
  // The signature algorithm of the key
  signAlgoString: SignAlgoString;
  // The hash algorithm of the key
  hashAlgo: number;
  // The hash algorithm of the key
  hashAlgoString: HashAlgoString;
};

export type WalletAccount = {
  address: string;
  chain: number; // testnet: 545, mainnet: 747
  id: number;
  name: string;
  icon: string;
  color: string;
};

export type MainAccount = WalletAccount & PublicKeyAccount;

export type WalletProfile = {
  publicKey: string;
  currentId?: string;
  accounts: MainAccount[];
};

export type Emoji = {
  emoji: string;
  name: string;
  bgcolor: string;
};

export type UserWalletStore = {
  network: string;
  monitor: string;
  activeChild: ActiveChildType;
  evmEnabled: boolean;
  emulatorMode: boolean;
  currentPubkey: PublicKeyTuple;
  currentAddress: string;
  parentAddress: string;
  currentEvmAddress: string | null;
};

interface Thumbnail {
  url: string;
}

export interface AccountDetails {
  name: string;
  description: string;
  thumbnail: Thumbnail;
}

export interface ChildAccountMap {
  [key: string]: AccountDetails;
}
