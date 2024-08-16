import React from 'react';

import { motion } from 'framer-motion';
import { useTheme } from 'next-themes';
import Image from 'next/image';

import { typeColors } from '@/lib/constants';
import { PokemonBattleState } from '@/lib/types';

import { Badge } from './ui/badge';
import { Card, CardContent } from './ui/card';

interface PokemonSwitcherProps {
  team: PokemonBattleState[];
  activePokemon: PokemonBattleState;
  onSwitch: (pokemon: PokemonBattleState) => void;
}

const PokemonSwitcher: React.FC<PokemonSwitcherProps> = ({
  team,
  activePokemon,
  onSwitch,
}) => {
  const { theme } = useTheme();

  const getMaxHP = (pokemon: PokemonBattleState): number => {
    return (
      pokemon.stats.find((stat) => stat.stat.name === 'hp')?.base_stat || 100
    );
  };

  return (
    <div className="grid grid-cols-2 gap-4">
      {team.map((pokemon) => (
        <motion.div
          key={pokemon.name}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Card
            className={`cursor-pointer ${
              theme === 'dark'
                ? 'bg-gray-800 text-white'
                : 'bg-white text-gray-900'
            } ${pokemon.name === activePokemon.name ? 'border-2 border-blue-500' : ''}`}
            onClick={() => onSwitch(pokemon)}
          >
            <CardContent className="p-4 flex items-center">
              <Image
                src={pokemon.sprites.front_default}
                alt={pokemon.name}
                width={64}
                height={64}
                className="pixelated"
              />
              <div className="ml-4">
                <h3 className="font-semibold capitalize">{pokemon.name}</h3>
                <div className="flex space-x-1 mt-1">
                  {pokemon.types.map((type) => (
                    <Badge
                      key={type.type.name}
                      className={`${typeColors[type.type.name]} text-white text-xs`}
                    >
                      {type.type.name}
                    </Badge>
                  ))}
                </div>
                <p className="text-sm mt-1">
                  HP: {pokemon.currentHP} / {getMaxHP(pokemon)}
                </p>
                {pokemon.status && (
                  <Badge variant="outline" className="mt-1">
                    {pokemon.status}
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
};

export default PokemonSwitcher;
