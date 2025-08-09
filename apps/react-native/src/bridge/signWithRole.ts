import { platform } from './PlatformImpl';

export const proposer = async (account: any) => {
  const address = platform.getSelectedAddress() || '';
  const ADDRESS = address.startsWith('0x') ? address : `0x${address}`;
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

const getPayerSignature = async (endPoint: string, signable: any) => {
  const network = platform.getNetwork();
  const token = await platform.getJWT();
  const response = await fetch(endPoint, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      network: network,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      transaction: signable.voucher,
      message: {
        envelope_message: signable.message,
      },
    }),
  });
  const data = (await response.json()) as { envelopeSigs: { sig: string } };
  const signature = data.envelopeSigs.sig;
  return signature;
};

export const payer = async (account: any) => {
  // TODO: get payer address and key id from config
  let ADDRESS = '0x319e67f2ef9d937f'; // Fixed payer address
  const KEY_ID = 0;
  const network = platform.getNetwork();
  if (network === 'testnet') {
    ADDRESS = '0xcb1cf3196916f9e2';
  } else if (network === 'mainnet') {
    ADDRESS = '0x319e67f2ef9d937f';
  }
  return {
    ...account,
    tempId: `${ADDRESS}-${KEY_ID}`,
    addr: ADDRESS.replace('0x', ''),
    keyId: Number(KEY_ID),
    signingFunction: async (signable: any) => {
      return {
        addr: ADDRESS,
        keyId: Number(KEY_ID),
        signature: await getPayerSignature(
          'https://us-central1-lilico-334404.cloudfunctions.net/signAsPayer',
          signable
        ),
      };
    },
  };
};

export const bridgeAuthorization = async (account: any) => {
  // TODO: get bridge address and key id from config
  let ADDRESS = '0xc33b4f1884ae1ea4'; // Fixed bridge address
  const KEY_ID = 0;
  const network = platform.getNetwork();
  if (network === 'testnet') {
    ADDRESS = '0xb8028ddb6592deec';
  } else if (network === 'mainnet') {
    ADDRESS = '0xc33b4f1884ae1ea4';
  }

  return {
    ...account,
    tempId: `${ADDRESS}-${KEY_ID}`,
    addr: ADDRESS.replace('0x', ''),
    keyId: Number(KEY_ID),
    signingFunction: async (signable: any) => {
      return {
        addr: ADDRESS,
        keyId: Number(KEY_ID),
        signature: await getPayerSignature(
          `${platform.getApiEndpoint()}/api/signAsBridgeFeePayer`,
          signable
        ),
      };
    },
  };
};
