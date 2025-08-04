# 🔄 @onflow/frw-reducers

> Pure state management reducers for Flow Reference Wallet

[![npm version](https://img.shields.io/npm/v/@onflow/frw-reducers.svg)](https://www.npmjs.com/package/@onflow/frw-reducers)
[![License: LGPL v3](https://img.shields.io/badge/License-LGPL%20v3-blue.svg)](https://www.gnu.org/licenses/lgpl-3.0)

## 📦 Overview

`@onflow/frw-reducers` provides pure reducer functions for predictable state management in Flow Reference Wallet applications. These reducers are framework-agnostic and can be used with any state management solution.

Reducers are awesome. They work natively in React or using a state library like Zustand. Reducers are a great way to isolate state logic into clean reusable functions that are easily testable. [Learn about reducers](https://react.dev/learn/extracting-state-logic-into-a-reducer).

### Key Features

- 🎯 **Pure Functions**: Side-effect free, predictable state transformations
- 🔧 **Framework Agnostic**: Works with Redux, Zustand, or custom state management
- 📊 **Type Safe**: Full TypeScript support with strict typing
- 🌳 **Tree Shakeable**: Import only what you need
- 🚀 **Zero Dependencies**: Minimal footprint (only depends on frw-shared)

## 📥 Installation

```bash
npm install @onflow/frw-reducers
```

```bash
yarn add @onflow/frw-reducers
```

```bash
pnpm add @onflow/frw-reducers
```

## 🚀 Quick Start

### Basic Usage with React useReducer

```typescript
import { useReducer } from 'react';
import {
  transactionReducer,
  INITIAL_TRANSACTION_STATE
} from '@onflow/frw-reducers';

function SendTokenComponent() {
  const [state, dispatch] = useReducer(
    transactionReducer,
    INITIAL_TRANSACTION_STATE
  );

  const handleAmountChange = (amount: string) => {
    dispatch({ type: 'setAmount', payload: amount });
  };

  return (
    <div>
      <input
        value={state.amount}
        onChange={(e) => handleAmountChange(e.target.value)}
      />
      <button onClick={() => dispatch({ type: 'setAmountToMax' })}>
        Max
      </button>
    </div>
  );
}
```

### Multiple Reducers

```typescript
import { useReducer } from 'react';
import {
  registerReducer,
  importProfileReducer,
  INITIAL_REGISTER_STATE,
  INITIAL_IMPORT_STATE,
} from '@onflow/frw-reducers';

function WalletSetup() {
  const [registerState, registerDispatch] = useReducer(registerReducer, INITIAL_REGISTER_STATE);

  const [importState, importDispatch] = useReducer(importProfileReducer, INITIAL_IMPORT_STATE);

  // Switch between registration and import flows
  const isRegistering = registerState.step > 0;
  const isImporting = importState.step > 0;
}
```

## 📚 Available Reducers

### 💸 Transaction Reducer

Manages transaction state for Flow blockchain token transfer transacations. The reducer ensures that:

- The correct conversion from token to fiat is applied
- The exact decimal places are preserved when entering and using values
- No floating point conversion takes place
- Exact maximum value is set when the user chooses that
- The correct script is used by by hashing together the token, source, and destination addresses to find the right combination

```typescript
import {
  transactionReducer,
  TransactionState,
  INITIAL_TRANSACTION_STATE,
} from '@onflow/frw-reducers';
import { useReducer } from 'react';

// Use in a React component
function SendTokenView() {
  const [transactionState, dispatch] = useReducer(transactionReducer, INITIAL_TRANSACTION_STATE);

  // Initialize transaction with wallet addresses
  useEffect(() => {
    dispatch({
      type: 'initTransactionState',
      payload: {
        parentAddress: mainAddress, // Main Flow address
        fromAddress: currentWallet.address, // Selected wallet
        fromContact: {
          address: currentWallet.address,
          contact_name: userInfo?.nickname || '',
          username: userInfo?.username || '',
          avatar: userInfo?.avatar || '',
        },
      },
    });
  }, [mainAddress, currentWallet]);

  // Handle token selection
  const handleTokenChange = (symbol: string) => {
    const coinInfo = coins.find((coin) => coin.unit.toLowerCase() === symbol.toLowerCase());

    dispatch({
      type: 'setTokenInfo',
      payload: { tokenInfo: coinInfo },
    });
  };

  // Handle recipient address
  const handleRecipient = (toAddress: string) => {
    dispatch({
      type: 'setToAddress',
      payload: {
        address: toAddress,
        contact: findContact(toAddress), // optional
      },
    });
  };

  // Handle amount input
  const handleAmountChange = (amount: string) => {
    dispatch({ type: 'setAmount', payload: amount });
  };

  // Use maximum balance
  const handleMaxClick = () => {
    dispatch({ type: 'setAmountToMax' });
  };

  // Toggle fiat/coin display
  const handleSwitchFiatOrCoin = () => {
    dispatch({ type: 'switchFiatOrCoin' });
  };

  // Clean up amount before submission
  const handleFinalizeAmount = () => {
    dispatch({ type: 'finalizeAmount' });
  };
}
```

#### Transaction Actions

- `initTransactionState` - Initialize transaction with addresses
- `setTokenInfo` - Set token information (updates token type automatically)
- `setTokenType` - Set token type (Flow or FT)
- `setfromAddressType` - Set source network (Cadence, Child, or Evm)
- `settoAddressType` - Set destination network (Cadence or Evm)
- `setToAddress` - Set recipient address and optional contact
- `setAmount` - Set transaction amount (handles fiat/coin conversion)
- `setFiatOrCoin` - Set input mode ('fiat' or 'coin')
- `switchFiatOrCoin` - Toggle between fiat and coin input
- `setAmountToMax` - Set amount to maximum available balance
- `finalizeAmount` - Clean up decimal places before submission

### 📝 Register Reducer

Manages user registration flow state.

```typescript
import { useReducer } from 'react';
import {
  registerReducer,
  INITIAL_REGISTER_STATE
} from '@onflow/frw-reducers';

function RegistrationFlow() {
  const [state, dispatch] = useReducer(
    registerReducer,
    INITIAL_REGISTER_STATE
  );

  // Handle form inputs
  const handleUsernameChange = (username: string) => {
    dispatch({ type: 'SET_USERNAME', payload: username });
  };

  const handleEmailChange = (email: string) => {
    dispatch({ type: 'SET_EMAIL', payload: email });
  };

  // Navigation
  const nextStep = () => dispatch({ type: 'NEXT_STEP' });
  const prevStep = () => dispatch({ type: 'PREV_STEP' });

  // Handle async operations
  const submitRegistration = async () => {
    dispatch({ type: 'SET_LOADING', payload: true });

    try {
      await registerUser(state.username, state.email);
      nextStep();
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  // Reset form
  const resetForm = () => dispatch({ type: 'RESET' });

  return (
    <div>
      {state.error && <p>Error: {state.error}</p>}
      <input
        value={state.username}
        onChange={(e) => handleUsernameChange(e.target.value)}
        disabled={state.isLoading}
      />
      {/* ... rest of UI */}
    </div>
  );
}
```

#### Register Actions

- `SET_USERNAME` - Set username
- `SET_EMAIL` - Set email
- `SET_PROFILE_IMAGE` - Set profile image
- `NEXT_STEP` - Go to next registration step
- `PREV_STEP` - Go to previous step
- `SET_LOADING` - Set loading state
- `SET_ERROR` - Set error message
- `RESET` - Reset to initial state

### 👤 Import Profile Reducer

Manages profile import flow state.

```typescript
import { useReducer } from 'react';
import {
  importProfileReducer,
  INITIAL_IMPORT_STATE
} from '@onflow/frw-reducers';

function ImportProfileFlow() {
  const [state, dispatch] = useReducer(
    importProfileReducer,
    INITIAL_IMPORT_STATE
  );

  // Handle mnemonic input
  const handleMnemonicChange = (mnemonic: string) => {
    dispatch({ type: 'SET_MNEMONIC', payload: mnemonic });
  };

  // Discover accounts from mnemonic
  const discoverAccounts = async () => {
    dispatch({ type: 'SET_LOADING', payload: true });

    try {
      const accounts = await fetchAccountsFromMnemonic(state.mnemonic);
      dispatch({ type: 'SET_ACCOUNTS', payload: accounts });
      dispatch({ type: 'NEXT_STEP' });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  // Select account to import
  const selectAccount = (account: Account) => {
    dispatch({ type: 'SELECT_ACCOUNT', payload: account });
  };

  // Navigation
  const nextStep = () => dispatch({ type: 'NEXT_STEP' });
  const prevStep = () => dispatch({ type: 'PREV_STEP' });
  const reset = () => dispatch({ type: 'RESET' });

  return (
    <div>
      {state.step === 0 && (
        <textarea
          value={state.mnemonic}
          onChange={(e) => handleMnemonicChange(e.target.value)}
          placeholder="Enter recovery phrase..."
        />
      )}

      {state.step === 1 && (
        <div>
          <h3>Select Account</h3>
          {state.accounts.map(account => (
            <button
              key={account.address}
              onClick={() => selectAccount(account)}
            >
              {account.address}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
```

#### Import Profile Actions

- `SET_MNEMONIC` - Set recovery phrase
- `SET_ACCOUNTS` - Set discovered accounts
- `SELECT_ACCOUNT` - Select account to import
- `NEXT_STEP` - Go to next import step
- `PREV_STEP` - Go to previous step
- `SET_LOADING` - Set loading state
- `SET_ERROR` - Set error message
- `RESET` - Reset to initial state

## 💡 Usage Patterns

### With Zustand

```typescript
import { create } from 'zustand';
import { transactionReducer } from '@onflow/frw-reducers';

const useTransactionStore = create((set) => ({
  state: { transactions: {}, pending: [], completed: [], failed: [] },
  dispatch: (action) =>
    set((store) => ({
      state: transactionReducer(store.state, action)
    }))
}));

// Use in component
function TransactionList() {
  const { state, dispatch } = useTransactionStore();

  const addTransaction = (tx) => {
    dispatch({ type: 'ADD_TRANSACTION', payload: tx });
  };

  return (
    <div>
      {state.pending.map(id => (
        <div key={id}>Transaction {id} pending...</div>
      ))}
    </div>
  );
}
```

### Custom State Management

```typescript
import { registerReducer } from '@onflow/frw-reducers';

class RegistrationManager {
  private state = { step: 0, username: '' };
  private listeners: Function[] = [];

  dispatch(action: any) {
    this.state = registerReducer(this.state, action);
    this.listeners.forEach((fn) => fn(this.state));
  }

  subscribe(fn: Function) {
    this.listeners.push(fn);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== fn);
    };
  }

  getState() {
    return this.state;
  }
}
```

### Combining Reducers with Context

```typescript
import { useReducer, createContext, useContext } from 'react';
import {
  transactionReducer,
  registerReducer,
  importProfileReducer,
  INITIAL_TRANSACTION_STATE,
  INITIAL_REGISTER_STATE,
  INITIAL_IMPORT_STATE
} from '@onflow/frw-reducers';

// Create a combined state context
const WalletContext = createContext(null);

export function WalletProvider({ children }) {
  const [transactionState, transactionDispatch] = useReducer(
    transactionReducer,
    INITIAL_TRANSACTION_STATE
  );

  const [registerState, registerDispatch] = useReducer(
    registerReducer,
    INITIAL_REGISTER_STATE
  );

  const [importState, importDispatch] = useReducer(
    importProfileReducer,
    INITIAL_IMPORT_STATE
  );

  const value = {
    transaction: { state: transactionState, dispatch: transactionDispatch },
    register: { state: registerState, dispatch: registerDispatch },
    import: { state: importState, dispatch: importDispatch }
  };

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  );
}

// Use in components
function MyComponent() {
  const { transaction, register } = useContext(WalletContext);

  const sendToken = () => {
    transaction.dispatch({ type: 'setAmount', payload: '10' });
  };
}
```

## 🏗️ Architecture

```
@onflow/frw-reducers/
├── src/
│   ├── transaction-reducer.ts   # Transaction state management
│   ├── register-reducer.ts      # Registration flow state
│   ├── import-profile-reducer.ts # Import flow state
│   └── index.ts                 # Main exports
```

## 🧪 Testing

The reducers are pure functions, making them easy to test:

```typescript
import { transactionReducer, INITIAL_TRANSACTION_STATE } from '@onflow/frw-reducers';

describe('transactionReducer', () => {
  it('should set amount correctly', () => {
    const action = {
      type: 'setAmount',
      payload: '100.5',
    };

    const newState = transactionReducer(INITIAL_TRANSACTION_STATE, action);

    expect(newState.amount).toBe('100.5');
    expect(newState.balanceExceeded).toBe(false);
  });

  it('should handle max amount', () => {
    const stateWithBalance = {
      ...INITIAL_TRANSACTION_STATE,
      tokenInfo: {
        ...INITIAL_TRANSACTION_STATE.tokenInfo,
        balance: '1000.0',
        decimals: 8,
      },
    };

    const newState = transactionReducer(stateWithBalance, {
      type: 'setAmountToMax',
    });

    expect(newState.amount).toBe('1000.0');
  });
});
```

## 🛡️ Type Safety

All reducers come with full TypeScript support:

```typescript
import { useReducer } from 'react';
import type { TransactionState, RegisterState, ImportState } from '@onflow/frw-reducers';

// Type-safe hooks
function useTransactionReducer() {
  const [state, dispatch] = useReducer(transactionReducer, INITIAL_TRANSACTION_STATE);

  // Type-safe dispatch wrappers
  const setAmount = (amount: string) => {
    dispatch({ type: 'setAmount', payload: amount });
  };

  const setTokenInfo = (tokenInfo: ExtendedTokenInfo) => {
    dispatch({ type: 'setTokenInfo', payload: { tokenInfo } });
  };

  return { state, setAmount, setTokenInfo };
}

// Discriminated unions ensure type safety
type TransactionAction =
  | { type: 'setAmount'; payload: string }
  | { type: 'setAmountToMax' }
  | { type: 'switchFiatOrCoin' }
  | { type: 'setTokenInfo'; payload: { tokenInfo: ExtendedTokenInfo } };
```

## 🧪 Development

```bash
# Install dependencies
pnpm install

# Build the package
pnpm build

# Run tests
pnpm test

# Type checking
pnpm type-check

# Linting
pnpm lint
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

### Adding a New Reducer

1. Create a new file in `src/`
2. Define state interface and action types
3. Implement the pure reducer function
4. Add tests in `__tests__/`
5. Export from `index.ts`

## 📄 License

This project is licensed under the LGPL-3.0-or-later License - see the LICENSE file for details.

## 🔗 Related Packages

- [@onflow/frw-shared](../shared) - Shared types and utilities
- [@onflow/frw-core](../core) - Core business logic and services
- [@onflow/frw-data-model](../data-model) - Cache data model
- [@onflow/frw-extension-shared](../extension-shared) - Extension utilities
