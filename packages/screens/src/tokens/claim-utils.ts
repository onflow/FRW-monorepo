import type { FlowIndexPricesData } from '@onflow/frw-api';

import type { ClaimItem, ClaimNFTItem } from './claim-types';

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
 * Extract contract name from Cadence identifier.
 * e.g. "A.1654653399040a61.FlowToken.Vault" → "FlowToken"
 */
function extractContractName(identifier: string): string {
  const parts = identifier.split('.');
  return parts.length >= 3 ? parts[2] : '';
}

// ---------------------------------------------------------------------------
// Cadence MetadataViews helpers — unwrap nested Cadence typed keys
// ---------------------------------------------------------------------------

/** Extract NFTCollectionDisplay from collectionData */
function getCollectionDisplay(nft: any): any {
  return nft?.collectionData?.['MetadataViews.NFTCollectionDisplay'] ?? nft?.collectionData ?? {};
}

/** Extract individual NFT Display from display field */
function getNftDisplay(nft: any): any {
  return nft?.display?.['MetadataViews.Display'] ?? nft?.display ?? {};
}

/** Extract URL from nested MetadataViews file structure */
function getMediaUrl(media: any): string {
  return (
    media?.['MetadataViews.Media']?.file?.['MetadataViews.HTTPFile']?.url ??
    media?.file?.['MetadataViews.HTTPFile']?.url ??
    media?.file?.url ??
    media?.url ??
    ''
  );
}

/** Extract URL from ExternalURL structure */
function getExternalUrl(externalURL: any): string {
  return externalURL?.['MetadataViews.ExternalURL']?.url ?? externalURL?.url ?? '';
}

/** Extract thumbnail URL from display thumbnail field */
function getThumbnailUrl(thumbnail: any): string {
  return thumbnail?.['MetadataViews.HTTPFile']?.url ?? thumbnail?.url ?? '';
}

// ---------------------------------------------------------------------------
// FT helpers
// ---------------------------------------------------------------------------

/** Extract FTDisplay from the new FungibleTokenMetadataViews wrapper */
function getFtDisplay(ft: any): any {
  return ft?.FTDisplay?.['FungibleTokenMetadataViews.FTDisplay'] ?? ft?.FTDisplay ?? null;
}

/** Extract the first logo URL from FTDisplay.logos */
function getFtLogoUrl(ftDisplay: any): string {
  const items = ftDisplay?.logos?.['MetadataViews.Medias']?.items ?? ftDisplay?.logos?.items ?? [];
  if (items.length > 0) {
    return getMediaUrl(items[0]);
  }
  return '';
}

// ---------------------------------------------------------------------------
// FT transformer
// ---------------------------------------------------------------------------

/**
 * Transform a Cadence FT ticket (from LostAndFound queryUnclaimedFts) to ClaimItem.
 *
 * New Cadence response shape:
 * {
 *   FTDisplay: { "FungibleTokenMetadataViews.FTDisplay": { name, symbol, description, logos, ... } },
 *   display: { "MetadataViews.Display": { name, description, thumbnail } },
 *   identifier: "A.xxx.Token.Vault",
 *   balance: 0.001
 * }
 */
export function transformFtToClaimItem(ft: any, index: number): ClaimItem {
  const display = ft?.display?.['MetadataViews.Display'] ?? ft?.display;
  const ftDisplay = getFtDisplay(ft);
  const identifier = ft?.identifier ?? '';

  const name = ftDisplay?.name ?? display?.name ?? 'Unknown Token';
  const symbol = ftDisplay?.symbol ?? name;

  // Prefer FTDisplay logo, fall back to display thumbnail
  const logoURI =
    (ftDisplay ? getFtLogoUrl(ftDisplay) : '') ||
    display?.thumbnail?.url ||
    getThumbnailUrl(display?.thumbnail) ||
    '';

  return {
    id: `ft-${index}-${identifier || name}`,
    type: 'token',
    name,
    symbol,
    logoURI,
    amount: String(ft?.balance ?? '0'),
    date: '',
    senderIndex: 0,
    identifier,
    contractAddress: extractContractAddress(identifier),
  };
}

// ---------------------------------------------------------------------------
// NFT transformer — groups by collection
// ---------------------------------------------------------------------------

/**
 * Group raw NFT tickets by collection (same identifier prefix = same collection).
 * Returns one ClaimItem per collection with nftItems containing individual NFTs.
 *
 * New Cadence response per NFT:
 * {
 *   collectionData: { "MetadataViews.NFTCollectionDisplay": { name, description, externalURL, squareImage, bannerImage, socials } },
 *   identifier: "A.xxx.TopShot.NFT",
 *   display: { "MetadataViews.Display": { name, description, thumbnail } }
 * }
 */
