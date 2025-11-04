import * as fcl from '@onflow/fcl';
import BN from 'bignumber.js';
import * as ethUtil from 'ethereumjs-util';
import { encode } from 'rlp';
import web3, { Web3 } from 'web3';

import { triggerRefresh, mainAccountsKey } from '@/data-model';
import { erc20Abi as erc20ABI, EVM_ENDPOINT } from '@/shared/constant';
import {
  type NftTransactionState,
  type CustomFungibleTokenInfo,
  type NFTModelV2,
  type TokenInfo,
  type TransactionState,
} from '@/shared/types';
import {
  convertToIntegerAmount,
  ensureEvmAddressPrefix,
  getErrorMessage,
  validateAmount,
} from '@/shared/utils';

import { tokenListService } from '.';
import { analyticsService } from './analytics';
import { getScripts } from './openapi';
import userWalletService from './userWallet';
import { replaceNftCollectionKeywords, replaceNftKeywords } from '../utils';
import { encodeEvmContractCallDataForNft } from '../utils/encodeEvmContractCallData';

export class TransactionService {
  /**
   * Master send token function that takes a transaction state from the front end and returns the transaction ID
   * @param transactionState - The transaction state from the front end
   * @returns The transaction ID
   */
  async transferTokens(transactionState: TransactionState): Promise<string> {
    const transferTokensOnCadence = async () => {
      return this.transferCadenceTokens(
        transactionState.tokenInfo.symbol,
        transactionState.toAddress,
        transactionState.amount
      );
    };

    const transferTokensFromChildToCadence = async () => {
      return this.sendFTfromChild(
        transactionState.fromAddress,
        transactionState.toAddress,
        'flowTokenProvider',
        transactionState.amount,
        transactionState.tokenInfo.symbol
      );
    };

    const transferFlowFromEvmToCadence = async () => {
      return this.withdrawFlowEvm(transactionState.amount, transactionState.toAddress);
    };

    const transferFTFromEvmToCadence = async () => {
      return this.transferFTFromEvm(
        transactionState.tokenInfo.flowIdentifier!,
        transactionState.amount,
        transactionState.toAddress,
        transactionState.tokenInfo
      );
    };

    // Returns the transaction ID
    const transferTokensOnEvm = async () => {
      let address, gas, value, data;

      if (transactionState.tokenInfo.symbol.toLowerCase() === 'flow') {
        address = transactionState.toAddress;
        gas = '1';
        // the amount is always stored as a string in the transaction state
        const integerAmountStr = convertToIntegerAmount(
          transactionState.amount,
          // Flow needs 18 digits always for EVM
          18
        );
        value = new BN(integerAmountStr).toString(16);
        data = '0x';
      } else {
        const integerAmountStr = convertToIntegerAmount(
          transactionState.amount,
          transactionState.tokenInfo.decimals
        );

        // Get the current network
        const network = await userWalletService.getNetwork();
        // Get the Web3 provider
        const provider = new Web3.providers.HttpProvider(
          EVM_ENDPOINT[network as keyof typeof EVM_ENDPOINT]
        );
        // Get the web3 instance
        const web3Instance = new Web3(provider);
        // Get the erc20 contract
        const erc20Contract = new web3Instance.eth.Contract(
          erc20ABI,
          transactionState.tokenInfo.address
        );
        // Encode the data
        const encodedData = erc20Contract.methods
          .transfer(ensureEvmAddressPrefix(transactionState.toAddress), integerAmountStr)
          .encodeABI();
        gas = '1312d00';
        address = ensureEvmAddressPrefix(transactionState.tokenInfo.address);
        value = '0x0'; // Zero value as hex
        data = encodedData.startsWith('0x') ? encodedData : `0x${encodedData}`;
      }

      // Send the transaction
      return this.sendEvmTransaction(address, gas, value, data);
    };

    const transferFlowFromCadenceToEvm = async () => {
      return this.transferFlowEvm(transactionState.toAddress, transactionState.amount);
    };

    const transferFTFromCadenceToEvm = async () => {
      const address = transactionState.tokenInfo!.address.startsWith('0x')
        ? transactionState.tokenInfo!.address.slice(2)
        : transactionState.tokenInfo!.address;

      return this.transferFTToEvmV2(
        `A.${address}.${transactionState.tokenInfo!.contractName}.Vault`,
        transactionState.amount,
        transactionState.toAddress
      );
    };

    // Validate the amount. Just to be sure!
    if (!validateAmount(transactionState.amount, transactionState?.tokenInfo?.decimals)) {
      throw new Error('Invalid amount or decimal places');
    }

    // Switch on the current transaction state
    switch (transactionState.currentTxState) {
      case 'FTFromEvmToCadence':
        return await transferFTFromEvmToCadence();
      case 'FlowFromEvmToCadence':
        return await transferFlowFromEvmToCadence();
      case 'FTFromChildToCadence':
      case 'FlowFromChildToCadence':
        return await transferTokensFromChildToCadence();
      case 'FTFromCadenceToCadence':
      case 'FlowFromCadenceToCadence':
        return await transferTokensOnCadence();
      case 'FlowFromEvmToEvm':
      case 'FTFromEvmToEvm':
        return await transferTokensOnEvm();
      case 'FlowFromCadenceToEvm':
        return await transferFlowFromCadenceToEvm();
      case 'FTFromCadenceToEvm':
        return await transferFTFromCadenceToEvm();
      default:
        throw new Error(`Unsupported transaction state: ${transactionState.currentTxState}`);
    }
  }

  /**
   * Transfer Flow from Cadence to EVM address
   * @param recipientEVMAddressHex - The EVM address to transfer Flow to
   * @param amount - The amount of Flow to transfer
   * @param gasLimit - The gas limit for the transaction
   * @returns The transaction ID
   */
  async transferFlowEvm(
    recipientEVMAddressHex: string,
    amount = '1.0',
    gasLimit = 16000000
  ): Promise<string> {
    const script = await getScripts(
      userWalletService.getNetwork(),
      'evm',
      'transferFlowToEvmAddress'
    );
    if (recipientEVMAddressHex.startsWith('0x')) {
      recipientEVMAddressHex = recipientEVMAddressHex.substring(2);
    }

    const txID = await userWalletService.sendTransaction(script, [
      fcl.arg(recipientEVMAddressHex, fcl.t.String),
      fcl.arg(amount, fcl.t.UFix64),
      fcl.arg(gasLimit, fcl.t.UInt64),
    ]);

    analyticsService.track('ft_transfer', {
      from_address: (await userWalletService.getCurrentAddress()) || '',
      to_address: recipientEVMAddressHex,
      amount: amount,
      ft_identifier: 'FLOW',
      type: 'evm',
    });

    return txID;
  }

