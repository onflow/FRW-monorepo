# Flow Passkey Wallet

A modern, secure Flow blockchain wallet using WebAuthn passkeys for authentication. Built with Next.js, Tamagui, and the Flow Reference Wallet UI components.

## Features

- 🔐 **Passwordless Authentication**: Uses WebAuthn passkeys (Face ID, Touch ID, Windows Hello)
- 🌊 **Flow Blockchain Integration**: Full Flow network support with FCL
- 🎨 **Modern UI**: Built with Tamagui and FRW UI components
- 📱 **Cross-Platform**: Works on desktop and mobile browsers
- 🔒 **Secure**: No seed phrases or passwords - cryptographic keys secured by your device

## Quick Start

### Prerequisites

- Node.js >= 22.11.0
- pnpm >= 9.0.0
- A device with biometric authentication (Face ID, Touch ID, Windows Hello) or PIN

### Installation

```bash
# From the FRW monorepo root
cd apps/passkeys
pnpm install
```

### Development

```bash
# Start development server
pnpm dev

# Open http://localhost:3000
```

### Build

```bash
# Build for production
pnpm build

# Start production server
pnpm start
```

## Architecture

### Core Services

- **PasskeyService**: WebAuthn integration for creating and authenticating passkeys
- **FlowService**: Flow blockchain interaction using @onflow/fcl

### Components

- **PasskeySetup**: Create new passkey credentials
- **PasskeyLogin**: Authenticate with existing passkeys
- **WalletDashboard**: Main wallet interface with account info and transactions

### Technologies

- **Next.js 15**: React framework with App Router
- **Tamagui**: Universal design system
- **@onflow/fcl**: Flow blockchain client
- **@trustwallet/wallet-core**: Cryptographic operations
- **WebAuthn API**: Passkey authentication

## How It Works

1. **Registration**: User creates a passkey using their device's biometric authentication
2. **Key Generation**: Deterministic private keys generated from passkey entropy
3. **Flow Integration**: Public key registered with Flow account for transaction signing
4. **Authentication**: Seamless login using passkey assertion
5. **Transactions**: Sign Flow transactions using the passkey-derived private key

## Browser Support

- Chrome/Edge 67+
- Safari 14+
- Firefox 60+

Requires platform authenticator support (Face ID, Touch ID, Windows Hello, or PIN).

## Security

- Private keys never leave the user's device
- Passkeys are bound to the domain and can't be phished
- Biometric authentication provides additional security layer
- No password or seed phrase storage required

## Development Scripts

```bash
pnpm dev          # Start development server
pnpm build        # Build for production
pnpm start        # Start production server
pnpm lint         # Run ESLint
pnpm lint:fix     # Fix ESLint issues
pnpm format       # Check Prettier formatting
pnpm format:fix   # Fix Prettier formatting
pnpm typecheck    # Run TypeScript checks
pnpm test         # Run unit tests
pnpm test:run     # Run tests once
```

## Environment Configuration

Copy `.env.example` to `.env.local` and configure:

```env
NEXT_PUBLIC_FLOW_NETWORK=testnet
NEXT_PUBLIC_ACCESS_NODE_API=https://rest-testnet.onflow.org
NEXT_PUBLIC_DISCOVERY_WALLET=https://fcl-discovery.onflow.org/testnet/authn
```

## Contributing

This project follows the Flow Reference Wallet development guidelines. See the main [CLAUDE.md](../../CLAUDE.md) for coding standards and architecture patterns.

## License

LGPL-3.0-or-later
