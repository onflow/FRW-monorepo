# TanStack Query Guide

## Overview

TanStack Query integration in Flow Reference Wallet (FRW) replaces complex
manual caching with intelligent, declarative data fetching. The system
automatically manages cache times based on data types and provides
cross-platform storage persistence.

## Architecture

TanStack Query follows the project's MVVM architecture:

```
Apps (RN/Extension) → QueryProvider
Screens              → useQuery hooks
Stores               → query-core methods
Context              → Global QueryClient
```

## Intelligent Caching

Data is automatically categorized with appropriate cache times:

```typescript
// Type-safe domain system with automatic categorization:
import { QueryDomain, FlatQueryDomain, DataCategory } from '@onflow/frw-types';

// Cache times ordered by freshness requirement:
DataCategory.FINANCIAL    → 0ms      → TOKENS, BALANCE, NFTS
DataCategory.SESSION      → 2min     → AUTH, TEMP
DataCategory.USER_SETTINGS → 5min    → ADDRESSBOOK, CONTACTS
DataCategory.STATIC       → 30min    → CHAIN_INFO, SUPPORTED_TOKENS
DataCategory.PERSISTENT   → ∞        → CONFIG, CONSTANTS

// Use FlatQueryDomain for easy access
FlatQueryDomain.TOKENS    // 'tokens' → auto-categorized as FINANCIAL
FlatQueryDomain.CONFIG    // 'config' → auto-categorized as PERSISTENT
```

## Data Usage Patterns

**TanStack Query handles both API and non-API data:**

### API Data (Network Requests)

- **Financial (0ms)**: Real-time blockchain data (`tokens`, `balance`, `nfts`)
- **Session (2min)**: Auth tokens, temporary API state (`auth`, `temp`)
- **User Settings (5min)**: Medium-frequency API data (`addressbook`,
  `contacts`)
- **Static (30min)**: Rarely-changing API data (`chain-info`,
  `supported-tokens`)

### Non-API Data (Local/Computed Data)

- **Persistent (∞)**: Configuration, constants, computed values (`config`,
  `metadata`)
- **Session (2min)**: Temporary app state, UI state (`temp`)
- **Derived**: Computed data from other queries (using `select` option)

## Integrated Platform Storage

TanStack Query uses the existing FRW strongly-typed storage system:

- **Unified Storage**: Uses existing `ServiceContext.storage` instance
- **Type Safety**: Query cache stored under `'tanstack-query-cache'` key in
  `StorageKeyMap`
- **Cross-Platform**: Automatic platform detection (React Native MMKV, Extension
  chrome.storage, Web localStorage)
- **Versioned Data**: All cache data includes version, createdAt, updatedAt
  metadata
- **Lazy Loading**: Storage adapter prevents circular dependencies with lazy
  imports

## Adding New Queries

### 1. Define Query Keys

```typescript
// packages/stores/src/userStore.query.ts
import { FlatQueryDomain } from '@onflow/frw-types';

export const userQueryKeys = {
  all: [FlatQueryDomain.ADDRESSBOOK] as const, // Auto-categorized as USER_SETTINGS (5min)
  contacts: () => [...userQueryKeys.all, FlatQueryDomain.CONTACTS] as const,
  contact: (id: string) => [...userQueryKeys.all, id] as const,
};
```

### 2. Create Query Functions

```typescript
export const userQueries = {
  fetchContacts: async (): Promise<Contact[]> => {
    const service = addressBookService();
    return await service.getContacts();
  },

  fetchContact: async (id: string): Promise<Contact> => {
    const service = addressBookService();
    return await service.getContact(id);
  },
};
```

### 3. Add to Store

```typescript
import { queryClient } from '@onflow/frw-context';

export const useUserStore = create(() => ({
  fetchContacts: async () => {
    return await queryClient.fetchQuery({
      queryKey: userQueryKeys.contacts(),
      queryFn: () => userQueries.fetchContacts(),
      // staleTime: 5 minutes handled automatically for 'addressbook'
    });
  },

  // Cache invalidation
  invalidateContacts: () => {
    queryClient.invalidateQueries({ queryKey: userQueryKeys.contacts() });
  },
}));
```

### 4. Use in Screen Component

