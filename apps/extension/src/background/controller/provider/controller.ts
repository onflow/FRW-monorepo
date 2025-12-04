import { ServiceContext } from '@onflow/frw-context';
import { EthSigner, type EthUnsignedTransaction } from '@onflow/frw-wallet';
import BigNumber from 'bignumber.js';
import { ethErrors } from 'eth-rpc-errors';
import { intToHex } from 'ethereumjs-util';
import { ethers } from 'ethers';
import RLP from 'rlp';
import Web3 from 'web3';

import BaseController from '@/background/controller/base';
import Wallet from '@/background/controller/wallet';
import { initializePlatform } from '@/bridge/PlatformImpl';
import {
  keyringService,
  permissionService,
  sessionService,
  signTextHistoryService,
  userWalletService,
} from '@/core/service';
import walletManager from '@/core/service/wallet-manager';
import { getAccountsByPublicKeyTuple, signWithKey } from '@/core/utils';
import { EVM_ENDPOINT, MAINNET_CHAIN_ID, TESTNET_CHAIN_ID } from '@/shared/constant';
import type { FlowChainId } from '@/shared/types/network-types';
import type {
  COAOwnershipProof,
  EIP712TypedData,
  EthConnectApprovalResult,
  TransactionParams,
  Web3WalletPermission,
} from '@/shared/types/provider-types';
import {
  tupleToPrivateKey,
  ensureEvmAddressPrefix,
  isValidEthereumAddress,
  consoleError,
} from '@/shared/utils';
import { networkToChainId } from '@/shared/utils/network-utils';

import notificationService from '../notification';

// ============================================================================
// COA Helper Functions
// ============================================================================

function removeHexPrefix(hexString: string): string {
  return hexString.startsWith('0x') ? hexString.substring(2) : hexString;
}

function toHexString(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
}

function createAndEncodeCOAOwnershipProof(
  keyIndices: bigint[],
  address: Uint8Array,
  capabilityPath: string,
  signatures: Uint8Array[]
): Uint8Array {
  const proof: COAOwnershipProof = {
    keyIndices,
    address,
    capabilityPath,
    signatures,
  };
  const encodedData = RLP.encode([
    keyIndices,
    proof.address,
    Buffer.from(proof.capabilityPath, 'utf8'),
    proof.signatures,
  ]);

  return encodedData;
}

/**
 * Gets the matching account and signing information for the current wallet
 * @returns Object containing account details and signing information
 */
async function getSigningDetailsForCurrentWallet() {
  const network = await Wallet.getNetwork();
  const privateKeyTuple = await keyringService.getCurrentPublicPrivateKeyTuple();

  // Find any account with public key information
  const accounts = await getAccountsByPublicKeyTuple(privateKeyTuple, network);

  const addressHex = await Wallet.getParentAddress();
  const matchingAccount = accounts.find((account) => account.address === addressHex);

  if (!matchingAccount) {
    throw new Error('Current wallet not found in accounts');
  }

  // Get the private key from the private key tuple
  const privateKey = tupleToPrivateKey(privateKeyTuple, matchingAccount.signAlgo);
  const hashAlgo = matchingAccount.hashAlgo;
  const signAlgo = matchingAccount.signAlgo;
  const keyIndex = matchingAccount.keyIndex;

  return {
    addressHex,
    privateKey,
    hashAlgo,
    signAlgo,
    keyIndex,
  };
}

/**
 * Common signing logic used by both message and typed data signing for COA
 * @param dataToSign The prepared data to sign
 * @returns The encoded proof as a hex string
 */
