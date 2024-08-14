import React, { useEffect, useState } from 'react';

import { fetchMoveDetails } from '@/lib/api';
import { typeEffectiveness } from '@/lib/constants';
import { MoveDetails, PokemonDetails } from '@/lib/types';

import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Progress } from './ui/progress';

interface BattleSystemProps {
  userTeam: PokemonDetails[];
  aiTeam: PokemonDetails[];
}

const BattleSystem: React.FC<BattleSystemProps> = ({ userTeam, aiTeam }) => {
  const [userActivePokemon, setUserActivePokemon] =
    useState<PokemonDetails | null>(userTeam[0] || null);
  const [aiActivePokemon, setAiActivePokemon] = useState<PokemonDetails | null>(
    aiTeam[0] || null
  );
  const [userHealth, setUserHealth] = useState(100);
  const [aiHealth, setAiHealth] = useState(100);
  const [battleLog, setBattleLog] = useState<string[]>([]);
  const [isUserTurn, setIsUserTurn] = useState(true);

  useEffect(() => {
    if (!isUserTurn && aiActivePokemon) {
      setTimeout(() => {
        const aiMove = selectRandomMove(aiActivePokemon);
        if (aiMove && userActivePokemon) {
          handleAttack(aiActivePokemon, userActivePokemon, aiMove);
        } else {
          setBattleLog((prev) => [...prev, "AI couldn't make a move!"]);
        }
        setIsUserTurn(true);
      }, 1000);
    }
  }, [isUserTurn, aiActivePokemon, userActivePokemon]);

  const selectRandomMove = (pokemon: PokemonDetails): string | null => {
    if (pokemon.moves.length === 0) return null;
    const moveIndex = Math.floor(Math.random() * pokemon.moves.length);
    return pokemon.moves[moveIndex].move.name;
  };

  const estimateLevel = (pokemon: PokemonDetails): number => {
    const baseStatTotal = pokemon.stats.reduce(
      (total, stat) => total + stat.base_stat,
      0
    );
    // This is a very rough estimation. Adjust the formula as needed.
    return Math.min(100, Math.max(1, Math.floor(baseStatTotal / 6)));
  };

  const calculateDamage = (
    attacker: PokemonDetails,
    defender: PokemonDetails,
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
    const damage = Math.floor(
      ((((2 * level) / 5 + 2) * power * (attackStat / defenseStat)) / 50 + 2) *
        effectiveness *
        stab *
        random
    );
    return Math.max(1, Math.min(damage, getMaxHP(defender)));
  };

  const calculateTypeEffectiveness = (
    attackerType: string,
    defenderType: string
  ) => {
    return typeEffectiveness[attackerType]?.[defenderType] || 1;
  };

  const getMaxHP = (pokemon: PokemonDetails): number => {
    return (
      pokemon.stats.find((stat) => stat.stat.name === 'hp')?.base_stat || 100
    );
  };

  const handleAttack = async (
    attacker: PokemonDetails,
    defender: PokemonDetails,
    moveName: string
  ) => {
    try {
      const moveDetails = await fetchMoveDetails(moveName);
      const damage = calculateDamage(attacker, defender, moveDetails);
      const attackerHealth =
        attacker === userActivePokemon ? userHealth : aiHealth;
      const defenderHealth =
        attacker === userActivePokemon ? aiHealth : userHealth;
      const newDefenderHealth = Math.max(0, defenderHealth - damage);

      let logMessage = `${attacker.name} used ${moveName} and dealt ${damage} damage to ${defender.name}!`;

      // Apply move effects
      if (
        moveDetails.effect_chance &&
        Math.random() < moveDetails.effect_chance / 100
      ) {
        const effect = moveDetails.effect_entries[0]?.short_effect.replace(
          '$effect_chance',
          moveDetails.effect_chance.toString()
        );
        logMessage += ` ${effect}`;
      }

      setBattleLog((prev) => [...prev, logMessage]);

      if (attacker === userActivePokemon) {
        setAiHealth(newDefenderHealth);
      } else {
        setUserHealth(newDefenderHealth);
      }

      if (newDefenderHealth === 0) {
        handlePokemonFainted(defender === userActivePokemon);
      } else {
        setIsUserTurn(!isUserTurn);
      }
    } catch (error) {
      console.error('Error handling attack:', error);
      setBattleLog((prev) => [...prev, 'An error occurred during the attack.']);
      setIsUserTurn(!isUserTurn);
    }
  };

  const handlePokemonFainted = (isUserPokemon: boolean) => {
    if (isUserPokemon) {
      const nextPokemon = userTeam.find(
        (p) => p !== userActivePokemon && isPokemonHealthy(p)
      );
      if (nextPokemon) {
        setUserActivePokemon(nextPokemon);
        setUserHealth(100);
        setBattleLog((prev) => [
          ...prev,
          `${userActivePokemon?.name} fainted! Go, ${nextPokemon.name}!`,
        ]);
      } else {
        setBattleLog((prev) => [
          ...prev,
          'All your Pokémon have fainted. You lost the battle!',
        ]);
        setUserActivePokemon(null);
      }
    } else {
      const nextPokemon = aiTeam.find(
        (p) => p !== aiActivePokemon && isPokemonHealthy(p)
      );
      if (nextPokemon) {
        setAiActivePokemon(nextPokemon);
        setAiHealth(100);
        setBattleLog((prev) => [
          ...prev,
          `Opponent's ${aiActivePokemon?.name} fainted! They sent out ${nextPokemon.name}!`,
        ]);
      } else {
        setBattleLog((prev) => [
          ...prev,
          "All opponent's Pokémon have fainted. You won the battle!",
        ]);
        setAiActivePokemon(null);
      }
    }
    setIsUserTurn(true); // Ensure it's the user's turn after a Pokémon faints
  };

  const isPokemonHealthy = (pokemon: PokemonDetails): boolean => {
    const hpStat = pokemon.stats.find((s) => s.stat.name === 'hp');
    return hpStat ? hpStat.base_stat > 0 : false;
  };

  if (!userActivePokemon || !aiActivePokemon) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle>Battle Ended</CardTitle>
        </CardHeader>
        <CardContent>
          <p>{battleLog[battleLog.length - 1]}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Pokémon Battle</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between mb-4">
          <div>
            <h3 className="font-bold">{userActivePokemon.name}</h3>
            <Progress value={userHealth} className="w-40" />
          </div>
          <div>
            <h3 className="font-bold">{aiActivePokemon.name}</h3>
            <Progress value={aiHealth} className="w-40" />
          </div>
        </div>
        <div className="mb-4">
          <h4 className="font-bold mb-2">Moves:</h4>
          <div className="grid grid-cols-2 gap-2">
            {userActivePokemon.moves.slice(0, 4).map((move) => (
              <Button
                key={move.move.name}
                onClick={() => {
                  if (isUserTurn) {
                    handleAttack(
                      userActivePokemon,
                      aiActivePokemon,
                      move.move.name
                    );
                    setIsUserTurn(false);
                  }
                }}
                disabled={!isUserTurn}
              >
                {move.move.name}
              </Button>
            ))}
          </div>
        </div>
        <div>
          <h4 className="font-bold mb-2">Battle Log:</h4>
          <div className="h-40 overflow-y-auto border p-2">
            {battleLog.map((log, index) => (
              <p key={index}>{log}</p>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default BattleSystem;
