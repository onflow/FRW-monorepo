import type { TransactionStatus } from '@onflow/typedefs';

import openapiService, { type FlowTransactionResponse } from '@/background/service/openapi';
import { type TransferItem } from '@/shared/types/transaction-types';
import { isValidEthereumAddress, isValidFlowAddress } from '@/shared/utils/address';
import { getCachedData } from '@/shared/utils/cache-data-access';
import {
  pendingTransferListKey,
  transferListKey,
  type TransferListStore,
  type PendingTransferListStore,
  transferListRefreshRegex,
  pendingTransferListRefreshRegex,
} from '@/shared/utils/cache-data-keys';

import {
  getInvalidData,
  getValidData,
  registerRefreshListener,
  setCachedData,
} from '../utils/data-cache';

interface TransactionStore {
  expiry: number;
  total: number;
  transactionItem: Record<string, TransferItem[]>;
  pendingItem: Record<string, TransferItem[]>;
}

const now = new Date();

class Transaction {
  init = async () => {
    registerRefreshListener(transferListRefreshRegex, this.loadTransactions);
    registerRefreshListener(pendingTransferListRefreshRegex, this.loadPendingTransactions);
  };

  clear = async () => {};

  private getPendingList = async (network: string, address: string) => {
    // Get the pending list from the session store as
    return (await getValidData<TransferItem[]>(pendingTransferListKey(network, address))) || [];
  };

  private setPendingList = async (network: string, address: string, txList: TransferItem[]) => {
    // Always set pending transactions to 120 seconds
    setCachedData(pendingTransferListKey(network, address), txList, 120_000);
  };

  setPending = async (
    network: string,
    address: string,
    txId: string,
    icon: string,
    title: string
  ) => {
    const txList = await this.getPendingList(network, address);
    const items = txList.filter((txItem) => txItem.hash.includes(txId));
    if (items.length > 0) {
      return;
    }
    const now = new Date();
    const txItem: TransferItem = {
      coin: '',
      status: '',
      sender: '',
      receiver: '',
      hash: '',
      time: 0,
      interaction: '',
      amount: '',
      error: false,
      token: '',
      title: '',
      additionalMessage: '',
      type: 1,
      transferType: 1,
      image: '',
      indexed: false,
      cadenceTxId: '',
      evmTxIds: [],
    } as TransferItem;

    // Not sure we have a string for this
    txItem.status = chrome.i18n.getMessage('PENDING');
    txItem.time = now.getTime();
    txItem.token = 'Exec Transaction';
    txItem.sender = address;
    txItem.error = false;
    txItem.hash = txId;
    txItem.cadenceTxId = txId;
    txItem.image = icon;
    txItem.title = title;
    txList.unshift(txItem);
    await this.setPendingList(network, address, txList);

    // Send a message to the UI to update the transfer list
    chrome.runtime.sendMessage({ msg: 'transferListUpdated' });
  };

  updatePending = async (
    network: string,
    address: string,
    txId: string,
    transactionStatus: TransactionStatus
  ): Promise<string> => {
    const txList = await this.getPendingList(network, address);

    const txItemIndex = txList.findIndex((item) => item.hash.includes(txId));
    let combinedTxHash = txId;
    if (txItemIndex === -1) {
      // txItem not found, return
      return combinedTxHash;
    }
    const txItem = txList[txItemIndex];

    txItem.status =
      chrome.i18n.getMessage(transactionStatus.statusString) || transactionStatus.statusString;
    txItem.error = transactionStatus.statusCode === 1;

    const evmTxIds: string[] = transactionStatus.events?.reduce(
      (transactionIds: string[], event) => {
        if (event.type.includes('EVM') && !!event.data?.hash) {
          const hashBytes = event.data.hash.map((byte) => parseInt(byte));
          const hash = '0x' + Buffer.from(hashBytes).toString('hex');
          if (transactionIds.includes(hash)) {
            return transactionIds;
          }
          transactionIds.push(hash);
        }
        return transactionIds;
      },
      [] as string[]
    );
    txItem.evmTxIds = [...evmTxIds];

    if (evmTxIds.length > 0) {
      // We're sending an EVM transaction, we need to update the hash and may need to duplicate the pending item for each address
      if (evmTxIds.length > 10) {
        // TODO: Check there aren't 100s of evmTxIds
        // console.warn('updatePending - evmTxIds.length > 10', evmTxIds);
      }
      combinedTxHash = `${txItem.cadenceTxId || txItem.hash}_${evmTxIds.join('_')}`;
    }
    txList[txItemIndex] = txItem;
    // Always set pending transactions to 120 seconds
    await this.setPendingList(network, address, txList);
    // Send a message to the UI to update the transfer list
    chrome.runtime.sendMessage({ msg: 'transferListUpdated' });

    // Return the hash of the transaction
    return combinedTxHash;
  };

  removePending = async (txId: string, address: string, network: string) => {
    // Get the flow transactions
    const txList = await this.getPendingList(network, address);
    const newList = txList.filter((item) => {
      // Supports hashes with multiple ids
      // e.g. cadenceTxId_evmTxId
      return (
        !item.hash.includes(txId) &&
        !item.cadenceTxId?.includes(txId) &&
        !item.evmTxIds?.includes(txId)
      );
    });
    await this.setPendingList(network, address, newList);
  };

  // only used when evm transaction get updated.
  clearPending = async (network: string, address: string) => {
    await this.setPendingList(network, address, []);
  };

