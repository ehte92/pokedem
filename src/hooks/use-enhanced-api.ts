import { useCallback, useEffect, useRef, useState } from 'react';

import { useQuery, useQueryClient } from 'react-query';

import {
  clearApiCache,
  fetchPokemonDetails,
  getApiConfig,
  updateApiConfig,
} from '@/lib/api';
import {
  LRUCache,
  ProgressiveLoader,
  apiMetrics,
  backgroundPrefetcher,
  connectionHealthChecker,
  createDebouncedRequest,
} from '@/lib/api-utils';
import {
  ApiCacheOptions,
  ApiResponse,
  BatchRequestOptions,
  PokemonDetails,
} from '@/lib/types';

// Enhanced Pokemon fetching with all new features
export const useEnhancedPokemon = (
  pokemonId: number,
  options?: ApiCacheOptions
) => {
  const [metrics, setMetrics] = useState(apiMetrics.getMetrics());
  const [isOnline, setIsOnline] = useState(
    connectionHealthChecker.isConnected()
  );

  // Set up connection listener
  useEffect(() => {
    const handleConnectionChange = (online: boolean) => {
      setIsOnline(online);
    };

    connectionHealthChecker.addListener(handleConnectionChange);
    return () => connectionHealthChecker.removeListener(handleConnectionChange);
  }, []);

  // Enhanced query with metrics tracking
  const query = useQuery<PokemonDetails, Error>(
    ['pokemon', pokemonId],
    async () => {
      const startTime = Date.now();
      try {
        const result = await fetchPokemonDetails(pokemonId.toString());
        apiMetrics.recordRequest(Date.now() - startTime, false);
        return result;
      } catch (error) {
        apiMetrics.recordError();
        throw error;
      }
    },
    {
      staleTime: options?.ttl || 300000, // 5 minutes default
      cacheTime: options?.ttl || 300000,
      refetchOnWindowFocus: false,
      retry: isOnline ? 3 : 0,
      enabled: isOnline || options?.background,
    }
  );

  // Update metrics when query completes
  useEffect(() => {
    setMetrics(apiMetrics.getMetrics());
  }, [query.isSuccess, query.isError]);

  return {
    ...query,
    metrics,
    isOnline,
    clearCache: clearApiCache,
  };
};

// Progressive loading hook for large datasets
export const useProgressivePokemonList = (batchSize: number = 20) => {
  const [loader] = useState(
    () =>
      new ProgressiveLoader<PokemonDetails>(
        async (page, pageSize) => {
          const offset = page * pageSize;
          const promises = Array.from({ length: pageSize }, (_, i) =>
            fetchPokemonDetails((offset + i + 1).toString())
          );
          return Promise.all(promises);
        },
        batchSize,
        1000 // Max 1000 Pokemon
      )
  );

  const [data, setData] = useState<PokemonDetails[]>([]);
  const [loading, setLoading] = useState(false);
  const [canLoadMore, setCanLoadMore] = useState(true);

  const loadMore = useCallback(async () => {
    if (loading || !canLoadMore) return;

    setLoading(true);
    try {
      const newData = await loader.loadNext();
      setData(newData);
      setCanLoadMore(loader.canLoadMore());
    } finally {
      setLoading(false);
    }
  }, [loader, loading, canLoadMore]);

  const reset = useCallback(() => {
    loader.reset();
    setData([]);
    setCanLoadMore(true);
  }, [loader]);

  return {
    data,
    loading,
    canLoadMore,
    loadMore,
    reset,
  };
};

// Debounced search hook
export const useDebouncedPokemonSearch = (delay: number = 300) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState<PokemonDetails[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Create debounced search function
  const debouncedSearch = useRef(
    createDebouncedRequest(
      async (term: string) => {
        if (!term.trim()) {
          setResults([]);
          setIsSearching(false);
          return;
        }

        setIsSearching(true);
        try {
          // Simple search by ID for demo - you can enhance this
          const pokemon = await fetchPokemonDetails(term);
          setResults([pokemon]);
        } catch (error) {
          setResults([]);
        } finally {
          setIsSearching(false);
        }
      },
      { delay, trailing: true }
    )
  ).current;

  const search = useCallback(
    (term: string) => {
      setSearchTerm(term);
      debouncedSearch(term);
    },
    [debouncedSearch]
  );

  return {
    searchTerm,
    results,
    isSearching,
    search,
  };
};

