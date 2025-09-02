import AsyncStorage from '@react-native-async-storage/async-storage';

import { AsyncStorageCache } from './AsyncStorageCache';
import { AsyncStorageImpl } from './AsyncStorageImpl';

// Business data storage using typed StorageKeyMap interface
export const storage = new AsyncStorageImpl();

// TanStack Query cache using optimized Cache interface
export const cache = new AsyncStorageCache('tanquery:');

// Simple storage adapter for Zustand
export const asyncStorageAdapter = {
  setItem: async (key: string, value: string) => {
    await AsyncStorage.setItem(key, value);
  },
  getItem: async (key: string): Promise<string | null> => {
    const value = await AsyncStorage.getItem(key);
    return value ?? null;
  },
  removeItem: async (key: string) => {
    await AsyncStorage.removeItem(key);
  },
};
