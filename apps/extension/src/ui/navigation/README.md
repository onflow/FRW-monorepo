# Extension Routing Migration

This document describes the migration of routing logic from the React Native project to the extension project, implementing the same navigation patterns and screen flow.

## Overview

The extension now has a unified routing system that mirrors the React Native AppNavigator, providing consistent navigation patterns across platforms.

## Architecture

### New Components

1. **AppRouter** (`apps/extension/src/ui/navigation/AppRouter.tsx`)
   - Main routing component that mirrors React Native's AppNavigator
   - Handles nested routing under `/dashboard/*`
   - Integrates with existing extension infrastructure

2. **RouteMapping** (`apps/extension/src/ui/navigation/RouteMapping.ts`)
   - Utilities for mapping between old and new routes
   - Helps with gradual migration
   - Provides compatibility layer

3. **Navigation Hook** (`apps/extension/src/ui/hooks/use-navigation.ts`)
   - Enhanced navigation hook for both old and new routing
   - Provides screen-compatible navigation interface
   - Handles route mapping automatically

### Screen Embeds

Located in `apps/extension/src/ui/views/SendTo/`:

- **SendToScreenEmbed.tsx** - Recipient address input
- **SendTokensScreenEmbed.tsx** - Token amount and confirmation
- **TransferAmountScreenEmbed.tsx** - Amount input screen
- **TransferConfirmationScreenEmbed.tsx** - Final confirmation

Each embed:

- Imports the corresponding screen from `@onflow/frw-screens`
- Provides bridge adapter for extension's wallet API
- Handles navigation callbacks
- Provides translation function

## Route Structure

### New Routes (AppRouter)

```
/dashboard/                    -> HomeScreen
/dashboard/colordemo          -> ColorDemoScreen
/dashboard/nftdetail/:id      -> NFTDetailScreen
/dashboard/nftlist            -> NFTListScreen
/dashboard/selecttokens       -> SelectTokensScreen
/dashboard/sendto             -> SendToScreenEmbed
/dashboard/sendtokens         -> SendTokensScreenEmbed
/dashboard/transferamount     -> TransferAmountScreenEmbed
/dashboard/transferconfirmation -> TransferConfirmationScreenEmbed
/dashboard/sendsinglenft      -> SendSingleNFTScreen
/dashboard/sendmultiplenfts   -> SendMultipleNFTsScreen
```

### Route Mapping

Old extension routes are mapped to new AppRouter routes:

```typescript
const ROUTE_MAPPING = {
  'token/:id/send': '/dashboard/selecttokens',
  'token/:id/send/:toAddress': '/dashboard/sendto',
  'nested/nftdetail/:id': '/dashboard/nftdetail/:id',
  'nested/collectiondetail/:collection_address_name': '/dashboard/nftlist',
  '/': '/dashboard',
  dashboard: '/dashboard',
};
```

## Integration

### InnerRoute.tsx Updates

The main routing file now includes the AppRouter:

```typescript
<Routes>
  {/* New AppRouter routes - these take precedence */}
  <Route path="/dashboard/*" element={<AppRouter />} />

  {/* Existing routes */}
  <Route index element={<PrivateRoute><Dashboard /></PrivateRoute>} />
  // ... other existing routes
</Routes>
```

### Gradual Migration

The system supports gradual migration:

1. **Query Parameter Control**: Add `?newScreen=true` to use new screens
2. **Development Mode**: New screens are used by default in development
3. **Backward Compatibility**: Old routes continue to work

Example:

```
/dashboard/token/flow/send?newScreen=true  // Uses new SendToScreenEmbed
/dashboard/token/flow/send                 // Uses old SendToCadenceOrEvm
```

## Usage Examples

### Using New Navigation Hook

```typescript
import { useAppNavigation } from '@/ui/hooks/use-navigation';

function MyComponent() {
  const { navigate, goBack } = useAppNavigation();

  // Navigate to new screen
  navigate('SelectTokens');

  // Navigate with parameters
  navigate('NFTDetail', { nft: selectedNFT });

  // Go back
  goBack();
}
```

### Creating Screen Embeds

```typescript
import React from 'react';
import { useAppNavigation } from '@/ui/hooks/use-navigation';
import { useWallet } from '@/ui/hooks/use-wallet';
import { MyScreen, type BaseScreenProps } from '@onflow/frw-screens';

export default function MyScreenEmbed() {
  const { navigate, goBack } = useAppNavigation();
  const wallet = useWallet();

  const bridge = {
    getSelectedAddress: () => wallet?.getCurrentAddress?.() || null,
    getNetwork: () => wallet?.getNetwork?.() || 'mainnet',
  };

  const navigation = { navigate, goBack };
  const t = (key: string) => key; // Translation function

  return (
    <MyScreen
      navigation={navigation}
      bridge={bridge}
      t={t}
      onAction={(data) => {
        // Handle screen actions
        navigate('NextScreen', data);
      }}
    />
  );
}
```

## Send Flow Integration

The send flow now follows the React Native pattern:

1. **SelectTokens** → Choose token/NFT and account
2. **SendTo** → Enter recipient address
3. **SendTokens/SendNFT** → Enter amount and review
4. **Confirmation** → Final confirmation and execution

### State Management

The screens integrate with existing stores:

- `useSendStore` - Send transaction state
- `useWalletStore` - Wallet and account data
- `useTokenStore` - Token information

### Bridge Integration

Each screen embed provides a bridge adapter that maps extension APIs to the screen interface:

```typescript
const bridge = {
  getSelectedAddress(): string | null {
    // Map extension's async getCurrentAddress to sync interface
    const address = wallet?.getCurrentAddress?.();
    return typeof address === 'string' ? address : null;
  },
  getNetwork(): string {
    // Map extension's network API
    return wallet?.getNetwork?.() || 'mainnet';
  },
};
```

## Benefits

1. **Consistency** - Same navigation patterns as React Native
2. **Reusability** - Shared screen components across platforms
3. **Maintainability** - Single source of truth for screen logic
4. **Flexibility** - Gradual migration with backward compatibility
5. **Type Safety** - Full TypeScript support throughout

## Next Steps

1. **Install Dependencies**: Add `@onflow/frw-screens` to extension package.json
2. **Test Integration**: Verify all screens work with extension APIs
3. **Migrate Gradually**: Enable new screens one by one
4. **Update Documentation**: Document any extension-specific customizations
5. **Performance Testing**: Ensure new routing doesn't impact performance

## Troubleshooting

### Module Resolution Issues

If you see "Cannot find module '@onflow/frw-screens'":

1. Ensure the package is added to package.json dependencies
2. Run `pnpm install` from the monorepo root
3. Check that the screens package builds successfully

### Navigation Issues

If navigation doesn't work:

1. Check that routes are properly nested under `/dashboard/*`
2. Verify the AppRouter is imported in InnerRoute.tsx
3. Ensure navigation hooks are used correctly

### Bridge API Issues

If wallet APIs don't work:

1. Check that bridge adapters handle async APIs correctly
2. Verify wallet hook provides expected methods
3. Add proper error handling for missing APIs
