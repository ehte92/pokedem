import { useCallback, useEffect, useState } from 'react';

import { useQuery, useQueryClient } from 'react-query';

import {
  fetchEvolutionChain,
  fetchPokemonDetails,
  fetchPokemonSpecies,
} from '@/lib/api';
import {
  apiMetrics,
  backgroundPrefetcher,
  connectionHealthChecker,
  requestDeduplicator,
} from '@/lib/api-utils';
import {
  ApiCacheOptions,
  EvolutionChain,
  PokemonDetails,
  PokemonSpecies,
} from '@/lib/types';

interface UsePokemonDetailsOptions extends ApiCacheOptions {
  prefetchRelated?: boolean;
  prefetchEvolutionChain?: boolean;
  enableMetrics?: boolean;
  retryOnOffline?: boolean;
  backgroundRefresh?: boolean;
}

interface UsePokemonDetailsReturn {
  // Core data
  pokemon: PokemonDetails | undefined;
  species: PokemonSpecies | undefined;
  evolutionChain: EvolutionChain | undefined;

  // Loading states
  isLoading: boolean;
  isLoadingSpecies: boolean;
  isLoadingEvolution: boolean;
  isRefetching: boolean;

  // Error states
  error: Error | null;
  speciesError: Error | null;
  evolutionError: Error | null;

  // Connection & metrics
  isOnline: boolean;
  metrics: ReturnType<typeof apiMetrics.getMetrics>;

  // Actions
  refetch: () => void;
  prefetchRelated: () => void;
  clearCache: () => void;

  // Status
  isCached: boolean;
  lastFetched: number | null;
}

