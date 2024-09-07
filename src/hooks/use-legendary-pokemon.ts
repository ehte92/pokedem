import { useQuery } from 'react-query';

import { fetchLegendaryPokemon } from '@/lib/api';
import { PokemonDetails } from '@/lib/types';

const CACHE_TIME = 1000 * 60 * 60 * 24; // 24 hours
let inMemoryCache: { data: PokemonDetails[]; timestamp: number } | null = null;

const useLocalStorage = () => {
  const setItem = (key: string, value: string) => {
    try {
      localStorage.setItem(key, value);
    } catch (error) {
      console.warn('localStorage is not available:', error);
    }
  };

  const getItem = (key: string) => {
    try {
      return localStorage.getItem(key);
    } catch (error) {
      console.warn('localStorage is not available:', error);
      return null;
    }
  };

  return { setItem, getItem };
};

export const useLegendaryPokemon = () => {
  const { setItem, getItem } = useLocalStorage();

  return useQuery<PokemonDetails[], Error>(
    'legendaryPokemon',
    async () => {
      // Check in-memory cache first
      if (inMemoryCache && Date.now() - inMemoryCache.timestamp < CACHE_TIME) {
        return inMemoryCache.data;
      }

      // Then check localStorage
      const cachedData = getItem('legendaryPokemon');
      if (cachedData) {
        const { data, timestamp } = JSON.parse(cachedData);
        if (Date.now() - timestamp < CACHE_TIME) {
          return data;
        }
      }

      // If no cache or cache is stale, fetch from API
      const data = await fetchLegendaryPokemon();

      // Update in-memory cache
      inMemoryCache = { data, timestamp: Date.now() };

      // Try to update localStorage, fall back to in-memory if it fails
      try {
        setItem(
          'legendaryPokemon',
          JSON.stringify({
            data,
            timestamp: Date.now(),
          })
        );
      } catch (error) {
        console.warn(
          'Failed to store data in localStorage, using in-memory cache instead:',
          error
        );
      }

      return data;
    },
    {
      staleTime: CACHE_TIME,
      cacheTime: CACHE_TIME,
    }
  );
};
