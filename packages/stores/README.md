# @onflow/frw-stores

State management for Flow Reference Wallet projects using Zustand.

## Overview

This package contains all Zustand stores that manage application state for the Flow Reference Wallet ecosystem. It provides reactive state management with a clean API for UI components.

## Stores

### useSendStore

Manages transaction sending state including form data, validation, and transaction progress.

```typescript
import { useSendStore, sendSelectors, sendHelpers } from '@onflow/frw-stores';

// In components
const { formData, isValid, errors } = useSendStore();

// Selectors for computed values
const isFormValid = useSendStore(sendSelectors.isFormValid);

// Helper functions
sendHelpers.updateRecipient(address);
```

### useTokenStore

Manages token balances, NFT collections, and asset-related state.

```typescript
import { useTokenStore, tokenSelectors, tokenHelpers } from '@onflow/frw-stores';

// In components
const { balances, nfts, isLoading } = useTokenStore();

// Get account balance
const balance = await tokenHelpers.getAccountBalance(address, 'flow', 'mainnet');

// Fetch batch balances
const balances = await tokenHelpers.fetchBatchFlowBalances(addresses);
```

### useWalletStore

Manages wallet accounts, active account selection, and wallet-level state.

```typescript
import { useWalletStore, walletSelectors, walletHelpers } from '@onflow/frw-stores';

// In components
const { accounts, activeAccount, isLoading } = useWalletStore();

// Selectors
const accountCount = useWalletStore(walletSelectors.accountCount);

// Helper functions
walletHelpers.switchAccount(accountId);
```

## Types

The package also exports TypeScript types for state management:

```typescript
import type { NFTModel, TokenInfo, SendState } from '@onflow/frw-stores';
```

## Store Architecture

All stores follow a consistent pattern:

1. **State**: Core data and loading states
2. **Actions**: Functions to update state
3. **Selectors**: Computed values and state queries
4. **Helpers**: Utility functions for complex operations

### Example Store Usage

```typescript
import { useTokenStore } from '@onflow/frw-store';

function TokenBalance({ address }: { address: string }) {
  const { balances, getAccountBalance } = useTokenStore();
  
  useEffect(() => {
    getAccountBalance(address, 'flow', 'mainnet');
  }, [address]);
  
  return <Text>{balances[address] || '0 FLOW'}</Text>;
}
```

## Integration with Services

Stores integrate with the services layer for data fetching and business logic:

```typescript
import { FlowService } from '@onflow/frw-services';

// Inside store actions
const flowService = new FlowService();
const accountData = await flowService.getAccount(address);
```

## Dependencies

- `zustand` - State management library
- `@onflow/frw-services` - Service layer for business logic
- `@onflow/frw-types` - Shared type definitions
- `@onflow/frw-api` - API layer
- `@onflow/frw-workflow` - Flow blockchain operations