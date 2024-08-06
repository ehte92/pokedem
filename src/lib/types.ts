export interface PokemonType {
  type: {
    name: string;
  };
}

export interface PokemonAbility {
  ability: {
    name: string;
  };
  is_hidden: boolean;
}

export interface PokemonStat {
  base_stat: number;
  stat: {
    name: string;
  };
}

export interface PokemonMove {
  move: {
    name: string;
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
  sprites: {
    front_default: string;
  };
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
  };
  evolution_details: EvolutionDetail[];
  evolves_to: EvolutionTo[];
}

export interface EvolutionChain {
  chain: {
    species: {
      name: string;
    };
    evolves_to: EvolutionTo[];
  };
}
