import * as secp from '@noble/secp256k1';
import * as fcl from '@onflow/fcl';
import { getApp } from 'firebase/app';
import { getAuth, signInAnonymously } from 'firebase/auth/web-extension';

import wallet from '@/background/controller/wallet';
import keyringService from '@/background/service/keyring';
import { mixpanelTrack } from '@/background/service/mixpanel';
import openapiService from '@/background/service/openapi';
import { getLoggedInAccount } from '@/background/utils/getLoggedInAccount';
import {
  signWithKey,
  seed2PublicPrivateKey,
  seed2PublicPrivateKeyTemp,
} from '@/background/utils/modules/publicPrivateKey';
import createPersistStore from '@/background/utils/persisitStore';
import { type HashAlgoString, type SignAlgoString } from '@/shared/types/algo-types';
import { type PublicKeyTuple, type PublicPrivateKeyTuple } from '@/shared/types/key-types';
import {
  type LoggedInAccount,
  type ActiveChildType,
  type FlowAddress,
  type EvmAddress,
  type Emoji,
  type WalletAccount,
  type ChildAccountMap,
} from '@/shared/types/wallet-types';
import { isValidEthereumAddress, isValidFlowAddress, withPrefix } from '@/shared/utils/address';
import { getHashAlgo, getSignAlgo } from '@/shared/utils/algo';

import type {
  WalletResponse,
  BlockchainResponse,
  DeviceInfoRequest,
  FlowNetwork,
} from '../../shared/types/network-types';
import {
  type WalletProfile,
  type PublicKeyAccount,
  type MainAccount,
} from '../../shared/types/wallet-types';
import { fclConfig } from '../fclConfig';
import { findAddressWithSeed, findAddressWithPK } from '../utils/modules/findAddressWithPK';
import {
  getAccountsByPublicKeyTuple,
  getOrCheckAddressByPublicKeyTuple,
} from '../utils/modules/findAddressWithPubKey';
import { storage } from '../webapi';

interface UserWalletStore {
  network: string;
  monitor: string;
  activeChild: ActiveChildType;
  evmEnabled: boolean;
  emulatorMode: boolean;

  currentPubkey: string;
  currentAddress: string;
  parentAddress: string;
  currentEvmAddress: string | null;
}

const USER_WALLET_TEMPLATE: UserWalletStore = {
  activeChild: null,
  evmEnabled: false,
  monitor: 'flowscan',
  network: 'mainnet',
  emulatorMode: false,
  currentPubkey: '',
  currentAddress: '',
  parentAddress: '',
  currentEvmAddress: '',
};
class UserWallet {
  store!: UserWalletStore;
  accounts: {
    mainnet: WalletProfile[];
    testnet: WalletProfile[];
  } = {
    mainnet: [],
    testnet: [],
  };

  // This is a map of the child accounts for each address
  childAccountMap: Map<FlowNetwork, Map<FlowAddress, ChildAccountMap>> = new Map();

  // This is a map of the evm addresses for each address
  evmAddressMap: Map<FlowNetwork, Map<FlowAddress, string>> = new Map();

  init = async () => {
    this.store = await createPersistStore<UserWalletStore>({
      name: 'userWallets',
      template: USER_WALLET_TEMPLATE,
    });
    this.accounts = {
      mainnet: [],
      testnet: [],
    };

    this.childAccountMap = new Map();
    this.evmAddressMap = new Map();
  };

  clear = async () => {
    if (!this.store) {
      await this.init();
    } else {
      Object.assign(this.store, USER_WALLET_TEMPLATE);
    }
    this.accounts = {
      mainnet: [],
      testnet: [],
    };
  };
  isLocked = () => {
    return !keyringService.isBooted() || !keyringService.memStore.getState().isUnlocked;
  };

