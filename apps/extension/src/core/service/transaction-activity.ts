import { ExplorerService } from '@onflow/frw-api';
import { logger } from '@onflow/frw-context';
import type { TransactionStatus } from '@onflow/typedefs';

import {
  triggerRefresh,
  transferListKey,
  transferListRefreshRegex,
  type TransferListStore,
  coinListKey,
  getInvalidData,
  getValidData,
  registerRefreshListener,
  setCachedData,
} from '@/data-model';
import { type TransferItem } from '@/shared/types';
import {
  consoleError,
  consoleWarn,
  isValidEthereumAddress,
  isValidFlowAddress,
} from '@/shared/utils';

import openapiService, { type FlowTransactionResponse } from './openapi';
import preferenceService from './preference';

interface TransactionStore {
  pendingItem: {
    mainnet: Record<string, TransferItem[]>;
    testnet: Record<string, TransferItem[]>;
    [key: string]: Record<string, TransferItem[]>;
  };
}

/**
 * Maps FCL transaction status strings to UI format
 * This replaces the previous i18n.getMessage() calls
 */
const mapTransactionStatus = (statusString: unknown): string => {
  const statusMap: Record<string, string> = {
    PENDING: 'PENDING',
    EXECUTED: 'Executed',
    SEALED: 'Sealed',
    EXPIRED: 'EXPIRED',
    FINALIZED: 'Finalized',
    SUCCESS: 'success',
  };

  if (typeof statusString !== 'string' || statusString.length === 0) {
    return 'PENDING';
  }

  return statusMap[statusString.toUpperCase()] || statusString;
};

const extractStatusText = (transactionStatus: TransactionStatus): string => {
  const statusFromFcl = (transactionStatus as { statusString?: unknown }).statusString;
  if (typeof statusFromFcl === 'string' && statusFromFcl.length > 0) {
    return statusFromFcl;
  }
  const statusFromRest = (transactionStatus as { status?: unknown }).status;
  if (typeof statusFromRest === 'string' && statusFromRest.length > 0) {
    return statusFromRest;
  }
  if (typeof statusFromRest === 'number') {
    const statusByCode: Record<number, string> = {
      0: 'PENDING',
      1: 'PENDING',
      2: 'Finalized',
      3: 'Executed',
      4: 'Sealed',
      5: 'EXPIRED',
    };
    return statusByCode[statusFromRest] || 'PENDING';
  }
  const statusCodeFromRest = (transactionStatus as { status_code?: unknown }).status_code;
  if (typeof statusCodeFromRest === 'number') {
    const statusByCode: Record<number, string> = {
      0: 'PENDING',
      1: 'PENDING',
      2: 'Finalized',
      3: 'Executed',
      4: 'Sealed',
      5: 'EXPIRED',
    };
    return statusByCode[statusCodeFromRest] || 'PENDING';
  }
  return 'PENDING';
};

const extractStatusCode = (transactionStatus: TransactionStatus): number => {
  const codeFromFcl = (transactionStatus as { statusCode?: unknown }).statusCode;
  if (typeof codeFromFcl === 'number') {
    return codeFromFcl;
  }
  const codeFromRest = (transactionStatus as { status_code?: unknown }).status_code;
  if (typeof codeFromRest === 'number') {
    return codeFromRest;
  }
  return 0;
};

const extractEvmHashFromCadencePayload = (payload?: string): string | null => {
  if (!payload || typeof payload !== 'string') {
    return null;
  }
  try {
    const decoded = Buffer.from(payload, 'base64').toString('utf8').trim();
    const parsed = JSON.parse(decoded) as {
      value?: {
        fields?: Array<{
          name?: string;
          value?: {
            value?: Array<{ value?: string }>;
          };
        }>;
      };
    };
    const hashField = parsed?.value?.fields?.find((field) => field?.name === 'hash');
    const bytes = (hashField?.value?.value ?? [])
      .map((item) => Number(item?.value))
      .filter((num) => Number.isFinite(num) && num >= 0 && num <= 255);
    if (bytes.length === 0) {
      return null;
    }
    return `0x${Buffer.from(bytes).toString('hex')}`;
  } catch {
    return null;
  }
};

