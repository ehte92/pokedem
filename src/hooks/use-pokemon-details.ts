import { useQuery } from 'react-query';

import { fetchPokemonDetails } from '@/lib/api';
import { PokemonDetails } from '@/lib/types';

export function usePokemonDetails(pokemonId: number) {
  return useQuery<PokemonDetails, Error>(['pokemonDetails', pokemonId], () =>
    fetchPokemonDetails(pokemonId.toString())
  );
}
