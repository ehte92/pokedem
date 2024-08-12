import React from 'react';

import { motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

import { EvolutionChain } from '@/lib/types';

interface EvolutionChainProps {
  chain: EvolutionChain;
}

const EvolutionArrow: React.FC = () => (
  <div className="mx-4 text-yellow-400">
    <ChevronRight size={48} strokeWidth={3} />
  </div>
);

const PokemonImage: React.FC<{ pokemon: any }> = ({ pokemon }) => {
  const pokemonId = pokemon.species.url.split('/')[6];

  return (
    <Link
      href={`/pokemon/${pokemon.species.name}`}
      className="text-center group"
    >
      <motion.div
        whileHover={{ scale: 1.1 }}
        className="w-40 h-40 mx-auto mb-4 relative bg-gradient-to-b from-blue-200 to-blue-400 rounded-full border-6 border-yellow-400 shadow-lg overflow-hidden"
      >
        <Image
          src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemonId}.png`}
          alt={pokemon.species.name}
          layout="fill"
          objectFit="contain"
          className="drop-shadow-md pixelated scale-125"
        />
      </motion.div>
      <p className="text-lg font-bold capitalize text-gray-200 font-pixel">
        {pokemon.species.name}
      </p>
    </Link>
  );
};

const EvolutionChainComponent: React.FC<EvolutionChainProps> = ({ chain }) => {
  const renderEvolutionChain = (chain: any): JSX.Element[] => {
    const result: JSX.Element[] = [
      <PokemonImage key={chain.species.name} pokemon={chain} />,
    ];

    if (chain.evolves_to.length > 0) {
      chain.evolves_to.forEach((evolution: any, index: number) => {
        result.push(<EvolutionArrow key={`arrow-${index}`} />);
        result.push(...renderEvolutionChain(evolution));
      });
    }

    return result;
  };

  return (
    <div className="w-full p-8 bg-gradient-to-br from-green-800 to-blue-800 rounded-xl shadow-inner">
      <div className="flex flex-wrap items-center justify-center gap-6">
        {renderEvolutionChain(chain.chain)}
      </div>
    </div>
  );
};

export default EvolutionChainComponent;
