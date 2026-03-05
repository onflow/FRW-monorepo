import type { ClaimItem } from './claim-types';

/**
 * Extract contract address from Cadence identifier and add 0x prefix.
 * e.g. "A.1654653399040a61.FlowToken.Vault" → "0x1654653399040a61"
 */
function extractContractAddress(identifier: string): string {
  const parts = identifier.split('.');
  if (parts.length >= 2 && parts[0] === 'A') {
    return `0x${parts[1]}`;
  }
  return '';
}

/**
 * Transform a Cadence FT ticket (from LostAndFound queryUnclaimedFts) to ClaimItem.
 * Cadence returns: { display: { name, description, thumbnail: { url } }, balance: "100.0", identifier: "A.xxx.FlowToken.Vault" }
 */
export function transformFtToClaimItem(ft: any, index: number): ClaimItem {
  const display = ft?.display;
  const identifier = ft?.identifier ?? '';
  const name = display?.name ?? 'Unknown Token';
  return {
    id: `ft-${index}-${identifier || name}`,
    type: 'token',
    name,
    symbol: name,
    logoURI: display?.thumbnail?.url ?? '',
    amount: String(ft?.balance ?? '0'),
    date: '',
    senderIndex: 0,
    identifier,
    contractAddress: extractContractAddress(identifier),
  };
}

/**
 * Transform a Cadence NFT ticket (from LostAndFound queryUnclaimedNfts) to ClaimItem.
 * Cadence returns: { display: { name, description, thumbnail: { url } }, identifier: "A.xxx.TopShot.NFT" }
 */
export function transformNftToClaimItem(nft: any, index: number): ClaimItem {
  const display = nft?.display;
  const identifier = nft?.identifier ?? '';
  const name = display?.name ?? 'Unknown NFT';
  return {
    id: `nft-${index}-${identifier || name}`,
    type: 'nft',
    name,
    symbol: '',
    logoURI: display?.thumbnail?.url ?? '',
    amount: '1',
    date: '',
    senderIndex: 0,
    identifier,
    contractAddress: extractContractAddress(identifier),
    description: display?.description,
  };
}
