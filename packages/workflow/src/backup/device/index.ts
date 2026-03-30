import type { DeviceSyncOptions, DeviceSyncSession } from '../types';

export async function createDeviceSyncSession(
  _options: DeviceSyncOptions
): Promise<DeviceSyncSession> {
  throw new Error('Device sync not yet implemented. Install @walletconnect/sign-client first.');
}
