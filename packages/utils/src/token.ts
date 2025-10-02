import { type TokenModel, formatCurrencyStringForDisplay } from '@onflow/frw-types';

import { stripHexPrefix } from './utils';

// Utility function to extract numeric value from token balance strings
export function extractNumericBalance(balance?: string | number): string {
  if (!balance) return '0';
  
  // Convert to string and extract only numeric characters and decimal points
  const balanceString = balance.toString();
  const numericBalance = balanceString.replace(/[^0-9.]/g, '');
  
  // Validate that we have a valid number
  const parsed = parseFloat(numericBalance);
  if (isNaN(parsed)) return '0';
  
  return numericBalance;
}

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
  const cleanAddress = stripHexPrefix(token.contractAddress);
  return `A.${cleanAddress}.${token.contractName}.Vault`;
}

export function getTokenIdentifier(token: TokenModel | null): string | null {
  if (!token || !token.contractAddress || !token.contractName) {
    return null;
  }
  const cleanAddress = stripHexPrefix(token.contractAddress);
  return `A.${cleanAddress}.${token.contractName}`;
}
