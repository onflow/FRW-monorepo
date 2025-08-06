import { useEffect, useState } from 'react';

import {
  addCachedDataListener,
  getCachedData,
  getLocalData,
  removeCachedDataListener,
  addStorageListener,
  removeStorageListener,
  type StorageChange,
  type AreaName,
} from '@/data-model';

type DataState = {
  key: string;
  data: unknown;
};
export const useCachedData = <T>(key: string | undefined | null): T | undefined => {
  const [dataState, setDataState] = useState<DataState | undefined>(undefined);

  useEffect(() => {
    let mounted = true;

    const fetchData = async () => {
      if (!key) return;
      const data = await getCachedData(key);
      if (mounted) {
        setDataState({ key, data });
      }
    };
    const handleDataChange = (k: string, data: unknown) => {
      if (k === key) {
        if (mounted) {
          setDataState({ key, data });
        }
      }
    };
    // Handle undefined key
    if (!key) return;

    fetchData();
    addCachedDataListener(key, handleDataChange);

    return () => {
      mounted = false;
      removeCachedDataListener(key, handleDataChange);
    };
  }, [key]);
  if (key !== dataState?.key) {
    // This is to protect against a race condition where the key changes before the data is set
    return undefined;
  }
  return dataState?.data as T;
};

export const useUserData = <T>(key: string | undefined | null): T | undefined => {
  const [dataState, setDataState] = useState<DataState | undefined>(undefined);

  useEffect(() => {
    let mounted = true;
    // Handle undefined key
    const fetchData = async () => {
      if (!key) return;
      const data = await getLocalData<T>(key);
      if (mounted) {
        setDataState({ key, data });
      }
    };

    const handleStorageChange = (
      changes: { [key: string]: StorageChange },
      namespace: AreaName
    ) => {
      if (!key) return;

      if (namespace === 'local' || namespace === 'sync') {
        if (changes[key]) {
          if (mounted) {
            setDataState({ key, data: changes[key].newValue });
          }
        }
      }
    };
    if (!key) return;

    fetchData();
    // TODO: We should store these by key to avoid removing the wrong listener
    addStorageListener(handleStorageChange);

    return () => {
      mounted = false;
      // TODO: We should store these by key to avoid removing the wrong listener
      removeStorageListener(handleStorageChange);
    };
  }, [key]);

  if (key !== dataState?.key) {
    // This is to protect against a race condition where the key changes before the data is set
    return undefined;
  }
  return dataState?.data as T;
};