  async transferFTToEvm(
    tokenContractAddress: string,
    tokenContractName: string,
    amount = '1.0',
    contractEVMAddress: string,
    data: string
  ): Promise<string> {
    const script = await getScripts(
      userWalletService.getNetwork(),
      'bridge',
      'bridgeTokensToEvmAddress'
    );
    if (contractEVMAddress.startsWith('0x')) {
      contractEVMAddress = contractEVMAddress.substring(2);
    }
    const dataBuffer = Buffer.from(data.slice(2), 'hex');
    const dataArray = Uint8Array.from(dataBuffer);
    const regularArray = Array.from(dataArray);
    const gasLimit = 16000000;

    const txID = await userWalletService.sendTransaction(script, [
      fcl.arg(tokenContractAddress, fcl.t.Address),
      fcl.arg(tokenContractName, fcl.t.String),
      fcl.arg(amount, fcl.t.UFix64),
      fcl.arg(contractEVMAddress, fcl.t.String),
      fcl.arg(regularArray, fcl.t.Array(fcl.t.UInt8)),
      fcl.arg(gasLimit, fcl.t.UInt64),
    ]);
    analyticsService.track('ft_transfer', {
      from_address: (await userWalletService.getCurrentAddress()) || '',
      to_address: tokenContractAddress,
      amount: amount,
      ft_identifier: tokenContractName,
      type: 'evm',
    });
    return txID;
  }

  async transferFTToEvmV2(
    vaultIdentifier: string,
    amount = '0.0',
    recipient: string
  ): Promise<string> {
    const script = await getScripts(
      userWalletService.getNetwork(),
      'bridge',
      'bridgeTokensToEvmAddressV2'
    );

    const txID = await userWalletService.sendTransaction(script, [
      fcl.arg(vaultIdentifier, fcl.t.String),
      fcl.arg(amount, fcl.t.UFix64),
      fcl.arg(recipient, fcl.t.String),
    ]);

    analyticsService.track('ft_transfer', {
      from_address: (await userWalletService.getCurrentAddress()) || '',
      to_address: recipient,
      amount: amount,
      ft_identifier: vaultIdentifier,
      type: 'evm',
    });

    return txID;
  }

  async transferFTFromEvm(
    flowidentifier: string,
    amount: string,
    receiver: string,
    tokenResult: TokenInfo
  ): Promise<string> {
    const decimals = tokenResult.decimals ?? 18;
    if (decimals < 0 || decimals > 77) {
      // 77 is BN.js max safe decimals
      throw new Error('Invalid decimals');
    }

    const integerAmountStr = convertToIntegerAmount(amount, decimals);

    const script = await getScripts(
      userWalletService.getNetwork(),
      'bridge',
      'bridgeTokensFromEvmToFlowV3'
    );
    const txID = await userWalletService.sendTransaction(script, [
      fcl.arg(flowidentifier, fcl.t.String),
      fcl.arg(integerAmountStr, fcl.t.UInt256),
      fcl.arg(receiver, fcl.t.Address),
    ]);

    analyticsService.track('ft_transfer', {
      from_address: (await userWalletService.getCurrentAddress()) || '',
      to_address: receiver,
      amount: amount,
      ft_identifier: flowidentifier,
      type: 'evm',
    });

    return txID;
  }

  async withdrawFlowEvm(amount = '0.0', address: string): Promise<string> {
    const script = await getScripts(userWalletService.getNetwork(), 'evm', 'withdrawCoa');

    const txID = await userWalletService.sendTransaction(script, [
      fcl.arg(amount, fcl.t.UFix64),
      fcl.arg(address, fcl.t.Address),
    ]);

    return txID;
  }

  async fundFlowEvm(amount = '1.0'): Promise<string> {
    const script = await getScripts(userWalletService.getNetwork(), 'evm', 'fundCoa');

    return await userWalletService.sendTransaction(script, [fcl.arg(amount, fcl.t.UFix64)]);
  }

  async bridgeToEvm(flowIdentifier: string, amount = '1.0'): Promise<string> {
    const script = await getScripts(
      userWalletService.getNetwork(),
      'bridge',
      'bridgeTokensToEvmV2'
    );

    const txID = await userWalletService.sendTransaction(script, [
      fcl.arg(flowIdentifier, fcl.t.String),
      fcl.arg(amount, fcl.t.UFix64),
    ]);

    const evmAddress = await userWalletService.getCurrentEvmAddress();
    analyticsService.track('ft_transfer', {
      from_address: (await userWalletService.getCurrentAddress()) || '',
      to_address: evmAddress ?? '',
      amount: amount,
      ft_identifier: flowIdentifier,
      type: 'evm',
    });

    return txID;
  }

  async bridgeToFlow(
    flowIdentifier: string,
    amount = '1.0',
    tokenResult: TokenInfo
  ): Promise<string> {
    const decimals = tokenResult.decimals ?? 18;
    if (decimals < 0 || decimals > 77) {
      // 77 is BN.js max safe decimals
      throw new Error('Invalid decimals');
    }
    const integerAmountStr = convertToIntegerAmount(amount, decimals);

    const script = await getScripts(
      userWalletService.getNetwork(),
      'bridge',
      'bridgeTokensFromEvmV2'
    );
    const txID = await userWalletService.sendTransaction(script, [
      fcl.arg(flowIdentifier, fcl.t.String),
      fcl.arg(integerAmountStr, fcl.t.UInt256),
    ]);

    analyticsService.track('ft_transfer', {
      from_address: (await userWalletService.getCurrentEvmAddress()) ?? '',
      to_address: (await userWalletService.getCurrentAddress()) || '',
      amount: amount,
      ft_identifier: flowIdentifier,
      type: 'flow',
    });

    return txID;
  }