  setUserAccounts = async (
    accountData: MainAccount[],
    pubKey: PublicKeyTuple,
    network: string,
    emoji: Emoji[]
  ) => {
    const profileList: WalletProfile[] = this.accounts[network];
    const accountIndex = profileList.findIndex(
      (account) =>
        account.publicKey === pubKey.P256.pubK || account.publicKey === pubKey.SECP256K1.pubK
    );
    this.setCurrentPubkey(pubKey.P256.pubK);
    if (accountIndex !== -1) {
      profileList[accountIndex] = {
        accounts: accountData.map((account, index): MainAccount => {
          const defaultEmoji = emoji[index] || {
            name: 'Default',
            emoji: '🐾',
            bgcolor: '#ffffff',
          };
          return {
            ...account,
            chain: network === 'testnet' ? 545 : 747,
            id: index,
            name: defaultEmoji.name,
            icon: defaultEmoji.emoji,
            color: defaultEmoji.bgcolor,
          };
        }),
        // TODO: This is a temporary fix to ensure the public key is set. There could be more than one public key for accounts in the list
        publicKey: accountData[0].publicKey,
      };
    } else {
      profileList.push({
        accounts: accountData.map((account, index) => {
          const defaultEmoji = emoji[index] || {
            name: 'Default',
            emoji: '🐾',
            bgcolor: '#ffffff',
          };
          return {
            ...account,
            chain: network === 'testnet' ? 545 : 747,
            id: index,
            name: defaultEmoji.name,
            icon: defaultEmoji.emoji,
            color: defaultEmoji.bgcolor,
          };
        }),
        // TODO: This is a temporary fix to ensure the public key is always the P256 public key
        publicKey: pubKey.P256.pubK,
      });
    }
    this.store.currentAddress = accountData[0].address;
    this.store.parentAddress = accountData[0].address;
    this.accounts[network] = profileList;

    return profileList;
  };

  setCurrentPubkey = (pubkey: string) => {
    this.store.currentPubkey = pubkey;
  };

  switchAccount = (pubkey: string) => {
    if (!pubkey) {
      console.warn('Invalid pubkey provided to switchAccount');
      return;
    }

    const accounts = this.accounts[this.store.network];

    const accountGroup = accounts.find((group) => {
      const matches = group.publicKey === pubkey;

      return matches;
    });

    if (!accountGroup || !accountGroup.accounts.length) {
      console.warn(`No account found for pubkey: ${pubkey.slice(0, 10)}...`);
      return;
    }

    this.store.currentPubkey = pubkey;
    this.store.currentAddress = accountGroup.accounts[0].address;
    this.store.parentAddress = accountGroup.accounts[0].address;
  };

  getCurrentPubkey = (): string => {
    return this.store.currentPubkey;
  };

  // Helper method to find account in current accounts
  private findAccount = (
    address: string,
    network: string
  ): {
    account: PublicKeyAccount | null;
    currentAccounts: WalletProfile[];
  } => {
    const currentAccounts = this.accounts[network];

    // First try to find account group using currentPubkey
    let accountGroupIndex = currentAccounts.findIndex(
      (group) => group.publicKey === this.store.currentPubkey
    );

    // If not found with currentPubkey, fallback to searching by address
    if (accountGroupIndex === -1) {
      accountGroupIndex = currentAccounts.findIndex((group) =>
        group.accounts.some((account) => account.address === address)
      );
    }

    if (accountGroupIndex === -1) {
      console.warn(`No account group found containing address ${address}`);
      return { account: null, currentAccounts };
    }

    const accountIndex = currentAccounts[accountGroupIndex].accounts.findIndex(
      (account) => account.address === address
    );

    if (accountIndex === -1) {
      console.warn(`Address ${address} not found in account group`);
      return { account: null, currentAccounts };
    }

    return {
      account: currentAccounts[accountGroupIndex].accounts[accountIndex] as PublicKeyAccount,
      currentAccounts,
    };
  };

  setChildAccounts = (childAccount: ChildAccountMap, address: string, network: string) => {
    const { account, currentAccounts } = this.findAccount(address, network);

    if (!account) return;

    // Store the child accounts for address in the childAccountMap
    this.childAccountMap[address] = childAccount;
    this.accounts[network] = currentAccounts;
  };

  setAccountEvmAddress = (evmAddress: string) => {
    const network = this.store.network;
    const address = this.store.parentAddress;
    const { account, currentAccounts } = this.findAccount(address, network);

    if (!account) return;
    this.store.currentEvmAddress = evmAddress;

    // Store the evm address for address in the evmAddressMap
    this.evmAddressMap[address] = evmAddress;
    this.accounts[network] = currentAccounts;
  };

