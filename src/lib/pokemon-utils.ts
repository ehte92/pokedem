import { fetchAbilityDetails } from '@/lib/api';
import {
  Ability,
  PokemonBattleState,
  PokemonDetails,
  TypeEffectiveness,
} from '@/lib/types';

import { typeEffectiveness } from './constants';

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
  const ability = pokemon.abilities[0];
  const abilityDetails = await fetchAbilityDetails(ability.ability.name);
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
  };
};

export const calculateTypeEffectiveness = (
  attackType: string,
  defenseType: string
): number => {
  return (
    (typeEffectiveness as TypeEffectiveness)[attackType]?.[defenseType] || 1
  );
};

export const calculateDamage = (
  attacker: PokemonBattleState,
  defender: PokemonBattleState,
  moveDetails: any // Replace 'any' with your MoveDetails type
): number => {
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
  let damage = Math.floor(
    ((((2 * level) / 5 + 2) * power * (attackStat / defenseStat)) / 50 + 2) *
      effectiveness *
      stab *
      random
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

  return Math.max(1, Math.min(damage, defender.currentHP));
};
