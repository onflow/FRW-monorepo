import type {
  EnvironmentVariables as SharedEnvironmentVariables,
  RecentContactsResponse,
  WalletAccountsResponse,
} from '@onflow/frw-types';
import type { TurboModule } from 'react-native';
import { TurboModuleRegistry } from 'react-native';

/**
 * Local interface for Codegen - must be defined in the same file
 * @see {@link SharedEnvironmentVariables} in @onflow/frw-types
 *
 * React Native Codegen limitation: Cannot resolve imported types.
 * This must stay in sync with SharedEnvironmentVariables manually.
 */
interface EnvironmentVariables {
  NODE_API_URL: string;
  GO_API_URL: string;
  INSTABUG_TOKEN: string;
}

// Compile-time sync validation
const _syncCheck: EnvironmentVariables = {} as SharedEnvironmentVariables;
const _reverseSyncCheck: SharedEnvironmentVariables = {} as EnvironmentVariables;

export interface Spec extends TurboModule {
  getSelectedAddress(): string | null;
  getNetwork(): string;
  getJWT(): Promise<string>;
  getVersion(): string;
  getBuildNumber(): string;
  // Turbo Modules do not support Uint8Array or ArrayBuffer, so we need to convert to hex string instead
  sign(hexData: string): Promise<string>;
  getRecentContacts(): Promise<RecentContactsResponse>;
  // Wallet accounts method
  getWalletAccounts(): Promise<WalletAccountsResponse>;
  getSignKeyIndex(): number;
  // QR code scanning method
  scanQRCode(): Promise<string>;
  // Close react native method
  closeRN(): void;
  // Free gas settings method
  isFreeGasEnabled(): Promise<boolean>;
  // Listen to a transaction
  listenTransaction(txid: string): void;

  getEnv(): EnvironmentVariables;
}

export default TurboModuleRegistry.getEnforcing<Spec>('NativeFRWBridge');