const getIndexedTxId = (tx: any): string => {
  const candidate = tx?.txid || tx?.hash || tx?.transaction_id || tx?.transactionId || '';
  return typeof candidate === 'string' ? candidate : '';
};

class TransactionActivity {
  private store: TransactionStore = {
    pendingItem: {
      mainnet: {},
      testnet: {},
    },
  };

  // Type definitions for better type safety
  private poll = async <T>(
    fn: () => Promise<T>,
    fnCondition: (result: T) => boolean,
    ms: number
  ): Promise<T> => {
    const result = await fn();
    if (fnCondition(result)) {
      await this.wait(ms);
      return this.poll(fn, fnCondition, ms);
    }
    return result;
  };

  private wait = (ms = 1000): Promise<void> => {
    return new Promise((resolve) => setTimeout(resolve, ms));
  };

  pollTransferList = async (
    address: string,
    txHash: string,
    network: string,
    maxAttempts = 5
  ): Promise<void> => {
    const currency = (await preferenceService.getDisplayCurrency())?.code || 'USD';
    let attempts = 0;
    try {
      logger.info('[transaction-activity] poll start', { network, address, txHash });
      const resolveCadenceTxId = (hash: string): string => {
        if (!hash) {
          return '';
        }
        return hash.split('_')[0] || hash;
      };
      const cadenceTxId = resolveCadenceTxId(txHash);
      const FLOW_TX_ID_REGEX = /^(?:0x)?[0-9a-fA-F]{64}$/;
      const poll = async (): Promise<void> => {
        if (attempts >= maxAttempts) {
          consoleWarn('Max polling attempts reached');
          logger.warn('[transaction-activity] poll max attempts reached', {
            network,
            address,
            txHash,
            attempts,
            maxAttempts,
          });
          // Fallback: if indexer still hasn't surfaced this tx, check chain terminal status directly.
          if (FLOW_TX_ID_REGEX.test(cadenceTxId)) {
            try {
              const normalizedTxId = cadenceTxId.replace(/^0x/i, '');
              const response = await fetch(
                `https://rest-${network}.onflow.org/v1/transaction_results/${normalizedTxId}`
              );
              if (response.ok) {
                const result = (await response.json()) as {
                  status?: string;
                  status_code?: number;
                };
                const status = result.status || '';
                logger.info('[transaction-activity] poll fallback chain status', {
                  network,
                  address,
                  txHash,
                  cadenceTxId,
                  status,
                  status_code: result.status_code,
                });
                if (status === 'Sealed' || status === 'Expired') {
                  await this.removePending(network, address, cadenceTxId);
                  triggerRefresh(coinListKey(network, address, currency));
                }
              }
            } catch (error) {
              logger.warn('[transaction-activity] poll fallback chain status failed', {
                network,
                address,
                txHash,
                cadenceTxId,
                error,
              });
            }
          }
          return;
        }

        const { list: newTransactions } = await this.loadTransactions(network, address, '0', '15');

        const foundTx = newTransactions?.find((tx: TransferItem) => txHash.includes(tx.hash));
        if (foundTx && foundTx.indexed) {
          logger.info('[transaction-activity] poll found indexed tx', {
            network,
            address,
            txHash,
            foundHash: foundTx.hash,
            status: foundTx.status,
          });
          // Refresh the coin list
          triggerRefresh(coinListKey(network, address, currency));
        } else {
          // All of the transactions have not been picked up by the indexer yet
          attempts++;
          logger.info('[transaction-activity] poll retry', {
            network,
            address,
            txHash,
            attempts,
            maxAttempts,
          });
          setTimeout(poll, 5000); // Poll every 5 seconds
        }
      };

      await poll();
    } catch (error) {
      consoleError('pollTransferList error', error);
    }
  };
  init = async () => {
    logger.info('[transaction-activity] init register listeners');
    registerRefreshListener(transferListRefreshRegex, this.loadTransactions);
  };