  async sendEvmTransaction(
    to: string,
    gas: string | number,
    value: string,
    data: string
  ): Promise<string> {
    if (to.startsWith('0x')) {
      to = to.substring(2);
    }
    await userWalletService.getNetwork();

    const script = await getScripts(userWalletService.getNetwork(), 'evm', 'callContractV2');
    const gasLimit = 16000000;
    const dataBuffer = Buffer.from(data.slice(2), 'hex');
    const dataArray = Uint8Array.from(dataBuffer);
    const regularArray = Array.from(dataArray);

    // Handle the case where the value is '0.0'
    if (/^0\.0+$/.test(value)) {
      value = '0x0';
    }

    if (!value.startsWith('0x')) {
      value = '0x' + value;
    }

    // At this point the value should be a valid hex string. Check to make sure
    if (!/^0x[0-9a-fA-F]+$/.test(value)) {
      throw new Error('Invalid hex string value');
    }

    // Convert hex to BigInt
    const transactionValue = value === '0x' ? BigInt(0) : BigInt(value);

    const result = await userWalletService.sendTransaction(script, [
      fcl.arg(to, fcl.t.String),
      fcl.arg(transactionValue.toString(), fcl.t.UInt256),
      fcl.arg(regularArray, fcl.t.Array(fcl.t.UInt8)),
      fcl.arg(gasLimit, fcl.t.UInt64),
    ]);

    analyticsService.track('ft_transfer', {
      from_address: (await userWalletService.getCurrentEvmAddress()) ?? '',
      to_address: to,
      amount: value,
      ft_identifier: 'FLOW',
      type: 'evm',
    });

    return result;
  }

  async dapSendEvmTX(to: string, gas: bigint, value: string, data: string): Promise<string | null> {
    if (to.startsWith('0x')) {
      to = to.substring(2);
    }
    await userWalletService.getNetwork();

    const script = await getScripts(userWalletService.getNetwork(), 'evm', 'callContractV2');
    const gasLimit = gas || 16000000;
    const dataBuffer = Buffer.from(data.slice(2), 'hex');
    const dataArray = Uint8Array.from(dataBuffer);
    const regularArray = Array.from(dataArray);

    // Handle the case where the value is '0.0'
    if (/^0\.0+$/.test(value)) {
      value = '0x0';
    }

    if (!value.startsWith('0x')) {
      value = '0x' + value;
    }

    // Check if the value is a string
    if (typeof value === 'string') {
      // Check if it starts with '0x'
      if (value.startsWith('0x')) {
        // If it's hex without '0x', add '0x'
        if (!/^0x[0-9a-fA-F]+$/.test(value)) {
          value = '0x' + value.replace(/^0x/, '');
        }
      } else {
        // If it's a regular string, convert to hex
        value = web3.utils.toHex(value);
      }
    }
    // At this point the value should be a valid hex string. Check to make sure
    if (!/^0x[0-9a-fA-F]+$/.test(value)) {
      throw new Error('Invalid hex string value');
    }
    // Convert hex to BigInt directly to avoid potential number overflow
    const transactionValue = value === '0x' ? BigInt(0) : BigInt(value);

    await userWalletService.sendTransaction(script, [
      fcl.arg(to, fcl.t.String),
      fcl.arg(transactionValue.toString(), fcl.t.UInt256),
      fcl.arg(regularArray, fcl.t.Array(fcl.t.UInt8)),
      fcl.arg(gasLimit.toString(), fcl.t.UInt64),
    ]);

    const evmAddress = await userWalletService.getCurrentEvmAddress();
    if (!evmAddress) {
      throw new Error('EVM address not found');
    }

    analyticsService.track('ft_transfer', {
      from_address: evmAddress,
      to_address: to,
      amount: transactionValue.toString(),
      ft_identifier: 'FLOW',
      type: 'evm',
    });

    if (!evmAddress) {
      throw new Error('EVM address is required but not provided');
    }
    let processedEvmAddress: string = evmAddress;
    if (processedEvmAddress.startsWith('0x')) {
      processedEvmAddress = processedEvmAddress.substring(2);
    }
    // Validate hex string after processing
    if (!/^[0-9a-fA-F]+$/.test(processedEvmAddress)) {
      throw new Error('Invalid EVM address format');
    }

    const addressNonce = await this.getNonce(processedEvmAddress);

    const keccak256 = (data: Buffer) => {
      return ethUtil.keccak256(data);
    };

    // [nonce, gasPrice, gasLimit, to.addressData, value, data, v, r, s]

    const directCallTxType = 255;
    const contractCallSubType = 5;
    const noceNumber = Number(addressNonce);
    const gasPrice = 0;
    const transaction = [
      noceNumber, // nonce
      gasPrice, // Fixed value
      gasLimit, // Gas Limit
      Buffer.from(to, 'hex'), // To Address
      transactionValue, // Value
      Buffer.from(dataArray), // Call Data
      directCallTxType, // Fixed value
      BigInt('0x' + processedEvmAddress), // From Account
      contractCallSubType, // SubType
    ];
    const encodedData = encode(transaction);
    const hash = keccak256(Buffer.from(encodedData));
    const hashHexString = Buffer.from(hash).toString('hex');
    if (hashHexString) {
      return hashHexString;
    } else {
      return null;
    }
  }

  async getNonce(hexEncodedAddress: string): Promise<string> {
    await userWalletService.getNetwork();

    const script = await getScripts(userWalletService.getNetwork(), 'evm', 'getNonce');

    const result = await fcl.query({
      cadence: script,
      args: (arg, t) => [arg(hexEncodedAddress, t.String)],
    });
    return result;
  }

