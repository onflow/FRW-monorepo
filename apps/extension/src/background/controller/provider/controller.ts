import { EthSigner, BIP44_PATHS, type EthLegacyTransaction } from '@onflow/frw-wallet';
import BigNumber from 'bignumber.js';
import { ethErrors } from 'eth-rpc-errors';
import { intToHex } from 'ethereumjs-util';
import { ethers } from 'ethers';
import Web3 from 'web3';

import BaseController from '@/background/controller/base';
import Wallet from '@/background/controller/wallet';
import {
  keyringService,
  permissionService,
  sessionService,
  signTextHistoryService,
} from '@/core/service';
import walletManager from '@/core/service/wallet-manager';
import { seedWithPathAndPhrase2PublicPrivateKey } from '@/core/utils';
import { EVM_ENDPOINT, MAINNET_CHAIN_ID, TESTNET_CHAIN_ID } from '@/shared/constant';
import { ensureEvmAddressPrefix, isValidEthereumAddress, consoleError } from '@/shared/utils';
// Import EthSigner directly from the services

import notificationService from '../notification';

interface Web3WalletPermission {
  // The name of the method corresponding to the permission
  parentCapability: string;

  // The date the permission was granted, in UNIX epoch time
  date?: number;
}

/**
 * Converts a hex private key string to Uint8Array format for eth-signer
 * @param privateKeyHex - The private key as a hex string
 * @returns The private key as Uint8Array
 */
function privateKeyToUint8Array(privateKeyHex: string): Uint8Array {
  // Remove 0x prefix if present
  const cleanHex = privateKeyHex.replace(/^0x/i, '');
  // Convert to Uint8Array
  return Uint8Array.from(Buffer.from(cleanHex, 'hex'));
}

/**
 * Derives Ethereum address from private key
 * @param privateKeyHex - The private key as a hex string
 * @returns The Ethereum address
 */
function deriveEthereumAddress(privateKeyHex: string): string {
  const { privateToAddress } = require('ethereumjs-util');
  const cleanHex = privateKeyHex.replace(/^0x/i, '');
  const privateKeyBuffer = Buffer.from(cleanHex, 'hex');
  const addressBuffer = privateToAddress(privateKeyBuffer);
  return '0x' + addressBuffer.toString('hex');
}

/**
 * Gets the Ethereum private key using EVM BIP44 path
 * @returns The Ethereum private key as hex string
 */
async function getEthereumPrivateKey(): Promise<string> {
  // Get the mnemonic from the keyring
  const mnemonic = await keyringService.getMnemonicFromKeyring();
  if (!mnemonic) {
    throw new Error('Mnemonic not found in keyring');
  }

  // Derive the private key using EVM BIP44 path
  const evmPrivateKeyTuple = await seedWithPathAndPhrase2PublicPrivateKey(
    mnemonic,
    BIP44_PATHS.EVM,
    ''
  );

  // Extract the secp256k1 private key (Ethereum)
  const ethereumPrivateKey = evmPrivateKeyTuple.SECP256K1.pk;

  if (!ethereumPrivateKey) {
    throw new Error('Ethereum private key not found in EVM derivation');
  }

  return ethereumPrivateKey;
}

async function signTypeData(typedData: Record<string, unknown>) {
  // Get the Ethereum private key using EVM BIP44 path
  const ethereumPrivateKey = await getEthereumPrivateKey();
  const privateKeyBytes = privateKeyToUint8Array(ethereumPrivateKey);

  // Use eth-signer to sign the typed data
  const { signature, digest } = await EthSigner.signTypedData(privateKeyBytes, typedData);

  return signature;
}

class ProviderController extends BaseController {
  ethRpc = async (data): Promise<any> => {
    const network = await Wallet.getNetwork(); // Get the current network
    const provider = new Web3.providers.HttpProvider(EVM_ENDPOINT[network]);
    const web3Instance = new Web3(provider);

    return new Promise((resolve, reject) => {
      if (!web3Instance.currentProvider) {
        consoleError('Provider is undefined');
        return;
      }

      web3Instance.currentProvider.send(
        {
          jsonrpc: '2.0',
          method: data.method,
          params: data.params,
          id: new Date().getTime(),
        },
        (err, response) => {
          if (err) {
            consoleError('Error:', err);
            reject(err);
          } else {
            resolve(response);
          }
        }
      );
    });
  };