  private setTransaction = async (
    network: string,
    address: string,
    data: FlowTransactionResponse,
    offset: string,
    limit: string
  ): Promise<TransferListStore> => {
    const existingTxStore = await getInvalidData<TransferListStore>(
      transferListKey(network, address, offset, limit)
    );
    const existingTxList = existingTxStore?.list || [];
    const existingPendingList = await this.getPendingList(network, address);
    const txList: TransferItem[] = [];
    data?.transactions?.forEach(async (tx) => {
      const transactionHolder = {
        coin: '',
        status: '',
        sender: '',
        receiver: '',
        hash: '',
        time: 0,
        interaction: '',
        amount: '',
        error: false,
        token: '',
        title: '',
        additionalMessage: '',
        type: 1,
        transferType: 1,
        image: '',
        indexed: true,
      } as TransferItem;
      // const amountValue = parseInt(tx.node.amount.value) / 100000000
      transactionHolder.sender = tx.sender;
      transactionHolder.receiver = tx.receiver;
      transactionHolder.time = parseInt(tx.time);
      transactionHolder.status = tx.status;
      transactionHolder.hash = tx.txid;
      transactionHolder.error = tx.error;
      transactionHolder.image = tx.image;
      transactionHolder.amount = tx.amount;
      transactionHolder.interaction = tx.title;
      transactionHolder.token = tx.token;
      transactionHolder.type = tx.type;
      transactionHolder.transferType = tx.transfer_type;
      transactionHolder.additionalMessage = tx.additional_message;
      // see if there's a pending item for this transaction
      const pendingItem = existingPendingList.find(
        (item) =>
          item.hash.includes(tx.txid) ||
          item.cadenceTxId?.includes(tx.txid) ||
          item.evmTxIds?.includes(tx.txid)
      );
      if (pendingItem) {
        // Store the cadence transaction id
        transactionHolder.cadenceTxId = pendingItem.cadenceTxId;
        transactionHolder.evmTxIds = pendingItem.evmTxIds;
      } else {
        // see if there's an existing transaction with cadenceId in the store
        const existingTx = existingTxList.find(
          (item) =>
            item.hash.includes(tx.txid) ||
            item.cadenceTxId?.includes(tx.txid) ||
            item.evmTxIds?.includes(tx.txid)
        );
        if (existingTx && existingTx.cadenceTxId) {
          // Found existing cadence transaction id
          transactionHolder.cadenceTxId = existingTx.cadenceTxId;
          transactionHolder.evmTxIds = existingTx.evmTxIds;
        }
      }

      txList.push(transactionHolder);
      this.removePending(tx.txid, tx.sender, network);
    });
    const transferListStore: TransferListStore = {
      count: data.total,
      list: txList,
    };
    setCachedData(transferListKey(network, address, offset, limit), transferListStore);
    return transferListStore;
  };

  /**
   * Loads the transactions for a given address and network
   * @param network - The network to load the transactions from
   * @param address - The address to load the transactions from
   * @param limit - The limit of transactions to load (it's a number as a strin or empty string)
   * @param offset - The offset of the transactions to load (it's a number as a string or empty string)
   */
  loadTransactions = async (
    network: string,
    address: string,
    offset: string = '',
    limit: string = ''
  ): Promise<TransferListStore> => {
    if (isValidFlowAddress(address)) {
      // Get the flow transactions
      const flowResult = await openapiService.getTransfers(
        address,
        parseInt(offset ?? '0'),
        parseInt(limit ?? '15')
      );
      return this.setTransaction(network, address, flowResult, offset, limit);
    } else if (isValidEthereumAddress(address)) {
      const evmResult = await openapiService.getEVMTransfers(
        address,
        parseInt(offset ?? '0'),
        parseInt(limit ?? '15')
      );
      const resultAsFlowResponse: FlowTransactionResponse = {
        total: evmResult.next_page_params
          ? evmResult.next_page_params.items_count
          : evmResult.trxs.length,
        transactions: evmResult.trxs,
      };
      return this.setTransaction(network, address, resultAsFlowResponse, offset, limit);
    } else {
      throw new Error('Invalid address');
    }
  };
  /**
   * Refresh pending transactions
   * This will just clear the pending list if it's expired
   * @param network
   * @param address
   * @returns
   */

  loadPendingTransactions = async (network: string, address: string) => {
    // This will clear the pending list if it's expired
    // Pending transactions last 120 seconds
    const pendingList = await this.getPendingList(network, address);
    await this.setPendingList(network, address, pendingList);
  };

  listAllTransactions = async (
    network: string,
    address: string,
    offset: string,
    limit: string
  ): Promise<TransferListStore> => {
    // Get the cached transaction list
    const transactionListStore = (await getCachedData<TransferListStore>(
      transferListKey(network, address, offset, limit)
    )) || {
      count: 0,
      list: [],
    };
    // Get the pending transaction list
    const pendingList =
      (await getCachedData<PendingTransferListStore>(pendingTransferListKey(network, address))) ||
      [];

    // Merge the two lists
    const mergedList = [...pendingList, ...transactionListStore.list];
    return {
      count: mergedList.length,
      list: mergedList,
    };
  };

  listTransactions = async (
    network: string,
    address: string,
    offset: string,
    limit: string
  ): Promise<TransferItem[]> => {
    const transactionList = await getCachedData<TransferListStore>(
      transferListKey(network, address, offset, limit)
    );
    return transactionList?.list || [];
  };

  listPending = async (network: string, address: string): Promise<TransferItem[]> => {
    const pendingList = await getCachedData<PendingTransferListStore>(
      pendingTransferListKey(network, address)
    );
    return pendingList || [];
  };

  getCount = async (
    network: string,
    address: string,
    offset: string,
    limit: string
  ): Promise<number> => {
    const transactionList = await getCachedData<TransferListStore>(
      transferListKey(network, address, offset, limit)
    );
    return transactionList?.count || 0;
  };
}

export default new Transaction();
