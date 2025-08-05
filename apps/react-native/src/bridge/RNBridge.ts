import { BridgeSpec, type Storage } from '@onflow/frw-context';
import type { RecentContactsResponse, WalletAccountsResponse } from '@onflow/frw-types';
import { isTransactionId } from '@onflow/frw-utils';
import { MMKV } from 'react-native-mmkv';
import NativeFRWBridge from './NativeFRWBridge';

class RNBridge implements BridgeSpec {
  getSelectedAddress(): string | null {
    return NativeFRWBridge.getSelectedAddress();
  }

  getNetwork(): string {
    return NativeFRWBridge.getNetwork();
  }

  getJWT(): Promise<string> {
    return NativeFRWBridge.getJWT();
  }

  getVersion(): string {
    return NativeFRWBridge.getVersion();
  }

  getBuildNumber(): string {
    return NativeFRWBridge.getBuildNumber();
  }

  getApiEndpoint(): string {
    // Determine API endpoint based on environment
    return __DEV__ ? 'https://web-dev.api.wallet.flow.com' : 'https://web.api.wallet.flow.com';
  }

  getGoApiEndpoint(): string {
    // For now, use the hardcoded endpoint - can be made dynamic later
    return 'https://dev.lilico.app';
  }

  getStorage(): Storage {
    return storage;
  }

  sign(hexData: string): Promise<string> {
    return NativeFRWBridge.sign(hexData);
  }

  getRecentContacts(): Promise<RecentContactsResponse> {
    return NativeFRWBridge.getRecentContacts();
  }

  getWalletAccounts(): Promise<WalletAccountsResponse> {
    return NativeFRWBridge.getWalletAccounts();
  }

  getSignKeyIndex(): number {
    return NativeFRWBridge.getSignKeyIndex();
  }

  scanQRCode(): Promise<string> {
    return NativeFRWBridge.scanQRCode();
  }

  closeRN(): void {
    NativeFRWBridge.closeRN();
  }

  configureCadenceService(cadenceService: any): void {
    const version = this.getVersion();
    const buildNumber = this.getBuildNumber();
    const network = this.getNetwork();
    
    // Add version and platform headers to transactions
    cadenceService.useRequestInterceptor(async (config: any) => {
      if (config.type === 'transaction') {
        const platform = 'react-native'; // Platform.OS is not available here
        const versionHeader = `// Flow Wallet - ${network} Script - ${config.name} - React Native - ${version}`;
        const platformHeader = `// Platform: ${platform} - ${version} - ${buildNumber}`;
        config.cadence = versionHeader + '\n' + platformHeader + '\n\n' + config.cadence;
      }
      return config;
    });

    // Configure payer authorization
    cadenceService.useRequestInterceptor(async (config: any) => {
      if (config.type === 'transaction') {
        config.payer = async (account: any) => {
          const ADDRESS = '0x319e67f2ef9d937f'; // Fixed payer address
          const KEY_ID = 0;
          return {
            ...account,
            tempId: `${ADDRESS}-${KEY_ID}`,
            addr: ADDRESS.replace('0x', ''),
            keyId: Number(KEY_ID),
            signingFunction: async (signable: any) => {
              // Call your existing signPayer logic here
              const token = await this.getJWT();
              const baseURL = 'https://us-central1-lilico-334404.cloudfunctions.net';
              
              // You might want to extract this to a separate method
              const response = await fetch(`${baseURL}/signAsPayer`, {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${token}`,
                  'network': network,
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  transaction: signable.voucher,
                  message: {
                    envelope_message: signable.message,
                  },
                }),
              });
              
              const data = await response.json();
              const signature = data.envelopeSigs.sig;
              
              return {
                addr: ADDRESS,
                keyId: Number(KEY_ID),
                signature: signature,
              };
            },
          };
        };
      }
      return config;
    });

    // Configure proposer authorization  
    cadenceService.useRequestInterceptor(async (config: any) => {
      if (config.type === 'transaction') {
        config.proposer = async (account: any) => {
          const address = this.getSelectedAddress() || '';
          const ADDRESS = address.startsWith('0x') ? address : `0x${address}`;
          const KEY_ID = this.getSignKeyIndex();
          return {
            ...account,
            tempId: `${ADDRESS}-${KEY_ID}`,
            addr: ADDRESS.replace('0x', ''),
            keyId: Number(KEY_ID),
            signingFunction: async (signable: { message: string }) => {
              return {
                addr: ADDRESS,
                keyId: Number(KEY_ID),
                signature: await this.sign(signable.message),
              };
            },
          };
        };
      }
      return config;
    });

    // Configure authorizations (same as proposer)
    cadenceService.useRequestInterceptor(async (config: any) => {
      if (config.type === 'transaction') {
        config.authorizations = [config.proposer];
      }
      return config;
    });

    // Configure gas limits
    cadenceService.useRequestInterceptor(async (config: any) => {
      if (config.type === 'transaction') {
        config.limit = 1000; // Default gas limit, you can adjust this
      }
      return config;
    });

    // Configure response interceptor
    cadenceService.useResponseInterceptor(async (response: any) => {
      console.log('cadenceService response', response);
      if (isTransactionId(response)) {
        NativeFRWBridge.listenTransaction(response);
      }
      return response;
    });
  }
}

export const storage = new MMKV();
export const bridge = new RNBridge();
