import * as fcl from '@onflow/fcl';
import type { Account as FclAccount } from '@onflow/typedefs';
import * as bip39 from 'bip39';
import * as ethUtil from 'ethereumjs-util';

import {
  userMetadataKey,
  mainAccountsKey,
  registerStatusKey,
  type UserMetadataStore,
  getValidData,
  setCachedData,
} from '@/data-model';
import {
  FLOW_BIP44_PATH,
  HTTP_STATUS_CONFLICT,
  HTTP_STATUS_TOO_MANY_REQUESTS,
} from '@/shared/constant';
import type {
  AccountKeyRequest,
  UserInfoResponse,
  MainAccount,
  FlowAddress,
  ProfileBackupStatus,
} from '@/shared/types';
import {
  isValidFlowAddress,
  isValidEthereumAddress,
  consoleError,
  getErrorMessage,
} from '@/shared/utils';

import { authenticationService, preferenceService } from '.';
import { analyticsService } from './analytics';
import googleDriveService from './googleDrive';
import keyringService, { type Keyring } from './keyring';
import openapiService from './openapi';
import userInfoService from './user';
import userWalletService, {
  addPendingAccountCreationTransaction,
  addPlaceholderAccount,
  removePendingAccountCreationTransaction,
} from './userWallet';
import {
  getAccountKey,
  pubKeyAccountToAccountKey,
  pubKeySignAlgoToAccountKey,
  formPubKeyTuple,
  jsonToKey,
  pk2PubKeyTuple,
  seedWithPathAndPhrase2PublicPrivateKey,
  generateRandomId,
} from '../utils';
import { returnCurrentProfileId } from '../utils/current-id';
import { findAddressWithPK, findAddressWithSeed } from '../utils/modules/findAddressWithPK';
import { getOrCheckAccountsByPublicKeyTuple } from '../utils/modules/findAddressWithPubKey';

export class AccountManagement {
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
  /**
   * Remove a profile and its associated keys
   * If it's the last profile, it behaves like a wallet reset
   *
   * @param {string} password - The keyring controller password
   * @param {string} profileId - The ID of the profile to remove
   * @returns {Promise<boolean>} - Returns true if successful
   */
  removeProfile = async (password: string, profileId: string): Promise<boolean> => {
    // Remove the profile
    await keyringService.removeProfile(password, profileId);
    // Switch to the profile with currentid
    const currentId = await returnCurrentProfileId();
    if (!currentId) {
      // Lock the wallet
      await userWalletService.logoutCurrentUser();
    } else {
      await this.switchProfile(currentId);
    }
    return true;
  };

  /**
   * Switch the wallet profile to a different profile
   * @param id - The id of the keyring to switch to.
   */
  switchProfile = async (id: string) => {
    try {
      await keyringService.switchKeyring(id);
      // Login with the new keyring
      await userWalletService.loginWithKeyring();
    } catch (error) {
      throw new Error('Failed to switch account: ' + getErrorMessage(error));
    }
  };

  /**
   * Check for a new address in the transaction
   * @param network - The network to check for a new address
   * @param pubKey - The public key to check for a new address
   * @param txid - The transaction id to check for a new address
   */
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

