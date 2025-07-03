import React from 'react';

import { motion } from 'framer-motion';
import { ArrowRight, Sparkles, Zap } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

import { EvolutionChain } from '@/lib/types';

interface EvolutionChainProps {
  chain: EvolutionChain;
}

const EvolutionArrow: React.FC = () => (
  <motion.div
    className="flex items-center justify-center mx-4 my-2"
    initial={{ opacity: 0, scale: 0.5 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.5, delay: 0.2 }}
  >
    <div className="relative">
      {/* Animated background */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full blur-sm"
        animate={{ scale: [1, 1.1, 1] }}
        transition={{ duration: 2, repeat: Infinity }}
      />

      {/* Arrow container */}
      <div className="relative bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 p-3 rounded-full shadow-lg border-2 border-white/50">
        <motion.div
          animate={{ x: [0, 4, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
        >
          <ArrowRight
            size={24}
            className="text-white drop-shadow-lg"
            strokeWidth={3}
          />
        </motion.div>
      </div>

      {/* Sparkle effects */}
      <motion.div
        className="absolute -top-1 -right-1 text-yellow-200"
        animate={{ rotate: [0, 360] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
      >
        <Sparkles size={12} />
      </motion.div>
    </div>
  </motion.div>
);

const PokemonEvolutionCard: React.FC<{ pokemon: any; index: number }> = ({
  pokemon,
  index,
}) => {
  const pokemonId = pokemon.species.url.split('/')[6];

  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.8 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        duration: 0.6,
        delay: index * 0.2,
        type: 'spring',
        stiffness: 100,
        damping: 10,
      }}
      className="flex-shrink-0"
    >
      <Link href={`/pokemon/${pokemonId}`} className="group block">
        <motion.div
          whileHover={{ scale: 1.05, y: -5 }}
          className="relative bg-gradient-to-br from-white via-blue-50 to-purple-100 dark:from-gray-800 dark:via-blue-900/50 dark:to-purple-900/50 rounded-2xl p-4 shadow-2xl border-4 border-blue-300/60 dark:border-blue-600/60 hover:border-yellow-400/80 transition-all duration-300 backdrop-blur-sm"
        >
          {/* Card decorations */}
          <div className="absolute top-2 left-2 w-3 h-3 bg-gradient-to-br from-yellow-400 to-orange-400 rounded-full opacity-60"></div>
          <div className="absolute top-2 right-2 w-2 h-2 bg-gradient-to-br from-blue-400 to-purple-400 rounded-full opacity-60"></div>
          <div className="absolute bottom-2 left-3 w-2 h-2 bg-gradient-to-br from-green-400 to-blue-400 rounded-full opacity-60"></div>
          <div className="absolute bottom-2 right-3 w-3 h-3 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full opacity-60"></div>

          {/* Pokemon Image Container */}
          <div className="relative w-32 h-32 mx-auto mb-3">
            {/* Glow effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-yellow-200/40 to-blue-200/40 rounded-full blur-xl scale-110"></div>

            {/* Image background */}
            <div className="relative w-full h-full bg-gradient-to-br from-blue-100 via-purple-100 to-indigo-100 dark:from-blue-800/30 dark:via-purple-800/30 dark:to-indigo-800/30 rounded-2xl border-2 border-white/50 dark:border-white/20 shadow-inner overflow-hidden">
              {/* Background pattern */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-2 left-2 w-4 h-4 border border-gray-400 rounded-full"></div>
                <div className="absolute top-2 right-2 w-3 h-3 border border-gray-400 rounded-full"></div>
                <div className="absolute bottom-2 left-3 w-2 h-2 border border-gray-400 rounded-full"></div>
                <div className="absolute bottom-2 right-4 w-3 h-3 border border-gray-400 rounded-full"></div>
              </div>

              {/* Pokemon Image */}
              <div className="relative w-full h-full flex items-center justify-center">
                <Image
                  src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemonId}.png`}
                  alt={pokemon.species.name}
                  width={96}
                  height={96}
                  className="object-contain drop-shadow-xl scale-110 group-hover:scale-125 transition-transform duration-300"
                />
              </div>
            </div>

            {/* Hover sparkles */}
            <motion.div
              className="absolute -top-2 -right-2 text-yellow-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              animate={{
                rotate: [0, 360],
                scale: [1, 1.2, 1],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            >
              <Zap size={16} />
            </motion.div>
          </div>

          {/* Pokemon Name */}
          <div className="text-center">
            <h3 className="text-lg font-bold capitalize text-gray-800 dark:text-gray-200 font-pixel group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300">
              {pokemon.species.name}
            </h3>
            <p className="text-xs text-gray-600 dark:text-gray-400 font-semibold">
              #{pokemonId.padStart(3, '0')}
            </p>
          </div>

          {/* Evolution level indicator */}
          {pokemon.evolution_details &&
            pokemon.evolution_details.length > 0 && (
              <div className="mt-2 text-center">
                <span className="inline-block bg-gradient-to-r from-green-400 to-blue-400 text-white text-xs font-bold px-2 py-1 rounded-full">
                  {pokemon.evolution_details[0].min_level
                    ? `Lv. ${pokemon.evolution_details[0].min_level}`
                    : 'Special'}
                </span>
              </div>
            )}
        </motion.div>
      </Link>
    </motion.div>
  );
};

const EvolutionChainComponent: React.FC<EvolutionChainProps> = ({ chain }) => {
  const renderEvolutionChain = (
    chain: any,
    index: number = 0
  ): JSX.Element[] => {
    const result: JSX.Element[] = [
      <PokemonEvolutionCard
        key={`${chain.species.name}-${index}`}
        pokemon={chain}
        index={index}
      />,
    ];

    if (chain.evolves_to.length > 0) {
      chain.evolves_to.forEach((evolution: any, evolutionIndex: number) => {
        result.push(
          <EvolutionArrow key={`arrow-${index}-${evolutionIndex}`} />
        );
        result.push(
          ...renderEvolutionChain(evolution, index + evolutionIndex + 1)
        );
      });
    }

    return result;
  };

  return (
    <div className="w-full">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-6"
      >
        <div className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white px-4 py-2 rounded-full font-bold text-sm shadow-lg">
          <Sparkles size={16} />
          Evolution Line
          <Sparkles size={16} />
        </div>
      </motion.div>

      {/* Evolution Chain Container */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="relative"
      >
        {/* Background decoration */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-200/20 via-purple-200/20 to-indigo-200/20 rounded-3xl blur-xl"></div>

        {/* Main container */}
        <div className="relative bg-gradient-to-br from-white/40 via-blue-50/40 to-purple-50/40 dark:from-gray-800/40 dark:via-blue-900/40 dark:to-purple-900/40 rounded-3xl p-6 backdrop-blur-sm border border-white/30 dark:border-white/10 shadow-2xl">
          {/* Evolution cards and arrows */}
          <div className="flex flex-wrap items-center justify-center gap-4">
            {renderEvolutionChain(chain.chain)}
          </div>

          {/* Bottom decoration */}
          <div className="flex justify-center mt-6">
            <div className="flex space-x-2 opacity-50">
              {Array.from({ length: 5 }, (_, i) => (
                <motion.div
                  key={i}
                  className="w-2 h-2 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{
                    duration: 2,
                    delay: i * 0.2,
                    repeat: Infinity,
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default EvolutionChainComponent;