export function usePokemonDetails(
  pokemonId: number,
  options: UsePokemonDetailsOptions = {}
): UsePokemonDetailsReturn {
  const {
    prefetchRelated = true,
    prefetchEvolutionChain = true,
    enableMetrics = true,
    retryOnOffline = true,
    backgroundRefresh = false,
    ttl = 300000, // 5 minutes default
    force = false,
  } = options;

  const queryClient = useQueryClient();
  const [isOnline, setIsOnline] = useState(() =>
    typeof window !== 'undefined' ? connectionHealthChecker.isConnected() : true
  );
  const [metrics, setMetrics] = useState(() => apiMetrics.getMetrics());

  // Connection health monitoring
  useEffect(() => {
    const handleConnectionChange = (online: boolean) => {
      setIsOnline(online);
    };

    connectionHealthChecker.addListener(handleConnectionChange);
    return () => connectionHealthChecker.removeListener(handleConnectionChange);
  }, []);

  // Enhanced Pokemon details query
  const pokemonQuery = useQuery<PokemonDetails, Error>(
    ['pokemonDetails', pokemonId],
    () =>
      requestDeduplicator.deduplicate(`pokemon-${pokemonId}`, async () => {
        const startTime = Date.now();
        try {
          const result = await fetchPokemonDetails(pokemonId.toString());
          if (enableMetrics) {
            apiMetrics.recordRequest(Date.now() - startTime, false);
            setMetrics(apiMetrics.getMetrics());
          }
          return result;
        } catch (error) {
          if (enableMetrics) {
            apiMetrics.recordError();
            setMetrics(apiMetrics.getMetrics());
          }
          throw error;
        }
      }),
    {
      staleTime: force ? 0 : ttl,
      cacheTime: ttl * 2, // Keep in cache longer than stale time
      refetchOnWindowFocus: false,
      refetchOnReconnect: isOnline,
      retry: (failureCount, error) => {
        // Don't retry if offline unless explicitly enabled
        if (!isOnline && !retryOnOffline) return false;
        // Don't retry 4xx errors (except 408 timeout)
        if (error instanceof Error && 'status' in error) {
          const status = (error as any).status;
          if (status >= 400 && status < 500 && status !== 408) return false;
        }
        return failureCount < 3;
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      enabled: pokemonId > 0,
      notifyOnChangeProps: ['data', 'error', 'isLoading', 'isRefetching'],
    }
  );

  // Species query (dependent on main pokemon data)
  const speciesQuery = useQuery<PokemonSpecies, Error>(
    ['pokemonSpecies', pokemonId],
    () =>
      requestDeduplicator.deduplicate(`species-${pokemonId}`, () =>
        fetchPokemonSpecies(pokemonId)
      ),
    {
      enabled: !!pokemonQuery.data && pokemonId > 0,
      staleTime: ttl,
      cacheTime: ttl * 2,
      retry: 2,
    }
  );

  // Evolution chain query (dependent on species data)
  const evolutionQuery = useQuery<EvolutionChain, Error>(
    ['evolutionChain', speciesQuery.data?.evolution_chain?.url],
    () =>
      requestDeduplicator.deduplicate(
        `evolution-${speciesQuery.data?.evolution_chain?.url}`,
        () => fetchEvolutionChain(speciesQuery.data!.evolution_chain.url)
      ),
    {
      enabled:
        !!speciesQuery.data?.evolution_chain?.url && prefetchEvolutionChain,
      staleTime: ttl * 2, // Evolution chains change rarely
      cacheTime: ttl * 4,
      retry: 2,
    }
  );

  // Prefetch related Pokemon
  const handlePrefetchRelated = useCallback(() => {
    if (!pokemonQuery.data || !prefetchRelated) return;

    const currentId = pokemonQuery.data.id;

    // Prefetch adjacent Pokemon
    if (currentId > 1) {
      backgroundPrefetcher.addToPrefetch(() =>
        fetchPokemonDetails((currentId - 1).toString())
      );
    }
    if (currentId < 1000) {
      backgroundPrefetcher.addToPrefetch(() =>
        fetchPokemonDetails((currentId + 1).toString())
      );
    }

    // Prefetch Pokemon of the same type(s)
    pokemonQuery.data.types.slice(0, 2).forEach((type) => {
      // This could be enhanced to fetch Pokemon of the same type
      // For now, just prefetch a few nearby ones of similar type
    });
  }, [pokemonQuery.data, prefetchRelated]);

  // Auto-prefetch when data loads
  useEffect(() => {
    if (pokemonQuery.data && prefetchRelated) {
      handlePrefetchRelated();
    }
  }, [pokemonQuery.data, handlePrefetchRelated]);

  // Background refresh when coming back online
  useEffect(() => {
    if (isOnline && backgroundRefresh && pokemonQuery.data) {
      // Silently refetch in background if data is stale
      const lastFetched = pokemonQuery.dataUpdatedAt;
      if (lastFetched && Date.now() - lastFetched > ttl) {
        pokemonQuery.refetch();
      }
    }
  }, [isOnline, backgroundRefresh, pokemonQuery, ttl]);

  // Refetch all related data
  const refetchAll = useCallback(() => {
    pokemonQuery.refetch();
    if (speciesQuery.data) speciesQuery.refetch();
    if (evolutionQuery.data) evolutionQuery.refetch();
  }, [pokemonQuery, speciesQuery, evolutionQuery]);

  // Clear related caches
  const clearRelatedCache = useCallback(() => {
    queryClient.removeQueries(['pokemonDetails', pokemonId]);
    queryClient.removeQueries(['pokemonSpecies', pokemonId]);
    if (speciesQuery.data?.evolution_chain?.url) {
      queryClient.removeQueries([
        'evolutionChain',
        speciesQuery.data.evolution_chain.url,
      ]);
    }
  }, [queryClient, pokemonId, speciesQuery.data?.evolution_chain?.url]);

  // Determine if data is cached
  const isCached = pokemonQuery.isStale === false && !!pokemonQuery.data;
  const lastFetched = pokemonQuery.dataUpdatedAt;

  return {
    // Core data
    pokemon: pokemonQuery.data,
    species: speciesQuery.data,
    evolutionChain: evolutionQuery.data,

    // Loading states
    isLoading: pokemonQuery.isLoading,
    isLoadingSpecies: speciesQuery.isLoading,
    isLoadingEvolution: evolutionQuery.isLoading,
    isRefetching:
      pokemonQuery.isRefetching ||
      speciesQuery.isRefetching ||
      evolutionQuery.isRefetching,

    // Error states
    error: pokemonQuery.error,
    speciesError: speciesQuery.error,
    evolutionError: evolutionQuery.error,

    // Connection & metrics
    isOnline,
    metrics,

    // Actions
    refetch: refetchAll,
    prefetchRelated: handlePrefetchRelated,
    clearCache: clearRelatedCache,

    // Status
    isCached,
    lastFetched,
  };
}

// Enhanced hook specifically for Pokemon lists with prefetching
export function usePokemonDetailsWithPrefetch(
  pokemonId: number,
  prefetchIds: number[] = [],
  options: UsePokemonDetailsOptions = {}
) {
  const result = usePokemonDetails(pokemonId, options);

  // Prefetch specified Pokemon IDs
  useEffect(() => {
    prefetchIds.forEach((id) => {
      if (id !== pokemonId) {
        backgroundPrefetcher.addToPrefetch(() =>
          fetchPokemonDetails(id.toString())
        );
      }
    });
  }, [prefetchIds, pokemonId]);

  return result;
}

// Hook for batch Pokemon details fetching
export function useBatchPokemonDetails(
  pokemonIds: number[],
  options: UsePokemonDetailsOptions = {}
) {
  const [results, setResults] = useState<(PokemonDetails | null)[]>([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<(Error | null)[]>([]);

  const fetchBatch = useCallback(async () => {
    setLoading(true);
    setErrors(new Array(pokemonIds.length).fill(null));

    try {
      const promises = pokemonIds.map(async (id, index) => {
        try {
          return await fetchPokemonDetails(id.toString());
        } catch (error) {
          setErrors((prev) => {
            const newErrors = [...prev];
            newErrors[index] = error as Error;
            return newErrors;
          });
          return null;
        }
      });

      const batchResults = await Promise.allSettled(promises);
      const finalResults = batchResults.map((result) =>
        result.status === 'fulfilled' ? result.value : null
      );

      setResults(finalResults);
    } finally {
      setLoading(false);
    }
  }, [pokemonIds]);

  useEffect(() => {
    if (pokemonIds.length > 0) {
      fetchBatch();
    }
  }, [fetchBatch]);

  return {
    results,
    loading,
    errors,
    refetch: fetchBatch,
  };
}
