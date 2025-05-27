import { useEffect, useState } from 'react';

import { newsService } from '@/background/service';
import { type NewsItem } from '@/shared/types/news-types';
import { newsKey } from '@/shared/utils/cache-data-keys';

import { useMainAccountStorageBalance } from './use-account-hooks';
import { useCachedData, useUserData } from './use-data';
import { useProfiles } from './useProfileHook';

export const useNews = () => {
  const { mainAddress, parentAccountStorageBalance } = useProfiles();
  const cachedNews = useCachedData<NewsItem[]>(newsKey());

  const [newsForActiveAccount, setNewsForActiveAccount] = useState<NewsItem[]>([]);

  useEffect(() => {
    const fetchNews = async () => {
      const news = await newsService.getNews();
      setNewsForActiveAccount(news);
    };
    fetchNews();
  }, [mainAddress]);

  return newsForActiveAccount;
};