async function createSignatureProof(dataToSign: string) {
  if (!(await Wallet.isUnlocked())) {
    throw new Error('Wallet is locked');
  }

  const rightPaddedHexBuffer = (value: string, pad: number) =>
    Buffer.from(value.padEnd(pad * 2, '0'), 'hex');

  const USER_DOMAIN_TAG = rightPaddedHexBuffer(
    Buffer.from('FLOW-V0.0-user').toString('hex'),
    32
  ).toString('hex');

  const prependUserDomainTag = (msg: string) => USER_DOMAIN_TAG + msg;
  const signableData = prependUserDomainTag(removeHexPrefix(dataToSign));

  // Retrieve the private key from the wallet
  const { addressHex, privateKey, hashAlgo, signAlgo, keyIndex } =
    await getSigningDetailsForCurrentWallet();
  if (!addressHex) {
    throw new Error('Current wallet not found');
  }

  const signature = await signWithKey(signableData, signAlgo, hashAlgo, privateKey);

  const addressBuffer = Buffer.from(addressHex.slice(2), 'hex');
  const addressArray = Uint8Array.from(addressBuffer);

  const encodedProof = createAndEncodeCOAOwnershipProof([BigInt(keyIndex)], addressArray, 'evm', [
    Uint8Array.from(Buffer.from(signature, 'hex')),
  ]);

  return '0x' + toHexString(encodedProof);
}

/**
 * COA message signing function
 */
async function signMessageCOA(msgParams: { data: string; from: string }) {
  const web3 = new Web3();
  const textData = msgParams.data;
  const hashedData = web3.eth.accounts.hashMessage(textData);
  return createSignatureProof(hashedData);
}

/**
 * COA typed data signing function
 */
async function signTypeDataCOA(msgParams: Buffer | string) {
  const hashedData = Buffer.from(msgParams).toString('hex');
  return createSignatureProof(hashedData);
}

// ============================================================================
// EOA Helper Functions
// ============================================================================

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
 * EOA typed data signing function
 */
async function signTypeDataEOA(typedData: Record<string, unknown>) {
  // Get the Ethereum private key using EVM BIP44 path
  const ethereumPrivateKey = await Wallet.getEthereumPrivateKey();
  const privateKeyBytes = Wallet.privateKeyToUint8Array(ethereumPrivateKey);

  // Use eth-signer to sign the typed data
  const { signature } = await EthSigner.signTypedData(privateKeyBytes, typedData);

  return signature;
}

// ============================================================================
// Shared Utility Functions
// ============================================================================

const SignTypedDataVersion = {
  V1: 'V1',
  V3: 'V3',
  V4: 'V4',
} as const;

export const TypedDataUtils = {
  eip712Hash(message: EIP712TypedData, _version: string): Buffer {
    const types = { ...message.types };
    delete types.EIP712Domain;

    const primaryType = message.primaryType || 'OrderComponents';

    const encoder = new ethers.TypedDataEncoder({
      [primaryType]: types[primaryType],
      ...types,
    });

    const domainSeparator = ethers.TypedDataEncoder.hashDomain(message.domain);
    const hashStruct = encoder.hash(message.message);

    const encodedData = ethers.concat([
      Buffer.from('1901', 'hex'),
      Buffer.from(domainSeparator.slice(2), 'hex'),
      Buffer.from(hashStruct.slice(2), 'hex'),
    ]);

    return Buffer.from(ethers.keccak256(encodedData).slice(2), 'hex');
  },
};

/**
 * Checks if an address is a COA or EOA
 * @param address - The address to check
 * @returns true if COA, false if EOA
 */
async function isCOAAddress(address: string): Promise<boolean> {
  try {
    // Get EOA address
    const eoaInfo = await walletManager.getEOAAccountInfo();
    if (eoaInfo?.address && address.toLowerCase() === eoaInfo.address.toLowerCase()) {
      return false;
    }

    // Get COA address
    const parentAddress = await Wallet.getParentAddress();
    if (parentAddress) {
      const coaAccount = await userWalletService.getEvmAccountOfParent(parentAddress);
      if (coaAccount?.address && address.toLowerCase() === coaAccount.address.toLowerCase()) {
        return true;
      }
    }

    return false;
  } catch (error) {
    consoleError('Error checking if address is COA:', error);
    return false;
  }
}

