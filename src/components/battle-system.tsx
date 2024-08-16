import React, { useEffect, useState } from 'react';

import { AnimatePresence, motion } from 'framer-motion';
import Image from 'next/image';

import { fetchAbilityDetails, fetchMoveDetails } from '@/lib/api';
import { typeEffectiveness } from '@/lib/constants';
import {
  MoveDetails,
  PokemonBattleState,
  PokemonDetails,
  StatusEffect,
  TypeEffectiveness,
} from '@/lib/types';

import { BattleAI } from './battle-ai';
import PokemonSwitcher from './pokemin-switcher';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';

interface BattleSystemProps {
  userTeam: PokemonDetails[];
  aiTeam: PokemonDetails[];
}

const BattleSystem: React.FC<BattleSystemProps> = ({ userTeam, aiTeam }) => {
  const [battleAI, setBattleAI] = useState<BattleAI | null>(null);
  const [userActivePokemon, setUserActivePokemon] =
    useState<PokemonBattleState | null>(null);
  const [aiActivePokemon, setAiActivePokemon] =
    useState<PokemonBattleState | null>(null);
  const [battleLog, setBattleLog] = useState<string[]>([]);
  const [userTeamState, setUserTeamState] = useState<PokemonBattleState[]>([]);
  const [aiTeamState, setAiTeamState] = useState<PokemonBattleState[]>([]);
  const [attackAnimation, setAttackAnimation] = useState<'user' | 'ai' | null>(
    null
  );
  const [isSwitching, setIsSwitching] = useState(false);
  const [turnOrder, setTurnOrder] = useState<('user' | 'ai')[]>([]);
  const [userMove, setUserMove] = useState<string | null>(null);
  const [aiMove, setAiMove] = useState<string | null>(null);

  useEffect(() => {
    const initializeBattle = async () => {
      if (userTeam.length > 0 && aiTeam.length > 0) {
        const initializedUserTeam = await Promise.all(
          userTeam.map(initializePokemon)
        );
        const initializedAiTeam = await Promise.all(
          aiTeam.map(initializePokemon)
        );
        setUserTeamState(initializedUserTeam);
        setAiTeamState(initializedAiTeam);
        setUserActivePokemon(initializedUserTeam[0]);
        setAiActivePokemon(initializedAiTeam[0]);
      }
    };
    initializeBattle();
  }, [userTeam, aiTeam]);

  useEffect(() => {
    if (aiActivePokemon && userActivePokemon) {
      setBattleAI(
        new BattleAI(aiActivePokemon, userActivePokemon, aiTeamState)
      );
    }
  }, [aiActivePokemon, userActivePokemon, aiTeamState]);

  const initializePokemon = async (
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

  const getMaxHP = (pokemon: PokemonDetails): number => {
    return (
      pokemon.stats.find((stat) => stat.stat.name === 'hp')?.base_stat || 100
    );
  };

  const estimateLevel = (pokemon: PokemonDetails): number => {
    const baseStatTotal = pokemon.stats.reduce(
      (total, stat) => total + stat.base_stat,
      0
    );
    return Math.min(100, Math.max(1, Math.floor(baseStatTotal / 6)));
  };

  const determineActionOrder = () => {
    if (!userActivePokemon || !aiActivePokemon) return;

    const userSpeed =
      userActivePokemon.stats.find((stat) => stat.stat.name === 'speed')
        ?.base_stat || 0;
    const aiSpeed =
      aiActivePokemon.stats.find((stat) => stat.stat.name === 'speed')
        ?.base_stat || 0;

    if (userSpeed > aiSpeed) {
      setTurnOrder(['user', 'ai']);
    } else if (aiSpeed > userSpeed) {
      setTurnOrder(['ai', 'user']);
    } else {
      setTurnOrder(Math.random() < 0.5 ? ['user', 'ai'] : ['ai', 'user']);
    }
  };

  const handleUserMove = (moveName: string) => {
    setUserMove(moveName);
    handleAIMove();
  };

  const handleAIMove = async () => {
    if (!battleAI || !aiActivePokemon || !userActivePokemon) return;
    const bestMove = await battleAI.decideBestMove();
    setAiMove(bestMove);
    determineActionOrder();
  };

  useEffect(() => {
    if (turnOrder.length > 0 && userMove && aiMove) {
      executeTurn();
    }
  }, [turnOrder, userMove, aiMove]);

  const handleBattleEnd = () => {
    if (!userActivePokemon) {
      setBattleLog((prev) => [
        ...prev,
        'You have no more Pokémon. You lost the battle!',
      ]);
    } else if (!aiActivePokemon) {
      setBattleLog((prev) => [
        ...prev,
        'Opponent has no more Pokémon. You won the battle!',
      ]);
    }
    // You might want to add some UI state to show a "Battle Over" screen or return to the main menu
  };

  const executeTurn = async () => {
    for (const actor of turnOrder) {
      if (actor === 'user' && userActivePokemon && aiActivePokemon) {
        await handleTurn(userActivePokemon, aiActivePokemon, userMove!);
      } else if (actor === 'ai' && aiActivePokemon && userActivePokemon) {
        await handleTurn(aiActivePokemon, userActivePokemon, aiMove!);
      }

      if (!userActivePokemon || !aiActivePokemon) {
        // A Pokémon has fainted, end the turn early
        break;
      }
    }

    setUserMove(null);
    setAiMove(null);
    setTurnOrder([]);

    // Check if the battle should continue
    if (userActivePokemon && aiActivePokemon) {
      // Prepare for the next turn
      setIsSwitching(false);
    } else {
      // Battle has ended
      handleBattleEnd();
    }
  };

  const handleTurn = async (
    attacker: PokemonBattleState,
    defender: PokemonBattleState,
    moveName: string
  ) => {
    let turnLog: string[] = [];
    setAttackAnimation(attacker === userActivePokemon ? 'user' : 'ai');

    // Handle pre-move status effects and abilities
    const statusEffects = handleStatusEffects(attacker);
    turnLog.push(...statusEffects);
    if (statusEffects.some((effect) => effect.includes("can't move"))) {
      setBattleLog((prev) => [...prev, ...turnLog]);
      setTimeout(() => setAttackAnimation(null), 1000);
      return;
    }

    try {
      const moveDetails = await fetchMoveDetails(moveName);

      // Check if the move hits
      if (
        moveDetails.accuracy !== null &&
        Math.random() > moveDetails.accuracy / 100
      ) {
        turnLog.push(`${attacker.name}'s ${moveName} missed!`);
      } else {
        // Calculate and apply damage
        if (moveDetails.power !== null) {
          const damage = calculateDamage(attacker, defender, moveDetails);
          defender.currentHP = Math.max(0, defender.currentHP - damage);
          turnLog.push(
            `${attacker.name} used ${moveName} and dealt ${damage} damage to ${defender.name}!`
          );
        } else {
          turnLog.push(`${attacker.name} used ${moveName}!`);
        }

        // Apply move effects
        turnLog.push(...handleMoveEffects(attacker, defender, moveDetails));
      }

      // Handle post-move status effects
      turnLog.push(...handleStatusEffects(defender));

      if (defender.currentHP === 0) {
        const faintedMessage = await handlePokemonFainted(
          defender === userActivePokemon
        );
        turnLog.push(faintedMessage);

        // Update the team state
        if (defender === userActivePokemon) {
          setUserTeamState((prevState) =>
            prevState.map((p) =>
              p.name === defender.name ? { ...p, currentHP: 0 } : p
            )
          );
        } else {
          setAiTeamState((prevState) =>
            prevState.map((p) =>
              p.name === defender.name ? { ...p, currentHP: 0 } : p
            )
          );
        }

        // Immediately update the active Pokémon state
        if (defender === userActivePokemon) {
          setUserActivePokemon(
            userTeamState.find((p) => p.currentHP > 0) || null
          );
        } else {
          setAiActivePokemon(aiTeamState.find((p) => p.currentHP > 0) || null);
        }
      }

      setBattleLog((prev) => [...prev, ...turnLog]);
    } catch (error) {
      console.error('Error handling turn:', error);
      setBattleLog((prev) => [...prev, 'An error occurred during the turn.']);
    }
    setTimeout(() => setAttackAnimation(null), 1000);
  };

  const calculateDamage = (
    attacker: PokemonBattleState,
    defender: PokemonBattleState,
    moveDetails: MoveDetails
  ) => {
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

  const calculateTypeEffectiveness = (
    attackerType: string,
    defenderType: string
  ) => {
    return (
      (typeEffectiveness as TypeEffectiveness)[attackerType]?.[defenderType] ||
      1
    );
  };

  const handleStatusEffects = (pokemon: PokemonBattleState): string[] => {
    const effects: string[] = [];
    switch (pokemon.status) {
      case 'paralysis':
        if (Math.random() < 0.25) {
          effects.push(`${pokemon.name} is paralyzed and can't move!`);
        }
        break;
      case 'poison':
        if (pokemon.ability.name.toLowerCase() === 'poison heal') {
          const healAmount = Math.floor(getMaxHP(pokemon) / 8);
          pokemon.currentHP = Math.min(
            getMaxHP(pokemon),
            pokemon.currentHP + healAmount
          );
          effects.push(`${pokemon.name}'s Poison Heal restored some HP!`);
        } else {
          const damage = Math.floor(getMaxHP(pokemon) / 8);
          pokemon.currentHP = Math.max(0, pokemon.currentHP - damage);
          effects.push(`${pokemon.name} is hurt by poison!`);
        }
        break;
      case 'burn':
        if (pokemon.ability.name.toLowerCase() === 'heatproof') {
          const burnDamage = Math.floor(getMaxHP(pokemon) / 32);
          pokemon.currentHP = Math.max(0, pokemon.currentHP - burnDamage);
          effects.push(
            `${pokemon.name} is slightly hurt by its burn due to Heatproof!`
          );
        } else {
          const burnDamage = Math.floor(getMaxHP(pokemon) / 16);
          pokemon.currentHP = Math.max(0, pokemon.currentHP - burnDamage);
          effects.push(`${pokemon.name} is hurt by its burn!`);
        }
        break;
      case 'sleep':
        if (pokemon.sleepCounter === undefined)
          pokemon.sleepCounter = Math.floor(Math.random() * 3) + 1;
        if (pokemon.sleepCounter > 0) {
          pokemon.sleepCounter--;
          effects.push(`${pokemon.name} is fast asleep.`);
        } else {
          pokemon.status = null;
          effects.push(`${pokemon.name} woke up!`);
        }
        break;
      case 'freeze':
        if (Math.random() < 0.2) {
          pokemon.status = null;
          effects.push(`${pokemon.name} thawed out!`);
        } else {
          effects.push(`${pokemon.name} is frozen solid!`);
        }
        break;
    }
    return effects;
  };

  const handleMoveEffects = (
    attacker: PokemonBattleState,
    defender: PokemonBattleState,
    moveDetails: MoveDetails
  ): string[] => {
    const effects: string[] = [];

    // Handle stat changes
    moveDetails.stat_changes.forEach((change) => {
      if (Math.random() < (moveDetails.meta.stat_chance || 100) / 100) {
        const statName = change.stat.name;
        const changeAmount = change.change;
        const targetPokemon =
          moveDetails.target.name === 'user' ? attacker : defender;
        const statIndex = targetPokemon.stats.findIndex(
          (s) => s.stat.name === statName
        );
        if (statIndex !== -1) {
          targetPokemon.stats[statIndex].base_stat = Math.max(
            1,
            Math.min(
              255,
              targetPokemon.stats[statIndex].base_stat + changeAmount
            )
          );
          effects.push(
            `${targetPokemon.name}'s ${statName} ${changeAmount > 0 ? 'rose' : 'fell'}!`
          );
        }
      }
    });

    // Handle status effects
    if (
      moveDetails.meta.ailment.name !== 'none' &&
      Math.random() < (moveDetails.meta.ailment_chance || 100) / 100
    ) {
      const newStatus = moveDetails.meta.ailment.name as StatusEffect;
      if (!defender.status && canApplyStatus(defender, newStatus)) {
        defender.status = newStatus;
        effects.push(`${defender.name} is now ${newStatus}!`);
      } else if (defender.status) {
        effects.push(
          `${defender.name} is already affected by ${defender.status}!`
        );
      } else {
        effects.push(
          `${defender.name}'s ${defender.ability.name} prevented ${newStatus}!`
        );
      }
    }

    // Handle healing
    if (moveDetails.meta.healing > 0) {
      const healAmount = Math.floor(
        (getMaxHP(attacker) * moveDetails.meta.healing) / 100
      );
      attacker.currentHP = Math.min(
        getMaxHP(attacker),
        attacker.currentHP + healAmount
      );
      effects.push(`${attacker.name} restored ${healAmount} HP!`);
    }

    // Handle draining
    if (moveDetails.meta.drain < 0) {
      const drainAmount = Math.floor(
        (defender.currentHP * Math.abs(moveDetails.meta.drain)) / 100
      );
      attacker.currentHP = Math.min(
        getMaxHP(attacker),
        attacker.currentHP + drainAmount
      );
      effects.push(
        `${attacker.name} drained ${drainAmount} HP from ${defender.name}!`
      );
    }

    // Handle flinching
    if (Math.random() < moveDetails.meta.flinch_chance / 100) {
      if (canApplyStatus(defender, 'flinch')) {
        defender.status = 'flinch';
        effects.push(`${defender.name} flinched!`);
      }
    }

    return effects;
  };

  const canApplyStatus = (
    pokemon: PokemonBattleState,
    status: StatusEffect
  ): boolean => {
    if (status === null) return true; // Always allow clearing status

    switch (pokemon.ability.name.toLowerCase()) {
      case 'limber':
        return status !== 'paralysis';
      case 'immunity':
        return status !== 'poison';
      case 'insomnia':
      case 'vital spirit':
        return status !== 'sleep';
      case 'magma armor':
        return status !== 'freeze';
      case 'water veil':
        return status !== 'burn';
      case 'own tempo':
        return status !== 'confusion';
      default:
        return true;
    }
  };

  const handlePokemonFainted = async (
    isUserPokemon: boolean
  ): Promise<string> => {
    if (isUserPokemon) {
      const nextPokemon = userTeamState.find(
        (p) => p.currentHP > 0 && p !== userActivePokemon
      );
      if (nextPokemon) {
        setUserActivePokemon(nextPokemon);
        return `${userActivePokemon?.name} fainted! Go, ${nextPokemon.name}!`;
      } else {
        setUserActivePokemon(null);
        return 'All your Pokémon have fainted. You lost the battle!';
      }
    } else {
      const nextPokemon = aiTeamState.find(
        (p) => p.currentHP > 0 && p !== aiActivePokemon
      );
      if (nextPokemon) {
        setAiActivePokemon(nextPokemon);
        setBattleAI(new BattleAI(nextPokemon, userActivePokemon!, aiTeamState));
        return `Opponent's ${aiActivePokemon?.name} fainted! They sent out ${nextPokemon.name}!`;
      } else {
        setAiActivePokemon(null);
        return "All opponent's Pokémon have fainted. You won the battle!";
      }
    }
  };

  const handleSwitch = (newPokemon: PokemonBattleState) => {
    if (newPokemon.currentHP > 0 && newPokemon !== userActivePokemon) {
      setUserActivePokemon(newPokemon);
      setBattleLog((prev) => [...prev, `Go, ${newPokemon.name}!`]);
      setIsSwitching(false);

      // If there was no active Pokémon before (i.e., sending out after a faint),
      // we need to trigger the AI's move
      if (!userActivePokemon) {
        handleAIMove();
      }
    }
  };

  const renderHealthBar = (pokemon: PokemonBattleState) => {
    const hpPercentage = (pokemon.currentHP / getMaxHP(pokemon)) * 100;
    const barColor =
      hpPercentage > 50
        ? 'bg-green-500'
        : hpPercentage > 20
          ? 'bg-yellow-500'
          : 'bg-red-500';

    return (
      <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
        <motion.div
          className={`h-2.5 rounded-full ${barColor}`}
          initial={{ width: '100%' }}
          animate={{ width: `${hpPercentage}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>
    );
  };

  const renderPokemonInfo = (pokemon: PokemonBattleState, isUser: boolean) => (
    <div
      className={`bg-white shadow-md rounded-lg p-3 ${isUser ? 'self-end' : 'self-start'}`}
    >
      <div className="flex justify-between items-center">
        <span className="font-bold text-lg capitalize">{pokemon.name}</span>
        <span className="text-sm text-gray-600">
          Lv{estimateLevel(pokemon)}
        </span>
      </div>
      {renderHealthBar(pokemon)}
      <div className="flex justify-between items-center mt-1">
        <span className="text-sm text-gray-600">HP</span>
        <span className="text-sm text-gray-600">
          {pokemon.currentHP}/{getMaxHP(pokemon)}
        </span>
      </div>
      {pokemon.status && (
        <Badge variant="outline" className="mt-2">
          {pokemon.status}
        </Badge>
      )}
    </div>
  );

  if (!userActivePokemon || !aiActivePokemon) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardContent>
          <p className="text-center font-bold text-xl">
            {battleLog[battleLog.length - 1]}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-4xl mx-auto overflow-hidden">
      <CardContent className="p-6">
        <div className="relative h-80 bg-gradient-to-b from-sky-400 to-sky-200 rounded-lg mb-6">
          <div className="absolute top-4 left-4 z-10">
            {renderPokemonInfo(aiActivePokemon, false)}
          </div>
          <div className="absolute top-4 right-4 z-20">
            <Image
              src={aiActivePokemon.sprites.front_default}
              alt={aiActivePokemon.name}
              width={180}
              height={180}
              className="drop-shadow-lg"
            />
          </div>
          <div className="absolute bottom-4 right-4 z-10">
            {renderPokemonInfo(userActivePokemon, true)}
          </div>
          <div className="absolute bottom-4 left-4 z-20">
            <Image
              src={
                userActivePokemon.sprites.back_default ||
                userActivePokemon.sprites.front_default
              }
              alt={userActivePokemon.name}
              width={200}
              height={200}
              className="drop-shadow-lg"
            />
          </div>
        </div>

        <div className="bg-white shadow-lg rounded-lg p-4">
          {isSwitching ||
          (!userActivePokemon && userTeamState.some((p) => p.currentHP > 0)) ? (
            <div>
              <h4 className="font-bold mb-3">
                {userActivePokemon
                  ? 'Switch Pokémon:'
                  : 'Send out next Pokémon:'}
              </h4>
              <PokemonSwitcher
                team={userTeamState.filter((p) => p.currentHP > 0)}
                activePokemon={userActivePokemon}
                onSwitch={handleSwitch}
              />
            </div>
          ) : userActivePokemon ? (
            <>
              <div className="grid grid-cols-2 gap-3 mb-4">
                {userActivePokemon.moves.slice(0, 4).map((move) => (
                  <Button
                    key={move.move.name}
                    onClick={() => handleUserMove(move.move.name)}
                    disabled={!!userMove}
                    className="capitalize bg-blue-500 text-white hover:bg-blue-600 transition-colors"
                  >
                    {move.move.name}
                  </Button>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Button
                  onClick={() => setIsSwitching(true)}
                  disabled={!!userMove}
                  className="bg-gray-200 text-gray-800 hover:bg-gray-300 transition-colors"
                >
                  Switch Pokémon
                </Button>
                <Button
                  className="bg-red-500 text-white hover:bg-red-600 transition-colors"
                  disabled={true}
                >
                  Forfeit
                </Button>
              </div>
            </>
          ) : (
            <p className="text-center font-bold text-xl">Battle has ended</p>
          )}
        </div>

        <div className="mt-6 bg-white shadow-lg rounded-lg p-4 h-40 overflow-y-auto">
          <h4 className="font-bold mb-2">Battle Log:</h4>
          <AnimatePresence>
            {battleLog.slice(-5).map((log, index) => (
              <motion.p
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
                className="mb-1 text-sm text-gray-700"
              >
                {log}
              </motion.p>
            ))}
          </AnimatePresence>
        </div>
      </CardContent>
    </Card>
  );
};

export default BattleSystem;
