import React from 'react';

import Image from 'next/image';

import { PokemonDetails } from '@/lib/types';

import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';

interface TeamMemberProps {
  pokemon: PokemonDetails;
  onRemove: () => void;
}

const typeColors: { [key: string]: string } = {
  normal: 'bg-gray-400',
  fire: 'bg-red-500',
  water: 'bg-blue-500',
  electric: 'bg-yellow-400',
  grass: 'bg-green-500',
  ice: 'bg-blue-200',
  fighting: 'bg-red-700',
  poison: 'bg-purple-500',
  ground: 'bg-yellow-600',
  flying: 'bg-indigo-400',
  psychic: 'bg-pink-500',
  bug: 'bg-green-400',
  rock: 'bg-yellow-700',
  ghost: 'bg-purple-700',
  dragon: 'bg-indigo-700',
  dark: 'bg-gray-700',
  steel: 'bg-gray-400',
  fairy: 'bg-pink-300',
};

const TeamMember: React.FC<TeamMemberProps> = ({ pokemon, onRemove }) => {
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-2 sm:p-4 flex flex-col items-center">
        <Image
          src={pokemon.sprites.front_default}
          alt={pokemon.name}
          width={64}
          height={64}
          className="pixelated"
        />
        <h3 className="text-sm sm:text-base font-semibold mt-1 sm:mt-2 capitalize truncate w-full text-center">
          {pokemon.name}
        </h3>
        <div className="flex flex-wrap justify-center gap-1 mt-1 sm:mt-2">
          {pokemon.types.map((type) => (
            <Badge
              key={type.type.name}
              className={`${typeColors[type.type.name] || 'bg-gray-500'} text-white text-xs`}
            >
              {type.type.name}
            </Badge>
          ))}
        </div>
        <Button
          onClick={onRemove}
          variant="destructive"
          size="sm"
          className="mt-2 sm:mt-4 w-full text-xs sm:text-sm"
        >
          Remove
        </Button>
      </CardContent>
    </Card>
  );
};

export default TeamMember;