class ProviderController extends BaseController {
  private async initializeServiceContext() {
    if (!ServiceContext.isInitialized()) {
      // Import the platform implementation dynamically to avoid circular dependencies
      const platform = initializePlatform();
      // Ensure wallet controller is set on the platform
      platform.setWalletController(Wallet);
      // Initialize ServiceContext with the platform
      ServiceContext.initialize(platform);
    }
  }

  /**
   * Convert hex string to byte array for eoaCallContract
   * @param hexString - Hex string to convert
   * @returns Array of bytes
   */
  private convertHexToByteArray(hexString: string): number[] {
    if (hexString.startsWith('0x')) {
      hexString = hexString.slice(2);
    }
    const dataArray = new Uint8Array(hexString.length / 2);
    for (let i = 0; i < hexString.length; i += 2) {
      dataArray[i / 2] = parseInt(hexString.substr(i, 2), 16);
    }
    const regularArray = Array.from(dataArray);
    return regularArray;
  }

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

  // ========================================================================
  // Account Management Methods
  // ========================================================================

  ethRequestAccounts = async ({ session: { origin, name, icon } }) => {
    let approvalResult: EthConnectApprovalResult | undefined;
    let selectedEvmAddress: string | undefined;

    // Request approval if wallet is locked or no permission
    // This allows user to select account
    if (!permissionService.hasPermission(origin) || !(await Wallet.isUnlocked())) {
      approvalResult = await notificationService.requestApproval(
        {
          params: { origin, name, icon },
          approvalComponent: 'EthConnect',
        },
        { height: 599 }
      );
      if (approvalResult) {
        const { defaultChain, evmAddress } = approvalResult;
        // Convert string network to FlowChainId if needed
        const chainId: FlowChainId | undefined = defaultChain
          ? typeof defaultChain === 'string'
            ? networkToChainId(defaultChain)
            : defaultChain
          : undefined;
        // Store the selected EVM address in the permission
        permissionService.addConnectedSite(origin, name, icon, chainId, false, evmAddress);

        // Priority 1: Use the selected EVM address from the approval result
        if (evmAddress && isValidEthereumAddress(evmAddress)) {
          selectedEvmAddress = evmAddress;
        }
      }
    }

    let evmAddress: string;

    // Priority 1: Use address from approval result if available
    if (selectedEvmAddress) {
      evmAddress = selectedEvmAddress;
    } else {
      // Priority 2: Check if there's a stored EVM address for this origin
      const connectedSite = permissionService.getConnectedSite(origin);
      if (connectedSite?.evmAddress && isValidEthereumAddress(connectedSite.evmAddress)) {
        evmAddress = connectedSite.evmAddress;
      } else {
        // Priority 3: Check if current address is an EVM address
        try {
          const currentAddress = await Wallet.getCurrentAddress();

          if (currentAddress && isValidEthereumAddress(currentAddress)) {
            evmAddress = currentAddress;
            // Store it for future use
            if (connectedSite) {
              permissionService.updateConnectSite(origin, { evmAddress }, true);
            }
          } else {
            // Priority 4: Fall back to EOA address from walletManager
            const eoaInfo = await walletManager.getEOAAccountInfo();

            if (!eoaInfo || !eoaInfo.address || !isValidEthereumAddress(eoaInfo.address)) {
              throw new Error('Invalid EOA address from walletManager');
            }
            evmAddress = eoaInfo.address;
            // Store it for future use
            if (connectedSite) {
              permissionService.updateConnectSite(origin, { evmAddress: eoaInfo.address }, true);
            }
          }
        } catch (error) {
          // If an error occurs getting address, request approval
          consoleError('ethRequestAccounts - Error getting address, requesting approval:', error);

          approvalResult = await notificationService.requestApproval(
            {
              params: { origin, name, icon },
              approvalComponent: 'EthConnect',
            },
            { height: 599 }
          );

          // Check if approval provided a selected address
          if (approvalResult?.evmAddress && isValidEthereumAddress(approvalResult.evmAddress)) {
            evmAddress = approvalResult.evmAddress;
            // Store it in permission
            const connectedSite = permissionService.getConnectedSite(origin);
            if (connectedSite) {
              permissionService.updateConnectSite(origin, { evmAddress }, true);
            } else if (approvalResult.defaultChain) {
              // Convert string network to FlowChainId if needed
              const chainId: FlowChainId =
                typeof approvalResult.defaultChain === 'string'
                  ? networkToChainId(approvalResult.defaultChain)
                  : approvalResult.defaultChain;
              permissionService.addConnectedSite(origin, name, icon, chainId, false, evmAddress);
            }
          } else {
            // Final fallback: try to get current address or EOA
            const currentAddress = await Wallet.getCurrentAddress();
            if (currentAddress && isValidEthereumAddress(currentAddress)) {
              evmAddress = currentAddress;
            } else {
              const eoaInfo = await walletManager.getEOAAccountInfo();
              if (!eoaInfo || !eoaInfo.address || !isValidEthereumAddress(eoaInfo.address)) {
                throw new Error('Invalid EOA address from walletManager');
              }
              evmAddress = eoaInfo.address;
            }
          }
        }
      }
    }

    const account = evmAddress ? [ensureEvmAddressPrefix(evmAddress)] : [];

    sessionService.broadcastEvent('accountsChanged', account);
    return account;
  };

