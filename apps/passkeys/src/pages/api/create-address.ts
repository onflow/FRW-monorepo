import { logger } from '@onflow/frw-context';
import { type NextApiRequest, type NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const {
      publicKey,
      network = 'testnet',
      hashAlgorithm = 'SHA2_256',
      signatureAlgorithm = 'ECDSA_P256',
      weight = 1000,
    } = req.body;

    if (!publicKey) {
      return res.status(400).json({ error: 'Public key is required' });
    }

    const safeKey = typeof publicKey === 'string' ? `${publicKey.slice(0, 16)}…` : 'unknown';
    logger.info('Creating address for public key', { publicKey: safeKey });
    logger.info('Using network', network);
    logger.debug('Lilico API key configured', !!process.env.LILICO_API_KEY);

    // Use Lilico's OpenAPI for address creation
    const url = `https://openapi.lilico.org/v1/address${network === 'testnet' ? '/testnet' : ''}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: process.env.LILICO_API_KEY || '',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        publicKey,
        weight,
        hashAlgorithm,
        signatureAlgorithm,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      logger.error('Lilico API error', response.status, errorText);
      throw new Error(`Address creation failed: ${response.status} ${errorText}`);
    }

    const result = await response.json();
    logger.debug('Address creation result', result);

    return res.status(200).json({
      success: true,
      txId: result.data?.txId,
      address: result.data?.address,
    });
  } catch (error) {
    logger.error('Address creation error', error);
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    });
  }
}
