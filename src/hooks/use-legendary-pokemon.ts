'use client';

import { useQuery } from 'react-query';

import { fetchLegendaryPokemon } from '@/lib/api';
import { PokemonDetails } from '@/lib/types';

const CACHE_TIME = 1000 * 60 * 60 * 24; // 24 hours
const CACHE_VERSION = 1; // This should match the initial CURRENT_VERSION in the API
let inMemoryCache: {
  data: PokemonDetails[];
  timestamp: number;
  version: number;
} | null = null;

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

const checkForUpdates = async (currentVersion: number): Promise<boolean> => {
  try {
    const response = await fetch('/api/check-updates');
    if (!response.ok) {
      throw new Error('Failed to check for updates');
    }
    const { version } = await response.json();
    return version > currentVersion;
  } catch (error) {
    console.error('Error checking for updates:', error);
    return false; // In case of error, assume no updates to avoid unnecessary refetches
  }
};

export const useLegendaryPokemon = () => {
  const { setItem, getItem } = useLocalStorage();

  return useQuery<PokemonDetails[], Error>(
    'legendaryPokemon',
    async () => {
      let currentVersion = CACHE_VERSION;
      let cachedData: PokemonDetails[] = []; // Change null to an empty array

      // Check in-memory cache first
      if (inMemoryCache && Date.now() - inMemoryCache.timestamp < CACHE_TIME) {
        currentVersion = inMemoryCache.version;
        cachedData = inMemoryCache.data;
        try {
          const hasUpdates = await checkForUpdates(currentVersion);
          if (!hasUpdates) {
            return cachedData;
          }
        } catch (error) {
          console.warn(
            'Failed to check for updates, using in-memory cache:',
            error
          );
          return cachedData;
        }
      }

      // Then check localStorage
      const storedData = getItem('legendaryPokemon');
      if (storedData) {
        const { data, timestamp, version } = JSON.parse(storedData);
        if (Date.now() - timestamp < CACHE_TIME) {
          currentVersion = version;
          cachedData = data;
          try {
            const hasUpdates = await checkForUpdates(currentVersion);
            if (!hasUpdates) {
              return cachedData;
            }
          } catch (error) {
            console.warn(
              'Failed to check for updates, using localStorage cache:',
              error
            );
            return cachedData;
          }
        }
      }

      // If no cache, cache is stale, or there are updates, fetch from API
      try {
        const data = await fetchLegendaryPokemon();

        // Get the latest version after fetching new data
        const { version: latestVersion } = await fetch(
          '/api/check-updates'
        ).then((res) => res.json());

        // Update in-memory cache
        inMemoryCache = { data, timestamp: Date.now(), version: latestVersion };

        // Try to update localStorage
        try {
          setItem(
            'legendaryPokemon',
            JSON.stringify({
              data,
              timestamp: Date.now(),
              version: latestVersion,
            })
          );
        } catch (error) {
          console.warn('Failed to store data in localStorage:', error);
        }

        return data;
      } catch (error) {
        console.error('Failed to fetch new data:', error);

        // If we have cached data, return it as a fallback
        if (cachedData) {
          console.warn('Falling back to cached data');
          return cachedData;
        }

        // If we have no cached data, throw the error
        throw new Error('Failed to fetch data and no cached data available');
      }
    },
    {
      staleTime: CACHE_TIME,
      cacheTime: CACHE_TIME,
      retry: 3, // Retry failed requests up to 3 times
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
    }
  );
};
