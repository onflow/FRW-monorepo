import { create } from 'zustand';

import type {
  LoggedInAccountWithIndex,
  LoggedInAccount,
  PubKeyAccount,
  FlowAddress,
} from '@/shared/types/wallet-types';

import type { ChildAccount, WalletType, UserInfoResponse } from '../../shared/types/network-types';

interface ProfileState {
  mainAddress: FlowAddress | null;
  evmAddress: string;
  currentWalletIndex: number;
  parentWallet: PubKeyAccount;
  evmWallet: PubKeyAccount;
  walletList: WalletType[];
  initialStart: boolean;
  currentWallet: WalletType;
  mainAddressLoading: boolean;
  childAccounts: ChildAccount;
  evmLoading: boolean;
  listLoading: boolean;
  userInfo: UserInfoResponse | null;
  otherAccounts: LoggedInAccountWithIndex[];
  loggedInAccounts: LoggedInAccount[];
  setMainAddress: (address: FlowAddress) => void;
  setEvmAddress: (address: string) => void;
  setCurrentWalletIndex: (index: number) => void;
  setParentWallet: (wallet: PubKeyAccount) => void;
  setEvmWallet: (wallet: PubKeyAccount) => void;
  setWalletList: (list: any[]) => void;
  setInitial: (initial: boolean) => void;
  setCurrent: (current: any) => void;
  setMainLoading: (mainAddressLoading: boolean) => void;
  setChildAccount: (childAccount: ChildAccount) => void;
  setEvmLoading: (evmLoading: boolean) => void;
  setListLoading: (listLoading: boolean) => void;
  setUserInfo: (info: UserInfoResponse | null) => void;
  setOtherAccounts: (accounts: any) => void;
  setLoggedInAccounts: (accounts: any) => void;
  clearProfileData: () => void;
}

const INITIAL_WALLET = {
  name: '',
  icon: '',
  address: '',
  chain_id: 'flow',
  id: 1,
  coins: ['flow'],
  color: '',
};

const INITIAL_ACCOUNT: PubKeyAccount = {
  name: '',
  icon: '',
  address: '',
  id: 1,
  color: '',
  keyIndex: 0,
  weight: 0,
  pubK: '',
  sigAlgo: 'ECDSA_secp256k1',
  hashAlgo: 'SHA3_256',
};

export const useProfileStore = create<ProfileState>((set) => ({
  mainAddress: null,
  evmAddress: '',
  currentWalletIndex: 0,
  parentWallet: { ...INITIAL_ACCOUNT },
  evmWallet: { ...INITIAL_ACCOUNT },
  currentWallet: { ...INITIAL_WALLET },
  walletList: [],
  initialStart: true,
  mainAddressLoading: true,
  evmLoading: true,
  childAccounts: {},
  userInfo: null,
  otherAccounts: [],
  loggedInAccounts: [],
  listLoading: true,
  setMainAddress: (address) => set({ mainAddress: address }),
  setEvmAddress: (address) => set({ evmAddress: address }),
  setCurrentWalletIndex: (index) => set({ currentWalletIndex: index }),
  setParentWallet: (wallet) => set({ parentWallet: wallet }),
  setEvmWallet: (wallet) => set({ evmWallet: wallet }),
  setWalletList: (list) => set({ walletList: list }),
  setInitial: (initial) => set({ initialStart: initial }),
  setCurrent: (current) => set({ currentWallet: current }),
  setMainLoading: (mainAddressLoading) => set({ mainAddressLoading: mainAddressLoading }),
  setChildAccount: (childAccount) => set({ childAccounts: childAccount }),
  setEvmLoading: (evmLoading) => set({ evmLoading: evmLoading }),
  setUserInfo: (info) => set({ userInfo: info }),
  setOtherAccounts: (accounts: LoggedInAccountWithIndex[]) => set({ otherAccounts: accounts }),
  setLoggedInAccounts: (accounts: LoggedInAccount[]) => set({ loggedInAccounts: accounts }),
  setListLoading: (listLoading) => set({ listLoading: listLoading }),
  clearProfileData: () =>
    set({
      mainAddress: null,
      evmAddress: '',
      currentWalletIndex: 0,
      parentWallet: { ...INITIAL_ACCOUNT },
      evmWallet: { ...INITIAL_ACCOUNT },
      walletList: [],
      initialStart: true,
      currentWallet: { ...INITIAL_WALLET },
      mainAddressLoading: true,
      childAccounts: {},
      evmLoading: true,
      listLoading: true,
      userInfo: null,
      otherAccounts: [],
      loggedInAccounts: [],
    }),
}));