    // Login to the account - it should already be registered by the mobile app
    await userWalletService.loginWithMnemonic(mnemonic, true);

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
  ) {
    return await findAddressWithSeed(seed, address, derivationPath, passphrase);
  }

  async findAddressWithPrivateKey(pk: string, address: string) {
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
    const auth = authenticationService.getAuth();
    const user = await auth.currentUser;
    try {
      // This would need to be imported from googleDriveService
      await googleDriveService.uploadMnemonicToGoogleDrive(mnemonic, username, user!.uid, password);
      analyticsService.track('multi_backup_created', {
        address: (await userWalletService.getCurrentAddress()) || '',
        providers: ['GoogleDrive'],
      });
    } catch {
      analyticsService.track('multi_backup_creation_failed', {
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
  ) {
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
    // TODO: TB July 2025 - this is deprecated, we should remove it
    return this._setCurrentAccountFromKeyring(keyring);
  };
  /**
   * @deprecated don't use this
   */
  private async _setCurrentAccountFromKeyring(keyring: Keyring, index = 0) {
    const accounts = await keyring.getAccounts();
    const account = accounts[index < 0 ? index + accounts.length : index];

    if (!account) {
      throw new Error('the current account is empty');
    }

    const _account = {
      address: account,
      type: keyring.type,
      brandName: keyring.type,
    };
    preferenceService.setCurrentAccount(_account);

    return [_account];
  }

  /**
   * Get profile backup statuses for password change operation
   * @param currentPassword - The current password to test decryption
   * @returns Promise<ProfileBackupStatus[]> - Array of profile backup statuses
   */
  async getProfileBackupStatuses(currentPassword: string): Promise<ProfileBackupStatus[]> {
    try {
      // Get all backups from Google Drive
      const backupLists = await googleDriveService.loadBackupAccountLists();
      // Get all active profiles
      const userList = userInfoService.getUserList();

      // Get all keyring ids
      const keyringIds = await keyringService.getAllKeyringIds();

      // Determine active profiles from the keyring ids
      const activeProfiles = keyringIds.map((id): UserInfoResponse => {
        const matchingUser = userList.find((user) => user.id === id);
        if (!matchingUser) {
          return {
            username: `unknown_${id.slice(0, 4)}`,
            id: id,
            avatar: '',
            nickname: 'unknown',
            private: 0,
            created: '',
          };
        }
        return matchingUser;
      });

      // Test decryption for each backup
      const backupStatuses: ProfileBackupStatus[] = await Promise.all(
        backupLists.map(async (backup) => {
          const matchingProfile = activeProfiles.find(
            (profile) => profile.username === backup.username
          );
          const isActive = !!matchingProfile;
          let canDecrypt = false;

          try {
            // Attempt to decrypt with current password
            canDecrypt = await googleDriveService.testProfileBackupDecryption(
              backup.username,
              currentPassword
            );
          } catch (err) {
            consoleError(`Cannot decrypt backup for ${backup.username}`, err);
          }

          return {
            username: backup.username,
            uid: backup.uid,
            id: matchingProfile?.id || '',
            isActive,
            isBackedUp: true,
            canDecrypt,
            isSelected: canDecrypt, // Pre-select those we can decrypt
          };
        })
      );

      // Add active profiles that aren't backed up
      activeProfiles.forEach((profile) => {
        if (!backupStatuses.some((status) => status.username === profile.username)) {
          backupStatuses.push({
            username: profile.username,
            uid: null,
            id: profile.id,
            isActive: true,
            isBackedUp: false,
            canDecrypt: false,
            isSelected: false,
          });
        }
      });

      return backupStatuses;
    } catch (err) {
      consoleError('Failed to get profile backup statuses:', err);
      throw new Error('Failed to get profile backup statuses');
    }
  }

  /**
   * Change password with selective profile backup updates
   * @param currentPassword - The current password
   * @param newPassword - The new password
   * @param selectedProfiles - List of profile usernames to update backups for
   * @param ignoreBackupsAtUsersOwnRisk - Whether to ignore backups (for users without Google permission)
   * @returns Promise<boolean> - Success status
   */
  async changePassword(
    currentPassword: string,
    newPassword: string,
    selectedProfiles: string[] = [],
    ignoreBackupsAtUsersOwnRisk: boolean = false
  ): Promise<boolean> {
    try {
      // If ignoring backups, just change the wallet password
      if (ignoreBackupsAtUsersOwnRisk) {
        return await keyringService.changePassword(currentPassword, newPassword);
      }

      // Handle Google backups if we have Google permission
      const hasGooglePermission = await googleDriveService.hasGooglePermission();

      if (hasGooglePermission && selectedProfiles.length > 0) {
        // First update the Google backups
        await googleDriveService.setNewPassword(currentPassword, newPassword, selectedProfiles);

        // Only change the keyring password if the backup update succeeds
        const success = await keyringService.changePassword(currentPassword, newPassword);

        if (!success) {
          throw new Error('Failed to change wallet password after updating backups');
        }

        // Track successful password change
        analyticsService.track('password_updated', {
          address: (await userWalletService.getCurrentAddress()) || '',
          success: true,
          profilesUpdated: selectedProfiles.length,
        });

        return true;
      } else {
        // No backups to update, just change the wallet password
        const success = await keyringService.changePassword(currentPassword, newPassword);

        if (success) {
          // Track successful password change
          analyticsService.track('password_updated', {
            address: (await userWalletService.getCurrentAddress()) || '',
            success: true,
            profilesUpdated: 0,
          });
        }

        return success;
      }
    } catch (err) {
      consoleError('Error changing password with backups:', err);
      analyticsService.track('password_update_failed', {
        address: (await userWalletService.getCurrentAddress()) || '',
        error: (err as Error).message,
      });
      throw err;
    }
  }

  /**
   * Update account metadata (emoji, name, background color) via openapi API
   */
  async updateAccountMetadata(address: string, icon: string, name: string, background: string) {
    console.log('updateAccountMetadata', address, icon, name, background);
    const result = await openapiService.updateAccountMetadata(address, icon, name, background);

    // Update the metadata cache after successful update
    try {
      const currentPubKey = userWalletService.getCurrentPubkey();
      const cacheKey = userMetadataKey(currentPubKey);

      // Get existing metadata from cache
      const existingMetadata = (await getValidData<UserMetadataStore>(cacheKey)) || {};
      const updatedMetadata = {
        ...existingMetadata,
        [address]: {
          background,
          icon,
          name,
        },
      };

      // Update the cache with new metadata
      await setCachedData(cacheKey, updatedMetadata, 300_000);

      // Update the specific account in the main accounts cache
      try {
        const network = await userWalletService.getNetwork();
        const accountsCacheKey = mainAccountsKey(network, currentPubKey);
        const existingMainAccounts = await getValidData<MainAccount[]>(accountsCacheKey);

        if (existingMainAccounts && Array.isArray(existingMainAccounts)) {
          const updatedMainAccounts = existingMainAccounts.map((account) => {
            if (account.address === address) {
              return {
                ...account,
                name: name,
                icon: icon,
                color: background,
              };
            }
            if (
              account.eoaAccount &&
              isValidEthereumAddress(address) &&
              account.eoaAccount.address === address
            ) {
              return {
                ...account,
                eoaAccount: {
                  ...account.eoaAccount,
                  name: name,
                  icon: icon,
                  color: background,
                },
              };
            }
            //Update evmAccount if the address is a valid EVM address
            if (
              account.evmAccount &&
              isValidEthereumAddress(address) &&
              account.evmAccount.address === address
            ) {
              return {
                ...account,
                evmAccount: {
                  ...account.evmAccount,
                  name: name,
                  icon: icon,
                  color: background,
                },
              };
            }
            return account;
          });

          await setCachedData(accountsCacheKey, updatedMainAccounts, 60_000);
        }
      } catch (updateError) {
        consoleError('Failed to update main accounts cache:', updateError);
      }
    } catch (error) {
      consoleError('Failed to update metadata cache:', error);
    }

    return result;
  }
}

export default new AccountManagement();