```typescript
// packages/screens/src/contacts/ContactsScreen.query.tsx
import { useQuery } from '@tanstack/react-query';

export function ContactsScreen() {
  const { data: contacts, isLoading, error, refetch } = useQuery({
    queryKey: userQueryKeys.contacts(),
    queryFn: () => userQueries.fetchContacts(),
  });

  if (isLoading) return <LoadingSkeleton />;
  if (error) return <ErrorView error={error} onRetry={refetch} />;

  return (
    <YStack>
      {contacts?.map(contact => (
        <ContactCard key={contact.id} contact={contact} />
      ))}
    </YStack>
  );
}
```

## Adding Mutations

### 1. Create Mutation Function

```typescript
export const userMutations = {
  createContact: async (data: CreateContactRequest): Promise<Contact> => {
    const service = addressBookService();
    return await service.createContact(data);
  },

  updateContact: async (
    id: string,
    data: UpdateContactRequest
  ): Promise<Contact> => {
    const service = addressBookService();
    return await service.updateContact(id, data);
  },
};
```

### 2. Use in Component with Cache Updates

```typescript
import { useMutation, useQueryClient } from '@tanstack/react-query';

export function CreateContactScreen() {
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: userMutations.createContact,
    onSuccess: (newContact) => {
      // Optimistic cache update
      queryClient.setQueryData<Contact[]>(
        userQueryKeys.contacts(),
        (old) => old ? [newContact, ...old] : [newContact]
      );
      navigation.goBack();
    },
  });

  return (
    <Button
      onPress={() => createMutation.mutate(formData)}
      loading={createMutation.isPending}
    >
      Create Contact
    </Button>
  );
}
```

## Cross-Platform Setup

### React Native App

```typescript
// apps/react-native/src/App.tsx
import { QueryProvider } from '@onflow/frw-screens/src/providers/QueryProvider';

export default function App() {
  return (
    <TamaguiProvider>
      <QueryProvider>
        <AppNavigator />
      </QueryProvider>
    </TamaguiProvider>
  );
}
```

### Extension App

```typescript
// apps/extension/src/ui/index.tsx
import { QueryProvider } from '@onflow/frw-screens/src/providers/QueryProvider';

export function ExtensionApp() {
  return (
    <QueryProvider>
      <Router />
    </QueryProvider>
  );
}
```

## Query Keys Strategy

Use hierarchical structure for effective cache management:

```typescript
export const queryKeys = {
  // Top level determines cache category
  all: ['domain'] as const,

  // Second level - data types
  lists: () => [...queryKeys.all, 'list'] as const,
  details: () => [...queryKeys.all, 'detail'] as const,

  // Third level - specific instances
  list: (filters?: string) => [...queryKeys.lists(), { filters }] as const,
  detail: (id: string) => [...queryKeys.details(), id] as const,
};
```

## Cache Management

```typescript
// Invalidate specific queries
queryClient.invalidateQueries({ queryKey: userQueryKeys.contacts() });

// Invalidate by domain pattern
queryClient.invalidateQueries({ queryKey: [FlatQueryDomain.ADDRESSBOOK] });

// Remove from cache
queryClient.removeQueries({ queryKey: userQueryKeys.contact(id) });

// Update cache directly
queryClient.setQueryData(userQueryKeys.contact(id), updatedContact);
```

## Error Handling

### Global Error Handling

Errors are handled automatically based on type:

- **401/403/404**: No retry
- **5xx errors**: Retry up to 3 times
- **Network errors**: Exponential backoff

### Component Error Handling

```typescript
const { data, error, isLoading } = useQuery({
  queryKey: userQueryKeys.contacts(),
  queryFn: () => userQueries.fetchContacts(),
  retry: (failureCount, error) => {
    // Custom retry logic if needed
    return failureCount < 2;
  },
});

if (error) {
  return <ErrorBoundary error={error} onRetry={refetch} />;
}
```

## Performance Features

- **Intelligent Caching**: 0ms→2min→5min→30min→∞ based on data category
- **Request Deduplication**: Multiple identical requests are merged
- **Background Refetching**: Data updates automatically based on stale times
- **Optimistic Updates**: UI updates immediately on mutations
- **Offline Support**: Works with cached data when offline
- **Storage Persistence**: Non-session data survives app restarts

## Testing

### Testing Query Functions

```typescript
import { userQueries } from '../userStore.query';

describe('userQueries', () => {
  it('should fetch contacts', async () => {
    const contacts = await userQueries.fetchContacts();
    expect(contacts).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: expect.any(String) }),
      ])
    );
  });
});
```

### Testing Components