  setCurrentAccount = async (wallet: WalletAccount, key: ActiveChildType) => {
    console.log('setCurrentAccount +++++++++++++++++++++++++++++++ ', wallet, key);
    this.store.currentAddress = wallet.address;
    if (key === 'evm') {
      this.store.currentEvmAddress = wallet.address;
    } else if (key === null) {
      this.store.parentAddress = wallet.address;
    }
  };

  getActiveWallet = (): ActiveChildType => {
    const parentAddress = this.store.parentAddress;
    const currentAddress = this.store.currentAddress;

    if (parentAddress === currentAddress) {
      return null;
    }

    // Check if it satisfies the FlowAddress type
    const isFlow = (address: string): address is FlowAddress => {
      return (
        (address.startsWith('0x') && address.length === 18) ||
        (!address.startsWith('0x') && address.length === 16)
      );
    };

    if (isValidEthereumAddress(currentAddress)) {
      return 'evm';
    } else if (isFlow(currentAddress)) {
      return currentAddress;
    }

    return null;
  };

  getParentAddress = async (network: string): Promise<FlowAddress | null> => {
    if (!keyringService.isBooted() || !keyringService.memStore.getState().isUnlocked) {
      return null;
    }
    const address = this.store.parentAddress;
    const prefixedAddress = withPrefix(address);
    return isValidFlowAddress(prefixedAddress) ? prefixedAddress : null;
  };

  returnParentWallet = async (network: string): Promise<PublicKeyAccount | null> => {
    if (!keyringService.isBooted() || !keyringService.memStore.getState().isUnlocked) {
      return null;
    }
    const address = this.store.parentAddress;
    const pubkey = this.store.currentPubkey;
    const currentAccounts = this.accounts[network] as WalletProfile[];
    const account = currentAccounts.find((account) => account.publicKey === pubkey);
    if (account) {
      return account.accounts.find((account) => account.address === address) || null;
    }
    return null;
  };

  getCurrentAddress = (): FlowAddress | EvmAddress | null => {
    const address = this.store.currentAddress;

    return withPrefix(address);
  };

  getCurrentWallet = (): WalletAccount | null => {
    if (this.isLocked()) {
      return null;
    }
    const activeType = this.getActiveWallet();

    const network = this.store.network;
    const address = this.store.parentAddress;
    const pubkey = this.store.currentPubkey;
    const profileList: WalletProfile[] = this.accounts[network];
    const currentProfile = profileList.find((profile) => profile.publicKey === pubkey);
    if (currentProfile) {
      const account =
        currentProfile.accounts.find((account) => account.address === address) || null;
      if (!account) {
        return null;
      }
      if (activeType === 'evm') {
        const evmWallet = {
          ...account,
          address: this.store.currentEvmAddress || '',
          name: 'Lemon',
          icon: '🍋',
          color: '#FFD700',
          pubK: this.store.currentPubkey,
        };
        return evmWallet;
      } else if (activeType === null) {
        return account;
      } else {
        // activeType is the address of the child account
        const childAccountDetails = this.childAccountMap[network]?.[address]?.[activeType];
        const childWallet = {
          ...account,
          address: activeType,
          name: childAccountDetails?.name ?? 'Unknown',
          icon: childAccountDetails?.thumbnail?.url ?? '',
          pubK: this.store.currentPubkey,
        };
        return childWallet;
      }
    }
    return null;
  };

  getUserWallets = (network: string): MainAccount[] | null => {
    const currentPubKey = this.store.currentPubkey;
    const currentAccounts = this.accounts[network] as WalletProfile[];

    const currentAccount = currentAccounts.find((account) => account.publicKey === currentPubKey);
    if (currentAccount) {
      return currentAccount.accounts;
    } else {
      return null;
    }
  };

  getEvmWallet = (): WalletAccount | null => {
    if (this.isLocked()) {
      return null;
    }

    const network = this.store.network;
    const address = this.store.parentAddress;
    const pubkey = this.store.currentPubkey;
    const currentAccounts = this.accounts[network] as WalletProfile[];
    const accounts = currentAccounts.find((account) => account.publicKey === pubkey);
    if (accounts) {
      const account = accounts.accounts.find((account) => account.address === address) || null;
      if (!account) {
        return null;
      }
      const evmWallet = {
        ...account,
        address: this.store.currentEvmAddress || '',
        name: 'Lemon',
        icon: '🍋',
        color: '#FFD700',
        pubK: this.store.currentPubkey,
      };
      return evmWallet;
    }
    return null;
  };

