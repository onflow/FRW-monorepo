import { type ActiveAccountType } from '@/shared/types';

export const TERMS_OF_SERVICE_URL =
  process.env.TERMS_OF_SERVICE_URL || 'https://wallet.flow.com/terms-of-service';
export const PRIVACY_POLICY_URL =
  process.env.PRIVACY_POLICY_URL || 'https://wallet.flow.com/privacy-policy';

export const SWAP_LINK_FLOW_MAINNET =
  process.env.SWAP_LINK_FLOW_MAINNET || 'https://app.increment.fi/swap';

export const SWAP_LINK_FLOW_TESTNET =
  process.env.SWAP_LINK_FLOW_TESTNET || 'https://demo.increment.fi/swap';

export const SWAP_LINK_EVM_MAINNET = process.env.SWAP_LINK_EVM_MAINNET || 'https://swap.flow.com/';

export const SWAP_LINK_EVM_TESTNET = process.env.SWAP_LINK_EVM_TESTNET || 'https://swap.flow.com/';

export const getSwapLink = (
  network: string,
  accountType: ActiveAccountType,
  flowIdentifier?: string
): string => {
  if (accountType === 'evm') {
    // If there's a token address (flowIdentifier), use dynamic link for EVM token detail page
    if (flowIdentifier) {
      return `https://swap.flow.com/aggregator?chain=flow&inputCurrency=${encodeURIComponent(flowIdentifier)}&outputCurrency=NATIVE`;
    }
    return network === 'mainnet' ? SWAP_LINK_EVM_MAINNET : SWAP_LINK_EVM_TESTNET;
  }

  const baseLink = network === 'mainnet' ? SWAP_LINK_FLOW_MAINNET : SWAP_LINK_FLOW_TESTNET;

  // Add flow identifier query parameter for increment.fi links
  if (
    flowIdentifier &&
    (baseLink.includes('increment.fi') || baseLink.includes('demo.increment.fi'))
  ) {
    // Remove .Vault suffix if present (format should be A.xxx.TokenName, not A.xxx.TokenName.Vault)
    const cleanIdentifier = flowIdentifier.endsWith('.Vault')
      ? flowIdentifier.slice(0, -6)
      : flowIdentifier;
    return `${baseLink}?in=${encodeURIComponent(cleanIdentifier)}&out=`;
  }

  return baseLink;
};