  ethAccounts = async ({ session: { origin } }) => {
    if (!permissionService.hasPermission(origin) || !(await Wallet.isUnlocked())) {
      return [];
    }

    let evmAccount: string | undefined;

    // Priority 1: Use stored EVM address from permission if available
    const connectedSite = permissionService.getConnectedSite(origin);
    if (connectedSite?.evmAddress && isValidEthereumAddress(connectedSite.evmAddress)) {
      evmAccount = connectedSite.evmAddress;
    } else {
      // Priority 2: Fall back to EOA address from walletManager
      try {
        const eoaInfo = await walletManager.getEOAAccountInfo();
        evmAccount = eoaInfo?.address;
        // Store it for future use
        if (connectedSite && evmAccount) {
          permissionService.updateConnectSite(origin, { evmAddress: evmAccount }, true);
        }
      } catch (error) {
        // If an error occurs, log it but continue
        consoleError('Error getting EOA address from walletManager:', error);
      }
    }

    const account = evmAccount ? [ensureEvmAddressPrefix(evmAccount)] : [];
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

  // ========================================================================
  // Transaction Methods (COA and EOA Routing)
  // ========================================================================

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
    const transactionParams: TransactionParams = data.data.params[0];

    const from = transactionParams.from || '';

    try {
      // Check if address is COA or EOA
      const isCOA = await isCOAAddress(from);
      if (isCOA) {
        return await this.sendTransactionCOA(transactionParams);
      } else {
        return await this.sendTransactionEOA(transactionParams);
      }
    } catch (error) {
      chrome.runtime.sendMessage({
        type: 'CLOSE_APPROVAL_POPUP',
        data: { success: false, error: error.message },
      });
      throw error;
    }
  };

  // COA Transaction Method
  private async sendTransactionCOA(transactionParams: TransactionParams): Promise<string> {
    const { to = '', gas = '0x1000000', value = '0x0', data: dataValue = '0x' } = transactionParams;
    const cleanHex = gas.startsWith('0x') ? gas : `0x${gas}`;
    const gasBigInt = BigInt(cleanHex);

    const result = await Wallet.dapSendEvmTX(to, gasBigInt, value, dataValue);
    if (!result) {
      throw new Error('Transaction hash is null or undefined');
    }
    const txHash = result.startsWith('0x') ? result : `0x${result}`;

    // Send message to close approval popup after successful transaction
    chrome.runtime.sendMessage({
      type: 'CLOSE_APPROVAL_POPUP',
      data: { success: true, result: txHash },
    });

    return txHash;
  }