export function groupNftsByCollection(nfts: any[]): ClaimItem[] {
  const collectionMap = new Map<
    string,
    { items: any[]; identifier: string; collectionDisplay: any }
  >();

  for (const nft of nfts) {
    const identifier = nft?.identifier ?? '';
    const groupKey = identifier.split('.').slice(0, 3).join('.') || `unknown-${Math.random()}`;

    if (!collectionMap.has(groupKey)) {
      collectionMap.set(groupKey, {
        items: [],
        identifier,
        collectionDisplay: getCollectionDisplay(nft),
      });
    }
    collectionMap.get(groupKey)!.items.push(nft);
  }

  const result: ClaimItem[] = [];
  let collectionIndex = 0;

  for (const [groupKey, { items, identifier, collectionDisplay }] of collectionMap.entries()) {
    const contractName = extractContractName(identifier);
    const collectionName = collectionDisplay?.name || contractName || 'Unknown Collection';
    const collectionDescription = collectionDisplay?.description ?? '';
    const collectionLogo = getMediaUrl(collectionDisplay?.squareImage);
    const collectionWebsite = getExternalUrl(collectionDisplay?.externalURL);

    const nftItems: ClaimNFTItem[] = items.map((nft, i) => {
      const display = getNftDisplay(nft);
      return {
        id: `${groupKey}-${i}`,
        name: display?.name ?? `#${i + 1}`,
        image: getThumbnailUrl(display?.thumbnail),
        thumbnail: getThumbnailUrl(display?.thumbnail),
      };
    });

    result.push({
      id: `nft-collection-${collectionIndex}-${groupKey}`,
      type: 'nft',
      name: collectionName,
      symbol: contractName,
      logoURI: collectionLogo,
      amount: String(items.length),
      date: '',
      senderIndex: 0,
      identifier,
      contractAddress: extractContractAddress(identifier),
      description: collectionDescription,
      website: collectionWebsite,
      nftItems,
    });

    collectionIndex++;
  }

  return result;
}

// ---------------------------------------------------------------------------
// Price enrichment — merge FlowIndex prices into ClaimItems
// ---------------------------------------------------------------------------

/**
 * Compute 24h price change percentage from FlowIndex history.
 * Compares current price with the most recent history entry (typically yesterday).
 */
function compute24hChange(
  current: number,
  history: Array<{ date: string; price: number }>
): number {
  if (history.length === 0) return 0;
  // History is ordered oldest → newest; the last entry is the most recent day
  const yesterday = history[history.length - 1].price;
  if (!yesterday || yesterday === 0) return 0;
  return ((current - yesterday) / yesterday) * 100;
}

/**
 * Build a case-insensitive lookup map from FlowIndex price data.
 * Keys are uppercased symbol names.
 */
function buildPriceLookup(
  prices: FlowIndexPricesData
): Map<string, { current: number; change24h: number }> {
  const map = new Map<string, { current: number; change24h: number }>();
  for (const [symbol, data] of Object.entries(prices)) {
    if (!data?.current) continue;
    map.set(symbol.toUpperCase(), {
      current: data.current,
      change24h: compute24hChange(data.current, data.history ?? []),
    });
  }
  return map;
}

/**
 * Enrich FT ClaimItems with price, priceChange24h, and usdValue from FlowIndex data.
 * Matching is case-insensitive on the item symbol / name.
 * Returns new array (does not mutate input).
 */
export function enrichClaimItemsWithPrices(
  items: ClaimItem[],
  prices: FlowIndexPricesData
): ClaimItem[] {
  if (!prices || Object.keys(prices).length === 0) return items;

  const lookup = buildPriceLookup(prices);

  return items.map((item) => {
    if (item.type !== 'token') return item;

    // Try matching by symbol (uppercased), then by contract name from identifier
    const symbolKey = item.symbol.toUpperCase();
    let priceInfo = lookup.get(symbolKey);

    if (!priceInfo && item.identifier) {
      const contractName = extractContractName(item.identifier).toUpperCase();
      if (contractName) {
        priceInfo = lookup.get(contractName);
      }
    }

    if (!priceInfo) return item;

    const amount = parseFloat(item.amount) || 0;
    return {
      ...item,
      price: priceInfo.current,
      priceChange24h: priceInfo.change24h,
      usdValue: amount * priceInfo.current,
    };
  });
}
