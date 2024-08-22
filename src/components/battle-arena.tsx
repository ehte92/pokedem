import React from 'react';

import { motion } from 'framer-motion';
import Image from 'next/image';

import { PokemonBattleState } from '@/lib/types';

interface BattleArenaProps {
  userActivePokemon: PokemonBattleState;
  aiActivePokemon: PokemonBattleState;
  attackAnimation: 'user' | 'ai' | null;
}

const BattleArena: React.FC<BattleArenaProps> = ({
  userActivePokemon,
  aiActivePokemon,
  attackAnimation,
}) => {
  const renderPokemonInfo = (pokemon: PokemonBattleState, isUser: boolean) => (
    <div
      className={`shadow-md rounded-lg p-2 ${isUser ? 'self-end' : 'self-start'} bg-white dark:bg-gray-800 text-xs sm:text-sm`}
    >
      <div className="flex justify-between items-center">
        <span className="font-bold capitalize truncate max-w-[70%]">
          {pokemon.name}
        </span>
        <span className="text-gray-600 dark:text-gray-400">
          Lv{Math.floor(pokemon.base_experience / 10)}
        </span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
        <motion.div
          className="h-2 rounded-full bg-green-500"
          initial={{ width: '100%' }}
          animate={{
            width: `${(pokemon.currentHP / pokemon.stats.find((stat) => stat.stat.name === 'hp')?.base_stat!) * 100}%`,
          }}
          transition={{ duration: 0.5 }}
        />
      </div>
      <div className="flex justify-between items-center mt-1 text-[10px] sm:text-xs">
        <span className="text-gray-600 dark:text-gray-400">HP</span>
        <span className="text-gray-600 dark:text-gray-400">
          {pokemon.currentHP}/
          {pokemon.stats.find((stat) => stat.stat.name === 'hp')?.base_stat}
        </span>
      </div>
      {pokemon.status && (
        <span className="text-[10px] sm:text-xs text-red-500 mt-1 capitalize">
          {pokemon.status}
        </span>
      )}
    </div>
  );

  const renderPokemonImage = (pokemon: PokemonBattleState, isUser: boolean) => {
    const imageUrl = isUser
      ? pokemon.sprites.back_default || pokemon.sprites.front_default
      : pokemon.sprites.front_default;

    return (
      <motion.div
        animate={
          attackAnimation === (isUser ? 'user' : 'ai')
            ? { x: [0, 10, -10, 10, 0], transition: { duration: 0.5 } }
            : {}
        }
        className={`absolute ${
          isUser ? 'bottom-[15%] left-[20%]' : 'top-[30%] right-[25%]'
        } transform ${isUser ? 'scale-125' : 'scale-100'}`}
      >
        <Image
          src={imageUrl}
          alt={pokemon.name}
          width={isUser ? 120 : 100}
          height={isUser ? 120 : 100}
          className={`drop-shadow-lg pixelated ${isUser ? '' : 'opponent-sprite'}`}
        />
      </motion.div>
    );
  };

  return (
    <div
      className="relative w-full rounded-lg mb-2"
      style={{ paddingBottom: '56.25%' }}
    >
      <div className="absolute inset-0 bg-[url('/battle-bg-texture.png')] bg-cover bg-center rounded-lg overflow-hidden">
        <div className="absolute top-2 left-2 z-10 max-w-[45%]">
          {renderPokemonInfo(aiActivePokemon, false)}
        </div>
        {renderPokemonImage(aiActivePokemon, false)}
        <div className="absolute bottom-2 right-2 z-10 max-w-[45%]">
          {renderPokemonInfo(userActivePokemon, true)}
        </div>
        {renderPokemonImage(userActivePokemon, true)}
      </div>
    </div>
    // <div className="relative h-48 sm:h-64 rounded-lg mb-2 overflow-hidden">
    //   <div className="absolute inset-0 bg-[url('/battle-bg-texture.png')] bg-cover bg-center" />
    //   {/* <div className="absolute inset-0 bg-gradient-to-b from-sky-400 to-sky-200" />
    //   <div className="absolute inset-0 bg-[url('/battle-bg-texture.png')] opacity-10" />
    //   <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-green-600 to-transparent" /> */}

    //   <div className="absolute top-2 left-2 z-10 max-w-[45%]">
    //     {renderPokemonInfo(aiActivePokemon, false)}
    //   </div>
    //   <div className="absolute top-2 right-2 z-20">
    //     {renderPokemonImage(aiActivePokemon, false)}
    //   </div>
    //   <div className="absolute bottom-2 right-2 z-10 max-w-[45%]">
    //     {renderPokemonInfo(userActivePokemon, true)}
    //   </div>
    //   <div className="absolute bottom-2 left-2 z-20">
    //     {renderPokemonImage(userActivePokemon, true)}
    //   </div>

    //   <div className="absolute top-1/4 left-1/4 w-4 h-4 bg-white rounded-full opacity-20 animate-ping" />
    //   <div className="absolute bottom-1/3 right-1/3 w-3 h-3 bg-yellow-300 rounded-full opacity-30 animate-pulse" />
    //   <div className="absolute top-1/2 left-1/2 w-2 h-2 bg-blue-400 rounded-full opacity-25 animate-bounce" />
    // </div>
  );
};

export default BattleArena;
