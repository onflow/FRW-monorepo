import { type HashAlgoType, type SignAlgoType } from './algo-types';
import { type ChildAccount } from './network-types';

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
  hashAlgo: HashAlgoType;
  // Anonymous mode of the account.
  // If 1, the account is NOT anonymous. If 2, the account is anonymous.
  private: number;
  // The public key of the account
  pubKey: string;
  // The signature algorithm of the account
  signAlgo: SignAlgoType;
  // The weight of the account. Usually 1000
  weight: number;
};

export type LoggedInAccountWithIndex = LoggedInAccount & {
  indexInLoggedInAccounts: number;
};

export type PubKeyAccount = {
  id: number;
  address: string;
  keyIndex: number;
  weight: number;
  pubK: string;
  sigAlgo: SignAlgoType;
  hashAlgo: HashAlgoType;
  chain?: number;
  childAccount?: ChildAccount;
  evmAddress?: string;
  name?: string;
  icon?: string;
  color?: string;
};

export type PublicKeyAccounts = {
  publicKey: string;
  currentId?: string;
  accounts: PubKeyAccount[];
};

export type Emoji = {
  emoji: string;
  name: string;
  bgcolor: string;
};

export type UserWalletStore = {
  accounts: {
    mainnet: PublicKeyAccounts[];
    testnet: PublicKeyAccounts[];
  };
  network: string;
  monitor: string;
  activeChild: ActiveChildType;
  evmEnabled: boolean;
  emulatorMode: boolean;

  currentPubkey: string;
  currentAddress: string;
  parentAddress: string;
  currentEvmAddress: string | null;
};
