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

export interface PokemonSprites {
  front_default: string;
  other: {
    'official-artwork': {
      front_default: string;
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
  base_experience: number;
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

export interface PokemonSpecies {
  flavor_text_entries: {
    flavor_text: string;
    language: { name: string };
    version: { name: string };
  }[];
  evolution_chain: { url: string };
  // Add other fields as needed
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

export interface PokemonBattleState extends PokemonDetails {
  currentHP: number;
  status: StatusEffect;
  sleepCounter?: number;
  ability: Ability;
}
