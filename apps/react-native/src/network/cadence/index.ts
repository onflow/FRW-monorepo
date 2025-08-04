import { version } from '@/../package.json';
import NativeFRWBridge from '@/bridge/NativeFRWBridge';
import * as fcl from '@onflow/fcl';
import { send as httpSend } from '@onflow/transport-http';
import axios from 'axios';
import { Platform } from 'react-native';
import 'react-native-get-random-values';
import { addresses, CadenceService } from './CadenceGen';
import { GAS_LIMITS } from './send/utils';

export * from './send';

export function configureFCL(network: 'mainnet' | 'testnet') {
  if (network === 'mainnet') {
    fcl
      .config()
      .put('flow.network', 'mainnet')
      .put('accessNode.api', 'https://rest-mainnet.onflow.org')
      .put('sdk.transport', httpSend);
    const addrMap = addresses.mainnet;
    for (const key in addrMap) {
      fcl.config().put(key, addrMap[key as keyof typeof addrMap]);
    }
  } else {
    fcl
      .config()
      .put('flow.network', 'testnet')
      .put('accessNode.api', 'https://rest-testnet.onflow.org')
      .put('sdk.transport', httpSend);
    const addrMap = addresses.testnet;
    for (const key in addrMap) {
      fcl.config().put(key, addrMap[key as keyof typeof addrMap]);
    }
  }
}

const signPayer = async (signable: any) => {
  const baseURL = 'https://us-central1-lilico-334404.cloudfunctions.net';
  const token = await NativeFRWBridge.getJWT();
  const network = await NativeFRWBridge.getNetwork();
  const response = await axios({
    url: `${baseURL}/signAsPayer`,
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      network: network,
    },
    data: {
      transaction: signable.voucher,
      message: {
        envelope_message: signable.message,
      },
    },
  });
  return response.data.envelopeSigs.sig;
};

const payerAuthFunction = async (account: any) => {
  const ADDRESS = fcl.withPrefix('0x319e67f2ef9d937f');
  const KEY_ID = 0;
  return {
    ...account, // bunch of defaults in here, we want to overload some of them though
    tempId: `${ADDRESS}-${KEY_ID}`, // tempIds are more of an advanced topic, for 99% of the times where you know the address and keyId you will want it to be a unique string per that address and keyId
    addr: fcl.sansPrefix(ADDRESS), // the address of the signatory, currently it needs to be without a prefix right now
    keyId: Number(KEY_ID), // this is the keyId for the accounts registered key that will be used to sign, make extra sure this is a number and not a string
    signingFunction: async (signable: any) => {
      // Singing functions are passed a signable and need to return a composite signature
      // signable.message is a hex string of what needs to be signed.
      const signature = await signPayer(signable);
      return {
        addr: fcl.withPrefix(ADDRESS), // needs to be the same as the account.addr but this time with a prefix, eventually they will both be with a prefix
        keyId: Number(KEY_ID), // needs to be the same as account.keyId, once again make sure its a number and not a string
        signature: signature, // this needs to be a hex string of the signature, where signable.message is the hex value that needs to be signed
      };
    },
  };
};

const authorizationFunction = async (account: any) => {
  // authorization function need to return an account
  const address = NativeFRWBridge.getSelectedAddress() || '';
  const ADDRESS = fcl.withPrefix(address);
  const KEY_ID = NativeFRWBridge.getSignKeyIndex();
  return {
    ...account, // bunch of defaults in here, we want to overload some of them though
    tempId: `${ADDRESS}-${KEY_ID}`, // tempIds are more of an advanced topic, for 99% of the times where you know the address and keyId you will want it to be a unique string per that address and keyId
    addr: fcl.sansPrefix(ADDRESS), // the address of the signatory, currently it needs to be without a prefix right now
    keyId: Number(KEY_ID), // this is the keyId for the accounts registered key that will be used to sign, make extra sure this is a number and not a string
    signingFunction: async (signable: { message: string }) => {
      // Singing functions are passed a signable and need to return a composite signature
      // signable.message is a hex string of what needs to be signed.
      return {
        addr: fcl.withPrefix(ADDRESS), // needs to be the same as the account.addr but this time with a prefix, eventually they will both be with a prefix
        keyId: Number(KEY_ID), // needs to be the same as account.keyId, once again make sure its a number and not a string
        signature: await NativeFRWBridge.sign(signable.message), // this needs to be a hex string of the signature, where signable.message is the hex value that needs to be signed
      };
    },
  };
};

const cadenceService = new CadenceService();

cadenceService.useRequestInterceptor(async config => {
  if (config.type === 'transaction') {
    const platform = Platform.OS;
    const nativeVersion = NativeFRWBridge.getVersion();
    const buildNumber = NativeFRWBridge.getBuildNumber();
    const network = NativeFRWBridge.getNetwork();
    const versionHeader = `// Flow Wallet - ${network} Script - ${config.name} - React Native - ${version}`;
    const platformHeader = `// Platform: ${platform} - ${nativeVersion} - ${buildNumber}`;
    config.cadence = versionHeader + '\n' + platformHeader + '\n\n' + config.cadence;
  }
  return config;
});

cadenceService.useRequestInterceptor(async config => {
  if (config.type === 'transaction') {
    config.payer = payerAuthFunction;
  }
  return config;
});

cadenceService.useRequestInterceptor(async config => {
  if (config.type === 'transaction') {
    config.proposer = authorizationFunction;
  }
  return config;
});

cadenceService.useRequestInterceptor(async config => {
  if (config.type === 'transaction') {
    config.authorizations = [authorizationFunction];
  }
  return config;
});

cadenceService.useRequestInterceptor(async config => {
  if (config.type === 'transaction') {
    config.limit = GAS_LIMITS.CADENCE_DEFAULT;
  }
  return config;
});

cadenceService.useResponseInterceptor(async response => {
  console.log('cadenceService response', response);
  if (isTransactionId(response)) {
    NativeFRWBridge.listenTransaction(response);
  }
  return response;
});

export function isTransactionId(str: any) {
  if (!str || typeof str !== 'string') {
    return false;
  }
  const cleaned = str.trim();
  const flowPattern = /^[0-9a-fA-F]{64}$/;
  const ethPattern = /^0x[0-9a-fA-F]{64}$/;
  return flowPattern.test(cleaned) || ethPattern.test(cleaned);
}

export { cadenceService };
