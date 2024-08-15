'use client';

import React, { useState } from 'react';

import { useQuery } from 'react-query';

import BattleSystem from '@/components/battle-system';
import TeamSelection from '@/components/team-selection';
import { Button } from '@/components/ui/button';
import { fetchPokemonDetails } from '@/lib/api';
import { PokemonDetails } from '@/lib/types';

const BattlePage: React.FC = () => {
  const [userTeam, setUserTeam] = useState<PokemonDetails[]>([]);
  const [aiTeam, setAiTeam] = useState<PokemonDetails[]>([]);
  const [isBattleStarted, setIsBattleStarted] = useState(false);
  const [isTeamSelected, setIsTeamSelected] = useState(false);

  const { data: allPokemon } = useQuery('allPokemon', async () => {
    const response = await fetch('https://pokeapi.co/api/v2/pokemon?limit=151');
    const data = await response.json();
    return data.results;
  });

  const generateAITeam = async () => {
    if (allPokemon) {
      const team = [];
      for (let i = 0; i < 3; i++) {
        const randomIndex = Math.floor(Math.random() * allPokemon.length);
        const pokemonName = allPokemon[randomIndex].name;
        const pokemon = await fetchPokemonDetails(pokemonName);
        team.push(pokemon);
      }
      setAiTeam(team);
    }
  };

  const handleTeamSelected = (team: PokemonDetails[]) => {
    setUserTeam(team);
    setIsTeamSelected(true);
  };

  const startBattle = async () => {
    await generateAITeam();
    setIsBattleStarted(true);
  };

  if (!isTeamSelected) {
    return <TeamSelection onTeamSelected={handleTeamSelected} />;
  }

  if (!isBattleStarted) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-4xl font-bold mb-6">Pokémon Battle Simulator</h1>
        <p className="mb-4">
          Your team is ready! Click the button below to start the battle.
        </p>
        <Button onClick={startBattle}>Start Battle</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-6 text-center">
        Pokémon Battle Simulator
      </h1>
      <BattleSystem userTeam={userTeam} aiTeam={aiTeam} />
    </div>
  );
};

export default BattlePage;
