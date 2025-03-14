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
  const [pageIndex, setPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);
  const [isLoadingAll, setIsLoadingAll] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const allNftsRef = useRef<NFTItem[]>([]);
  const hasAttemptedLoadAll = useRef(false);
  const total = useRef<number>(0);
  const initialized = useRef(false);

  // Reset the ref when collection changes
  useEffect(() => {
    allNftsRef.current = [];
    setAllNfts([]);
    hasAttemptedLoadAll.current = false;
  }, [ownerAddress, collectionName]);

  const evmNextPage = useCallback(
    async (currentPage: number): Promise<{ newItemsCount: number; nextPage: number } | null> => {
      if (loadingMore) return null;
      setLoadingMore(true);

      try {
        const offsetToUse = currentPage * 24;
        const res = await getCollection(ownerAddress, collectionName, offsetToUse);

        if (res.nfts?.length > 0) {
          setLists((prev) => {
            const uniqueNfts = [
              ...new Map([...prev, ...res.nfts].map((item) => [item.id, item])).values(),
            ];
            return uniqueNfts;
          });
          setPage(currentPage + 1);
        }

        setLoadingMore(false);

        if (total.current <= (currentPage + 1) * 24) {
          return null;
        }

        return {
          newItemsCount: res.nfts?.length || 0,
          nextPage: currentPage + 1,
        };
      } catch (error) {
        console.error('Error in evmNextPage:', error);
        setLoadingMore(false);
        return null;
      }
    },
    [getCollection, ownerAddress, collectionName, loadingMore, setLists, setPage, total]
  );

  const cadenceNextPage = useCallback(
    async (currentPage: number): Promise<{ newItemsCount: number; nextPage: number } | null> => {
      if (!hasAttemptedLoadAll.current) {
        return null;
      }

      try {
        const offsetToUse = currentPage * 50;
        if (total.current <= offsetToUse) {
          return null;
        }

        getCollection(ownerAddress, collectionName, offsetToUse as any)
          .then((res) => {
            if (res.nfts?.length > 0) {
              setLists((prev) => [...prev, ...res.nfts]);
            }
          })
          .catch((error) => console.error('Error in cadenceNextPage:', error));

        return null;
      } catch (error) {
        console.error('Error in cadenceNextPage:', error);
        return null;
      }
    },
    [getCollection, ownerAddress, collectionName, setLists, total]
  );

  const loadAllPages = useCallback(async (): Promise<void> => {
    if (loadingMore || isLoadingAll || hasAttemptedLoadAll.current) {
      return;
    }

    setIsLoadingAll(true);

    try {
      const initialRes = await getCollection(ownerAddress, collectionName);
      setInfo(initialRes.collection);
      total.current = initialRes.nftCount;

      const maxPages = isEvm ? 9999 : Math.ceil(total.current / 50);
      console.log('loadAllPages maxPages:', maxPages);

      if (!isEvm) {
        hasAttemptedLoadAll.current = true;
        const requests = Array.from({ length: maxPages }, (_, i) => i).map((page) =>
          setTimeout(() => {
            if (!hasAttemptedLoadAll.current) return;
            cadenceNextPage(page);
          }, page * 10)
        );
        await Promise.all(requests);
      } else {
        // For EVM, keep sequential loading
        for (let i = 0; i < maxPages; i++) {
          const result = await evmNextPage(i);
          if (!result) break;
          await new Promise((resolve) => setTimeout(resolve, 10));
        }
      }

      setFilteredList(list);
    } catch (err) {
      console.error('Error in loadAllPages:', err);
    } finally {
      setIsLoadingAll(false);
    }
  }, [
    loadingMore,
    isLoadingAll,
    getCollection,
    ownerAddress,
    collectionName,
    isEvm,
    evmNextPage,
    cadenceNextPage,
    list,
  ]);

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

  // Initialize and load all NFTs
  useEffect(() => {
    if (!ownerAddress || !collectionName || initialized.current) {
      return;
    }

    const initialize = async () => {
      initialized.current = true;
      console.log('Initializing once');
      await loadAllPages();
    };

    initialize();
  }, [ownerAddress, collectionName, loadAllPages]);

  const refreshCollectionImpl = useCallback(async (): Promise<void> => {
    setLoading(true);
    try {
      // Use the provided refreshCollection function if available, otherwise fall back to getCollection
      const fetchFunction = refreshCollection || getCollection;
      const res = await fetchFunction(ownerAddress, collectionName);
      setInfo(res.collection);
      total.current = res.nftCount;
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
    total: total.current,
    loading,
    loadingMore,
    isLoadingAll,
    pageIndex,
    searchTerm,
    setSearchTerm,
    setFilteredList,
    nextPage: isEvm ? evmNextPage : cadenceNextPage,
    loadAllPages,
    refreshCollectionImpl,
  };
};
