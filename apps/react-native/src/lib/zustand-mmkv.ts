import { PersistStorage } from 'zustand/middleware';
import { mmkvStorage } from './storage';

// AsyncStorage adapter for Zustand
export const mmkvStorageAdapter: PersistStorage<unknown> = {
  getItem: async (name: string) => {
    try {
      const value = await mmkvStorage.getItem(name);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error('Storage getItem error:', error);
      return null;
    }
  },
  setItem: async (name: string, value: unknown) => {
    try {
      await mmkvStorage.setItem(name, JSON.stringify(value));
    } catch (error) {
      console.error('Storage setItem error:', error);
    }
  },
  removeItem: async (name: string) => {
    try {
      await mmkvStorage.removeItem(name);
    } catch (error) {
      console.error('Storage removeItem error:', error);
    }
  },
};