  getChildAccount = (): ChildAccountMap | null => {
    if (this.isLocked()) {
      return null;
    }

    const network = this.store.network;
    const address = this.store.parentAddress;
    const childAccount = this.childAccountMap[network]?.[address];
    return childAccount;
  };

  setWalletEmoji = (emoji, network, id) => {
    console.log('setWalletEmoji', emoji, network, id);
    // this.store.wallets[network][id].name = emoji.name;
    // this.store.wallets[network][id].icon = emoji.emoji;
    // this.store.wallets[network][id].color = emoji.bgcolor;
    // this.store.wallets[network][id].blockchain[0].name = emoji.name;
    // this.store.wallets[network][id].blockchain[0].icon = emoji.emoji;
    // this.store.wallets[network][id].blockchain[0].color = emoji.bgcolor;
  };

  refreshEvm = () => {
    const network = this.store.network;
    const address = this.store.parentAddress;

    // Remove the evm address from the map
    delete this.evmAddressMap[network]?.[address];
    this.store.currentEvmAddress = null;

    this.store.evmEnabled = false;
  };

  /*
  New store for accounts are above
  */

  setNetwork = async (network: string) => {
    if (!this.store) {
      await this.init();
    }
    if (this.store.network !== network) {
      this.store.activeChild = null;
      // TODO: I think this line below should be put back in. It was removed to fix an account switching bug, but without it, it's possible for currentWallet to refer to address on another network. Either currentWallet should be cleared or the line below should be put back in.
      // this.store.currentWallet = this.store.wallets[network][0].blockchain[0];
    }
    this.store.network = network;
  };

  setMonitor = (monitor: string) => {
    this.store.monitor = monitor;
  };

  setEvmEnabled = (status: boolean) => {
    this.store.evmEnabled = status;
  };

  getEvmEnabled = () => {
    return this.store.evmEnabled;
  };

  getNetwork = async (): Promise<string> => {
    if (!this.store) {
      await this.init();
    }
    return this.store.network;
  };

  getEmulatorMode = async (): Promise<boolean> => {
    // Check feature flag first
    const enableEmulatorMode = await openapiService.getFeatureFlag('emulator_mode');
    if (!enableEmulatorMode) {
      return false;
    }
    if (!this.store) {
      await this.init();
    }
    return this.store.emulatorMode;
  };

  setEmulatorMode = async (emulatorMode: boolean) => {
    let emulatorModeToSet = emulatorMode;
    if (emulatorModeToSet) {
      // check feature flag
      const enableEmulatorMode = await openapiService.getFeatureFlag('emulator_mode');
      if (!enableEmulatorMode) {
        emulatorModeToSet = false;
      }
    }
    this.store.emulatorMode = emulatorModeToSet;
    await this.setupFcl();
  };

  getMonitor = (): string => {
    return this.store.monitor;
  };

  setEvmEmoji = (emoji) => {
    console.log('setEvmEmoji', emoji);
    // this.store.evmWallet.name = emoji.name;
    // this.store.evmWallet.icon = emoji.emoji;
    // this.store.evmWallet.color = emoji.bgcolor;
  };

  // transaction functions below

  setupFcl = async () => {
    const isEmulatorMode = await this.getEmulatorMode();
    const network = (await this.getNetwork()) as FlowNetwork;
    await fclConfig(network, isEmulatorMode);
  };

  private extractScriptName = (cadence: string): string => {
    const scriptLines = cadence.split('\n');
    for (const line of scriptLines) {
      if (line.includes('// Flow Wallet')) {
        // '    // Flow Wallet - testnet Script  sendNFT - v2.31'
        const nameMatch = line.match(/\/\/ Flow Wallet -\s*(testnet|mainnet)\s*Script\s+(\w+)/);
        return nameMatch ? nameMatch[2] : 'unknown_script';
      }
    }
    return 'unknown_script';
  };
  sendTransaction = async (cadence: string, args: any[]): Promise<string> => {
    const scriptName = this.extractScriptName(cadence);
    //add proxy
    try {
      const allowed = await wallet.allowLilicoPay();
      const txID = await fcl.mutate({
        cadence: cadence,
        args: (arg, t) => args,
        proposer: this.authorizationFunction,
        authorizations: [this.authorizationFunction],
        payer: allowed ? this.payerAuthFunction : this.authorizationFunction,
        limit: 9999,
      });

      return txID;
    } catch (error) {
      mixpanelTrack.track('script_error', {
        script_id: scriptName,
        error: error,
      });
      throw error;
    }
  };