  ethRequestAccounts = async ({ session: { origin, name, icon } }) => {
    if (!permissionService.hasPermission(origin) || !(await Wallet.isUnlocked())) {
      const { defaultChain, signPermission } = await notificationService.requestApproval(
        {
          params: { origin, name, icon },
          approvalComponent: 'EthConnect',
        },
        { height: 599 }
      );
      permissionService.addConnectedSite(origin, name, icon, defaultChain);
    }

    let evmAddress: string;
    try {
      // Get EOA address from walletManager
      const eoaInfo = await walletManager.getEOAAccountInfo();

      if (!eoaInfo || !eoaInfo.address || !isValidEthereumAddress(eoaInfo.address)) {
        throw new Error('Invalid EOA address from walletManager');
      }
      evmAddress = eoaInfo.address;
    } catch (error) {
      // If an error occurs, request approval
      consoleError('ethRequestAccounts - Error getting EOA address from walletManager:', error);

      await notificationService.requestApproval(
        {
          params: { origin, name, icon },
          approvalComponent: 'EthConnect',
        },
        { height: 599 }
      );

      // Try again after approval
      const eoaInfo = await walletManager.getEOAAccountInfo();
      if (!eoaInfo || !eoaInfo.address || !isValidEthereumAddress(eoaInfo.address)) {
        throw new Error('Invalid EOA address from walletManager');
      }
      evmAddress = eoaInfo.address;
    }

    const account = evmAddress ? [ensureEvmAddressPrefix(evmAddress)] : [];

    sessionService.broadcastEvent('accountsChanged', account);
    return account;
  };

  ethEstimateGas = async ({ data }) => {
    const network = await Wallet.getNetwork();
    const url = EVM_ENDPOINT[network];
    const provider = new ethers.JsonRpcProvider(url);
    const gas = await provider.estimateGas({
      from: data.params[0].from,
      // Wrapped ETH address
      to: data.params[0].to,
      gasPrice: data.params[0].gasPrice,
      data: data.params[0].data,
      // 1 ether
      value: data.params[0].value,
    });
    return '0x' + gas.toString(16);
  };

  ethSendTransaction = async (data) => {
    if (!data || !data.data || !data.data.params || !data.data.params.length) {
      consoleError('Invalid data structure');
      return null;
    }

    // Accessing the first item in 'params' array
    const transactionParams = data.data.params[0];

    // Extracting individual parameters
    const from = transactionParams.from || '';
    const to = transactionParams.to || '';
    const value = transactionParams.value || '0x0';
    const dataValue = transactionParams.data || '0x';
    const gas = transactionParams.gas || '0x1C9C380';
    const gasPrice = transactionParams.gasPrice || '0x0';

    // Get the current nonce from the network
    const nonce = await this.getTransactionCount(from);
    try {
      // Get the Ethereum private key using EVM BIP44 path
      const ethereumPrivateKey = await getEthereumPrivateKey();
      const privateKeyBytes = privateKeyToUint8Array(ethereumPrivateKey);

      // Get the current chain ID
      const network = await Wallet.getNetwork();
      const chainId = network === 'testnet' ? TESTNET_CHAIN_ID : MAINNET_CHAIN_ID;

      // Create the transaction object
      const transaction: EthLegacyTransaction = {
        chainId: chainId,
        nonce: parseInt(nonce, 16),
        gasLimit: gas,
        gasPrice: gasPrice,
        to: to,
        value: value,
        data: dataValue,
      };

      // Sign the transaction using EthSigner
      const signedTransaction = await EthSigner.signTransaction(transaction, privateKeyBytes);

      // Send the raw transaction to the network
      const result = await this.sendRawTransaction(signedTransaction.rawTransaction);

      // Send message to close approval popup after successful transaction
      chrome.runtime.sendMessage({
        type: 'CLOSE_APPROVAL_POPUP',
        data: { success: true, result },
      });

      return result;
    } catch (error) {
      chrome.runtime.sendMessage({
        type: 'CLOSE_APPROVAL_POPUP',
        data: { success: false, error: error.message },
      });
      throw error;
    }
  };

  /**
   * Get the current transaction count (nonce) for an address
   */
  private async getTransactionCount(address: string): Promise<string> {
    const network = await Wallet.getNetwork();
    const provider = new Web3.providers.HttpProvider(EVM_ENDPOINT[network]);
    const web3Instance = new Web3(provider);

    return new Promise((resolve, reject) => {
      if (!web3Instance.currentProvider) {
        reject(new Error('Provider is undefined'));
        return;
      }

      web3Instance.currentProvider.send(
        {
          jsonrpc: '2.0',
          method: 'eth_getTransactionCount',
          params: [address, 'latest'],
          id: Date.now(),
        },
        (error, response) => {
          if (error) {
            reject(error);
          } else if (response && 'error' in response && response.error) {
            reject(new Error(response.error.message || 'Failed to get transaction count'));
          } else if (response && 'result' in response) {
            resolve(response.result as string);
          } else {
            reject(new Error('Invalid response from provider'));
          }
        }
      );
    });
  }

