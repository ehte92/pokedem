import {
  AbilityDetails,
  EvolutionChain,
  MoveDetails,
  PokemonDetails,
  PokemonListItem,
  PokemonSpecies,
} from './types';

// Enhanced API configuration
const API_CONFIG = {
  BASE_URL: 'https://pokeapi.co/api/v2',
  DEFAULT_TIMEOUT: 10000,
  MAX_CONCURRENT_REQUESTS: 10,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000,
};

// Request queue for rate limiting
class RequestQueue {
  private queue: Array<() => Promise<any>> = [];
  private activeRequests = 0;
  private requestCache = new Map<string, { data: any; timestamp: number }>();
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  async add<T>(key: string, requestFn: () => Promise<T>): Promise<T> {
    // Check cache first
    const cached = this.requestCache.get(key);
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      return cached.data;
    }

    return new Promise((resolve, reject) => {
      this.queue.push(async () => {
        try {
          this.activeRequests++;
          const result = await requestFn();
          // Cache the result
          this.requestCache.set(key, { data: result, timestamp: Date.now() });
          resolve(result);
        } catch (error) {
          reject(error);
        } finally {
          this.activeRequests--;
          this.processQueue();
        }
      });
      this.processQueue();
    });
  }

  private processQueue() {
    if (
      this.activeRequests < API_CONFIG.MAX_CONCURRENT_REQUESTS &&
      this.queue.length > 0
    ) {
      const request = this.queue.shift();
      if (request) request();
    }
  }

  clearCache() {
    this.requestCache.clear();
  }
}

const requestQueue = new RequestQueue();

// Enhanced fetch with retry logic and timeout
const enhancedFetch = async (
  url: string,
  options: RequestInit & { timeout?: number } = {},
  retryCount = 0
): Promise<Response> => {
  const controller = new AbortController();
  const timeout = options.timeout || API_CONFIG.DEFAULT_TIMEOUT;

  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response;
  } catch (error) {
    clearTimeout(timeoutId);

    if (
      retryCount < API_CONFIG.RETRY_ATTEMPTS &&
      (error as Error).name !== 'AbortError'
    ) {
      console.warn(
        `Request failed, retrying... (${retryCount + 1}/${API_CONFIG.RETRY_ATTEMPTS})`
      );
      await new Promise((resolve) =>
        setTimeout(resolve, API_CONFIG.RETRY_DELAY * Math.pow(2, retryCount))
      );
      return enhancedFetch(url, options, retryCount + 1);
    }

    throw error;
  }
};

const handleApiError = (error: any, customMessage: string) => {
  console.error(`${customMessage}:`, error);
  throw new Error(customMessage);
};

// Batch processing utility
const processBatch = async <T, R>(
  items: T[],
  processor: (item: T) => Promise<R>,
  batchSize: number = 5
): Promise<R[]> => {
  const results: R[] = [];

  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    const batchResults = await Promise.allSettled(batch.map(processor));

    for (const result of batchResults) {
      if (result.status === 'fulfilled') {
        results.push(result.value);
      }
    }
  }

  return results;
};

export const fetchPokemonList = async (offset: number, limit: number) => {
  const cacheKey = `pokemon-list-${offset}-${limit}`;

  return requestQueue.add(cacheKey, async () => {
    try {
      const response = await enhancedFetch(
        `${API_CONFIG.BASE_URL}/pokemon?offset=${offset}&limit=${limit}`
      );
      return await response.json();
    } catch (error) {
      handleApiError(error, 'Failed to fetch Pokemon list');
    }
  });
};

export const fetchPokemonDetails = async (
  id: string
): Promise<PokemonDetails> => {
  const cacheKey = `pokemon-details-${id}`;

  return requestQueue.add(cacheKey, async () => {
    try {
      const response = await enhancedFetch(
        `${API_CONFIG.BASE_URL}/pokemon/${id}`
      );
      return await response.json();
    } catch (error) {
      handleApiError(error, 'Failed to fetch Pokemon details');
      throw error;
    }
  });
};

