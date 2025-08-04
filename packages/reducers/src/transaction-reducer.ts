import BN from 'bignumber.js';

import type {
  TokenType,
  TransactionState,
  TransactionStateString,
  ExtendedTokenInfo,
  Contact,
  WalletAddress,
  FlowNetwork,
} from '@onflow/frw-shared/types';
import { isValidEthereumAddress, consoleError, trimDecimalAmount } from '@onflow/frw-shared/utils';

export const INITIAL_TRANSACTION_STATE: TransactionState = {
  network: 'testnet',
  currentTxState: '',
  parentAddress: '',
  parentCoaAddress: '',
  parentChildAddresses: [],
  fromAddress: '',
  canReceive: true,
  tokenType: 'Flow',
  fromAddressType: 'Evm',
  toAddressType: 'Evm',
  toAddress: '',
  tokenInfo: {
    name: 'Flow',
    address: '0x4445e7ad11568276',
    contractName: 'FlowToken',
    path: {
      balance: '/public/flowTokenBalance',
      receiver: '/public/flowTokenReceiver',
      vault: '/storage/flowTokenVault',
    },
    logoURI:
      'https://cdn.jsdelivr.net/gh/FlowFans/flow-token-list@main/token-registry/A.1654653399040a61.FlowToken/logo.svg',
    decimals: 8,
    symbol: 'flow',
    id: '',
    coin: '',
    unit: '',
    balance: '0',
    price: '0',
    change24h: 0,
    total: '0',
    icon: '',
    priceInUSD: '0',
    balanceInUSD: '0',
    priceInFLOW: '0',
    balanceInFLOW: '0',
  },
  amount: '',
  fiatAmount: '',
  fiatCurrency: 'USD',
  fiatOrCoin: 'coin',
  balanceExceeded: false,
};

type TransactionAction =
  | {
      // Called when initialising or when changing the from address
      type: 'initTransactionState' | 'setFromAddress';
      payload: {
        network: FlowNetwork;
        // the parent address of the account we're sending from
        parentAddress: WalletAddress;
        parentCoaAddress: WalletAddress;
        parentChildAddresses: WalletAddress[];
        // the address of the account we're sending from
        fromAddress: WalletAddress;
        fromContact?: Contact;
      };
    }
  | {
      type: 'setTokenInfo';
      payload: {
        tokenInfo: ExtendedTokenInfo;
      };
    }
  | {
      type: 'setTokenType';
      payload: TokenType;
    }
  | {
      type: 'setToAddress';
      payload: {
        address: WalletAddress;
        contact?: Contact;
      };
    }
  | {
      type: 'setAmount';
      payload: string; // the amount of the transaction as a string
    }
  | {
      type: 'setFiatOrCoin';
      payload: 'fiat' | 'coin';
    }
  | {
      type: 'switchFiatOrCoin';
    }
  | {
      type: 'setAmountToMax';
    }
  | {
      type: 'finalizeAmount';
    };

export const getTransactionStateString = (state: TransactionState): TransactionStateString | '' => {
  if (!state.tokenType || !state.fromAddressType || !state.toAddressType) return '';
  return `${state.tokenType}From${state.fromAddressType}To${state.toAddressType}`;
};

const updateTxState = (state: TransactionState): TransactionState => {
  return {
    ...state,
    currentTxState: getTransactionStateString(state),
  };
};

