import React from 'react';

import { motion } from 'framer-motion';
import { useTheme } from 'next-themes';
import Image from 'next/image';

import { typeColors } from '@/lib/constants';
import { PokemonBattleState } from '@/lib/types';

import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { ScrollArea } from './ui/scroll-area';

interface PokemonSwitcherProps {
  team: PokemonBattleState[];
  activePokemon: PokemonBattleState;
  onSwitch: (pokemon: PokemonBattleState) => void;
  onCancel: () => void;
}

const PokemonSwitcher: React.FC<PokemonSwitcherProps> = ({
  team,
  activePokemon,
  onSwitch,
  onCancel,
}) => {
  const { theme } = useTheme();

  const getMaxHP = (pokemon: PokemonBattleState): number => {
    return (
      pokemon.stats.find((stat) => stat.stat.name === 'hp')?.base_stat || 100
    );
  };

  return (
    <div className="space-y-4">
      <ScrollArea className="h-64 w-full">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4 p-1">
          {team.map((pokemon) => (
            <motion.div
              key={pokemon.name}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Card
                className={`cursor-pointer ${
                  theme === 'dark'
                    ? 'bg-gray-800 text-white'
                    : 'bg-white text-gray-900'
                } ${pokemon.name === activePokemon.name ? 'border-2 border-blue-500' : ''}`}
                onClick={() => onSwitch(pokemon)}
              >
                <CardContent className="p-2 flex items-center space-x-2">
                  <Image
                    src={pokemon.sprites.front_default}
                    alt={pokemon.name}
                    width={48}
                    height={48}
                    className="pixelated"
                  />
                  <div className="flex-grow min-w-0">
                    <h3 className="font-semibold capitalize text-sm truncate">
                      {pokemon.name}
                    </h3>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {pokemon.types.map((type) => (
                        <Badge
                          key={type.type.name}
                          className={`${typeColors[type.type.name]} text-white text-xs px-1 py-0`}
                        >
                          {type.type.name}
                        </Badge>
                      ))}
                    </div>
                    <p className="text-xs mt-1">
                      HP: {pokemon.currentHP} / {getMaxHP(pokemon)}
                    </p>
                    {pokemon.status && (
                      <Badge
                        variant="outline"
                        className="mt-1 text-xs px-1 py-0"
                      >
                        {pokemon.status}
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </ScrollArea>
      <div className="flex justify-between">
        <Button onClick={() => onSwitch(activePokemon)} className="w-1/2 mr-1">
          Keep Current
        </Button>
        <Button onClick={onCancel} variant="secondary" className="w-1/2 ml-1">
          Cancel
        </Button>
      </div>
    </div>
  );
};

export default PokemonSwitcher;
