/**
 * Represents a fungible token from the Flow token catalog (FtService.full()).
 * Used in the Add Tokens screen to display all available tokens.
 */
export interface FungibleTokenCatalogItem {
  chainId?: number;
  address: string;
  symbol: string;
  name: string;
  decimals?: number;
  logoURI?: string;
  /** Full Cadence type identifier, e.g. A.1654653399040a61.FlowToken */
  flowIdentifier?: string;
  tags?: string[];
  extensions?: Record<string, unknown>;
}
