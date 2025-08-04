import { MMKV } from 'react-native-mmkv';

// Simple MMKV instance
export const storage = new MMKV();

// Simple storage adapter for Zustand
export const mmkvStorage = {
  setItem: (key: string, value: string) => {
    storage.set(key, value);
  },
  getItem: (key: string): string | null => {
    const value = storage.getString(key);
    return value ?? null;
  },
  removeItem: (key: string) => {
    storage.delete(key);
  },
};
