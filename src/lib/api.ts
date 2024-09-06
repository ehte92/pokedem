import {
  AbilityDetails,
  EvolutionChain,
  MoveDetails,
  PokemonDetails,
  PokemonListItem,
  PokemonSpecies,
} from './types';

const handleApiError = (error: any, customMessage: string) => {
  console.error(`${customMessage}:`, error);
  throw new Error(customMessage);
};

export const fetchPokemonList = async (offset: number, limit: number) => {
  try {
    const response = await fetch(
      `https://pokeapi.co/api/v2/pokemon?offset=${offset}&limit=${limit}`
    );
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return await response.json();
  } catch (error) {
    handleApiError(error, 'Failed to fetch Pokemon list');
  }
};

export const fetchPokemonDetails = async (
  id: string
): Promise<PokemonDetails> => {
  try {
    const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return await response.json();
  } catch (error) {
    handleApiError(error, 'Failed to fetch Pokemon details');
    throw error; // Add a throw statement to include 'undefined' in the return type
  }
};

export const fetchEvolutionChain = async (
  url: string
): Promise<EvolutionChain> => {
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return await response.json();
  } catch (error) {
    handleApiError(error, 'Failed to fetch evolution chain');
    return {
      chain: {
        species: { name: 'Unknown', url: '' },
        evolution_details: [],
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
    handleApiError(allPokemonResponse, 'Failed to fetch Pokemon list');
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
): Promise<PokemonListItem[]> => {
  const response = await fetch(`https://pokeapi.co/api/v2/type/${type}`);
  if (!response.ok) {
    handleApiError(response, 'Failed to fetch Pokemon by type');
  }
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
  if (!response.ok) {
    handleApiError(response, 'Failed to fetch Pokemon species');
  }
  return response.json();
};

export const fetchAbilityDetails = async (
  abilityName: string
): Promise<AbilityDetails> => {
  const response = await fetch(
    `https://pokeapi.co/api/v2/ability/${abilityName}`
  );
  if (!response.ok) {
    handleApiError(response, 'Failed to fetch ability details');
  }
  return response.json();
};

export const fetchMoveDetails = async (
  moveName: string
): Promise<MoveDetails> => {
  const response = await fetch(`https://pokeapi.co/api/v2/move/${moveName}`);
  if (!response.ok) {
    handleApiError(response, 'Failed to fetch move details');
  }
  return response.json();
};

export const fetchAllMoves = async (): Promise<MoveDetails[]> => {
  const response = await fetch('https://pokeapi.co/api/v2/move?limit=1000');
  if (!response.ok) {
    handleApiError(response, 'Failed to fetch all moves');
  }
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
  try {
    let url = 'https://pokeapi.co/api/v2/move?limit=1000'; // Fetch all moves

    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const data = await response.json();

    // Fetch details for each move
    const allMovesPromises = data.results.map(async (move: { url: string }) => {
      const moveResponse = await fetch(move.url);
      if (!moveResponse.ok)
        throw new Error(`HTTP error! status: ${moveResponse.status}`);
      return moveResponse.json();
    });

    let allMoves = await Promise.all(allMovesPromises);

    // Apply filters
    const filteredMoves = allMoves.filter((move) => {
      const typeMatch = type === 'all' || move.type.name === type;
      const categoryMatch =
        category === 'all' || move.damage_class.name === category;
      const searchMatch =
        searchTerm === '' ||
        move.name.toLowerCase().includes(searchTerm.toLowerCase());
      return typeMatch && categoryMatch && searchMatch;
    });

    // Calculate total count based on filtered results
    const totalCount = filteredMoves.length;

    // Apply pagination to filtered results
    const startIndex = (page - 1) * limit;
    const paginatedMoves = filteredMoves.slice(startIndex, startIndex + limit);

    return { moves: paginatedMoves, totalCount };
  } catch (error) {
    console.error('Error fetching moves:', error);
    throw new Error('Failed to fetch moves');
  }
};

export async function fetchLegendaryPokemon(): Promise<PokemonDetails[]> {
  try {
    // Fetch all Pokémon species
    const response = await fetch(
      'https://pokeapi.co/api/v2/pokemon-species?limit=1000'
    );
    if (!response.ok) {
      throw new Error('Failed to fetch Pokémon species');
    }
    const data = await response.json();

    // Filter for legendary Pokémon
    const legendarySpecies = await Promise.all(
      data.results.map(async (species: { url: string }) => {
        const speciesData = await fetchPokemonSpecies(
          species.url.split('/').slice(-2, -1)[0]
        );
        return speciesData.is_legendary ? speciesData : null;
      })
    );

    // Fetch details for each legendary Pokémon
    const legendaryPokemon = await Promise.all(
      legendarySpecies
        .filter((species: PokemonSpecies | null) => species !== null)
        .map((species: PokemonSpecies) =>
          fetchPokemonDetails(species.id.toString())
        )
    );

    return legendaryPokemon;
  } catch (error) {
    handleApiError(error, 'Failed to fetch legendary Pokémon');
    return [];
  }
}
