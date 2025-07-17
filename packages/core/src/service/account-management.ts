import * as fcl from '@onflow/fcl';
import type { Account as FclAccount } from '@onflow/typedefs';
import * as bip39 from 'bip39';
import * as ethUtil from 'ethereumjs-util';
import { getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth/web-extension';

import { registerStatusKey } from '@onflow/flow-wallet-data-model/cache-data-keys';
import { FLOW_BIP44_PATH } from '@onflow/flow-wallet-shared/constant/algo-constants';
import {
  HTTP_STATUS_CONFLICT,
  HTTP_STATUS_TOO_MANY_REQUESTS,
} from '@onflow/flow-wallet-shared/constant/domain-constants';
import { type AccountKeyRequest } from '@onflow/flow-wallet-shared/types/network-types';
import { type FlowAddress } from '@onflow/flow-wallet-shared/types/wallet-types';
import { isValidFlowAddress } from '@onflow/flow-wallet-shared/utils/address';

import { preferenceService } from '.';
import googleDriveService from './googleDrive';
import keyringService from './keyring';
import { mixpanelTrack } from './mixpanel';
import openapiService from './openapi';
import userWalletService, {
  addPendingAccountCreationTransaction,
  addPlaceholderAccount,
  removePendingAccountCreationTransaction,
} from './userWallet';
import {
  getAccountKey,
  pubKeyAccountToAccountKey,
  pubKeySignAlgoToAccountKey,
} from '../utils/account-key';
import { setCachedData } from '../utils/data-cache';
import { findAddressWithPK, findAddressWithSeed } from '../utils/modules/findAddressWithPK';
import { getOrCheckAccountsByPublicKeyTuple } from '../utils/modules/findAddressWithPubKey';
import {
  formPubKeyTuple,
  jsonToKey,
  pk2PubKeyTuple,
  seedWithPathAndPhrase2PublicPrivateKey,
} from '../utils/modules/publicPrivateKey';
import { generateRandomId } from '../utils/random-id';

export class accountManagement {
  async registerNewProfile(username: string, password: string, mnemonic: string): Promise<void> {
    // The account is the public key of the account. It's derived from the mnemonic. We do not support custom curves or passphrases for new accounts
    const accountKey: AccountKeyRequest = await getAccountKey(mnemonic);

    // We're booting the keyring with the new password
    // This does not update the vault, it simply sets the password / cypher methods we're going to use to store our private keys in the vault
    await this.verifyPasswordIfBooted(password);
    // We're then registering the account with the public key
    // This calls our backend API which gives us back an account id
    // This register call ALSO sets the currentId in local storage
    // In addition, it will sign us in to the new account with our auth (Firebase) on our backend
    // Note this auth is different to unlocking the wallet with the password.
    await openapiService.register(accountKey, username);

    // We're creating the keyring with the mnemonic. This will encypt the private keys and store them in the keyring vault and deepVault
    await this.createKeyringWithMnemonics(
      accountKey.public_key,
      accountKey.sign_algo,
      password,
      mnemonic
    );
    // Set a two minute cache for the register status
    setCachedData(registerStatusKey(accountKey.public_key), true, 120_000);

    // We're creating the Flow address for the account
    // Only after this, do we have a valid wallet with a Flow address
    const result = (await openapiService.createFlowAddressV2()) as { data: { txid: string } };

    // Add the pending account creation transaction to the user wallet
    await addPendingAccountCreationTransaction('mainnet', accountKey.public_key, result.data.txid);

    // Switch to the new public key
    await userWalletService.setCurrentPubkey(accountKey.public_key);

    // Check for the new address asynchronously
    this.checkForNewAddress('mainnet', accountKey.public_key, result.data.txid);
  }

  async checkForNewAddress(
    network: string,
    pubKey: string,
    txid: string
  ): Promise<FclAccount | null> {
    try {
      const txResult = await fcl.tx(txid).onceSealed();

      // Find the AccountCreated event and extract the address
      const accountCreatedEvent = txResult.events.find(
        (event) => event.type === 'flow.AccountCreated'
      );

      if (!accountCreatedEvent) {
        throw new Error('Account creation event not found in transaction');
      }

      const newAddress = accountCreatedEvent.data.address;

      // Get the account from the new address
      const account = await fcl.account(newAddress);
      if (!account) {
        throw new Error('Fcl account not found');
      }
      // Add the placeholder account to the user wallet
      await addPlaceholderAccount(network, pubKey, txid, account);

      return account;
    } catch (error) {
      // Remove from pending creation transactions on error
      await removePendingAccountCreationTransaction(network, pubKey, txid);

      throw new Error(`Account creation failed: ${(error as Error).message || 'Unknown error'}`);
    }
  }

  async importAccountFromMobile(
    address: string,
    password: string,
    mnemonic: string
  ): Promise<void> {
    // Verify password
    await this.verifyPasswordIfBooted(password);
    // Switch to mainnet first as the account is on mainnet
    if ((await userWalletService.getNetwork()) !== 'mainnet') {
      await userWalletService.switchFclNetwork('mainnet');
      await userWalletService.setNetwork('mainnet');
    }
    // Query the account to get the account info befofe we add the key
    const accountInfo = await this.getAccountInfo(address);

    // The account is the public key of the account. It's derived from the mnemonic. We do not support custom curves or passphrases for new accounts
    const accountKey: AccountKeyRequest = await getAccountKey(mnemonic);

    // Login with the new keyring
    await userWalletService.loginWithKeyring();

    // We're creating the keyring with the mnemonic. This will encypt the private keys and store them in the keyring vault and deepVault
    await this.createKeyringWithMnemonics(
      accountKey.public_key,
      accountKey.sign_algo,
      password,
      mnemonic
    );

    // Locally add the key to the account if not there already
    const indexOfKey = accountInfo.keys.findIndex((key) => key.publicKey === accountKey.public_key);
    if (indexOfKey === -1) {
      accountInfo.keys.push({
        index: accountInfo.keys.length,
        publicKey: accountKey.public_key,
        signAlgo: accountKey.sign_algo,
        hashAlgo: accountKey.hash_algo,
        weight: accountKey.weight,
        signAlgoString: accountKey.sign_algo.toString(),
        hashAlgoString: accountKey.hash_algo.toString(),
        sequenceNumber: 0,
        revoked: false,
      });
    }

    setCachedData(registerStatusKey(accountKey.public_key), true, 120_000);

    // Register the account in userWallet
    await userWalletService.registerCurrentPubkey(accountKey.public_key, accountInfo);
  }

  async createNewAccount(network: string): Promise<void> {
    const publickey = await keyringService.getCurrentPublicKey();
    const signAlgo = await keyringService.getCurrentSignAlgo();
    const accountKey = pubKeySignAlgoToAccountKey(publickey, signAlgo);

    const randomTxId = generateRandomId();

    try {
      setCachedData(registerStatusKey(publickey), true, 120_000);

      // Add the pending account creation transaction to the user wallet to show the random txid
      // This is to show the spinner in the UI
      await addPendingAccountCreationTransaction(network, accountKey.public_key, randomTxId);

      const data = (await openapiService.createNewAccount(
        network,
        accountKey.hash_algo,
        accountKey.sign_algo,
        publickey,
        1000
      )) as { status: number; data: { txid: string } };
      if (data.status === HTTP_STATUS_TOO_MANY_REQUESTS) {
        throw new Error('Rate limit exceeded. Please wait at least 2 minutes between requests.');
      }

      if (!data || !data.data || !data.data.txid) {
        throw new Error('Transaction ID not found in response');
      }

      const txid = data.data.txid;

      // Add the pending account creation transaction to the user wallet replacing the random txid
      await addPendingAccountCreationTransaction(network, accountKey.public_key, txid, randomTxId);

      // Check for the new address
      this.checkForNewAddress(network, accountKey.public_key, txid);
    } catch (error) {
      // Remove the pending account creation transaction if the operation fails
      await removePendingAccountCreationTransaction(network, accountKey.public_key, randomTxId);

      // Reset the registration status if the operation fails
      setCachedData(registerStatusKey(publickey), false);

      // Re-throw a more specific error
      throw new Error(`Failed to create manual address. ${(error as Error).message}`);
    }
  }

  async importProfileUsingMnemonic(
    username: string,
    password: string,
    mnemonic: string,
    derivationPath: string = FLOW_BIP44_PATH,
    passphrase: string = ''
  ): Promise<void> {
    // We should be validating the password as the first thing we do
    await this.verifyPasswordIfBooted(password);

    // Get the public key tuple from the mnemonic
    const pubKTuple = formPubKeyTuple(
      await seedWithPathAndPhrase2PublicPrivateKey(mnemonic, derivationPath, passphrase)
    );
    // Check that there are accounts on the network for this public key
    const accounts = await getOrCheckAccountsByPublicKeyTuple(pubKTuple);
    if (accounts.length === 0) {
      throw new Error('Invalid seed phrase');
    }
    // We use the public key from the first account that is returned
    const accountKeyStruct = pubKeyAccountToAccountKey(accounts[0]);
    // Check if the account is registered on our backend (i.e. it's been created in wallet or used previously in wallet)

    const importCheckResult = (await openapiService.checkImport(accountKeyStruct.public_key)) as {
      status: number;
    };
    if (importCheckResult.status === HTTP_STATUS_CONFLICT) {
      // The account has been previously imported, so just sign in with it

      // Sign in with the mnemonic
      await userWalletService.loginWithMnemonic(mnemonic, true, derivationPath, passphrase);
    } else {
      // We have to create a new user on our backend
      // Get the device info so we can do analytics
      const deviceInfo = await userWalletService.getDeviceInfo();
      // Import the account creating a new user on our backend and sign in as the new user
      // TODO: Why can't we just call register here?
      await openapiService.importKey(
        accountKeyStruct,
        deviceInfo,
        username,
        {},
        accounts[0].address
      );
    }

    // Now we can create the keyring with the mnemonic (and path and phrase)
    await this.createKeyringWithMnemonics(
      accountKeyStruct.public_key,
      accountKeyStruct.sign_algo,
      password,
      mnemonic,
      derivationPath,
      passphrase
    );

    // Set the current pubkey in userWallet
    userWalletService.setCurrentPubkey(accountKeyStruct.public_key);
  }

  async importProfileUsingPrivateKey(
    username: string,
    password: string,
    pk: string,
    address: FlowAddress | null = null
  ): Promise<void> {
    // Boot the keyring with the password
    // We should be validating the password as the first thing we do
    await this.verifyPasswordIfBooted(password);
    // Get the public key tuple from the private key
    const pubKTuple = await pk2PubKeyTuple(pk);

    // Check if the public key has any accounts associated with it
    const accounts = await getOrCheckAccountsByPublicKeyTuple(pubKTuple, address);
    if (accounts.length === 0) {
      throw new Error('Invalid private key - no accounts found');
    }

    // We use the public key from the first account that is returned
    const publicKey = accounts[0].publicKey;
    const signAlgo = accounts[0].signAlgo;
    // Check if the account is registered on our backend (i.e. it's been created in wallet or used previously in wallet)
    const importCheckResult = (await openapiService.checkImport(publicKey)) as { status: number };
    if (importCheckResult.status === HTTP_STATUS_CONFLICT) {
      // The account has been previously imported, so just sign in with it

      // Sign in with the private key
      await userWalletService.loginWithPk(pk, true);
    } else {
      // We have to create a new user on our backend
      const accountKeyStruct = pubKeyAccountToAccountKey(accounts[0]);
      // Get the device info so we can do analytics
      const deviceInfo = await userWalletService.getDeviceInfo();
      // Import the account creating a new user on our backend and sign in as the new user
      // TODO: Why can't we just call register here?
      await openapiService.importKey(
        accountKeyStruct,
        deviceInfo,
        username,
        {},
        accounts[0].address
      );
    }
    // Now we can create the keyring with the mnemonic (and path and phrase)
    await this.importPrivateKey(publicKey, signAlgo, password, pk);

    // Set the current pubkey in userWallet
    userWalletService.setCurrentPubkey(publicKey);
  }

  async findAddressWithSeedPhrase(
    seed: string,
    address: string | null = null,
    derivationPath: string = FLOW_BIP44_PATH,
    passphrase: string = ''
  ): Promise<any[]> {
    return await findAddressWithSeed(seed, address, derivationPath, passphrase);
  }

  async findAddressWithPrivateKey(pk: string, address: string): Promise<any> {
    return await findAddressWithPK(pk, address);
  }

  async jsonToPrivateKeyHex(json: string, password: string): Promise<string | null> {
    const pk = await jsonToKey(json, password);
    return pk ? Buffer.from(pk.data()).toString('hex') : null;
  }

  async getAccountInfo(address: string): Promise<FclAccount> {
    if (!isValidFlowAddress(address)) {
      throw new Error('Invalid address');
    }
    return await fcl.account(address);
  }

  async getMainAccountInfo(): Promise<FclAccount> {
    const address = await userWalletService.getParentAddress();

    if (!address) {
      throw new Error('No address found');
    }
    if (!isValidFlowAddress(address)) {
      throw new Error('Invalid address');
    }
    return await fcl.account(address);
  }

  async uploadMnemonicToGoogleDrive(
    mnemonic: string,
    username: string,
    password: string
  ): Promise<void> {
    const isValidMnemonic = bip39.validateMnemonic(mnemonic);
    if (!isValidMnemonic) {
      throw new Error('Invalid mnemonic');
    }
    const app = getApp(process.env.NODE_ENV!);
    const user = await getAuth(app).currentUser;
    try {
      // This would need to be imported from googleDriveService
      await googleDriveService.uploadMnemonicToGoogleDrive(mnemonic, username, user!.uid, password);
      mixpanelTrack.track('multi_backup_created', {
        address: (await userWalletService.getCurrentAddress()) || '',
        providers: ['GoogleDrive'],
      });
    } catch {
      mixpanelTrack.track('multi_backup_creation_failed', {
        address: (await userWalletService.getCurrentAddress()) || '',
        providers: ['GoogleDrive'],
      });
    }
  }

  async verifyPasswordIfBooted(password: string): Promise<void> {
    if (await keyringService.isBooted()) {
      await keyringService.verifyPassword(password);
    }
  }

  async createKeyringWithMnemonics(
    publicKey: string,
    signAlgo: number,
    password: string,
    mnemonic: string,
    derivationPath = FLOW_BIP44_PATH,
    passphrase = ''
  ): Promise<any> {
    await keyringService.clearCurrentKeyring();
    const keyring = await keyringService.createKeyringWithMnemonics(
      publicKey,
      signAlgo,
      password,
      mnemonic,
      derivationPath,
      passphrase
    );
    return this._setCurrentAccountFromKeyring(keyring);
  }

  importPrivateKey = async (publicKey: string, signAlgo: number, password: string, pk: string) => {
    const privateKey = ethUtil.stripHexPrefix(pk);
    const buffer = Buffer.from(privateKey, 'hex');

    const error = new Error('the private key is invalid');
    try {
      if (!ethUtil.isValidPrivate(buffer)) {
        throw error;
      }
    } catch {
      throw error;
    }

    const keyring = await keyringService.importPrivateKey(
      publicKey,
      signAlgo,
      password,
      privateKey
    );
    return this._setCurrentAccountFromKeyring(keyring);
  };

  async _setCurrentAccountFromKeyring(keyring: any, index = 0) {
    const accounts = keyring.getAccountsWithBrand
      ? await keyring.getAccountsWithBrand()
      : await keyring.getAccounts();
    const account = accounts[index < 0 ? index + accounts.length : index];

    if (!account) {
      throw new Error('the current account is empty');
    }

    const _account = {
      address: typeof account === 'string' ? account : account.address,
      type: keyring.type,
      brandName: typeof account === 'string' ? keyring.type : account.brandName,
    };
    preferenceService.setCurrentAccount(_account);

    return [_account];
  }
}

export default new accountManagement();
