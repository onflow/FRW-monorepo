import * as fcl from '@onflow/fcl';
import { TransactionError } from 'web3';

import { coinListKey } from '@onflow/flow-wallet-data-model/cache-data-keys';
import type { TransferItem } from '@onflow/flow-wallet-shared/types/transaction-types';
import { consoleError, consoleWarn } from '@onflow/flow-wallet-shared/utils/console-log';

import { mixpanelTrack } from './mixpanel';
import preferenceService from './preference';
import transactionActivityService from './transaction-activity';
import userWalletService from './userWallet';
import { triggerRefresh } from '../utils/data-cache';

// Type definitions for better type safety
interface PollingFunction<T> {
  (): Promise<T>;
}

interface PollingCondition<T> {
  (result: T): boolean;
}

interface TransactionNotification {
  url: string;
  title: string;
  body: string;
  icon: string;
}

interface TransactionErrorInfo {
  errorMessage: string;
  errorCode?: number;
}

interface TransactionMonitoringOptions {
  sendNotification?: boolean;
  title?: string;
  body?: string;
  icon?: string;
  notificationCallback?: (notification: TransactionNotification) => void;
  errorCallback?: (error: TransactionErrorInfo) => void;
}

class TransactionMonitoringService {
  poll = async <T>(
    fn: PollingFunction<T>,
    fnCondition: PollingCondition<T>,
    ms: number
  ): Promise<T> => {
    const result = await fn();
    if (fnCondition(result)) {
      await this.wait(ms);
      return this.poll(fn, fnCondition, ms);
    }
    return result;
  };

  wait = (ms = 1000): Promise<void> => {
    return new Promise((resolve) => setTimeout(resolve, ms));
  };

  pollingTransaction = async (txId: string, network: string): Promise<any> => {
    if (!txId || !txId.match(/^0?x?[0-9a-fA-F]{64}/)) {
      return;
    }

    const fetchReport = async () =>
      (await fetch(`https://rest-${network}.onflow.org/v1/transaction_results/${txId}`)).json();
    const validate = (result: any) => result.status !== 'Sealed';
    return await this.poll(fetchReport, validate, 3000);
  };

  pollTransferList = async (address: string, txHash: string, maxAttempts = 5): Promise<void> => {
    const network = await userWalletService.getNetwork();
    const currency = (await preferenceService.getDisplayCurrency())?.code || 'USD';
    let attempts = 0;
    try {
      const poll = async (): Promise<void> => {
        if (attempts >= maxAttempts) {
          consoleWarn('Max polling attempts reached');
          return;
        }

        const { list: newTransactions } = await transactionActivityService.loadTransactions(
          network,
          address,
          '0',
          '15'
        );

        const foundTx = newTransactions?.find((tx: TransferItem) => txHash.includes(tx.hash));
        if (foundTx && foundTx.indexed) {
          // Refresh the coin list
          triggerRefresh(coinListKey(network, address, currency));
        } else {
          // All of the transactions have not been picked up by the indexer yet
          attempts++;
          setTimeout(poll, 5000); // Poll every 5 seconds
        }
      };

      await poll();
    } catch (error) {
      consoleError('pollTransferList error', error);
    }
  };