  /**
   * Send a raw signed transaction to the Ethereum network
   */
  private async sendRawTransaction(rawTransaction: string): Promise<string> {
    const network = await Wallet.getNetwork();
    const provider = new Web3.providers.HttpProvider(EVM_ENDPOINT[network]);
    const web3Instance = new Web3(provider);

    return new Promise((resolve, reject) => {
      if (!web3Instance.currentProvider) {
        reject(new Error('Provider is undefined'));
        return;
      }

      web3Instance.currentProvider.send(
        {
          jsonrpc: '2.0',
          method: 'eth_sendRawTransaction',
          params: [rawTransaction],
          id: Date.now(),
        },
        (error, response) => {
          if (error) {
            reject(error);
          } else if (response && 'error' in response && response.error) {
            reject(new Error(response.error.message || 'Transaction failed'));
          } else if (response && 'result' in response) {
            resolve(response.result as string);
          } else {
            reject(new Error('Invalid response from provider'));
          }
        }
      );
    });
  }

  ethAccounts = async ({ session: { origin } }) => {
    if (!permissionService.hasPermission(origin) || !(await Wallet.isUnlocked())) {
      return [];
    }

    let evmAccount: string | undefined;
    try {
      // Get EOA address from walletManager
      const eoaInfo = await walletManager.getEOAAccountInfo();
      evmAccount = eoaInfo?.address;
    } catch (error) {
      // If an error occurs, log it but continue
      consoleError('Error getting EOA address from walletManager:', error);
    }

    const account = evmAccount ? [evmAccount.toLowerCase()] : [];
    try {
      await sessionService.broadcastEvent('accountsChanged', account);
    } catch (error) {
      consoleError('Error broadcasting accountsChanged event:', error);
      // Continue despite the error
    }

    const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

    await delay(200);

    return account;
  };

  walletRequestPermissions = ({ data: { params: permissions } }) => {
    const result: Web3WalletPermission[] = [];
    if (permissions && 'eth_accounts' in permissions[0]) {
      result.push({ parentCapability: 'eth_accounts' });
    }
    return result;
  };

  walletRevokePermissions = async ({ session: { origin }, data: { params } }) => {
    const isUnlocked = await Wallet.isUnlocked();
    if (isUnlocked && Wallet.getConnectedSite(origin)) {
      if (params?.[0] && 'eth_accounts' in params[0]) {
        Wallet.removeConnectedSite(origin);
      }
    }
    return null;
  };

  walletWatchAsset = async ({ data }) => {
    const result = await notificationService.requestApproval(
      {
        params: { data },
        approvalComponent: 'EthSuggest',
      },
      { height: 599 }
    );
    return result;
  };

  walletSwitchEthereumChain = async ({
    data: {
      params: [chainParams],
    },
    session: { origin },
  }) => {
    let chainId = chainParams.chainId;
    const network = await Wallet.getNetwork();
    if (typeof chainId === 'number') {
      chainId = intToHex(chainId).toLowerCase();
    } else {
      chainId = `0x${new BigNumber(chainId).toString(16).toLowerCase()}`;
    }

    switch (chainId) {
      case '0x221': // 545 in decimal corresponds to testnet
        if (network !== 'testnet') {
          await notificationService.requestApproval(
            {
              params: { origin, target: 'testnet' },
              approvalComponent: 'EthSwitch',
            },
            { height: 599 }
          );
        }
        return null;

      case '0x2eb': // 747 in decimal corresponds to mainnet
        if (network !== 'mainnet') {
          await notificationService.requestApproval(
            {
              params: { origin, target: 'mainnet' },
              approvalComponent: 'EthSwitch',
            },
            { height: 599 }
          );
        }
        return null;
      default:
        throw ethErrors.provider.custom({
          code: 4902,
          message: `Unrecognized  ChainId"${chainId}".`,
        });
    }
  };