```typescript
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render } from '@testing-library/react-native';

const createTestClient = () => new QueryClient({
  defaultOptions: { queries: { retry: false } }
});

function renderWithQuery(component) {
  return render(
    <QueryClientProvider client={createTestClient()}>
      {component}
    </QueryClientProvider>
  );
}

test('ContactsScreen', async () => {
  renderWithQuery(<ContactsScreen />);
  // Test loading, success, error states
});
```

## Migration Example

### Before (Manual Cache)

```typescript
export const useOldStore = create((set, get) => ({
  data: [],
  loading: false,
  error: null,
  cache: new Map(),

  fetchData: async (id) => {
    if (get().cache.has(id)) return get().cache.get(id);

    set({ loading: true });
    try {
      const data = await api.getData(id);
      get().cache.set(id, data);
      set({ data, loading: false });
    } catch (error) {
      set({ error, loading: false });
    }
  },
}));
```

### After (TanStack Query)

```typescript
import { queryClient } from '@onflow/frw-context';

export const useNewStore = create(() => ({
  fetchData: async (id: string) => {
    return await queryClient.fetchQuery({
      queryKey: ['data', id],
      queryFn: () => api.getData(id),
      // Automatic caching, error handling, loading states
    });
  },
}));

// In component
function DataScreen() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['data', id],
    queryFn: () => api.getData(id),
  });

  // Automatic loading/error states
}
```

## Example: Persistent Data Usage

```typescript
// Configuration that never expires
import { FlatQueryDomain } from '@onflow/frw-types';

export const configQueryKeys = {
  all: [FlatQueryDomain.CONFIG] as const, // Auto-categorized as PERSISTENT (∞)
  app: () => [...configQueryKeys.all, 'app'] as const,
  theme: () => [...configQueryKeys.all, 'theme'] as const,
};

export const configQueries = {
  // This could be local computation, not API call
  fetchAppConfig: async (): Promise<AppConfig> => {
    return {
      version: '1.0.0',
      features: ['biometric', 'darkMode'],
      supportedNetworks: ['mainnet', 'testnet'],
    };
  },
};

// Usage in store
export const useConfigStore = create(() => ({
  fetchAppConfig: async () => {
    return await queryClient.fetchQuery({
      queryKey: configQueryKeys.app(),
      queryFn: () => configQueries.fetchAppConfig(),
      // staleTime: Infinity (never expires)
      // Will be persisted to storage automatically
    });
  },
}));
```

## Adding New Domains

### Add New Domain Categories

```typescript
// 1. Add to QueryDomain object (packages/types/src/query/QueryDomain.ts)
export const QueryDomain = {
  // Add to appropriate category
  STATIC: {
    MY_NEW_DOMAIN: 'my-new-domain', // Automatically gets STATIC categorization
    // ...existing static domains
  },

  // Or add to PERSISTENT, USER_SETTINGS, etc.
  PERSISTENT: {
    MY_CONSTANT: 'my-constant', // Automatically gets PERSISTENT categorization
  },
};
```

### Extend FlatQueryDomain

```typescript
// The FlatQueryDomain automatically includes all domains from all categories
import { FlatQueryDomain } from '@onflow/frw-types';

// Use your new domain
const myQueryKeys = {
  all: [FlatQueryDomain.MY_NEW_DOMAIN] as const, // Auto-categorized as STATIC
};
```

## Best Practices

1. **Type-Safe Domains**: Use `FlatQueryDomain` from `@onflow/frw-types`
2. **Category Organization**: Add domains to appropriate category in
   `QueryDomain` object
3. **Automatic Categorization**: Let category grouping handle cache time
   assignment
4. **Hierarchical Keys**: Use consistent query key structure
5. **Persistent Data**: Use `QueryDomain.PERSISTENT` for configs, constants,
   computed values
6. **API vs Non-API**: TanStack Query works for both network and local data
7. **Error Boundaries**: Use React Query's built-in error handling
8. **Loading States**: Use `isLoading`, `isRefetching` from hooks
9. **Cache Updates**: Use optimistic updates for better UX
10. **Testing**: Create test QueryClient with retry disabled

## Benefits

- **63% Code Reduction**: Less manual state management
- **Intelligent Caching**: Automatic 0ms→∞ based on data category
- **Cross-Platform**: Shared logic between RN and Extension
- **Better UX**: Optimistic updates, background refresh, offline support
- **Developer Experience**: Declarative, type-safe queries with IDE
  autocompletion
- **Architecture Compliant**: Types in `@onflow/frw-types`, follows MVVM pattern
- **Performance Optimized**: Categorized cache times prevent unnecessary
  requests