  listenTransaction = async (
    txId: string,
    options: TransactionMonitoringOptions = {}
  ): Promise<void> => {
    const {
      sendNotification = true,
      title = '',
      body = '',
      icon = '',
      notificationCallback,
      errorCallback,
    } = options;

    if (!txId || !txId.match(/^0?x?[0-9a-fA-F]{64}/)) {
      return;
    }

    const address = (await userWalletService.getCurrentAddress()) || '0x';
    const network = await userWalletService.getNetwork();
    const currency = (await preferenceService.getDisplayCurrency())?.code || 'USD';
    let txHash = txId;

    try {
      transactionActivityService.setPending(network, address, txId, icon, title, {
        status: 'PENDING',
        token: 'Exec Transaction',
      });
      const fclTx = fcl.tx(txId);

      // Wait for the transaction to be executed
      const txStatusExecuted = await fclTx.onceExecuted();

      // Update the pending transaction with the transaction status
      txHash = await transactionActivityService.updatePending(
        network,
        address,
        txId,
        txStatusExecuted
      );

      // Track the transaction result
      mixpanelTrack.track('transaction_result', {
        tx_id: txId,
        is_successful: true,
      });

      try {
        // Send a notification to the user only on success
        if (sendNotification && notificationCallback) {
          const baseURL = await this.getFlowscanUrl();
          let notificationUrl = '';

          if (baseURL.includes('evm')) {
            // It's an EVM transaction
            const evmEvent = txStatusExecuted.events.find(
              (event: any) => event.type.includes('EVM') && !!event.data?.hash
            );
            if (evmEvent) {
              const hashBytes = evmEvent.data.hash.map((byte: number) => byte);
              const hash = '0x' + Buffer.from(hashBytes).toString('hex');
              notificationUrl = `${baseURL}/tx/${hash}`;
            } else {
              const evmAddress = await userWalletService.getCurrentEvmAddress();
              notificationUrl = `${baseURL}/address/${evmAddress}`;
            }
          } else {
            // It's a Flow transaction
            notificationUrl = `${baseURL}/tx/${txId}`;
          }

          notificationCallback({
            url: notificationUrl,
            title,
            body,
            icon,
          });
        }
      } catch (err: unknown) {
        // We don't want to throw an error if the notification fails
        consoleError('listenTransaction notification error ', err);
      }

      // Refresh the account balance
      triggerRefresh(coinListKey(network, address, currency));

      // Wait for the transaction to be sealed
      const txStatusSealed = await fclTx.onceSealed();

      // Update the pending transaction with the transaction status
      txHash = await transactionActivityService.updatePending(
        network,
        address,
        txId,
        txStatusSealed
      );

      // Refresh the account balance after sealed status - just to be sure
      triggerRefresh(coinListKey(network, address, currency));
    } catch (err: unknown) {
      // An error has occurred while listening to the transaction
      let errorMessage = 'unknown error';
      let errorCode: number | undefined = undefined;

      if (err instanceof TransactionError) {
        errorCode = err.code;
        errorMessage = err.message;
      } else {
        if (err instanceof Error) {
          errorMessage = err.message;
        } else if (typeof err === 'string') {
          errorMessage = err;
        }
        // From fcl-core transaction-error.ts
        const ERROR_CODE_REGEX = /\[Error Code: (\d+)\]/;
        const match = errorMessage.match(ERROR_CODE_REGEX);
        errorCode = match ? parseInt(match[1], 10) : undefined;
      }

      consoleWarn({
        msg: 'transactionError',
        errorMessage,
        errorCode,
      });

      // Track the transaction error
      mixpanelTrack.track('transaction_result', {
        tx_id: txId,
        is_successful: false,
        error_message: errorMessage,
      });

      // Notify about the error through callback
      if (errorCallback) {
        errorCallback({
          errorMessage,
          errorCode,
        });
      }
    } finally {
      if (txHash) {
        // Start polling for transfer list updates
        await this.pollTransferList(address, txHash);
      }
    }
  };

  clearPending = async (): Promise<void> => {
    const network = await userWalletService.getNetwork();
    const address = await userWalletService.getCurrentAddress();
    if (address) {
      transactionActivityService.clearPending(network, address);
    }
  };

  getFlowscanUrl = async (): Promise<string> => {
    const network = await userWalletService.getNetwork();
    const isEmulator = await userWalletService.getEmulatorMode();
    const isEvm = await userWalletService.getActiveAccountType();

    if (isEmulator) {
      return 'http://localhost:8080';
    }

    // Check if it's an EVM wallet and update the base URL
    if (isEvm === 'evm') {
      switch (network) {
        case 'testnet':
          return 'https://testnet.flowscan.io/evm';
        case 'mainnet':
          return 'https://flowscan.io/evm';
        default:
          return 'https://flowscan.io/evm';
      }
    } else {
      // Set baseURL based on the network
      switch (network) {
        case 'testnet':
          return 'https://testnet.flowscan.io';
        case 'mainnet':
          return 'https://www.flowscan.io';
        case 'crescendo':
          return 'https://flow-view-source.vercel.app/crescendo';
        default:
          return 'https://www.flowscan.io';
      }
    }
  };

  getViewSourceUrl = async (): Promise<string> => {
    const network = await userWalletService.getNetwork();
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

  getTransactions = async (
    address: string,
    limit: number,
    offset: number,
    _expiry = 60000,
    _forceRefresh = false
  ): Promise<{
    count: number;
    list: TransferItem[];
  }> => {
    return address
      ? transactionActivityService.listAllTransactions(
          userWalletService.getNetwork(),
          address,
          `${offset}`,
          `${limit}`
        )
      : {
          count: 0,
          list: [],
        };
  };

  getPendingTx = async (): Promise<TransferItem[]> => {
    const network = await userWalletService.getNetwork();
    const address = await userWalletService.getCurrentAddress();
    if (!address) {
      return [];
    }
    const pending = await transactionActivityService.listPending(network, address);
    return pending;
  };
}

export default new TransactionMonitoringService();
