import { useQuery } from 'react-query';

import { fetchAllMoves } from '@/lib/api';
import { MoveDetails } from '@/lib/types';
import { getItem, setItem } from '@/utils/indexedDB';

const CACHE_KEY = 'cachedMovesList';
const CACHE_TIME = 24 * 60 * 60 * 1000; // 24 hours

export const useCachedMoves = () => {
  const {
    data: allMoves,
    isLoading,
    error,
  } = useQuery<MoveDetails[]>(
    'allMoves',
    async () => {
      try {
        // Try to get cached data from IndexedDB
        const cachedData = await getItem(CACHE_KEY);
        if (cachedData && Date.now() - cachedData.timestamp < CACHE_TIME) {
          return cachedData.moves;
        }
      } catch (err) {
        console.warn('Failed to retrieve cached moves:', err);
      }

      // If no valid cache, fetch from API
      const moves = await fetchAllMoves();

      // Try to cache the fetched data
      try {
        await setItem(CACHE_KEY, {
          timestamp: Date.now(),
          moves,
        });
      } catch (err) {
        console.warn('Failed to cache moves:', err);
      }

      return moves;
    },
    {
      staleTime: CACHE_TIME,
      cacheTime: CACHE_TIME,
    }
  );

  return {
    allMoves,
    isLoading,
    error,
  };
};