  async transferCadenceTokens(symbol: string, address: string, amount: string): Promise<string> {
    const token = await this.getTokenInfo(symbol);
    const script = await getScripts(userWalletService.getNetwork(), 'ft', 'transferTokensV3');

    if (!token) {
      throw new Error(`Invaild token name - ${symbol}`);
    }
    // Validate the amount just to be safe
    if (!validateAmount(amount, token.decimals)) {
      throw new Error(`Invalid amount - ${amount}`);
    }

    await userWalletService.getNetwork();

    if (!token.contractName || !token.path || !token.address) {
      throw new Error('Invalid token');
    }
    const txID = await userWalletService.sendTransaction(
      script
        .replaceAll('<Token>', token.contractName)
        .replaceAll('<TokenBalancePath>', token.path.balance)
        .replaceAll('<TokenReceiverPath>', token.path.receiver)
        .replaceAll('<TokenStoragePath>', token.path.vault)
        .replaceAll('<TokenAddress>', token.address),
      [fcl.arg(amount, fcl.t.UFix64), fcl.arg(address, fcl.t.Address)]
    );

    analyticsService.track('ft_transfer', {
      from_address: (await userWalletService.getCurrentAddress()) || '',
      to_address: address,
      amount: amount,
      ft_identifier: token.contractName,
      type: 'flow',
    });

    return txID;
  }

  async getTokenInfo(symbol: string): Promise<CustomFungibleTokenInfo | undefined> {
    const network = await userWalletService.getNetwork();
    const activeAccountType = await userWalletService.getActiveAccountType();
    // This would need to be imported from tokenListService
    return await tokenListService.getTokenInfo(
      network,
      activeAccountType === 'evm' ? 'evm' : 'flow',
      symbol
    );
  }

  sendFTfromChild = async (
    childAddress: string,
    receiver: string,
    path: string,
    amount: string,
    symbol: string
  ): Promise<string> => {
    const token = await this.getTokenInfo(symbol);
    if (!token) {
      throw new Error(`Invaild token name - ${symbol}`);
    }
    // Validate the amount just to be safe
    if (!validateAmount(amount, token.decimals)) {
      throw new Error(`Invalid amount - ${amount}`);
    }

    const script = await getScripts(userWalletService.getNetwork(), 'hybridCustody', 'sendChildFT');

    const result = await userWalletService.sendTransaction(script, [
      fcl.arg(childAddress, fcl.t.Address),
      fcl.arg(receiver, fcl.t.Address),
      fcl.arg(path, fcl.t.String),
      fcl.arg(amount, fcl.t.UFix64),
    ]);
    analyticsService.track('ft_transfer', {
      from_address: childAddress,
      to_address: receiver,
      amount: amount,
      ft_identifier: 'flow',
      type: 'flow',
    });
    return result;
  };

  async moveFTfromChild(
    childAddress: string,
    path: string,
    amount: string,
    symbol: string
  ): Promise<string> {
    const token = await this.getTokenInfo(symbol);
    if (!token) {
      throw new Error(`Invaild token name - ${symbol}`);
    }
    const script = await getScripts(
      userWalletService.getNetwork(),
      'hybridCustody',
      'transferChildFT'
    );

    const result = await userWalletService.sendTransaction(script, [
      fcl.arg(childAddress, fcl.t.Address),
      fcl.arg(path, fcl.t.String),
      fcl.arg(amount, fcl.t.UFix64),
    ]);
    analyticsService.track('ft_transfer', {
      from_address: (await userWalletService.getCurrentAddress()) || '',
      to_address: childAddress,
      amount: amount,
      ft_identifier: 'flow',
      type: 'flow',
    });
    return result;
  }
  /**
   * ===============================
   * NFT Functions
   * ===============================
   */

  /**
   * Master send token function that takes a transaction state from the front end and returns the transaction ID
   * @param transactionState - The transaction state from the front end
   * @returns The transaction ID
   */
  async transferNfts(transactionState: NftTransactionState): Promise<string> {
    const {
      network,
      collection,
      ids,
      fromAddress,
      toAddress,
      parentAddress,
      parentChildAddresses,
    } = transactionState;

    // Validate the amount. Just to be sure!
    if (transactionState.ids.length === 0) {
      throw new Error('There are no NFTs to transfer');
    }
    // Determine the script and arguments to use based on the transaction state
    const [script, args] = await (async () => {
      // Switch on the current transaction state
      switch (transactionState.currentTxState) {
        case 'NftFromCadenceToCadence': {
          if (ids.length > 1) {
            throw new Error('Batch transfer not supported for Cadence to Cadence');
          }
          const scriptName =
            collection.contractName.trim() === 'TopShot' ? 'sendNbaNFTV3' : 'sendNFTV3';
          return [
            await getScripts(network, 'collection', scriptName),
            [fcl.arg(toAddress, fcl.t.Address), fcl.arg(ids[0], fcl.t.UInt64)],
          ];
        }
        case 'NftFromCadenceToEvm':
          return [
            await getScripts(network, 'bridge', 'batchBridgeNftToEvmAddress'),
            [
              fcl.arg(collection.flowIdentifier, fcl.t.String),
              fcl.arg(ids[0], fcl.t.UInt64),
              fcl.arg(toAddress, fcl.t.Address),
            ],
          ];
        case 'NftFromCadenceToChild':
          if (toAddress === '' || !parentChildAddresses.includes(toAddress)) {
            throw new Error('Sending to a child CoA the only thing supported at the moment');
          }
          return [
            await getScripts(network, 'hybridCustody', 'batchTransferNFTToChild'),
            [fcl.arg(toAddress, fcl.t.Address), fcl.arg(ids[0], fcl.t.UInt64)],
          ];
        case 'NftFromEvmToCadence':
          if (toAddress !== parentAddress) {
            throw new Error('Sending to a parent is the only thing supported at the moment');
          }
          return [
            await getScripts(network, 'bridge', 'batchBridgeNftFromEvmToFlow'),
            [
              fcl.arg(collection.flowIdentifier || '', fcl.t.String),
              fcl.arg(ids[0], fcl.t.UInt64),
              fcl.arg(toAddress, fcl.t.Address),
            ],
          ];

        case 'NftFromEvmToEvm': {
          const callData = encodeEvmContractCallDataForNft(transactionState);

          const dataBuffer = Buffer.from(callData.slice(2), 'hex');
          const dataArray = Uint8Array.from(dataBuffer);
          const regularArray = Array.from(dataArray);
          const gasLimit = 16_000_000;
          return [
            await getScripts(network, 'evm', 'callContractV2'),
            [
              fcl.arg(toAddress, fcl.t.String),
              fcl.arg('0.0', fcl.t.UInt256),
              fcl.arg(regularArray, fcl.t.Array(fcl.t.UInt8)),
              fcl.arg(gasLimit, fcl.t.UInt64),
            ],
          ];
        }
        case 'NftFromEvmToChild':
          return [
            await getScripts(network, 'hybridCustody', 'batchBridgeChildNFTFromEvm'),
            [
              fcl.arg(collection.flowIdentifier, fcl.t.String),
              fcl.arg(toAddress, fcl.t.Address),
              fcl.arg(ids, fcl.t.Array(fcl.t.UInt64)),
            ],
          ];
        case 'NftFromChildToCadence':
          return [
            await getScripts(network, 'hybridCustody', 'batchSendChildNft'),
            [
              fcl.arg(collection.flowIdentifier, fcl.t.String),
              fcl.arg(fromAddress, fcl.t.Address),
              fcl.arg(toAddress, fcl.t.Address),
              fcl.arg(ids, fcl.t.Array(fcl.t.UInt64)),
            ],
          ];
        case 'NftFromChildToEvm':
          return [
            await getScripts(network, 'hybridCustody', 'batchBridgeChildNftToEvmAddress'),
            [
              fcl.arg(collection.flowIdentifier, fcl.t.String),
              fcl.arg(fromAddress, fcl.t.Address),
              fcl.arg(ids, fcl.t.Array(fcl.t.UInt64)), // note this is ids before toAddress
              fcl.arg(toAddress, fcl.t.Address),
            ],
          ];
        case 'NftFromChildToChild':
          return [
            await getScripts(network, 'hybridCustody', 'batchSendChildNftToChild'),
            [
              fcl.arg(collection.flowIdentifier, fcl.t.String),
              fcl.arg(fromAddress, fcl.t.Address),
              fcl.arg(toAddress, fcl.t.Address),
              fcl.arg(ids, fcl.t.Array(fcl.t.UInt64)),
            ],
          ];
        default:
          throw new Error(`Unsupported transaction state: ${transactionState.currentTxState}`);
      }
    })();

    // Replace the collection keywords in the script
    const replacedScript = replaceNftCollectionKeywords(script, collection);
    const txID = await userWalletService.sendTransaction(replacedScript, args);
    return txID;
  }

