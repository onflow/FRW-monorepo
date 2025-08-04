# Send Screens Organization

This directory contains all send-related screens organized by flow and functionality.

## Structure

```
Send/
├── SelectTokens/          # Token/NFT selection (first step)
├── SendTo/               # Recipient selection (second step)
├── SendTokens/           # Token sending configuration (third step)
├── SendNFT/              # NFT sending screens
│   ├── SendSingleNFTScreen.tsx
│   └── SendMultipleNFTsScreen.tsx
└── Confirmation/         # Transaction confirmation (final step)
```

## Flow Order

1. **SelectTokens** - User selects which token/NFT to send
2. **SendTo** - User selects recipient (accounts/recent/contacts)
3. **SendTokens** - User configures amount and reviews transaction
4. **Confirmation** - User confirms and executes transaction

## Components

- Each screen directory contains its main screen file and index.ts
- **SendTo** has additional components for recipient selection
- **SendNFT** combines both single and multiple NFT sending functionality
- All screens are exported through the main Send/index.ts file

## Usage

```typescript
import { SelectTokensScreen, SendToScreen, SendTokensScreen } from '../screens/Send';
```
