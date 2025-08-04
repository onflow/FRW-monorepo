import NativeFRWBridge from '../bridge/NativeFRWBridge';

/**
 * Utility function to get JWT from native bridge
 * Returns empty string if no JWT is available
 */
export const getJwtFromNative = async (): Promise<string> => {
  const jwt = await NativeFRWBridge?.getJWT();
  return jwt || '';
};

/**
 * Utility function to get wallet address from native bridge
 * Returns empty string if no address is available
 */
export const getAddressFromNative = (): string => {
  const address = NativeFRWBridge?.getSelectedAddress();
  return address || '';
};

/**
 * Utility function to get network from native bridge
 * Returns 'testnet' as default if no network is available
 */
export const getNetworkFromNative = (): string => {
  const network = NativeFRWBridge?.getNetwork();
  return network || 'testnet';
};

/**
 * Check if we're running in demo/development mode
 * Returns true if any of the native bridge values are demo/fallback values
 */
export const isDemoMode = async (): Promise<boolean> => {
  const jwt = await getJwtFromNative();
  const address = getAddressFromNative();

  // Consider it demo mode if:
  // 1. JWT is the demo fallback token
  // 2. Address is the demo fallback address
  // 3. JWT is too short to be a real Firebase JWT
  return !jwt || jwt === 'demo-jwt-token' || jwt.length < 50 || address === '0x6422f44c7643d080';
};

/**
 * Get authentication headers for API requests
 */
export const getAuthHeaders = async () => {
  const jwt = await getJwtFromNative();
  const network = getNetworkFromNative();

  return {
    Authorization: `Bearer ${jwt}`,
    'Content-Type': 'application/json',
    Network: network,
    'User-Agent': 'FRW-RN/1.0.0',
  };
};
