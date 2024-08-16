import React from 'react';

import { motion } from 'framer-motion';
import Image from 'next/image';

import { estimateLevel, getMaxHP } from '@/lib/pokemon-utils';
import { PokemonBattleState } from '@/lib/types';

import { Badge } from './ui/badge';

interface BattleArenaProps {
  userPokemon: PokemonBattleState;
  aiPokemon: PokemonBattleState;
}

const BattleArena: React.FC<BattleArenaProps> = ({
  userPokemon,
  aiPokemon,
}) => {
  const renderHealthBar = (pokemon: PokemonBattleState) => {
    const hpPercentage = (pokemon.currentHP / getMaxHP(pokemon)) * 100;
    const barColor =
      hpPercentage > 50
        ? 'bg-green-500'
        : hpPercentage > 20
          ? 'bg-yellow-500'
          : 'bg-red-500';

    return (
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mt-2">
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
      className={`bg-white dark:bg-gray-800 shadow-md rounded-lg p-3 ${
        isUser ? 'self-end' : 'self-start'
      }`}
    >
      <div className="flex justify-between items-center">
        <span className="font-bold text-lg capitalize text-gray-800 dark:text-gray-200">
          {pokemon.name}
        </span>
        <span className="text-sm text-gray-600 dark:text-gray-400">
          Lv{estimateLevel(pokemon)}
        </span>
      </div>
      {renderHealthBar(pokemon)}
      <div className="flex justify-between items-center mt-1">
        <span className="text-sm text-gray-600 dark:text-gray-400">HP</span>
        <span className="text-sm text-gray-600 dark:text-gray-400">
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

  return (
    <div className="relative h-80 bg-gradient-to-b from-sky-400 to-sky-200 dark:from-sky-700 dark:to-sky-900 rounded-lg mb-6">
      <div className="absolute top-4 left-4 z-10">
        {renderPokemonInfo(aiPokemon, false)}
      </div>
      <div className="absolute top-4 right-4 z-20">
        <Image
          src={aiPokemon.sprites.front_default}
          alt={aiPokemon.name}
          width={180}
          height={180}
          className="drop-shadow-lg"
        />
      </div>
      <div className="absolute bottom-4 right-4 z-10">
        {renderPokemonInfo(userPokemon, true)}
      </div>
      <div className="absolute bottom-4 left-4 z-20">
        <Image
          src={
            userPokemon.sprites.back_default ||
            userPokemon.sprites.front_default
          }
          alt={userPokemon.name}
          width={200}
          height={200}
          className="drop-shadow-lg"
        />
      </div>
    </div>
  );
};

export default BattleArena;
