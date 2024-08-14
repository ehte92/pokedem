import {
  AbilityDetails,
  EvolutionChain,
  MoveDetails,
  PokemonDetails,
  PokemonListItem,
  PokemonSpecies,
} from './types';

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
  url: string
): Promise<EvolutionChain> => {
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error('Failed to fetch evolution chain');
    return response.json();
  } catch (error) {
    console.error('Error fetching evolution chain:', error);
    // Return a default EvolutionChain object instead of null
    return {
      chain: {
        species: { name: 'Unknown' },
        evolves_to: [],
      },
    };
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

export const fetchPokemonSpecies = async (
  id: string | number
): Promise<PokemonSpecies> => {
  const response = await fetch(
    `https://pokeapi.co/api/v2/pokemon-species/${id}`
  );
  if (!response.ok) throw new Error('Failed to fetch Pokemon species');
  return response.json();
};

export const fetchAbilityDetails = async (
  abilityName: string
): Promise<AbilityDetails> => {
  const response = await fetch(
    `https://pokeapi.co/api/v2/ability/${abilityName}`
  );
  if (!response.ok) throw new Error('Failed to fetch ability details');
  return response.json();
};

export const fetchMoveDetails = async (
  moveName: string
): Promise<MoveDetails> => {
  const response = await fetch(`https://pokeapi.co/api/v2/move/${moveName}`);
  if (!response.ok) throw new Error('Failed to fetch move details');
  return response.json();
};
