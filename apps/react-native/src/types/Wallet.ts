export enum WalletType {
  Flow = 'flow',
  EVM = 'evm',
}

export function addressType(address: string): WalletType {
  if (address.length > 18) {
    return WalletType.EVM;
  }
  return WalletType.Flow;
}