  // EOA Transaction Method
  private async sendTransactionEOA(transactionParams: TransactionParams): Promise<string> {
    const {
      from = '',
      to = '',
      value = '0x0',
      data: dataValue = '0x',
      gas = '0x1000000',
      gasPrice = '0x0',
      maxFeePerGas,
      maxPriorityFeePerGas,
    } = transactionParams;
    // Get the current network and EOA account info
    const network = await Wallet.getNetwork();
    const eoaInfo = await walletManager.getEOAAccountInfo();

    const parentAddress = await Wallet.getParentAddress();
    if (!parentAddress) {
      throw new Error('Parent address not found');
    }

    if (!eoaInfo || !eoaInfo.address) {
      throw new Error('EOA account not found');
    }

    // Verify the transaction is from the correct EOA account
    if (from.toLowerCase() !== eoaInfo.address.toLowerCase()) {
      throw new Error('Transaction from address does not match EOA account');
    }

    // Initialize ServiceContext if not already initialized
    await this.initializeServiceContext();

    // Get the cadence service from ServiceContext
    const cadenceService = ServiceContext.current().cadence;

    const callback = async (trxData: any) => {
      // Get the current nonce from the network
      const nonce = await this.getTransactionCount(trxData.from);

      // Get the Ethereum private key using EVM BIP44 path
      const ethereumPrivateKey = await Wallet.getEthereumPrivateKey();
      const privateKeyBytes = Wallet.privateKeyToUint8Array(ethereumPrivateKey);

      // Get the current chain ID
      const chainId = network === 'testnet' ? TESTNET_CHAIN_ID : MAINNET_CHAIN_ID;

      // Determine if this is an EIP-1559 transaction
      const isEIP1559 = maxFeePerGas !== undefined;

      // Create the transaction object (legacy or EIP-1559)
      const transaction: EthUnsignedTransaction = isEIP1559
        ? {
            chainId: chainId,
            nonce: nonce,
            gasLimit: trxData.gasLimit || gas,
            maxFeePerGas: maxFeePerGas,
            maxPriorityFeePerGas: maxPriorityFeePerGas || '0x0',
            to: trxData.to,
            value: trxData.value || '0x0',
            data: trxData.data || '0x',
          }
        : {
            chainId: chainId,
            nonce: nonce,
            gasLimit: trxData.gasLimit || gas,
            gasPrice: gasPrice,
            to: trxData.to,
            value: trxData.value || '0x0',
            data: trxData.data || '0x',
          };
      // Sign the transaction using EthSigner
      const signedTransaction = await EthSigner.signTransaction(transaction, privateKeyBytes);

      return signedTransaction;
    };

    // Create transaction data for EVM call
    const trxData = {
      from: from,
      to: to,
      value: value,
      data: dataValue,
      gasLimit: gas,
    };

    // Get the signed transaction from callback
    const signedTransaction = await callback(trxData);

    // Convert hex string to byte array for eoaCallContract
    const rlpEncodedTransaction = this.convertHexToByteArray(signedTransaction.rawTransaction);

    // Call eoaCallContract with the encoded transaction
    const result = await cadenceService.eoaCallContract(rlpEncodedTransaction, eoaInfo.address);

    // Send message to close approval popup after successful transaction
    chrome.runtime.sendMessage({
      type: 'CLOSE_APPROVAL_POPUP',
      data: { success: true, result },
    });

    const txHash = signedTransaction.transactionHash;
    return txHash;
  }

  // ========================================================================
  // Signing Methods (COA and EOA Routing)
  // ========================================================================

  personalSign = async ({ data, approvalRes: _approvalRes, session }) => {
    if (!data.params) return;
    const [string, from] = data.params;

    try {
      const isCOA = await isCOAAddress(from);

      if (isCOA) {
        return await this.personalSignCOA(string, from, session);
      } else {
        return await this.personalSignEOA(string, from, session);
      }
    } catch (error) {
      consoleError('Error in personalSign:', error);
      throw error;
    }
  };

  // COA Personal Sign
  private async personalSignCOA(string: string, from: string, session: any): Promise<string> {
    const hex = string.startsWith('0x')
      ? string
      : `0x${Buffer.from(string, 'utf8').toString('hex')}`;
    const result = await signMessageCOA({ data: hex, from });
    signTextHistoryService.createHistory({
      address: from,
      text: string,
      origin: session.origin,
      type: 'personalSign',
    });
    return result;
  }

