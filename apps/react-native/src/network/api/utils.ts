import NativeLocalStorage from '@/bridge/NativeFRWBridge';

export const getJwtFromNative = async () => {
  const jwt = await NativeLocalStorage?.getJWT();
  return jwt;
};