  sign = async (signableMessage: string): Promise<string> => {
    const hashAlgo = await storage.get('hashAlgo');
    const signAlgo = await storage.get('signAlgo');
    const password = keyringService.password;
    const privateKey = await wallet.getPrivateKeyForCurrentAccount(password);
    const realSignature = await signWithKey(
      Buffer.from(signableMessage, 'hex'),
      signAlgo,
      hashAlgo,
      privateKey
    );
    return realSignature;
  };

  switchLogin = async (pubKey: any, replaceUser = true) => {
    const pubKeyP256 = pubKey.P256;
    const pubKeySECP256K1 = pubKey.SECP256K1;

    // The issue is here in using getStoragedAccount()
    let account: Partial<LoggedInAccount> & {
      hashAlgo: HashAlgoString;
      signAlgo: SignAlgoString;
      pubKey: string;
      weight: number;
    };
    try {
      // Try to get the account from  loggedInAccounts
      account = await getLoggedInAccount();
    } catch (error) {
      console.error('Error getting logged in account - recreate it', error);
      // Look for the account using the pubKey
      const network = (await this.getNetwork()) || 'mainnet';
      // Find the address associated with the pubKey
      // This should return an array of address information records
      const addressAndKeyInfoArray = await getAccountsByPublicKeyTuple(pubKey, network);
      // Find which signAlgo and hashAlgo is used on the account
      if (!Array.isArray(addressAndKeyInfoArray) || !addressAndKeyInfoArray.length) {
        throw new Error('No address found');
      }
      // Follow the same logic as freshUserInfo in openapi.ts
      // Look for the P256 key first

      let index = addressAndKeyInfoArray.findIndex((key) => key.publicKey === pubKeyP256.pubK);
      if (index === -1) {
        // If no P256 key is found, look for the SECP256K1 key
        index = addressAndKeyInfoArray.findIndex((key) => key.publicKey === pubKeySECP256K1.pubK);

        if (index === -1) {
          // Just use the first one
          index = 0;
        }
      }
      // Convert it to a LoggedInAccount
      const pubKeyAccount = addressAndKeyInfoArray[index];
      account = {
        ...pubKeyAccount,
        hashAlgo: pubKeyAccount.hashAlgoString,
        signAlgo: pubKeyAccount.signAlgoString,
        pubKey: pubKeyAccount.publicKey,
        weight: pubKeyAccount.weight,
        address: pubKeyAccount.address as FlowAddress,
      };
    }
    const keyType = getSignAlgo(account.signAlgo!);
    const keys = keyType === 1 ? pubKeyP256 : pubKeySECP256K1;
    let result = [
      {
        hashAlgo: account.hashAlgo!,
        signAlgo: account.signAlgo!,
        pubK: keys.pubK,
        weight: account.weight!,
      },
    ];

    if (!result[0].pubK) {
      console.log('No result found, creating a new result object');
      // Create a new result object with extension default setting
      const foundResult = await findAddressWithPK(keys.pk, '');
      if (!foundResult) {
        throw new Error('Unable to find a address with the provided PK. Aborting login.');
      }

      result = foundResult.map((account) => ({
        hashAlgo: account.hashAlgoString,
        signAlgo: account.signAlgoString,
        pubK: account.publicKey,
        weight: account.weight,
      }));
    }
    const hashAlgo = result[0].hashAlgo;
    const signAlgo = result[0].signAlgo;
    const publicKey = result[0].pubK;

    await this.setCurrentPubkey(publicKey);
    const app = getApp(process.env.NODE_ENV!);
    const auth = getAuth(app);
    const idToken = await getAuth(app).currentUser?.getIdToken();
    if (idToken === null || !idToken) {
      signInAnonymously(auth);
      return;
    }
    const rightPaddedHexBuffer = (value, pad) =>
      Buffer.from(value.padEnd(pad * 2, 0), 'hex').toString('hex');
    const USER_DOMAIN_TAG = rightPaddedHexBuffer(Buffer.from('FLOW-V0.0-user').toString('hex'), 32);
    const message = USER_DOMAIN_TAG + Buffer.from(idToken, 'utf8').toString('hex');

    // const messageHash = await secp.utils.sha256(Buffer.from(message, 'hex'));
    const accountKey = {
      public_key: publicKey,
      hash_algo: typeof hashAlgo === 'string' ? getHashAlgo(hashAlgo) : hashAlgo,
      sign_algo: typeof signAlgo === 'string' ? getSignAlgo(signAlgo) : signAlgo,
      weight: result[0].weight,
    };
    const deviceInfo = await this.getDeviceInfo();
    // const signature = await secp.sign(messageHash, privateKey);
    const realSignature = await signWithKey(
      Buffer.from(message, 'hex'),
      signAlgo,
      hashAlgo,
      keys.pk
    );
    return wallet.openapi.loginV3(accountKey, deviceInfo, realSignature, replaceUser);
  };

