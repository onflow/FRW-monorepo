import React, {
  type ReactNode,
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from 'react';

import type { NewsItem } from '@/shared/types/network-types';
import { consoleError } from '@/shared/utils/console-log';
import { useWallet, useWalletLoaded } from 'ui/utils';

interface NewsContextType {
  news: NewsItem[];
  unreadCount: number;
  markAllAsRead: () => Promise<void>;
  dismissNews: (id: string) => Promise<void>;
  isRead: (id: string) => Promise<boolean>;
  markAsRead: (id: string) => Promise<boolean>;
  resetNews: () => Promise<void>;
}

const NewsContext = createContext<NewsContextType | undefined>(undefined);

export function NewsProvider({ children }: { children: ReactNode }) {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const wallet = useWallet();
  const walletLoaded = useWalletLoaded();

  useEffect(() => {
    let isMounted = true;

    const fetchNews = async () => {
      const walletNews = await wallet.getNews();
      const walletUnreadCount = await wallet.getUnreadNewsCount();

      if (isMounted) {
        setNews(walletNews);
        setUnreadCount(walletUnreadCount);
      }
    };

    if (walletLoaded) {
      fetchNews().catch(consoleError);
    }

    return () => {
      isMounted = false;
    };
  }, [wallet, walletLoaded]);

  const isRead = useCallback(
    async (id: string): Promise<boolean> => {
      return await wallet?.isNewsRead(id);
    },
    [wallet]
  );

  const markAsRead = useCallback(
    async (id: string): Promise<boolean> => {
      const markedAsRead = (await wallet?.markNewsAsRead(id).catch(consoleError)) || false;
      // Update news state
      if (markedAsRead) {
        setUnreadCount((prevCount) => prevCount - 1);
      }
      return markedAsRead;
    },
    [wallet]
  );

  const markAllAsRead = useCallback(async () => {
    setUnreadCount(0);
    await wallet?.markAllNewsAsRead().catch(consoleError);
    // Update news state
    setUnreadCount(0);
  }, [wallet]);

  const dismissNews = useCallback(
    async (id: string) => {
      await wallet?.markNewsAsDismissed(id).catch(consoleError);

      // Update news state
      setNews(await wallet.getNews());
    },
    [wallet]
  );

  const resetNews = useCallback(async () => {
    await wallet?.resetNews().catch(consoleError);
  }, [wallet]);

  const value: NewsContextType = {
    news,
    unreadCount,
    markAllAsRead,
    dismissNews,
    isRead,
    markAsRead,
    resetNews,
  };

  return <NewsContext.Provider value={value}>{children}</NewsContext.Provider>;
}

export function useNews() {
  const context = useContext(NewsContext);
  if (context === undefined) {
    throw new Error('useNews must be used within a NewsProvider');
  }
  return context;
}
