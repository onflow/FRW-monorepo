import type { WalletAccount } from '@onflow/frw-types';

/**
 * Enhanced COA visibility check matching Android/iOS behavior.
 * Check order (early return to save cost):
 * 1. Non-EVM → always show
 * 2. Data not loaded → show (don't hide prematurely)
 * 3. FLOW balance > 0 → show (cheapest check, already loaded)
 * 4. ERC20 balance > 0 → show (only checked if FLOW = 0)
 * 5. NFTs > 0 → show
 * 6. All zero → hide
 */
export function shouldHideCoaAccount(
  account: WalletAccount,
  erc20HasBalanceLookup?: Map<string, boolean>
): boolean {
  // 1. Only check EVM/COA accounts
  if (account.type !== 'evm') return false;

  // 2. If no data loaded at all, don't hide
  if (account.balance === undefined && account.nfts === undefined) return false;

  // 3. Check FLOW balance first (cheapest, already in account object)
  const balanceStr = account.balance || '0';
  const balanceMatch = balanceStr.match(/^([\d,.]+)/);
  const balanceValue = balanceMatch ? parseFloat(balanceMatch[1].replace(/,/g, '')) : 0;
  if (balanceValue > 0) return false;

  // 4. Check ERC20 tokens (only if FLOW = 0, avoids unnecessary check)
  if (erc20HasBalanceLookup?.get(account.address)) return false;

  // 5. Check NFTs
  const nftCount = parseInt(account.nfts || '0', 10);
  if (nftCount > 0) return false;

  // 6. All checks failed → hide
  return true;
}
