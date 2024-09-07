import { useQuery } from 'react-query';

import { fetchEvolutionChain, fetchPokemonSpecies } from '@/lib/api';
import { EvolutionChain, PokemonSpecies } from '@/lib/types';

const CACHE_TIME = 1000 * 60 * 60 * 24; // 24 hours

export const usePokemonSpecies = (pokemonId: number) => {
  return useQuery<PokemonSpecies, Error>(
    ['pokemonSpecies', pokemonId],
    () => fetchPokemonSpecies(pokemonId),
    {
      staleTime: CACHE_TIME,
      cacheTime: CACHE_TIME,
    }
  );
};

export const useEvolutionChain = (url: string) => {
  return useQuery<EvolutionChain, Error>(
    ['evolutionChain', url],
    () => fetchEvolutionChain(url),
    {
      staleTime: CACHE_TIME,
      cacheTime: CACHE_TIME,
    }
  );
};
