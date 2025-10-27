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
  const network = platform.getNetwork() as Network;
  const { data: payerStatus } = await PayerService.status({
    network: network,
  });

  // If the payer is surge active, use the proposer as the payer
  if (payerStatus.surge.active) {
    return proposer(account);
  }

  const ADDRESS = payerStatus.feePayer.address ?? '0x319e67f2ef9d937f';
  const KEY_ID = payerStatus.feePayer.keyIndex ?? 0;

  return {
    ...account,
    tempId: `${ADDRESS}-${KEY_ID}`,
    addr: ADDRESS.replace('0x', ''),
    keyId: Number(KEY_ID),
    signingFunction: async (signable: any) => {
      const { data: response } = await PayerService.signAsFeePayer({
        body: {
          message: {
            envelopeMessage: signable.message,
          },
          network: network as Network,
        },
      });
      return {
        addr: response.address,
        keyId: Number(response.keyId),
        signature: response.sig,
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
      const { data: response } = await PayerService.signAsBridgePayer({
        body: {
          message: {
            payload: signable.message,
          },
          network: network as Network,
        },
      });
      return {
        addr: response.address,
        keyId: Number(response.keyId),
        signature: response.sig,
      };
    },
  };
};
