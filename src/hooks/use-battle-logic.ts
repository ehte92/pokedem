import { useEffect, useState } from 'react';

import { BattleAI } from '@/components/battle-ai';
import { fetchMoveDetails } from '@/lib/api';
import {
  calculateDamage,
  doesMoveHit,
  getMaxHP,
  initializePokemon,
  isCriticalHit,
} from '@/lib/pokemon-utils';
import {
  MoveDetails,
  PokemonBattleState,
  PokemonDetails,
  StatusEffect,
} from '@/lib/types';

type BattleState = 'initializing' | 'active' | 'ended';
type TurnPhase = 'selectMove' | 'executeMove' | 'switchPokemon' | 'endTurn';

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
  const [userMove, setUserMove] = useState<string | null>(null);
  const [aiMove, setAiMove] = useState<string | null>(null);
  const [battleState, setBattleState] = useState<BattleState>('initializing');
  const [turnPhase, setTurnPhase] = useState<TurnPhase>('selectMove');
  const [statusChangeAnimation, setStatusChangeAnimation] = useState<
    'user' | 'ai' | null
  >(null);
  const [switchAnimation, setSwitchAnimation] = useState<'user' | 'ai' | null>(
    null
  );
  const [faintAnimation, setFaintAnimation] = useState<'user' | 'ai' | null>(
    null
  );

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
        setBattleState('active');
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
    if (battleAI) {
      battleAI.recordOpponentMove(moveName);
    }
    handleAIMove();
  };

  const handleAIMove = async () => {
    if (!battleAI || !aiActivePokemon || !userActivePokemon) return;
    const bestMove = await battleAI.decideBestMove();
    setAiMove(bestMove);
    setTurnPhase('executeMove');
  };

  const handleSwitch = (newPokemon: PokemonBattleState) => {
    if (newPokemon.currentHP > 0 && newPokemon !== userActivePokemon) {
      setSwitchAnimation('user');
      setTimeout(() => {
        setUserActivePokemon(newPokemon);
        setBattleLog((prev) => [...prev, `Go, ${newPokemon.name}!`]);
        setIsSwitching(false);
        setTurnPhase('switchPokemon');
        setTimeout(() => setSwitchAnimation(null), 500);
      }, 500);
    }
  };

  const executeTurn = async () => {
    if (!userActivePokemon || !aiActivePokemon || !userMove || !aiMove) return;

    const userMoveDetails = await fetchMoveDetails(userMove);
    const aiMoveDetails = await fetchMoveDetails(aiMove);

    const userPriority = userMoveDetails.priority;
    const aiPriority = aiMoveDetails.priority;

    const userSpeed =
      userActivePokemon.stats.find((stat) => stat.stat.name === 'speed')
        ?.base_stat || 0;
    const aiSpeed =
      aiActivePokemon.stats.find((stat) => stat.stat.name === 'speed')
        ?.base_stat || 0;

    let firstPokemon: PokemonBattleState;
    let secondPokemon: PokemonBattleState;
    let firstMove: MoveDetails;
    let secondMove: MoveDetails;

    if (userPriority > aiPriority) {
      [firstPokemon, secondPokemon] = [userActivePokemon, aiActivePokemon];
      [firstMove, secondMove] = [userMoveDetails, aiMoveDetails];
    } else if (aiPriority > userPriority) {
      [firstPokemon, secondPokemon] = [aiActivePokemon, userActivePokemon];
      [firstMove, secondMove] = [aiMoveDetails, userMoveDetails];
    } else if (userSpeed > aiSpeed) {
      [firstPokemon, secondPokemon] = [userActivePokemon, aiActivePokemon];
      [firstMove, secondMove] = [userMoveDetails, aiMoveDetails];
    } else if (aiSpeed > userSpeed) {
      [firstPokemon, secondPokemon] = [aiActivePokemon, userActivePokemon];
      [firstMove, secondMove] = [aiMoveDetails, userMoveDetails];
    } else {
      // Speed tie, randomly decide
      if (Math.random() < 0.5) {
        [firstPokemon, secondPokemon] = [userActivePokemon, aiActivePokemon];
        [firstMove, secondMove] = [userMoveDetails, aiMoveDetails];
      } else {
        [firstPokemon, secondPokemon] = [aiActivePokemon, userActivePokemon];
        [firstMove, secondMove] = [aiMoveDetails, userMoveDetails];
      }
    }

    await executeMove(firstPokemon, secondPokemon, firstMove);
    if (secondPokemon.currentHP > 0) {
      await executeMove(secondPokemon, firstPokemon, secondMove);
    }

    setUserMove(null);
    setAiMove(null);
    setTurnPhase('endTurn');
  };

  const executeMove = async (
    attacker: PokemonBattleState,
    defender: PokemonBattleState,
    moveDetails: MoveDetails
  ) => {
    setAttackAnimation(attacker === userActivePokemon ? 'user' : 'ai');

    const turnLog: string[] = [];

    // Handle pre-move status effects
    const canMove = handlePreMoveStatus(attacker, turnLog);
    if (!canMove) {
      setBattleLog((prev) => [...prev, ...turnLog]);
      setTimeout(() => setAttackAnimation(null), 1000);
      return;
    }

    turnLog.push(`${attacker.name} used ${moveDetails.name}!`);

    // Check if the move hits
    if (!doesMoveHit(attacker, defender, moveDetails.accuracy)) {
      turnLog.push(`${attacker.name}'s attack missed!`);
    } else {
      // Calculate and apply damage
      if (moveDetails.power) {
        const [damage, isCritical] = calculateDamage(
          attacker,
          defender,
          moveDetails
        );
        defender.currentHP = Math.max(0, defender.currentHP - damage);
        turnLog.push(`It dealt ${damage} damage to ${defender.name}!`);
        if (isCritical) {
          turnLog.push('A critical hit!');
        }
      }

      // Apply move effects
      applyMoveEffects(attacker, defender, moveDetails, turnLog);
    }

    // Handle post-move effects
    handlePostMoveEffects(attacker, defender, turnLog);

    setBattleLog((prev) => [...prev, ...turnLog]);
    setTimeout(() => setAttackAnimation(null), 1000);

    // Check for fainted Pokémon
    if (defender.currentHP <= 0) {
      const faintedMessage = await handlePokemonFainted(
        defender === userActivePokemon
      );
      setBattleLog((prev) => [...prev, faintedMessage]);
    }
  };

  const handlePreMoveStatus = (
    pokemon: PokemonBattleState,
    turnLog: string[]
  ): boolean => {
    switch (pokemon.status) {
      case 'paralysis':
        if (Math.random() < 0.25) {
          turnLog.push(`${pokemon.name} is paralyzed and can't move!`);
          return false;
        }
        break;
      case 'sleep':
        if (pokemon.sleepCounter && pokemon.sleepCounter > 0) {
          pokemon.sleepCounter--;
          turnLog.push(`${pokemon.name} is fast asleep.`);
          return false;
        } else {
          pokemon.status = null;
          turnLog.push(`${pokemon.name} woke up!`);
        }
        break;
      case 'freeze':
        if (Math.random() < 0.2) {
          pokemon.status = null;
          turnLog.push(`${pokemon.name} thawed out!`);
        } else {
          turnLog.push(`${pokemon.name} is frozen solid!`);
          return false;
        }
        break;
    }
    return true;
  };

  const applyMoveEffects = (
    attacker: PokemonBattleState,
    defender: PokemonBattleState,
    moveDetails: MoveDetails,
    turnLog: string[]
  ) => {
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
          turnLog.push(
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
        turnLog.push(`${defender.name} is now ${newStatus}!`);
        setStatusChangeAnimation(
          defender === userActivePokemon ? 'user' : 'ai'
        );
        setTimeout(() => setStatusChangeAnimation(null), 1000);
      } else if (defender.status) {
        turnLog.push(
          `${defender.name} is already affected by ${defender.status}!`
        );
      } else {
        turnLog.push(
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
      turnLog.push(`${attacker.name} restored ${healAmount} HP!`);
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
      turnLog.push(
        `${attacker.name} drained ${drainAmount} HP from ${defender.name}!`
      );
    }
  };

  const handlePostMoveEffects = (
    attacker: PokemonBattleState,
    defender: PokemonBattleState,
    turnLog: string[]
  ) => {
    // Handle burn and poison damage
    [attacker, defender].forEach((pokemon) => {
      if (pokemon.status === 'burn' || pokemon.status === 'poison') {
        const damageAmount = Math.floor(getMaxHP(pokemon) / 8);
        pokemon.currentHP = Math.max(0, pokemon.currentHP - damageAmount);
        turnLog.push(`${pokemon.name} is hurt by its ${pokemon.status}!`);
      }
    });
  };

  const canApplyStatus = (
    pokemon: PokemonBattleState,
    status: StatusEffect
  ): boolean => {
    if (status === null) return true;

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
      default:
        return true;
    }
  };

  const handlePokemonFainted = async (
    isUserPokemon: boolean
  ): Promise<string> => {
    return new Promise((resolve) => {
      setFaintAnimation(isUserPokemon ? 'user' : 'ai');
      setTimeout(() => {
        if (isUserPokemon) {
          const nextPokemon = userTeamState.find(
            (p) => p.currentHP > 0 && p !== userActivePokemon
          );
          if (nextPokemon) {
            setSwitchAnimation('user');
            setTimeout(() => {
              setUserActivePokemon(nextPokemon);
              setSwitchAnimation(null);
            }, 500);
            resolve(
              `${userActivePokemon?.name} fainted! Go, ${nextPokemon.name}!`
            );
          } else {
            setUserActivePokemon(null);
            handleBattleEnd();
            resolve('All your Pokémon have fainted. You lost the battle!');
          }
        } else {
          const nextPokemon = aiTeamState.find(
            (p) => p.currentHP > 0 && p !== aiActivePokemon
          );
          if (nextPokemon) {
            setSwitchAnimation('ai');
            setTimeout(() => {
              setAiActivePokemon(nextPokemon);
              setBattleAI(
                new BattleAI(nextPokemon, userActivePokemon!, aiTeamState)
              );
              setSwitchAnimation(null);
            }, 500);
            resolve(
              `Opponent's ${aiActivePokemon?.name} fainted! They sent out ${nextPokemon.name}!`
            );
          } else {
            setAiActivePokemon(null);
            handleBattleEnd();
            resolve("All opponent's Pokémon have fainted. You won the battle!");
          }
        }
        setFaintAnimation(null);
      }, 500);
    });
  };

  const handleBattleEnd = () => {
    setBattleState('ended');
    const userWon = aiTeamState.every((pokemon) => pokemon.currentHP === 0);
    const aiWon = userTeamState.every((pokemon) => pokemon.currentHP === 0);

    if (userWon) {
      setBattleLog((prev) => [...prev, 'Congratulations! You won the battle!']);
    } else if (aiWon) {
      setBattleLog((prev) => [
        ...prev,
        'You lost the battle. Better luck next time!',
      ]);
    } else {
      setBattleLog((prev) => [...prev, 'The battle has ended.']);
    }
  };

  useEffect(() => {
    if (turnPhase === 'executeMove' && userMove && aiMove) {
      executeTurn();
    } else if (turnPhase === 'switchPokemon') {
      handleAIMove();
    } else if (turnPhase === 'endTurn') {
      setTurnPhase('selectMove');
    }
  }, [turnPhase, userMove, aiMove]);

  return {
    userActivePokemon,
    aiActivePokemon,
    userTeamState,
    aiTeamState,
    battleLog,
    isSwitching,
    setIsSwitching,
    attackAnimation,
    handleUserMove,
    handleSwitch,
    userMove,
    battleState,
    handleBattleEnd,
    statusChangeAnimation,
    switchAnimation,
    faintAnimation,
    turnPhase,
  };
};
