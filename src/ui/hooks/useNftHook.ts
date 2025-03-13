import { useState, useEffect, useRef, useCallback } from 'react';

import { type NFTItem } from '@/shared/types/nft-types';

interface UseNftHookProps {
  getCollection: (ownerAddress: string, collection: string, offset?: number) => Promise<any>;
  refreshCollection?: (ownerAddress: string, collection: string, offset?: number) => Promise<any>;
  ownerAddress: string;
  collectionName: string;
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

  // Create a ref to store all NFTs
  const allNftsRef = useRef<NFTItem[]>([]);
  // Add a ref to track if we've attempted to load all pages
  const hasAttemptedLoadAll = useRef(false);

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
        console.log('res', res);
        setInfo(res.collection);
        setTotal(res.nftCount);
        setLists(res.nfts);
        if (res.nftCount === res.nfts.length) {
          console.log('All NFTs loaded in initial fetch, count:', res.nftCount);
          setAllNfts(res.nfts);
          hasAttemptedLoadAll.current = true;
        }
      } catch (err) {
        // Error handling
      } finally {
        setLoading(false);
      }
    };

    if (ownerAddress && collectionName) {
      fetchCollection();
    }
  }, [ownerAddress, collectionName, getCollection]);

  // Wrap nextPage in useCallback
  const nextPage = useCallback(
    async (currentPage: number): Promise<{ newItemsCount: number; nextPage: number } | null> => {
      if (loadingMore) {
        return null;
      }

      setLoadingMore(true);

      try {
        const offset = currentPage * 24;
        const res = await getCollection(ownerAddress, collectionName, offset);

        if (!res.nfts || res.nfts.length === 0) {
          return { newItemsCount: 0, nextPage: currentPage };
        }

        // Update page index
        setPage(currentPage + 1);

        // Update the list for the current page view
        setLists(res.nfts);

        // Add new NFTs to complete collection
        const existingMap = new Map<string, NFTItem>(
          allNftsRef.current.map((nft) => [nft.id, nft])
        );

        // Add new NFTs that don't exist yet
        res.nfts.forEach((nft) => {
          if (nft.id && !existingMap.has(nft.id)) {
            existingMap.set(nft.id, nft);
          }
        });

        // Update the ref
        allNftsRef.current = Array.from(existingMap.values());

        // Also update the state for components that need it
        setAllNfts(allNftsRef.current);

        // Update other state
        setTotal(res.nftCount);
        setInfo(res.collection);

        return {
          newItemsCount: res.nfts.length,
          nextPage: currentPage + 1,
        };
      } catch (error) {
        console.error(error);
        return null;
      } finally {
        setLoadingMore(false);
      }
    },
    [
      getCollection,
      ownerAddress,
      collectionName,
      loadingMore,
      setLists,
      setPage,
      setAllNfts,
      setTotal,
      setInfo,
    ]
  );

  const loadAllPages = useCallback(async (): Promise<void> => {
    if (loadingMore || isLoadingAll || hasAttemptedLoadAll.current) {
      return;
    }

    setIsLoadingAll(true);
    hasAttemptedLoadAll.current = true;

    try {
      let currentPage = 0; // Start from the beginning
      const maxPages = 999;

      for (let i = 0; i < maxPages; i++) {
        const result = await nextPage(currentPage);

        if (!result || result.newItemsCount === 0) {
          break;
        }

        currentPage = result.nextPage;

        // Add a delay between requests
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }

      // After loading all pages, explicitly update the list with all NFTs
      setLists(allNftsRef.current);
      setFilteredList(allNftsRef.current);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoadingAll(false);
    }
  }, [loadingMore, nextPage, isLoadingAll]);

  // Update filteredList when list changes
  useEffect(() => {
    if (!searchTerm) {
      setFilteredList(list);
    }
  }, [list, searchTerm]);

  // Update filteredList when allNfts changes
  useEffect(() => {
    if (isLoadingAll && allNfts.length > 0) {
      // When loading all and we have NFTs, update filtered list based on search
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
      console.error(err);
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