  reSign = async () => {
    // Try to re-establish the session if the user's wallet is unlocked
    if (this.isLocked()) {
      // If the wallet is locked, we can't sign in
      return;
    }
    const password = keyringService.password;
    if (!password) {
      // No password means the wallet is not unlocked
      return;
    }
    const privateKey = await wallet.getPrivateKeyForCurrentAccount(password);
    return await this.sigInWithPk(privateKey);
  };

  authorizationFunction = async (account: any = {}) => {
    // authorization function need to return an account
    const address = fcl.withPrefix(await wallet.getMainAddress());
    const ADDRESS = fcl.withPrefix(address);
    // TODO: FIX THIS
    const KEY_ID = (await storage.get('keyIndex')) || 0;
    return {
      ...account, // bunch of defaults in here, we want to overload some of them though
      tempId: `${ADDRESS}-${KEY_ID}`, // tempIds are more of an advanced topic, for 99% of the times where you know the address and keyId you will want it to be a unique string per that address and keyId
      addr: fcl.sansPrefix(ADDRESS), // the address of the signatory, currently it needs to be without a prefix right now
      keyId: Number(KEY_ID), // this is the keyId for the accounts registered key that will be used to sign, make extra sure this is a number and not a string
      signingFunction: async (signable) => {
        // Singing functions are passed a signable and need to return a composite signature
        // signable.message is a hex string of what needs to be signed.
        return {
          addr: fcl.withPrefix(ADDRESS), // needs to be the same as the account.addr but this time with a prefix, eventually they will both be with a prefix
          keyId: Number(KEY_ID), // needs to be the same as account.keyId, once again make sure its a number and not a string
          signature: await this.sign(signable.message), // this needs to be a hex string of the signature, where signable.message is the hex value that needs to be signed
        };
      },
    };
  };

  signPayer = async (signable: any): Promise<string> => {
    const tx = signable.voucher;
    const message = signable.message;
    const envelope = await openapiService.signPayer(tx, message);
    const signature = envelope.envelopeSigs.sig;
    return signature;
  };

  signProposer = async (signable: any): Promise<string> => {
    const tx = signable.voucher;
    const message = signable.message;
    const envelope = await openapiService.signProposer(tx, message);
    const signature = envelope.envelopeSigs.sig;
    return signature;
  };

  proposerAuthFunction = async (account: any = {}) => {
    // authorization function need to return an account
    const proposer = await openapiService.getProposer();
    const address = fcl.withPrefix(proposer.data.address);
    const ADDRESS = fcl.withPrefix(address);
    // TODO: FIX THIS
    const KEY_ID = proposer.data.keyIndex;
    return {
      ...account, // bunch of defaults in here, we want to overload some of them though
      tempId: `${ADDRESS}-${KEY_ID}`, // tempIds are more of an advanced topic, for 99% of the times where you know the address and keyId you will want it to be a unique string per that address and keyId
      addr: fcl.sansPrefix(ADDRESS), // the address of the signatory, currently it needs to be without a prefix right now
      keyId: Number(KEY_ID), // this is the keyId for the accounts registered key that will be used to sign, make extra sure this is a number and not a string
      signingFunction: async (signable) => {
        // Singing functions are passed a signable and need to return a composite signature
        // signable.message is a hex string of what needs to be signed.
        const signature = await this.signProposer(signable);
        return {
          addr: fcl.withPrefix(ADDRESS), // needs to be the same as the account.addr but this time with a prefix, eventually they will both be with a prefix
          keyId: Number(KEY_ID), // needs to be the same as account.keyId, once again make sure its a number and not a string
          signature: signature, // this needs to be a hex string of the signature, where signable.message is the hex value that needs to be signed
        };
      },
    };
  };

