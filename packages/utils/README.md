# @onflow/frw-utils

Utility functions for Flow Reference Wallet projects.

## Installation

```bash
pnpm add @onflow/frw-utils
```

## Usage

### Address Utilities

```typescript
import { 
  isValidFlowAddress,
  formatFlowAddress,
  getAddressType,
  truncateAddress 
} from '@onflow/frw-utils';

// Validate Flow address
const isValid = isValidFlowAddress('0x1234567890abcdef');

// Format address
const formatted = formatFlowAddress('0X1234567890ABCDEF'); // returns '0x1234567890abcdef'

// Get address type (Flow/EVM)
const type = getAddressType('0x1234567890abcdef');

// Truncate for display
const short = truncateAddress('0x1234567890abcdef'); // returns '0x1234...cdef'
```

### NFT Utilities

```typescript
import { 
  getNFTCover,
  getNFTId,
  getNFTSearchText,
  hasNFTMedia,
  getNFTDisplayName 
} from '@onflow/frw-utils';

// Get NFT cover image
const coverUrl = getNFTCover(nft);

// Get unique NFT identifier
const id = getNFTId(nft);

// Get searchable text content
const searchText = getNFTSearchText(nft);

// Check if NFT has media
const hasMedia = hasNFTMedia(nft);

// Get display name with fallback
const displayName = getNFTDisplayName(nft);
```

### General Utilities

```typescript
import { 
  formatTokenAmount,
  debounce,
  deepClone,
  throttle,
  capitalize,
  formatNumber,
  isEmpty 
} from '@onflow/frw-utils';

// Format token amounts
const formatted = formatTokenAmount(123.456789, 2); // returns '123.46'

// Debounce function calls
const debouncedFn = debounce(() => console.log('Called!'), 300);

// Deep clone objects
const cloned = deepClone(originalObject);

// Throttle function calls
const throttledFn = throttle(() => console.log('Throttled!'), 1000);

// Capitalize strings
const capitalized = capitalize('hello world'); // returns 'Hello world'

// Format numbers with separators
const formatted = formatNumber(1234567); // returns '1,234,567'

// Check if value is empty
const empty = isEmpty([]); // returns true
```

## Type Exports

The package also re-exports commonly used types for convenience:

```typescript
import type { WalletType, NFTModel } from '@onflow/frw-utils';
```

## Development

```bash
# Build the package
pnpm build

# Build in watch mode
pnpm build:watch

# Type check
pnpm typecheck

# Clean build artifacts
pnpm clean
```