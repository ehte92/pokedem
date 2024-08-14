'use client';

import React, { useState } from 'react';

import { useQuery } from 'react-query';

import BattleSystem from '@/components/battle-system';
import { Button } from '@/components/ui/button';
import { fetchPokemonDetails } from '@/lib/api';
import { PokemonDetails } from '@/lib/types';

const BattlePage: React.FC = () => {
  const [userTeam, setUserTeam] = useState<PokemonDetails[]>([]);
  const [aiTeam, setAiTeam] = useState<PokemonDetails[]>([]);
  const [isBattleStarted, setIsBattleStarted] = useState(false);

  const { data: allPokemon } = useQuery('allPokemon', async () => {
    const response = await fetch('https://pokeapi.co/api/v2/pokemon?limit=151');
    const data = await response.json();
    return data.results;
  });

  const getRandomPokemon = async () => {
    if (allPokemon) {
      const randomIndex = Math.floor(Math.random() * allPokemon.length);
      const pokemonName = allPokemon[randomIndex].name;
      return await fetchPokemonDetails(pokemonName);
    }
    return null;
  };

  const generateTeam = async (
    setTeam: React.Dispatch<React.SetStateAction<PokemonDetails[]>>
  ) => {
    const team = [];
    for (let i = 0; i < 3; i++) {
      const pokemon = await getRandomPokemon();
      if (pokemon) team.push(pokemon);
    }
    setTeam(team);
  };

  const startBattle = async () => {
    await generateTeam(setUserTeam);
    await generateTeam(setAiTeam);
    setIsBattleStarted(true);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-6 text-center">
        Pokémon Battle Simulator
      </h1>
      {!isBattleStarted ? (
        <div className="text-center">
          <Button onClick={startBattle}>Start Battle</Button>
        </div>
      ) : (
        <BattleSystem userTeam={userTeam} aiTeam={aiTeam} />
      )}
    </div>
  );
};

export default BattlePage;