  payerAuthFunction = async (account: any = {}) => {
    // authorization function need to return an account
    const payer = await wallet.getPayerAddressAndKeyId();
    const address = fcl.withPrefix(payer.address);
    const ADDRESS = fcl.withPrefix(address);
    // TODO: FIX THIS
    const KEY_ID = payer.keyId;
    return {
      ...account, // bunch of defaults in here, we want to overload some of them though
      tempId: `${ADDRESS}-${KEY_ID}`, // tempIds are more of an advanced topic, for 99% of the times where you know the address and keyId you will want it to be a unique string per that address and keyId
      addr: fcl.sansPrefix(ADDRESS), // the address of the signatory, currently it needs to be without a prefix right now
      keyId: Number(KEY_ID), // this is the keyId for the accounts registered key that will be used to sign, make extra sure this is a number and not a string
      signingFunction: async (signable) => {
        // Singing functions are passed a signable and need to return a composite signature
        // signable.message is a hex string of what needs to be signed.
        const signature = await this.signPayer(signable);
        return {
          addr: fcl.withPrefix(ADDRESS), // needs to be the same as the account.addr but this time with a prefix, eventually they will both be with a prefix
          keyId: Number(KEY_ID), // needs to be the same as account.keyId, once again make sure its a number and not a string
          signature: signature, // this needs to be a hex string of the signature, where signable.message is the hex value that needs to be signed
        };
      },
    };
  };

  signInWithMnemonic = async (mnemonic: string, replaceUser = true, isTemp = true) => {
    const publicPrivateKey: PublicPrivateKeyTuple = isTemp
      ? await seed2PublicPrivateKeyTemp(mnemonic)
      : await seed2PublicPrivateKey(mnemonic);

    const result = await getAccountsByPublicKeyTuple(publicPrivateKey, 'mainnet');
    if (!result) {
      throw new Error('No Address Found');
    }
    const app = getApp(process.env.NODE_ENV!);
    const auth = getAuth(app);
    const idToken = await getAuth(app).currentUser?.getIdToken();
    if (idToken === null || !idToken) {
      signInAnonymously(auth);
      return;
    }

    const rightPaddedHexBuffer = (value, pad) =>
      Buffer.from(value.padEnd(pad * 2, 0), 'hex').toString('hex');
    const USER_DOMAIN_TAG = rightPaddedHexBuffer(Buffer.from('FLOW-V0.0-user').toString('hex'), 32);
    const message = USER_DOMAIN_TAG + Buffer.from(idToken, 'utf8').toString('hex');

    const hashAlgo: number = result[0].hashAlgo;
    const signAlgo: number = result[0].signAlgo;
    const publicKey: string = result[0].publicKey;
    const privateKey: string =
      publicKey === publicPrivateKey.P256.pubK
        ? publicPrivateKey.P256.pk
        : publicPrivateKey.SECP256K1.pk;
    const accountKey = {
      public_key: publicKey,
      hash_algo: hashAlgo,
      sign_algo: hashAlgo,
      weight: result[0].weight,
    };
    const deviceInfo = await this.getDeviceInfo();
    // const signature = await secp.sign(messageHash, privateKey);
    const realSignature = await signWithKey(
      Buffer.from(message, 'hex'),
      signAlgo,
      hashAlgo,
      privateKey
    );
    return wallet.openapi.loginV3(accountKey, deviceInfo, realSignature, replaceUser);
  };

