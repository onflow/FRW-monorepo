export enum NativeEventName {
  KeyRotationCheck = 'keyRotationCheck',
}

export interface KeyRotationCheckParams {
  address: string;
}

export interface KeyRotationCheckResult {
  address: string;
  isBlocto: boolean;
}

export interface NativeRequestPayload {
  requestId: string;
  eventName: NativeEventName;
  paramsJson: string;
}

export interface NativeResponsePayload {
  requestId: string;
  eventName: NativeEventName;
  resultJson?: string | null;
  error?: string | null;
}
