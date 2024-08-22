import { fetchAbilityDetails, fetchMoveDetails } from '@/lib/api';
import {
  Ability,
  MoveDetails,
  PokemonBattleMove,
  PokemonBattleState,
  PokemonDetails,
  StatusEffect,
  TypeEffectiveness,
} from '@/lib/types';

import { typeEffectiveness } from './constants';
import { selectBestMoves } from './enhanced-move-selection';

export const getMaxHP = (pokemon: PokemonDetails): number => {
  return (
    pokemon.stats.find((stat) => stat.stat.name === 'hp')?.base_stat || 100
  );
};

export const estimateLevel = (pokemon: PokemonDetails): number => {
  const baseStatTotal = pokemon.stats.reduce(
    (total, stat) => total + stat.base_stat,
    0
  );
  return Math.min(100, Math.max(1, Math.floor(baseStatTotal / 6)));
};

export const initializePokemon = async (
  pokemon: PokemonDetails
): Promise<PokemonBattleState> => {
  try {
    const ability = pokemon.abilities[0];
    const abilityDetails = await fetchAbilityDetails(ability.ability.name);

    const selectedMoves = await selectBestMoves(pokemon);
    console.log(
      `Selected moves for ${pokemon.name}:`,
      selectedMoves.map((m) => m.name)
    );

    const battleMoves = selectedMoves.map((moveDetails) => ({
      move: { name: moveDetails.name },
      pp: moveDetails.pp,
      maxPp: moveDetails.pp,
    }));

    return {
      ...pokemon,
      currentHP: getMaxHP(pokemon),
      status: null,
      ability: {
        name: ability.ability.name,
        effect:
          abilityDetails.effect_entries.find(
            (entry) => entry.language.name === 'en'
          )?.short_effect || '',
      },
      statStages: {
        attack: 0,
        defense: 0,
        'special-attack': 0,
        'special-defense': 0,
        speed: 0,
        accuracy: 0,
        evasion: 0,
      },
      moves: battleMoves,
    };
  } catch (error) {
    console.error(`Error initializing Pokemon ${pokemon.name}:`, error);
    throw error; // Re-throw the error after logging
  }
};

export const calculateTypeEffectiveness = (
  attackType: string,
  defenseType: string
): number => {
  return (
    (typeEffectiveness as TypeEffectiveness)[attackType]?.[defenseType] || 1
  );
};

export const getStatModifier = (stage: number): number => {
  const modifiers = [
    0.25, 0.28, 0.33, 0.4, 0.5, 0.66, 1, 1.5, 2, 2.5, 3, 3.5, 4,
  ];
  return modifiers[stage + 6] || 1;
};

export const applyStatChange = (
  pokemon: PokemonBattleState,
  statName: string,
  change: number
): [PokemonBattleState, string] => {
  if (!(statName in pokemon.statStages)) return [pokemon, ''];

  const newStage = Math.max(
    -6,
    Math.min(
      6,
      (pokemon.statStages[statName as keyof PokemonBattleState['statStages']] ||
        0) + change
    )
  );
  const newPokemon = {
    ...pokemon,
    statStages: {
      ...pokemon.statStages,
      [statName]: newStage,
    },
  };

  const direction = change > 0 ? 'rose' : 'fell';
  const magnitude = Math.abs(change) === 1 ? '' : ' sharply';
  return [
    newPokemon,
    `${pokemon.name}'s ${statName}${magnitude} ${direction}!`,
  ];
};

export const calculateEffectiveStats = (
  pokemon: PokemonBattleState
): PokemonBattleState => {
  const effectiveStats = pokemon.stats.map((stat) => {
    const stage =
      pokemon.statStages[
        stat.stat.name as keyof PokemonBattleState['statStages']
      ] || 0;
    const modifier = getStatModifier(stage);
    return {
      ...stat,
      effective_stat: Math.floor(stat.base_stat * modifier),
    };
  });

  return {
    ...pokemon,
    stats: effectiveStats,
  };
};

export const checkAbilityTrigger = (
  pokemon: PokemonBattleState,
  triggerType: 'onEntry' | 'onDamage' | 'onStatusInflict'
): string | null => {
  switch (pokemon.ability.name.toLowerCase()) {
    case 'intimidate':
      if (triggerType === 'onEntry') {
        return 'Intimidate';
      }
      break;
    case 'drought':
      if (triggerType === 'onEntry') {
        return 'Drought';
      }
      break;
    case 'drizzle':
      if (triggerType === 'onEntry') {
        return 'Drizzle';
      }
      break;
    // Add more ability checks as needed
  }
  return null;
};