  /**
   * @deprecated use transferNfts instead
   */
  async moveNFTfromChild(
    nftContractAddress: string,
    nftContractName: string,
    ids: number,
    token: NFTModelV2
  ): Promise<string> {
    const script = await getScripts(
      userWalletService.getNetwork(),
      'hybridCustody',
      'transferChildNFT'
    );
    const replacedScript = replaceNftKeywords(script, token);
    const txID = await userWalletService.sendTransaction(replacedScript, [
      fcl.arg(nftContractAddress, fcl.t.Address),
      fcl.arg(nftContractName, fcl.t.String),
      fcl.arg(ids, fcl.t.UInt64),
    ]);
    analyticsService.track('nft_transfer', {
      tx_id: txID,
      from_address: nftContractAddress,
      to_address: (await userWalletService.getCurrentAddress()) || '',
      nft_identifier: token.contractName,
      from_type: 'flow',
      to_type: 'flow',
      isMove: true,
    });
    return txID;
  }
  /**
   * @deprecated use transferNfts instead
   */
  async sendNftFromChild(
    linkedAddress: string,
    receiverAddress: string,
    nftContractName: string,
    ids: number,
    token: NFTModelV2
  ): Promise<string> {
    const script = await getScripts(
      userWalletService.getNetwork(),
      'hybridCustody',
      'sendChildNFT'
    );
    const replacedScript = replaceNftKeywords(script, token);
    const txID = await userWalletService.sendTransaction(replacedScript, [
      fcl.arg(linkedAddress, fcl.t.Address),
      fcl.arg(receiverAddress, fcl.t.Address),
      fcl.arg(nftContractName, fcl.t.String),
      fcl.arg(ids, fcl.t.UInt64),
    ]);
    analyticsService.track('nft_transfer', {
      tx_id: txID,
      from_address: linkedAddress,
      to_address: receiverAddress,
      nft_identifier: token.contractName,
      from_type: 'flow',
      to_type: 'flow',
      isMove: false,
    });
    return txID;
  }
  /**
   * @deprecated use transferNfts instead
   */
  async bridgeChildNFTToEvmAddress(
    linkedAddress: string,
    receiverAddress: string,
    nftContractName: string,
    id: number,
    token: NFTModelV2
  ): Promise<string> {
    const script = await getScripts(
      userWalletService.getNetwork(),
      'hybridCustody',
      'bridgeChildNFTToEvmAddress'
    );
    const replacedScript = replaceNftKeywords(script, token);
    const txID = await userWalletService.sendTransaction(replacedScript, [
      fcl.arg(nftContractName, fcl.t.String),
      fcl.arg(linkedAddress, fcl.t.Address),
      fcl.arg(id, fcl.t.UInt64),
      fcl.arg(receiverAddress, fcl.t.String),
    ]);
    analyticsService.track('nft_transfer', {
      tx_id: txID,
      from_address: linkedAddress,
      to_address: receiverAddress,
      nft_identifier: token.contractName,
      from_type: 'flow',
      to_type: 'flow',
      isMove: false,
    });
    return txID;
  }
  /**
   * @deprecated use transferNfts instead
   */
  async sendNFTtoChild(
    linkedAddress: string,
    path: string,
    ids: number,
    token: NFTModelV2
  ): Promise<string> {
    const script = await getScripts(
      userWalletService.getNetwork(),
      'hybridCustody',
      'transferNFTToChild'
    );
    const walletAddress = linkedAddress;
    if (!walletAddress) {
      throw new Error(`Invalid linked address - ${linkedAddress}`);
    }
    const replacedScript = replaceNftKeywords(script, token);
    const txID = await userWalletService.sendTransaction(replacedScript, [
      fcl.arg(walletAddress, fcl.t.Address),
      fcl.arg(path, fcl.t.String),
      fcl.arg(ids, fcl.t.UInt64),
    ]);

    analyticsService.track('nft_transfer', {
      tx_id: txID,
      from_address: linkedAddress,
      to_address: (await userWalletService.getCurrentAddress()) || '',
      nft_identifier: token.contractName,
      from_type: 'flow',
      to_type: 'flow',
      isMove: false,
    });
    return txID;
  }

