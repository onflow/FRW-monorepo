import { KeyRotationService } from '@onflow/frw-services';
import { NativeEventName, type NativeRequestPayload } from '@onflow/frw-types';
import { NativeEventEmitter, NativeModules, Platform } from 'react-native';

import NativeFRWBridge from '../bridge/NativeFRWBridge';
import { platform } from '../bridge/PlatformImpl';

type Handler = (params: Record<string, unknown>) => Promise<Record<string, unknown> | null>;

type HandlerMap = Record<NativeEventName, Handler>;

const handlers: HandlerMap = {
  [NativeEventName.KeyRotationCheck]: async params => {
    const address = typeof params.address === 'string' ? params.address : '';
    if (!address) {
      throw new Error('Missing address');
    }

    const service = KeyRotationService.getInstance(platform);
    const isBlocto = await service.isBloctoAccount(address);
    return { address, isBlocto };
  },
};

export const setupNativeRequestBus = (): (() => void) | undefined => {
  if (Platform.OS !== 'ios' && Platform.OS !== 'android') {
    return undefined;
  }

  const emitterModule = NativeModules.NativeRequestEventEmitter;
  if (!emitterModule) {
    platform.log('warn', '[NativeRequestBus] Event emitter not available');
    return undefined;
  }

  const emitter = new NativeEventEmitter(emitterModule);
  const subscription = emitter.addListener(
    'nativeRequest',
    async (payload: NativeRequestPayload) => {
      const requestId = payload?.requestId ?? 'unknown';
      const eventName = payload?.eventName ?? 'unknown';

      try {
        const handler = handlers[payload.eventName as NativeEventName];
        if (!handler) {
          throw new Error(`No handler for event: ${eventName}`);
        }

        const paramsJson = typeof payload.paramsJson === 'string' ? payload.paramsJson : '';
        const parsedParams = paramsJson ? (JSON.parse(paramsJson) as Record<string, unknown>) : {};
        const result = await handler(parsedParams);
        const resultJson = result ? JSON.stringify(result) : null;
        await NativeFRWBridge.nativeResponse(requestId, eventName, resultJson, null);
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        await NativeFRWBridge.nativeResponse(requestId, eventName, null, message);
      }
    }
  );

  NativeFRWBridge.nativeReady();

  return () => {
    subscription.remove();
  };
};
