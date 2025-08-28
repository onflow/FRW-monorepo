import { PersistStorage } from 'zustand/middleware';
import { asyncStorage } from './storage';

// AsyncStorage adapter for Zustand
export const asyncStorageAdapter: PersistStorage<unknown> = {
  getItem: async (name: string) => {
    try {
      const value = await asyncStorage.getItem(name);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error('Storage getItem error:', error);
      return null;
    }
  },
  setItem: async (name: string, value: unknown) => {
    try {
      await asyncStorage.setItem(name, JSON.stringify(value));
    } catch (error) {
      console.error('Storage setItem error:', error);
    }
  },
  removeItem: async (name: string) => {
    try {
      await asyncStorage.removeItem(name);
    } catch (error) {
      console.error('Storage removeItem error:', error);
    }
  },
};

// Backward compatibility export
export const mmkvStorageAdapter = asyncStorageAdapter;
