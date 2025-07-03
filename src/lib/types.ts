export interface PokemonType {
  slot: number;
  type: {
    name: string;
    url: string;
  };
}

export interface PokemonAbility {
  ability: {
    name: string;
    url: string;
  };
  is_hidden: boolean;
  slot: number;
}

export interface PokemonStat {
  base_stat: number;
  effort: number;
  stat: {
    name: string;
    url: string;
  };
}

export interface PokemonMove {
  move: {
    name: string;
  };
}

export interface PokemonSprites {
  front_default: string;
  front_shiny: string;
  back_default?: string;
  back_shiny?: string;
  other: {
    'official-artwork': {
      front_default: string;
      front_shiny: string;
    };
  };
}

export interface PokemonDetails {
  id: number;
  name: string;
  height: number;
  weight: number;
  types: PokemonType[];
  abilities: PokemonAbility[];
  stats: PokemonStat[];
  moves: PokemonMove[];
  sprites: PokemonSprites;
  species?: PokemonSpecies;
  base_experience: number;
  evolutionStage?: number;
  level: number;
}

export interface PokemonBattleState extends PokemonDetails {
  currentHP: number;
  status: StatusEffect | null;
  ability: Ability;
  sleepCounter?: number;
}

export interface PokemonListItem {
  name: string;
  url: string;
}

export interface PokemonListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: PokemonListItem[];
}

export interface EvolutionDetail {
  min_level: number;
  trigger: {
    name: string;
  };
}

export interface EvolutionTo {
  species: {
    name: string;
    url: string;
  };
  evolution_details: EvolutionDetails[];
  evolves_to: EvolutionTo[];
}

export interface EvolutionDetails {
  min_level: number;
  trigger: {
    name: string;
    url: string;
  };
  // Add other evolution details as needed
}

export interface EvolutionChain {
  chain: {
    species: {
      name: string;
      url: string;
    };
    evolution_details: EvolutionDetails[];
    evolves_to: EvolutionTo[];
  };
}

export interface PokemonSpecies {
  id: number;
  name: string;
  is_legendary: boolean;
  is_mythical?: boolean;
  flavor_text_entries: {
    flavor_text: string;
    language: {
      name: string;
      url: string;
    };
    version: {
      name: string;
      url: string;
    };
  }[];
  habitat: {
    name: string;
    url: string;
  } | null;
  evolution_chain: {
    url: string;
  };
  generation: {
    name: string;
    url: string;
  };
  egg_groups?: {
    name: string;
    url: string;
  }[];
  capture_rate?: number;
  base_happiness?: number;
  growth_rate?: {
    name: string;
    url: string;
  };
  gender_rate?: number;
}

export interface AbilityDetails {
  effect_entries: {
    effect: string;
    language: {
      name: string;
      url: string;
    };
    short_effect: string;
  }[];
  // Add other fields as needed
}

export interface MoveDetails {
  id: number;
  name: string;
  accuracy: number | null;
  effect_chance: number | null;
  pp: number;
  priority: number;
  power: number | null;
  damage_class: {
    name: string;
  };
  type: {
    name: string;
  };
  meta: {
    ailment: {
      name: string;
    };
    category: {
      name: string;
    };
    min_hits: number | null;
    max_hits: number | null;
    min_turns: number | null;
    max_turns: number | null;
    drain: number;
    healing: number;
    crit_rate: number;
    ailment_chance: number;
    flinch_chance: number;
    stat_chance: number;
  };
  stat_changes: {
    change: number;
    stat: {
      name: string;
    };
  }[];
  target: {
    name: string;
  };
  effect_entries: {
    effect: string;
    short_effect: string;
  }[];
}

export type TypeEffectiveness = {
  [attackType: string]: {
    [defenseType: string]: number;
  };
};

export type StatusEffect =
  | 'burn'
  | 'freeze'
  | 'paralysis'
  | 'poison'
  | 'sleep'
  | 'confusion'
  | 'flinch'
  | null;

export interface Ability {
  name: string;
  effect: string;
}

export interface PokemonBattleMove extends PokemonMove {
  pp: number;
  maxPp: number;
}

export interface PokemonBattleState extends Omit<PokemonDetails, 'moves'> {
  currentHP: number;
  status: StatusEffect;
  ability: Ability;
  sleepCounter?: number;
  statStages: {
    attack: number;
    defense: number;
    'special-attack': number;
    'special-defense': number;
    speed: number;
    accuracy: number;
    evasion: number;
  };
  moves: PokemonBattleMove[];
}

// Enhanced API types
export interface ApiResponse<T> {
  data: T;
  loading: boolean;
  error: string | null;
  lastFetched: number;
}

export interface ApiCacheOptions {
  ttl?: number; // Time to live in milliseconds
  force?: boolean; // Force refresh
  background?: boolean; // Fetch in background
}

export interface BatchRequestOptions {
  batchSize?: number;
  concurrency?: number;
  retries?: number;
  timeout?: number;
}

export interface ApiMetrics {
  requestCount: number;
  cacheHits: number;
  cacheMisses: number;
  averageResponseTime: number;
  errorRate: number;
  lastReset: number;
}

export interface RequestDebounceOptions {
  delay: number;
  maxWait?: number;
  leading?: boolean;
  trailing?: boolean;
}

// Enhanced error types
export class ApiError extends Error {
  constructor(
    message: string,
    public status?: number,
    public response?: Response,
    public retryable: boolean = true
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export class NetworkError extends ApiError {
  constructor(message: string = 'Network request failed') {
    super(message, undefined, undefined, true);
    this.name = 'NetworkError';
  }
}

export class TimeoutError extends ApiError {
  constructor(message: string = 'Request timeout') {
    super(message, 408, undefined, true);
    this.name = 'TimeoutError';
  }
}

export class ValidationError extends ApiError {
  constructor(message: string = 'Invalid request data') {
    super(message, 400, undefined, false);
    this.name = 'ValidationError';
  }
}