  personalSign = async ({ data, approvalRes, session }) => {
    if (!data.params) return;
    const [string, from] = data.params;

    try {
      // Get the Ethereum private key using secp256k1 algorithm
      const ethereumPrivateKey = await getEthereumPrivateKey();
      const privateKeyBytes = privateKeyToUint8Array(ethereumPrivateKey);

      // Derive the Ethereum address from the private key
      const ethereumAddress = deriveEthereumAddress(ethereumPrivateKey);

      // Validate that the requested address matches the derived address
      if (from.toLowerCase() !== ethereumAddress.toLowerCase()) {
        throw new Error('Address mismatch');
      }

      // Use eth-signer to sign the personal message
      const { signature, digest } = await EthSigner.signPersonalMessage(privateKeyBytes, string);

      // Create history entry using the derived Ethereum address
      signTextHistoryService.createHistory({
        address: ethereumAddress,
        text: string,
        origin: session.origin,
        type: 'personalSign',
      });

      // Return the signature and the address it was signed with
      // This helps dApps understand which address the signature is valid for
      return signature;
    } catch (error) {
      consoleError('Error in personalSign:', error);
      throw error;
    }
  };

  ethChainId = async ({ session }) => {
    const network = await Wallet.getNetwork();
    if (network === 'testnet') {
      return TESTNET_CHAIN_ID;
    } else {
      return MAINNET_CHAIN_ID;
    }
  };

  signTypeData = async (request) => {
    let address;
    let data;
    let currentChain;

    await notificationService.requestApproval(
      {
        params: request,
        approvalComponent: 'EthSignType',
      },
      { height: 599 }
    );

    const network = await Wallet.getNetwork();
    const eoaInfo = await walletManager.getEOAAccountInfo();
    if (!eoaInfo || !eoaInfo.address) {
      throw new Error('EOA address not found from walletManager');
    }
    const evmaddress = { address: eoaInfo.address };

    if (network === 'testnet') {
      currentChain = TESTNET_CHAIN_ID;
    } else {
      currentChain = MAINNET_CHAIN_ID;
    }

    const paramAddress = request.data.params?.[0] || '';
    if (isValidEthereumAddress(paramAddress)) {
      data = request.data.params[1];
      address = request.data.params[0];
    } else {
      data = request.data.params[0];
      address = request.data.params[1];
    }

    let message;
    try {
      message = typeof data === 'string' ? JSON.parse(data) : data;
    } catch (e) {
      throw new Error('Invalid JSON data provided');
    }
    const { chainId } = message.domain || {};

    if (!chainId || Number(chainId) !== Number(currentChain)) {
      throw new Error('Provided chainId does not match the currently active chain');
    }

    // Potentially shouldn't change the case to compare - we should be checking ERC-55 conformity
    if (
      ensureEvmAddressPrefix(evmaddress!.address.toLowerCase()) !==
      ensureEvmAddressPrefix(address.toLowerCase())
    ) {
      throw new Error('Provided address does not match the current address');
    }

    // Get the Ethereum private key and sign the typed data
    const result = await signTypeData(message);
    signTextHistoryService.createHistory({
      address: address,
      text: data,
      origin: request.session.origin,
      type: 'ethSignTypedDataV4',
    });
    return result;
  };

  signTypeDataV1 = async (request) => {
    let address;
    let data;
    let currentChain;

    await notificationService.requestApproval(
      {
        params: request,
        approvalComponent: 'EthSignV1',
      },
      { height: 599 }
    );

    const network = await Wallet.getNetwork();
    const eoaInfo = await walletManager.getEOAAccountInfo();
    if (!eoaInfo || !eoaInfo.address) {
      throw new Error('EOA address not found from walletManager');
    }
    const evmaddress = { address: eoaInfo.address };

    if (network === 'testnet') {
      currentChain = TESTNET_CHAIN_ID;
    } else {
      currentChain = MAINNET_CHAIN_ID;
    }

    const paramAddress = request.data.params?.[0] ? request.data.params?.[0] : '';

    if (isValidEthereumAddress(paramAddress)) {
      data = request.data.params[1];
      address = request.data.params[0];
    } else {
      data = request.data.params[0];
      address = request.data.params[1];
    }

    let message;
    try {
      message = typeof data === 'string' ? JSON.parse(data) : data;
    } catch (e) {
      throw new Error('Invalid JSON data provided');
    }
    const { chainId } = message.domain || {};

    if (!chainId || Number(chainId) !== Number(currentChain)) {
      throw new Error('Provided chainId does not match the currently active chain');
    }

    // Potentially shouldn't change the case to compare - we should be checking ERC-55 conformity
    if (
      ensureEvmAddressPrefix(evmaddress!.address.toLowerCase()) !==
      ensureEvmAddressPrefix(address.toLowerCase())
    ) {
      throw new Error('Provided address does not match the current address');
    }

    const result = await signTypeData(message);
    signTextHistoryService.createHistory({
      address: address,
      text: data,
      origin: request.session.origin,
      type: 'ethSignTypedDataV1',
    });
    return result;
  };