  /**
   * Bridge multiple NFTs from Cadence to it's child EVM CoA (Cadence Owned Account)
   * @param flowIdentifier - The flow identifier of the NFT collection
   * @param ids - The ids of the NFTs to bridge
   * @returns The transaction ID
   * @deprecated use transferNfts instead
   */
  async batchBridgeNftToEvm(flowIdentifier: string, ids: Array<number>): Promise<string> {
    const script = await getScripts(
      userWalletService.getNetwork(),
      'bridge',
      'batchBridgeNFTToEvmV2'
    );

    const txID = await userWalletService.sendTransaction(script, [
      fcl.arg(flowIdentifier, fcl.t.String),
      fcl.arg(ids, fcl.t.Array(fcl.t.UInt64)),
    ]);
    analyticsService.track('nft_transfer', {
      tx_id: txID,
      from_address: flowIdentifier,
      to_address: (await userWalletService.getCurrentAddress()) || '',
      nft_identifier: flowIdentifier,
      from_type: 'flow',
      to_type: 'flow',
      isMove: false,
    });
    return txID;
  }

  /**
   * @deprecated use transferNfts instead
   */
  async batchBridgeNftFromEvm(flowIdentifier: string, ids: Array<number>): Promise<string> {
    const script = await getScripts(
      userWalletService.getNetwork(),
      'bridge',
      'batchBridgeNFTFromEvmV2'
    );

    const txID = await userWalletService.sendTransaction(script, [
      fcl.arg(flowIdentifier, fcl.t.String),
      fcl.arg(ids, fcl.t.Array(fcl.t.UInt256)),
    ]);
    analyticsService.track('nft_transfer', {
      tx_id: txID,
      from_address: flowIdentifier,
      to_address: (await userWalletService.getCurrentAddress()) || '',
      nft_identifier: flowIdentifier,
      from_type: 'flow',
      to_type: 'evm',
      isMove: false,
    });
    return txID;
  }

  /**
   * @deprecated use transferNfts instead
   */
  async batchTransferNFTToChild(
    childAddr: string,
    identifier: string,
    ids: Array<number>,
    token: NFTModelV2
  ): Promise<string> {
    const script = await getScripts(
      userWalletService.getNetwork(),
      'hybridCustody',
      'batchTransferNFTToChild'
    );
    const replacedScript = replaceNftKeywords(script, token);

    const txID = await userWalletService.sendTransaction(replacedScript, [
      fcl.arg(childAddr, fcl.t.Address),
      fcl.arg(identifier, fcl.t.String),
      fcl.arg(ids, fcl.t.Array(fcl.t.UInt64)),
    ]);
    analyticsService.track('nft_transfer', {
      tx_id: txID,
      from_address: childAddr,
      to_address: (await userWalletService.getCurrentAddress()) || '',
      nft_identifier: identifier,
      from_type: 'flow',
      to_type: 'flow',
      isMove: false,
    });
    return txID;
  }

  /**
   * @deprecated use transferNfts instead
   */
  async batchTransferChildNft(
    childAddr: string,
    identifier: string,
    ids: Array<number>,
    token: NFTModelV2
  ): Promise<string> {
    const script = await getScripts(
      userWalletService.getNetwork(),
      'hybridCustody',
      'batchTransferChildNFT'
    );
    const replacedScript = replaceNftKeywords(script, token);

    const txID = await userWalletService.sendTransaction(replacedScript, [
      fcl.arg(childAddr, fcl.t.Address),
      fcl.arg(identifier, fcl.t.String),
      fcl.arg(ids, fcl.t.Array(fcl.t.UInt64)),
    ]);
    analyticsService.track('nft_transfer', {
      tx_id: txID,
      from_address: childAddr,
      to_address: (await userWalletService.getCurrentAddress()) || '',
      nft_identifier: identifier,
      from_type: 'flow',
      to_type: 'flow',
      isMove: false,
    });
    return txID;
  }

  /**
   * @deprecated use transferNfts instead
   */
  async sendChildNFTToChild(
    childAddr: string,
    receiver: string,
    identifier: string,
    ids: Array<number>,
    token: NFTModelV2
  ): Promise<string> {
    const script = await getScripts(
      userWalletService.getNetwork(),
      'hybridCustody',
      'batchSendChildNFTToChild'
    );
    const replacedScript = replaceNftKeywords(script, token);

    const txID = await userWalletService.sendTransaction(replacedScript, [
      fcl.arg(childAddr, fcl.t.Address),
      fcl.arg(receiver, fcl.t.Address),
      fcl.arg(identifier, fcl.t.String),
      fcl.arg(ids, fcl.t.Array(fcl.t.UInt64)),
    ]);
    analyticsService.track('nft_transfer', {
      tx_id: txID,
      from_address: childAddr,
      to_address: (await userWalletService.getCurrentAddress()) || '',
      nft_identifier: identifier,
      from_type: 'flow',
      to_type: 'flow',
      isMove: false,
    });
    return txID;
  }

  /**
   * @deprecated use transferNfts instead
   */
  async batchBridgeChildNFTToEvm(
    childAddr: string,
    identifier: string,
    ids: Array<number>,
    token: NFTModelV2
  ): Promise<string> {
    const script = await getScripts(
      userWalletService.getNetwork(),
      'hybridCustody',
      'batchBridgeChildNFTToEvm'
    );
    const replacedScript = replaceNftKeywords(script, token);
    const txID = await userWalletService.sendTransaction(replacedScript, [
      fcl.arg(identifier, fcl.t.String),
      fcl.arg(childAddr, fcl.t.Address),
      fcl.arg(ids, fcl.t.Array(fcl.t.UInt64)),
    ]);
    analyticsService.track('nft_transfer', {
      tx_id: txID,
      from_address: childAddr,
      to_address: (await userWalletService.getCurrentAddress()) || '',
      nft_identifier: identifier,
      from_type: 'flow',
      to_type: 'evm',
      isMove: false,
    });
    return txID;
  }

