import React from 'react';

import { AnimatePresence, motion } from 'framer-motion';
import Image from 'next/image';

import { PokemonBattleState } from '@/lib/types';

interface BattleArenaProps {
  userActivePokemon: PokemonBattleState;
  aiActivePokemon: PokemonBattleState;
  attackAnimation: 'user' | 'ai' | null;
  statusChangeAnimation: 'user' | 'ai' | null;
  switchAnimation: 'user' | 'ai' | null;
  faintAnimation: 'user' | 'ai' | null;
}

const BattleArena: React.FC<BattleArenaProps> = ({
  userActivePokemon,
  aiActivePokemon,
  attackAnimation,
  statusChangeAnimation,
  switchAnimation,
  faintAnimation,
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
      <AnimatePresence>
        {pokemon.status && (
          <motion.span
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="text-[10px] sm:text-xs text-red-500 mt-1 capitalize"
          >
            {pokemon.status}
          </motion.span>
        )}
      </AnimatePresence>
    </div>
  );

  const renderPokemonImage = (pokemon: PokemonBattleState, isUser: boolean) => {
    const imageUrl = isUser
      ? pokemon.sprites.back_default || pokemon.sprites.front_default
      : pokemon.sprites.front_default;

    return (
      <motion.div
        key={pokemon.name}
        initial={
          switchAnimation === (isUser ? 'user' : 'ai')
            ? { x: isUser ? -100 : 100, opacity: 0 }
            : {}
        }
        animate={
          switchAnimation === (isUser ? 'user' : 'ai')
            ? { x: 0, opacity: 1 }
            : attackAnimation === (isUser ? 'user' : 'ai')
              ? { x: [0, 10, -10, 10, 0], transition: { duration: 0.5 } }
              : faintAnimation === (isUser ? 'user' : 'ai')
                ? { y: 50, opacity: 0 }
                : {}
        }
        exit={
          faintAnimation === (isUser ? 'user' : 'ai')
            ? { y: 50, opacity: 0 }
            : {}
        }
        transition={{ duration: 0.5 }}
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
        <AnimatePresence>
          {statusChangeAnimation === (isUser ? 'user' : 'ai') && (
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0 }}
              className="absolute inset-0 bg-yellow-400 mix-blend-color"
            />
          )}
        </AnimatePresence>
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
        <AnimatePresence>
          {renderPokemonImage(aiActivePokemon, false)}
        </AnimatePresence>
        <div className="absolute bottom-2 right-2 z-10 max-w-[45%]">
          {renderPokemonInfo(userActivePokemon, true)}
        </div>
        <AnimatePresence>
          {renderPokemonImage(userActivePokemon, true)}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default BattleArena;