  ethGetTransactionByHash = async (request) => {
    const result = await this.ethRpc(request.data);
    return result.result;
  };

  ethGetBalance = async (request) => {
    const result = await this.ethRpc(request.data);
    return result.result;
  };

  ethGetCode = async (request) => {
    const result = await this.ethRpc(request.data);
    return result.result;
  };

  ethGasPrice = async (request) => {
    const result = await this.ethRpc(request.data);
    return result.result;
  };

  ethBlockNumber = async (request) => {
    const result = await this.ethRpc(request.data);
    return result.result;
  };

  ethCall = async (request) => {
    const result = await this.ethRpc(request.data);
    return result.result;
  };

  ethGetTransactionReceipt = async (request) => {
    const result = await this.ethRpc(request.data);
    return result.result;
  };

  ethSignTypedData = async (request) => {
    const result = await this.signTypeDataV1(request);
    return result;
  };

  ethSignTypedDataV3 = async (request) => {
    const result = await this.signTypeData(request);
    return result;
  };

  ethSignTypedDataV4 = async (request) => {
    const result = await this.signTypeData(request);
    return result;
  };

  // eth_coinbase - Returns the current account address
  ethCoinbase = async ({ session: { origin } }) => {
    if (!permissionService.hasPermission(origin) || !(await Wallet.isUnlocked())) {
      return null;
    }

    try {
      const eoaInfo = await walletManager.getEOAAccountInfo();
      if (!eoaInfo || !eoaInfo.address) {
        return null;
      }
      return ensureEvmAddressPrefix(eoaInfo.address);
    } catch (error) {
      consoleError('Error getting EOA address for eth_coinbase:', error);
      return null;
    }
  };

  // net_version - Returns the network version
  netVersion = async () => {
    try {
      const network = await Wallet.getNetwork();
      return network === 'mainnet' ? MAINNET_CHAIN_ID : TESTNET_CHAIN_ID;
    } catch (error) {
      consoleError('Error getting network version:', error);
      return MAINNET_CHAIN_ID; // Default to mainnet version
    }
  };

  // eth_sign - Signs arbitrary data (different from personal_sign)
  ethSign = async ({ data, approvalRes, session }) => {
    if (!data.params) return;
    const [address, message] = data.params;

    try {
      // Get the Ethereum private key using secp256k1 algorithm
      const ethereumPrivateKey = await getEthereumPrivateKey();
      const privateKeyBytes = privateKeyToUint8Array(ethereumPrivateKey);

      // Derive the Ethereum address from the private key
      const ethereumAddress = deriveEthereumAddress(ethereumPrivateKey);

      // Validate that the requested address matches the derived address
      if (address.toLowerCase() !== ethereumAddress.toLowerCase()) {
        throw new Error('Address mismatch');
      }

      // eth_sign signs the raw message hash (32 bytes), not prefixed like personal_sign
      // Convert message to bytes and hash it
      const messageBytes =
        typeof message === 'string'
          ? message.startsWith('0x')
            ? Buffer.from(message.slice(2), 'hex')
            : Buffer.from(message, 'utf8')
          : Buffer.from(message);

      // Hash the message using keccak256
      const messageHash = ethers.keccak256(messageBytes);

      // Sign the hash using eth-signer
      const { signature } = await EthSigner.signPersonalMessage(privateKeyBytes, messageHash);

      // Create history entry
      signTextHistoryService.createHistory({
        address: ethereumAddress,
        text: message,
        origin: session.origin,
        type: 'ethSign',
      });

      return signature;
    } catch (error) {
      consoleError('Error in ethSign:', error);
      throw error;
    }
  };

  // personal_ecRecover - Recovers the address from a signature
  personalEcRecover = async ({ data }) => {
    if (!data.params) return;
    const [message, signature] = data.params;

    try {
      // Use ethers to recover the address from the signature
      // ethers.utils.recoverAddress handles the personal message prefix automatically
      const recoveredAddress = ethers.verifyMessage(message, signature);
      return recoveredAddress;
    } catch (error) {
      consoleError('Error in personal_ecRecover:', error);
      throw error;
    }
  };
}

export default new ProviderController();
