import { useState, useEffect, useRef, useCallback } from 'react';

import { type NFTItem } from '@/shared/types/nft-types';

interface UseNftHookProps {
  getCollection: (ownerAddress: string, collection: string, offset?: number) => Promise<any>;
  refreshCollection?: (ownerAddress: string, collection: string, offset?: number) => Promise<any>;
  ownerAddress: string;
  collectionName: string;
  isEvm: boolean;
}

interface UseNftHookResult {
  list: NFTItem[];
  allNfts: NFTItem[];
  filteredList: NFTItem[];
  info: any;
  total: number;
  loading: boolean;
  loadingMore: boolean;
  isLoadingAll: boolean;
  pageIndex: number;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  setFilteredList: (list: NFTItem[]) => void;
  nextPage: (currentPage: number) => Promise<{ newItemsCount: number; nextPage: number } | null>;
  loadAllPages: () => Promise<void>;
  refreshCollectionImpl: () => Promise<void>;
}

export const useNftHook = ({
  getCollection,
  refreshCollection,
  ownerAddress,
  collectionName,
  isEvm,
}: UseNftHookProps): UseNftHookResult => {
  const [list, setLists] = useState<NFTItem[]>([]);
  const [allNfts, setAllNfts] = useState<NFTItem[]>([]);
  const [filteredList, setFilteredList] = useState<NFTItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [info, setInfo] = useState<any>(null);
  const [total, setTotal] = useState(0);
  const [pageIndex, setPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);
  const [isLoadingAll, setIsLoadingAll] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const allNftsRef = useRef<NFTItem[]>([]);
  const hasAttemptedLoadAll = useRef(false);
  const currentOffsetRef = useRef<string | null>(null);

  // Reset the ref when collection changes
  useEffect(() => {
    allNftsRef.current = [];
    setAllNfts([]);
    hasAttemptedLoadAll.current = false;
  }, [ownerAddress, collectionName]);

  // Initial fetch
  useEffect(() => {
    const fetchCollection = async () => {
      setLoading(true);
      try {
        const res = await getCollection(ownerAddress, collectionName);
        setInfo(res.collection);
        setTotal(res.nftCount);
        setLists(res.nfts);
        if (isEvm && res.offset === null) {
          hasAttemptedLoadAll.current = true;
        }
      } catch (err) {
        console.error('Error in initial fetch:', err);
      } finally {
        setLoading(false);
      }
    };

    if (ownerAddress && collectionName) {
      fetchCollection();
    }
  }, [ownerAddress, collectionName, getCollection, isEvm]);

  const nextPage = useCallback(
    async (currentPage: number): Promise<{ newItemsCount: number; nextPage: number } | null> => {
      if (loadingMore) {
        return null;
      }

      setLoadingMore(true);

      try {
        const offsetToUse =
          currentOffsetRef.current !== null ? currentOffsetRef.current : currentPage * 24;
        const res = await getCollection(ownerAddress, collectionName, offsetToUse as any);

        if (!res.nfts || res.nfts.length === 0) {
          return null;
        }

        setPage(currentPage + 1);

        if (currentPage === 0) {
          setLists(res.nfts);
        } else {
          setLists((prev) => [...prev, ...res.nfts]);
        }

        if (isEvm && res.offset) {
          currentOffsetRef.current = res.offset;
        }

        if (res.offset === null && isEvm && currentPage > 0) {
          hasAttemptedLoadAll.current = true;
          return null;
        }

        return {
          newItemsCount: res.nfts.length,
          nextPage: currentPage + 1,
        };
      } catch (error) {
        console.error('Error in nextPage:', error);
        return null;
      } finally {
        setLoadingMore(false);
      }
    },
    [getCollection, ownerAddress, collectionName, loadingMore, setLists, setPage, isEvm]
  );

  const loadAllPages = useCallback(async (): Promise<void> => {
    if (loadingMore || isLoadingAll || hasAttemptedLoadAll.current) {
      return;
    }

    setIsLoadingAll(true);
    hasAttemptedLoadAll.current = true;

    try {
      let currentPage = 0;
      const maxPages = 999;
      const allLoadedNfts = [...list];

      for (let i = 0; i < maxPages; i++) {
        const result = await nextPage(currentPage);

        if (!result) {
          break;
        }

        currentPage = result.nextPage;

        await new Promise((resolve) => setTimeout(resolve, 10));
      }

      setFilteredList(list);
    } catch (err) {
      console.error('Error in loadAllPages:', err);
    } finally {
      setIsLoadingAll(false);
    }
  }, [loadingMore, nextPage, isLoadingAll, list]);

  useEffect(() => {
    if (!searchTerm) {
      setFilteredList(list);
    }
  }, [list, searchTerm]);

  useEffect(() => {
    if (isLoadingAll && allNfts.length > 0) {
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        const filtered = allNfts.filter(
          (nft) =>
            nft.name?.toLowerCase().includes(searchLower) ||
            nft.id?.toLowerCase().includes(searchLower)
        );
        setFilteredList(filtered);
      } else {
        setFilteredList(allNfts);
      }
    }
  }, [isLoadingAll, allNfts, searchTerm]);

  // Check if should load all pages
  useEffect(() => {
    const checkAndLoadAll = async () => {
      if (info && list.length > 0 && total > 0 && pageIndex > 0 && !hasAttemptedLoadAll.current) {
        await loadAllPages();
      }
    };

    checkAndLoadAll();
  }, [info, list.length, loadAllPages, total, pageIndex]);

  const refreshCollectionImpl = useCallback(async (): Promise<void> => {
    setLoading(true);
    try {
      // Use the provided refreshCollection function if available, otherwise fall back to getCollection
      const fetchFunction = refreshCollection || getCollection;
      const res = await fetchFunction(ownerAddress, collectionName);
      setInfo(res.collection);
      setTotal(res.nftCount);
      setLists(res.nfts);
    } catch (err) {
      console.error('Error in refreshCollectionImpl:', err);
    } finally {
      setLoading(false);
    }
  }, [ownerAddress, collectionName, getCollection, refreshCollection]);

  return {
    list,
    allNfts,
    filteredList,
    info,
    total,
    loading,
    loadingMore,
    isLoadingAll,
    pageIndex,
    searchTerm,
    setSearchTerm,
    setFilteredList,
    nextPage,
    loadAllPages,
    refreshCollectionImpl,
  };
};