export const transactionReducer = (
  state: TransactionState,
  action: TransactionAction
): TransactionState => {
  switch (action.type) {
    case 'initTransactionState':
    case 'setFromAddress': {
      const {
        network,
        parentAddress,
        parentCoaAddress,
        parentChildAddresses,
        fromAddress,
        fromContact,
      } = action.payload;
      // Set from address type based on the from address
      const fromAddressType = isValidEthereumAddress(fromAddress)
        ? 'Evm'
        : fromAddress === parentAddress
          ? 'Cadence'
          : 'Child';
      return updateTxState({
        // If the network is changing, reset the state
        ...(network !== state.network ? INITIAL_TRANSACTION_STATE : state),
        network,
        parentAddress: parentAddress,
        parentCoaAddress: parentCoaAddress,
        parentChildAddresses: parentChildAddresses,
        fromAddress,
        fromAddressType: fromAddressType,
        fromContact,
      });
    }
    case 'setTokenInfo': {
      // Set the token type based on the token symbol from the new tokenInfo
      const tokenType = action.payload.tokenInfo.symbol.toLowerCase() !== 'flow' ? 'FT' : 'Flow';
      // Directly update tokenInfo and trigger amount recalculation
      return transactionReducer(
        {
          ...state,
          tokenInfo: action.payload.tokenInfo, // Update tokenInfo
          tokenType,
        },
        {
          type: 'setAmount',
          payload: state.amount, // Recalculate amount based on new token info
        }
      );
    }
    case 'setToAddress': {
      const { address, contact } = action.payload;
      const toAddressType = isValidEthereumAddress(address) ? 'Evm' : 'Cadence';
      return updateTxState({
        ...state,
        toAddress: address,
        toAddressType,
        toContact: contact,
      });
    }
    case 'setFiatOrCoin': {
      return { ...state, fiatOrCoin: action.payload };
    }
    case 'switchFiatOrCoin': {
      return {
        ...state,
        fiatOrCoin: state.fiatOrCoin === 'fiat' ? 'coin' : 'fiat',
      };
    }
    case 'setAmountToMax': {
      // Check if entering in coin or fiat

      if (state.fiatOrCoin === 'coin') {
        // Note that this will truncate the balance to the max number of decimals allowed by the token
        // It should not be possible to have a balance that is greater than the max number of decimals allowed by the token
        return transactionReducer(state, {
          type: 'setAmount',
          payload: state.tokenInfo.availableBalance || state.tokenInfo.balance,
        });
      } else if (state.fiatOrCoin !== 'fiat') {
        throw new Error('Not specified if entering in coin or fiat');
      }
      // This will calculate the max fiat amount that can be entered
      const stateInCoinWithMaxAmount = transactionReducer(
        {
          ...state,
          fiatOrCoin: 'coin',
        },
        {
          type: 'setAmount',
          payload: state.tokenInfo.availableBalance || state.tokenInfo.balance,
        }
      );
      return {
        ...stateInCoinWithMaxAmount,
        fiatOrCoin: 'fiat',
      };
    }
    case 'finalizeAmount': {
      return {
        ...state,
        amount: trimDecimalAmount(state.amount, state.tokenInfo.decimals, 'clean'),
        fiatAmount: trimDecimalAmount(state.fiatAmount, 8, 'clean'),
      };
    }
    case 'setAmount': {
      // Validate the amount
      let amountInCoin = '0.0';
      let amountInFiat = '0.0';
      let balanceExceeded = false;
      let remainingBalance = new BN(0);
      // Check available balance as some token may have a storage allocation
      const balance = new BN(state.tokenInfo.availableBalance || state.tokenInfo.balance || '0.0');
      const price = new BN(state.tokenInfo.price || '0.0');

      if (state.fiatOrCoin === 'fiat') {
        // Strip the amount entered to 8 decimal places
        amountInFiat = trimDecimalAmount(action.payload, 8, 'entering');
        // Check if the balance is exceeded
        const fiatAmountAsBN = new BN(trimDecimalAmount(amountInFiat, 8, 'clean'));
        const calculatedAmountInCoin = price.isZero() ? new BN(0) : fiatAmountAsBN.dividedBy(price);

        // Figure out the amount in coin trimmed to the max decimals
        if (calculatedAmountInCoin.isNaN()) {
          amountInCoin = '0.0';
        } else {
          amountInCoin = calculatedAmountInCoin.toFixed(state.tokenInfo.decimals, BN.ROUND_DOWN);
        }
        // Calculate the remaining balance after the transaction
        remainingBalance = balance.minus(new BN(amountInCoin));
      } else if (state.fiatOrCoin === 'coin') {
        // Should limit non-evm networks to 8 decimals
        const maxNetworkDecimals =
          state.fromAddressType === 'Evm' && state.toAddressType === 'Evm' ? 18 : 8;
        // Check if the amount entered has too many decimal places
        amountInCoin = trimDecimalAmount(
          action.payload,
          Math.min(maxNetworkDecimals, state.tokenInfo.decimals),
          'entering'
        );

        // Check if the balance is exceeded
        const amountBN = new BN(
          trimDecimalAmount(amountInCoin, state.tokenInfo.decimals, 'clean') || '0'
        );
        // Calculate the remaining balance after the transaction
        remainingBalance = balance.minus(amountBN);
        // Calculate fiat amount
        const calculatedFiatAmount = amountBN.times(price);
        amountInFiat = calculatedFiatAmount.toFixed(8, BN.ROUND_DOWN);
      } else {
        consoleError('Not specified if entering in coin or fiat');
        return state;
      }
      // Check the remaining balance to see if it's exceeded
      if (remainingBalance.isLessThan(0)) {
        balanceExceeded = true;
      } else {
        balanceExceeded = false;
      }
      if (amountInCoin === state.amount && amountInFiat === state.fiatAmount) {
        // No changes to the state
        return state;
      }
      // Return the new state with the amount (in coin), the fiat amount, and whether the balance was exceeded
      return {
        ...state,
        amount: amountInCoin,
        fiatAmount: amountInFiat,
        balanceExceeded,
      };
    }
  }
  return state;
};
