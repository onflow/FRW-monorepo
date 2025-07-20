import storage, { type StorageChange } from '@onflow/frw-extension-shared/storage';
import { consoleError } from '@onflow/frw-shared/utils';

import { type CacheDataItem } from './data-cache-types';

// The listeners object is used to store a reference to the listener function that is created by _updateCaller.
// This is necessary because chrome.storage.onChanged.removeListener requires the exact same function instance
// that was passed to addListener. If we call _updateCaller again in removeCachedDataListener, it will create
// a new function instance, and the listener will not be removed.
const listeners: {
  [key: string]: (changes: { [key: string]: StorageChange }, areaName: string) => void;
} = {};

/**
 * Get cached data from session storage
 * This will then trigger a background event to refresh the data if is is expired
 * The frontend should be listening for changes to this data and then re-fetching it when it changes
 * @param key - The key to get the data from
 * @returns The cached data or undefined if it doesn't exist or is expired
 */
export const getCachedData = async <T>(key: string): Promise<T | undefined> => {
  const sessionData: CacheDataItem | undefined = await storage.getSession(key);
  if (!sessionData || sessionData.expiry < Date.now()) {
    // Data is not there or expired, trigger a background event to refresh the data
    // We do this by setting a key in session storage that the background script will pick up

    // Note this is async but don't await it as we don't need the result
    storage.setSession(`${key}-refresh`, Date.now());
  }
  return sessionData?.value as T | undefined;
};

/**
 * Trigger a refresh of the data for a given key
 * Should rarlely be used!!
 * @param key - The key to trigger a refresh for
 */
export const triggerRefresh = (key: string) => {
  storage.setSession(`${key}-refresh`, Date.now());
};
/**
 * Internal function to call the update callback
 * @param key - The key to listen for
 * @param updateCallback - The callback to call when the data is updated
 */
const _updateCaller = (key: string, updateCallback: (key: string, data: unknown) => void) => {
  return (changes: { [key: string]: StorageChange }, areaName: string) => {
    if (areaName === 'session' && changes[`${key}`] && changes[key].newValue) {
      try {
        const cacheData = changes[key].newValue as CacheDataItem;
        updateCallback(key, cacheData.value);
      } catch (error) {
        consoleError('Error updating cached data', key, changes[key], error);
      }
    }
  };
};
/**
 * Listen for a data update event from the background script
 * The frontend should use this to update the data in the frontend
 * @param key - The key to listen for
 * @param updateCallback - The callback to call when the data is updated
 */
export const addCachedDataListener = (
  key: string,
  updateCallback: (key: string, data: unknown) => void
) => {
  listeners[key] = _updateCaller(key, updateCallback);
  chrome.storage.onChanged.addListener(listeners[key]);
};

/**
 * Remove a cached data listener
 * @param key - The key to remove the listener for
 * @param _updateCallback - The callback to remove
 */
export const removeCachedDataListener = (
  key: string,
  _updateCallback: (key: string, data: unknown) => void
) => {
  chrome.storage.onChanged.removeListener(listeners[key]);
  delete listeners[key];
};
