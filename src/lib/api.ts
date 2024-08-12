import { EvolutionChain, PokemonDetails, PokemonListItem } from './types';

export const fetchPokemonList = async (offset: number, limit: number) => {
  const response = await fetch(
    `https://pokeapi.co/api/v2/pokemon?offset=${offset}&limit=${limit}`
  );
  if (!response.ok) throw new Error('Failed to fetch Pokemon list');
  return response.json();
};

export const fetchPokemonDetails = async (
  id: string
): Promise<PokemonDetails> => {
  const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
  if (!response.ok) throw new Error('Failed to fetch Pokemon details');
  return response.json();
};

export const fetchEvolutionChain = async (
  id: number
): Promise<EvolutionChain | null> => {
  try {
    const speciesResponse = await fetch(
      `https://pokeapi.co/api/v2/pokemon-species/${id}`
    );
    if (!speciesResponse.ok) throw new Error('Failed to fetch Pokemon species');
    const speciesData = await speciesResponse.json();
    const evolutionResponse = await fetch(speciesData.evolution_chain.url);
    if (!evolutionResponse.ok)
      throw new Error('Failed to fetch evolution chain');
    return evolutionResponse.json();
  } catch (error) {
    console.error('Error fetching evolution chain:', error);
    return null;
  }
};

export const searchPokemon = async (
  searchTerm: string
): Promise<PokemonListItem[]> => {
  // Fetch a list of all Pokemon (limited to 1000 for performance reasons)
  const allPokemonResponse = await fetch(
    'https://pokeapi.co/api/v2/pokemon?limit=1000'
  );
  if (!allPokemonResponse.ok) {
    throw new Error('Failed to fetch Pokemon list');
  }
  const allPokemonData = await allPokemonResponse.json();

  // Filter the list based on the search term
  const filteredPokemon = allPokemonData.results.filter(
    (pokemon: PokemonListItem) =>
      pokemon.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return filteredPokemon;
};

export const fetchPokemonByType = async (
  type: string,
  offset: number,
  limit: number
) => {
  const response = await fetch(`https://pokeapi.co/api/v2/type/${type}`);
  if (!response.ok) throw new Error('Failed to fetch Pokemon by type');
  const data = await response.json();
  return data.pokemon
    .map((p: { pokemon: PokemonListItem }) => p.pokemon)
    .slice(offset, offset + limit);
};