// Batch operations hook
export const useBatchPokemonFetch = () => {
  const [results, setResults] = useState<PokemonDetails[]>([]);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  const fetchBatch = useCallback(
    async (pokemonIds: number[], options?: BatchRequestOptions) => {
      setLoading(true);
      setProgress(0);
      setResults([]);

      const batchSize = options?.batchSize || 5;
      const allResults: PokemonDetails[] = [];

      try {
        for (let i = 0; i < pokemonIds.length; i += batchSize) {
          const batch = pokemonIds.slice(i, i + batchSize);
          const batchPromises = batch.map((id) =>
            fetchPokemonDetails(id.toString())
          );

          const batchResults = await Promise.allSettled(batchPromises);
          const successful = batchResults
            .filter(
              (result): result is PromiseFulfilledResult<PokemonDetails> =>
                result.status === 'fulfilled'
            )
            .map((result) => result.value);

          allResults.push(...successful);
          setResults([...allResults]);
          setProgress(((i + batch.length) / pokemonIds.length) * 100);
        }
      } finally {
        setLoading(false);
        setProgress(100);
      }

      return allResults;
    },
    []
  );

  return {
    results,
    loading,
    progress,
    fetchBatch,
  };
};

// Cache management hook
export const useCacheManager = () => {
  const queryClient = useQueryClient();
  const [cacheSize, setCacheSize] = useState(0);
  const [metrics, setMetrics] = useState(apiMetrics.getMetrics());

  // LRU Cache for additional caching layer
  const [lruCache] = useState(() => new LRUCache<any>(50, 300000));

  const clearAllCaches = useCallback(() => {
    // Clear React Query cache
    queryClient.clear();

    // Clear API cache
    clearApiCache();

    // Clear LRU cache
    lruCache.clear();

    // Reset metrics
    apiMetrics.reset();
    setMetrics(apiMetrics.getMetrics());
  }, [queryClient, lruCache]);

  const getCacheStats = useCallback(() => {
    return {
      reactQuery: queryClient.getQueryCache().getAll().length,
      lru: lruCache.size(),
      metrics: apiMetrics.getMetrics(),
    };
  }, [queryClient, lruCache]);

  const optimizeCache = useCallback(() => {
    // Clean up expired entries
    lruCache.cleanup();

    // Remove old queries
    queryClient
      .getQueryCache()
      .getAll()
      .filter((query) => {
        const dataUpdatedAt = query.state.dataUpdatedAt;
        return dataUpdatedAt && Date.now() - dataUpdatedAt > 600000; // 10 minutes
      })
      .forEach((query) => {
        queryClient.removeQueries(query.queryKey);
      });
  }, [queryClient, lruCache]);

  // Auto-cleanup every 5 minutes
  useEffect(() => {
    const interval = setInterval(optimizeCache, 300000);
    return () => clearInterval(interval);
  }, [optimizeCache]);

  return {
    clearAllCaches,
    getCacheStats,
    optimizeCache,
    lruCache,
    metrics,
  };
};

// Prefetching hook for better UX
export const usePrefetching = () => {
  const prefetchPokemon = useCallback((pokemonId: number) => {
    backgroundPrefetcher.addToPrefetch(() =>
      fetchPokemonDetails(pokemonId.toString())
    );
  }, []);

  const prefetchRange = useCallback(
    (startId: number, endId: number) => {
      for (let id = startId; id <= endId; id++) {
        prefetchPokemon(id);
      }
    },
    [prefetchPokemon]
  );

  const prefetchRelated = useCallback(
    (currentPokemon: PokemonDetails) => {
      // Prefetch evolution chain, nearby Pokemon, etc.
      const currentId = currentPokemon.id;

      // Prefetch previous and next Pokemon
      if (currentId > 1) prefetchPokemon(currentId - 1);
      if (currentId < 1000) prefetchPokemon(currentId + 1);

      // Prefetch same type Pokemon (simplified example)
      // You can enhance this based on your app's patterns
    },
    [prefetchPokemon]
  );

  return {
    prefetchPokemon,
    prefetchRange,
    prefetchRelated,
  };
};

// Configuration hook
export const useApiConfiguration = () => {
  const [config, setConfig] = useState(getApiConfig());

  const updateConfiguration = useCallback(
    (newConfig: Partial<typeof config>) => {
      updateApiConfig(newConfig);
      setConfig(getApiConfig());
    },
    []
  );

  const resetConfiguration = useCallback(() => {
    updateApiConfig({
      DEFAULT_TIMEOUT: 10000,
      MAX_CONCURRENT_REQUESTS: 10,
      RETRY_ATTEMPTS: 3,
      RETRY_DELAY: 1000,
    });
    setConfig(getApiConfig());
  }, []);

  return {
    config,
    updateConfiguration,
    resetConfiguration,
  };
};
