# Dashboard Package

A reusable Dashboard component package that can be imported and used across
different platforms (extension, React Native, etc.).

## Components

- **Dashboard**: Main dashboard container with balance, buttons, and wallet tabs
- **DashboardTotal**: Balance display component
- **WalletTab**: Tabbed interface for tokens, NFTs, and activity
- **ButtonRow**: Action buttons (Send, Receive, Swap, Buy, Move)

## Usage

### Basic Usage

```typescript
import { Dashboard } from '@onflow/frw-screens';

function MyDashboard() {
  return (
    <Dashboard
      network="mainnet"
      balance="1234.56"
      currencyCode="USD"
      currencySymbol="$"
      activeAccountType="main"
      onSendClick={() => navigate('/send')}
      onReceiveClick={() => navigate('/receive')}
      onSwapClick={() => window.open('https://swap.example.com')}
      onBuyClick={() => setShowOnRamp(true)}
      onMoveClick={() => setShowMoveBoard(true)}
    />
  );
}
```

### Advanced Usage with Custom Components

```typescript
import { Dashboard, WalletTab } from '@onflow/frw-screens';
import { CoinList } from './CoinList';
import { NFTTab } from './NFTTab';
import { TransferList } from './TransferList';

function CustomDashboard() {
  const customWalletTab = (
    <WalletTab
      network="mainnet"
      activeAccountType="main"
      tokensComponent={<CoinList />}
      nftsComponent={<NFTTab />}
      activityComponent={<TransferList />}
      showActivityTab={true}
      initialTab={0}
    />
  );

  return (
    <Dashboard
      network="mainnet"
      balance="1234.56"
      currencyCode="USD"
      currencySymbol="$"
      customWalletTab={customWalletTab}
      showBuildIndicator={process.env.NODE_ENV === 'development'}
      showNetworkIndicator={true}
      emulatorModeOn={false}
    />
  );
}
```

### Extension Integration Example

```typescript
// apps/extension/src/ui/views/Dashboard/index.tsx
import React from 'react';
import { useNavigate } from 'react-router';
import { Dashboard } from '@onflow/frw-screens';
import { useCoins } from '@/ui/hooks/useCoinHook';
import { useNetwork } from '@/ui/hooks/useNetworkHook';
import { useProfiles } from '@/ui/hooks/useProfileHook';
import { useCurrency } from '@/ui/hooks/preference-hooks';
import CoinList from '../CoinList';
import NFTTab from '../NFT';
import TransferList from '../TransferList';

const ExtensionDashboard = () => {
  const navigate = useNavigate();
  const { network, emulatorModeOn } = useNetwork();
  const { balance, coinsLoaded } = useCoins();
  const currency = useCurrency();
  const { noAddress, registerStatus, canMoveToOtherAccount, activeAccountType } = useProfiles();

  return (
    <Dashboard
      network={network}
      balance={coinsLoaded ? balance : undefined}
      currencyCode={coinsLoaded ? currency?.code : undefined}
      currencySymbol={coinsLoaded ? currency?.symbol : undefined}
      noAddress={noAddress}
      addressCreationInProgress={registerStatus}
      canMoveToOtherAccount={canMoveToOtherAccount}
      activeAccountType={activeAccountType}
      emulatorModeOn={emulatorModeOn}
      showBuildIndicator={process.env.NODE_ENV === 'development'}
      onSendClick={() => navigate('/dashboard/token/flow/send')}
      onReceiveClick={() => navigate('/dashboard/wallet/deposit')}
      onSwapClick={() => window.open('https://swap.example.com', '_blank')}
      customWalletTab={
        <WalletTab
          network={network}
          activeAccountType={activeAccountType}
          tokensComponent={<CoinList />}
          nftsComponent={<NFTTab />}
          activityComponent={<TransferList />}
        />
      }
    />
  );
};

export default ExtensionDashboard;
```

## Props

### DashboardProps

| Prop                        | Type                         | Default  | Description                             |
| --------------------------- | ---------------------------- | -------- | --------------------------------------- |
| `onSendClick`               | `() => void`                 | -        | Handler for send button click           |
| `onReceiveClick`            | `() => void`                 | -        | Handler for receive button click        |
| `onSwapClick`               | `() => void`                 | -        | Handler for swap button click           |
| `onBuyClick`                | `() => void`                 | -        | Handler for buy button click            |
| `onMoveClick`               | `() => void`                 | -        | Handler for move button click           |
| `network`                   | `string`                     | -        | Current network (mainnet/testnet)       |
| `balance`                   | `string`                     | -        | Total balance to display                |
| `currencyCode`              | `string`                     | -        | Currency code (USD, EUR, etc.)          |
| `currencySymbol`            | `string`                     | -        | Currency symbol ($, €, etc.)            |
| `noAddress`                 | `boolean`                    | -        | Whether user has no address             |
| `addressCreationInProgress` | `boolean`                    | -        | Whether address creation is in progress |
| `canMoveToOtherAccount`     | `boolean`                    | -        | Whether move functionality is available |
| `activeAccountType`         | `'main' \| 'evm' \| 'child'` | `'main'` | Active account type                     |
| `showBuildIndicator`        | `boolean`                    | `false`  | Show development build indicator        |
| `showNetworkIndicator`      | `boolean`                    | `true`   | Show network indicator                  |
| `emulatorModeOn`            | `boolean`                    | `false`  | Whether emulator mode is active         |
| `customButtonRow`           | `ReactNode`                  | -        | Custom button row component             |
| `customWalletTab`           | `ReactNode`                  | -        | Custom wallet tab component             |

## Features

- ✅ **Cross-platform compatibility** - Works with extension, React Native, and
  web
- ✅ **Customizable components** - Replace any part with custom implementations
- ✅ **Responsive design** - Adapts to different screen sizes
- ✅ **Type-safe** - Full TypeScript support
- ✅ **Consistent styling** - Uses Tamagui design system
- ✅ **Modular architecture** - Import only what you need

## Migration from Extension

To migrate from the extension's Dashboard to this package:

1. Install the package: `npm install @onflow/frw-screens`
2. Replace the import: `import { Dashboard } from '@onflow/frw-screens'`
3. Update props to match the new interface
4. Provide custom components for platform-specific functionality
