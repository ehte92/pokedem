'use client';

import { useQuery } from 'react-query';

import { fetchLegendaryPokemon } from '@/lib/api';
import { PokemonDetails } from '@/lib/types';

export const useLegendaryPokemon = () => {
  return useQuery<PokemonDetails[], Error>(
    'legendaryPokemon',
    fetchLegendaryPokemon,
    {
      staleTime: 1000 * 60 * 60, // 1 hour
      cacheTime: 1000 * 60 * 60 * 24, // 24 hours
      retry: 2,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      refetchOnReconnect: false,
    }
  );
};
