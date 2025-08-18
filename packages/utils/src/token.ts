import { type TokenModel, formatCurrencyStringForDisplay } from '@onflow/frw-types';

// Utility functions for TokenModel
export function getDisplayBalanceInFLOW(token: TokenModel): string {
  if (
    token.balanceInFLOW === undefined ||
    token.balanceInFLOW === null ||
    token.balanceInFLOW === ''
  )
    return '';
  const num = Number(token.balanceInFLOW);
  if (isNaN(num)) return '';
  return `${formatCurrencyStringForDisplay({ value: num })} FLOW`;
}

export function getDisplayBalanceWithSymbol(token: TokenModel): string {
  if (
    token.displayBalance === undefined ||
    token.displayBalance === null ||
    token.displayBalance === ''
  )
    return '';
  const num = Number(token.displayBalance);
  if (isNaN(num)) return '';
  return `${formatCurrencyStringForDisplay({ value: num })} ${token.symbol ?? ''}`.trim();
}
/// A.{address}.{contractName}.Vault
export function getTokenResourceIdentifier(token: TokenModel | null): string | null {
  if (token?.identifier) {
    if (token.identifier.includes('Vault')) {
      return token.identifier;
    } else {
      return `${token.identifier}.Vault`;
    }
  }
  if (!token || !token.contractAddress || !token.contractName) {
    return null;
  }
  return `A.${token.contractAddress}.${token.contractName}.Vault`;
}
