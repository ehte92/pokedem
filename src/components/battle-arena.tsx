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
      className={`shadow-md rounded-lg p-3 ${isUser ? 'self-end' : 'self-start'} bg-white dark:bg-gray-800`}
    >
      <div className="flex justify-between items-center">
        <span className="font-bold text-lg capitalize">{pokemon.name}</span>
        <span className="text-sm text-gray-600 dark:text-gray-400">
          Lv{Math.floor(pokemon.base_experience / 10)}
        </span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
        <motion.div
          className="h-2.5 rounded-full bg-green-500"
          initial={{ width: '100%' }}
          animate={{
            width: `${(pokemon.currentHP / pokemon.stats.find((stat) => stat.stat.name === 'hp')?.base_stat!) * 100}%`,
          }}
          transition={{ duration: 0.5 }}
        />
      </div>
      <div className="flex justify-between items-center mt-1">
        <span className="text-sm text-gray-600 dark:text-gray-400">HP</span>
        <span className="text-sm text-gray-600 dark:text-gray-400">
          {pokemon.currentHP}/
          {pokemon.stats.find((stat) => stat.stat.name === 'hp')?.base_stat}
        </span>
      </div>
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
        className={isUser ? '' : 'opponent-pokemon'}
      >
        <Image
          src={imageUrl}
          alt={pokemon.name}
          width={isUser ? 200 : 180}
          height={isUser ? 200 : 180}
          className={`drop-shadow-lg pixelated ${isUser ? '' : 'opponent-sprite'}`}
        />
      </motion.div>
    );
  };

  return (
    <div className="relative h-80 rounded-lg mb-6 overflow-hidden">
      {/* Background layers */}
      <div className="absolute inset-0 bg-gradient-to-b from-sky-400 to-sky-200" />
      <div className="absolute inset-0 bg-[url('/battle-bg-texture.png')] opacity-10" />
      <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-green-600 to-transparent" />

      {/* Pokémon and info positioning */}
      <div className="absolute top-4 left-4 z-10">
        {renderPokemonInfo(aiActivePokemon, false)}
      </div>
      <div className="absolute top-4 right-4 z-20">
        {renderPokemonImage(aiActivePokemon, false)}
      </div>
      <div className="absolute bottom-4 right-4 z-10">
        {renderPokemonInfo(userActivePokemon, true)}
      </div>
      <div className="absolute bottom-4 left-4 z-20">
        {renderPokemonImage(userActivePokemon, true)}
      </div>

      {/* Decorative elements */}
      <div className="absolute top-1/4 left-1/4 w-8 h-8 bg-white rounded-full opacity-20 animate-ping" />
      <div className="absolute bottom-1/3 right-1/3 w-6 h-6 bg-yellow-300 rounded-full opacity-30 animate-pulse" />
      <div className="absolute top-1/2 left-1/2 w-4 h-4 bg-blue-400 rounded-full opacity-25 animate-bounce" />

      <style jsx>{`
        .opponent-pokemon {
          transform: translateY(-10px);
          filter: drop-shadow(0 10px 8px rgb(0 0 0 / 0.2));
        }
        .opponent-sprite {
          transform-origin: bottom;
          animation: hover 3s ease-in-out infinite;
        }
        @keyframes hover {
          0%,
          100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-5px);
          }
        }
      `}</style>
    </div>
  );
};

export default BattleArena;
