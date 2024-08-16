import { useEffect, useState } from 'react';

import { BattleAI } from '@/components/battle-ai';
import { fetchMoveDetails } from '@/lib/api';
import {
  calculateDamage,
  getMaxHP,
  initializePokemon,
} from '@/lib/pokemon-utils';
import {
  MoveDetails,
  PokemonBattleState,
  PokemonDetails,
  StatusEffect,
} from '@/lib/types';

export const useBattleLogic = (
  userTeam: PokemonDetails[],
  aiTeam: PokemonDetails[]
) => {
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

  const handleSwitch = (newPokemon: PokemonBattleState) => {
    if (newPokemon.currentHP > 0 && newPokemon !== userActivePokemon) {
      setUserActivePokemon(newPokemon);
      setBattleLog((prev) => [...prev, `Go, ${newPokemon.name}!`]);
      setIsSwitching(false);

      if (!userActivePokemon) {
        handleAIMove();
      }
    }
  };

  useEffect(() => {
    if (turnOrder.length > 0 && userMove && aiMove) {
      executeTurn();
    }
  }, [turnOrder, userMove, aiMove]);

  const executeTurn = async () => {
    for (const actor of turnOrder) {
      if (actor === 'user' && userActivePokemon && aiActivePokemon) {
        await handleTurn(userActivePokemon, aiActivePokemon, userMove!);
      } else if (actor === 'ai' && aiActivePokemon && userActivePokemon) {
        await handleTurn(aiActivePokemon, userActivePokemon, aiMove!);
      }

      if (!userActivePokemon || !aiActivePokemon) {
        break;
      }
    }

    setUserMove(null);
    setAiMove(null);
    setTurnOrder([]);

    if (userActivePokemon && aiActivePokemon) {
      setIsSwitching(false);
    } else {
      handleBattleEnd();
    }
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
  };

  return {
    userActivePokemon,
    aiActivePokemon,
    userTeamState,
    aiTeamState,
    battleLog,
    isSwitching,
    handleUserMove,
    handleSwitch,
    userMove,
  };
};