  clear = async () => {
    this.store = {
      pendingItem: {
        mainnet: {},
        testnet: {},
      },
    };
  };

  // Remove pending items older than 120 seconds
  private removeExpiredPendingItems = (network: string, address: string) => {
    const timeNow = new Date().getTime();
    const pendingList = this.store.pendingItem[network][address];
    if (pendingList.length > 0) {
      const filteredList = pendingList.filter((item) => item.time + 120_000 > timeNow);
      if (filteredList.length !== pendingList.length) {
        logger.info('[transaction-activity] removeExpiredPendingItems pruned', {
          network,
          address,
          before: pendingList.length,
          after: filteredList.length,
        });
      }
      this.store.pendingItem[network][address] = structuredClone(filteredList);
    }
  };

  private getPendingList = (network: string, address: string): TransferItem[] => {
    // Always return a clone of the pending list
    if (
      !network ||
      !address ||
      !this.store.pendingItem[network] ||
      !this.store.pendingItem[network][address]
    ) {
      logger.info('[transaction-activity] getPendingList empty', { network, address });
      return [];
    }
    // Remove expired pending items from the list
    this.removeExpiredPendingItems(network, address);
    // Return a clone of the pending list
    return structuredClone(this.store.pendingItem[network][address]);
  };

  private setPendingList = (network: string, address: string, txList: TransferItem[]) => {
    if (network && address) {
      this.store.pendingItem[network][address] = structuredClone(txList);
      logger.info('[transaction-activity] setPendingList', {
        network,
        address,
        size: txList.length,
      });
    }
  };

