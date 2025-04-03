import { useEffect, useState } from 'react';

import storage, { type AreaName, type StorageChange } from '@/background/webapi/storage';
import {
  addCachedDataListener,
  getCachedData,
  removeCachedDataListener,
} from '@/shared/utils/data-cache-access';

export const useCachedData = <T>(key: string) => {
  const [data, setData] = useState<T | undefined>(undefined);

  useEffect(() => {
    let mounted = true;

    const fetchData = async () => {
      const data = await getCachedData(key);
      if (mounted) {
        setData(data as T);
      }
    };
    const handleDataChange = (k: string, data: unknown) => {
      if (k === key) {
        if (mounted) {
          setData(data as T);
        }
      }
    };
    fetchData();
    addCachedDataListener(key, handleDataChange);

    return () => {
      mounted = false;
      removeCachedDataListener(key, handleDataChange);
    };
  }, [key]);

  return data;
};

export const usePersistedData = <T>(key: string) => {
  const [data, setData] = useState<T | undefined>(undefined);

  useEffect(() => {
    let mounted = true;
    const fetchData = async () => {
      const data = await storage.get(key);
      if (mounted) {
        setData(data as T);
      }
    };

    const handleStorageChange = (
      changes: { [key: string]: StorageChange },
      namespace: AreaName
    ) => {
      if (namespace === 'local' || namespace === 'sync') {
        if (changes[key]) {
          if (mounted) {
            setData(changes[key].newValue as T);
          }
        }
      }
    };

    fetchData();
    storage.addStorageListener(handleStorageChange);

    return () => {
      mounted = false;
      storage.removeStorageListener(handleStorageChange);
    };
  }, [key]);

  return data;
};
