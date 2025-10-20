import { type Network, PayerService } from '@onflow/frw-api';

import { platform } from './PlatformImpl';

export const proposer = async (account: any) => {
  const selectedAccount = await platform.getSelectedAccount();
  const address = selectedAccount.parentAddress || selectedAccount.address;
  const ADDRESS = address?.startsWith('0x') ? address : `0x${address}`;
  const KEY_ID = platform.getSignKeyIndex();
  return {
    ...account,
    tempId: `${ADDRESS}-${KEY_ID}`,
    addr: ADDRESS.replace('0x', ''),
    keyId: Number(KEY_ID),
    signingFunction: async (signable: { message: string }) => {
      return {
        addr: ADDRESS,
        keyId: Number(KEY_ID),
        signature: await platform.sign(signable.message),
      };
    },
  };
};

export const payer = async (account: any) => {
  // TODO: get payer address and key id from config
  let ADDRESS = '0x319e67f2ef9d937f'; // Fixed payer address
  const KEY_ID = 0;
  const network = platform.getNetwork() as Network;
  if (network === 'testnet') {
    ADDRESS = '0xcb1cf3196916f9e2';
  }

  return {
    ...account,
    tempId: `${ADDRESS}-${KEY_ID}`,
    addr: ADDRESS.replace('0x', ''),
    keyId: Number(KEY_ID),
    signingFunction: async (signable: any) => {
      const response = await PayerService.signAsFeePayer({
        body: {
          message: {
            envelopeMessage: signable.message,
          },
          network: network as Network,
        },
      });
      return {
        addr: response.data.address,
        keyId: Number(response.data.keyId),
        signature: response.data.sig,
      };
    },
  };
};

export const bridgeAuthorization = async (account: any) => {
  // TODO: get bridge address and key id from config
  let ADDRESS = '0xc33b4f1884ae1ea4'; // Fixed bridge address
  const KEY_ID = 0;
  const network = platform.getNetwork() as Network;
  if (network === 'testnet') {
    ADDRESS = '0xb8028ddb6592deec';
  }

  return {
    ...account,
    tempId: `${ADDRESS}-${KEY_ID}`,
    addr: ADDRESS.replace('0x', ''),
    keyId: Number(KEY_ID),
    signingFunction: async (signable: any) => {
      const response = await PayerService.signAsBridgePayer({
        body: {
          message: {
            payload: signable.message,
          },
          network: network as Network,
        },
      });
      return {
        addr: response.data.address,
        keyId: Number(response.data.keyId),
        signature: response.data.sig,
      };
    },
  };
};
