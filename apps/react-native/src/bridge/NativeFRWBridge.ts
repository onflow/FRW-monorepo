import type {
  RecentContactsResponse,
  EnvironmentVariables as SharedEnvironmentVariables,
  WalletAccount,
  WalletAccountsResponse,
  Currency as SharedCurrency,
} from '@onflow/frw-types';
import type { TurboModule } from 'react-native';
import { TurboModuleRegistry } from 'react-native';

/**
 * Local interfaces for Codegen - must be defined in the same file
 * @see {@link SharedEnvironmentVariables} and {@link SharedCurrency} in @onflow/frw-types
 *
 * React Native Codegen limitation: Cannot resolve imported types.
 * These must stay in sync with the source types manually.
 */
interface EnvironmentVariables {
  NODE_API_URL: string;
  GO_API_URL: string;
  INSTABUG_TOKEN: string;
}

interface Currency {
  name: string;
  symbol: string;
  rate: string;
}

// Compile-time sync validation
const _syncCheck: EnvironmentVariables = {} as SharedEnvironmentVariables;
const _reverseSyncCheck: SharedEnvironmentVariables = {} as EnvironmentVariables;
const _currencySyncCheck: Currency = {} as SharedCurrency;
const _currencyReverseSyncCheck: SharedCurrency = {} as Currency;

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
  closeRN(id?: string | null): void;
  // Free gas settings method
  isFreeGasEnabled(): Promise<boolean>;
  // Listen to a transaction
  listenTransaction(txid: string): void;
  // Get environment variables
  getEnv(): EnvironmentVariables;
  // Get selected account
  getSelectedAccount(): Promise<WalletAccount>;
  getCurrency(): Currency;
  getTokenRate(token: string): string;
}

export default TurboModuleRegistry.getEnforcing<Spec>('NativeFRWBridge');
