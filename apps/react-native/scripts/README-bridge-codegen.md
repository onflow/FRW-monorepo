# Bridge Code Generation

This directory contains scripts for generating native Swift and Kotlin data models from TypeScript bridge types.

## Overview

The bridge codegen system automatically generates:

- **Swift structs** for iOS (`ios/FRW/Foundation/Bridge/BridgeModels.swift`)
- **Swift structs** for iOS native events (`ios/FRW/Foundation/Bridge/NativeEventModels.swift`)
- **Kotlin data classes** for Android (`android/app/src/main/java/com/flowfoundation/wallet/reactnative/bridge/BridgeModels.kt`)
- **Kotlin data classes** for Android native events (`android/app/src/main/java/com/flowfoundation/wallet/reactnative/bridge/NativeEventModels.kt`)

## Usage

```bash
# Generate bridge models from TypeScript types
npm run codegen:bridge
```

## Source

The script reads TypeScript interface definitions from:

- `packages/types/src/Bridge.ts`
- `packages/types/src/NativeEvent.ts`

## Features

- **Type Mapping**: Converts TypeScript types to appropriate native types
  - `string` → `String` (Swift/Kotlin)
  - `boolean` → `Bool` (Swift) / `Boolean` (Kotlin)
  - `number` → `Int` (Swift/Kotlin)
  - `string[]` → `[String]` (Swift) / `List<String>` (Kotlin)
  - Union types → `String` (treated as string literals)

- **Optional Properties**: Handles TypeScript optional properties (`?`) as nullable types
- **Arrays**: Supports array types with proper native collection types
- **Codable/Serializable**: Generated models include proper serialization support

## Generated Files

### Swift (`BridgeModels.swift`)

- Structs conform to `Codable` protocol
- Optional properties are nullable with `?`
- Uses native Swift types

### Kotlin (`BridgeModels.kt`)

- Data classes with `@SerializedName` annotations
- Optional properties are nullable with `?`
- Uses Gson for JSON serialization

## Example

**TypeScript Input:**

```typescript
export interface Contact {
  id: string;
  name: string;
  avatar?: string;
}
```

**Swift Output:**

```swift
struct Contact: Codable {
    let id: String
    let name: String
    let avatar: String?
}
```

**Kotlin Output:**

```kotlin
data class Contact(
    @SerializedName("id")
    val id: String,
    @SerializedName("name")
    val name: String,
    @SerializedName("avatar")
    val avatar: String?
)
```

## Notes

- Generated files are marked as auto-generated and should not be edited manually
- Re-run the script after modifying TypeScript bridge types
- Both platforms use the same JSON structure for bridge communication
