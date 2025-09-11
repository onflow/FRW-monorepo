/**
 * Extension storage adapter for wallet package
 * Implements StorageProtocol using extension's existing storage system
 */

import { type StorageProtocol } from '@onflow/frw-wallet';

import { getLocalData, setLocalData, removeLocalData } from '@/data-model/storage';

export class ExtensionStorage implements StorageProtocol {
  /**
   * Get data from storage
   */
  async get(key: string): Promise<any> {
    try {
      return await getLocalData(`wallet-${key}`);
    } catch (error) {
      console.error(`ExtensionStorage.get failed for key: ${key}`, error);
      return undefined;
    }
  }

  /**
   * Set data to storage
   */
  async set(key: string, value: any): Promise<void> {
    try {
      await setLocalData(`wallet-${key}`, value);
    } catch (error) {
      console.error(`ExtensionStorage.set failed for key: ${key}`, error);
      throw error;
    }
  }

  /**
   * Remove data from storage
   */
  async remove(key: string): Promise<void> {
    try {
      await removeLocalData(`wallet-${key}`);
    } catch (error) {
      console.error(`ExtensionStorage.remove failed for key: ${key}`, error);
      throw error;
    }
  }

  /**
   * Clear all wallet-related storage
   */
  async clear(): Promise<void> {
    // Note: This is a simplified implementation
    // In a real scenario, we might want to iterate through all keys
    // and remove only wallet-* prefixed keys
    console.warn('ExtensionStorage.clear() not fully implemented - would clear all wallet data');
  }
}