  // EOA Personal Sign
  private async personalSignEOA(string: string, from: string, session: any): Promise<string> {
    // Get the Ethereum private key using secp256k1 algorithm
    const ethereumPrivateKey = await Wallet.getEthereumPrivateKey();
    const privateKeyBytes = Wallet.privateKeyToUint8Array(ethereumPrivateKey);

    // Use eth-signer to sign the personal message
    const { signature } = await EthSigner.signPersonalMessage(privateKeyBytes, string);

    // Create history entry using the derived Ethereum address
    signTextHistoryService.createHistory({
      address: from,
      text: string,
      origin: session.origin,
      type: 'personalSign',
    });

    return signature;
  }

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
    } catch {
      throw new Error('Invalid JSON data provided');
    }
    const { chainId } = message.domain || {};

    if (!chainId || Number(chainId) !== Number(currentChain)) {
      throw new Error('Provided chainId does not match the currently active chain');
    }

    // Check if address is COA or EOA
    const isCOA = await isCOAAddress(address);

    if (isCOA) {
      return await this.signTypeDataCOAHandler(request, address, data, message);
    } else {
      return await this.signTypeDataEOAHandler(request, address, data, message);
    }
  };

  // COA Typed Data Sign
  private async signTypeDataCOAHandler(
    request: any,
    address: string,
    data: any,
    message: any
  ): Promise<string> {
    // COA signing path - validate address matches COA
    const parentAddress = await Wallet.getParentAddress();
    if (!parentAddress) {
      throw new Error('Parent address not found');
    }
    const coaAccount = await userWalletService.getEvmAccountOfParent(parentAddress);
    if (
      !coaAccount?.address ||
      ensureEvmAddressPrefix(coaAccount.address.toLowerCase()) !==
        ensureEvmAddressPrefix(address.toLowerCase())
    ) {
      throw new Error('Provided address does not match the COA address');
    }

    // Use COA signing method
    const signTypeMethod = SignTypedDataVersion.V4;
    const hash = TypedDataUtils.eip712Hash(message, signTypeMethod);
    const result = await signTypeDataCOA(hash);
    signTextHistoryService.createHistory({
      address: address,
      text: data,
      origin: request.session.origin,
      type: 'ethSignTypedDataV4',
    });
    return result;
  }

  // EOA Typed Data Sign
  private async signTypeDataEOAHandler(
    request: any,
    address: string,
    data: any,
    message: any
  ): Promise<string> {
    // EOA signing path - validate address matches EOA
    const eoaInfo = await walletManager.getEOAAccountInfo();
    if (!eoaInfo || !eoaInfo.address) {
      throw new Error('EOA address not found from walletManager');
    }
    if (
      ensureEvmAddressPrefix(eoaInfo.address.toLowerCase()) !==
      ensureEvmAddressPrefix(address.toLowerCase())
    ) {
      throw new Error('Provided address does not match the EOA address');
    }

    // Get the Ethereum private key and sign the typed data
    const result = await signTypeDataEOA(message);
    signTextHistoryService.createHistory({
      address: address,
      text: data,
      origin: request.session.origin,
      type: 'ethSignTypedDataV4',
    });
    return result;
  }

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
    } catch {
      throw new Error('Invalid JSON data provided');
    }
    const { chainId } = message.domain || {};

    if (!chainId || Number(chainId) !== Number(currentChain)) {
      throw new Error('Provided chainId does not match the currently active chain');
    }

    // Check if address is COA or EOA
    const isCOA = await isCOAAddress(address);

    if (isCOA) {
      return await this.signTypeDataV1COA(request, address, data, message);
    } else {
      return await this.signTypeDataV1EOA(request, address, data, message);
    }
  };

  // COA Typed Data V1 Sign
  private async signTypeDataV1COA(
    request: any,
    address: string,
    data: any,
    message: any
  ): Promise<string> {
    // COA signing path - validate address matches COA
    const parentAddress = await Wallet.getParentAddress();
    if (!parentAddress) {
      throw new Error('Parent address not found');
    }
    const coaAccount = await userWalletService.getEvmAccountOfParent(parentAddress);
    if (
      !coaAccount?.address ||
      ensureEvmAddressPrefix(coaAccount.address.toLowerCase()) !==
        ensureEvmAddressPrefix(address.toLowerCase())
    ) {
      throw new Error('Provided address does not match the COA address');
    }

    // Use COA signing method
    const hash = TypedDataUtils.eip712Hash(message, SignTypedDataVersion.V4);
    const result = await signTypeDataCOA(hash);
    signTextHistoryService.createHistory({
      address: address,
      text: data,
      origin: request.session.origin,
      type: 'ethSignTypedDataV1',
    });
    return result;
  }

  // EOA Typed Data V1 Sign
  private async signTypeDataV1EOA(
    request: any,
    address: string,
    data: any,
    message: any
  ): Promise<string> {
    // EOA signing path - validate address matches EOA
    const eoaInfo = await walletManager.getEOAAccountInfo();
    if (!eoaInfo || !eoaInfo.address) {
      throw new Error('EOA address not found from walletManager');
    }
    if (
      ensureEvmAddressPrefix(eoaInfo.address.toLowerCase()) !==
      ensureEvmAddressPrefix(address.toLowerCase())
    ) {
      throw new Error('Provided address does not match the EOA address');
    }

    const result = await signTypeDataEOA(message);
    signTextHistoryService.createHistory({
      address: address,
      text: data,
      origin: request.session.origin,
      type: 'ethSignTypedDataV1',
    });
    return result;
  }

  ethSign = async ({ data, approvalRes: _approvalRes, session }) => {
    if (!data.params) return;
    const [address, message] = data.params;

    try {
      const isCOA = await isCOAAddress(address);

      if (isCOA) {
        return await this.ethSignCOA(address, message, session);
      } else {
        return await this.ethSignEOA(address, message, session);
      }
    } catch (error) {
      consoleError('Error in ethSign:', error);
      throw error;
    }
  };

  // COA eth_sign
  private async ethSignCOA(address: string, message: any, session: any): Promise<string> {
    // Validate address matches COA
    const parentAddress = await Wallet.getParentAddress();
    if (!parentAddress) {
      throw new Error('Parent address not found');
    }
    const coaAccount = await userWalletService.getEvmAccountOfParent(parentAddress);
    if (!coaAccount?.address || address.toLowerCase() !== coaAccount.address.toLowerCase()) {
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

    // Hash the message using keccak256 (for COA, we need to hash it first like web3 does)
    const web3 = new Web3();
    const hashedData = web3.utils.keccak256(messageBytes);
    // Remove 0x prefix for COA signing
    const hashedDataWithoutPrefix = hashedData.startsWith('0x') ? hashedData.slice(2) : hashedData;

    const result = await createSignatureProof(hashedDataWithoutPrefix);
    signTextHistoryService.createHistory({
      address: address,
      text: message,
      origin: session.origin,
      type: 'ethSign',
    });
    return result;
  }

  // EOA eth_sign
  private async ethSignEOA(address: string, message: any, session: any): Promise<string> {
    // Get the Ethereum private key using secp256k1 algorithm
    const ethereumPrivateKey = await Wallet.getEthereumPrivateKey();
    const privateKeyBytes = Wallet.privateKeyToUint8Array(ethereumPrivateKey);

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
  }

  // ========================================================================
  // Other RPC Methods
  // ========================================================================

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

  // ========================================================================
  // Permission Methods
  // ========================================================================

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

  // ========================================================================
  // Chain/Network Methods
  // ========================================================================

  ethChainId = async ({ session: _session }) => {
    const network = await Wallet.getNetwork();
    if (network === 'testnet') {
      return TESTNET_CHAIN_ID;
    } else {
      return MAINNET_CHAIN_ID;
    }
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
