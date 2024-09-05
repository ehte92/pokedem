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

export const fetchAllMoves = async (): Promise<MoveDetails[]> => {
  const response = await fetch('https://pokeapi.co/api/v2/move?limit=1000');
  if (!response.ok) throw new Error('Failed to fetch moves');
  const data = await response.json();

  const movePromises = data.results.map((move: { url: string }) =>
    fetch(move.url).then((res) => res.json())
  );

  return Promise.all(movePromises);
};

export const fetchMoves = async (
  page: number,
  limit: number = 20,
  type: string = 'all',
  category: string = 'all',
  searchTerm: string = ''
): Promise<{ moves: MoveDetails[]; totalCount: number }> => {
  const offset = (page - 1) * limit;
  let url = `https://pokeapi.co/api/v2/move?offset=${offset}&limit=${limit}`;

  const response = await fetch(url);
  if (!response.ok) throw new Error('Failed to fetch moves');
  const data = await response.json();

  let moves = await Promise.all(
    data.results.map((move: { url: string }) =>
      fetch(move.url).then((res) => res.json())
    )
  );

  // Apply filters
  moves = moves.filter((move) => {
    const typeMatch = type === 'all' || move.type.name === type;
    const categoryMatch =
      category === 'all' || move.damage_class.name === category;
    const searchMatch =
      searchTerm === '' ||
      move.name.toLowerCase().includes(searchTerm.toLowerCase());
    return typeMatch && categoryMatch && searchMatch;
  });

  return { moves, totalCount: data.count };
};