  /**
   * @deprecated use transferNfts instead
   */
  async batchBridgeChildNFTFromEvm(
    childAddr: string,
    identifier: string,
    ids: Array<number>
  ): Promise<string> {
    const script = await getScripts(
      userWalletService.getNetwork(),
      'hybridCustody',
      'batchBridgeChildNFTFromEvm'
    );

    const txID = await userWalletService.sendTransaction(script, [
      fcl.arg(identifier, fcl.t.String),
      fcl.arg(childAddr, fcl.t.Address),
      fcl.arg(ids, fcl.t.Array(fcl.t.UInt256)),
    ]);
    analyticsService.track('nft_transfer', {
      tx_id: txID,
      from_address: childAddr,
      to_address: (await userWalletService.getCurrentAddress()) || '',
      nft_identifier: identifier,
      from_type: 'flow',
      to_type: 'evm',
      isMove: false,
    });
    return txID;
  }

  /**
   * @deprecated use transferNfts instead
   */
  async bridgeNftToEvmAddress(
    flowIdentifier: string,
    ids: number,
    recipientEvmAddress: string
  ): Promise<string> {
    const script = await getScripts(
      userWalletService.getNetwork(),
      'bridge',
      'bridgeNFTToEvmAddressV2'
    );

    if (recipientEvmAddress.startsWith('0x')) {
      recipientEvmAddress = recipientEvmAddress.substring(2);
    }

    const txID = await userWalletService.sendTransaction(script, [
      fcl.arg(flowIdentifier, fcl.t.String),
      fcl.arg(ids, fcl.t.UInt64),
      fcl.arg(recipientEvmAddress, fcl.t.String),
    ]);
    analyticsService.track('nft_transfer', {
      tx_id: txID,
      from_address: flowIdentifier,
      to_address: (await userWalletService.getCurrentAddress()) || '',
      nft_identifier: flowIdentifier,
      from_type: 'evm',
      to_type: 'evm',
      isMove: false,
    });
    return txID;
  }

  /**
   * @deprecated use transferNfts instead
   */
  async bridgeNftFromEvmToFlow(
    flowIdentifier: string,
    ids: number,
    receiver: string
  ): Promise<string> {
    const script = await getScripts(
      userWalletService.getNetwork(),
      'bridge',
      'bridgeNFTFromEvmToFlowV3'
    );

    const txID = await userWalletService.sendTransaction(script, [
      fcl.arg(flowIdentifier, fcl.t.String),
      fcl.arg(ids, fcl.t.UInt256),
      fcl.arg(receiver, fcl.t.Address),
    ]);
    analyticsService.track('nft_transfer', {
      tx_id: txID,
      from_address: flowIdentifier,
      to_address: (await userWalletService.getCurrentAddress()) || '',
      nft_identifier: flowIdentifier,
      from_type: 'flow',
      to_type: 'evm',
      isMove: false,
    });
    return txID;
  }

  /**
   * @deprecated use transferNftsFromCadenceToCadence instead
   */
  async sendNFT(recipient: string, id: number, token: NFTModelV2): Promise<string> {
    await userWalletService.getNetwork();
    const script = await getScripts(userWalletService.getNetwork(), 'collection', 'sendNFTV3');

    const txID = await userWalletService.sendTransaction(
      script
        .replaceAll('<NFT>', token.contractName)
        .replaceAll('<NFTAddress>', token.address)
        .replaceAll('<CollectionStoragePath>', token.path.storage)
        .replaceAll('<CollectionPublicPath>', token.path.public),
      [fcl.arg(recipient, fcl.t.Address), fcl.arg(id, fcl.t.UInt64)]
    );
    analyticsService.track('nft_transfer', {
      tx_id: txID,
      from_address: (await userWalletService.getCurrentAddress()) || '',
      to_address: recipient,
      nft_identifier: token.contractName,
      from_type: 'flow',
      to_type: 'flow',
      isMove: false,
    });
    return txID;
  }
  /**
   * @deprecated use transferNftsFromCadenceToCadence instead
   */
  async sendNBANFT(recipient: string, id: number, token: NFTModelV2): Promise<string> {
    await userWalletService.getNetwork();
    const script = await getScripts(userWalletService.getNetwork(), 'collection', 'sendNbaNFTV3');

    const txID = await userWalletService.sendTransaction(
      script
        .replaceAll('<NFT>', token.contractName)
        .replaceAll('<NFTAddress>', token.address)
        .replaceAll('<CollectionStoragePath>', token.path.storage)
        .replaceAll('<CollectionPublicPath>', token.path.public),
      [fcl.arg(recipient, fcl.t.Address), fcl.arg(id, fcl.t.UInt64)]
    );
    analyticsService.track('nft_transfer', {
      tx_id: txID,
      from_address: (await userWalletService.getCurrentAddress()) || '',
      to_address: recipient,
      nft_identifier: token.contractName,
      from_type: 'flow',
      to_type: 'flow',
      isMove: false,
    });
    return txID;
  }

  async enableNFTStorageLocal(token: NFTModelV2): Promise<string> {
    const script = await getScripts(
      userWalletService.getNetwork(),
      'collection',
      'enableNFTStorage'
    );

    return await userWalletService.sendTransaction(
      script
        .replaceAll('<NFT>', token.contractName)
        .replaceAll('<NFTAddress>', token.address)
        .replaceAll('<CollectionStoragePath>', token.path.storage)
        .replaceAll('<CollectionPublicType>', token.path.public)
        .replaceAll('<CollectionPublicPath>', token.path.public),
      []
    );
  }

  // COA (Contract Owned Account) related methods
  async coaLink(): Promise<string> {
    const script = await getScripts(userWalletService.getNetwork(), 'evm', 'Link');
    return await userWalletService.sendTransaction(script, []);
  }

  async checkCoaLink(): Promise<boolean> {
    const script = await getScripts(userWalletService.getNetwork(), 'evm', 'checkCoaLink');
    const mainAddress = await userWalletService.getParentAddress();

    if (!mainAddress) {
      return false;
    }

    const result = await fcl.query({
      cadence: script,
      args: (arg, t) => [arg(mainAddress, t.Address)],
    });

    return !!result;
  }