export const fetchEvolutionChain = async (
  url: string
): Promise<EvolutionChain> => {
  const cacheKey = `evolution-chain-${url}`;

  return requestQueue.add(cacheKey, async () => {
    try {
      const response = await enhancedFetch(url);
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
  });
};

// Enhanced search with caching
export const searchPokemon = async (
  searchTerm: string
): Promise<PokemonListItem[]> => {
  const cacheKey = `search-pokemon-${searchTerm.toLowerCase()}`;

  return requestQueue.add(cacheKey, async () => {
    try {
      // Fetch a list of all Pokemon (limited to 1000 for performance reasons)
      const allPokemonResponse = await enhancedFetch(
        `${API_CONFIG.BASE_URL}/pokemon?limit=1000`
      );
      const allPokemonData = await allPokemonResponse.json();

      // Filter the list based on the search term
      const filteredPokemon = allPokemonData.results.filter(
        (pokemon: PokemonListItem) =>
          pokemon.name.toLowerCase().includes(searchTerm.toLowerCase())
      );

      return filteredPokemon;
    } catch (error) {
      handleApiError(error, 'Failed to search Pokemon');
      throw error;
    }
  });
};

export const fetchPokemonByType = async (
  type: string,
  offset: number,
  limit: number
): Promise<PokemonListItem[]> => {
  const cacheKey = `pokemon-by-type-${type}-${offset}-${limit}`;

  return requestQueue.add(cacheKey, async () => {
    try {
      const response = await enhancedFetch(
        `${API_CONFIG.BASE_URL}/type/${type}`
      );
      const data = await response.json();
      return data.pokemon
        .map((p: { pokemon: PokemonListItem }) => p.pokemon)
        .slice(offset, offset + limit);
    } catch (error) {
      handleApiError(error, 'Failed to fetch Pokemon by type');
      throw error;
    }
  });
};

export const fetchPokemonSpecies = async (
  id: string | number
): Promise<PokemonSpecies> => {
  const cacheKey = `pokemon-species-${id}`;

  return requestQueue.add(cacheKey, async () => {
    try {
      const response = await enhancedFetch(
        `${API_CONFIG.BASE_URL}/pokemon-species/${id}`
      );
      return await response.json();
    } catch (error) {
      handleApiError(error, 'Failed to fetch Pokemon species');
      throw error;
    }
  });
};

export const fetchAbilityDetails = async (
  abilityName: string
): Promise<AbilityDetails> => {
  const cacheKey = `ability-details-${abilityName}`;

  return requestQueue.add(cacheKey, async () => {
    try {
      const response = await enhancedFetch(
        `${API_CONFIG.BASE_URL}/ability/${abilityName}`
      );
      return await response.json();
    } catch (error) {
      handleApiError(error, 'Failed to fetch ability details');
      throw error;
    }
  });
};

export const fetchMoveDetails = async (
  moveName: string
): Promise<MoveDetails> => {
  const cacheKey = `move-details-${moveName}`;

  return requestQueue.add(cacheKey, async () => {
    try {
      const response = await enhancedFetch(
        `${API_CONFIG.BASE_URL}/move/${moveName}`
      );
      return await response.json();
    } catch (error) {
      handleApiError(error, 'Failed to fetch move details');
      throw error;
    }
  });
};

// Enhanced fetchAllMoves with better performance
export const fetchAllMoves = async (): Promise<MoveDetails[]> => {
  const cacheKey = 'all-moves';

  return requestQueue.add(cacheKey, async () => {
    try {
      const response = await enhancedFetch(
        `${API_CONFIG.BASE_URL}/move?limit=1000`
      );
      const data = await response.json();

      // Process moves in batches to avoid overwhelming the API
      const moveDetails = await processBatch(
        data.results,
        async (move: { url: string }) => {
          const moveResponse = await enhancedFetch(move.url);
          return moveResponse.json();
        },
        10 // Process 10 moves at a time
      );

      return moveDetails;
    } catch (error) {
      handleApiError(error, 'Failed to fetch all moves');
      throw error;
    }
  });
};

export const fetchMoves = async (
  page: number,
  limit: number = 20,
  type: string = 'all',
  category: string = 'all',
  searchTerm: string = ''
): Promise<{ moves: MoveDetails[]; totalCount: number }> => {
  const cacheKey = `moves-${page}-${limit}-${type}-${category}-${searchTerm}`;

  return requestQueue.add(cacheKey, async () => {
    try {
      let url = `${API_CONFIG.BASE_URL}/move?limit=1000`; // Fetch all moves

      const response = await enhancedFetch(url);
      const data = await response.json();

      // Fetch details for each move in batches
      const allMoves = await processBatch(
        data.results,
        async (move: { url: string }) => {
          const moveResponse = await enhancedFetch(move.url);
          return moveResponse.json();
        },
        15 // Process 15 moves at a time
      );

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
      const paginatedMoves = filteredMoves.slice(
        startIndex,
        startIndex + limit
      );

      return { moves: paginatedMoves, totalCount };
    } catch (error) {
      console.error('Error fetching moves:', error);
      throw new Error('Failed to fetch moves');
    }
  });
};

// Enhanced fetchLegendaryPokemon with better performance
export async function fetchLegendaryPokemon(): Promise<PokemonDetails[]> {
  const cacheKey = 'legendary-pokemon';

  return requestQueue.add(cacheKey, async () => {
    try {
      // Known legendary Pokémon IDs for better performance
      const legendaryIds = [
        144,
        145,
        146, // Articuno, Zapdos, Moltres
        150,
        151, // Mewtwo, Mew
        243,
        244,
        245, // Raikou, Entei, Suicune
        249,
        250,
        251, // Lugia, Ho-Oh, Celebi
        377,
        378,
        379,
        380,
        381,
        382,
        383,
        384, // Regirock, Regice, Registeel, Latias, Latios, Kyogre, Groudon, Rayquaza
        385,
        386, // Jirachi, Deoxys
        480,
        481,
        482,
        483,
        484,
        485,
        486,
        487,
        488, // Uxie, Mesprit, Azelf, Dialga, Palkia, Heatran, Regigigas, Giratina, Cresselia
        489,
        490,
        491,
        492,
        493, // Phione, Manaphy, Darkrai, Shaymin, Arceus
        494,
        638,
        639,
        640,
        641,
        642,
        643,
        644,
        645,
        646,
        647,
        648,
        649, // Victini, Cobalion, Terrakion, Virizion, Tornadus, Thundurus, Reshiram, Zekrom, Landorus, Kyurem, Keldeo, Meloetta, Genesect
        716,
        717,
        718,
        719,
        720,
        721, // Xerneas, Yveltal, Zygarde, Diancie, Hoopa, Volcanion
        785,
        786,
        787,
        788,
        789,
        790,
        791,
        792,
        800,
        801,
        802, // Tapu Koko, Tapu Lele, Tapu Bulu, Tapu Fini, Necrozma, Solgaleo, Lunala, Cosmog, Cosmoem, Magearna, Marshadow, Zeraora
        888,
        889,
        890,
        891,
        892,
        893,
        894,
        895,
        896,
        897,
        898,
        905, // Zacian, Zamazenta, Eternatus, Kubfu, Urshifu, Regieleki, Regidrago, Glastrier, Spectrier, Calyrex, Enamorus
      ];

      // Fetch details for each legendary Pokémon in smaller batches
      const legendaryPokemon = await processBatch(
        legendaryIds,
        async (id: number) => {
          try {
            return await fetchPokemonDetails(id.toString());
          } catch (error) {
            console.warn(`Failed to fetch legendary Pokémon ${id}:`, error);
            return null;
          }
        },
        8 // Process 8 legendary Pokemon at a time to avoid rate limiting
      );

      // Filter out any failed requests
      return legendaryPokemon.filter(
        (pokemon): pokemon is PokemonDetails => pokemon !== null
      );
    } catch (error) {
      handleApiError(error, 'Failed to fetch legendary Pokémon');
      return [];
    }
  });
}

// Utility functions for cache management
export const clearApiCache = () => {
  requestQueue.clearCache();
};

export const getApiConfig = () => ({ ...API_CONFIG });

export const updateApiConfig = (newConfig: Partial<typeof API_CONFIG>) => {
  Object.assign(API_CONFIG, newConfig);
};