  sigInWithPk = async (privateKey: string, replaceUser = true) => {
    const result = await findAddressWithPK(privateKey, '');
    if (!result) {
      throw new Error('No Address Found');
    }
    const app = getApp(process.env.NODE_ENV!);
    const auth = getAuth(app);
    const idToken = await getAuth(app).currentUser?.getIdToken();
    if (idToken === null || !idToken) {
      signInAnonymously(auth);
      return;
    }

    const rightPaddedHexBuffer = (value, pad) =>
      Buffer.from(value.padEnd(pad * 2, 0), 'hex').toString('hex');
    const USER_DOMAIN_TAG = rightPaddedHexBuffer(Buffer.from('FLOW-V0.0-user').toString('hex'), 32);
    const message = USER_DOMAIN_TAG + Buffer.from(idToken, 'utf8').toString('hex');

    // const messageHash = await secp.utils.sha256(Buffer.from(message, 'hex'));
    const hashAlgo = result[0].hashAlgo;
    const signAlgo = result[0].signAlgo;
    const publicKey = result[0].publicKey;
    const accountKey = {
      public_key: publicKey,
      hash_algo: hashAlgo,
      sign_algo: hashAlgo,
      weight: result[0].weight,
    };
    const deviceInfo = await this.getDeviceInfo();
    // const signature = await secp.sign(messageHash, privateKey);
    const realSignature = await signWithKey(
      Buffer.from(message, 'hex'),
      signAlgo,
      hashAlgo,
      privateKey
    );
    return wallet.openapi.loginV3(accountKey, deviceInfo, realSignature, replaceUser);
  };

  signInv3 = async (mnemonic: string, accountKey: any, deviceInfo: any, replaceUser = true) => {
    const app = getApp(process.env.NODE_ENV!);
    const auth = getAuth(app);
    const idToken = await getAuth(app).currentUser?.getIdToken();
    if (idToken === null || !idToken) {
      signInAnonymously(auth);
      return;
    }

    const rightPaddedHexBuffer = (value, pad) =>
      Buffer.from(value.padEnd(pad * 2, 0), 'hex').toString('hex');
    const USER_DOMAIN_TAG = rightPaddedHexBuffer(Buffer.from('FLOW-V0.0-user').toString('hex'), 32);

    const hex = secp.utils.bytesToHex;
    const message = USER_DOMAIN_TAG + Buffer.from(idToken, 'utf8').toString('hex');

    const messageHash = await secp.utils.sha256(Buffer.from(message, 'hex'));

    const tuple = await seed2PublicPrivateKey(mnemonic);
    const PK1 = tuple.P256.pk;
    const PK2 = tuple.SECP256K1.pk;
    const signAlgo =
      typeof accountKey.signAlgo === 'string'
        ? getSignAlgo(accountKey.signAlgo)
        : accountKey.signAlgo;
    const privateKey = signAlgo === 1 ? PK1 : PK2;

    const publicKey = hex(secp.getPublicKey(privateKey).slice(1));
    if (accountKey.public_key === publicKey) {
      const signature = await secp.sign(messageHash, privateKey);
      const realSignature = secp.Signature.fromHex(signature).toCompactHex();
      return wallet.openapi.loginV3(accountKey, deviceInfo, realSignature, replaceUser);
    } else {
      return false;
    }
  };

  signOutCurrentUser = async () => {
    const app = getApp(process.env.NODE_ENV!);
    const auth = getAuth(app);
    await signInAnonymously(auth);
  };

  getDeviceInfo = async (): Promise<DeviceInfoRequest> => {
    const result = await wallet.openapi.getLocation();
    const installationId = await wallet.openapi.getInstallationId();
    // console.log('location ', userlocation);
    const userlocation = result.data;
    const deviceInfo: DeviceInfoRequest = {
      city: userlocation.city,
      continent: userlocation.country,
      continentCode: userlocation.countryCode,
      country: userlocation.country,
      countryCode: userlocation.countryCode,
      currency: userlocation.countryCode,
      device_id: installationId,
      district: '',
      ip: userlocation.query,
      isp: userlocation.as,
      lat: userlocation.lat,
      lon: userlocation.lon,
      name: 'FRW Chrome Extension',
      org: userlocation.org,
      regionName: userlocation.regionName,
      type: '2',
      user_agent: 'Chrome',
      zip: userlocation.zip,
    };
    return deviceInfo;
  };
}

export default new UserWallet();
