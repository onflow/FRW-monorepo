# Native Event Bus Pattern

This doc describes the native-to-RN event bus used for key rotation and other
native-driven workflows.

## Why this pattern

- Native can trigger RN logic without tight coupling to UI screens.
- The bus supports request/response semantics with a `requestId`.
- Payloads are JSON strings to keep native and RN models in sync and avoid loose
  "map" types.

## Core concepts

- `eventName`: A string enum that identifies the request type.
- `requestId`: A UUID used to correlate response to request.
- `paramsJson`: JSON string of request params.
- `resultJson`: JSON string of response payload.
- `error`: Optional error string.

These types live in `packages/types/src/NativeEvent.ts` and are code-generated
into native models.

## Data flow

1. Native emits a `nativeRequest` event with
   `{ requestId, eventName, paramsJson }`.
2. RN subscribes to the event bus and routes to a handler by `eventName`.
3. RN parses `paramsJson`, executes the handler, and replies via the bridge
   method `nativeResponse`.
4. Native receives `{ requestId, eventName, resultJson, error }` and decodes
   `resultJson` into the appropriate model based on `eventName`.

## Payload shapes

TypeScript definitions (source of truth):

- `packages/types/src/NativeEvent.ts`

Generated native models:

- iOS: `apps/react-native/ios/FRW/Foundation/Bridge/NativeEventModels.swift`
- Android:
  `apps/react-native/android/app/src/main/java/com/flowfoundation/wallet/reactnative/bridge/NativeEventModels.kt`

## RN handler wiring

Event bus lives in:

- `apps/react-native/src/native/nativeRequestBus.ts`

Each handler is keyed by `NativeEventName` and expects parsed params. The
handler returns a JSON-serializable object. The bus stringifies this as
`resultJson`.

## Native emit example

iOS (Swift):

```swift
let paramsJson = "{\"address\":\"0x123...\"}"
NotificationCenter.default.post(
  name: .nativeRequest,
  object: nil,
  userInfo: [
    "requestId": UUID().uuidString,
    "eventName": "keyRotationCheck",
    "paramsJson": paramsJson,
  ]
)
```

Android (Kotlin):

```kotlin
val paramsJson = JSONObject(mapOf("address" to address)).toString()
NativeRequestEmitter.emit(
  requestId = requestId,
  eventName = NativeRequestEventName.KEY_ROTATION_CHECK,
  paramsJson = paramsJson
)
```

## Native response example

RN sends response via the bridge:

```ts
await NativeFRWBridge.nativeResponse(requestId, eventName, resultJson, error);
```

Native reads `resultJson` and decodes into the expected data model using
`eventName` as the discriminator.

## Adding a new event

1. Add `eventName` and request/response param/result types in
   `packages/types/src/NativeEvent.ts`.
2. Run `pnpm --filter FRWRN run codegen:bridge` to generate native models.
3. Implement the RN handler in
   `apps/react-native/src/native/nativeRequestBus.ts`.
4. Emit from native with `paramsJson`, and decode response using `eventName`.

## Notes

- Keep `paramsJson` and `resultJson` as valid JSON strings.
- Prefer small, explicit payloads for forward compatibility.
- The event bus is request/response oriented, not a broadcast bus.
