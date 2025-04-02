import storage from '@/background/webapi/storage';

import { type CacheDataItem } from '../types/data-cache-types';

/**
 * Get cached data from session storage
 * This will then trigger a background event to refresh the data if is is expired
 * The frontend should be listening for changes to this data and then re-fetching it when it changes
 * @param key - The key to get the data from
 * @returns The cached data or undefined if it doesn't exist or is expired
 */
export const getCachedData = async (key: string): Promise<unknown | undefined> => {
  const sessionData: CacheDataItem | undefined = await storage.getSession(key);
  if (!sessionData || sessionData.expiry > Date.now()) {
    // Data is not there or expired, trigger a background event to refresh the data
    // We do this by setting a key in session storage that the background script will pick up

    // Note this is async but don't await it as we don't need the result
    storage.setSession(`${key}-refresh`, Date.now());
  }
  return sessionData?.value;
};

/**
 * Listen for a data update event from the background script
 * The frontend should use this to update the data in the frontend
 * @param key - The key to listen for
 * @param updateCallback - The callback to call when the data is updated
 */
export const listenForDataUpdate = (
  key: string,
  updateCallback: (key: string, data: unknown) => void
) => {
  chrome.storage.onChanged.addListener((changes, areaName: string) => {
    if (areaName === 'session' && changes[`${key}`]) {
      updateCallback(key, changes[key].newValue);
    }
  });
};
