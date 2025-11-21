import { logger } from '@onflow/frw-context';
import { type NextApiRequest, type NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { publicKey } = req.query;

    if (!publicKey || typeof publicKey !== 'string') {
      return res.status(400).json({ error: 'Public key is required' });
    }

    const safeKey = typeof publicKey === 'string' ? `${publicKey.slice(0, 16)}…` : 'unknown';
    logger.info('Looking up address for public key', { publicKey: safeKey });

    // Use Flow's official key indexer service
    const keyIndexerUrl =
      process.env.NEXT_PUBLIC_FLOW_NETWORK === 'mainnet'
        ? `https://production.key-indexer.flow.com/key/${publicKey}`
        : `https://staging.key-indexer.flow.com/key/${publicKey}`;

    const response = await fetch(keyIndexerUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'FlowPasskeyWallet/1.0',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      logger.error('Indexer API error', response.status, errorText);
      throw new Error(`Indexer request failed: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    logger.debug('Key indexer response', data);

    // Handle different response formats from Flow key indexer
    let accounts: any[] = [];

    if (Array.isArray(data)) {
      accounts = data;
    } else if (data.accounts && Array.isArray(data.accounts)) {
      accounts = data.accounts;
    } else if (data.result && Array.isArray(data.result)) {
      accounts = data.result;
    }

    if (accounts.length > 0) {
      // Extract and format addresses, filter by weight and revocation status
      const addresses = accounts
        .filter((account: any) => {
          const isRevoked = account.isRevoked || account.revoked || false;
          const weight = account.weight || 1000;
          return !isRevoked && weight >= 1000; // Full weight keys only
        })
        .map((account: any) => {
          // Handle different address field names
          let address = account.address || account.accountAddress || '';

          // Ensure address is properly formatted with 0x prefix and padding
          if (!address.startsWith('0x')) {
            address = '0x' + address;
          }
          // Pad to 16 characters (18 total with 0x)
          if (address.length < 18) {
            address = '0x' + address.slice(2).padStart(16, '0');
          }
          return address;
        });

      return res.status(200).json({
        success: true,
        addresses,
        count: addresses.length,
      });
    }

    return res.status(200).json({
      success: true,
      addresses: [],
      count: 0,
    });
  } catch (error) {
    logger.error('Address lookup error', error);
    return res.status(500).json({
      success: false,
      addresses: [],
      count: 0,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    });
  }
}