  // Account management methods
  async revokeKey(index: string): Promise<string> {
    const script = await getScripts(userWalletService.getNetwork(), 'basic', 'revokeKey');
    return await userWalletService.sendTransaction(script, [fcl.arg(index, fcl.t.Int)]);
  }

  async addKeyToAccount(
    publicKey: string,
    signatureAlgorithm: number,
    hashAlgorithm: number,
    weight: number
  ): Promise<string> {
    return await userWalletService.sendTransaction(
      `
      import Crypto
      transaction(publicKey: String, signatureAlgorithm: UInt8, hashAlgorithm: UInt8, weight: UFix64) {
          prepare(signer: AuthAccount) {
              let key = PublicKey(
                  publicKey: publicKey.decodeHex(),
                  signatureAlgorithm: SignatureAlgorithm(rawValue: signatureAlgorithm)!
              )
              signer.keys.add(
                  publicKey: key,
                  hashAlgorithm: HashAlgorithm(rawValue: hashAlgorithm)!,
                  weight: weight
              )
          }
      }
      `,
      [
        fcl.arg(publicKey, fcl.t.String),
        fcl.arg(signatureAlgorithm, fcl.t.UInt8),
        fcl.arg(hashAlgorithm, fcl.t.UInt8),
        fcl.arg(weight.toFixed(1), fcl.t.UFix64),
      ]
    );
  }

  async enableTokenStorage(symbol: string): Promise<string | undefined> {
    const network = await userWalletService.getNetwork();
    const activeAccountType = await userWalletService.getActiveAccountType();
    const token = await tokenListService.getTokenInfo(
      network,
      activeAccountType === 'evm' ? 'evm' : 'flow',
      symbol
    );
    if (!token) {
      return;
    }
    await userWalletService.getNetwork();
    const script = await getScripts(
      userWalletService.getNetwork(),
      'storage',
      'enableTokenStorage'
    );
    if (!token.contractName || !token.path || !token.address) {
      throw new Error('Invalid token');
    }

    return await userWalletService.sendTransaction(
      script
        .replaceAll('<Token>', token.contractName)
        .replaceAll('<TokenBalancePath>', token.path.balance)
        .replaceAll('<TokenReceiverPath>', token.path.receiver)
        .replaceAll('<TokenStoragePath>', token.path.vault)
        .replaceAll('<TokenAddress>', token.address),
      []
    );
  }

  async getAssociatedFlowIdentifier(address: string): Promise<string> {
    const script = await getScripts(
      userWalletService.getNetwork(),
      'evm',
      'getAssociatedFlowIdentifier'
    );
    const result = await fcl.query({
      cadence: script,
      args: (arg, t) => [arg(address, t.String)],
    });
    return result;
  }

  // COA (Contract Owned Account) creation methods
  async createCOA(amount = '0.0'): Promise<string> {
    const formattedAmount = parseFloat(amount).toFixed(8);

    const script = await getScripts(userWalletService.getNetwork(), 'evm', 'createCoa');

    const txID = await userWalletService.sendTransaction(script, [
      fcl.arg(formattedAmount.toString(), fcl.t.UFix64),
    ]);

    // try to seal it
    try {
      await fcl.tx(txID).onceExecuted();
      // Track with success
      await this.trackCoaCreation(txID);
    } catch (error) {
      // Track with error
      await this.trackCoaCreation(txID, getErrorMessage(error));
    }

    return txID;
  }

  async createCoaEmpty(): Promise<string> {
    const network = await userWalletService.getNetwork();
    const parentAddress = await userWalletService.getParentAddress();
    const pubKey = userWalletService.getCurrentPubkey();
    if (!parentAddress) {
      throw new Error('Parent address not found');
    }
    const script = await getScripts(network, 'evm', 'createCoaEmpty');

    const txID = await userWalletService.sendTransaction(script, []);

    // try to seal it
    try {
      await fcl.tx(txID).onceSealed();

      // Refresh the EVM address
      triggerRefresh(mainAccountsKey(network, pubKey));

      // Track with success
      await this.trackCoaCreation(txID);
    } catch (error) {
      // Track with error
      await this.trackCoaCreation(txID, getErrorMessage(error));
    }

    return txID;
  }

  async trackCoaCreation(txID: string, errorMessage?: string): Promise<void> {
    analyticsService.track('coa_creation', {
      tx_id: txID,
      flow_address: (await userWalletService.getCurrentAddress()) || '',
      error_message: errorMessage,
    });
  }

  // Child account management methods
  async unlinkChildAccount(address: string): Promise<string> {
    await userWalletService.getNetwork();
    const script = await getScripts(
      userWalletService.getNetwork(),
      'hybridCustody',
      'getChildAccountMeta'
    );

    return await userWalletService.sendTransaction(script, [fcl.arg(address, fcl.t.Address)]);
  }

  async unlinkChildAccountV2(address: string): Promise<string> {
    await userWalletService.getNetwork();
    const script = await getScripts(
      userWalletService.getNetwork(),
      'hybridCustody',
      'unlinkChildAccount'
    );

    return await userWalletService.sendTransaction(script, [fcl.arg(address, fcl.t.Address)]);
  }

  async editChildAccount(
    address: string,
    name: string,
    description: string,
    thumbnail: string
  ): Promise<string> {
    await userWalletService.getNetwork();
    const script = await getScripts(
      userWalletService.getNetwork(),
      'hybridCustody',
      'editChildAccount'
    );

    return await userWalletService.sendTransaction(script, [
      fcl.arg(address, fcl.t.Address),
      fcl.arg(name, fcl.t.String),
      fcl.arg(description, fcl.t.String),
      fcl.arg(thumbnail, fcl.t.String),
    ]);
  }

  async checkChildLinkedVault(parent: string, child: string, path: string): Promise<string> {
    const script = await getScripts(
      userWalletService.getNetwork(),
      'hybridCustody',
      'checkChildLinkedVaults'
    );

    const result = await fcl.query({
      cadence: script,
      args: (arg, t) => [arg(parent, t.Address), arg(child, t.Address), fcl.arg(path, t.String)],
    });
    return result;
  }
}

export default new TransactionService();