  setPending = async (
    network: string,
    address: string,
    txId: string,
    icon: string,
    title: string
  ) => {
    logger.info('[transaction-activity] setPending start', { network, address, txId, title });
    const txList = this.getPendingList(network, address);
    const items = txList.filter((txItem) => txItem.hash.includes(txId));
    if (items.length > 0) {
      logger.info('[transaction-activity] setPending skip duplicate', { network, address, txId });
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
    txItem.status = 'PENDING';
    txItem.time = now.getTime();
    txItem.token = 'Exec Transaction';
    txItem.sender = address;
    txItem.error = false;
    txItem.hash = txId;
    txItem.cadenceTxId = txId;
    txItem.image = icon;
    txItem.title = title;

    txList.unshift(txItem);
    this.setPendingList(network, address, txList);
    logger.info('[transaction-activity] setPending', {
      network,
      address,
      txId,
      pendingSize: txList.length,
    });

    // Get the existing indexed transaction list or create a new one
    const existingTxStore = await getInvalidData<TransferListStore>(
      transferListKey(network, address, '0', '15')
    );
    const txStore: TransferListStore = existingTxStore || {
      count: 0,
      pendingCount: 0,
      list: [],
    };
    txStore.list.unshift(txItem);
    txStore.pendingCount = txStore.list.filter(
      (item) => item.status.toUpperCase() === 'PENDING'
    ).length;
    txStore.count = txStore.count + 1;
    await setCachedData(transferListKey(network, address, '0', '15'), txStore);
  };

  updatePending = async (
    network: string,
    address: string,
    txId: string,
    transactionStatus: TransactionStatus
  ): Promise<string> => {
    logger.info('[transaction-activity] updatePending start', { network, address, txId });
    const txList = this.getPendingList(network, address);

    const txItemIndex = txList.findIndex((item) => item.hash.includes(txId));
    let combinedTxHash = txId;
    // Get the existing indexed transaction list and update it, or create new one
    const existingTxStore = await getInvalidData<TransferListStore>(
      transferListKey(network, address, '0', '15')
    );
    const txStore: TransferListStore = existingTxStore || {
      count: 0,
      pendingCount: 0,
      list: [],
    };
    const storeItemIndex = txStore.list.findIndex(
      (item) =>
        item.hash.includes(txId) ||
        item.cadenceTxId?.includes(txId) ||
        item.evmTxIds?.includes(txId)
    );
    if (txItemIndex === -1 && storeItemIndex === -1) {
      // txItem not found in pending store nor cached transfer list
      logger.warn('[transaction-activity] updatePending tx not found', { network, address, txId });
      return combinedTxHash;
    }
    const txItem =
      txItemIndex !== -1
        ? txList[txItemIndex]
        : ({
            ...txStore.list[storeItemIndex],
          } as TransferItem);

    txItem.status = mapTransactionStatus(extractStatusText(transactionStatus));
    txItem.error = extractStatusCode(transactionStatus) === 1;

    const evmTxIds: string[] = transactionStatus.events?.reduce(
      (transactionIds: string[], event) => {
        if (event.type.includes('EVM') && !!event.data?.hash) {
          const hashBytes = event.data.hash.map((byte: string) => parseInt(byte));
          const hash = '0x' + Buffer.from(hashBytes).toString('hex');
          if (transactionIds.includes(hash)) {
            return transactionIds;
          }
          transactionIds.push(hash);
        } else if (event.type.includes('EVM')) {
          const hash = extractEvmHashFromCadencePayload(
            (event as { payload?: string | undefined }).payload
          );
          if (hash && !transactionIds.includes(hash)) {
            transactionIds.push(hash);
          }
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
      }
      combinedTxHash = `${txItem.cadenceTxId || txItem.hash}_${evmTxIds.join('_')}`;
    }
    if (txItemIndex !== -1) {
      if (txItem.status.toUpperCase() === 'PENDING') {
        txList[txItemIndex] = txItem;
      } else {
        // Remove finalized transactions from in-memory pending list immediately.
        txList.splice(txItemIndex, 1);
      }
      this.setPendingList(network, address, txList);
    }
    if (storeItemIndex !== -1) {
      txStore.list[storeItemIndex] = txItem;
    } else {
      // Item not found in store, add it (could happen if cache was cleared)
      txStore.list.unshift(txItem);
      txStore.count = txStore.count + 1;
    }
    txStore.pendingCount = txStore.list.filter(
      (item) => item.status.toUpperCase() === 'PENDING'
    ).length;
    await setCachedData(transferListKey(network, address, '0', '15'), txStore);
    logger.info('[transaction-activity] updatePending applied', {
      network,
      address,
      txId,
      status: txItem.status,
      error: txItem.error,
      evmTxIds: txItem.evmTxIds,
      pendingCount: txStore.pendingCount,
    });

    // Return the hash of the transaction
    return combinedTxHash;
  };

  /**
   * Update a pending transaction to show error state
   * This is called when a evm transaction fails on the cadence side
   * @param network - The network
   * @param address - The address (can be Flow or EVM address)
   * @param txId - The transaction ID
   * @param errorMessage - The error message to display
   */
  updatePendingError = async (
    network: string,
    address: string,
    txId: string,
    errorMessage?: string
  ): Promise<void> => {
    logger.info('[transaction-activity] updatePendingError start', {
      network,
      address,
      txId,
      hasErrorMessage: !!errorMessage,
    });
    const txList = this.getPendingList(network, address);

    const txItemIndex = txList.findIndex((item) => item.hash.includes(txId));
    // Get the existing indexed transaction list and update it, or create new one
    const existingTxStore = await getInvalidData<TransferListStore>(
      transferListKey(network, address, '0', '15')
    );
    const txStore: TransferListStore = existingTxStore || {
      count: 0,
      pendingCount: 0,
      list: [],
    };
    const storeItemIndex = txStore.list.findIndex(
      (item) =>
        item.hash.includes(txId) ||
        item.cadenceTxId?.includes(txId) ||
        item.evmTxIds?.includes(txId)
    );
    if (txItemIndex === -1 && storeItemIndex === -1) {
      // txItem not found in pending store nor cached transfer list
      logger.warn('[transaction-activity] updatePendingError tx not found', {
        network,
        address,
        txId,
      });
      return;
    }
    const txItem =
      txItemIndex !== -1
        ? txList[txItemIndex]
        : ({
            ...txStore.list[storeItemIndex],
          } as TransferItem);

    // Mark the transaction as failed
    txItem.status = 'Error';
    txItem.error = true;
    if (errorMessage) {
      txItem.additionalMessage = errorMessage;
    }

    if (txItemIndex !== -1) {
      txList[txItemIndex] = txItem;
      this.setPendingList(network, address, txList);
    }
    if (storeItemIndex !== -1) {
      txStore.list[storeItemIndex] = txItem;
    } else {
      // Item not found in store, add it
      txStore.list.unshift(txItem);
      txStore.count = txStore.count + 1;
    }
    txStore.pendingCount = txStore.list.filter(
      (item) => item.status.toUpperCase() === 'PENDING'
    ).length;
    await setCachedData(transferListKey(network, address, '0', '15'), txStore);
    logger.info('[transaction-activity] updatePendingError applied', {
      network,
      address,
      txId,
      pendingCount: txStore.pendingCount,
    });
  };

  removePending = async (network: string, address: string, txId: string) => {
    logger.info('[transaction-activity] removePending start', { network, address, txId });
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

    this.setPendingList(network, address, newList);
    // Keep transfer cache in sync so stale pending rows are removed immediately from UI list.
    const transferStoreKey = transferListKey(network, address, '0', '15');
    const existingTxStore = await getInvalidData<TransferListStore>(transferStoreKey);
    if (existingTxStore) {
      const previousCount = existingTxStore.list.length;
      const filteredTxList = existingTxStore.list.filter((item) => {
        return (
          !item.hash.includes(txId) &&
          !item.cadenceTxId?.includes(txId) &&
          !item.evmTxIds?.includes(txId)
        );
      });
      const removedCount = previousCount - filteredTxList.length;
      if (removedCount > 0) {
        existingTxStore.list = filteredTxList;
        existingTxStore.pendingCount = filteredTxList.filter(
          (item) => item.status.toUpperCase() === 'PENDING'
        ).length;
        existingTxStore.count = Math.max(0, existingTxStore.count - removedCount);
        await setCachedData(transferStoreKey, existingTxStore);
      }
    }
    logger.info('[transaction-activity] removePending applied', {
      network,
      address,
      txId,
      before: txList.length,
      after: newList.length,
    });
  };

  // only used when evm transaction get updated.
  clearPending = async (network: string, address: string) => {
    logger.info('[transaction-activity] clearPending', { network, address });
    this.setPendingList(network, address, []);
  };

  private setTransaction = async (
    network: string,
    address: string,
    data: FlowTransactionResponse,
    offset: string,
    limit: string
  ): Promise<TransferListStore> => {
    logger.info('[transaction-activity] setTransaction start', {
      network,
      address,
      offset,
      limit,
      txCount: data?.transactions?.length || 0,
      total: data?.total || 0,
    });
    const existingTxStore = await getInvalidData<TransferListStore>(
      transferListKey(network, address, offset, limit)
    );
    const existingTxList = existingTxStore?.list || [];
    const existingPendingList = await this.getPendingList(network, address);
    const txList: TransferItem[] = [];
    data?.transactions?.forEach(async (tx) => {
      const indexedTxId = getIndexedTxId(tx);
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
      transactionHolder.time = new Date(tx.time).getTime();
      transactionHolder.status = mapTransactionStatus(tx.status);
      transactionHolder.hash = indexedTxId;
      transactionHolder.error = tx.error;
      transactionHolder.image = tx.image;
      transactionHolder.amount = tx.amount;
      transactionHolder.interaction = tx.title;
      transactionHolder.token = tx.token;
      transactionHolder.type = tx.type;
      transactionHolder.transferType = tx.transfer_type;
      transactionHolder.additionalMessage = tx.additional_message;
      // see if there's a pending item for this transaction
      const pendingItemIndex = existingPendingList.findIndex(
        (item) =>
          item.hash.includes(indexedTxId) ||
          item.cadenceTxId?.includes(indexedTxId) ||
          item.evmTxIds?.includes(indexedTxId)
      );
      if (pendingItemIndex !== -1) {
        logger.info('[transaction-activity] setTransaction matched pending', {
          network,
          address,
          indexedTxId,
          pendingHash: existingPendingList[pendingItemIndex]?.hash,
        });
        // Store the cadence transaction id
        transactionHolder.cadenceTxId = existingPendingList[pendingItemIndex].cadenceTxId;
        transactionHolder.evmTxIds = existingPendingList[pendingItemIndex].evmTxIds;
        existingPendingList.splice(pendingItemIndex, 1);
      } else {
        // see if there's an existing transaction with cadenceId in the store
        const existingTx = existingTxList.find(
          (item) =>
            item.hash.includes(indexedTxId) ||
            item.cadenceTxId?.includes(indexedTxId) ||
            item.evmTxIds?.includes(indexedTxId)
        );
        if (existingTx && existingTx.cadenceTxId) {
          // Found existing cadence transaction id
          transactionHolder.cadenceTxId = existingTx.cadenceTxId;
          transactionHolder.evmTxIds = existingTx.evmTxIds;
        }
      }

      txList.push(transactionHolder);
    });
    this.setPendingList(network, address, existingPendingList);
    const transferListStore: TransferListStore = {
      count: data.total + existingPendingList.length,
      // This is the number of transaction that are in progress
      pendingCount: existingPendingList.filter((item) => item.status.toUpperCase() === 'PENDING')
        .length,
      list: [...existingPendingList, ...txList],
    };
    await setCachedData(transferListKey(network, address, offset, limit), transferListStore);
    logger.info('[transaction-activity] setTransaction applied', {
      network,
      address,
      offset,
      limit,
      pendingCount: transferListStore.pendingCount,
      totalCount: transferListStore.count,
      listCount: transferListStore.list.length,
    });
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
    offset: string = '0',
    limit: string = '15'
  ): Promise<TransferListStore> => {
    logger.info('[transaction-activity] loadTransactions start', {
      network,
      address,
      offset,
      limit,
      openapiNetwork: openapiService.getNetwork(),
    });
    if (openapiService.getNetwork() !== network) {
      // Do nothing if the network is switched
      // Don't update the cache
      return {
        count: 0,
        pendingCount: 0,
        list: [],
      };
    }
    if (isValidFlowAddress(address)) {
      // Get the flow transactions
      const flowResult = await openapiService.getTransfers(
        address,
        parseInt(offset ?? '0'),
        parseInt(limit ?? '15')
      );
      logger.info('[transaction-activity] loadTransactions flow fetched', {
        network,
        address,
        txCount: flowResult?.transactions?.length || 0,
        total: flowResult?.total || 0,
      });
      return this.setTransaction(network, address, flowResult, offset, limit);
    } else if (isValidEthereumAddress(address)) {
      try {
        const evmResult = await openapiService.getEVMTransfers(
          address,
          parseInt(offset ?? '0'),
          parseInt(limit ?? '15')
        );
        if (!evmResult.trxs) {
          throw new Error('Error loading EVM transactions');
        }
        const resultAsFlowResponse: FlowTransactionResponse = {
          total: evmResult.next_page_params
            ? evmResult.next_page_params.items_count
            : evmResult.trxs?.length || 0,
          transactions: evmResult.trxs || [],
        };
        logger.info('[transaction-activity] loadTransactions evm fetched', {
          network,
          address,
          txCount: resultAsFlowResponse.transactions?.length || 0,
          total: resultAsFlowResponse.total || 0,
        });
        return this.setTransaction(network, address, resultAsFlowResponse, offset, limit);
      } catch (error) {
        consoleError('Error loading EVM transactions', error);
        logger.error('[transaction-activity] loadTransactions evm fetch failed', {
          network,
          address,
          offset,
          limit,
          error,
        });
        const emptyResult: FlowTransactionResponse = {
          total: 0,
          transactions: [],
        };

        return this.setTransaction(network, address, emptyResult, offset, limit);
      }
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
    const pendingList = this.getPendingList(network, address);
    this.setPendingList(network, address, pendingList);
    logger.info('[transaction-activity] loadPendingTransactions refreshed', {
      network,
      address,
      size: pendingList.length,
    });
  };

  listAllTransactions = async (
    address: string,
    limit: number,
    offset: number,
    network: string,
    _expiry = 60000, // Keep for backward compatibility
    _forceRefresh = false // Keep for backward compatibility
  ): Promise<{
    count: number;
    list: TransferItem[];
  }> => {
    if (!address) {
      return {
        count: 0,
        list: [],
      };
    }

    const offsetString = offset?.toString() ?? '0';
    const limitString = limit?.toString() ?? '15';

    // Get the cached transaction list
    const transactionListStore = await getValidData<TransferListStore>(
      transferListKey(network, address, offsetString, limitString)
    );

    if (!transactionListStore) {
      return await this.loadTransactions(network, address, offsetString, limitString);
    }

    return transactionListStore;
  };

  listTransactions = async (
    network: string,
    address: string,
    offset: string = '0',
    limit: string = '15'
  ): Promise<TransferItem[]> => {
    const transactionListStore = await this.listAllTransactions(
      address,
      parseInt(limit),
      parseInt(offset),
      network
    );
    return transactionListStore.list;
  };

  listPending = async (network: string, address: string): Promise<TransferItem[]> => {
    return this.getPendingList(network, address);
  };

  getCount = async (
    network: string,
    address: string,
    offset: string,
    limit: string
  ): Promise<number> => {
    const transactionList = await this.listAllTransactions(
      address,
      parseInt(limit),
      parseInt(offset),
      network
    );
    return transactionList.count;
  };

  getFlowscanUrl = async (
    network: string,
    isEmulator: boolean,
    isEvm: string,
    referenceId?: string
  ): Promise<string> => {
    if (isEmulator) {
      return 'http://localhost:8080';
    }

    const fallbackUrl =
      isEvm === 'evm'
        ? network === 'testnet'
          ? 'https://testnet.flowscan.io/evm'
          : 'https://flowscan.io/evm'
        : network === 'testnet'
          ? 'https://testnet.flowscan.io'
          : network === 'crescendo'
            ? 'https://flow-view-source.vercel.app/crescendo'
            : 'https://www.flowscan.io';

    try {
      // Use backend explorer routing endpoint first (redirect=false), then derive base URL.
      const lookupId = referenceId || '0x00000000000000000000000000000000';
      const chain = isEvm === 'evm' ? 'evm' : 'flow';
      const explorerUrl = await ExplorerService.getUrl({
        id: lookupId,
        type: 'address',
        chain,
        network,
      });

      if (explorerUrl) {
        const parsed = new URL(explorerUrl);
        const trimmedPath = parsed.pathname.replace(
          /\/(tx|address|account|contract|token)\/[^/]+\/?$/i,
          ''
        );
        const baseUrl = `${parsed.origin}${trimmedPath}`.replace(/\/+$/, '');
        if (baseUrl) {
          return baseUrl;
        }
      }
    } catch (error) {
      logger.warn(
        '[transaction-activity] getFlowscanUrl explorer endpoint failed, using fallback',
        {
          network,
          isEvm,
          referenceId,
          error,
        }
      );
    }

    return fallbackUrl;
  };

  getViewSourceUrl = async (network: string): Promise<string> => {
    let baseURL = 'https://f.dnz.dev';
    switch (network) {
      case 'mainnet':
        baseURL = 'https://f.dnz.dev';
        break;
      case 'testnet':
        baseURL = 'https://f.dnz.dev';
        break;
      case 'crescendo':
        baseURL = 'https://f.dnz.dev';
        break;
    }
    return baseURL;
  };
}

export default new TransactionActivity();