export const applyWeatherEffects = (
  attacker: PokemonBattleState,
  defender: PokemonBattleState,
  moveType: string,
  weather: string
): [number, string[]] => {
  let modifier = 1;
  const effects: string[] = [];

  switch (weather) {
    case 'sunny':
      if (moveType === 'fire') {
        modifier = 1.5;
        effects.push('The sunlight strengthened Fire-type moves!');
      } else if (moveType === 'water') {
        modifier = 0.5;
        effects.push('The sunlight weakened Water-type moves!');
      }
      break;
    case 'rain':
      if (moveType === 'water') {
        modifier = 1.5;
        effects.push('The rain strengthened Water-type moves!');
      } else if (moveType === 'fire') {
        modifier = 0.5;
        effects.push('The rain weakened Fire-type moves!');
      }
      break;
    // Add more weather conditions as needed
  }

  return [modifier, effects];
};

export const checkForFaintedPokemon = (
  pokemon: PokemonBattleState
): boolean => {
  return pokemon.currentHP <= 0;
};

export const selectRandomMove = (
  pokemon: PokemonBattleState
): PokemonBattleMove | null => {
  const availableMoves = pokemon.moves.filter((move) => move.pp > 0);
  if (availableMoves.length === 0) {
    return null; // No moves with PP left
  }
  const randomIndex = Math.floor(Math.random() * availableMoves.length);
  return availableMoves[randomIndex];
};

const CRITICAL_HIT_STAGES = [24, 8, 2, 1];

export const getCriticalHitStage = (pokemon: PokemonBattleState): number => {
  // Check for moves or abilities that affect critical hit ratio
  const hasHighCritRatio = pokemon.moves.some((move) =>
    move.move.name.toLowerCase().includes('focus energy')
  );
  const hasSniper = pokemon.ability.name.toLowerCase() === 'sniper';

  if (hasSniper) return 1;
  if (hasHighCritRatio) return 2;
  return 0;
};

export const isCriticalHit = (critStage: number): boolean => {
  const threshold = CRITICAL_HIT_STAGES[critStage] || CRITICAL_HIT_STAGES[0];
  return Math.floor(Math.random() * threshold) === 0;
};

export const calculateDamage = (
  attacker: PokemonBattleState,
  defender: PokemonBattleState,
  moveDetails: MoveDetails
): [number, boolean] => {
  const attackStat =
    attacker.stats.find(
      (stat) =>
        stat.stat.name ===
        (moveDetails.damage_class.name === 'physical'
          ? 'attack'
          : 'special-attack')
    )?.base_stat || 50;
  const defenseStat =
    defender.stats.find(
      (stat) =>
        stat.stat.name ===
        (moveDetails.damage_class.name === 'physical'
          ? 'defense'
          : 'special-defense')
    )?.base_stat || 50;
  const effectiveness = calculateTypeEffectiveness(
    moveDetails.type.name,
    defender.types[0].type.name
  );

  const power = moveDetails.power || 50;
  const stab = attacker.types.some(
    (type) => type.type.name === moveDetails.type.name
  )
    ? 1.5
    : 1;
  const random = Math.random() * (1 - 0.85) + 0.85;

  const level = estimateLevel(attacker);

  // Calculate critical hit
  const critStage = getCriticalHitStage(attacker);
  const isCrit = isCriticalHit(critStage);
  const critMultiplier = isCrit ? 1.5 : 1;

  let damage = Math.floor(
    ((((2 * level) / 5 + 2) * power * (attackStat / defenseStat)) / 50 + 2) *
      effectiveness *
      stab *
      random *
      critMultiplier
  );

  // Apply status effect modifications
  if (
    attacker.status === 'burn' &&
    moveDetails.damage_class.name === 'physical'
  ) {
    damage = Math.floor(damage / 2);
  }

  // Apply ability effects
  if (
    attacker.ability.name.toLowerCase() === 'guts' &&
    attacker.status !== null
  ) {
    damage = Math.floor(damage * 1.5);
  }

  if (isCrit && attacker.ability.name.toLowerCase() === 'sniper') {
    damage = Math.floor(damage * 1.5);
  }

  return [Math.max(1, Math.min(damage, defender.currentHP)), isCrit];
};

export const useMove = async (
  attacker: PokemonBattleState,
  defender: PokemonBattleState,
  moveIndex: number
): Promise<[PokemonBattleState, PokemonBattleState, string[]]> => {
  if (moveIndex < 0 || moveIndex >= attacker.moves.length) {
    return [attacker, defender, ['Invalid move index']];
  }

  const move = attacker.moves[moveIndex];
  if (move.pp <= 0) {
    return [attacker, defender, [`${move.move.name} has no PP left!`]];
  }

  const updatedMoves = [...attacker.moves];
  updatedMoves[moveIndex] = {
    ...move,
    pp: move.pp - 1,
  };

  const updatedAttacker = { ...attacker, moves: updatedMoves };

  // Fetch move details and calculate damage
  const moveDetails = await fetchMoveDetails(move.move.name);
  const [damage, isCrit] = calculateDamage(
    updatedAttacker,
    defender,
    moveDetails
  );

  const updatedDefender = {
    ...defender,
    currentHP: Math.max(0, defender.currentHP - damage),
  };

  const messages = [
    `${attacker.name} used ${move.move.name}!`,
    isCrit ? 'A critical hit!' : '',
    `It dealt ${damage} damage to ${defender.name}!`,
  ].filter(Boolean);

  return [updatedAttacker, updatedDefender, messages];
};

export const restorePP = (
  pokemon: PokemonBattleState,
  moveIndex: number,
  amount: number
): [PokemonBattleState, string] => {
  if (moveIndex < 0 || moveIndex >= pokemon.moves.length) {
    return [pokemon, 'Invalid move index'];
  }

  const move = pokemon.moves[moveIndex];
  const newPP = Math.min(move.pp + amount, move.maxPp);
  const updatedMoves = [...pokemon.moves];
  updatedMoves[moveIndex] = {
    ...move,
    pp: newPP,
  };

  return [
    { ...pokemon, moves: updatedMoves },
    `${pokemon.name}'s ${move.move.name} PP was restored!`,
  ];
};

export const calculateAccuracy = (
  attacker: PokemonBattleState,
  defender: PokemonBattleState,
  moveAccuracy: number
): number => {
  const accuracyStage = attacker.statStages.accuracy || 0;
  const evasionStage = defender.statStages.evasion || 0;
  const stageModifier = getStatModifier(accuracyStage - evasionStage);
  return moveAccuracy * stageModifier;
};

export const doesMoveHit = (
  attacker: PokemonBattleState,
  defender: PokemonBattleState,
  moveAccuracy: number | null
): boolean => {
  if (moveAccuracy === null) return true; // Moves with null accuracy always hit

  const accuracyStage = attacker.statStages.accuracy || 0;
  const evasionStage = defender.statStages.evasion || 0;
  const stageModifier = getStatModifier(accuracyStage - evasionStage);
  const adjustedAccuracy = moveAccuracy * stageModifier;

  return Math.random() * 100 < adjustedAccuracy;
};

export const applyStatusEffect = (
  pokemon: PokemonBattleState,
  status: StatusEffect
): [PokemonBattleState, string] => {
  if (pokemon.status) {
    return [pokemon, `${pokemon.name} is already ${pokemon.status}!`];
  }

  const newPokemon = { ...pokemon, status };
  return [newPokemon, `${pokemon.name} was inflicted with ${status}!`];
};

export const handleStatusEffects = (
  pokemon: PokemonBattleState
): [PokemonBattleState, string[]] => {
  const effects: string[] = [];
  let updatedPokemon = { ...pokemon };

  switch (pokemon.status) {
    case 'burn':
      const burnDamage = Math.floor(getMaxHP(pokemon) / 16);
      updatedPokemon.currentHP = Math.max(
        0,
        updatedPokemon.currentHP - burnDamage
      );
      effects.push(`${pokemon.name} was hurt by its burn!`);
      break;
    case 'poison':
      const poisonDamage = Math.floor(getMaxHP(pokemon) / 8);
      updatedPokemon.currentHP = Math.max(
        0,
        updatedPokemon.currentHP - poisonDamage
      );
      effects.push(`${pokemon.name} was hurt by poison!`);
      break;
    // ... handle other status effects
  }

  return [updatedPokemon, effects];
};

export const healPokemon = (
  pokemon: PokemonBattleState,
  amount: number
): [PokemonBattleState, number] => {
  const maxHP = getMaxHP(pokemon);
  const healedAmount = Math.min(amount, maxHP - pokemon.currentHP);
  const newHP = pokemon.currentHP + healedAmount;
  return [{ ...pokemon, currentHP: newHP }, healedAmount];
};

export const getTypeColor = (type: string): string => {
  const typeColors: { [key: string]: string } = {
    normal: '#A8A878',
    fire: '#F08030',
    water: '#6890F0',
    electric: '#F8D030',
    grass: '#78C850',
    ice: '#98D8D8',
    fighting: '#C03028',
    poison: '#A040A0',
    ground: '#E0C068',
    flying: '#A890F0',
    psychic: '#F85888',
    bug: '#A8B820',
    rock: '#B8A038',
    ghost: '#705898',
    dragon: '#7038F8',
    dark: '#705848',
    steel: '#B8B8D0',
    fairy: '#EE99AC',
  };

  return typeColors[type.toLowerCase()] || '#000000';
};
